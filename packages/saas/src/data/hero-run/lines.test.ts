import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { selectHeroLines } from './lines';
import meta from './meta.json';

const raw = readFileSync(path.join(__dirname, 'raw.txt'), 'utf8');

describe('hero terminal replays a real run', () => {
  const lines = selectHeroLines(raw, meta.command);

  it('copies every output line verbatim from the recorded stdout', () => {
    const rawLines = raw.split('\n').map((l) => l.trimEnd());
    for (const line of lines.slice(1)) expect(rawLines).toContain(line.content);
  });

  it('shows the score the run actually reported', () => {
    const score = raw.match(/Score: (\d+)\/100/)?.[1];
    expect(score).toBeDefined();
    expect(lines.some((l) => l.content.includes(`Score: ${score}/100`))).toBe(true);
  });

  it('starts with the command that was run, and the run completed', () => {
    expect(lines[0]).toMatchObject({ type: 'prompt', content: meta.command });
    expect(meta.exitCode).toBe(0);
  });

  it('carries every health score row and the severity counts', () => {
    for (const label of ['Crawlability', 'On-Page', 'Content', 'Performance', 'Security', 'Local SEO', 'AI Readiness', 'Errors', 'Warnings', 'Notices']) {
      expect(lines.some((l) => l.content.includes(label))).toBe(true);
    }
  });
});
