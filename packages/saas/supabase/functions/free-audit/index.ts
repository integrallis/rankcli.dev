import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { clientIp, hashIP } from '../_shared/client-ip.ts';
import { assertPublicUrl } from '../_shared/url-guard.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Use Fly.io worker for audits (Edge Functions have resource limits)
const WORKER_URL = Deno.env.get('AUDIT_WORKER_URL') || 'https://rankcli-audit-worker.fly.dev';
const WORKER_SECRET = Deno.env.get('AUDIT_WORKER_SECRET') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 10 requests per IP per hour
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Free tier limits - show a subset of issues to encourage signup
const FREE_TIER_MAX_ISSUES = 10;

interface FreeAuditIssue {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  title: string;
  category: string;
  description?: string;
}

interface WorkerAuditResponse {
  score?: number;
  issues?: Array<{
    code: string;
    severity: string;
    title: string;
    category: string;
    description?: string;
  }>;
  healthScore?: {
    overall: number;
    crawlability: number;
    onPage: number;
    content: number;
    performance: number;
    security: number;
    social: number;
    aiReadiness: number;
  };
  summary?: {
    passed: number;
    errors: number;
    warnings: number;
  };
  title?: string;
  description?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, email } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and normalize URL
    let targetUrl: string;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      targetUrl = parsed.toString();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // The worker enforces this on every connection too; checking here gives
    // a clear 400 instead of an audit full of fetch errors.
    try {
      await assertPublicUrl(targetUrl);
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get IP for rate limiting
    const ipHash = await hashIP(clientIp(req));

    // Check rate limit
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const oneHourAgo = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    let rateLimitCount = 0;
    try {
      const { count, error: rateLimitError } = await supabase
        .from('free_audits')
        .select('*', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', oneHourAgo);

      if (rateLimitError) {
        console.warn('Rate limit check failed (continuing anyway):', rateLimitError.message);
      } else {
        rateLimitCount = count || 0;
      }
    } catch (rateLimitErr) {
      console.warn('Rate limit check exception (continuing anyway):', rateLimitErr.message);
    }

    if (rateLimitCount >= RATE_LIMIT) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Sign up for unlimited audits.',
        retryAfter: RATE_WINDOW_MS,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== CALL FLY.IO WORKER FOR AUDIT ==========
    console.log(`Running free audit via worker on ${targetUrl}...`);

    let allIssues: FreeAuditIssue[] = [];
    let score = 85;
    let pageTitle: string | undefined;
    let pageDescription: string | undefined;
    let healthScore = {
      overall: 85,
      crawlability: 100,
      onPage: 100,
      content: 100,
      performance: 100,
      security: 100,
      social: 100,
      aiReadiness: 100,
    };
    let totalChecksRun = 280;

    try {
      // Call the Fly.io worker with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

      const workerResponse = await fetch(`${WORKER_URL}/audit/quick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WORKER_SECRET}`,
        },
        body: JSON.stringify({
          url: targetUrl,
          maxPages: 1,
          checksLimit: 280,
          enableAI: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!workerResponse.ok) {
        const errorText = await workerResponse.text();
        console.error('Worker error response:', workerResponse.status, errorText);
        // Only the worker's own error message reaches the page, not the raw
        // response body.
        let message = 'the audit service could not complete this audit';
        try {
          const parsed = JSON.parse(errorText);
          if (typeof parsed?.error === 'string') message = parsed.error;
        } catch { /* not JSON */ }
        throw new Error(message);
      }

      const auditResult: WorkerAuditResponse = await workerResponse.json();
      
      if (auditResult.error) {
        throw new Error(auditResult.error);
      }

      // Extract issues
      if (auditResult.issues) {
        allIssues = auditResult.issues.map(issue => ({
          code: issue.code,
          severity: (issue.severity as 'error' | 'warning' | 'notice') || 'notice',
          title: issue.title,
          category: issue.category,
          description: issue.description,
        }));
      }

      // Extract scores
      if (auditResult.healthScore) {
        healthScore = auditResult.healthScore;
        score = healthScore.overall;
      } else if (auditResult.score !== undefined) {
        score = auditResult.score;
      }

      // Get checks run from summary
      if (auditResult.summary) {
        totalChecksRun = auditResult.summary.passed + auditResult.summary.errors + auditResult.summary.warnings;
      }

      pageTitle = auditResult.title;
      pageDescription = auditResult.description;

      console.log(`Audit complete: ${allIssues.length} issues found from ${totalChecksRun} checks`);

    } catch (err) {
      console.error('Worker audit error:', err.message);
      // If audit fails, add a fetch error
      allIssues.push({
        code: 'FETCH_ERROR',
        severity: 'error',
        title: `Failed to audit page: ${err.message}`,
        category: 'Crawlability',
      });
    }

    // Priority order for showing issues (most impactful first)
    const priorityOrder = ['error', 'warning', 'notice'];
    const sortedIssues = [...allIssues].sort((a, b) => {
      return priorityOrder.indexOf(a.severity) - priorityOrder.indexOf(b.severity);
    });

    // Limit issues shown for free tier
    const displayedIssues = sortedIssues.slice(0, FREE_TIER_MAX_ISSUES);
    const hiddenIssueCount = Math.max(0, allIssues.length - FREE_TIER_MAX_ISSUES);

    // Calculate category scores
    const categories = {
      crawlability: healthScore.crawlability,
      onPage: healthScore.onPage,
      content: healthScore.content,
      performance: healthScore.performance,
      security: healthScore.security,
      socialMeta: healthScore.social,
      aiReadiness: healthScore.aiReadiness,
    };

    // Summary counts from all issues
    const errors = allIssues.filter(i => i.severity === 'error').length;
    const warnings = allIssues.filter(i => i.severity === 'warning').length;
    const notices = allIssues.filter(i => i.severity === 'notice').length;

    // Save to database for lead tracking (non-blocking)
    const domain = new URL(targetUrl).hostname;
    let auditRecordId: string | null = null;
    try {
      const { data: inserted, error: insertError } = await supabase
        .from('free_audits')
        .insert({
          url: targetUrl,
          domain,
          score,
          // send-free-audit-report builds the emailed report from this row,
          // not from what the browser sends, so it needs the category scores
          // and check count too.
          issues_summary: {
            errors,
            warnings,
            notices,
            total: allIssues.length,
            displayed: displayedIssues.length,
            categories,
            checksRun: totalChecksRun,
          },
          top_issues: displayedIssues,
          email: email || null,
          ip_hash: ipHash,
          user_agent: req.headers.get('user-agent'),
          referrer: req.headers.get('referer'),
        })
        .select('id')
        .single();
      if (insertError) {
        console.warn('Failed to save audit result (non-blocking):', insertError.message);
      } else {
        auditRecordId = inserted.id;
      }
    } catch (saveErr) {
      console.warn('Exception saving audit result (non-blocking):', saveErr.message);
    }

    // Determine upsell message based on results
    let message: string;
    if (hiddenIssueCount > 0) {
      message = `Found ${allIssues.length} issues using ${totalChecksRun} checks. Sign up to see all issues and get detailed fix recommendations.`;
    } else if (allIssues.length > 0) {
      message = `Found ${allIssues.length} issues. Sign up to track improvements and get auto-fix PRs.`;
    } else {
      message = 'Great job! Sign up to monitor your site and track improvements over time.';
    }

    return new Response(JSON.stringify({
      score,
      issues: displayedIssues,
      categories,
      checksRun: totalChecksRun,
      totalChecks: totalChecksRun,
      totalIssues: allIssues.length,
      displayedIssues: displayedIssues.length,
      hiddenIssues: hiddenIssueCount,
      message,
      title: pageTitle,
      description: pageDescription,
      auditRecordId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // The stack and internal error text stay in the function logs; the
    // browser gets a generic message.
    console.error('Error running free audit:', error);
    return new Response(JSON.stringify({ error: 'Audit failed. Please try again in a moment.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
