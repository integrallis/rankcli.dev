#!/usr/bin/env node
// One-click Show HN submission, plus the first comment to paste straight after.
//
// Hacker News is the only channel left with a same-day ceiling in the thousands. Reddit needs
// account standing we do not have yet, Product Hunt launches are scheduled rather than
// immediate, and paid needs a pixel that does not exist. HN takes a submission from any
// account, any time.
//
// news.ycombinator.com/submit reads `u` and `t` from the query string, so the form arrives
// filled in. The text has to be pasted: HN's submit form takes either a URL or text, not both
// in the query string, and a Show HN wants the URL.
//
//   node scripts/growth-ops/hn-launcher.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const KIT = path.join(ROOT, 'docs/launch/launch-kit-2026-09.md');
const OUT = path.join(ROOT, 'docs/launch/hn-launcher.html');

const kit = readFileSync(KIT, 'utf8');
const section = kit.slice(kit.indexOf('## Show HN'), kit.indexOf('## Reddit'));

const title = section.match(/\*\*Title\*\*[^`]*`([^`]+)`/)?.[1];
const url = section.match(/\*\*URL:\*\*\s*`([^`]+)`/)?.[1];
if (!title || !url) {
  console.error('Could not parse the title or URL from the launch kit. Refusing to guess.');
  process.exit(1);
}
if (title.length > 80) {
  console.error(`Title is ${title.length} chars; HN's limit is 80.`);
  process.exit(1);
}

/** Blockquoted lines in a section, unwrapped back into paragraphs. */
function quoted(from, to) {
  const chunk = section.slice(section.indexOf(from), to ? section.indexOf(to) : undefined);
  const lines = chunk.split('\n').filter((l) => l.trimStart().startsWith('>'));
  return lines
    .map((l) => l.replace(/^\s*>\s?/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const body = quoted('**Text:**', '**First comment');
const firstComment = quoted('**First comment', '**Before posting');

const submit = `https://news.ycombinator.com/submit?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`;

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>RankCLI: Show HN launcher</title>
<style>
  :root { color-scheme: dark; }
  body { background:#0a0a0a; color:#e4e4e7; font:15px/1.65 ui-sans-serif,system-ui,sans-serif; max-width:820px; margin:0 auto; padding:40px 20px; }
  h1 { color:#ff6600; font-size:1.5rem; margin-bottom:6px; }
  h2 { font-size:1.05rem; margin:30px 0 10px; }
  .note { color:#a1a1aa; border-left:3px solid #27272a; padding-left:14px; margin:18px 0 28px; }
  .note strong { color:#e4e4e7; }
  pre { background:#111113; border-radius:7px; padding:16px; overflow-x:auto; white-space:pre-wrap; color:#d4d4d8; font-size:13.5px; }
  .go { display:inline-block; background:#ff6600; color:#1a0d00; font-weight:700; text-decoration:none; padding:12px 20px; border-radius:7px; margin:8px 0 4px; }
  .meta { color:#71717a; font-size:12px; text-transform:uppercase; letter-spacing:.06em; }
</style></head><body>
<h1>Show HN</h1>
<p class="note">
  The button opens HN's submit form with the title and URL already filled in. The text below has
  to be pasted: HN takes a URL <em>or</em> text, and a Show HN wants the URL.<br><br>
  <strong>Post the first comment immediately afterwards.</strong> On HN the comments are the
  launch. A submission nobody answers sinks no matter how good the title is, and the first
  comment is where the specifics go.<br><br>
  <strong>Then stay for two to three hours</strong> and answer everything, including the harsh
  ones. Best window is roughly 8-10am US Eastern on a weekday.
</p>

<div class="meta">Title (${title.length}/80 chars)</div>
<pre>${esc(title)}</pre>

<div class="meta">URL</div>
<pre>${esc(url)}</pre>

<a class="go" href="${esc(submit)}" target="_blank" rel="noopener">Open HN submit, pre-filled &rarr;</a>

<h2>Text, paste into the form</h2>
<pre>${esc(body)}</pre>

<h2>First comment, post straight after</h2>
<pre>${esc(firstComment)}</pre>
</body></html>
`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT}`);
console.log(`  title  ${title.length}/80 chars`);
console.log(`  text   ${body.length} chars`);
console.log(`  first comment ${firstComment.length} chars`);

if (!process.argv.includes('--no-open')) {
  try {
    execFileSync('open', [OUT]);
    console.log('opened in your browser');
  } catch {
    console.log(`open it with:  open ${OUT}`);
  }
}
