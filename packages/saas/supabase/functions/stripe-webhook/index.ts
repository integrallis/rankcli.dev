import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const INTERNAL_WEBHOOK_SECRET = Deno.env.get("INTERNAL_WEBHOOK_SECRET");

// Every handler below is a sync from Stripe's current state, so a retried or
// out-of-order event converges instead of double-applying. Anything that fails
// throws, and the response is a 500 so Stripe retries it (it used to log and answer
// 200, which left a paying customer on no plan with nothing retrying). Events that
// can never succeed - no user to attribute them to - are logged and acknowledged.

// Internal ops Slack ping - best-effort, never blocks or fails the
// webhook response over a notification issue.
async function notifySlack(payload: Record<string, unknown>): Promise<void> {
  if (!INTERNAL_WEBHOOK_SECRET) return;
  try {
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-slack`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_WEBHOOK_SECRET,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[WEBHOOK] notify-slack failed:", error);
  }
}

function iso(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

function idOf(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

// Newer Stripe API versions moved the billing period from the subscription to its items.
function periodOf(sub: Stripe.Subscription): { start: number | null; end: number | null } {
  const item = sub.items?.data?.[0] as unknown as { current_period_start?: number; current_period_end?: number } | undefined;
  const top = sub as unknown as { current_period_start?: number; current_period_end?: number };
  return {
    start: top.current_period_start ?? item?.current_period_start ?? null,
    end: top.current_period_end ?? item?.current_period_end ?? null,
  };
}

// Stripe statuses that end a subscription for good.
const ENDED_STATUSES = new Set(["canceled", "incomplete_expired"]);

// user_subscriptions.status only allows trialing/active/past_due/canceled/expired, so
// Stripe's incomplete/unpaid/paused (not paid, not over) map to expired; a later update
// back to active restores the plan. cancel_at_period_end is not a status: the customer
// keeps the plan until the period ends and customer.subscription.deleted arrives.
function rowStatus(status: Stripe.Subscription.Status): string {
  return status === "active" || status === "trialing" || status === "past_due" ? status : "expired";
}

// The plan a subscription is paying for: its price's subscription_plans row. The plan_id
// in metadata (set by create-checkout) is the fallback for prices no longer on a plan row,
// e.g. a grandfathered price after a plan's stripe_price_id changes.
async function planFor(sub: Stripe.Subscription): Promise<{ id: string; plan_id: string }> {
  const priceId = sub.items?.data?.[0]?.price?.id;
  if (priceId) {
    const { data, error } = await supabaseClient
      .from("subscription_plans")
      .select("id, plan_id")
      .eq("stripe_price_id", priceId)
      .limit(1);
    if (error) throw new Error(`plan lookup by price ${priceId} failed: ${error.message}`);
    if (data?.[0]) return data[0];
  }

  const metaPlanId = sub.metadata?.plan_id;
  if (metaPlanId) {
    const { data, error } = await supabaseClient
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
 * Writes a Stripe subscription's current state to its user's user_subscriptions row.
 * The row is found by stripe_subscription_id; failing that, by the user in metadata.
 * `claim` (a just-completed checkout) links the subscription even if the row tracks a
 * different one; otherwise an event for another subscription never overwrites the one
 * the row tracks, and a subscription that isn't live is never newly linked.
 */
async function syncSubscription(
  sub: Stripe.Subscription,
  opts: { userId?: string | null; claim?: boolean } = {}
): Promise<void> {
  const customerId = idOf(sub.customer as string | { id: string });
  const ended = ENDED_STATUSES.has(sub.status);

  const { data: tracked, error: trackedError } = await supabaseClient
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();
  if (trackedError) throw new Error(`subscription row lookup failed: ${trackedError.message}`);

  if (ended) {
    if (!tracked) {
      console.log(`[WEBHOOK] Ended subscription ${sub.id} is not tracked by any user; nothing to do`);
      return;
    }
    const { error } = await supabaseClient
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
    console.log(`[WEBHOOK] Subscription ${sub.id} ended for user ${tracked.user_id}`);
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
    const plan = await planFor(sub).catch((err: Error) => err);
    const { error } = await supabaseClient
      .from("user_subscriptions")
      .update(plan instanceof Error ? fields : { ...fields, plan_id: plan.id })
      .eq("stripe_subscription_id", sub.id);
    if (error) throw new Error(`updating subscription ${sub.id} failed: ${error.message}`);
    if (plan instanceof Error) throw plan;
    console.log(`[WEBHOOK] Subscription ${sub.id} synced: ${plan.plan_id} ${fields.status}`);
    return;
  }

  const userId = sub.metadata?.supabase_user_id || opts.userId;
  if (!userId) {
    console.error(`[WEBHOOK] Subscription ${sub.id} has no supabase_user_id and no row tracks it; ignoring`);
    return;
  }

  const { data: row, error: rowError } = await supabaseClient
    .from("user_subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (rowError) throw new Error(`user row lookup failed: ${rowError.message}`);

  if (!opts.claim) {
    if (row?.stripe_subscription_id) {
      console.warn(`[WEBHOOK] User ${userId} tracks ${row.stripe_subscription_id}; ignoring event for ${sub.id}`);
      return;
    }
    if (fields.status === "expired") {
      console.log(`[WEBHOOK] Not linking subscription ${sub.id} in status ${sub.status}`);
      return;
    }
  }

  const plan = await planFor(sub);
  const { error } = await supabaseClient
    .from("user_subscriptions")
    .upsert({ ...fields, user_id: userId, plan_id: plan.id }, { onConflict: "user_id" });
  if (error) throw new Error(`linking subscription ${sub.id} to user ${userId} failed: ${error.message}`);
  console.log(`[WEBHOOK] Subscription ${sub.id} linked to user ${userId}: ${plan.plan_id} ${fields.status}`);
}

// Retrieve rather than trust the event body: events can arrive out of order, and the
// SDK's pinned API version gives a consistent object shape.
async function syncSubscriptionById(
  subscriptionId: string,
  opts: { userId?: string | null; claim?: boolean } = {}
): Promise<Stripe.Subscription> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscription(sub, opts);
  return sub;
}

// Lifetime deal paid. Entitlement is the ltd_purchases row (see effective_entitlement /
// _shared/tier.ts); user_subscriptions is not touched - the old 'lifetime' status there
// violated its CHECK constraint, so no buyer ever got the plan.
async function completeLifetimeDeal(session: Stripe.Checkout.Session): Promise<void> {
  const ltdTier = session.metadata?.ltd_tier;
  if (!ltdTier) {
    console.error(`[WEBHOOK] LTD session ${session.id} has no ltd_tier; ignoring`);
    return;
  }
  // Card payments are 'paid' at completion. A delayed method completes 'unpaid' and is
  // granted on checkout.session.async_payment_succeeded.
  if (session.payment_status === "unpaid") {
    console.log(`[WEBHOOK] LTD session ${session.id} completed unpaid; waiting for the payment`);
    return;
  }

  const { data: existing, error: existingError } = await supabaseClient
    .from("ltd_purchases")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existingError) throw new Error(`LTD purchase lookup failed: ${existingError.message}`);
  if (existing) {
    console.log(`[WEBHOOK] LTD session ${session.id} already recorded as ${existing.id}`);
    return;
  }

  const customerEmail = session.metadata?.customer_email || session.customer_details?.email || null;
  let userId = session.metadata?.supabase_user_id || null;

  // ltd-checkout now requires sign-in; checkouts started anonymously before that are
  // matched to an account by email, or get a new one.
  if (!userId && customerEmail) {
    const { data: foundId, error: findError } = await supabaseClient.rpc("find_user_id_by_email", {
      p_email: customerEmail,
    });
    if (findError) throw new Error(`user lookup by email failed: ${findError.message}`);
    userId = (foundId as string | null) || null;

    if (!userId) {
      const { data: created, error: createError } = await supabaseClient.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true,
      });
      if (createError || !created?.user) {
        throw new Error(`creating a user for ${customerEmail} failed: ${createError?.message}`);
      }
      userId = created.user.id;
      console.log(`[WEBHOOK] Created user ${userId} for LTD buyer`);
    }
  }

  if (!userId) {
    console.error(`[WEBHOOK] LTD session ${session.id} has neither a user nor an email; ignoring`);
    return;
  }

  const { data: purchaseId, error: purchaseError } = await supabaseClient.rpc("complete_ltd_purchase", {
    p_checkout_session_id: session.id,
    p_user_id: userId,
    p_payment_intent_id: idOf(session.payment_intent as string | { id: string }),
    p_price_cents: session.amount_total || 0,
    p_ip_address: null,
    p_user_agent: null,
    p_referral_source: session.metadata?.referral_source || null,
    p_tier: ltdTier,
    p_email: customerEmail,
  });
  if (purchaseError) throw new Error(`complete_ltd_purchase failed: ${purchaseError.message}`);

  console.log(`[WEBHOOK] LTD purchase ${purchaseId} recorded for user ${userId} (${ltdTier})`);
  await notifySlack({
    event: "lifetime_deal",
    email: customerEmail || undefined,
    planId: ltdTier,
    amountCents: session.amount_total || 0,
  });
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.type === "lifetime_deal") {
        await completeLifetimeDeal(session);
        return;
      }

      const subscriptionId = idOf(session.subscription as string | { id: string });
      if (!subscriptionId) {
        console.log(`[WEBHOOK] Checkout ${session.id} has no subscription; nothing to do`);
        return;
      }

      // The customer just paid for this subscription, so it replaces whatever the row tracked.
      const sub = await syncSubscriptionById(subscriptionId, {
        userId: session.metadata?.supabase_user_id,
        claim: true,
      });
      await notifySlack({
        event: "subscription",
        email: session.customer_details?.email || undefined,
        planId: sub.metadata?.plan_id || session.metadata?.plan_id,
        amountCents: session.amount_total || 0,
      });
      return;
    }

    case "checkout.session.async_payment_succeeded": {
      // A lifetime deal paid by a delayed method (bank debit) completes 'unpaid' first.
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type === "lifetime_deal") await completeLifetimeDeal(session);
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscriptionById(sub.id);
      return;
    }

    case "invoice.paid":
    case "invoice.payment_failed": {
      // Stripe moves the subscription to active / past_due; syncing picks that up and
      // matches on the subscription, not on a customer id shared by every row it touched.
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = idOf(invoice.subscription as string | { id: string } | null);
      if (subscriptionId) await syncSubscriptionById(subscriptionId);
      return;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type !== "lifetime_deal") return;

      // Give the held license back now rather than waiting for the reservation to lapse.
      const { data: released, error } = await supabaseClient.rpc("release_ltd_reservation", {
        p_checkout_session_id: session.id,
      });
      if (error) throw new Error(`release_ltd_reservation failed: ${error.message}`);
      console.log(`[WEBHOOK] LTD checkout ${session.id} expired; reservation released: ${released}`);
      return;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = idOf(charge.payment_intent as string | { id: string } | null);
      // Only a full refund revokes a lifetime license; a partial one is a goodwill credit.
      if (!paymentIntentId || !charge.refunded) return;

      const { data: refundedId, error } = await supabaseClient.rpc("refund_ltd_purchase", {
        p_payment_intent_id: paymentIntentId,
        p_reason: charge.refunds?.data?.[0]?.reason || "requested",
      });
      if (error) throw new Error(`refund_ltd_purchase failed: ${error.message}`);
      if (refundedId) console.log(`[WEBHOOK] LTD purchase ${refundedId} refunded`);
      return;
    }

    default:
      console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
  }
}

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.log("[WEBHOOK] Missing signature or webhook secret");
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    // Use constructEventAsync for Deno environment
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("[WEBHOOK] Signature verification failed:", err);
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : err}`, { status: 400 });
  }

  console.log(`[WEBHOOK] ${event.type} ${event.id}`);

  try {
    await handleEvent(event);
  } catch (err) {
    // 5xx so Stripe retries the event (it retries for up to three days).
    console.error(`[WEBHOOK] ${event.type} ${event.id} failed:`, err);
    return new Response(`Webhook handler failed: ${err instanceof Error ? err.message : err}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
