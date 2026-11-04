// The crawler-access table for a free audit, derived from the audit's own finding codes: the
// engine reports access by bot class (audit/checks/ai-bots.ts in integrallis/rankcli), one
// code per class and cause. Nothing here guesses; a class is "allowed" when no finding says
// otherwise for the page that was fetched.
export type CrawlerClass = 'search' | 'ai-search' | 'user' | 'training';
export type AccessStatus = 'allowed' | 'edge' | 'robots';

export interface CrawlerAccessRow {
  cls: CrawlerClass;
  label: string;
  bots: string;
  status: AccessStatus;
  /** The finding that set the status, when there is one. */
  finding?: string;
  /** What blocking this class costs, in the words the audit uses. */
  cost: string;
}

const EDGE: Record<CrawlerClass, string> = {
  search: 'SEARCH_CRAWLER_BLOCKED_AT_EDGE',
  'ai-search': 'AI_SEARCH_CRAWLER_BLOCKED_AT_EDGE',
  user: 'AI_USER_FETCH_BLOCKED_AT_EDGE',
  training: 'AI_TRAINING_CRAWLER_BLOCKED_AT_EDGE',
};
const ROBOTS: Record<CrawlerClass, string[]> = {
  search: ['ROBOTS_TXT_BLOCKS_ALL', 'ROBOTS_BLOCKS_ALL', 'ROBOTS_TXT_DISALLOW_ALL', 'SEARCH_BOTS_DISALLOWED'],
  'ai-search': ['AI_SEARCH_BOTS_DISALLOWED'],
  user: ['AI_USER_FETCH_DISALLOWED'],
  training: ['AI_TRAINING_BOTS_DISALLOWED'],
};
const META: Record<CrawlerClass, { label: string; bots: string; cost: string }> = {
  search: { label: 'Search crawlers', bots: 'Googlebot, bingbot', cost: 'the index most AI answers draw from' },
  'ai-search': { label: 'AI search crawlers', bots: 'OAI-SearchBot, Claude-SearchBot, PerplexityBot', cost: "that assistant's own answers" },
  user: { label: 'User-triggered fetchers', bots: 'ChatGPT-User, Claude-User, Perplexity-User', cost: 'the page when a user asks about it' },
  training: { label: 'Training crawlers', bots: 'GPTBot, ClaudeBot, CCBot', cost: 'nothing a user sees; disallowing them is a policy choice' },
};

export function crawlerAccessRows(issues: Array<{ code: string; title?: string }>): CrawlerAccessRow[] {
  const byCode = new Map(issues.map((i) => [i.code, i]));
  return (Object.keys(META) as CrawlerClass[]).map((cls) => {
    const edge = byCode.get(EDGE[cls]);
    const robots = ROBOTS[cls].map((c) => byCode.get(c)).find(Boolean);
    const status: AccessStatus = edge ? 'edge' : robots ? 'robots' : 'allowed';
    return { cls, ...META[cls], status, finding: (edge ?? robots)?.title };
  });
}

/** The classes whose block costs visibility: search and AI search. */
export function blockedForAnswers(rows: CrawlerAccessRow[]): CrawlerAccessRow[] {
  return rows.filter((r) => r.status !== 'allowed' && (r.cls === 'search' || r.cls === 'ai-search'));
}
