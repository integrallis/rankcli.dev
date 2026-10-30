// Runs the audit engine in a worker thread (see audit-pool.ts). A page audit is seconds of
// synchronous CPU - every check over the page's HTML - and on the main thread that froze the
// event loop: Fly's health check failed and progress streams stalled while audits ran.

import { parentPort } from 'node:worker_threads';
import { runFullAudit } from '@rankcli/agent-runtime';
import { installOutboundGuard, hostPort } from './url-guard.js';

// Each thread has its own `net` module, so the main thread's SSRF guard doesn't cover the
// fetches made here - install it again.
installOutboundGuard([hostPort(process.env.SUPABASE_URL || '')]);

type AuditOptions = Parameters<typeof runFullAudit>[0];

parentPort!.on('message', async (message: { id: number; options: AuditOptions }) => {
  try {
    const report = await runFullAudit(message.options);
    parentPort!.postMessage({ id: message.id, report });
  } catch (error) {
    parentPort!.postMessage({ id: message.id, error: error instanceof Error ? error.message : String(error) });
  }
});
