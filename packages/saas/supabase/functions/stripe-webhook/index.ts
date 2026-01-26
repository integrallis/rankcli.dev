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

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  console.log("[WEBHOOK] ====== STRIPE WEBHOOK CALLED ======");
  console.log("[WEBHOOK] Signature present:", !!signature);
  console.log("[WEBHOOK] Secret configured:", !!webhookSecret);

  if (!signature || !webhookSecret) {
    console.log("[WEBHOOK] Missing signature or webhook secret");
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    console.log("[WEBHOOK] Body length:", body.length);

    // Use constructEventAsync for Deno environment
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    console.log(`[WEBHOOK] Event verified: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const planId = session.metadata?.plan_id;

        console.log(`[WEBHOOK] checkout.session.completed: userId=${userId}, planId=${planId}`);

        if (!userId) {
          console.error("[WEBHOOK] Missing supabase_user_id in metadata");
          break;
        }

        if (!session.subscription) {
          console.error("[WEBHOOK] No subscription in checkout session");
          break;
        }

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        console.log(`[WEBHOOK] Retrieved subscription: ${subscription.id}`);

        // Get the plan UUID from our database
        const { data: plan, error: planError } = await supabaseClient
          .from("subscription_plans")
          .select("id")
          .eq("plan_id", planId)
          .single();

        if (planError || !plan) {
          console.error(`[WEBHOOK] Failed to find plan '${planId}':`, planError);
        }

        console.log(`[WEBHOOK] Found plan UUID: ${plan?.id || "NOT FOUND"}`);

        // Upsert user subscription
        const { error: upsertError } = await supabaseClient
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            plan_id: plan?.id || null,
            status: "active",
            stripe_subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, { onConflict: "user_id" });

        if (upsertError) {
          console.error("[WEBHOOK] Failed to upsert subscription:", upsertError);
        } else {
          console.log(`[WEBHOOK] SUCCESS: Subscription activated for user ${userId}, plan ${planId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          const status = subscription.cancel_at_period_end ? "canceled" : subscription.status;

          await supabaseClient
            .from("user_subscriptions")
            .update({
              status: status === "active" ? "active" : status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000).toISOString()
                : null,
            })
            .eq("user_id", userId);

          console.log(`[WEBHOOK] Subscription updated for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          await supabaseClient
            .from("user_subscriptions")
            .update({
              plan_id: null,
              status: "expired",
              stripe_subscription_id: null,
              current_period_start: null,
              current_period_end: null,
              cancel_at: null,
              canceled_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          console.log(`[WEBHOOK] Subscription deleted for user ${userId}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: userSub } = await supabaseClient
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userSub) {
          await supabaseClient
            .from("user_subscriptions")
            .update({ status: "past_due" })
            .eq("user_id", userSub.user_id);

          console.log(`[WEBHOOK] Payment failed for user ${userSub.user_id}`);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: userSub } = await supabaseClient
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userSub) {
          await supabaseClient
            .from("user_subscriptions")
            .update({ status: "active" })
            .eq("user_id", userSub.user_id);

          console.log(`[WEBHOOK] Invoice paid for user ${userSub.user_id}`);
        }
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("[WEBHOOK] Error:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
