// Pulls Google Search Console data into seo_metrics (source 'gsc') for projects that have a
// connected property:
//   - one 'daily' row per day for the last 28 days of data (clicks, impressions, CTR, position);
//   - one 'monthly' row: the rolling 28-day summary with top queries and pages (only the latest
//     is kept).
// Called daily by .github/workflows/sync-search-console.yml with CRON_SECRET (every connected
// project on a plan with Search Console, at most once a day each), or by a project's owner
// ("Sync now", { project_id }).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { identifyCaller } from '../_shared/caller-auth.ts';
import { getEntitlement } from '../_shared/tier.ts';
import {
  WINDOW_DAYS,
  accessTokenFor,
  dateWindow,
  googleConfig,
  searchAnalytics,
  totals,
  type GoogleConfig,
} from '../_shared/gsc.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Plans with Search Console (pricing-tiers.json: features.gsc_integration).
const GSC_TIERS = new Set(['solo', 'pro', 'agency']);
// Search Console updates once a day; a scheduled run skips projects synced more recently.
const MIN_HOURS_BETWEEN_SYNCS = 20;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// deno-lint-ignore no-explicit-any
type Db = any;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const db = createClient(supabaseUrl, supabaseServiceKey);
  const config = googleConfig();
  if (!config) return json({ error: 'Search Console is not configured on this server' }, 503);

  try {
    const caller = await identifyCaller(req, db, supabaseServiceKey, { allowCron: true });
    if (!caller) return json({ error: 'Unauthorized' }, 401);
    const body = await req.json().catch(() => ({})) as { project_id?: string };

    if (caller.kind === 'user') {
      const { data: project } = await db.from('projects').select('id').eq('id', body.project_id ?? '').eq('user_id', caller.userId).maybeSingle();
      if (!project) return json({ error: 'Project not found' }, 404);
      if (!GSC_TIERS.has((await getEntitlement(db, caller.userId)).tier)) {
        return json({ error: 'Search Console is part of the Solo, Pro and Agency plans', code: 'plan_required' }, 402);
      }
      const result = await syncProject(db, config, project.id);
      return json(result, result.success ? 200 : 502);
    }

    return json(await syncAllDue(db, config));
  } catch (error) {
    console.error('sync-gsc-metrics error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

async function syncAllDue(db: Db, config: GoogleConfig) {
  const { data: connections, error } = await db.from('oauth_connections')
    .select('project_id, user_id')
    .eq('provider', 'google')
    .not('project_id', 'is', null)
    .not('site_url', 'is', null);
  if (error) throw error;

  const tiers = new Map<string, string>();
  const results = [];
  let skipped = 0;
  for (const { project_id, user_id } of connections ?? []) {
    if (!tiers.has(user_id)) tiers.set(user_id, (await getEntitlement(db, user_id)).tier);
    if (!GSC_TIERS.has(tiers.get(user_id)!)) {
      skipped++;
      continue;
    }
    const { data: last } = await db.from('sync_jobs').select('started_at')
      .eq('project_id', project_id).eq('job_type', 'gsc_sync').eq('status', 'completed')
      .order('started_at', { ascending: false }).limit(1).maybeSingle();
    if (last && Date.now() - new Date(last.started_at).getTime() < MIN_HOURS_BETWEEN_SYNCS * 3_600_000) {
      skipped++;
      continue;
    }
    const result = await syncProject(db, config, project_id);
    results.push({ projectId: project_id, success: result.success, error: result.success ? undefined : result.error });
  }
  return {
    connected: connections?.length ?? 0,
    synced: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    skipped,
    results,
  };
}

async function syncProject(db: Db, config: GoogleConfig, projectId: string): Promise<{ success: true; clicks: number; impressions: number } | { success: false; error: string }> {
  const { data: connection } = await db.from('oauth_connections').select('*')
    .eq('project_id', projectId).eq('provider', 'google').maybeSingle();
  if (!connection?.site_url) return { success: false, error: 'No Search Console property is selected for this project' };

  const { data: job } = await db.from('sync_jobs').insert({
    project_id: projectId,
    job_type: 'gsc_sync',
    status: 'running',
    started_at: new Date().toISOString(),
  }).select('id').single();

  try {
    const token = await accessTokenFor(db, connection, config);
    const window = dateWindow(WINDOW_DAYS);
    const [byDate, byQuery, byPage] = await Promise.all([
      searchAnalytics(token, connection.site_url, { ...window, dimensions: ['date'] }),
      searchAnalytics(token, connection.site_url, { ...window, dimensions: ['query'], rowLimit: 50 }),
      searchAnalytics(token, connection.site_url, { ...window, dimensions: ['page'], rowLimit: 25 }),
    ]);

    // One row per day (idempotent on project, date, period type, source).
    if (byDate.length > 0) {
      const { error } = await db.from('seo_metrics').upsert(byDate.map((row) => ({
        project_id: projectId,
        period_start: row.keys![0],
        period_end: row.keys![0],
        period_type: 'daily',
        source: 'gsc',
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        avg_position: row.position,
      })), { onConflict: 'project_id,period_start,period_type,source' });
      if (error) throw new Error(`Saving daily metrics failed: ${error.message}`);
    }

    // The rolling 28-day summary; only the latest one is kept.
    const sum = totals(byDate);
    await db.from('seo_metrics').delete().eq('project_id', projectId).eq('source', 'gsc').eq('period_type', 'monthly');
    const { error: summaryError } = await db.from('seo_metrics').insert({
      project_id: projectId,
      period_start: window.startDate,
      period_end: window.endDate,
      period_type: 'monthly',
      source: 'gsc',
      clicks: sum.clicks,
      impressions: sum.impressions,
      ctr: sum.ctr,
      avg_position: sum.position,
      top_queries: byQuery.map((r) => ({ query: r.keys![0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
      top_pages: byPage.map((r) => ({ page: r.keys![0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    });
    if (summaryError) throw new Error(`Saving the summary failed: ${summaryError.message}`);

    if (job) {
      await db.from('sync_jobs').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        metrics_synced: byDate.length,
        keywords_checked: byQuery.length,
      }).eq('id', job.id);
    }
    return { success: true, clicks: sum.clicks, impressions: sum.impressions };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Search Console sync failed for ${projectId}:`, message);
    if (job) {
      await db.from('sync_jobs').update({ status: 'failed', completed_at: new Date().toISOString(), error_message: message }).eq('id', job.id);
    }
    return { success: false, error: message };
  }
}
