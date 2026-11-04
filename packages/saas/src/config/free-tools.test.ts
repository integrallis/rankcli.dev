import { describe, it, expect } from 'vitest';
import { FREE_TOOLS, findFreeTool, toolShowsFinding } from './free-tools';

describe('the free tools', () => {
  it('have unique slugs, a question for a heading, and three real answers each', () => {
    expect(new Set(FREE_TOOLS.map((t) => t.slug)).size).toBe(FREE_TOOLS.length);
    for (const t of FREE_TOOLS) {
      expect(t.h1.endsWith('?'), t.slug).toBe(true);
      expect(t.faq).toHaveLength(3);
      expect(t.description.length).toBeLessThanOrEqual(240);
      expect(t.codes.length).toBeGreaterThan(0);
    }
  });

  it('routes a finding to the page that answers its question', () => {
    const access = findFreeTool('ai-crawler-access')!;
    expect(toolShowsFinding(access, { code: 'AI_SEARCH_CRAWLER_BLOCKED_AT_EDGE' })).toBe(true);
    expect(toolShowsFinding(access, { code: 'ROBOTS_TXT_MISSING' })).toBe(true);
    expect(toolShowsFinding(access, { code: 'TITLE_TOO_SHORT' })).toBe(false);
    const schema = findFreeTool('structured-data-checker')!;
    expect(toolShowsFinding(schema, { code: 'ORGANIZATION_SCHEMA_MISSING' })).toBe(true);
    expect(toolShowsFinding(schema, { code: 'H1_MISSING', category: 'Structured Data' })).toBe(true);
    const headers = findFreeTool('security-headers-checker')!;
    expect(toolShowsFinding(headers, { code: 'CSP_MISSING' })).toBe(true);
    expect(toolShowsFinding(headers, { code: 'LLMS_TXT_MISSING' })).toBe(false);
  });
});
