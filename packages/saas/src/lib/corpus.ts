/**
 * The corpus dataset: the homepages of the 400 most popular npm packages, audited weekly by
 * https://github.com/integrallis/rankcli/blob/main/corpus/README.md and published on that
 * repository's `corpus-data` branch. This module only reads and shapes it.
 */

export const CORPUS_LATEST_URL = 'https://raw.githubusercontent.com/integrallis/rankcli/corpus-data/latest.json';
export const CORPUS_README_URL = 'https://github.com/integrallis/rankcli/blob/main/corpus/README.md';

export interface CorpusFacts {
  edgeBlocked: Record<string, string[]>;
  robotsDisallowed: Record<string, string[] | boolean>;
  metadataStreamedForBots: boolean;
  metadataOutsideHead: boolean;
  clientRendered: boolean;
  llmsTxt: boolean;
  sitemap: boolean;
  sitemapLastmodUniform: boolean;
  sitemapLastmodMissing: boolean;
  indexNow: boolean;
  cloudflareAmbiguous: boolean;
  uncitedStatistics: boolean;
}

export interface CorpusSite {
  origin: string;
  packages: string[];
  exitCode: number;
  score?: number;
  aiReadiness?: number | null;
  framework?: string | null;
  counts?: { errors: number; warnings: number; notices: number };
  facts?: CorpusFacts;
  error?: string;
}

export interface CorpusDataset {
  auditedAt: string;
  cliVersion?: string;
  headlines: Record<string, number | Record<string, unknown> | null>;
  results: CorpusSite[];
}

export interface Headline {
  key: string;
  label: string;
  count: number;
  share: number;
}

const HEADLINE_LABELS: Array<[string, string]> = [
  ['llmsTxt', 'publish an llms.txt'],
  ['noSitemap', 'have no sitemap'],
  ['sitemapLastmodUniform', 'stamp one date on every sitemap URL'],
  ['clientRendered', 'client-render the homepage'],
  ['edgeRefusesSearchCrawler', 'refuse Googlebot or bingbot at the edge'],
  ['edgeRefusesAiSearchCrawler', 'refuse an AI search crawler at the edge'],
  ['edgeRefusesUserFetcher', 'refuse a user-triggered fetcher at the edge'],
  ['edgeRefusesTrainingCrawler', 'refuse a training crawler at the edge'],
  ['robotsDisallowsAiSearch', 'disallow the AI search crawlers in robots.txt'],
  ['robotsDisallowsTraining', 'disallow the training crawlers in robots.txt'],
  ['metadataStreamedForBots', 'serve their metadata to Googlebot and to no other agent'],
  ['indexNow', 'have an IndexNow key'],
];

/** The headline counts as "N sites (share) do X", in the order the page shows them. */
export function headlines(dataset: CorpusDataset): Headline[] {
  const audited = Number(dataset.headlines.audited ?? 0);
  return HEADLINE_LABELS.flatMap(([key, label]) => {
    const value = dataset.headlines[key];
    if (typeof value !== 'number') return [];
    return [{ key, label, count: value, share: audited ? value / audited : 0 }];
  });
}

/** One line of flags for a site's row. */
export function siteFlags(site: CorpusSite): string[] {
  const f = site.facts;
  if (!f) return [];
  const flags: string[] = [];
  for (const [cls, bots] of Object.entries(f.edgeBlocked ?? {})) flags.push(`edge refuses ${cls}: ${bots.join(', ')}`);
  for (const [cls, bots] of Object.entries(f.robotsDisallowed ?? {})) {
    if (cls === 'all') flags.push('robots.txt disallows every AI crawler');
    else if (Array.isArray(bots)) flags.push(`robots.txt disallows ${cls}: ${bots.join(', ')}`);
  }
  if (f.metadataStreamedForBots) flags.push('metadata only for Googlebot');
  if (f.clientRendered) flags.push('client-rendered');
  if (f.llmsTxt) flags.push('llms.txt');
  if (!f.sitemap) flags.push('no sitemap');
  else if (f.sitemapLastmodUniform) flags.push('one lastmod for every URL');
  if (f.indexNow) flags.push('IndexNow');
  return flags;
}

export function frameworksOf(dataset: CorpusDataset): string[] {
  const seen = new Map<string, number>();
  for (const site of dataset.results) if (site.facts) seen.set(site.framework ?? 'unknown', (seen.get(site.framework ?? 'unknown') ?? 0) + 1);
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}
