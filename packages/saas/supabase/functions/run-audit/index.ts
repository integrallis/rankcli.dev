import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import the shared audit engine (280+ checks)
import { runFullAudit, formatReport, urlSafetyDatabase, discoverPagesFromLinks } from '../_shared/audit/index.ts';
import type { AuditReport, AuditIssue as EngineIssue } from '../_shared/audit/index.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

// Fly.io Audit Worker for deep audits (paid users)
const auditWorkerUrl = Deno.env.get('AUDIT_WORKER_URL') || '';
const auditWorkerSecret = Deno.env.get('AUDIT_WORKER_SECRET') || '';

// AI Analysis Types
interface AIContentAnalysis {
  overallScore: number;
  searchIntentMatch: number;
  contentDepth: 'shallow' | 'moderate' | 'comprehensive';
  keywordNaturalness: number;
  eeatSignals: {
    experience: string[];
    expertise: string[];
    authority: string[];
    trust: string[];
  };
  improvements: { priority: number; suggestion: string; impact: string }[];
  uniqueValue: string;
  missingTopics: string[];
  targetKeyword?: string;
}

interface AIMetaAnalysis {
  titleAnalysis: {
    effectiveness: number;
    clickPotential: number;
    suggestions: string[];
  };
  descriptionAnalysis: {
    effectiveness: number;
    suggestions: string[];
  };
  serpPrediction: {
    predictedCTR: number;
    improvements: string[];
  };
}

interface AIFixPrioritization {
  prioritizedIssues: {
    issueCode: string;
    impactScore: number;
    effortScore: number;
    roiScore: number;
    rationale: string;
  }[];
  fixBatches: {
    batch: number;
    theme: string;
    estimatedImpact: string;
    issueCodes: string[];
  }[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Flag to track if threat hashes have been loaded this session
let threatHashesLoaded = false;

/**
 * Load threat hashes from Supabase into the URL safety database
 * This only needs to be done once per function instance
 * Uses a small subset for performance - pattern detection handles the rest
 */
async function loadThreatHashes(supabase: ReturnType<typeof createClient>): Promise<number> {
  if (threatHashesLoaded && urlSafetyDatabase.isPopulated()) {
    return 0;
  }

  const startTime = Date.now();

  // Query only domain hashes (smaller set, more impactful)
  // URL hashes are too numerous - pattern detection handles most cases
  const { data: hashes, error } = await supabase
    .from('threat_hashes')
    .select('hash_prefix, hash_type')
    .eq('is_active', true)
    .eq('hash_type', 'domain')
    .limit(10000);

  if (error || !hashes || hashes.length === 0) {
    return 0;
  }

  const count = urlSafetyDatabase.loadHashPrefixes(hashes);
  threatHashesLoaded = true;

  console.log(`[AUDIT] Loaded ${count} domain hashes in ${Date.now() - startTime}ms`);
  return count;
}

// Database issue format
interface DbAuditIssue {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  category: string;
  title: string;
  description: string | null;
  impact: string | null;
  how_to_fix: string | null;
  affected_urls: string[];
  details: Record<string, unknown> | null;
}

interface HealthScores {
  crawlability: number;
  onPage: number;
  content: number;
  performance: number;
  security: number;
  socialMeta: number;
  aiReadiness: number;
  mobile: number;
}

// Convert engine issues to database format
function convertIssue(issue: EngineIssue): DbAuditIssue {
  return {
    code: issue.code,
    severity: issue.severity,
    category: issue.category,
    title: issue.title,
    description: issue.description || null,
    impact: issue.impact || null,
    how_to_fix: issue.howToFix || null,
    affected_urls: issue.affectedUrls || [],
    details: issue.details || null,
  };
}

/**
 * Fetch a URL and return HTML content
 */
async function fetchHtml(url: string, timeout: number = 10000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RankCLI-Bot/1.0 (+https://rankcli.dev/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`[AUDIT] Failed to fetch ${url}:`, error);
    return null;
  }
}

/**
 * Discover pages from route files when GitHub is connected
 */
async function discoverPagesFromRepo(
  supabase: ReturnType<typeof createClient>,
  project: { github_installation_id: number; github_repo_url: string; url: string; framework: string | null },
  maxPages: number
): Promise<string[]> {
  try {
    // Get installation token from Supabase
    const { data: installation, error } = await supabase
      .from('github_installations')
      .select('*')
      .eq('installation_id', project.github_installation_id)
      .single();

    if (error || !installation) {
      console.log('[AUDIT] No GitHub installation found, falling back to link crawling');
      return [];
    }

    // Parse repo URL to get owner/repo
    const repoMatch = project.github_repo_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) {
      console.log('[AUDIT] Invalid GitHub repo URL');
      return [];
    }

    const [, owner, repo] = repoMatch;

    // Get installation access token
    const tokenResponse = await fetch(`https://api.github.com/app/installations/${project.github_installation_id}/access_tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GITHUB_APP_JWT') || ''}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!tokenResponse.ok) {
      console.log('[AUDIT] Failed to get GitHub installation token');
      return [];
    }

    const { token } = await tokenResponse.json();

    // Get repository tree
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!treeResponse.ok) {
      console.log('[AUDIT] Failed to get repository tree');
      return [];
    }

    const { tree } = await treeResponse.json();
    const files = tree
      .filter((f: { type: string }) => f.type === 'blob')
      .map((f: { path: string }) => f.path);

    // Detect framework and discover routes
    const framework = project.framework || detectFrameworkFromFiles(files);
    const routes = discoverRoutesFromFiles(files, framework);

    // Convert static routes to URLs
    const baseUrl = project.url;
    const urls = routes
      .filter(r => r.type === 'static')
      .slice(0, maxPages)
      .map(r => {
        try {
          return new URL(r.path, baseUrl).href;
        } catch {
          return null;
        }
      })
      .filter((url): url is string => url !== null);

    console.log(`[AUDIT] Discovered ${urls.length} routes from repo (${framework})`);
    return urls;
  } catch (error) {
    console.error('[AUDIT] Route discovery failed:', error);
    return [];
  }
}

/**
 * Detect framework from file patterns
 */
function detectFrameworkFromFiles(files: string[]): string {
  // Check for Next.js (App Router)
  if (files.some(f => f.startsWith('app/') && f.endsWith('page.tsx'))) {
    return 'nextjs';
  }

  // Check for Next.js (Pages Router)
  if (files.some(f => f.startsWith('pages/') && f.endsWith('.tsx'))) {
    return 'nextjs';
  }

  // Check for Astro
  if (files.some(f => f.startsWith('src/pages/') && f.endsWith('.astro'))) {
    return 'astro';
  }

  // Check for SvelteKit
  if (files.some(f => f.includes('+page.svelte'))) {
    return 'sveltekit';
  }

  // Check for React with router files
  if (files.some(f => f.match(/routes?\.(tsx?|jsx?)$/))) {
    return 'react';
  }

  return 'unknown';
}

/**
 * Discover routes from file structure
 */
function discoverRoutesFromFiles(files: string[], framework: string): Array<{ path: string; type: 'static' | 'dynamic' }> {
  const routes: Array<{ path: string; type: 'static' | 'dynamic' }> = [];

  switch (framework) {
    case 'nextjs':
      for (const file of files) {
        // App Router: app/**/page.tsx
        const appMatch = file.match(/^app\/(.*)\/page\.(tsx?|jsx?)$/);
        if (appMatch) {
          let path = '/' + appMatch[1];
          path = path.replace(/\/\([^)]+\)/g, ''); // Remove route groups
          const isDynamic = path.includes('[');
          routes.push({ path, type: isDynamic ? 'dynamic' : 'static' });
          continue;
        }

        // App Router root
        if (file.match(/^app\/page\.(tsx?|jsx?)$/)) {
          routes.push({ path: '/', type: 'static' });
          continue;
        }

        // Pages Router
        const pagesMatch = file.match(/^pages\/(.+)\.(tsx?|jsx?)$/);
        if (pagesMatch) {
          const pagePath = pagesMatch[1];
          if (pagePath.startsWith('_') || pagePath.startsWith('api/')) continue;

          let path = '/' + pagePath;
          path = path.replace(/\/index$/, '');
          if (path === '') path = '/';

          const isDynamic = path.includes('[');
          routes.push({ path, type: isDynamic ? 'dynamic' : 'static' });
        }
      }
      break;

    case 'astro':
      for (const file of files) {
        const match = file.match(/^src\/pages\/(.+)\.(astro|md|mdx)$/);
        if (match) {
          let path = '/' + match[1];
          path = path.replace(/\/index$/, '');
          if (path === '') path = '/';

          const isDynamic = path.includes('[');
          routes.push({ path, type: isDynamic ? 'dynamic' : 'static' });
        }
      }
      break;

    case 'sveltekit':
      for (const file of files) {
        const match = file.match(/^src\/routes\/(.*)\/?\+page\.svelte$/);
        if (match) {
          let path = '/' + (match[1] || '');
          path = path.replace(/\/\([^)]+\)/g, '');
          path = path.replace(/\/+/g, '/');
          if (path === '') path = '/';

          const isDynamic = path.includes('[');
          routes.push({ path, type: isDynamic ? 'dynamic' : 'static' });
        }
      }
      break;
  }

  // Deduplicate by path
  const seen = new Set<string>();
  return routes.filter(r => {
    if (seen.has(r.path)) return false;
    seen.add(r.path);
    return true;
  });
}

/**
 * Merge issues from multiple page audits, aggregating affected_urls
 */
function mergeIssues(issueArrays: DbAuditIssue[][]): DbAuditIssue[] {
  const issueMap = new Map<string, DbAuditIssue>();

  for (const issues of issueArrays) {
    for (const issue of issues) {
      const existing = issueMap.get(issue.code);
      if (existing) {
        // Merge affected URLs
        const urls = new Set([...existing.affected_urls, ...issue.affected_urls]);
        existing.affected_urls = Array.from(urls);
      } else {
        issueMap.set(issue.code, { ...issue });
      }
    }
  }

  return Array.from(issueMap.values());
}

serve(async (req) => {
  console.log('[AUDIT] Function invoked at:', new Date().toISOString());

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let userId: string | null = null;

    // Check for user auth (optional for API key access)
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { projectId, auditId } = await req.json();

    if (!projectId && !auditId) {
      return new Response(JSON.stringify({ error: 'Project ID or Audit ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the project
    let project;
    let audit;

    if (auditId) {
      // Get audit and project
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .select('*, projects(*)')
        .eq('id', auditId)
        .single();

      if (auditError || !auditData) {
        return new Response(JSON.stringify({ error: 'Audit not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      audit = auditData;
      project = auditData.projects;
    } else {
      // Get project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        return new Response(JSON.stringify({ error: 'Project not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      project = projectData;

      // Create new audit record
      const { data: newAudit, error: createError } = await supabase
        .from('audits')
        .insert({
          project_id: projectId,
          triggered_by: 'api',
          triggered_by_user: userId,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create audit: ${createError.message}`);
      }

      audit = newAudit;
    }

    // Update audit status to running
    await supabase
      .from('audits')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', audit.id);

    const startTime = Date.now();
    const HARD_TIMEOUT = 40000; // 40 second hard limit (edge functions timeout at 45s)

    // Wrap entire audit in a hard timeout using Promise.race
    const runAuditWithTimeout = async (): Promise<Response> => {
      // ========== DETERMINE CHECK LIMIT BASED ON USER TIER ==========
      let checksLimit = 50; // Default for unauthenticated/free users

      if (userId) {
        // Check if user has a subscription
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('plan_id, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (subscription?.plan_id) {
          // Paid user - get limit from their plan
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('checks_limit')
            .eq('plan_id', subscription.plan_id)
            .single();

          checksLimit = plan?.checks_limit || 280;
        } else {
          // Registered but free user - gets 100 checks
          checksLimit = 100;
        }
      }

      console.log(`[AUDIT] User tier check limit: ${checksLimit}`);

      // ========== CHECK DOMAIN LIMIT (ANTI-GAMING) ==========
      if (userId) {
        // Get subscription details for billing cycle
        const { data: subDetails } = await supabase
          .from('user_subscriptions')
          .select('plan_id, current_period_start')
          .eq('user_id', userId)
          .single();

        // Determine domain limit and billing cycle start
        const planLimits: Record<string, number | null> = {
          'solo': 5,
          'pro': 15,
          'agency': null, // unlimited
        };
        const domainsPerMonth = subDetails?.plan_id
          ? (planLimits[subDetails.plan_id] ?? 5)
          : 2; // Free tier

        // Billing cycle: subscription start or rolling 30 days for free
        let billingCycleStart: string;
        if (subDetails?.current_period_start) {
          billingCycleStart = subDetails.current_period_start;
        } else {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          billingCycleStart = thirtyDaysAgo.toISOString();
        }

        // Check domain limit (null = unlimited)
        if (domainsPerMonth !== null) {
          // Get unique domains audited this billing cycle
          const { data: auditedDomains } = await supabase
            .from('audits')
            .select('projects!inner(domain)')
            .eq('projects.user_id', userId)
            .gte('created_at', billingCycleStart)
            .eq('status', 'completed');

          const uniqueDomains = new Set<string>();
          auditedDomains?.forEach((a: { projects: { domain: string } }) => {
            if (a.projects?.domain) uniqueDomains.add(a.projects.domain);
          });

          // Check if we're at limit and this is a new domain
          if (uniqueDomains.size >= domainsPerMonth && !uniqueDomains.has(project.domain)) {
            console.log(`[AUDIT] Domain limit reached: ${uniqueDomains.size}/${domainsPerMonth}`);

            // Mark audit as failed
            await supabase
              .from('audits')
              .update({
                status: 'failed',
                error_message: `Domain limit reached (${domainsPerMonth} domains per month)`,
                completed_at: new Date().toISOString()
              })
              .eq('id', audit.id);

            return new Response(JSON.stringify({
              error: `Domain limit reached. You can audit up to ${domainsPerMonth} unique domains per month. Upgrade your plan to audit more domains.`,
              code: 'DOMAIN_LIMIT_REACHED'
            }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          console.log(`[AUDIT] Domain check passed: ${uniqueDomains.size}/${domainsPerMonth} domains used`);
        }
      }

      // ========== DELEGATE TO FLY.IO WORKER FOR PAID USERS ==========
      // Paid users get deep audits (up to 20 pages, 5 min timeout) via Fly.io worker
      const isPaidUser = checksLimit >= 280;

      if (isPaidUser && auditWorkerUrl && auditWorkerSecret) {
        console.log('[AUDIT] Delegating to Fly.io worker for deep audit...');

        try {
          const workerResponse = await fetch(`${auditWorkerUrl}/audit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${auditWorkerSecret}`,
            },
            body: JSON.stringify({
              auditId: audit.id,
              projectId: project.id,
              url: project.url,
              maxPages: 10, // Deep audit with more pages
              checksLimit,
              enableAI: !!openaiApiKey,
            }),
          });

          if (workerResponse.ok) {
            const workerResult = await workerResponse.json();
            console.log(`[AUDIT] Delegated to worker, job ID: ${workerResult.jobId}`);

            // Return immediately - worker will update DB when done
            return new Response(JSON.stringify({
              success: true,
              auditId: audit.id,
              delegated: true,
              workerJobId: workerResult.jobId,
              message: 'Deep audit in progress. Results will appear shortly.',
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else {
            console.error(`[AUDIT] Worker delegation failed: ${workerResponse.status}`);
            // Fall through to edge function audit as fallback
          }
        } catch (workerError) {
          console.error('[AUDIT] Worker delegation error:', workerError);
          // Fall through to edge function audit as fallback
        }

        console.log('[AUDIT] Falling back to edge function audit...');
      }

      // ========== LOAD THREAT HASHES FOR URL SAFETY (with timeout) ==========
      const threatHashPromise = loadThreatHashes(supabase).catch(() => 0);
      const hashTimeoutPromise = new Promise<number>(resolve => setTimeout(() => resolve(0), 2000));
      await Promise.race([threatHashPromise, hashTimeoutPromise]);

      // ========== DISCOVER PAGES TO AUDIT ==========
      const maxPages = 3; // Reduced for speed - can increase later
      let pagesToAudit: string[] = [project.url]; // Always include homepage

      // Try to discover additional pages (with timeout)
      const discoveryStart = Date.now();
      const discoveryTimeout = 5000; // 5 seconds max for discovery

      try {
        if (project.github_installation_id && project.github_repo_url) {
          // Have repo access - use route discovery
          console.log('[AUDIT] Attempting route discovery from GitHub repo...');
          const repoPromise = discoverPagesFromRepo(supabase, project, maxPages - 1);
          const repoTimeoutPromise = new Promise<string[]>(resolve => setTimeout(() => resolve([]), discoveryTimeout));
          const repoPages = await Promise.race([repoPromise, repoTimeoutPromise]);
          if (repoPages.length > 0) {
            pagesToAudit = [project.url, ...repoPages.filter(p => p !== project.url)];
          }
        }

        // If no repo pages, fall back to link crawling
        if (pagesToAudit.length === 1) {
          console.log('[AUDIT] Fetching homepage to discover pages...');
          const homepageHtml = await fetchHtml(project.url, 5000); // Reduced timeout
          if (homepageHtml) {
            const discovered = discoverPagesFromLinks(project.url, homepageHtml, maxPages - 1);
            const additionalPages = discovered.map(p => p.url).filter(url => url !== project.url);
            pagesToAudit = [project.url, ...additionalPages];
            console.log(`[AUDIT] Discovered ${additionalPages.length} additional pages from links`);
          }
        }
      } catch (discoveryError) {
        console.error('[AUDIT] Page discovery failed, continuing with homepage only:', discoveryError);
      }

      console.log(`[AUDIT] Page discovery completed in ${Date.now() - discoveryStart}ms`);

      console.log(`[AUDIT] Will audit ${pagesToAudit.length} pages in PARALLEL:`, pagesToAudit);

      // ========== RUN AUDITS ON ALL PAGES IN PARALLEL ==========
      const perPageTimeout = 15000; // 15 seconds per page max

      const auditPage = async (pageUrl: string, index: number): Promise<{
        report: AuditReport | null;
        issues: DbAuditIssue[];
        checksRun: number;
        url: string;
      }> => {
        const startTime = Date.now();
        console.log(`[AUDIT] [Thread ${index}] Starting: ${pageUrl}`);

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), perPageTimeout);

          const pageReport = await runFullAudit({
            url: pageUrl,
            maxPages: 1,
            checksLimit,
          });

          clearTimeout(timeoutId);

          const pageIssues = pageReport.issues.map(convertIssue);
          const checksRun = pageReport.summary.passed + pageReport.summary.errors + pageReport.summary.warnings;

          console.log(`[AUDIT] [Thread ${index}] Complete in ${Date.now() - startTime}ms: ${pageUrl} (${pageIssues.length} issues)`);

          return { report: pageReport, issues: pageIssues, checksRun, url: pageUrl };
        } catch (error) {
          console.error(`[AUDIT] [Thread ${index}] Failed after ${Date.now() - startTime}ms: ${pageUrl}`, error);
          return { report: null, issues: [], checksRun: 0, url: pageUrl };
        }
      };

      // Run all page audits in parallel
      const parallelStart = Date.now();
      const auditResults = await Promise.allSettled(
        pagesToAudit.map((url, index) => auditPage(url, index))
      );
      console.log(`[AUDIT] All ${pagesToAudit.length} pages completed in ${Date.now() - parallelStart}ms (parallel)`);

      // Collect results
      const allIssues: DbAuditIssue[][] = [];
      let totalChecksRun = 0;
      let primaryReport: AuditReport | null = null;

      for (let i = 0; i < auditResults.length; i++) {
        const result = auditResults[i];
        if (result.status === 'fulfilled' && result.value) {
          const { report, issues, checksRun } = result.value;
          allIssues.push(issues);
          totalChecksRun += checksRun;

          // First successful result is the homepage (primary report)
          if (i === 0 && report) {
            primaryReport = report;
          }
        }
      }

      if (!primaryReport) {
        throw new Error('Primary audit failed - no report generated');
      }

      // Merge issues from all pages
      const mergedIssues = mergeIssues(allIssues);
      console.log(`[AUDIT] Merged ${mergedIssues.length} unique issues from ${pagesToAudit.length} pages`);

      // ========== AI ANALYSIS (Optional - skip if running low on time) ==========
      let aiContentAnalysis: AIContentAnalysis | null = null;
      let aiMetaAnalysis: AIMetaAnalysis | null = null;
      let aiFixPrioritization: AIFixPrioritization | null = null;

      const elapsedTime = Date.now() - startTime;
      const timeRemaining = HARD_TIMEOUT - elapsedTime;
      const skipAI = timeRemaining < 15000; // Skip AI if less than 15 seconds remaining

      if (skipAI) {
        console.log(`[AUDIT] Skipping AI analysis (only ${timeRemaining}ms remaining)`);
      } else if (openaiApiKey && primaryReport.pages[0]) {
        const page = primaryReport.pages[0];
        console.log('Running AI-powered analysis...');

        // Extract data for AI analysis from the audit report
        const pageData = {
          url: project.url,
          title: page.title || undefined,
          metaDescription: page.description || undefined,
          h1: Array.isArray(page.h1) ? page.h1[0] : page.h1 || undefined,
          wordCount: page.wordCount || 0,
          textContent: '', // Not available in report, but AI can work without it
        };

        const [contentResult, metaResult] = await Promise.allSettled([
          runAIContentAnalysis(pageData),
          runAIMetaAnalysis(pageData),
        ]);

        if (contentResult.status === 'fulfilled') {
          aiContentAnalysis = contentResult.value;
        }
        if (metaResult.status === 'fulfilled') {
          aiMetaAnalysis = metaResult.value;
        }

        // Run fix prioritization
        const issuesForPrioritization = mergedIssues.map(i => ({
          code: i.code,
          severity: i.severity,
          title: i.title,
          category: i.category,
        }));

        aiFixPrioritization = await runAIFixPrioritization(
          issuesForPrioritization,
          project.url,
          undefined
        );

        // Add AI-generated improvement suggestions
        if (aiContentAnalysis?.improvements) {
          const topImprovements = aiContentAnalysis.improvements
            .filter(i => i.priority <= 2)
            .slice(0, 3);

          for (const improvement of topImprovements) {
            mergedIssues.push({
              code: 'AI_CONTENT_SUGGESTION',
              severity: 'notice',
              category: 'content',
              title: `AI Suggestion: ${improvement.suggestion.substring(0, 60)}${improvement.suggestion.length > 60 ? '...' : ''}`,
              description: improvement.suggestion,
              impact: improvement.impact,
              how_to_fix: improvement.suggestion,
              affected_urls: [project.url],
              details: { aiGenerated: true, priority: improvement.priority },
            });
          }
        }

        // Add AI meta tag suggestions
        if (aiMetaAnalysis?.titleAnalysis?.suggestions?.[0]) {
          const titleEffectiveness = aiMetaAnalysis.titleAnalysis.effectiveness;
          if (!pageData.title || titleEffectiveness < 70) {
            mergedIssues.push({
              code: 'AI_TITLE_SUGGESTION',
              severity: 'notice',
              category: 'on-page',
              title: 'AI-Suggested Title Improvement',
              description: `Suggested: "${aiMetaAnalysis.titleAnalysis.suggestions[0]}"`,
              impact: `Current title effectiveness: ${titleEffectiveness}%`,
              how_to_fix: `Consider: ${aiMetaAnalysis.titleAnalysis.suggestions.slice(0, 2).join(' OR ')}`,
              affected_urls: [project.url],
              details: {
                aiGenerated: true,
                suggestions: aiMetaAnalysis.titleAnalysis.suggestions,
                clickPotential: aiMetaAnalysis.titleAnalysis.clickPotential,
              },
            });
          }
        }

        console.log('AI analysis complete.');
      }

      // ========== USE HEALTH SCORES FROM ENGINE ==========
      const healthScores: HealthScores = {
        crawlability: primaryReport.healthScore?.crawlability ?? 100,
        onPage: primaryReport.healthScore?.onPage ?? 100,
        content: primaryReport.healthScore?.content ?? 100,
        performance: primaryReport.healthScore?.performance ?? 100,
        security: primaryReport.healthScore?.security ?? 100,
        socialMeta: primaryReport.healthScore?.social ?? 100,
        aiReadiness: primaryReport.healthScore?.aiReadiness ?? 100,
        mobile: 100, // Not in HealthScore interface, default to 100
      };

      // Use overall score from engine
      let overallScore = primaryReport.healthScore?.overall ?? 85;

      // Apply AI boost if available
      if (aiContentAnalysis?.overallScore) {
        const aiBoost = (aiContentAnalysis.overallScore - 70) * 0.05;
        overallScore = Math.min(100, Math.max(0, Math.round(overallScore + aiBoost)));
      }

      const duration = Date.now() - startTime;

      // ========== SAVE RESULTS ==========
      console.log(`[AUDIT] Saving results for audit ${audit.id}...`);

      // Update audit with results
      const { error: updateError } = await supabase
        .from('audits')
        .update({
          status: 'completed',
          score: overallScore,
          pages_crawled: pagesToAudit.length,
          issues_found: mergedIssues.length,
          checks_run: totalChecksRun,
          health_scores: healthScores,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          summary: {
            errors: mergedIssues.filter(i => i.severity === 'error').length,
            warnings: mergedIssues.filter(i => i.severity === 'warning').length,
            notices: mergedIssues.filter(i => i.severity === 'notice').length,
            checksRun: totalChecksRun,
            pagesAudited: pagesToAudit.length,
            aiAnalyzed: !!aiContentAnalysis,
          },
          ai_analysis: aiContentAnalysis || aiMetaAnalysis || aiFixPrioritization ? {
            content: aiContentAnalysis,
            meta: aiMetaAnalysis,
            fixPrioritization: aiFixPrioritization,
            analyzedAt: new Date().toISOString(),
          } : null,
        })
        .eq('id', audit.id);

      if (updateError) {
        console.error(`[AUDIT] Failed to update audit: ${updateError.message}`);
        throw new Error(`Failed to update audit: ${updateError.message}`);
      }
      console.log(`[AUDIT] Audit record updated successfully`);

      // Save issues
      if (mergedIssues.length > 0) {
        console.log(`[AUDIT] Saving ${mergedIssues.length} issues...`);
        const issueRecords = mergedIssues.map(issue => ({
          audit_id: audit.id,
          project_id: project.id,
          code: issue.code,
          severity: issue.severity,
          category: issue.category,
          title: issue.title,
          description: issue.description,
          impact: issue.impact,
          how_to_fix: issue.how_to_fix,
          affected_urls: issue.affected_urls,
          details: issue.details,
          status: 'open',
        }));

        const { error: issuesError } = await supabase.from('audit_issues').insert(issueRecords);
        if (issuesError) {
          console.error(`[AUDIT] Failed to save issues: ${issuesError.message}`);
        } else {
          console.log(`[AUDIT] Issues saved successfully`);
        }
      }

      // Update project
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          last_audit_at: new Date().toISOString(),
          last_audit_score: overallScore,
        })
        .eq('id', project.id);

      if (projectError) {
        console.error(`[AUDIT] Failed to update project: ${projectError.message}`);
      } else {
        console.log(`[AUDIT] Project updated successfully`);
      }

      return new Response(JSON.stringify({
        success: true,
        auditId: audit.id,
        score: overallScore,
        issuesFound: mergedIssues.length,
        checksRun: totalChecksRun,
        pagesAudited: pagesToAudit.length,
        duration,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    };

    // Race the audit against hard timeout
    try {
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error('Audit timed out after 40 seconds')), HARD_TIMEOUT);
      });

      return await Promise.race([runAuditWithTimeout(), timeoutPromise]);

    } catch (auditError) {
      // Mark audit as failed
      await supabase
        .from('audits')
        .update({
          status: 'failed',
          error_message: auditError?.message || 'Audit timed out',
          completed_at: new Date().toISOString(),
        })
        .eq('id', audit.id);

      throw auditError;
    }

  } catch (error) {
    console.error('[AUDIT] Top-level error:', error);
    console.error('[AUDIT] Error name:', error?.name);
    console.error('[AUDIT] Error message:', error?.message);
    console.error('[AUDIT] Error stack:', error?.stack);
    return new Response(JSON.stringify({
      error: error?.message || 'Unknown error',
      errorName: error?.name,
      errorStack: error?.stack?.substring(0, 500),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ========== AI ANALYSIS FUNCTIONS ==========

async function runAIContentAnalysis(context: {
  url: string;
  title?: string;
  h1?: string;
  metaDescription?: string;
  textContent?: string;
  wordCount?: number;
}): Promise<AIContentAnalysis | null> {
  if (!openaiApiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert SEO analyst. Analyze webpage content and provide actionable insights. Always respond with valid JSON.`
          },
          {
            role: 'user',
            content: `Analyze this webpage for SEO quality:

URL: ${context.url}
Title: ${context.title || 'Not found'}
H1: ${context.h1 || 'Not found'}
Meta Description: ${context.metaDescription || 'Not found'}
Word Count: ${context.wordCount || 'Unknown'}

Return JSON with this structure:
{
  "overallScore": <0-100>,
  "searchIntentMatch": <0-100>,
  "contentDepth": "<shallow|moderate|comprehensive>",
  "keywordNaturalness": <0-100>,
  "eeatSignals": {
    "experience": [<strings>],
    "expertise": [<strings>],
    "authority": [<strings>],
    "trust": [<strings>]
  },
  "improvements": [{"priority": <1-5>, "suggestion": "<string>", "impact": "<string>"}],
  "uniqueValue": "<string>",
  "missingTopics": [<strings>],
  "targetKeyword": "<detected primary keyword>"
}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as AIContentAnalysis;
  } catch (error) {
    console.error('AI content analysis error:', error);
    return null;
  }
}

async function runAIMetaAnalysis(context: {
  url: string;
  title?: string;
  metaDescription?: string;
  h1?: string;
}): Promise<AIMetaAnalysis | null> {
  if (!openaiApiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert SEO copywriter specializing in meta tags. Generate compelling alternatives. Always respond with valid JSON.`
          },
          {
            role: 'user',
            content: `Analyze these meta tags and suggest improvements:

URL: ${context.url}
Current Title: ${context.title || 'Missing'}
Current Description: ${context.metaDescription || 'Missing'}
H1: ${context.h1 || 'Not found'}

Return JSON with this structure:
{
  "titleAnalysis": {
    "effectiveness": <0-100>,
    "clickPotential": <0-100>,
    "suggestions": [<3-5 better title suggestions>]
  },
  "descriptionAnalysis": {
    "effectiveness": <0-100>,
    "suggestions": [<3-5 better description suggestions>]
  },
  "serpPrediction": {
    "predictedCTR": <percentage>,
    "improvements": [<specific CTR improvements>]
  }
}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as AIMetaAnalysis;
  } catch (error) {
    console.error('AI meta analysis error:', error);
    return null;
  }
}

async function runAIFixPrioritization(
  issues: { code: string; severity: string; title: string; category: string }[],
  url: string,
  framework?: string
): Promise<AIFixPrioritization | null> {
  if (!openaiApiKey || issues.length === 0) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an SEO strategist who prioritizes fixes by impact and effort. Always respond with valid JSON.`
          },
          {
            role: 'user',
            content: `Prioritize these SEO issues:

URL: ${url}
Framework: ${framework || 'Unknown'}

Issues:
${issues.map(i => `- [${i.severity.toUpperCase()}] ${i.code}: ${i.title} (${i.category})`).join('\n')}

Return JSON with:
{
  "prioritizedIssues": [
    {"issueCode": "<code>", "impactScore": <0-100>, "effortScore": <0-100>, "roiScore": <calculated>, "rationale": "<why>"}
  ],
  "fixBatches": [
    {"batch": <1,2,3...>, "theme": "<batch theme>", "estimatedImpact": "<description>", "issueCodes": [<codes>]}
  ]
}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as AIFixPrioritization;
  } catch (error) {
    console.error('AI prioritization error:', error);
    return null;
  }
}
