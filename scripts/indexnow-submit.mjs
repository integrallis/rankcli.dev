#!/usr/bin/env node
// Submits rankcli.dev's sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver).
// Run after publishing new/changed pages: node scripts/indexnow-submit.mjs

//
// Reads the LIVE sitemap rather than a file on disk. It used to read
// packages/saas/public/sitemap.xml, which does not exist: the sitemap is generated at build
// time into dist/. So this crashed with ENOENT and nothing was ever submitted. Fetching the
// published one also means we only ever announce URLs that are actually deployed.

const KEY = 'fd97e4b25c809163069e846413c8390d';
const HOST = 'rankcli.dev';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const sitemapResponse = await fetch(`https://${HOST}/sitemap.xml`);
if (!sitemapResponse.ok) {
  console.error(`Could not fetch https://${HOST}/sitemap.xml: ${sitemapResponse.status}`);
  process.exit(1);
}
const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

if (urlList.length === 0) {
  console.error('No <loc> entries in the sitemap; refusing to submit an empty list.');
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});

console.log(`Submitted ${urlList.length} URLs, status ${res.status}`);
if (!res.ok) console.log(await res.text());
