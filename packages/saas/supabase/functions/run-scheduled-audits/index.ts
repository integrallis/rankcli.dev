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
// The worker's shared CPUs run at a small baseline (~6% of a core) plus a burst balance. A
// 10-page deep audit is ~100 CPU-seconds, and the baseline earns ~225 an hour per machine, so
// 4 per run (about 2 per machine) is sustainable; 10 at once drained the balance and every audit
// on that machine then crawled (93% steal) - including the free audits people wait on. A
// backlog drains over later runs (hourly: ~96 audits a day).
const MAX_PER_RUN = 4;
// A deep audit runs for minutes and may first wait in its machine's queue, so one still pending
// or running after an hour died with its machine (a deploy, a crash). It's marked failed as
// interrupted, and doesn't count against the cadence - the next run retries it.
const STUCK_AFTER_MS = 60 * 60 * 1000;
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
    const params = new URL(req.url).searchParams;
    const dryRun = params.get('dry_run') === 'true';
    // Ops override for right after a worker restart, when every unfinished audit is known dead
    // (floor 5 minutes, so a live audit is never reclaimed).
    const stuckAfterMs = params.get('stuck_after_minutes')
      ? Math.max(5, Number(params.get('stuck_after_minutes')) || 60) * 60 * 1000
      : STUCK_AFTER_MS;

    // Ops: ?project_id= audits that one project now, whatever its cadence or failure backoff
    // (to check a fix against the site that failed).
    const onlyProject = params.get('project_id');

    let query = supabase
      .from('projects')
      .select('id, url, user_id')
      .eq('is_active', true)
      .not('url', 'is', null);
    if (onlyProject) query = query.eq('id', onlyProject);
    const { data: projects, error } = await query;
    if (error) throw error;

    const now = Date.now();

    if (!dryRun) {
      await supabase
        .from('audits')
        .update({ status: 'failed', error_message: INTERRUPTED, completed_at: new Date(now).toISOString() })
        .in('status', ['pending', 'running'])
        .lt('created_at', new Date(now - stuckAfterMs).toISOString());
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

      if (audits.some((a) => (a.status === 'pending' || a.status === 'running') && now - at(a) < stuckAfterMs)) {
        busy++;
        continue;
      }
      const lastFailure = audits.find((a) => a.status === 'failed' && a.error_message !== INTERRUPTED);
      if (!onlyProject && lastFailure && now - at(lastFailure) < FAILURE_BACKOFF_MS) continue;

      // The cadence counts from the last audit that finished; interrupted ones don't count.
      const lastCompleted = audits.find((a) => a.status === 'completed');
      const lastAt = lastCompleted ? at(lastCompleted) : 0;
      if (onlyProject || now - lastAt >= CADENCE_MS[tier]) due.push({ project, lastAt, tier });
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
