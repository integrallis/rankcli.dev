import { describe, it, expect, beforeEach, vi } from 'vitest';
import { normalizeSite, setPendingSite, consumePendingSite } from './usePendingSite';

describe('pending site from the free audit', () => {
  // Node 26 ships its own localStorage, which shadows jsdom's and is undefined without
  // --localstorage-file, so each test gets a fresh in-memory one.
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    });
  });

  it('survives until the dashboard reads it, once', () => {
    setPendingSite('example.com');
    expect(consumePendingSite()).toBe('https://example.com/');
    expect(consumePendingSite()).toBeNull();
  });

  it('refuses anything that is not a web URL', () => {
    expect(normalizeSite('javascript:alert(1)')).toBeNull();
    expect(normalizeSite('localhost')).toBeNull();
    expect(normalizeSite('')).toBeNull();
    expect(normalizeSite(`https://a.com/${'x'.repeat(3000)}`)).toBeNull();
  });
});
