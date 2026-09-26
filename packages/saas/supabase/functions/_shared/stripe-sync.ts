// Writing a Stripe subscription's state into user_subscriptions, in one place.
//
// stripe-webhook calls this when Stripe tells us something changed. sync-subscription
// calls the same code when the browser asks ("I just paid, why am I still on Free?"),
// so a webhook that never arrived - endpoint not configured, secret rotated, event
// dropped - stops being the difference between a paying customer and a free one.
//
// Every function here is a sync from Stripe's current state, so a retried or
// out-of-order event converges instead of double-applying.

import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

export interface SyncDeps {
  stripe: Stripe;
  db: SupabaseClient;
}

/** Stripe statuses in which the customer is still billed for a subscription. */
export const LIVE_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

/** Stripe statuses that end a subscription for good. */
export const ENDED_STATUSES = new Set(["canceled", "incomplete_expired"]);

export function iso(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

export function idOf(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

// Newer Stripe API versions moved the billing period from the subscription to its items.
export function periodOf(sub: Stripe.Subscription): { start: number | null; end: number | null } {
  const item = sub.items?.data?.[0] as unknown as { current_period_start?: number; current_period_end?: number } | undefined;
  const top = sub as unknown as { current_period_start?: number; current_period_end?: number };
  return {
    start: top.current_period_start ?? item?.current_period_start ?? null,
    end: top.current_period_end ?? item?.current_period_end ?? null,
  };
}

// user_subscriptions.status only allows trialing/active/past_due/canceled/expired, so
// Stripe's incomplete/unpaid/paused (not paid, not over) map to expired; a later update
// back to active restores the plan. cancel_at_period_end is not a status: the customer
// keeps the plan until the period ends and customer.subscription.deleted arrives.
export function rowStatus(status: Stripe.Subscription.Status): string {
  return status === "active" || status === "trialing" || status === "past_due" ? status : "expired";
}

// The plan a subscription is paying for: its price's subscription_plans row. The plan_id
// in metadata (set by create-checkout) is the fallback for prices no longer on a plan row,
// e.g. a grandfathered price after a plan's stripe_price_id changes.
export async function planFor(db: SupabaseClient, sub: Stripe.Subscription): Promise<{ id: string; plan_id: string }> {
  const priceId = sub.items?.data?.[0]?.price?.id;
  if (priceId) {
    const { data, error } = await db
      .from("subscription_plans")
      .select("id, plan_id")
      .eq("stripe_price_id", priceId)
      .limit(1);
    if (error) throw new Error(`plan lookup by price ${priceId} failed: ${error.message}`);
    if (data?.[0]) return data[0];
  }

  const metaPlanId = sub.metadata?.plan_id;
  if (metaPlanId) {
    const { data, error } = await db
      .from("subscription_plans")
      .select("id, plan_id")
      .eq("plan_id", metaPlanId)
      .maybeSingle();
    if (error) throw new Error(`plan lookup for '${metaPlanId}' failed: ${error.message}`);
    if (data) return data;
  }

  throw new Error(`No subscription_plans row for price ${priceId} or plan_id '${metaPlanId}' (subscription ${sub.id})`);
}

/**
 * The account behind a Stripe customer, when the subscription doesn't say. Matches a
 * user_subscriptions row carrying the customer id first (set by create-checkout before
 * the customer ever paid), then the customer's email against auth.users - the same
 * email match the lifetime-deal flow uses. Returns null rather than guessing.
 */
async function userForCustomer(
  { db, stripe }: SyncDeps,
  customerId: string | null
): Promise<string | null> {
  if (!customerId) return null;

  const { data: byCustomer, error } = await db
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (error) throw new Error(`customer lookup failed: ${error.message}`);
  if (byCustomer?.user_id) return byCustomer.user_id;

  // A deleted customer simply has no email field, so no narrowing dance is needed.
  const customer = await stripe.customers.retrieve(customerId).catch(() => null);
  const email = (customer as Stripe.Customer | null)?.email ?? null;
  if (!email) return null;

  const { data: byEmail, error: emailError } = await db.rpc("find_user_id_by_email", { p_email: email });
  if (emailError) throw new Error(`user lookup by email failed: ${emailError.message}`);
  return (byEmail as string | null) || null;
}

/**
 * Writes a Stripe subscription's current state to its user's user_subscriptions row.
 * The row is found by stripe_subscription_id; failing that, by the user in metadata.
 * `claim` (a just-completed checkout, or a subscription found on the caller's own
 * Stripe customer) links the subscription even if the row tracks a different one;
 * otherwise an event for another subscription never overwrites the one the row tracks,
 * and a subscription that isn't live is never newly linked.
 */
export async function syncSubscription(
  { db, stripe }: SyncDeps,
  sub: Stripe.Subscription,
  opts: { userId?: string | null; claim?: boolean } = {}
): Promise<void> {
  const customerId = idOf(sub.customer as string | { id: string });
  const ended = ENDED_STATUSES.has(sub.status);

  const { data: tracked, error: trackedError } = await db
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();
  if (trackedError) throw new Error(`subscription row lookup failed: ${trackedError.message}`);

  if (ended) {
    if (!tracked) {
      console.log(`[SYNC] Ended subscription ${sub.id} is not tracked by any user; nothing to do`);
      return;
    }
    const { error } = await db
      .from("user_subscriptions")
      .update({
        plan_id: null,
        status: "expired",
        stripe_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at: null,
        canceled_at: iso(sub.ended_at ?? sub.canceled_at) ?? new Date().toISOString(),
      })
      .eq("stripe_subscription_id", sub.id);
    if (error) throw new Error(`ending subscription ${sub.id} failed: ${error.message}`);
    console.log(`[SYNC] Subscription ${sub.id} ended for user ${tracked.user_id}`);
    return;
  }

  const period = periodOf(sub);
  const fields = {
    status: rowStatus(sub.status),
    stripe_subscription_id: sub.id,
    stripe_customer_id: customerId,
    current_period_start: iso(period.start),
    current_period_end: iso(period.end),
    cancel_at: iso(sub.cancel_at) ?? (sub.cancel_at_period_end ? iso(period.end) : null),
    canceled_at: iso(sub.canceled_at),
  };

  if (tracked) {
    // An unresolvable price still gets its status and period synced (keeping the plan the
    // row has), then fails so the event is retried and shows up in Stripe's dashboard.
    const plan = await planFor(db, sub).catch((err: Error) => err);
    const { error } = await db
      .from("user_subscriptions")
      .update(plan instanceof Error ? fields : { ...fields, plan_id: plan.id })
      .eq("stripe_subscription_id", sub.id);
    if (error) throw new Error(`updating subscription ${sub.id} failed: ${error.message}`);
    if (plan instanceof Error) throw plan;
    console.log(`[SYNC] Subscription ${sub.id} synced: ${plan.plan_id} ${fields.status}`);
    return;
  }

  // Whose subscription is this? create-checkout stamps the user on the subscription, but
  // nothing else does: a Stripe payment link, a subscription started in the dashboard, or
  // one recovered by Link carries no metadata at all. That used to end here - logged,
  // answered 200, never retried - so the customer paid and stayed on Free with nothing
  // left to notice. The customer is the fallback identity: first a row that already
  // tracks it, then the email Stripe has for it.
  const userId =
    sub.metadata?.supabase_user_id ||
    opts.userId ||
    (await userForCustomer({ db, stripe }, customerId));
  if (!userId) {
    console.error(`[SYNC] Subscription ${sub.id} has no supabase_user_id, no row tracks it and its customer matches no account; ignoring`);
    return;
  }

  const { data: row, error: rowError } = await db
    .from("user_subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (rowError) throw new Error(`user row lookup failed: ${rowError.message}`);

  if (!opts.claim) {
    if (row?.stripe_subscription_id) {
      console.warn(`[SYNC] User ${userId} tracks ${row.stripe_subscription_id}; ignoring event for ${sub.id}`);
      return;
    }
    if (fields.status === "expired") {
      console.log(`[SYNC] Not linking subscription ${sub.id} in status ${sub.status}`);
      return;
    }
  }

  const plan = await planFor(db, sub);
  const { error } = await db
    .from("user_subscriptions")
    .upsert({ ...fields, user_id: userId, plan_id: plan.id }, { onConflict: "user_id" });
  if (error) throw new Error(`linking subscription ${sub.id} to user ${userId} failed: ${error.message}`);
  console.log(`[SYNC] Subscription ${sub.id} linked to user ${userId}: ${plan.plan_id} ${fields.status}`);
}

// Retrieve rather than trust the event body: events can arrive out of order, and the
// SDK's pinned API version gives a consistent object shape.
export async function syncSubscriptionById(
  deps: SyncDeps,
  subscriptionId: string,
  opts: { userId?: string | null; claim?: boolean } = {}
): Promise<Stripe.Subscription> {
  const sub = await deps.stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscription(deps, sub, opts);
  return sub;
}
