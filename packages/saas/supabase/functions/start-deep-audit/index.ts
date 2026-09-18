// Starts a dashboard deep audit on the audit worker.
//
// The browser used to call the worker directly with AUDIT_WORKER_SECRET built into the
// frontend bundle, and chose its own tier parameters. Both now happen here: the secret
// stays server-side, the tier comes from the user's plan, and AI analysis runs on the
// user's own key (RankCLI's keys are never a fallback). The worker still enforces the
// per-plan domain and schedule limits itself.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resolveAIConfig } from '../_shared/resolve-ai-config.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WORKER_URL = Deno.env.get('AUDIT_WORKER_URL') || 'https://rankcli-audit-worker.fly.dev';
const WORKER_SECRET = Deno.env.get('AUDIT_WORKER_SECRET') || '';

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

// plan_id rows include billing variants (solo_annual, pro_founding, ...) that share
// their base tier's audit depth.
function baseTier(planId: string | undefined | null): 'free' | 'solo' | 'pro' | 'agency' {
  const base = (planId || '').replace(/_(annual|founding)$/, '');
  return base === 'solo' || base === 'pro' || base === 'agency' ? base : 'free';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!WORKER_SECRET) return json({ error: 'Audit worker not configured' }, 500);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: { user } } = token ? await supabase.auth.getUser(token) : { data: { user: null } };
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { projectId } = await req.json();
    if (!projectId) return json({ error: 'projectId required' }, 400);

    const { data: project } = await supabase
      .from('projects')
      .select('id, url')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!project) return json({ error: 'Project not found' }, 404);
    if (!project.url) return json({ error: 'Project has no URL' }, 400);

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status, plan:subscription_plans (plan_id)')
      .eq('user_id', user.id)
      .maybeSingle();
    const plan = subscription?.plan as { plan_id: string } | null;
    // past_due is Stripe's retry window; a paying customer keeps their tier through it.
    const tier = ['active', 'trialing', 'past_due'].includes(subscription?.status ?? '')
      ? baseTier(plan?.plan_id)
      : 'free';
    const isPaid = tier !== 'free';

    // AI analysis is a paid-tier feature, and it runs on the user's own key.
    const ai = isPaid ? await resolveAIConfig(supabase, user.id) : null;
    const aiConfig = ai?.ok ? ai.config : undefined;

    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        project_id: project.id,
        triggered_by: 'manual',
        triggered_by_user: user.id,
        status: 'pending',
      })
      .select()
      .single();
    if (auditError || !audit) throw auditError || new Error('Could not create audit');

    const workerResponse = await fetch(`${WORKER_URL}/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKER_SECRET}`,
      },
      body: JSON.stringify({
        auditId: audit.id,
        projectId: project.id,
        url: project.url,
        ...(isPaid
          ? { maxPages: 10, checksLimit: 280, enableAI: !!aiConfig, aiConfig }
          : { maxPages: 1, checksLimit: 50, enableAI: false }),
      }),
    });

    if (!workerResponse.ok) {
      const detail = await workerResponse.text().catch(() => '');
      console.error('Audit worker rejected job:', workerResponse.status, detail);
      await supabase
        .from('audits')
        .update({ status: 'failed', error_message: `Audit worker error (${workerResponse.status})` })
        .eq('id', audit.id);
      return json({ error: 'Could not start the audit', audit: { ...audit, status: 'failed' } }, 502);
    }

    // The worker runs on several machines; the dashboard streams progress from the one
    // running this audit by passing its id as /stream/:auditId?instance=.
    const { instance } = await workerResponse.json().catch(() => ({} as { instance?: string }));

    return json({
      audit,
      workerInstance: instance || null,
      aiAnalysis: isPaid ? (aiConfig ? 'enabled' : 'no_key') : 'plan',
    });
  } catch (error) {
    console.error('start-deep-audit error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
