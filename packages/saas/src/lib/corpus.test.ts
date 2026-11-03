import { describe, it, expect } from 'vitest';
import { headlines, siteFlags, frameworksOf, type CorpusDataset, type CorpusSite } from './corpus';

const facts = (over: Partial<CorpusSite['facts']> = {}): NonNullable<CorpusSite['facts']> => ({
  edgeBlocked: {},
  robotsDisallowed: {},
  metadataStreamedForBots: false,
  metadataOutsideHead: false,
  clientRendered: false,
  llmsTxt: false,
  sitemap: true,
  sitemapLastmodUniform: false,
  sitemapLastmodMissing: false,
  indexNow: false,
  cloudflareAmbiguous: false,
  uncitedStatistics: false,
  ...over,
});

const dataset: CorpusDataset = {
  auditedAt: '2026-11-03T08:00:00.000Z',
  cliVersion: '0.0.54',
  headlines: { sites: 4, audited: 3, llmsTxt: 2, noSitemap: 1, edgeRefusesSearchCrawler: 1, indexNow: 0, medianScore: 70, frameworks: { 'Next.js': 2 } },
  results: [
    { origin: 'https://a.dev', packages: ['a'], exitCode: 0, score: 80, aiReadiness: 85, framework: 'Next.js', facts: facts({ llmsTxt: true }) },
    { origin: 'https://b.dev', packages: ['b'], exitCode: 0, score: 60, aiReadiness: 70, framework: 'Astro', facts: facts({ sitemap: false, edgeBlocked: { search: ['Googlebot:403'] }, robotsDisallowed: { training: ['GPTBot'] } }) },
    { origin: 'https://c.dev', packages: ['c'], exitCode: 0, score: 75, aiReadiness: 80, framework: 'Next.js', facts: facts({ llmsTxt: true, sitemapLastmodUniform: true, metadataStreamedForBots: true }) },
    { origin: 'https://d.dev', packages: ['d'], exitCode: 3, error: 'Page returns HTTP 404' },
  ],
};

describe('corpus dataset shaping', () => {
  it('turns the headline counts into shares of the audited sites, in page order, skipping what the run did not count', () => {
    const h = headlines(dataset);
    expect(h.map((x) => x.key)).toEqual(['llmsTxt', 'noSitemap', 'edgeRefusesSearchCrawler', 'indexNow']);
    expect(h[0]).toMatchObject({ count: 2, share: 2 / 3, label: 'publish an llms.txt' });
    expect(h[3]).toMatchObject({ count: 0, share: 0 });
  });

  it('describes a site by the facts the audit observed, nothing else', () => {
    expect(siteFlags(dataset.results[0])).toEqual(['llms.txt']);
    expect(siteFlags(dataset.results[1])).toEqual(['edge refuses search: Googlebot:403', 'robots.txt disallows training: GPTBot', 'no sitemap']);
    expect(siteFlags(dataset.results[2])).toEqual(['metadata only for Googlebot', 'llms.txt', 'one lastmod for every URL']);
    // No audit, no facts: an unreachable site is not a site with nothing wrong.
    expect(siteFlags(dataset.results[3])).toEqual([]);
  });

  it('lists frameworks by how many audited sites use them', () => {
    expect(frameworksOf(dataset)).toEqual(['Next.js', 'Astro']);
  });
});
