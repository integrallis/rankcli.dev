// Sends a project's Slack/Discord alerts (alert_configs, set up under Account > Notifications).
//
// Called server-side only, with the service role key:
//   { auditId }                                   - audit-worker and run-audit, when an audit
//                                                   finishes; fires `error` for a failed audit
//                                                   and `score_drop` against the previous one
//   { projectId, event: 'pr_created', prUrl, issuesFixed }            - create-seo-pr
//   { projectId, event: 'weekly_report', score, change, openIssues }  - send-weekly-report
// and, from a signed-in user (the settings form's "Send test" - a browser can't post to a
// Slack webhook itself, Slack sends no CORS headers):
//   { event: 'test', channel, webhookUrl }
//
// Which configs fire and what they say lives in _shared/alerts.ts (unit-tested). Alerts are a
// paid feature (Solo and up); a free project's configs are skipped, not errored.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { identifyCaller } from '../_shared/caller-auth.ts';
import { getEntitlement } from '../_shared/tier.ts';
import { configsFor, formatAlert, isAllowedWebhook, type AlertConfigRow, type AlertEvent } from '../_shared/alerts.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'https://rankcli.dev';
const ALERT_TIERS = new Set(['solo', 'pro', 'agency']);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const caller = await identifyCaller(req, supabase, supabaseServiceKey);
    const body = await req.json();

    if (body.event === 'test') {
      if (caller?.kind !== 'user') return json({ error: 'Unauthorized' }, 401);
      if (!isAllowedWebhook(body.channel, body.webhookUrl)) {
        return json({ error: 'Use a Slack (hooks.slack.com/services/...) or Discord (discord.com/api/webhooks/...) incoming webhook URL' }, 400);
      }
      const response = await fetch(body.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatAlert(body.channel, { kind: 'test', link: `${APP_URL}/account?tab=notifications` })),
        redirect: 'manual',
        signal: AbortSignal.timeout(10_000),
      }).catch(() => null);
      const { tier } = await getEntitlement(supabase, caller.userId);
      return json({
        sent: !!response?.ok,
        status: response?.status ?? null,
        // A working webhook still only receives real alerts on a paid plan.
        alertsActive: ALERT_TIERS.has(tier),
      });
    }

    if (caller?.kind !== 'service') return json({ error: 'Unauthorized' }, 401);

    let projectId: string | null = body.projectId ?? null;
    let event: AlertEvent | null = null;

    type AuditRow = { project_id: string; status: string; score: number | null; error_message: string | null; created_at: string };
    let audit: AuditRow | null = null;
    if (body.auditId) {
      const { data } = await supabase
        .from('audits')
        .select('project_id, status, score, error_message, created_at')
        .eq('id', body.auditId)
        .maybeSingle();
      if (!data) return json({ error: 'Audit not found' }, 404);
      audit = data as AuditRow;
      projectId = audit.project_id;
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id, user_id, name, domain')
      .eq('id', projectId)
      .maybeSingle();
    if (!project) return json({ error: 'Project not found' }, 404);

    const name = project.name || project.domain;
    const link = `${APP_URL}/dashboard/projects/${project.id}`;

    // Audit finished: failed -> error; completed below the previous completed audit -> drop.
    if (audit) {
      if (audit.status === 'failed') {
        event = { kind: 'error', project: name, error: audit.error_message || 'The audit failed.', link };
      } else if (audit.status === 'completed' && typeof audit.score === 'number') {
        const { data: previous } = await supabase
          .from('audits')
          .select('score')
          .eq('project_id', project.id)
          .eq('status', 'completed')
          .lt('created_at', audit.created_at)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (typeof previous?.score === 'number' && previous.score > audit.score) {
          event = { kind: 'score_drop', project: name, from: previous.score, to: audit.score, link };
        }
      }
    } else if (body.event === 'pr_created' && typeof body.prUrl === 'string') {
      event = { kind: 'pr_created', project: name, prUrl: body.prUrl, issuesFixed: Number(body.issuesFixed) || 0 };
    } else if (body.event === 'weekly_report') {
      event = {
        kind: 'weekly_report',
        project: name,
        score: typeof body.score === 'number' ? body.score : null,
        change: typeof body.change === 'number' ? body.change : null,
        openIssues: Number(body.openIssues) || 0,
        link,
      };
    } else {
      return json({ error: 'Unknown event' }, 400);
    }

    if (!event) return json({ sent: 0, reason: 'nothing to alert' });

    const { tier } = await getEntitlement(supabase, project.user_id);
    if (!ALERT_TIERS.has(tier)) return json({ sent: 0, reason: 'plan' });

    const { data: configs } = await supabase
      .from('alert_configs')
      .select('*')
      .eq('enabled', true)
      .or(`project_id.eq.${project.id},and(project_id.is.null,user_id.eq.${project.user_id})`);

    const targets = configsFor((configs || []) as AlertConfigRow[], event, { projectId: project.id, ownerId: project.user_id });
    const results = await Promise.all(targets.map(async (config) => {
      try {
        const response = await fetch(config.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formatAlert(config.channel, event!)),
          redirect: 'manual',
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) console.warn(`[project-alerts] ${config.channel} ${config.id}: HTTP ${response.status}`);
        return response.ok;
      } catch (err) {
        console.warn(`[project-alerts] ${config.channel} ${config.id}:`, err instanceof Error ? err.message : err);
        return false;
      }
    }));

    const sent = results.filter(Boolean).length;
    return json({ sent, failed: results.length - sent, event: event.kind });
  } catch (error) {
    console.error('project-alerts error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
