/**
 * Slack slash command handler for internal ops stats.
 *
 * Backs a single Slack slash command, /rankcli, with subcommands passed as
 * the command's text (`/rankcli users`, `/rankcli active`, `/rankcli billing`).
 * One Request URL for all of it - adding a new stat later is just a new
 * case below, never a Slack App config change.
 *
 * Auth is Slack's own request-signing scheme, not a Supabase JWT (there is
 * no Supabase user involved - Slack calls this directly): HMAC-SHA256 of
 * `v0:{timestamp}:{raw body}` using the app's signing secret, compared
 * against the X-Slack-Signature header, same timing-safe-compare style
 * already used for GitHub's webhook signature in github-webhook/index.ts.
 * Requests older than 5 minutes are rejected too (Slack's own documented
 * replay-protection recommendation - GitHub's scheme has no equivalent,
 * so this codebase hasn't needed a timestamp check before).
 *
 * Responds synchronously in the initial HTTP response (every subcommand is
 * a fast DB count, well under Slack's 3s timeout) - no need for the more
 * complex deferred response_url pattern.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const slackSigningSecret = Deno.env.get('SLACK_SIGNING_SECRET') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-slack-signature, x-slack-request-timestamp',
};

const FIVE_MINUTES_SECONDS = 5 * 60;

function verifySlackSignature(rawBody: string, timestamp: string, signature: string): boolean {
  if (!slackSigningSecret || !timestamp || !signature) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > FIVE_MINUTES_SECONDS) return false;

  const hmac = createHmac('sha256', slackSigningSecret);
  const digest = 'v0=' + hmac.update(`v0:${timestamp}:${rawBody}`).digest('hex');

  if (signature.length !== digest.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ digest.charCodeAt(i);
  }
  return result === 0;
}

function slackResponse(text: string) {
  return new Response(JSON.stringify({ response_type: 'ephemeral', text }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleUsers(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data, error } = await supabase.rpc('rankcli_admin_user_stats');
  if (error) {
    console.error('rankcli_admin_user_stats error:', error);
    return `:warning: Couldn't fetch user stats: ${error.message}`;
  }
  const stats = data as { total_users: number; new_today: number; new_7d: number };
  return [
    '*Registered users*',
    `Total: *${stats.total_users}*`,
    `New today: *${stats.new_today}*`,
    `New this week: *${stats.new_7d}*`,
  ].join('\n');
}

async function handleActive(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data, error } = await supabase.rpc('rankcli_admin_user_stats');
  if (error) {
    console.error('rankcli_admin_user_stats error:', error);
    return `:warning: Couldn't fetch activity stats: ${error.message}`;
  }
  const stats = data as { active_24h: number; active_7d: number };
  return [
    '*Active users* (by last sign-in)',
    `Last 24h: *${stats.active_24h}*`,
    `Last 7 days: *${stats.active_7d}*`,
  ].join('\n');
}

async function handleBilling(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data: subs, error: subsError } = await supabase
    .from('user_subscriptions')
    .select('status, plan:subscription_plans(plan_id, name, price_cents, billing_period)')
    .in('status', ['active', 'trialing', 'lifetime']);

  if (subsError) {
    console.error('billing stats error:', subsError);
    return `:warning: Couldn't fetch billing stats: ${subsError.message}`;
  }

  type Row = { status: string; plan: { plan_id: string; name: string; price_cents: number; billing_period: string } | null };
  const rows = (subs || []) as unknown as Row[];

  const byPlan = new Map<string, number>();
  let mrrCents = 0;
  let ltdCount = 0;

  for (const row of rows) {
    if (row.status === 'lifetime' || !row.plan) {
      ltdCount++;
      continue;
    }
    const label = row.plan.name;
    byPlan.set(label, (byPlan.get(label) || 0) + 1);

    if (row.status === 'active') {
      if (row.plan.billing_period === 'year') {
        mrrCents += Math.round(row.plan.price_cents / 12);
      } else if (row.plan.billing_period === 'month') {
        mrrCents += row.plan.price_cents;
      }
      // 'lifetime' billing_period plans (shouldn't occur outside status
      // 'lifetime', but excluded defensively) contribute nothing to MRR.
    }
  }

  const planLines = Array.from(byPlan.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `  ${name}: *${count}*`)
    .join('\n') || '  (none)';

  return [
    '*Subscriptions* (active + trialing)',
    planLines,
    '',
    `Estimated MRR: *$${(mrrCents / 100).toFixed(2)}*`,
    `Lifetime deal customers: *${ltdCount}*`,
  ].join('\n');
}

function handleHelp(): string {
  return [
    '*RankCLI ops commands*',
    '`/rankcli users` — registered user counts',
    '`/rankcli active` — active users by last sign-in',
    '`/rankcli billing` — subscriptions by plan, estimated MRR, LTD count',
  ].join('\n');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const rawBody = await req.text();
  const timestamp = req.headers.get('x-slack-request-timestamp') || '';
  const signature = req.headers.get('x-slack-signature') || '';

  if (!verifySlackSignature(rawBody, timestamp, signature)) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const params = new URLSearchParams(rawBody);
  const subcommand = (params.get('text') || '').trim().toLowerCase();

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (subcommand) {
      case 'users':
        return slackResponse(await handleUsers(supabase));
      case 'active':
        return slackResponse(await handleActive(supabase));
      case 'billing':
        return slackResponse(await handleBilling(supabase));
      default:
        return slackResponse(handleHelp());
    }
  } catch (error) {
    console.error('slack-commands error:', error);
    return slackResponse(`:warning: Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});
