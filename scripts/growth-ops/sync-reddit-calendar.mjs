#!/usr/bin/env node
// Sync the curated Reddit posts from the markdown humans edit into the JSON the automation reads.
//
// There were two copies. reddit-posting-plan.md is where the posts get written and corrected;
// campaign-config.json is what growth-ops and reddit-post.mjs actually send. They drifted
// immediately: the markdown had the r/SideProject post rewritten around a score of 75 after the
// AI-readiness bug was fixed, while the config still offered to post "71/100, and our AI
// Readiness is 1%" - a stale number and a measurement we had since proven was broken.
//
// So the markdown is the source and this writes it into the config. Run it after editing posts.
//
//   node scripts/growth-ops/sync-reddit-calendar.mjs --check   # CI: fail if they disagree
//   node scripts/growth-ops/sync-reddit-calendar.mjs           # write the config

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const PLAN = path.join(ROOT, 'docs/launch/reddit-posting-plan.md');
const CONFIG = path.join(ROOT, 'docs/launch/campaign-config.json');

/**
 * Parse the "## Day N — r/sub" sections. Each has a **Title** fenced block and a **Body** one.
 * Deliberately strict: a section that does not match this shape is skipped loudly rather than
 * half-parsed, because a silently truncated post is worse than no post.
 */
function parsePlan(markdown) {
  const posts = [];
  const sections = markdown.split(/^## Day \d+ — r\//m).slice(1);
  for (const section of sections) {
    const subreddit = section.match(/^([A-Za-z0-9_]+)/)?.[1];
    const blocks = [...section.matchAll(/```\n([\s\S]*?)\n```/g)].map((m) => m[1]);
    if (!subreddit || blocks.length < 2) {
      console.warn(`  skipped a section (subreddit=${subreddit}, blocks=${blocks.length})`);
      continue;
    }
    posts.push({ subreddit, title: blocks[0].trim(), body: blocks[1].trim() });
  }
  return posts;
}

const parsed = parsePlan(readFileSync(PLAN, 'utf8'));
if (parsed.length === 0) {
  console.error('Parsed no posts from the plan; refusing to empty the calendar.');
  process.exit(1);
}

const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
const current = config.channels.reddit.content_calendar ?? [];

const same =
  current.length === parsed.length &&
  current.every(
    (c, i) =>
      c.subreddit === parsed[i].subreddit &&
      c.title === parsed[i].title &&
      c.body === parsed[i].body
  );

if (process.argv.includes('--check')) {
  if (same) {
    console.log(`in sync (${parsed.length} posts)`);
    process.exit(0);
  }
  console.error('campaign-config.json disagrees with reddit-posting-plan.md.');
  console.error('Run: node scripts/growth-ops/sync-reddit-calendar.mjs');
  for (let i = 0; i < Math.max(current.length, parsed.length); i++) {
    if (
      current[i]?.title !== parsed[i]?.title ||
      current[i]?.body !== parsed[i]?.body ||
      current[i]?.subreddit !== parsed[i]?.subreddit
    ) {
      console.error(`  [${i}] r/${parsed[i]?.subreddit ?? '?'} differs`);
    }
  }
  process.exit(1);
}

config.channels.reddit.content_calendar = parsed;
writeFileSync(CONFIG, JSON.stringify(config, null, 2) + '\n');
console.log(`wrote ${parsed.length} posts into campaign-config.json`);
for (const p of parsed) console.log(`  r/${p.subreddit.padEnd(14)} ${p.title.slice(0, 62)}`);
