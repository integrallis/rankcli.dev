import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { identifyCaller } from '../_shared/caller-auth.ts';

// This was a referenced-but-never-implemented function: github-webhook/index.ts
// has always called POST /functions/v1/run-audit on every push/comment/
// workflow_run event, but no run-audit directory existed in the repo at all -
// the push -> audit -> auto-fix-PR chain broke here regardless of GitHub App
// secrets being configured. Delegates the actual audit to the same Fly.io
// worker /audit/quick endpoint free-audit/index.ts already uses (Edge
// Functions have resource limits; the worker doesn't) and writes results
// into audits/audit_issues using the exact column shape audit-worker's own
// /audit/deep completion handler already writes (see mapIssueToDb and the
// "Update audit record" block in packages/audit-worker/src/index.ts) -
// create-seo-pr/index.ts reads audit_issues in that same shape.

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const WORKER_URL = Deno.env.get('AUDIT_WORKER_URL') || 'https://rankcli-audit-worker.fly.dev';
const WORKER_SECRET = Deno.env.get('AUDIT_WORKER_SECRET') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkerIssue {
  code: string;
  severity: string;
  category: string;
  title: string;
  description?: string;
  impact?: string;
  howToFix?: string;
  affectedUrls?: string[];
  details?: unknown;
}

interface WorkerAuditResponse {
  score?: number;
  issues?: WorkerIssue[];
  healthScore?: {
    overall: number;
    crawlability: number;
    onPage: number;
    content: number;
    performance: number;
    security: number;
  };
  summary?: {
    passed: number;
    errors: number;
    warnings: number;
  };
  url?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // github-webhook calls this with the service key. A signed-in user may
    // also run an audit, but only on their own project (checked below).
    const caller = await identifyCaller(req, supabase, supabaseServiceKey);
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { auditId } = await req.json();
    if (!auditId) {
      return new Response(JSON.stringify({ error: 'auditId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: audit, error: auditLookupError } = await supabase
      .from('audits')
      .select('id, project_id')
      .eq('id', auditId)
      .single();

    if (auditLookupError || !audit) {
      return new Response(JSON.stringify({ error: 'Audit not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: project, error: projectLookupError } = await supabase
      .from('projects')
      .select('id, url, user_id')
      .eq('id', audit.project_id)
      .single();

    if (caller.kind === 'user' && project?.user_id !== caller.userId) {
      return new Response(JSON.stringify({ error: 'Audit not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (projectLookupError || !project?.url) {
      return new Response(JSON.stringify({ error: 'Project not found or missing URL' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    const workerResponse = await fetch(`${WORKER_URL}/audit/quick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WORKER_SECRET}`,
      },
      // maxPages: 1 (the worker forces this on /audit/quick regardless) -
      // push-triggered audits only need to prove/refresh the current state
      // fast enough to stay inside this function's own execution limits.
      body: JSON.stringify({ url: project.url, maxPages: 1, checksLimit: 280, enableAI: false }),
    });

    if (!workerResponse.ok) {
      const errText = await workerResponse.text();
      // audits has no dedicated error column - summary (jsonb) is the
      // closest existing place to record why a run failed.
      await supabase.from('audits').update({ status: 'failed', summary: { error: errText } }).eq('id', auditId);
      return new Response(JSON.stringify({ error: `Audit worker failed: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const report: WorkerAuditResponse = await workerResponse.json();
    const issues = report.issues || [];
    const duration = Date.now() - startTime;

    const overallScore = report.healthScore?.overall ?? report.score ?? 0;
    const checksRun = (report.summary?.passed || 0) + (report.summary?.errors || 0) + (report.summary?.warnings || 0);

    await supabase
      .from('audits')
      .update({
        status: 'completed',
        score: overallScore,
        pages_crawled: 1,
        issues_found: issues.length,
        checks_run: checksRun,
        health_scores: report.healthScore || null,
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        summary: {
          errors: issues.filter((i) => i.severity === 'error').length,
          warnings: issues.filter((i) => i.severity === 'warning').length,
          notices: issues.filter((i) => i.severity === 'notice').length,
          checksRun,
          pagesAudited: 1,
          aiAnalyzed: false,
          worker: 'fly.io',
        },
      })
      .eq('id', auditId);

    if (issues.length > 0) {
      const issueRecords = issues.map((issue) => ({
        audit_id: auditId,
        project_id: project.id,
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

    return new Response(
      JSON.stringify({
        success: true,
        auditId,
        score: overallScore,
        issuesFound: issues.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('run-audit error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
