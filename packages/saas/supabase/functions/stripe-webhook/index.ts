import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const planId = session.metadata?.plan_id;

        if (userId && session.subscription) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Get the plan UUID from our database
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('plan_id', planId)
            .single();

          // Upsert user subscription (INSERT if not exists, UPDATE if exists)
          const { error: upsertError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              plan_id: plan?.id,
              status: 'active',
              stripe_subscription_id: subscription.id,
              stripe_customer_id: session.customer as string,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            }, { onConflict: 'user_id' });

          if (upsertError) {
            console.error('Failed to upsert subscription:', upsertError);
          }

          console.log(`Subscription activated for user ${userId}, plan ${planId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          const status = subscription.cancel_at_period_end ? 'canceled' : subscription.status;

          await supabase
            .from('user_subscriptions')
            .update({
              status: status === 'active' ? 'active' : status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000).toISOString()
                : null,
            })
            .eq('user_id', userId);

          console.log(`Subscription updated for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          // Reset to free tier
          await supabase
            .from('user_subscriptions')
            .update({
              plan_id: null,
              status: 'expired',
              stripe_subscription_id: null,
              current_period_start: null,
              current_period_end: null,
              cancel_at: null,
              canceled_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          console.log(`Subscription deleted for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by customer ID
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userSub) {
          await supabase
            .from('user_subscriptions')
            .update({ status: 'past_due' })
            .eq('user_id', userSub.user_id);

          // Create notification
          await supabase.from('notifications').insert({
            user_id: userSub.user_id,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: 'Your payment failed. Please update your payment method to continue your subscription.',
            link: '/account/billing',
          });

          console.log(`Payment failed for user ${userSub.user_id}`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by customer ID and update status back to active
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userSub) {
          await supabase
            .from('user_subscriptions')
            .update({ status: 'active' })
            .eq('user_id', userSub.user_id);

          console.log(`Invoice paid for user ${userSub.user_id}`);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
