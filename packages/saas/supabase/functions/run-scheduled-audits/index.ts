// The plans' automatic audits. Solo has sold "weekly automated audits" and Pro "daily" since
// launch, but nothing ever scheduled one - every audit in the database was started by hand, a
// CLI sync or a GitHub push. .github/workflows/scheduled-audits.yml calls this hourly with
// CRON_SECRET; each run starts a deep audit for every active project whose last audit is older
// than its plan's cadence, oldest first, up to MAX_PER_RUN. The worker's completion then feeds
// score-drop alerts (project-alerts) and the weekly report - scheduled audits send no
// per-audit email.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { identifyCaller } from '../_shared/caller-auth.ts';
import { getEntitlement, type BaseTier } from '../_shared/tier.ts';
import { dispatchDeepAudit } from '../_shared/deep-audit.ts';
import { assertPublicUrl } from '../_shared/url-guard.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const HOUR = 60 * 60 * 1000;
// pricing-tiers.json: Free and Solo weekly, Pro and Agency daily.
export const CADENCE_MS: Record<BaseTier, number> = {
  free: 7 * 24 * HOUR,
  solo: 7 * 24 * HOUR,
  pro: 24 * HOUR,
  agency: 24 * HOUR,
};
// The worker handles a handful of deep audits at once; a backlog drains over later runs.
const MAX_PER_RUN = 20;
// The worker times a deep audit out after 5 minutes, so one still pending or running after 30
// died with its machine (a deploy, a crash). It's marked failed as interrupted, and doesn't
// count against the cadence - the next run retries it.
const STUCK_AFTER_MS = 30 * 60 * 1000;
const INTERRUPTED = 'Audit interrupted before it finished (the worker restarted). It will be retried.';
// A real failure (site down, blocked, ...) is retried after this, not every hour.
const FAILURE_BACKOFF_MS = 6 * HOUR;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const caller = await identifyCaller(req, supabase, supabaseServiceKey, { allowCron: true });
    if (caller?.kind !== 'cron' && caller?.kind !== 'service') return json({ error: 'Unauthorized' }, 401);
    const dryRun = new URL(req.url).searchParams.get('dry_run') === 'true';

    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, url, user_id')
      .eq('is_active', true)
      .not('url', 'is', null);
    if (error) throw error;

    const now = Date.now();

    if (!dryRun) {
      await supabase
        .from('audits')
        .update({ status: 'failed', error_message: INTERRUPTED, completed_at: new Date(now).toISOString() })
        .in('status', ['pending', 'running'])
        .lt('created_at', new Date(now - STUCK_AFTER_MS).toISOString());
    }

    const tiers = new Map<string, BaseTier>();
    const due: { project: { id: string; url: string; user_id: string }; lastAt: number; tier: BaseTier }[] = [];
    let busy = 0;
    let localOnly = 0;

    for (const project of projects || []) {
      // Projects synced from the CLI against a dev server (http://localhost:3010, ...) can only
      // be audited on that machine; the hosted worker refuses private addresses. Skip them
      // instead of writing a failed audit every cycle.
      try {
        await assertPublicUrl(project.url);
      } catch {
        localOnly++;
        continue;
      }

      if (!tiers.has(project.user_id)) tiers.set(project.user_id, (await getEntitlement(supabase, project.user_id)).tier);
      const tier = tiers.get(project.user_id)!;

      const { data: recent } = await supabase
        .from('audits')
        .select('status, created_at, error_message')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(10);
      const audits = recent || [];
      const at = (a: { created_at: string }) => new Date(a.created_at).getTime();

      if (audits.some((a) => (a.status === 'pending' || a.status === 'running') && now - at(a) < STUCK_AFTER_MS)) {
        busy++;
        continue;
      }
      const lastFailure = audits.find((a) => a.status === 'failed' && a.error_message !== INTERRUPTED);
      if (lastFailure && now - at(lastFailure) < FAILURE_BACKOFF_MS) continue;

      // The cadence counts from the last audit that finished; interrupted ones don't count.
      const lastCompleted = audits.find((a) => a.status === 'completed');
      const lastAt = lastCompleted ? at(lastCompleted) : 0;
      if (now - lastAt >= CADENCE_MS[tier]) due.push({ project, lastAt, tier });
    }

    due.sort((a, b) => a.lastAt - b.lastAt);
    const batch = due.slice(0, MAX_PER_RUN);

    const results = [];
    for (const { project, tier } of batch) {
      if (dryRun) {
        results.push({ projectId: project.id, tier, dispatched: false, dryRun: true });
        continue;
      }
      const result = await dispatchDeepAudit(supabase, { project, triggeredBy: 'scheduled' });
      results.push({ projectId: project.id, tier, dispatched: result.ok, error: result.ok ? undefined : result.error });
    }

    return json({
      projects: projects?.length ?? 0,
      due: due.length,
      inProgress: busy,
      localOnly,
      dispatched: results.filter((r) => r.dispatched).length,
      deferred: Math.max(0, due.length - batch.length),
      dryRun,
      results,
    });
  } catch (error) {
    console.error('run-scheduled-audits error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
