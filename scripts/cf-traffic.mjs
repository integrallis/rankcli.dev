#!/usr/bin/env node
// Prints rankcli.dev traffic from Cloudflare Web Analytics for a date range: page loads and
// visits by day, by referrer, by landing path and by country.
// Run after every outreach post to see whether anyone came:
//   node scripts/cf-traffic.mjs                 # last 7 days
//   node scripts/cf-traffic.mjs 2026-10-04 2026-10-12   # from (inclusive) to (exclusive), UTC
//
// Needs CLOUDFLARE_ANALYTICS_TOKEN (an API token with Account Analytics: Read) and
// CLOUDFLARE_ACCOUNT_ID, from the environment or from .env at the repo root. It reads .env
// line by line on purpose: `source .env` breaks on the placeholder values in there.
//
// Counts are adaptive samples rounded to tens, so single digits are noise. "visits" counts
// page loads whose referrer is another site or empty, so it is sessions started, not people.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function fromDotEnv(name) {
  try {
    const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
    const line = readFileSync(envPath, 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim().replace(/^"|"$/g, '') : undefined;
  } catch {
    return undefined;
  }
}

const token = process.env.CLOUDFLARE_ANALYTICS_TOKEN || fromDotEnv('CLOUDFLARE_ANALYTICS_TOKEN');
const account = process.env.CLOUDFLARE_ACCOUNT_ID || fromDotEnv('CLOUDFLARE_ACCOUNT_ID');
if (!token || !account) {
  console.error('Set CLOUDFLARE_ANALYTICS_TOKEN and CLOUDFLARE_ACCOUNT_ID (env or .env).');
  process.exit(1);
}

const day = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const to = process.argv[3] ?? day(today);
const from = process.argv[2] ?? day(new Date(today.getTime() - 7 * 86400000));

async function group(dimension, limit, extraFilter = '') {
  const query = `{ viewer { accounts(filter:{accountTag:"${account}"}) {
    rumPageloadEventsAdaptiveGroups(limit:${limit},
      filter:{datetime_geq:"${from}T00:00:00Z", datetime_lt:"${to}T00:00:00Z"${extraFilter}},
      orderBy:[count_DESC]) { count sum { visits } dimensions { ${dimension} } } } } }`;
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) {
    console.error(`Cloudflare GraphQL ${res.status}:`, JSON.stringify(body.errors ?? body));
    process.exit(1);
  }
  return body.data.viewer.accounts[0].rumPageloadEventsAdaptiveGroups.map((r) => ({
    loads: r.count,
    visits: r.sum.visits,
    key: r.dimensions[dimension] || '(none)',
  }));
}

function print(title, rows) {
  console.log(`\n${title}`);
  console.log('  loads  visits  ');
  for (const r of rows) console.log(`${String(r.loads).padStart(7)} ${String(r.visits).padStart(7)}  ${r.key}`);
}

console.log(`rankcli.dev, ${from} to ${to} (UTC, end exclusive)`);
print('By day', (await group('date', 60)).sort((a, b) => a.key.localeCompare(b.key)));
print('By referrer host', await group('refererHost', 25));
print('By landing path', await group('requestPath', 20));
print('By country', await group('countryName', 15));
print('By device', await group('deviceType', 5));
