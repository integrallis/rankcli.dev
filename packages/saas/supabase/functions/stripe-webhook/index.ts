import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { idOf, syncSubscriptionById as syncById } from "../_shared/stripe-sync.ts";

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

// The webhook's clients, handed to the shared sync helpers (see _shared/stripe-sync.ts,
// which sync-subscription reuses so a missed event can be repaired from the browser).
const deps = { stripe, db: supabaseClient };

function syncSubscriptionById(
  subscriptionId: string,
  opts: { userId?: string | null; claim?: boolean } = {}
): Promise<Stripe.Subscription> {
  return syncById(deps, subscriptionId, opts);
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
