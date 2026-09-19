#!/usr/bin/env node
/**
 * Posts a thread to Bluesky from a JSON file ({ posts: [...] }), each post a reply to the one
 * before. Links (https://... or bare domain/path like rankcli.dev/?ref=bsky) get link facets so
 * they're clickable - plain text URLs aren't on Bluesky. {score} in the text is replaced with
 * SCORE. Refuses to post a thread whose first post is already in the account's recent feed, so
 * a re-run can't double-post.
 *
 *   node post-bluesky-thread.mjs <thread.json> [--dry-run]
 *   env: BLUESKY_IDENTIFIER, BLUESKY_APP_PASSWORD, SCORE
 */
import fs from 'node:fs';

const [file, flag] = process.argv.slice(2);
const dryRun = flag === '--dry-run';
const { posts } = JSON.parse(fs.readFileSync(file, 'utf8'));
const score = process.env.SCORE;
if (posts.some((p) => p.includes('{score}')) && !score) throw new Error('SCORE is required for this thread');

const texts = posts.map((p) => p.replaceAll('{score}', score ?? ''));
const graphemes = (s) => [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)].length;
texts.forEach((t, i) => {
  if (graphemes(t) > 300) throw new Error(`post ${i + 1} is ${graphemes(t)} graphemes; Bluesky allows 300`);
});

// Link facets: byte offsets into the UTF-8 text.
const LINK = /\bhttps?:\/\/[^\s)]+|\b(?:[a-z0-9-]+\.)+(?:dev|com|io|ai|org|net)(?:\/[^\s)]*)?/gi;
// Placeholder domains in example commands must not become links to someone's real site.
const PLACEHOLDERS = /^(?:https?:\/\/)?(?:www\.)?(?:yoursite|example|your-site|mysite)\.(?:com|dev)\b/i;
function facets(text) {
  const out = [];
  for (const m of text.matchAll(LINK)) {
    const url = m[0].replace(/[.,!?]+$/, '');
    if (PLACEHOLDERS.test(url)) continue;
    const byteStart = Buffer.byteLength(text.slice(0, m.index), 'utf8');
    out.push({
      index: { byteStart, byteEnd: byteStart + Buffer.byteLength(url, 'utf8') },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: url.startsWith('http') ? url : `https://${url}` }],
    });
  }
  return out;
}

if (dryRun) {
  texts.forEach((t, i) => {
    console.log(`--- post ${i + 1} (${graphemes(t)} graphemes) links: ${facets(t).map((f) => f.features[0].uri).join(', ') || '-'}`);
    console.log(t);
  });
  process.exit(0);
}

const api = 'https://bsky.social/xrpc';
async function call(method, body, jwt) {
  const res = await fetch(`${api}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const session = await call('com.atproto.server.createSession', {
  identifier: process.env.BLUESKY_IDENTIFIER,
  password: process.env.BLUESKY_APP_PASSWORD,
});

const feed = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${session.did}&limit=30`).then((r) => r.json());
if ((feed.feed ?? []).some((item) => item.post?.record?.text === texts[0])) {
  console.log('The thread is already posted - not posting it again.');
  process.exit(0);
}

let root = null;
let parent = null;
for (const text of texts) {
  const record = {
    $type: 'app.bsky.feed.post',
    text,
    facets: facets(text),
    createdAt: new Date().toISOString(),
    langs: ['en'],
    ...(parent ? { reply: { root, parent } } : {}),
  };
  const created = await call('com.atproto.repo.createRecord', { repo: session.did, collection: 'app.bsky.feed.post', record }, session.accessJwt);
  const ref = { uri: created.uri, cid: created.cid };
  root ??= ref;
  parent = ref;
}
const rkey = root.uri.split('/').pop();
console.log(`Posted ${texts.length} posts: https://bsky.app/profile/${session.handle}/post/${rkey}`);
