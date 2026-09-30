#!/usr/bin/env node
// Post one item from the curated calendar to Reddit, via the API.
//
// No browser, no copy-paste. growth-ops.yml has had this capability since launch and has never
// used it, because the REDDIT_* credentials were never added - so every "post to Reddit" step
// resolved to a human pasting text. This is the same OAuth password grant, runnable on demand
// against a chosen calendar entry, so a post is one command.
//
// Credentials, from a "script" app at https://www.reddit.com/prefs/apps:
//   REDDIT_CLIENT_ID      the string under the app name
//   REDDIT_CLIENT_SECRET  the "secret" field
//   REDDIT_USERNAME       the account that will author the post
//   REDDIT_PASSWORD       that account's password
// Read from .env, or the environment if set there.
//
// Usage:
//   node scripts/growth-ops/reddit-post.mjs --list
//   node scripts/growth-ops/reddit-post.mjs --slot 2 --dry-run
//   node scripts/growth-ops/reddit-post.mjs --slot 2

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');

function env(key) {
  if (process.env[key]) return process.env[key];
  try {
    return readFileSync(path.join(ROOT, '.env'), 'utf8').match(
      new RegExp(`^${key}=(.*)$`, 'm')
    )?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const config = JSON.parse(
  readFileSync(path.join(ROOT, 'docs/launch/campaign-config.json'), 'utf8')
);
const calendar = config.channels?.reddit?.content_calendar ?? [];

const args = process.argv.slice(2);
const slot = args.includes('--slot') ? Number(args[args.indexOf('--slot') + 1]) : null;
const dryRun = args.includes('--dry-run');

if (args.includes('--list') || slot === null) {
  console.log('Curated posts in docs/launch/campaign-config.json:\n');
  calendar.forEach((item, i) => {
    console.log(`  [${i}] r/${item.subreddit}`);
    console.log(`      ${item.title}`);
  });
  console.log('\nPost one with:  --slot <n>   (add --dry-run to preview)');
  process.exit(0);
}

const item = calendar[slot];
if (!item) {
  console.error(`No calendar entry at slot ${slot}. Run --list to see them.`);
  process.exit(1);
}

if (dryRun) {
  console.log(`DRY RUN — nothing posted\n`);
  console.log(`subreddit: r/${item.subreddit}`);
  console.log(`title:     ${item.title}\n`);
  console.log(item.body);
  process.exit(0);
}

const missing = ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USERNAME', 'REDDIT_PASSWORD']
  .filter((k) => !env(k));
if (missing.length) {
  console.error(`Missing credentials: ${missing.join(', ')}`);
  console.error('Create a "script" app at https://www.reddit.com/prefs/apps and add them to .env');
  process.exit(1);
}

const UA = 'RankCLI-GrowthOps/1.0 (by /u/' + env('REDDIT_USERNAME') + ')';

const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
  method: 'POST',
  headers: {
    Authorization:
      'Basic ' + Buffer.from(`${env('REDDIT_CLIENT_ID')}:${env('REDDIT_CLIENT_SECRET')}`).toString('base64'),
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': UA,
  },
  body: new URLSearchParams({
    grant_type: 'password',
    username: env('REDDIT_USERNAME'),
    password: env('REDDIT_PASSWORD'),
  }),
});
const token = await tokenRes.json();
if (!token.access_token) {
  console.error('Auth failed:', JSON.stringify(token).slice(0, 300));
  console.error('A 401 here usually means the app is not type "script", or 2FA is on the account.');
  process.exit(1);
}

const submitRes = await fetch('https://oauth.reddit.com/api/submit', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token.access_token}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': UA,
  },
  body: new URLSearchParams({
    sr: item.subreddit,
    kind: 'self',
    title: item.title,
    text: item.body,
    api_type: 'json',
  }),
});
const out = await submitRes.json();

// Reddit answers 200 with the failure inside the body, so the status alone proves nothing.
const errors = out?.json?.errors ?? [];
if (errors.length) {
  console.error('Reddit rejected the post:');
  for (const e of errors) console.error('  ', e.join(' | '));
  process.exit(1);
}
const url = out?.json?.data?.url;
if (!url) {
  console.error('No URL returned; raw response:', JSON.stringify(out).slice(0, 400));
  process.exit(1);
}
console.log(`posted to r/${item.subreddit}`);
console.log(url);
