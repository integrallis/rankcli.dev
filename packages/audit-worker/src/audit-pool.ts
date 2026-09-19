// A small pool of worker threads that run the audit engine (audit-thread.ts), so the main event
// loop stays free for health checks, progress streams and the API while audits run.
//
// Each call audits one page. A page that takes longer than PAGE_TIMEOUT_MS gets its thread
// terminated and replaced, so a pathological page fails that page instead of hanging the job -
// the old setTimeout-based timeouts couldn't fire while the loop was blocked.

import { Worker } from 'node:worker_threads';
import type { runFullAudit } from '@rankcli/agent-runtime';

type AuditOptions = Omit<Parameters<typeof runFullAudit>[0], 'premiumChecks'>;
type AuditReport = Awaited<ReturnType<typeof runFullAudit>>;

const POOL_SIZE = Math.max(1, Number(process.env.AUDIT_THREADS) || 2);
const PAGE_TIMEOUT_MS = Math.max(10_000, Number(process.env.AUDIT_PAGE_TIMEOUT_MS) || 120_000);

// Built: dist/audit-thread.js next to dist/index.js. In development under tsx, the .ts source.
const threadUrl = import.meta.url.endsWith('.ts')
  ? new URL('./audit-thread.ts', import.meta.url)
  : new URL('./audit-thread.js', import.meta.url);
const execArgv = import.meta.url.endsWith('.ts') ? ['--import', 'tsx'] : [];

interface Task {
  id: number;
  options: AuditOptions;
  resolve: (report: AuditReport) => void;
  reject: (error: Error) => void;
}

interface Slot {
  worker: Worker;
  task: Task | null;
  timer: NodeJS.Timeout | null;
}

let nextId = 1;
const queue: Task[] = [];
const slots: Slot[] = [];

function spawn(): Slot {
  const slot: Slot = { worker: new Worker(threadUrl, { execArgv }), task: null, timer: null };
  slot.worker.on('message', (message: { id: number; report?: AuditReport; error?: string }) => {
    const task = slot.task;
    if (!task || task.id !== message.id) return;
    finish(slot);
    if (message.error !== undefined) task.reject(new Error(message.error));
    else task.resolve(message.report!);
  });
  slot.worker.on('error', (error) => replace(slot, error));
  slot.worker.on('exit', (code) => {
    if (slot.task) replace(slot, new Error(`Audit thread exited (code ${code})`));
  });
  return slot;
}

function finish(slot: Slot) {
  if (slot.timer) clearTimeout(slot.timer);
  slot.timer = null;
  slot.task = null;
  pump();
}

// A crashed or timed-out thread is replaced; its task fails, the rest of the queue goes on.
function replace(slot: Slot, error: Error) {
  const task = slot.task;
  if (slot.timer) clearTimeout(slot.timer);
  slot.task = null;
  slot.timer = null;
  slot.worker.removeAllListeners();
  slot.worker.terminate().catch(() => {});
  const index = slots.indexOf(slot);
  if (index >= 0) slots[index] = spawn();
  task?.reject(error);
  pump();
}

function pump() {
  for (const slot of slots) {
    if (slot.task || queue.length === 0) continue;
    const task = queue.shift()!;
    slot.task = task;
    slot.timer = setTimeout(
      () => replace(slot, new Error(`Page audit timed out after ${Math.round(PAGE_TIMEOUT_MS / 1000)}s`)),
      PAGE_TIMEOUT_MS,
    );
    slot.worker.postMessage({ id: task.id, options: task.options });
  }
}

/** Audit one page (or run a quick audit) off the main thread. */
export function runAuditOffThread(options: AuditOptions): Promise<AuditReport> {
  if (slots.length === 0) for (let i = 0; i < POOL_SIZE; i++) slots.push(spawn());
  return new Promise((resolve, reject) => {
    queue.push({ id: nextId++, options, resolve, reject });
    pump();
  });
}

export function auditPoolStats() {
  return { threads: slots.length, busy: slots.filter((s) => s.task).length, queued: queue.length };
}
