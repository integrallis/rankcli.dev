import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

/**
 * Internal ops notifications - posts to Slack when high-signal business
 * events happen (new signup, new paid subscription). Not the customer-
 * facing per-project alerts (alert_configs / AlertConfigForm) - this is
 * for the RankCLI team's own visibility into the business.
 *
 * Called from:
 * - a database trigger on auth.users (see migration
 *   supabase/migrations/20260906040000_add_signup_slack_notify.sql)
 * - stripe-webhook, after a subscription is successfully activated
 *
 * No user ever calls this directly, so it's gated on a shared secret
 * (INTERNAL_WEBHOOK_SECRET) instead of a Supabase JWT - see
 * config.toml's verify_jwt = false for this function.
 */

const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL');
const INTERNAL_WEBHOOK_SECRET = Deno.env.get('INTERNAL_WEBHOOK_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
};

interface NotifyPayload {
  event: 'signup' | 'subscription' | 'lifetime_deal';
  email?: string;
  planId?: string;
  amountCents?: number;
}

function formatMessage(payload: NotifyPayload): string {
  switch (payload.event) {
    case 'signup':
      return `🆕 New signup: ${payload.email || 'unknown'}`;
    case 'subscription': {
      const amount = payload.amountCents != null ? ` ($${(payload.amountCents / 100).toFixed(2)}/mo)` : '';
      return `💰 New subscription: ${payload.email || 'unknown'} → ${payload.planId || 'unknown plan'}${amount}`;
    }
    case 'lifetime_deal':
      return `🎉 Lifetime deal purchased: ${payload.email || 'unknown'} → ${payload.planId || 'unknown tier'}`;
    default:
      return `Event: ${JSON.stringify(payload)}`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Shared-secret auth - this function is called by a Postgres trigger
  // and by stripe-webhook, neither of which has a user JWT to present.
  if (!INTERNAL_WEBHOOK_SECRET || req.headers.get('x-internal-secret') !== INTERNAL_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!SLACK_WEBHOOK_URL) {
    // Not configured yet - no-op rather than error, so callers (the
    // signup trigger, stripe-webhook) never fail because of this.
    return new Response(JSON.stringify({ skipped: 'SLACK_WEBHOOK_URL not configured' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = (await req.json()) as NotifyPayload;
    const text = formatMessage(payload);

    const slackRes = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!slackRes.ok) {
      console.error('[notify-slack] Slack API error:', slackRes.status, await slackRes.text());
      return new Response(JSON.stringify({ error: 'Slack post failed' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[notify-slack] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
