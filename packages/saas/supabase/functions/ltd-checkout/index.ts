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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header (optional - can checkout without login)
    const authHeader = req.headers.get('Authorization');
    let user = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    const { tier, email, successUrl, cancelUrl } = await req.json();

    // Validate tier
    if (!tier || !LTD_PRICE_IDS[tier]) {
      return new Response(JSON.stringify({ error: 'Invalid LTD tier' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get email from user or request
    const customerEmail = user?.email || email;
    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already has an LTD
    if (user) {
      const { data: existingLTD } = await supabase.rpc('user_has_ltd', {
        p_user_id: user.id,
      });

      if (existingLTD && existingLTD[0]?.has_ltd) {
        return new Response(
          JSON.stringify({
            error: 'You already have a lifetime deal',
            existing_tier: existingLTD[0].tier,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Check availability before creating checkout
    const { data: availability } = await supabase.rpc('get_ltd_remaining', {
      p_tier: tier,
    });

    if (!availability || availability <= 0) {
      return new Response(
        JSON.stringify({ error: 'This tier is sold out', tier }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const priceId = LTD_PRICE_IDS[tier];
    if (!priceId) {
      console.error(`Missing price ID for tier: ${tier}`);
      return new Response(
        JSON.stringify({ error: 'LTD tier not configured in Stripe' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use URLs from request, or fall back to APP_URL env var
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3005';
    const finalSuccessUrl = successUrl || `${appUrl}/account/billing?ltd_success=true`;
    const finalCancelUrl = cancelUrl || `${appUrl}/pricing?ltd_canceled=true`;

    // Create or get Stripe customer
    let customerId: string | undefined;

    if (user) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      customerId = subscription?.stripe_customer_id;
    }

    if (!customerId) {
      // Search for existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            supabase_user_id: user?.id || '',
            source: 'ltd_checkout',
          },
        });
        customerId = customer.id;
      }

      // Update user subscription with customer ID if logged in
      if (user) {
        await supabase
          .from('user_subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user.id);
      }
    }

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        type: 'lifetime_deal',
        ltd_tier: tier,
        supabase_user_id: user?.id || '',
        customer_email: customerEmail,
      },
      payment_intent_data: {
        metadata: {
          type: 'lifetime_deal',
          ltd_tier: tier,
          supabase_user_id: user?.id || '',
          customer_email: customerEmail,
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
        p_email: customerEmail,
        p_user_id: user?.id || null,
      }
    );

    if (reserveError || !reserved) {
      console.error('Failed to reserve license:', reserveError);
      // Cancel the checkout session since we couldn't reserve
      await stripe.checkout.sessions.expire(session.id);
      return new Response(
        JSON.stringify({ error: 'Failed to reserve license - tier may be sold out' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        tier,
        reserved: true,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating LTD checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
