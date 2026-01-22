import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import the shared audit engine (280+ checks)
import { runFullAudit } from '../_shared/audit/index.ts';
import type { AuditReport, AuditIssue as EngineIssue } from '../_shared/audit/index.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 10 requests per IP per hour
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Free tier limits - show a subset of issues to encourage signup
const FREE_TIER_MAX_ISSUES = 10;
const FREE_TIER_CHECKS_SHOWN = 50;

interface FreeAuditIssue {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  title: string;
  category: string;
  description?: string;
}

// Convert engine issues to free audit format
function convertToFreeIssue(issue: EngineIssue): FreeAuditIssue {
  return {
    code: issue.code,
    severity: issue.severity,
    title: issue.title,
    category: issue.category,
    description: issue.description || undefined,
  };
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

    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('cf-connecting-ip') ||
               'unknown';
    const ipHash = await hashIP(ip);

    // Check rate limit
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const oneHourAgo = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from('free_audits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if (count && count >= RATE_LIMIT) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Sign up for unlimited audits.',
        retryAfter: RATE_WINDOW_MS,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== RUN FULL AUDIT ENGINE (280+ CHECKS) ==========
    console.log(`Running free audit on ${targetUrl}...`);

    let auditReport: AuditReport;
    let allIssues: FreeAuditIssue[] = [];

    try {
      // Call runFullAudit with options object (correct signature)
      auditReport = await runFullAudit({
        url: targetUrl,
        maxPages: 1,
      });

      // Convert all issues
      allIssues = auditReport.issues.map(convertToFreeIssue);

      // Get checks run from summary
      const checksFromSummary = auditReport.summary.passed + auditReport.summary.errors + auditReport.summary.warnings;
      console.log(`Audit complete: ${auditReport.issues.length} issues found from ${checksFromSummary} checks`);

    } catch (err) {
      // If audit fails, add a fetch error
      allIssues.push({
        code: 'FETCH_ERROR',
        severity: 'error',
        title: `Failed to fetch page: ${err.message}`,
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

    // Calculate category scores using engine's health scores
    const categories = {
      crawlability: auditReport?.healthScore?.crawlability ?? 100,
      onPage: auditReport?.healthScore?.onPage ?? 100,
      content: auditReport?.healthScore?.content ?? 100,
      performance: auditReport?.healthScore?.performance ?? 100,
      security: auditReport?.healthScore?.security ?? 100,
      socialMeta: auditReport?.healthScore?.social ?? 100,
      aiReadiness: auditReport?.healthScore?.aiReadiness ?? 100,
      mobile: 100, // Not in HealthScore interface
    };

    // Use overall score from engine
    const score = auditReport?.healthScore?.overall ?? 85;

    // Summary counts from all issues
    const errors = allIssues.filter(i => i.severity === 'error').length;
    const warnings = allIssues.filter(i => i.severity === 'warning').length;
    const notices = allIssues.filter(i => i.severity === 'notice').length;
    const totalChecksRun = auditReport?.summary
      ? auditReport.summary.passed + auditReport.summary.errors + auditReport.summary.warnings
      : 280;

    // Save to database for lead tracking
    const domain = new URL(targetUrl).hostname;
    await supabase.from('free_audits').insert({
      url: targetUrl,
      domain,
      score,
      issues_summary: {
        errors,
        warnings,
        notices,
        total: allIssues.length,
        displayed: displayedIssues.length,
      },
      top_issues: displayedIssues,
      email: email || null,
      ip_hash: ipHash,
      user_agent: req.headers.get('user-agent'),
      referrer: req.headers.get('referer'),
    });

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
      totalChecks: totalChecksRun, // Full engine check count
      totalIssues: allIssues.length,
      displayedIssues: displayedIssues.length,
      hiddenIssues: hiddenIssueCount,
      message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error running free audit:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + Deno.env.get('IP_SALT') || 'rankcli');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
