#!/usr/bin/env node
// Build one-click, pre-filled Reddit submit links for the curated posts.
//
// The API route is blocked: since 2026 Reddit holds new OAuth apps behind manual approval under
// the Responsible Builder Policy, so `create app` returns the policy page instead of
// credentials. That leaves the composer - but nobody should be pasting a 2,000-character post
// by hand either.
//
// Reddit's submit form reads `title` and `text` from the query string, so the composer opens
// already filled in. The remaining human step is reading it once and pressing Post, which is
// the step that should stay human anyway.
//
//   node scripts/growth-ops/reddit-prefill.mjs        # writes and opens the launcher
//   node scripts/growth-ops/reddit-prefill.mjs --no-open

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'docs/launch/reddit-launcher.html');

const config = JSON.parse(readFileSync(path.join(ROOT, 'docs/launch/campaign-config.json'), 'utf8'));
const posts = config.channels?.reddit?.content_calendar ?? [];
if (posts.length === 0) {
  console.error('No curated posts found. Run sync-reddit-calendar.mjs first.');
  process.exit(1);
}

const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Recommended order and spacing: news first, and never two subreddits on the same day.
const ORDER = ['webdev', 'SideProject', 'programming', 'SaaS'];
const ordered = [...posts].sort(
  (a, b) => ORDER.indexOf(a.subreddit) - ORDER.indexOf(b.subreddit)
);

const cards = ordered
  .map((p, i) => {
    const url =
      `https://www.reddit.com/r/${p.subreddit}/submit?type=TEXT` +
      `&title=${encodeURIComponent(p.title)}` +
      `&text=${encodeURIComponent(p.body)}`;
    const day = i * 2 + 1;
    return `  <article>
    <div class="meta">Day ${day} &middot; r/${escape(p.subreddit)} &middot; ${url.length} chars</div>
    <h2>${escape(p.title)}</h2>
    <pre>${escape(p.body)}</pre>
    <a class="go" href="${escape(url)}" target="_blank" rel="noopener">Open pre-filled in r/${escape(p.subreddit)} &rarr;</a>
  </article>`;
  })
  .join('\n');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>RankCLI — Reddit launcher</title>
<style>
  :root { color-scheme: dark; }
  body { background:#0a0a0a; color:#e4e4e7; font:15px/1.6 ui-sans-serif,system-ui,sans-serif; max-width:820px; margin:0 auto; padding:40px 20px; }
  h1 { color:#22c55e; font-size:1.5rem; }
  .note { color:#a1a1aa; border-left:3px solid #27272a; padding-left:14px; margin:20px 0 32px; }
  article { border:1px solid #27272a; border-radius:10px; padding:20px; margin:0 0 26px; }
  .meta { color:#71717a; font-size:12px; text-transform:uppercase; letter-spacing:.06em; }
  h2 { font-size:1.05rem; margin:8px 0 12px; }
  pre { background:#111113; border-radius:7px; padding:14px; overflow-x:auto; white-space:pre-wrap; color:#a1a1aa; font-size:13px; max-height:220px; }
  .go { display:inline-block; margin-top:14px; background:#22c55e; color:#04120a; font-weight:600; text-decoration:none; padding:10px 16px; border-radius:7px; }
  .go:hover { filter:brightness(1.1); }
</style></head><body>
<h1>Reddit launcher</h1>
<p class="note">
  Each button opens Reddit's composer with the title and body already filled in. Read it, then
  press Post. One post every two days, in a different subreddit each time &mdash; posting several
  at once is the pattern that trips spam filters. Tue&ndash;Thu, 8&ndash;10am ET is best.<br><br>
  Then reply to comments for the first two hours. That matters more than the post text.
</p>
${cards}
</body></html>
`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT}`);
for (const p of ordered) console.log(`  r/${p.subreddit}`);

if (!process.argv.includes('--no-open')) {
  try {
    execFileSync('open', [OUT]);
    console.log('\nopened in your browser');
  } catch {
    console.log(`\nopen it with:  open ${OUT}`);
  }
}
