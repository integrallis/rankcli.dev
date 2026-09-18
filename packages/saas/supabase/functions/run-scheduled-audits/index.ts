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
// An audit that never finished doesn't block the next one forever.
const STUCK_AFTER_MS = 2 * HOUR;

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
    const tiers = new Map<string, BaseTier>();
    const due: { project: { id: string; url: string; user_id: string }; lastAt: number; tier: BaseTier }[] = [];
    let busy = 0;

    for (const project of projects || []) {
      if (!tiers.has(project.user_id)) tiers.set(project.user_id, (await getEntitlement(supabase, project.user_id)).tier);
      const tier = tiers.get(project.user_id)!;

      const { data: last } = await supabase
        .from('audits')
        .select('status, created_at')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const lastAt = last ? new Date(last.created_at).getTime() : 0;

      if (last && (last.status === 'pending' || last.status === 'running') && now - lastAt < STUCK_AFTER_MS) {
        busy++;
        continue;
      }
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
