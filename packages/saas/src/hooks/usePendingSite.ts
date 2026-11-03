// Carries the site a visitor just audited on /free-audit through signup (email confirmation
// or an OAuth redirect) to the dashboard, which opens Add Project already filled in. Without
// it the visitor had to type the URL a second time before ever reaching the GitHub step,
// and on 2026-11-02 13 of 17 accounts had audited but only 1 had connected GitHub
// (docs/OUTCOME_PLAN_2026-11.md, Phase 2). Read-once, like usePendingPlan.

const PENDING_SITE_KEY = 'rankcli_pending_site';

export function normalizeSite(input: string | null | undefined): string | null {
  if (!input || input.length > 2048) return null;
  try {
    const u = new URL(input.startsWith('http') ? input : `https://${input}`);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (!u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function setPendingSite(input: string | null | undefined) {
  const site = normalizeSite(input);
  if (!site) return;
  try {
    localStorage.setItem(PENDING_SITE_KEY, site);
  } catch {
    // Storage blocked: the visitor types the URL in Add Project instead.
  }
}

export function consumePendingSite(): string | null {
  try {
    const value = localStorage.getItem(PENDING_SITE_KEY);
    if (value) localStorage.removeItem(PENDING_SITE_KEY);
    return normalizeSite(value);
  } catch {
    return null;
  }
}
