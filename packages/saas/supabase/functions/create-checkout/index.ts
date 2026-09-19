import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Stripe statuses in which the customer is still billed for a subscription.
const LIVE_STATUSES = new Set(['active', 'trialing', 'past_due', 'unpaid']);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    // No header used to crash on the non-null assertion and return a 500.
    const authHeader = req.headers.get('Authorization') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null }, error: null };

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { planId, successUrl, cancelUrl, switchPlan } = await req.json();

    // The price comes from our plan row, never from the client. The webhook grants
    // whatever metadata.plan_id says, so a client-chosen price would let the $9 Solo
    // price buy Agency.
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('stripe_price_id, name')
      .eq('plan_id', planId)
      .eq('is_active', true)
      .maybeSingle();

    if (!plan?.stripe_price_id) {
      return new Response(JSON.stringify({ error: 'Unknown or unavailable plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // A launch-offer plan (pro_founding) is only sold while its offer is open: within its
    // window and under its seat cap. The pricing page hides the offer once it closes, but
    // nothing stopped a direct call from buying it.
    const { data: offer, error: offerError } = await supabase
      .from('launch_offers')
      .select('key')
      .eq('plan_id', planId)
      .maybeSingle();
    if (offerError) throw offerError;

    if (offer) {
      const { data: availability, error: availabilityError } = await supabase
        .rpc('get_launch_offer_availability', { p_key: offer.key })
        .maybeSingle();
      if (availabilityError) throw availabilityError;

      const open = availability as { is_active: boolean; remaining: number } | null;
      if (!open?.is_active || open.remaining <= 0) {
        return new Response(JSON.stringify({ error: 'This offer has closed. Choose another plan.' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Use URLs from request, or fall back to APP_URL env var
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3005';
    const finalSuccessUrl = successUrl || `${appUrl}/account/billing?success=true`;
    const finalCancelUrl = cancelUrl || `${appUrl}/pricing?canceled=true`;

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // One subscription per customer. A subscriber picking another plan switches the
    // subscription they have - a second checkout would bill both. Stripe is the source of
    // truth here, not user_subscriptions, which lags the webhook right after a checkout.
    // The billing portal can't switch plans (its subscription_update is off), so this is
    // the switch: the client confirms first (switchPlan), the prorated difference is
    // invoiced now, and the webhook's plan-follows-price updates the row.
    if (customerId) {
      const { data: subscriptions } = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 });
      const current = subscriptions.find((sub: Stripe.Subscription) => LIVE_STATUSES.has(sub.status));
      if (current) {
        const item = current.items.data[0];
        if (item?.price.id === plan.stripe_price_id) {
          return json({ code: 'already_on_plan', error: "You're already on this plan." }, 409);
        }
        if (!switchPlan) {
          return json({
            code: 'switch_required',
            planName: plan.name,
            error: 'You already have a subscription. Confirm the plan change to switch it.',
          }, 409);
        }
        try {
          await stripe.subscriptions.update(current.id, {
            items: [{ id: item.id, price: plan.stripe_price_id }],
            proration_behavior: 'always_invoice',
            // A declined card leaves the subscription as it was instead of switching unpaid.
            payment_behavior: 'error_if_incomplete',
            cancel_at_period_end: false,
            metadata: { ...current.metadata, supabase_user_id: user.id, plan_id: planId },
          });
        } catch (error) {
          return json({ error: error instanceof Error ? error.message : 'The plan change was declined' }, 402);
        }
        return json({ switched: true, planName: plan.name });
      }
    }

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update user subscription with customer ID
      await supabase
        .from('user_subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        supabase_user_id: user.id,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_id: planId,
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
