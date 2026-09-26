import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getEntitlement } from '../_shared/tier.ts';

// The CLI's syncToCloud() used to write directly to projects/audits/audit_issues
// via the client SDK, scoped by RLS (user_id = auth.uid()). That only ever
// worked for the opt-in email/password login path, which stores a real
// Supabase session - the DEFAULT login path (rankcli login's browser
// device-flow, and MCP's rankcli_connect) stores an API key instead, which
// carries no JWT/auth.uid() at all. Every API-key-authenticated user (the
// majority, since it's the default) has had cloud sync silently no-op via
// getAuthenticatedClient() returning null, for every audit, ever.
//
// This function resolves the caller from either credential type itself,
// server-side, then does the same project/audit/issues writes with the
// service role - so both auth modes work identically, and there's exactly
// one place this logic lives, instead of one client-side path that only
// covered one of the two.
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface AuditIssuePayload {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  category: string;
  title: string;
  description?: string;
  impact?: string;
  howToFix?: string;
  affectedUrls?: string[];
  details?: Record<string, unknown>;
}

interface SyncAuditBody {
  url: string;
  issues: AuditIssuePayload[];
  pagesAudited: number;
  checksRun: number;
  durationMs: number;
  healthScores: {
    overall: number;
    crawlability: number;
    onPage: number;
    content: number;
    performance: number;
    security: number;
    localSeo: number;
    aiReadiness: number;
  };
  aiAnalysis?: Record<string, unknown> | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Resolve the calling user from either credential type.
    let userId: string | null = null;
    let sitesLimit = 1;

    const apiKeyHeader = req.headers.get('X-API-Key');
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (apiKeyHeader?.startsWith('rankcli_')) {
      const keyHash = await hashKey(apiKeyHeader);
      const { data: keyData } = await supabase
        .from('api_keys')
        .select('user_id')
        .eq('key_hash', keyHash)
        .is('revoked_at', null)
        .single();

      if (!keyData) {
        return new Response(JSON.stringify({ error: 'Invalid or revoked API key' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      userId = keyData.user_id;
    } else if (authHeader) {
      const { data: userData } = await supabase.auth.getUser(authHeader);
      if (!userData.user) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      userId = userData.user.id;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Lifetime-deal buyers have no plan row and got 1 site here; a lapsed subscription kept
    // its plan's limit. The projects trigger enforces the same limit.
    sitesLimit = (await getEntitlement(supabase, userId)).limits.sites;

    const body: SyncAuditBody = await req.json();
    const parsedUrl = new URL(body.url);
    const domain = parsedUrl.port ? `${parsedUrl.hostname}:${parsedUrl.port}` : parsedUrl.hostname;

    const { data: existingProject } = await supabase
      .from('projects')
      // github_repo_url so the CLI can tell whether this project already has a repository:
      // standing in a git checkout, it offers to link the one it can see, and it needs to
      // know not to ask when the answer is already recorded.
      .select('id, github_repo_url')
      .eq('user_id', userId)
      .eq('domain', domain)
      .eq('is_active', true)
      .single();

    let projectId: string;

    if (existingProject) {
      projectId = existingProject.id;
    } else {
      const { count } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (count !== null && count >= sitesLimit) {
        return new Response(JSON.stringify({
          error: 'project_limit_reached',
          limit: sitesLimit,
          count,
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({ user_id: userId, name: domain, url: body.url, domain })
        .select('id')
        .single();

      if (projectError?.hint === 'site_limit_reached') {
        return new Response(JSON.stringify({
          error: 'project_limit_reached',
          limit: sitesLimit,
          message: projectError.message,
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (projectError || !newProject) {
        console.error('Failed to create project:', projectError?.message);
        return new Response(JSON.stringify({ error: 'Failed to create project' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      projectId = newProject.id;
    }

    const now = new Date().toISOString();
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        project_id: projectId,
        triggered_by: 'cli',
        triggered_by_user: userId,
        status: 'completed',
        score: body.healthScores.overall,
        pages_crawled: body.pagesAudited,
        issues_found: body.issues.length,
        checks_run: body.checksRun,
        health_scores: body.healthScores,
        started_at: new Date(Date.now() - body.durationMs).toISOString(),
        completed_at: now,
        duration_ms: body.durationMs,
        summary: {
          errors: body.issues.filter((i) => i.severity === 'error').length,
          warnings: body.issues.filter((i) => i.severity === 'warning').length,
          notices: body.issues.filter((i) => i.severity === 'notice').length,
          pagesAudited: body.pagesAudited,
          checksRun: body.checksRun,
          source: 'cli',
        },
        ai_analysis: body.aiAnalysis ?? null,
      })
      .select('id')
      .single();

    if (auditError || !audit) {
      console.error('Failed to save audit:', auditError?.message);
      return new Response(JSON.stringify({ error: 'Failed to save audit' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (body.issues.length > 0) {
      const issueRecords = body.issues.map((issue) => ({
        audit_id: audit.id,
        project_id: projectId,
        code: issue.code,
        severity: issue.severity,
        category: issue.category,
        title: issue.title,
        description: issue.description || '',
        impact: issue.impact || '',
        how_to_fix: issue.howToFix || '',
        affected_urls: issue.affectedUrls || [],
        details: issue.details || {},
        status: 'open',
      }));
      await supabase.from('audit_issues').insert(issueRecords);
    }

    await supabase
      .from('projects')
      .update({
        last_audit_at: now,
        last_audit_score: body.healthScores.overall,
        last_scheduled_audit_at: now,
        scheduled_audit_source: 'cli',
      })
      .eq('id', projectId);

    return new Response(JSON.stringify({
      projectId,
      auditId: audit.id,
      // false for a project just created by this call, which has no repository yet.
      githubLinked: !!existingProject?.github_repo_url,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('sync-audit error:', error);
    return new Response(JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
