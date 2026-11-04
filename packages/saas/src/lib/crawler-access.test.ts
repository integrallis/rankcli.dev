import { describe, it, expect } from 'vitest';
import { crawlerAccessRows, blockedForAnswers } from './crawler-access';

describe('crawler access from finding codes', () => {
  it('reads every class as allowed when no finding says otherwise', () => {
    const rows = crawlerAccessRows([{ code: 'TITLE_TOO_SHORT' }]);
    expect(rows.map((r) => `${r.cls}:${r.status}`)).toEqual(['search:allowed', 'ai-search:allowed', 'user:allowed', 'training:allowed']);
    expect(blockedForAnswers(rows)).toEqual([]);
  });

  it('tells an edge refusal from a robots.txt disallow, per class', () => {
    const rows = crawlerAccessRows([
      { code: 'AI_SEARCH_CRAWLER_BLOCKED_AT_EDGE', title: 'Claude-SearchBot refused at the edge (403)' },
      { code: 'AI_TRAINING_BOTS_DISALLOWED', title: 'Training crawlers disallowed in robots.txt' },
    ]);
    const by = Object.fromEntries(rows.map((r) => [r.cls, r]));
    expect(by['ai-search'].status).toBe('edge');
    expect(by['ai-search'].finding).toMatch(/403/);
    expect(by.training.status).toBe('robots');
    expect(by.search.status).toBe('allowed');
    expect(blockedForAnswers(rows).map((r) => r.cls)).toEqual(['ai-search']);
  });

  it('prefers the edge finding when both exist for a class', () => {
    const rows = crawlerAccessRows([{ code: 'AI_USER_FETCH_BLOCKED_AT_EDGE' }, { code: 'AI_USER_FETCH_DISALLOWED' }]);
    expect(rows.find((r) => r.cls === 'user')?.status).toBe('edge');
  });
});
