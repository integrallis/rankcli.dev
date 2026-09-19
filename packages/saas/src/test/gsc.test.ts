import { describe, it, expect } from 'vitest';
import { matchProperty, dateWindow, totals } from '../../supabase/functions/_shared/gsc.ts';

describe('Search Console property matching', () => {
  const properties = [
    { siteUrl: 'sc-domain:example.com', permissionLevel: 'siteOwner' },
    { siteUrl: 'https://www.example.com/', permissionLevel: 'siteFullUser' },
    { siteUrl: 'https://other.dev/', permissionLevel: 'siteOwner' },
    { siteUrl: 'https://unverified.dev/', permissionLevel: 'siteUnverifiedUser' },
  ];

  it('prefers the URL-prefix property for the project origin, www or not', () => {
    expect(matchProperty('https://example.com', properties)).toBe('https://www.example.com/');
    expect(matchProperty('example.com/pricing', properties)).toBe('https://www.example.com/');
  });

  it('falls back to the domain property', () => {
    expect(matchProperty('https://example.com', properties.filter((p) => !p.siteUrl.startsWith('https://www')))).toBe('sc-domain:example.com');
  });

  it('never picks a property the account cannot read, or another site', () => {
    expect(matchProperty('https://unverified.dev', properties)).toBeNull();
    expect(matchProperty('https://nope.dev', properties)).toBeNull();
    expect(matchProperty('not a url', properties)).toBeNull();
  });
});

describe('Search Console data window and totals', () => {
  it('covers the last N days of data, allowing for the two-day lag', () => {
    expect(dateWindow(28, new Date('2026-09-19T12:00:00Z'))).toEqual({ startDate: '2026-08-21', endDate: '2026-09-17' });
  });

  it('adds clicks and impressions, recomputes CTR and weights position by impressions', () => {
    const sum = totals([
      { clicks: 10, impressions: 100, ctr: 0.1, position: 2 },
      { clicks: 0, impressions: 300, ctr: 0, position: 10 },
    ]);
    expect(sum).toEqual({ clicks: 10, impressions: 400, ctr: 0.025, position: 8 });
    expect(totals([])).toEqual({ clicks: 0, impressions: 0, ctr: 0, position: 0 });
  });
});
