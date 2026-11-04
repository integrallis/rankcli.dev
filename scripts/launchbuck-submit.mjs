#!/usr/bin/env node
// Submits RankCLI to LaunchBuck through its public API (https://launchbuck.com/api/v1/docs).
//
//   node scripts/launchbuck-submit.mjs --dry-run   # validate the body against the API's limits
//   node scripts/launchbuck-submit.mjs             # POST it (needs LAUNCHBUCK_API_KEY in .env or the environment)
//
// The body is docs/launch/launchbuck-2026-11-04.json. The API cannot upload the logo or the
// screenshot; those go in from the dashboard after the listing exists (the files are in
// docs/launch/ad-assets/launchbuck-2026-11-04/). A submission lands in moderation as "pending".
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const body = JSON.parse(readFileSync(join(root, 'docs/launch/launchbuck-2026-11-04.json'), 'utf8'));
const dryRun = process.argv.includes('--dry-run');

const problems = [];
const len = (s) => [...s].length;
if (len(body.name) < 2 || len(body.name) > 80) problems.push('name must be 2-80 chars');
if (len(body.tagline) < 4 || len(body.tagline) > 140) problems.push(`tagline must be 4-140 chars (is ${len(body.tagline)})`);
if (len(body.description) < 20 || len(body.description) > 4000) problems.push(`description must be 20-4000 chars (is ${len(body.description)})`);
if (!/^https?:\/\//.test(body.websiteUrl)) problems.push('websiteUrl must be http(s)');
if (!['free', 'freemium', 'paid'].includes(body.pricingType)) problems.push('pricingType');
if (!Array.isArray(body.categories) || body.categories.length < 1 || body.categories.length > 5) problems.push('categories must have 1-5 slugs');
if (body.keyFeatures && (body.keyFeatures.length > 6 || body.keyFeatures.some((f) => len(f) < 1 || len(f) > 140))) problems.push('keyFeatures: up to 6, 1-140 chars each');
for (const [k, v] of Object.entries(body.links || {})) {
  if (!['docs', 'pricing', 'blog', 'github', 'twitter', 'discord'].includes(k) || !/^https?:\/\//.test(v)) problems.push(`links.${k}`);
}
if (problems.length) { console.error('invalid:\n  ' + problems.join('\n  ')); process.exit(1); }
console.log(`body ok: tagline ${len(body.tagline)} chars, description ${len(body.description)} chars, ${body.categories.length} categories, ${body.keyFeatures?.length ?? 0} features`);
if (dryRun) process.exit(0);

let key = process.env.LAUNCHBUCK_API_KEY;
if (!key) {
  try {
    const line = readFileSync(join(root, '.env'), 'utf8').split('\n').find((l) => l.startsWith('LAUNCHBUCK_API_KEY='));
    key = line ? line.slice('LAUNCHBUCK_API_KEY='.length).replace(/^['"]|['"]$/g, '').trim() : '';
  } catch { /* no .env */ }
}
if (!key) { console.error('LAUNCHBUCK_API_KEY is not set: create one at https://launchbuck.com/settings and add it to .env'); process.exit(1); }

const res = await fetch('https://launchbuck.com/api/v1/products', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
const text = await res.text();
console.log(`HTTP ${res.status}`);
console.log(text.slice(0, 2000));
process.exit(res.ok ? 0 : 1);
