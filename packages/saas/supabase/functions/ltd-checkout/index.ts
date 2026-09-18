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

// LTD tier to Stripe price ID mapping
const LTD_PRICE_IDS: Record<string, string> = {
  ltd_starter: Deno.env.get('STRIPE_LTD_STARTER_PRICE_ID') || '',
  ltd_pro: Deno.env.get('STRIPE_LTD_PRO_PRICE_ID') || '',
  ltd_agency: Deno.env.get('STRIPE_LTD_AGENCY_PRICE_ID') || '',
};

// Stripe's shortest allowed Checkout lifetime. The license reservation is held a little
// longer than the session, so a payment made at the last moment still finds it; an
// abandoned session fires checkout.session.expired, which releases it (stripe-webhook).
const SESSION_MINUTES = 31;
const RESERVATION_GRACE_MINUTES = 15;

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sign-in is required. Every call holds one license out of a capped inventory, and
    // anonymous calls could hold all of them; they also left the webhook to guess the
    // buyer's account from a typed-in email.
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: { user } } = token ? await supabase.auth.getUser(token) : { data: { user: null } };
    if (!user?.email) {
      return json({ error: 'Sign in to buy a lifetime deal', code: 'auth_required' }, 401);
    }

    const { tier, successUrl, cancelUrl } = await req.json();

    // Validate tier
    if (!tier || !LTD_PRICE_IDS[tier]) {
      return json({ error: 'Invalid LTD tier' }, 400);
    }

    // Check if user already has an LTD
    const { data: existingLTD } = await supabase.rpc('user_has_ltd', {
      p_user_id: user.id,
    });

    if (existingLTD && existingLTD[0]?.has_ltd) {
      return json({ error: 'You already have a lifetime deal', existing_tier: existingLTD[0].tier }, 400);
    }

    // Reservations only lapse when something releases them, and nothing scheduled does
    // (no pg_cron here), so sweep on the way in.
    const { error: sweepError } = await supabase.rpc('release_expired_ltd_reservations');
    if (sweepError) console.error('Failed to release expired LTD reservations:', sweepError);

    // One open checkout per user: close any earlier one and give its license back, unless
    // it was paid (the webhook converts that reservation).
    const { data: openReservations } = await supabase
      .from('ltd_reservations')
      .select('stripe_checkout_session_id')
      .eq('user_id', user.id)
      .eq('converted_to_purchase', false);

    for (const reservation of openReservations || []) {
      const sessionId = reservation.stripe_checkout_session_id;
      try {
        const previous = await stripe.checkout.sessions.retrieve(sessionId);
        if (previous.status === 'complete') continue;
        if (previous.status === 'open') await stripe.checkout.sessions.expire(sessionId);
        await supabase.rpc('release_ltd_reservation', { p_checkout_session_id: sessionId });
      } catch (err) {
        console.error(`Could not close earlier LTD checkout ${sessionId}:`, err);
      }
    }

    // Check availability before creating checkout
    const { data: availability } = await supabase.rpc('get_ltd_remaining', {
      p_tier: tier,
    });

    if (!availability || availability <= 0) {
      return json({ error: 'This tier is sold out', tier }, 400);
    }

    const priceId = LTD_PRICE_IDS[tier];

    // Use URLs from request, or fall back to APP_URL env var
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3005';
    const finalSuccessUrl = successUrl || `${appUrl}/account/billing?ltd_success=true`;
    const finalCancelUrl = cancelUrl || `${appUrl}/pricing?ltd_canceled=true`;

    // Create or get Stripe customer
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId: string | undefined = subscription?.stripe_customer_id || undefined;

    if (!customerId) {
      // Search for existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
            source: 'ltd_checkout',
          },
        });
        customerId = customer.id;
      }

      await supabase
        .from('user_subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    const sessionExpiresAt = Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60;

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      expires_at: sessionExpiresAt,
      metadata: {
        type: 'lifetime_deal',
        ltd_tier: tier,
        supabase_user_id: user.id,
        customer_email: user.email,
      },
      payment_intent_data: {
        metadata: {
          type: 'lifetime_deal',
          ltd_tier: tier,
          supabase_user_id: user.id,
          customer_email: user.email,
        },
      },
      // Collect billing address for tax purposes
      billing_address_collection: 'required',
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    // Reserve the license in the database
    const { data: reserved, error: reserveError } = await supabase.rpc(
      'reserve_ltd_license',
      {
        p_tier: tier,
        p_checkout_session_id: session.id,
        p_email: user.email,
        p_user_id: user.id,
      }
    );

    if (reserveError || !reserved) {
      console.error('Failed to reserve license:', reserveError);
      // Cancel the checkout session since we couldn't reserve
      await stripe.checkout.sessions.expire(session.id);
      return json({ error: 'Failed to reserve license - tier may be sold out' }, 400);
    }

    // Outlive the session (see SESSION_MINUTES).
    const { error: expiryError } = await supabase
      .from('ltd_reservations')
      .update({ expires_at: new Date((sessionExpiresAt + RESERVATION_GRACE_MINUTES * 60) * 1000).toISOString() })
      .eq('stripe_checkout_session_id', session.id);
    if (expiryError) console.error('Failed to extend LTD reservation:', expiryError);

    return json({
      url: session.url,
      sessionId: session.id,
      tier,
      reserved: true,
    });
  } catch (error) {
    console.error('Error creating LTD checkout session:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
