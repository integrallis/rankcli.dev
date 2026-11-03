import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildSignupSource, captureSignupSource, peekSignupSource, clearSignupSource } from './useSignupSource';

describe('signup source (first touch)', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    });
    vi.stubGlobal('window', { location: { hostname: 'rankcli.dev', search: '', pathname: '/' } });
    vi.stubGlobal('document', { referrer: '' });
  });

  it('keeps the UTM parameters, the landing path and the referrer host, nothing else', () => {
    const s = buildSignupSource('?utm_source=reddit&utm_campaign=nov&foo=bar', '/free-audit', 'https://www.reddit.com/r/webdev/comments/x', new Date('2026-11-03T18:00:00Z'));
    expect(s).toEqual({ utm_source: 'reddit', utm_campaign: 'nov', landing_path: '/free-audit', referrer: 'www.reddit.com', captured_at: '2026-11-03T18:00:00.000Z' });
  });

  it('stores nothing for a direct visit to the homepage', () => {
    expect(buildSignupSource('', '/', '')).toBeNull();
    captureSignupSource();
    expect(peekSignupSource()).toBeNull();
  });

  it('ignores a referrer on the same host and truncates long values', () => {
    const s = buildSignupSource(`?utm_source=${'x'.repeat(300)}`, '/docs', 'https://rankcli.dev/blog');
    expect(s?.utm_source).toHaveLength(100);
    expect(s?.referrer).toBeUndefined();
  });

  it('first touch wins and clear forgets it', () => {
    window.location.search = '?utm_source=hn';
    captureSignupSource();
    window.location.search = '?utm_source=later';
    captureSignupSource();
    expect(peekSignupSource()?.utm_source).toBe('hn');
    clearSignupSource();
    expect(peekSignupSource()).toBeNull();
  });
});
