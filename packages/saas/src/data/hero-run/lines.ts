/**
 * The landing-page terminal replays a real audit. This picks its lines out of raw.txt, the
 * untouched stdout of a published-CLI run (see scripts/record-hero-run.ts and meta.json).
 * Lines are copied verbatim apart from trailing whitespace; nothing is reworded or invented.
 */
import raw from './raw.txt?raw';
import meta from './meta.json';

export type HeroLineType = 'prompt' | 'output' | 'success' | 'error' | 'warning';
export interface HeroLine {
  type: HeroLineType;
  content: string;
  delay: number;
}

const PICK: { match: RegExp; type: HeroLineType; delay: number }[] = [
  { match: /^🔍 Running comprehensive SEO audit/, type: 'output', delay: 500 },
  { match: /^📋 Phase 1:/, type: 'output', delay: 350 },
  { match: /^📝 Phase 2:/, type: 'output', delay: 350 },
  { match: /^🔗 Phase 3:/, type: 'output', delay: 450 },
  { match: /^✅ Audit complete!/, type: 'success', delay: 500 },
  { match: /^\s+Score: \d+\/100/, type: 'success', delay: 450 },
  { match: /^\s+Framework: /, type: 'output', delay: 350 },
  { match: /^\s+(Crawlability|On-Page|Content|Performance|Security|Local SEO|AI Readiness):/, type: 'output', delay: 180 },
  { match: /^\s+● Errors:/, type: 'output', delay: 250 },
  { match: /^\s+● Warnings:/, type: 'warning', delay: 250 },
  { match: /^\s+● Notices:/, type: 'output', delay: 400 },
];

export function selectHeroLines(text: string, command: string): HeroLine[] {
  const lines: HeroLine[] = [{ type: 'prompt', content: command, delay: 1100 }];
  for (const line of text.split('\n')) {
    const pick = PICK.find((p) => p.match.test(line));
    if (pick) lines.push({ type: pick.type, content: line.trimEnd(), delay: pick.delay });
  }
  return lines;
}

export const heroRun = {
  lines: selectHeroLines(raw, meta.command),
  cliVersion: meta.cliVersion,
  recordedAt: meta.recordedAt,
  url: 'https://rankcli.dev',
};
