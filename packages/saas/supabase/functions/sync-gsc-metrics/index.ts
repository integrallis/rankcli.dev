/**
 * GSC Metrics Sync Edge Function
 *
 * Syncs Google Search Console metrics for all connected projects.
 * Called by cron job with frequency based on tier:
 * - Solo: Weekly
 * - Pro: Daily
 * - Agency: Hourly
 *
 * Also supports manual sync via POST request.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { identifyCaller } from '../_shared/caller-auth.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

// Tier-based sync configurations
const SYNC_CONFIG = {
  free: { enabled: false, intervalHours: 0 },
  solo: { enabled: true, intervalHours: 168 }, // Weekly
  pro: { enabled: true, intervalHours: 24 },   // Daily
  agency: { enabled: true, intervalHours: 1 }, // Hourly
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Scheduled runs authenticate with the service key or CRON_SECRET. A
    // signed-in user may sync only a project they own - the response carries
    // that project's Search Console data.
    const caller = await identifyCaller(req, supabase, supabaseServiceKey, { allowCron: true });
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if this is a manual sync for a specific project
    const body = await req.json().catch(() => ({}));
    const projectId = body.project_id;
    const forceSync = body.force === true;

    if (caller.kind === 'user') {
      if (!projectId) {
        return new Response(JSON.stringify({ error: 'project_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: owned } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', caller.userId)
        .maybeSingle();
      if (!owned) {
        return new Response(JSON.stringify({ error: 'Project not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (projectId) {
      // Manual sync for specific project
      const result = await syncProjectMetrics(supabase, projectId, forceSync);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Scheduled sync - find all projects due for sync
    const results = await syncAllDueProjects(supabase);

    return new Response(JSON.stringify({
      synced: results.synced,
      failed: results.failed,
      skipped: results.skipped,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Sync failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Sync all projects that are due for sync based on their tier
 */
async function syncAllDueProjects(supabase: SupabaseClient): Promise<{
  synced: number;
  failed: number;
  skipped: number;
}> {
  // Get all projects with GSC connected and their tier info
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      url,
      user_id,
      users!inner (
        subscription_tier
      ),
      oauth_connections!inner (
        id,
        access_token,
        refresh_token,
        token_expires_at,
        site_url
      )
    `)
    .eq('oauth_connections.provider', 'google')
    .not('oauth_connections.site_url', 'is', null);

  if (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }

  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const project of projects || []) {
    const tier = (project.users as any)?.subscription_tier || 'free';
    const config = SYNC_CONFIG[tier as keyof typeof SYNC_CONFIG] || SYNC_CONFIG.free;

    if (!config.enabled) {
      skipped++;
      continue;
    }

    // Check if sync is due
    const { data: lastSync } = await supabase
      .from('sync_jobs')
      .select('completed_at')
      .eq('project_id', project.id)
      .eq('job_type', 'gsc_sync')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (lastSync) {
      const hoursSinceLastSync = (Date.now() - new Date(lastSync.completed_at).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSync < config.intervalHours) {
        skipped++;
        continue;
      }
    }

    try {
      await syncProjectMetrics(supabase, project.id, false);
      synced++;
    } catch (e) {
      console.error(`Failed to sync project ${project.id}:`, e);
      failed++;
    }
  }

  return { synced, failed, skipped };
}

/**
 * Sync metrics for a specific project
 */
async function syncProjectMetrics(
  supabase: SupabaseClient,
  projectId: string,
  force: boolean
): Promise<{ success: boolean; metrics?: any; error?: string }> {
  // Get project with OAuth connection
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      id,
      url,
      user_id,
      oauth_connections (
        id,
        access_token,
        refresh_token,
        token_expires_at,
        site_url
      )
    `)
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    return { success: false, error: 'Project not found' };
  }

  const connection = (project.oauth_connections as any[])?.[0];
  if (!connection?.site_url) {
    return { success: false, error: 'No GSC connection found' };
  }

  // Create sync job
  const { data: job, error: jobError } = await supabase
    .from('sync_jobs')
    .insert({
      project_id: projectId,
      job_type: 'gsc_sync',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (jobError) {
    console.error('Failed to create sync job:', jobError);
  }

  try {
    // Refresh token if needed
    let accessToken = connection.access_token;
    if (new Date(connection.token_expires_at) < new Date()) {
      const refreshed = await refreshAccessToken(connection.refresh_token);
      if (!refreshed) {
        throw new Error('Failed to refresh access token');
      }
      accessToken = refreshed.access_token;

      // Update token in database
      await supabase
        .from('oauth_connections')
        .update({
          access_token: refreshed.access_token,
          token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        })
        .eq('id', connection.id);
    }

    // Fetch metrics from GSC API
    const metrics = await fetchGSCMetrics(accessToken, connection.site_url);

    // Store metrics
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 7); // Last 7 days
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() - 1); // Yesterday (GSC data has 2-day lag)

    await supabase.from('seo_metrics').upsert({
      project_id: projectId,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      period_type: 'weekly',
      source: 'gsc',
      impressions: metrics.totals.impressions,
      clicks: metrics.totals.clicks,
      ctr: metrics.totals.ctr,
      avg_position: metrics.totals.position,
      top_queries: metrics.topQueries,
      top_pages: metrics.topPages,
    }, {
      onConflict: 'project_id,period_start,period_type,source',
    });

    // Store individual keyword rankings
    for (const query of metrics.topQueries.slice(0, 100)) {
      await supabase.from('keyword_rankings').upsert({
        project_id: projectId,
        keyword: query.query,
        search_engine: 'google',
        device: 'all',
        location: 'global',
        current_position: Math.round(query.position),
        ranking_url: query.page,
        last_checked_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id,keyword,search_engine,device,location',
      });
    }

    // Update sync job
    if (job) {
      await supabase
        .from('sync_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metrics_synced: 1,
          keywords_checked: metrics.topQueries.length,
        })
        .eq('id', job.id);
    }

    return { success: true, metrics };

  } catch (error) {
    console.error('Sync failed:', error);

    // Update sync job with error
    if (job) {
      await supabase
        .from('sync_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', job.id);
    }

    return { success: false, error: error instanceof Error ? error.message : 'Sync failed' };
  }
}

/**
 * Fetch metrics from GSC Search Analytics API
 */
async function fetchGSCMetrics(accessToken: string, siteUrl: string): Promise<{
  totals: { impressions: number; clicks: number; ctr: number; position: number };
  topQueries: Array<{ query: string; impressions: number; clicks: number; ctr: number; position: number; page?: string }>;
  topPages: Array<{ page: string; impressions: number; clicks: number; ctr: number; position: number }>;
}> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2); // GSC has 2-day data lag
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  // Fetch query-level data
  const queryResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query', 'page'],
        rowLimit: 100,
      }),
    }
  );

  if (!queryResponse.ok) {
    const errorText = await queryResponse.text();
    console.error('GSC API error:', errorText);
    throw new Error(`GSC API error: ${queryResponse.status}`);
  }

  const queryData = await queryResponse.json();

  // Fetch page-level data
  const pageResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page'],
        rowLimit: 50,
      }),
    }
  );

  const pageData = await pageResponse.json();

  // Calculate totals
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalPositionSum = 0;
  let rowCount = 0;

  const topQueries: Array<{ query: string; impressions: number; clicks: number; ctr: number; position: number; page?: string }> = [];

  for (const row of queryData.rows || []) {
    totalImpressions += row.impressions;
    totalClicks += row.clicks;
    totalPositionSum += row.position * row.impressions; // Weighted by impressions
    rowCount++;

    topQueries.push({
      query: row.keys[0],
      page: row.keys[1],
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
    });
  }

  const topPages: Array<{ page: string; impressions: number; clicks: number; ctr: number; position: number }> = [];

  for (const row of pageData.rows || []) {
    topPages.push({
      page: row.keys[0],
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
    });
  }

  return {
    totals: {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: totalClicks / (totalImpressions || 1),
      position: totalImpressions > 0 ? totalPositionSum / totalImpressions : 0,
    },
    topQueries,
    topPages,
  };
}

/**
 * Refresh access token
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}
