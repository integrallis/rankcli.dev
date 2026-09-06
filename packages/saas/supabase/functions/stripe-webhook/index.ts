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
        const ltdTier = session.metadata?.ltd_tier;
        const isLTD = session.metadata?.type === "lifetime_deal";

        console.log(`[WEBHOOK] checkout.session.completed: userId=${userId}, planId=${planId}, isLTD=${isLTD}, ltdTier=${ltdTier}`);

        // Handle Lifetime Deal purchase
        if (isLTD && ltdTier) {
          console.log(`[WEBHOOK] Processing LTD purchase: tier=${ltdTier}`);

          // Get or create user if not logged in during purchase
          let effectiveUserId = userId;
          const customerEmail = session.metadata?.customer_email || session.customer_details?.email;

          if (!effectiveUserId && customerEmail) {
            // Check if user exists with this email
            const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(customerEmail);

            if (existingUser?.user) {
              effectiveUserId = existingUser.user.id;
              console.log(`[WEBHOOK] Found existing user by email: ${effectiveUserId}`);
            } else {
              // Create a new user account for this email
              const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
                email: customerEmail,
                email_confirm: true,
              });

              if (createError) {
                console.error("[WEBHOOK] Failed to create user:", createError);
              } else {
                effectiveUserId = newUser.user?.id;
                console.log(`[WEBHOOK] Created new user: ${effectiveUserId}`);
              }
            }
          }

          if (!effectiveUserId) {
            console.error("[WEBHOOK] Cannot process LTD without user ID or email");
            break;
          }

          // Get payment intent ID from session
          const paymentIntentId = session.payment_intent as string;

          // Complete the LTD purchase using our database function
          const { data: purchaseId, error: purchaseError } = await supabaseClient.rpc(
            "complete_ltd_purchase",
            {
              p_checkout_session_id: session.id,
              p_user_id: effectiveUserId,
              p_payment_intent_id: paymentIntentId,
              p_price_cents: session.amount_total || 0,
              p_ip_address: null,
              p_user_agent: null,
              p_referral_source: session.metadata?.referral_source || null,
            }
          );

          if (purchaseError) {
            console.error("[WEBHOOK] Failed to complete LTD purchase:", purchaseError);
          } else {
            console.log(`[WEBHOOK] SUCCESS: LTD purchase completed: ${purchaseId}`);
            await notifySlack({
              event: "lifetime_deal",
              email: customerEmail,
              planId: ltdTier,
              amountCents: session.amount_total || 0,
            });

            // Update user_subscriptions to reflect LTD status
            await supabaseClient
              .from("user_subscriptions")
              .upsert({
                user_id: effectiveUserId,
                plan_id: null, // LTDs don't use plan_id
                status: "lifetime",
                stripe_customer_id: session.customer as string,
                current_period_start: new Date().toISOString(),
                current_period_end: null, // No end date for lifetime
              }, { onConflict: "user_id" });

            console.log(`[WEBHOOK] User subscription updated to lifetime status`);
          }
          break;
        }

        // Handle regular subscription purchase
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
          await notifySlack({
            event: "subscription",
            email: session.customer_details?.email || undefined,
            planId,
            amountCents: session.amount_total || 0,
          });
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

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const isLTD = session.metadata?.type === "lifetime_deal";

        if (isLTD) {
          console.log(`[WEBHOOK] LTD checkout expired: ${session.id}`);
          // The release will happen automatically via the release_expired_ltd_reservations function
          // which should be called periodically (e.g., by a cron job)
          // But we can also manually release it here for immediate cleanup

          // Note: The reservation has a 30-minute expiry in the database
          // so it will be cleaned up eventually even if this webhook fails
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (!paymentIntentId) break;

        // Check if this refund is for an LTD purchase
        const { data: ltdPurchase } = await supabaseClient
          .from("ltd_purchases")
          .select("id, tier, user_id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .single();

        if (ltdPurchase) {
          console.log(`[WEBHOOK] LTD refund detected: ${ltdPurchase.id}`);

          // Mark as refunded
          await supabaseClient
            .from("ltd_purchases")
            .update({
              refunded_at: new Date().toISOString(),
              refund_reason: charge.refunds?.data?.[0]?.reason || "requested",
            })
            .eq("id", ltdPurchase.id);

          // Decrement sold count (add license back)
          await supabaseClient.rpc("exec_sql", {
            query: `
              UPDATE ltd_inventory
              SET sold_count = sold_count - 1, updated_at = NOW()
              WHERE tier = '${ltdPurchase.tier}'
            `,
          });

          // Revert user subscription status
          await supabaseClient
            .from("user_subscriptions")
            .update({
              status: "expired",
              current_period_end: new Date().toISOString(),
            })
            .eq("user_id", ltdPurchase.user_id);

          console.log(`[WEBHOOK] LTD refund processed for user ${ltdPurchase.user_id}`);
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
