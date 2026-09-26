// Reconciles the signed-in user's plan with Stripe, on demand.
//
// The webhook is the normal path, but it is one HTTP call away from a customer who
// paid and still sees "Free": a webhook endpoint that was never created for the live
// mode, a rotated STRIPE_WEBHOOK_SECRET, a dropped event. This function asks Stripe
// directly - "what is this customer paying for right now?" - and writes the answer
// through the same code the webhook uses (_shared/stripe-sync.ts), so the two can't
// drift. It is idempotent: calling it twice changes nothing the second time.
//
// The account page calls it when returning from checkout and behind a "Refresh from
// Stripe" button. It only ever touches the caller's own row, and it trusts Stripe for
// the plan - never the client, which sends no plan at all.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';
import { LIVE_STATUSES, syncSubscription, syncSubscriptionById } from '../_shared/stripe-sync.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const db = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: { user } } = token
      ? await db.auth.getUser(token)
      : { data: { user: null } };
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const deps = { stripe, db };

    const { data: row } = await db
      .from('user_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Customers to search: the one on the row, plus any Stripe customer carrying this
    // user's (Supabase-verified) email. The email fallback covers a checkout that made
    // its own customer - Stripe Link reusing a saved one, a subscription started before
    // the row existed - which is exactly when the row can't point at the payment.
    const customerIds = new Set<string>();
    if (row?.stripe_customer_id) customerIds.add(row.stripe_customer_id);
    if (user.email) {
      const byEmail = await stripe.customers.list({ email: user.email, limit: 10 });
      for (const customer of byEmail.data) {
        const owner = customer.metadata?.supabase_user_id;
        if (!owner || owner === user.id) customerIds.add(customer.id);
      }
    }

    // A live subscription is the one that decides the plan. Newest first, so a customer
    // with an old past_due alongside a fresh active one gets the fresh one.
    let live: Stripe.Subscription | null = null;
    for (const customerId of customerIds) {
      const { data: subs } = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 20,
      });
      for (const sub of subs) {
        if (!LIVE_STATUSES.has(sub.status)) continue;
        if (!live || sub.created > live.created) live = sub;
      }
    }

    if (live) {
      // Found on the caller's own customer, so it claims the row even if the row still
      // tracks an older subscription (e.g. a plan switch the webhook missed).
      await syncSubscription(deps, live, { userId: user.id, claim: true });
    } else if (row?.stripe_subscription_id) {
      // Nothing live: sync what the row tracks, which clears a plan that ended in Stripe.
      await syncSubscriptionById(deps, row.stripe_subscription_id);
    }

    // Report the plan the database now enforces, so the client shows what it will get.
    const { data: entitlement } = await db
      .rpc('effective_entitlement', { p_user_id: user.id })
      .maybeSingle();

    return json({
      synced: !!live || !!row?.stripe_subscription_id,
      subscriptionId: live?.id ?? null,
      status: live?.status ?? null,
      customersChecked: customerIds.size,
      entitlement: entitlement ?? null,
    });
  } catch (error) {
    console.error('[SYNC-SUBSCRIPTION] failed:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
