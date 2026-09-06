#!/usr/bin/env node
// Submits rankcli.dev's sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver).
// Run after publishing new/changed pages: node scripts/indexnow-submit.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const KEY = 'fd97e4b25c809163069e846413c8390d';
const HOST = 'rankcli.dev';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sitemapPath = path.join(__dirname, '..', 'packages', 'saas', 'public', 'sitemap.xml');
const sitemap = readFileSync(sitemapPath, 'utf8');
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});

console.log(`Submitted ${urlList.length} URLs, status ${res.status}`);
if (!res.ok) console.log(await res.text());
