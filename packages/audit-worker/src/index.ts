import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { runFullAudit, discoverPagesFromLinks, type AuditReport, type AuditIssue } from '@rankcli/agent-runtime';
import { EventEmitter } from 'events';

// Environment
const PORT = parseInt(process.env.PORT || '8080', 10);
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const WORKER_SECRET = process.env.WORKER_SECRET || 'dev-secret';

// Timeouts for deep audits (much more generous than edge functions)
const AUDIT_TIMEOUT = 300000; // 5 minutes max per audit
const PAGE_TIMEOUT = 30000;   // 30 seconds per page
const MAX_PAGES = 20;         // Up to 20 pages for paid users

// SSE event types
interface SseEvent {
  type: 'job_created' | 'job_started' | 'job_progress' | 'job_completed' | 'job_failed' | 'heartbeat';
  job_id?: string;
  audit_id?: string;
  progress?: number;
  pages_completed?: number;
  pages_total?: number;
  score?: number;
  error?: string;
}

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
app.get('/jobs', async () => {
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

  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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
    let totalChecksRun = 0;

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
          // Calculate checks run from summary (passed + errors + warnings)
          const checksRun = (report.summary?.passed || 0) + (report.summary?.errors || 0) + (report.summary?.warnings || 0);
          totalChecksRun += checksRun;

          if (i === 0 && j === 0) {
            primaryReport = report;
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

    // Update project
    await supabase
      .from('projects')
      .update({
        last_audit_at: new Date().toISOString(),
        last_audit_score: overallScore,
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content);
  } catch {
    return null;
  }
}

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
