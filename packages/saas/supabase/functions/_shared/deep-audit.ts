// Starts a deep audit of a project on the audit worker: creates the audits row, sets the audit
// depth from the owner's plan, and hands the job to the worker with AUDIT_WORKER_SECRET (held
// server-side only). Used by start-deep-audit (the dashboard's "Run audit") and
// run-scheduled-audits (the plan's automatic weekly/daily audits), so both audit the same way.

import { getEntitlement, type BaseTier } from './tier.ts';
import { resolveAIConfig } from './resolve-ai-config.ts';

const WORKER_URL = Deno.env.get('AUDIT_WORKER_URL') || 'https://rankcli-audit-worker.fly.dev';
const WORKER_SECRET = Deno.env.get('AUDIT_WORKER_SECRET') || '';

// Every plan runs every check ("all 280+ checks on every plan"); paid plans crawl deeper and
// get AI analysis on the user's own key. Free used to get 50 checks here - fewer than an
// anonymous visitor's free audit.
export const AUDIT_DEPTH: Record<BaseTier, { maxPages: number; checksLimit: number; ai: boolean }> = {
  free: { maxPages: 1, checksLimit: 280, ai: false },
  solo: { maxPages: 10, checksLimit: 280, ai: true },
  pro: { maxPages: 10, checksLimit: 280, ai: true },
  agency: { maxPages: 10, checksLimit: 280, ai: true },
};

export type DispatchResult =
  | { ok: true; audit: Record<string, unknown>; workerInstance: string | null; tier: BaseTier; aiAnalysis: 'enabled' | 'no_key' | 'plan' }
  | { ok: false; status: number; error: string; audit?: Record<string, unknown> };

export async function dispatchDeepAudit(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  opts: {
    project: { id: string; url: string; user_id: string };
    triggeredBy: 'manual' | 'scheduled';
    triggeredByUser?: string | null;
  },
): Promise<DispatchResult> {
  if (!WORKER_SECRET) return { ok: false, status: 500, error: 'Audit worker not configured' };
  const { project } = opts;

  const { tier } = await getEntitlement(supabase, project.user_id);
  const depth = AUDIT_DEPTH[tier];
  const ai = depth.ai ? await resolveAIConfig(supabase, project.user_id) : null;
  const aiConfig = ai?.ok ? ai.config : undefined;

  const { data: audit, error: auditError } = await supabase
    .from('audits')
    .insert({
      project_id: project.id,
      triggered_by: opts.triggeredBy,
      triggered_by_user: opts.triggeredByUser ?? null,
      status: 'pending',
    })
    .select()
    .single();
  if (auditError || !audit) return { ok: false, status: 500, error: auditError?.message || 'Could not create audit' };

  const workerResponse = await fetch(`${WORKER_URL}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WORKER_SECRET}` },
    body: JSON.stringify({
      auditId: audit.id,
      projectId: project.id,
      url: project.url,
      maxPages: depth.maxPages,
      checksLimit: depth.checksLimit,
      enableAI: !!aiConfig,
      aiConfig,
    }),
  }).catch((err) => err as Error);

  if (workerResponse instanceof Error || !workerResponse.ok) {
    const status = workerResponse instanceof Error ? 0 : workerResponse.status;
    const detail = workerResponse instanceof Error ? workerResponse.message : await workerResponse.text().catch(() => '');
    console.error('Audit worker rejected job:', status, detail);
    await supabase
      .from('audits')
      .update({ status: 'failed', error_message: `Audit worker error (${status || 'unreachable'})` })
      .eq('id', audit.id);
    return { ok: false, status: 502, error: 'Could not start the audit', audit: { ...audit, status: 'failed' } };
  }

  // The worker runs on several machines with jobs in memory; the dashboard streams progress
  // from the one running this audit by passing its id as /stream/:auditId?instance=.
  const { instance } = await workerResponse.json().catch(() => ({} as { instance?: string }));
  return {
    ok: true,
    audit,
    workerInstance: instance || null,
    tier,
    aiAnalysis: !depth.ai ? 'plan' : aiConfig ? 'enabled' : 'no_key',
  };
}
