import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  runFullAudit,
  discoverPagesFromLinks,
  runAIKeywordResearch,
  searchCompetitors,
  type AuditReport,
  type AuditIssue,
  type PlanTier,
} from '@rankcli/agent-runtime';
import { premiumChecks } from '@rankcli/agent-runtime-premium';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

// Environment
const PORT = parseInt(process.env.PORT || '8080', 10);
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
// No fallback default - a guessable 'dev-secret' string is a real
// vulnerability if this ever got deployed unset, not a dev convenience.
const WORKER_SECRET = process.env.WORKER_SECRET;
if (!WORKER_SECRET) {
  throw new Error('WORKER_SECRET environment variable is required');
}
// Competitive search API keys (optional but recommended)
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || '';
const SERPER_API_KEY = process.env.SERPER_API_KEY || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// Timeouts for deep audits (much more generous than edge functions)
const AUDIT_TIMEOUT = 300000; // 5 minutes max per audit
const PAGE_TIMEOUT = 30000;   // 30 seconds per page
const MAX_PAGES = 20;         // Up to 20 pages for paid users

// Email notification endpoint (Supabase Edge Function)
const EMAIL_FUNCTION_URL = process.env.SUPABASE_URL
  ? `${process.env.SUPABASE_URL}/functions/v1/send-audit-email`
  : '';

/**
 * Send audit completion notification email via Supabase Edge Function.
 * Non-blocking - failures are logged but don't affect the audit result.
 */
async function sendAuditNotification(auditId: string): Promise<void> {
  if (!EMAIL_FUNCTION_URL || !SUPABASE_SERVICE_KEY) {
    return;
  }

  try {
    const response = await fetch(EMAIL_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKER_SECRET}`,
      },
      body: JSON.stringify({ auditId }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.warn(`Email notification failed for audit ${auditId}:`, error);
    } else {
      const result = await response.json();
      console.log(`Email notification sent for audit ${auditId}:`, result);
    }
  } catch (err) {
    console.warn(`Email notification error for audit ${auditId}:`, err);
  }
}

// SSE event types
interface SseEvent {
  type: 'job_created' | 'job_started' | 'job_progress' | 'job_completed' | 'job_failed' | 'heartbeat' | 'provider_result';
  job_id?: string;
  audit_id?: string;
  progress?: number;
  pages_completed?: number;
  pages_total?: number;
  score?: number;
  error?: string;
  // AI visibility specific
  provider?: string;
  provider_name?: string;
  mentioned?: boolean;
  position?: number | null;
  sentiment?: string | null;
  context?: string | null;
}

// AI visibility job tracking
interface AIVisibilityJob {
  id: string;
  url: string;
  brand: string;
  domain: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  providersTotal: number;
  providersCompleted: number;
  results: AIProviderResult[];
  overallScore: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

interface AIProviderResult {
  provider: string;
  name: string;
  mentioned: boolean;
  position: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  context: string | null;
  score: number;
  error?: string;
}

const aiVisibilityJobs = new Map<string, AIVisibilityJob>();

// Per-IP rate limiting for the public /ai-visibility endpoint. In-memory is
// fine here (unlike a stateless edge function) - this is a long-running
// process with min_machines_running=1, so state persists across requests.
const AI_VISIBILITY_RATE_LIMIT = 5;
const AI_VISIBILITY_RATE_WINDOW_MS = 60 * 60 * 1000;
const aiVisibilityRequestLog = new Map<string, number[]>();

function checkAIVisibilityRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (aiVisibilityRequestLog.get(ip) || []).filter(
    (t) => now - t < AI_VISIBILITY_RATE_WINDOW_MS
  );
  if (timestamps.length >= AI_VISIBILITY_RATE_LIMIT) {
    aiVisibilityRequestLog.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  aiVisibilityRequestLog.set(ip, timestamps);
  return true;
}

// Prevent unbounded memory growth from IPs that only ever request once.
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of aiVisibilityRequestLog.entries()) {
    const fresh = timestamps.filter((t) => now - t < AI_VISIBILITY_RATE_WINDOW_MS);
    if (fresh.length === 0) aiVisibilityRequestLog.delete(ip);
    else aiVisibilityRequestLog.set(ip, fresh);
  }
}, 10 * 60 * 1000);

// LLM Provider configurations
const LLM_PROVIDERS = [
  { id: 'openai', name: 'ChatGPT', model: 'gpt-4o-mini' },
  { id: 'anthropic', name: 'Claude', model: 'claude-3-haiku-20240307' },
  { id: 'google', name: 'Gemini', model: 'gemini-pro' },
  { id: 'perplexity', name: 'Perplexity', model: 'llama-3.1-sonar-small-128k-online' },
] as const;

// Event emitter for SSE broadcasts
const sseEmitter = new EventEmitter();
sseEmitter.setMaxListeners(100); // Allow many concurrent SSE connections

// In-memory job tracking
interface AuditJob {
  id: string;
  auditId: string;
  projectId: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  pagesTotal: number;
  pagesCompleted: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

const jobs = new Map<string, AuditJob>();

// Broadcast SSE event to all listeners for a specific audit
function broadcastEvent(auditId: string, event: SseEvent) {
  sseEmitter.emit(`audit:${auditId}`, event);
  sseEmitter.emit('audit:*', event); // Global broadcast
}

// Initialize Fastify
const app = Fastify({
  logger: true,
  requestTimeout: AUDIT_TIMEOUT + 30000, // Extra buffer
});

await app.register(cors, {
  origin: true,
  credentials: true,
});

// Health check
app.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeJobs: jobs.size,
  };
});

// Get job status
app.get<{ Params: { jobId: string } }>('/jobs/:jobId', async (request, reply) => {
  const { jobId } = request.params;
  const job = jobs.get(jobId);

  if (!job) {
    return reply.status(404).send({ error: 'Job not found' });
  }

  return job;
});

// List all jobs (for debugging)
app.get('/jobs', async (request, reply) => {
  const authHeader = request.headers.authorization;
  if (authHeader !== `Bearer ${WORKER_SECRET}`) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  return Array.from(jobs.values());
});

// Submit audit job
app.post<{
  Body: {
    auditId: string;
    projectId: string;
    url: string;
    maxPages?: number;
    checksLimit?: number;
    enableAI?: boolean;
  };
}>('/audit', async (request, reply) => {
  // Verify worker secret
  const authHeader = request.headers.authorization;
  if (authHeader !== `Bearer ${WORKER_SECRET}`) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const { auditId, projectId, url, maxPages = 10, checksLimit = 280, enableAI = true } = request.body;

  if (!auditId || !projectId || !url) {
    return reply.status(400).send({ error: 'Missing required fields: auditId, projectId, url' });
  }

  const jobId = `job_${randomUUID()}`;

  const job: AuditJob = {
    id: jobId,
    auditId,
    projectId,
    url,
    status: 'pending',
    progress: 0,
    pagesTotal: 0,
    pagesCompleted: 0,
  };

  jobs.set(jobId, job);

  // Start audit in background
  runDeepAudit(job, { maxPages: Math.min(maxPages, MAX_PAGES), checksLimit, enableAI }).catch(err => {
    app.log.error({ err, jobId }, 'Audit failed');
  });

  // Broadcast job created event
  broadcastEvent(auditId, {
    type: 'job_created',
    job_id: jobId,
    audit_id: auditId,
  });

  // Return immediately with job ID (async processing)
  return reply.status(202).send({
    jobId,
    status: 'pending',
    message: 'Audit job submitted. Connect to /stream/:auditId for real-time updates.',
  });
});

// Quick audit endpoint (synchronous, for free audits)
// Returns results directly instead of requiring SSE streaming
app.post<{
  Body: {
    url: string;
    maxPages?: number;
    checksLimit?: number;
    enableAI?: boolean;
  };
}>('/audit/quick', async (request, reply) => {
  // Verify worker secret
  const authHeader = request.headers.authorization;
  if (authHeader !== `Bearer ${WORKER_SECRET}`) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const { url, maxPages = 1, checksLimit = 280, enableAI = false } = request.body;

  if (!url) {
    return reply.status(400).send({ error: 'Missing required field: url' });
  }

  app.log.info({ url, maxPages, checksLimit }, 'Starting quick audit');

  try {
    // Run single-page audit with timeout
    const auditPromise = runFullAudit({
      url,
      maxPages: Math.min(maxPages, 1), // Limit to 1 page for quick audits
      checksLimit,
      premiumChecks,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Audit timed out after 45 seconds')), 45000)
    );

    const report: AuditReport = await Promise.race([auditPromise, timeoutPromise]);

    app.log.info({ url, issues: report.issues.length }, 'Quick audit completed');

    // Return full report
    return reply.send({
      score: report.healthScore?.overall ?? 85,
      issues: report.issues,
      healthScore: report.healthScore,
      summary: report.summary,
      url: report.url,
    });

  } catch (error) {
    app.log.error({ err: error, url }, 'Quick audit failed');
    return reply.status(500).send({
      error: error instanceof Error ? error.message : 'Audit failed',
    });
  }
});

// SSE stream for audit updates
app.get<{ Params: { auditId: string } }>('/stream/:auditId', async (request, reply) => {
  const { auditId } = request.params;

  // Set SSE headers
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial connection event
  reply.raw.write(`data: ${JSON.stringify({ type: 'connected', audit_id: auditId })}\n\n`);

  // Handler for audit events
  const eventHandler = (event: SseEvent) => {
    reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // Subscribe to events for this audit
  sseEmitter.on(`audit:${auditId}`, eventHandler);

  // Heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    reply.raw.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
  }, 30000);

  // Cleanup on disconnect
  request.raw.on('close', () => {
    sseEmitter.off(`audit:${auditId}`, eventHandler);
    clearInterval(heartbeat);
  });

  // Keep connection open (don't call reply.send())
});

// Deep audit runner
async function runDeepAudit(
  job: AuditJob,
  options: { maxPages: number; checksLimit: number; enableAI: boolean }
): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const startTime = Date.now();

  try {
    // ========== CHECK DOMAIN LIMIT (ANTI-GAMING) ==========
    // Get project to find user and domain
    const { data: project } = await supabase
      .from('projects')
      .select('user_id, domain')
      .eq('id', job.projectId)
      .single();

    if (project?.user_id) {
      // Get subscription details for billing cycle
      const { data: subDetails } = await supabase
        .from('user_subscriptions')
        .select('plan_id, current_period_start')
        .eq('user_id', project.user_id)
        .single();

      // Determine domain limit (paid users only use worker)
      const planLimits: Record<string, number | null> = {
        'solo': 5,
        'pro': 15,
        'agency': null, // unlimited
      };
      const domainsPerMonth = subDetails?.plan_id
        ? (planLimits[subDetails.plan_id] ?? 5)
        : 5; // Default for paid

      // Check domain limit (null = unlimited)
      if (domainsPerMonth !== null && subDetails?.current_period_start) {
        // Get unique domains audited this billing cycle
        const { data: auditedDomains } = await supabase
          .from('audits')
          .select('projects!inner(domain)')
          .eq('projects.user_id', project.user_id)
          .gte('created_at', subDetails.current_period_start)
          .eq('status', 'completed');

        const uniqueDomains = new Set<string>();
        auditedDomains?.forEach((a: { projects: { domain: string } }) => {
          if (a.projects?.domain) uniqueDomains.add(a.projects.domain);
        });

        // Check if we're at limit and this is a new domain
        if (uniqueDomains.size >= domainsPerMonth && !uniqueDomains.has(project.domain)) {
          app.log.warn({ jobId: job.id, domains: uniqueDomains.size, limit: domainsPerMonth }, 'Domain limit reached');

          // Mark audit as failed
          await supabase
            .from('audits')
            .update({
              status: 'failed',
              error_message: `Domain limit reached (${domainsPerMonth} domains per month)`,
              completed_at: new Date().toISOString()
            })
            .eq('id', job.auditId);

          job.status = 'failed';
          job.error = `Domain limit reached (${domainsPerMonth} domains per month)`;

          broadcastEvent(job.auditId, {
            type: 'job_failed',
            job_id: job.id,
            audit_id: job.auditId,
            error: job.error,
          });

          return;
        }

        app.log.info({ jobId: job.id, domains: uniqueDomains.size, limit: domainsPerMonth }, 'Domain check passed');
      }

      // ========== CHECK SCHEDULE LIMIT (TIER-BASED) ==========
      // Solo: weekly, Pro: daily, Agency: hourly
      if (subDetails?.plan_id) {
        const { data: scheduleCheck, error: scheduleError } = await supabase.rpc('check_audit_schedule', {
          p_user_id: project.user_id,
          p_project_id: job.projectId,
          p_plan_id: subDetails.plan_id,
        });

        if (scheduleError) {
          app.log.warn({ err: scheduleError, jobId: job.id }, 'Schedule check failed (continuing anyway)');
        } else if (scheduleCheck && scheduleCheck.length > 0) {
          const check = scheduleCheck[0];
          
          if (!check.allowed) {
            const scheduleNames: Record<number, string> = {
              1: 'hourly',
              24: 'daily',
              168: 'weekly',
            };
            const scheduleName = scheduleNames[check.interval_hours] || `every ${check.interval_hours}h`;
            
            app.log.warn({ 
              jobId: job.id, 
              lastAudit: check.last_audit_at, 
              nextAllowed: check.next_allowed_at,
              interval: check.interval_hours,
            }, 'Schedule limit reached');

            // Mark audit as failed with schedule error
            await supabase
              .from('audits')
              .update({
                status: 'failed',
                error_message: `Schedule limit reached. Your plan allows ${scheduleName} audits. Next audit allowed at ${check.next_allowed_at}`,
                completed_at: new Date().toISOString()
              })
              .eq('id', job.auditId);

            job.status = 'failed';
            job.error = JSON.stringify({
              code: 'schedule_exceeded',
              tier: subDetails.plan_id,
              allowed_schedule: scheduleName,
              last_audit_at: check.last_audit_at,
              next_allowed_at: check.next_allowed_at,
              upgrade_url: 'https://rankcli.dev/pricing?from=schedule_exceeded',
            });

            broadcastEvent(job.auditId, {
              type: 'job_failed',
              job_id: job.id,
              audit_id: job.auditId,
              error: `Schedule limit reached. Next audit allowed at ${check.next_allowed_at}`,
            });

            return;
          }

          app.log.info({ jobId: job.id, interval: check.interval_hours }, 'Schedule check passed');
        }
      }
    }

    job.status = 'running';
    job.startedAt = new Date();

    // Update audit status in DB
    await supabase
      .from('audits')
      .update({ status: 'running', started_at: job.startedAt.toISOString() })
      .eq('id', job.auditId);

    // Broadcast job started
    broadcastEvent(job.auditId, {
      type: 'job_started',
      job_id: job.id,
      audit_id: job.auditId,
    });

    app.log.info({ jobId: job.id, url: job.url }, 'Starting deep audit');

    // Phase 1: Discover pages
    app.log.info({ jobId: job.id }, 'Phase 1: Discovering pages...');
    let pagesToAudit: string[] = [job.url];

    const homepageHtml = await fetchHtml(job.url);
    if (homepageHtml) {
      const discovered = discoverPagesFromLinks(job.url, homepageHtml, options.maxPages - 1);
      pagesToAudit = [job.url, ...discovered.map(p => p.url).filter(u => u !== job.url)];
    }

    job.pagesTotal = pagesToAudit.length;
    app.log.info({ jobId: job.id, pages: pagesToAudit.length }, 'Pages discovered');

    // Phase 2: Audit pages in parallel batches
    app.log.info({ jobId: job.id }, 'Phase 2: Auditing pages...');
    const BATCH_SIZE = 5; // Process 5 pages at a time
    const allIssues: DbAuditIssue[][] = [];
    let primaryReport: AuditReport | null = null;
    // Track unique checks (from first page only - same checks run on each page)
    let uniqueChecksRun = 0;

    for (let i = 0; i < pagesToAudit.length; i += BATCH_SIZE) {
      const batch = pagesToAudit.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        batch.map(async (pageUrl, batchIndex) => {
          const globalIndex = i + batchIndex;
          app.log.info({ jobId: job.id, page: globalIndex + 1, url: pageUrl }, 'Auditing page');

          try {
            const report = await runFullAudit({
              url: pageUrl,
              maxPages: 1,
              checkBrokenLinks: true,
              tier: 'paid',
              checksLimit: options.checksLimit,
              premiumChecks,
            });

            job.pagesCompleted++;
            job.progress = Math.round((job.pagesCompleted / job.pagesTotal) * 80); // 80% for page audits

            // Broadcast progress
            broadcastEvent(job.auditId, {
              type: 'job_progress',
              job_id: job.id,
              audit_id: job.auditId,
              progress: job.progress,
              pages_completed: job.pagesCompleted,
              pages_total: job.pagesTotal,
            });

            return { report, url: pageUrl };
          } catch (err) {
            app.log.error({ err, jobId: job.id, url: pageUrl }, 'Page audit failed');
            return null;
          }
        })
      );

      // Collect results
      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        if (result.status === 'fulfilled' && result.value?.report) {
          const { report } = result.value;
          const issues = report.issues.map(issue => mapIssueToDb(issue, job.auditId, job.projectId));
          allIssues.push(issues);

          if (i === 0 && j === 0) {
            primaryReport = report;
            // Get unique checks count from first page only (same checks run on all pages)
            uniqueChecksRun = (report.summary?.passed || 0) + (report.summary?.errors || 0) + (report.summary?.warnings || 0);
            app.log.info({ jobId: job.id, uniqueChecksRun }, 'Unique checks count from first page');
          }
        }
      }
    }

    if (!primaryReport) {
      throw new Error('No pages could be audited');
    }

    // Merge issues
    const mergedIssues = mergeIssues(allIssues);
    app.log.info({ jobId: job.id, issues: mergedIssues.length }, 'Issues merged');

    // Phase 3: AI Analysis (if enabled)
    let aiAnalysis = null;
    if (options.enableAI && OPENAI_API_KEY && primaryReport.pages[0]) {
      app.log.info({ jobId: job.id }, 'Phase 3: Running AI analysis...');
      job.progress = 85;

      aiAnalysis = await runAIAnalysis(job.url, mergedIssues);
      job.progress = 95;
    }

    // Phase 4: Save results
    app.log.info({ jobId: job.id }, 'Phase 4: Saving results...');

    const overallScore = primaryReport.healthScore?.overall ?? 85;
    const duration = Date.now() - startTime;

    const healthScores = {
      overall: overallScore,
      crawlability: primaryReport.healthScore?.crawlability ?? 0,
      onPage: primaryReport.healthScore?.onPage ?? 0,
      content: primaryReport.healthScore?.content ?? 0,
      performance: primaryReport.healthScore?.performance ?? 0,
      security: primaryReport.healthScore?.security ?? 0,
    };

    // Update audit record
    await supabase
      .from('audits')
      .update({
        status: 'completed',
        score: overallScore,
        pages_crawled: pagesToAudit.length,
        issues_found: mergedIssues.length,
        checks_run: uniqueChecksRun,
        health_scores: healthScores,
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        summary: {
          errors: mergedIssues.filter(i => i.severity === 'error').length,
          warnings: mergedIssues.filter(i => i.severity === 'warning').length,
          notices: mergedIssues.filter(i => i.severity === 'notice').length,
          checksRun: uniqueChecksRun,
          pagesAudited: pagesToAudit.length,
          aiAnalyzed: !!aiAnalysis,
          worker: 'fly.io',
        },
        ai_analysis: aiAnalysis,
      })
      .eq('id', job.auditId);

    // Save issues
    if (mergedIssues.length > 0) {
      const issueRecords = mergedIssues.map(issue => ({
        audit_id: job.auditId,
        project_id: job.projectId,
        ...issue,
        status: 'open',
      }));

      await supabase.from('audit_issues').insert(issueRecords);
    }

    // Update project and schedule timestamp
    await supabase
      .from('projects')
      .update({
        last_audit_at: new Date().toISOString(),
        last_audit_score: overallScore,
        last_scheduled_audit_at: new Date().toISOString(),
        scheduled_audit_source: 'worker',
      })
      .eq('id', job.projectId);

    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date();

    // Broadcast completion
    broadcastEvent(job.auditId, {
      type: 'job_completed',
      job_id: job.id,
      audit_id: job.auditId,
      progress: 100,
      score: overallScore,
    });

    app.log.info({
      jobId: job.id,
      duration,
      pages: pagesToAudit.length,
      issues: mergedIssues.length
    }, 'Audit completed');

    // Trigger email notification (non-blocking)
    sendAuditNotification(job.auditId).catch(err => {
      app.log.warn({ err, auditId: job.auditId }, 'Failed to send audit notification email');
    });

    // Clean up job after 5 minutes
    setTimeout(() => jobs.delete(job.id), 300000);

  } catch (error) {
    app.log.error({ err: error, jobId: job.id }, 'Audit failed');

    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
    job.completedAt = new Date();

    // Broadcast failure
    broadcastEvent(job.auditId, {
      type: 'job_failed',
      job_id: job.id,
      audit_id: job.auditId,
      error: job.error,
    });

    // Update audit as failed
    await supabase
      .from('audits')
      .update({
        status: 'failed',
        error_message: job.error,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.auditId);

    // Clean up job after 5 minutes
    setTimeout(() => jobs.delete(job.id), 300000);
  }
}

// Helper: Fetch HTML
async function fetchHtml(url: string, timeout = 10000): Promise<string | null> {
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
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

// Helper: Map issue to DB format
interface DbAuditIssue {
  code: string;
  severity: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  how_to_fix: string;
  affected_urls: string[];
  details: Record<string, unknown>;
}

function mapIssueToDb(issue: AuditIssue, auditId: string, projectId: string): DbAuditIssue {
  return {
    code: issue.code,
    severity: issue.severity,
    category: issue.category,
    title: issue.title,
    description: issue.description || '',
    impact: issue.impact || '',
    how_to_fix: issue.howToFix || '',
    affected_urls: issue.affectedUrls || [],
    details: issue.details || {},
  };
}

// Helper: Merge issues from multiple pages
function mergeIssues(issueArrays: DbAuditIssue[][]): DbAuditIssue[] {
  const issueMap = new Map<string, DbAuditIssue>();

  for (const issues of issueArrays) {
    for (const issue of issues) {
      const existing = issueMap.get(issue.code);
      if (existing) {
        const urls = new Set([...existing.affected_urls, ...issue.affected_urls]);
        existing.affected_urls = Array.from(urls);
      } else {
        issueMap.set(issue.code, { ...issue });
      }
    }
  }

  return Array.from(issueMap.values());
}

// Helper: Run AI analysis
async function runAIAnalysis(url: string, issues: DbAuditIssue[]): Promise<Record<string, unknown> | null> {
  if (!OPENAI_API_KEY) return null;

  try {
    const prompt = `Analyze these SEO audit results and provide prioritized recommendations:

URL: ${url}

Issues found:
${issues.slice(0, 20).map(i => `- [${i.severity.toUpperCase()}] ${i.code}: ${i.title}`).join('\n')}

Return JSON with:
{
  "contentScore": <0-100 overall content quality>,
  "suggestions": [<3-5 high-impact suggestions>],
  "prioritizedFixes": [
    {"code": "<issue code>", "priority": <1-5>, "rationale": "<why fix this first>"}
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an SEO expert. Respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content);
  } catch {
    return null;
  }
}

// ========== KEYWORD RESEARCH ENDPOINT ==========

app.post<{
  Body: {
    url: string;
    projectId?: string;
    tier: PlanTier;
    wizardResponses?: Array<{ id: string; answer: string }>;
    userContext?: {
      productDescription?: string;
      targetAudience?: string;
      competitors?: string[];
      mainProblem?: string;
      differentiator?: string;
    };
    enableEnhancedToolIdeas?: boolean;
  };
}>('/keywords', async (request, reply) => {
  // Verify worker secret
  const authHeader = request.headers.authorization;
  if (authHeader !== `Bearer ${WORKER_SECRET}`) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const {
    url,
    projectId,
    tier,
    wizardResponses,
    userContext,
    enableEnhancedToolIdeas = true,
  } = request.body;

  if (!url) {
    return reply.status(400).send({ error: 'URL is required' });
  }

  if (!OPENAI_API_KEY) {
    return reply.status(500).send({ error: 'OpenAI API key not configured' });
  }

  app.log.info({ url, tier, projectId }, 'Starting keyword research');

  try {
    const result = await runAIKeywordResearch({
      url,
      tier,
      openaiApiKey: OPENAI_API_KEY,
      userContext,
      wizardResponses,
      enableEnhancedToolIdeas,
      competitiveSearchKeys: {
        braveApiKey: BRAVE_API_KEY || undefined,
        serperApiKey: SERPER_API_KEY || undefined,
        githubToken: GITHUB_TOKEN || undefined,
      },
    });

    app.log.info({
      url,
      tier,
      opportunitiesCount: 'opportunities' in result ? result.opportunities?.length : 0,
      toolIdeasCount: 'freeToolIdeas' in result ? result.freeToolIdeas?.length : 0,
    }, 'Keyword research completed');

    // Save to database if projectId provided and paid tier
    if (projectId && tier !== 'free' && 'siteSummary' in result) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      // Get user_id from project
      const { data: project } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

      if (project?.user_id) {
        await supabase.from('keyword_research_results').insert({
          project_id: projectId,
          user_id: project.user_id,
          url,
          site_summary: result.siteSummary,
          uncertainty: result.uncertainty,
          recommendations: result.recommendations || [],
          free_tool_ideas: result.freeToolIdeas || [],
          wizard_responses: wizardResponses ? Object.fromEntries(
            wizardResponses.map(r => [r.id, r.answer])
          ) : null,
          confidence: result.uncertainty?.overallConfidence || 0,
          created_at: new Date().toISOString(),
        });
      }
    }

    return reply.send({
      success: true,
      tier,
      ...result,
    });

  } catch (error) {
    app.log.error({ err: error, url }, 'Keyword research failed');
    return reply.status(500).send({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Competitive search endpoint (for testing/debugging)
app.post<{
  Body: {
    query: string;
  };
}>('/competitive-search', async (request, reply) => {
  const authHeader = request.headers.authorization;
  if (authHeader !== `Bearer ${WORKER_SECRET}`) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const { query } = request.body;
  if (!query) {
    return reply.status(400).send({ error: 'Query is required' });
  }

  try {
    const result = await searchCompetitors(query, {
      braveApiKey: BRAVE_API_KEY || undefined,
      serperApiKey: SERPER_API_KEY || undefined,
      githubToken: GITHUB_TOKEN || undefined,
      maxResults: 10,
    });

    return reply.send(result);
  } catch (error) {
    return reply.status(500).send({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ========== AI VISIBILITY CHECK ENDPOINT ==========

app.post<{
  Body: {
    url: string;
    brand?: string;
  };
}>('/ai-visibility', async (request, reply) => {
  // This is a genuinely public, anonymous-accessible free tool
  // (/tools/ai-visibility, /tools/chatgpt-checker call it directly from
  // the browser via useAIVisibilitySSE - it can never carry WORKER_SECRET,
  // that's server-only). It triggers up to 4 separate paid AI API calls
  // per request on RankCLI's own keys, and had NO rate limiting at all -
  // anyone could script unlimited calls against it for free. Same 5/hour
  // per-IP limit as the equivalent saas edge functions use elsewhere.
  const clientIp = request.headers['cf-connecting-ip'] as string
    || request.headers['x-forwarded-for'] as string
    || request.ip;
  if (!checkAIVisibilityRateLimit(clientIp)) {
    return reply.status(429).send({
      error: 'Rate limit exceeded. Try again in an hour, or sign up for unlimited checks.',
    });
  }

  const { url, brand: customBrand } = request.body;

  if (!url) {
    return reply.status(400).send({ error: 'URL is required' });
  }

  // Parse URL and extract brand
  let domain: string;
  let brand: string;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    domain = parsed.hostname.replace(/^www\./, '');
    brand = customBrand || domain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  } catch {
    return reply.status(400).send({ error: 'Invalid URL' });
  }

  const jobId = `aiv_${randomUUID()}`;

  const job: AIVisibilityJob = {
    id: jobId,
    url,
    brand,
    domain,
    status: 'pending',
    progress: 0,
    providersTotal: LLM_PROVIDERS.length,
    providersCompleted: 0,
    results: [],
    overallScore: 0,
  };

  aiVisibilityJobs.set(jobId, job);

  // Start checking in background
  runAIVisibilityCheck(job).catch(err => {
    app.log.error({ err, jobId }, 'AI visibility check failed');
  });

  // Broadcast job created
  broadcastEvent(jobId, {
    type: 'job_created',
    job_id: jobId,
  });

  return reply.status(202).send({
    jobId,
    status: 'pending',
    message: 'AI visibility check started. Connect to /ai-visibility/stream/:jobId for real-time updates.',
    streamUrl: `/ai-visibility/stream/${jobId}`,
  });
});

// SSE stream for AI visibility updates
app.get<{ Params: { jobId: string } }>('/ai-visibility/stream/:jobId', async (request, reply) => {
  const { jobId } = request.params;

  // Set SSE headers
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial connection event
  reply.raw.write(`data: ${JSON.stringify({ type: 'connected', job_id: jobId })}\n\n`);

  // Check if job already has results (late connection)
  const job = aiVisibilityJobs.get(jobId);
  if (job && job.results.length > 0) {
    // Send existing results
    for (const result of job.results) {
      reply.raw.write(`data: ${JSON.stringify({
        type: 'provider_result',
        job_id: jobId,
        provider: result.provider,
        provider_name: result.name,
        mentioned: result.mentioned,
        position: result.position,
        sentiment: result.sentiment,
        context: result.context,
        progress: job.progress,
      })}\n\n`);
    }

    // If already completed, send completion
    if (job.status === 'completed') {
      reply.raw.write(`data: ${JSON.stringify({
        type: 'job_completed',
        job_id: jobId,
        score: job.overallScore,
        progress: 100,
      })}\n\n`);
    }
  }

  // Handler for job events
  const eventHandler = (event: SseEvent) => {
    reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // Subscribe to events for this job
  sseEmitter.on(`audit:${jobId}`, eventHandler);

  // Heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    reply.raw.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
  }, 30000);

  // Cleanup on disconnect
  request.raw.on('close', () => {
    sseEmitter.off(`audit:${jobId}`, eventHandler);
    clearInterval(heartbeat);
  });
});

// Get AI visibility job status
app.get<{ Params: { jobId: string } }>('/ai-visibility/jobs/:jobId', async (request, reply) => {
  const { jobId } = request.params;
  const job = aiVisibilityJobs.get(jobId);

  if (!job) {
    return reply.status(404).send({ error: 'Job not found' });
  }

  return job;
});

// AI Visibility check runner
async function runAIVisibilityCheck(job: AIVisibilityJob): Promise<void> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

  try {
    job.status = 'running';
    job.startedAt = new Date();

    broadcastEvent(job.id, {
      type: 'job_started',
      job_id: job.id,
    });

    app.log.info({ jobId: job.id, brand: job.brand, domain: job.domain }, 'Starting AI visibility check');

    const query = `What are some good alternatives to ${job.brand}? Can you recommend similar tools or services to ${job.domain}?`;

    // Check each provider sequentially to stream results as they come in
    const providers = [
      { id: 'openai', name: 'ChatGPT', check: () => checkOpenAI(job.brand, job.domain, query) },
      { id: 'anthropic', name: 'Claude', check: () => checkAnthropic(job.brand, job.domain, query, ANTHROPIC_API_KEY) },
      { id: 'google', name: 'Gemini', check: () => checkGoogle(job.brand, job.domain, query, GOOGLE_API_KEY) },
      { id: 'perplexity', name: 'Perplexity', check: () => checkPerplexity(job.brand, job.domain, query, PERPLEXITY_API_KEY) },
    ];

    for (const provider of providers) {
      try {
        app.log.info({ jobId: job.id, provider: provider.id }, 'Checking provider');

        const result = await provider.check();
        job.results.push(result);
        job.providersCompleted++;
        job.progress = Math.round((job.providersCompleted / job.providersTotal) * 100);

        // Broadcast individual result
        broadcastEvent(job.id, {
          type: 'provider_result',
          job_id: job.id,
          provider: result.provider,
          provider_name: result.name,
          mentioned: result.mentioned,
          position: result.position,
          sentiment: result.sentiment,
          context: result.context,
          progress: job.progress,
        });

        app.log.info({
          jobId: job.id,
          provider: provider.id,
          mentioned: result.mentioned,
          position: result.position,
        }, 'Provider check complete');

      } catch (err) {
        app.log.error({ err, jobId: job.id, provider: provider.id }, 'Provider check failed');

        const errorResult: AIProviderResult = {
          provider: provider.id,
          name: provider.name,
          mentioned: false,
          position: null,
          sentiment: null,
          context: null,
          score: 0,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        job.results.push(errorResult);
        job.providersCompleted++;
        job.progress = Math.round((job.providersCompleted / job.providersTotal) * 100);

        broadcastEvent(job.id, {
          type: 'provider_result',
          job_id: job.id,
          provider: errorResult.provider,
          provider_name: errorResult.name,
          mentioned: false,
          position: null,
          sentiment: null,
          context: null,
          progress: job.progress,
          error: errorResult.error,
        });
      }
    }

    // Calculate overall score
    const mentionedCount = job.results.filter(r => r.mentioned && !r.error).length;
    const validResults = job.results.filter(r => !r.error);
    job.overallScore = validResults.length > 0
      ? Math.round((mentionedCount / validResults.length) * 100)
      : 0;

    // Bonus for good positions
    const topPositions = job.results.filter(r => r.mentioned && r.position !== null && r.position <= 3);
    if (topPositions.length > 0) {
      job.overallScore = Math.min(100, job.overallScore + 10);
    }

    job.status = 'completed';
    job.completedAt = new Date();
    job.progress = 100;

    broadcastEvent(job.id, {
      type: 'job_completed',
      job_id: job.id,
      score: job.overallScore,
      progress: 100,
    });

    app.log.info({
      jobId: job.id,
      score: job.overallScore,
      mentioned: mentionedCount,
      total: job.results.length,
    }, 'AI visibility check completed');

    // Clean up job after 10 minutes
    setTimeout(() => aiVisibilityJobs.delete(job.id), 600000);

  } catch (error) {
    app.log.error({ err: error, jobId: job.id }, 'AI visibility check failed');

    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
    job.completedAt = new Date();

    broadcastEvent(job.id, {
      type: 'job_failed',
      job_id: job.id,
      error: job.error,
    });

    setTimeout(() => aiVisibilityJobs.delete(job.id), 600000);
  }
}

// LLM Provider check functions
async function checkOpenAI(brand: string, domain: string, query: string): Promise<AIProviderResult> {
  const baseResult: AIProviderResult = {
    provider: 'openai',
    name: 'ChatGPT',
    mentioned: false,
    position: null,
    sentiment: null,
    context: null,
    score: 0,
  };

  if (!OPENAI_API_KEY) return baseResult;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that recommends tools and websites. List your top recommendations.' },
        { role: 'user', content: query },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) return baseResult;

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content || '';

  return analyzeProviderResponse(content, brand, domain, 'openai', 'ChatGPT');
}

async function checkAnthropic(brand: string, domain: string, query: string, apiKey: string): Promise<AIProviderResult> {
  const baseResult: AIProviderResult = {
    provider: 'anthropic',
    name: 'Claude',
    mentioned: false,
    position: null,
    sentiment: null,
    context: null,
    score: 0,
  };

  if (!apiKey) return baseResult;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{ role: 'user', content: query }],
    }),
  });

  if (!response.ok) return baseResult;

  const data = await response.json() as { content?: { text?: string }[] };
  const content = data.content?.[0]?.text || '';

  return analyzeProviderResponse(content, brand, domain, 'anthropic', 'Claude');
}

async function checkGoogle(brand: string, domain: string, query: string, apiKey: string): Promise<AIProviderResult> {
  const baseResult: AIProviderResult = {
    provider: 'google',
    name: 'Gemini',
    mentioned: false,
    position: null,
    sentiment: null,
    context: null,
    score: 0,
  };

  if (!apiKey) return baseResult;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: query }] }],
    }),
  });

  if (!response.ok) return baseResult;

  const data = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return analyzeProviderResponse(content, brand, domain, 'google', 'Gemini');
}

async function checkPerplexity(brand: string, domain: string, query: string, apiKey: string): Promise<AIProviderResult> {
  const baseResult: AIProviderResult = {
    provider: 'perplexity',
    name: 'Perplexity',
    mentioned: false,
    position: null,
    sentiment: null,
    context: null,
    score: 0,
  };

  if (!apiKey) return baseResult;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [{ role: 'user', content: query }],
      max_tokens: 500,
    }),
  });

  if (!response.ok) return baseResult;

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content || '';

  return analyzeProviderResponse(content, brand, domain, 'perplexity', 'Perplexity');
}

function analyzeProviderResponse(
  content: string,
  brand: string,
  domain: string,
  provider: string,
  name: string
): AIProviderResult {
  const brandLower = brand.toLowerCase();
  const domainLower = domain.toLowerCase();
  const contentLower = content.toLowerCase();

  const mentioned = contentLower.includes(brandLower) || contentLower.includes(domainLower);

  let position: number | null = null;
  let context: string | null = null;
  let sentiment: 'positive' | 'neutral' | 'negative' | null = null;

  if (mentioned) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes(brandLower) || line.includes(domainLower)) {
        const match = lines[i].match(/^(\d+)[.\)]/);
        position = match ? parseInt(match[1], 10) : i + 1;
        context = lines[i].trim().slice(0, 150);
        break;
      }
    }

    // Simple sentiment analysis
    const positiveWords = ['great', 'excellent', 'best', 'recommend', 'popular', 'powerful'];
    const negativeWords = ['avoid', 'poor', 'limited', 'expensive', 'outdated'];
    const contextLower = (context || content).toLowerCase();
    const positiveCount = positiveWords.filter(w => contextLower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => contextLower.includes(w)).length;

    sentiment = positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral';
  }

  let score = 0;
  if (mentioned) {
    score = 50;
    if (position && position <= 3) score = 100;
    else if (position && position <= 5) score = 75;
  }

  return {
    provider,
    name,
    mentioned,
    position,
    sentiment,
    context,
    score,
  };
}

// ========== MCP SERVER ENDPOINT ==========

interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: string | number | null;
}

const MCP_TOOLS = [
  {
    name: 'seo_audit',
    description: `Run comprehensive SEO audit on any URL. Analyzes 200+ factors including on-page SEO, technical SEO, GEO (AI search visibility), structured data, Core Web Vitals, security headers, and more. Returns actionable recommendations with priority ranking.`,
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to audit (e.g., https://example.com)' },
      },
      required: ['url'],
    },
  },
  {
    name: 'seo_geo_check',
    description: `Check if a URL is optimized for AI search engines (GEO - Generative Engine Optimization). Analyzes visibility in ChatGPT, Perplexity, Claude, and Gemini. Checks robots.txt AI crawler rules, content structure, and citation readiness.`,
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to check for AI search optimization' },
      },
      required: ['url'],
    },
  },
  {
    name: 'seo_robots_check',
    description: `Analyze a site's robots.txt for AI crawler permissions. Shows which AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) are allowed or blocked.`,
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Site URL (will fetch /robots.txt)' },
      },
      required: ['url'],
    },
  },
  {
    name: 'seo_compare',
    description: `Compare SEO metrics between two URLs. Useful for competitive analysis.`,
    inputSchema: {
      type: 'object',
      properties: {
        url1: { type: 'string', description: 'First URL to compare' },
        url2: { type: 'string', description: 'Second URL to compare' },
      },
      required: ['url1', 'url2'],
    },
  },
];

// Rate limits per plan (requests per day) - must match
// packages/saas/supabase/functions/validate-api-key/index.ts exactly. This
// hosted MCP endpoint is a second, independent path to the same api_keys,
// and previously enforced none of this - any free-tier key (the default
// for every signup, zero payment required) got unlimited access to every
// tool, silently bypassing the paywall the CLI already enforces.
const MCP_RATE_LIMITS: Record<string, number> = {
  solo: 100,
  pro: 1000,
  agency: 10000,
  free: 0,
};

interface MCPKeyValidation {
  valid: boolean;
  userId?: string;
  tier?: string;
  keyId?: string;
  error?: string;
  limit?: number;
  used?: number;
}

// Validate RankCLI API key
async function validateMCPApiKey(apiKey: string): Promise<MCPKeyValidation> {
  if (!apiKey || !apiKey.startsWith('rankcli_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Hash the API key
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('key_hash', keyHash)
    .is('revoked_at', null)
    .single();

  if (error || !keyData) {
    return { valid: false, error: 'Invalid or revoked API key' };
  }

  // Get subscription tier - plan_id on user_subscriptions is a UUID FK into
  // subscription_plans, not the tier name itself, so this must join through.
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan:subscription_plans (plan_id)')
    .eq('user_id', keyData.user_id)
    .single();

  const plan = subscription?.plan as unknown as { plan_id: string } | null;
  const tier = plan?.plan_id || 'free';
  const limit = MCP_RATE_LIMITS[tier] ?? 0;

  if (limit === 0) {
    return { valid: false, userId: keyData.user_id, tier, error: 'API access requires a paid subscription (Solo, Pro, or Agency). Upgrade at https://rankcli.dev/pricing' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: used } = await supabase
    .from('api_requests')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', keyData.id)
    .gte('created_at', today.toISOString());

  const usedCount = used || 0;
  if (usedCount >= limit) {
    return { valid: false, userId: keyData.user_id, tier, limit, used: usedCount, error: `Daily MCP request limit reached (${limit}/day on the ${tier} plan). Resets at midnight UTC.` };
  }

  await supabase.from('api_requests').insert({
    api_key_id: keyData.id,
    user_id: keyData.user_id,
    endpoint: 'mcp',
  });

  return { valid: true, userId: keyData.user_id, tier, keyId: keyData.id, limit, used: usedCount + 1 };
}

// Analyze robots.txt for AI crawlers
function analyzeRobotsTxtForAI(robotsTxt: string): string {
  const aiCrawlers = [
    { name: 'GPTBot', agent: 'GPTBot' },
    { name: 'ChatGPT-User', agent: 'ChatGPT-User' },
    { name: 'ClaudeBot', agent: 'ClaudeBot' },
    { name: 'Claude-Web', agent: 'Claude-Web' },
    { name: 'PerplexityBot', agent: 'PerplexityBot' },
    { name: 'Google-Extended', agent: 'Google-Extended' },
    { name: 'Amazonbot', agent: 'Amazonbot' },
  ];

  const lines = robotsTxt.toLowerCase().split('\n');
  const results: string[] = [];

  for (const crawler of aiCrawlers) {
    const agentLower = crawler.agent.toLowerCase();
    let status = '⚪ Not mentioned (defaults to allowed)';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('user-agent:') && line.includes(agentLower)) {
        for (let j = i + 1; j < lines.length && !lines[j].trim().startsWith('user-agent:'); j++) {
          const rule = lines[j].trim();
          if (rule === 'disallow: /') {
            status = '❌ Blocked';
            break;
          } else if (rule === 'allow: /') {
            status = '✅ Allowed';
            break;
          }
        }
        break;
      }
    }
    
    results.push(`- ${crawler.name}: ${status}`);
  }

  return `## AI Crawler Status\n${results.join('\n')}`;
}

// Handle MCP tool calls
async function handleMCPToolCall(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'seo_audit': {
      const url = args.url as string;
      if (!url) throw new Error('URL is required');

      app.log.info({ url }, 'MCP: Running SEO audit');
      
      const report = await runFullAudit({
        url,
        maxPages: 1,
        tier: 'paid',
        checksLimit: 280,
        premiumChecks,
      });

      const criticalIssues = report.issues.filter(i => i.severity === 'error');
      const warnings = report.issues.filter(i => i.severity === 'warning');

      return `# SEO Audit: ${url}

**Overall Score:** ${report.healthScore?.overall ?? 85}/100
**Issues Found:** ${criticalIssues.length} critical, ${warnings.length} warnings

## Critical Issues
${criticalIssues.slice(0, 10).map(i => `- **${i.code}:** ${i.title}`).join('\n') || 'None!'}

## Top Warnings
${warnings.slice(0, 5).map(i => `- **${i.code}:** ${i.title}`).join('\n') || 'None!'}

## Scores by Category
- Crawlability: ${report.healthScore?.crawlability ?? 'N/A'}/100
- On-Page: ${report.healthScore?.onPage ?? 'N/A'}/100
- Content: ${report.healthScore?.content ?? 'N/A'}/100
- Performance: ${report.healthScore?.performance ?? 'N/A'}/100
- Security: ${report.healthScore?.security ?? 'N/A'}/100
`;
    }

    case 'seo_geo_check': {
      const url = args.url as string;
      if (!url) throw new Error('URL is required');

      app.log.info({ url }, 'MCP: Running GEO check');

      // Fetch robots.txt
      let robotsTxt = '';
      try {
        const robotsUrl = new URL('/robots.txt', url).toString();
        const response = await fetch(robotsUrl, { headers: { 'User-Agent': 'RankCLI-Bot/1.0' } });
        if (response.ok) robotsTxt = await response.text();
      } catch { /* ignore */ }

      const report = await runFullAudit({
        url,
        maxPages: 1,
        tier: 'paid',
        checksLimit: 280,
        premiumChecks,
      });

      const geoIssues = report.issues.filter(i =>
        i.code?.startsWith('GEO_') || i.code?.startsWith('AI_') || i.code?.includes('ROBOT')
      );

      return `# GEO Analysis: ${url}

**AI Search Visibility Score:** ${report.healthScore?.overall ?? 85}/100

${robotsTxt ? analyzeRobotsTxtForAI(robotsTxt) : '## AI Crawler Status\nCould not fetch robots.txt'}

## AI-Specific Issues
${geoIssues.map(i => `- **${i.code}:** ${i.title}`).join('\n') || 'No AI-specific issues found!'}

## Recommendations
- Ensure GPTBot, ClaudeBot, PerplexityBot are allowed in robots.txt
- Use clear, factual content that AI can cite
- Add structured data (FAQ, HowTo schemas)
- Avoid JavaScript-only content rendering
`;
    }

    case 'seo_robots_check': {
      const url = args.url as string;
      if (!url) throw new Error('URL is required');

      app.log.info({ url }, 'MCP: Checking robots.txt');

      const robotsUrl = new URL('/robots.txt', url).toString();
      const response = await fetch(robotsUrl, { headers: { 'User-Agent': 'RankCLI-Bot/1.0' } });
      
      if (!response.ok) {
        return `Could not fetch robots.txt from ${robotsUrl} (status: ${response.status})`;
      }
      
      const robotsTxt = await response.text();

      return `# robots.txt Analysis: ${url}

\`\`\`
${robotsTxt.slice(0, 2000)}${robotsTxt.length > 2000 ? '\n... (truncated)' : ''}
\`\`\`

${analyzeRobotsTxtForAI(robotsTxt)}
`;
    }

    case 'seo_compare': {
      const url1 = args.url1 as string;
      const url2 = args.url2 as string;
      if (!url1 || !url2) throw new Error('Both url1 and url2 are required');

      app.log.info({ url1, url2 }, 'MCP: Comparing URLs');

      const [report1, report2] = await Promise.all([
        runFullAudit({ url: url1, maxPages: 1, tier: 'paid', checksLimit: 280, premiumChecks }),
        runFullAudit({ url: url2, maxPages: 1, tier: 'paid', checksLimit: 280, premiumChecks }),
      ]);

      const score1 = report1.healthScore?.overall ?? 0;
      const score2 = report2.healthScore?.overall ?? 0;
      const critical1 = report1.issues.filter(i => i.severity === 'error').length;
      const critical2 = report2.issues.filter(i => i.severity === 'error').length;

      return `# SEO Comparison

| Metric | ${new URL(url1).hostname} | ${new URL(url2).hostname} |
|--------|---------------------------|---------------------------|
| Overall Score | ${score1}/100 | ${score2}/100 |
| Critical Issues | ${critical1} | ${critical2} |
| Warnings | ${report1.issues.filter(i => i.severity === 'warning').length} | ${report2.issues.filter(i => i.severity === 'warning').length} |
| Crawlability | ${report1.healthScore?.crawlability ?? 'N/A'} | ${report2.healthScore?.crawlability ?? 'N/A'} |
| Performance | ${report1.healthScore?.performance ?? 'N/A'} | ${report2.healthScore?.performance ?? 'N/A'} |

## Winner: ${score1 > score2 ? new URL(url1).hostname : score2 > score1 ? new URL(url2).hostname : 'Tie!'}
`;
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// MCP endpoint
app.post<{ Body: MCPRequest }>('/mcp', async (request, reply) => {
  // Extract API key from Authorization header
  const authHeader = request.headers.authorization;
  const apiKey = authHeader?.replace('Bearer ', '');

  if (!apiKey) {
    return reply.send({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Missing API key. Get one at https://rankcli.dev' },
      id: null,
    });
  }

  const auth = await validateMCPApiKey(apiKey);
  if (!auth.valid) {
    return reply.send({
      jsonrpc: '2.0',
      error: { code: -32600, message: auth.error || 'Invalid API key' },
      id: null,
    });
  }

  const { method, params, id } = request.body;

  app.log.info({ method, userId: auth.userId }, 'MCP request');

  switch (method) {
    case 'initialize':
      return reply.send({
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'rankcli', version: '1.0.0' },
          capabilities: { tools: {} },
        },
        id,
      });

    case 'tools/list':
      return reply.send({
        jsonrpc: '2.0',
        result: { tools: MCP_TOOLS },
        id,
      });

    case 'tools/call': {
      const { name, arguments: args } = params as { name: string; arguments?: Record<string, unknown> };
      
      try {
        const result = await handleMCPToolCall(name, args || {});
        return reply.send({
          jsonrpc: '2.0',
          result: { content: [{ type: 'text', text: result }] },
          id,
        });
      } catch (error) {
        app.log.error({ error, tool: name }, 'MCP tool error');
        return reply.send({
          jsonrpc: '2.0',
          result: {
            content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
            isError: true,
          },
          id,
        });
      }
    }

    default:
      return reply.send({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Method not found: ${method}` },
        id,
      });
  }
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`Audit worker listening on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
