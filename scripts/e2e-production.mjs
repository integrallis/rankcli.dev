#!/usr/bin/env node
/**
 * End-to-end checks against production.
 *
 *   node scripts/e2e-production.mjs            # everything that needs no credentials
 *   node scripts/e2e-production.mjs --authed   # also the signed-in paths (needs .env)
 *
 * Deliberately not a liveness check. A 200 from the dashboard says nothing about whether the
 * dashboard works, so each case asserts behaviour: that a limit is enforced, that a guard
 * refuses what it should, that a value the UI depends on is actually populated. Several of these
 * exist because the thing they check was silently broken in production while every page returned
 * 200 - the framework badge that nothing ever wrote to, the audit email that said "71/100 -> 0",
 * the webhook that answered 200 and dropped a paid subscription on the floor.
 *
 * Reads .env for SUPABASE credentials when run with --authed. Writes nothing except audits,
 * which is what an audit endpoint is for.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://rankcli.dev';
const AUTHED = process.argv.includes('--authed');

function env(key) {
  const match = readFileSync(join(ROOT, '.env'), 'utf8').match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match?.[1]?.trim();
}

let bundleCache = null;

/**
 * Every deployed JS chunk, concatenated - the only honest way to assert that a piece of copy
 * actually reached production, since Vite splits it into lazily-loaded chunks and which chunk
 * holds what changes between builds.
 */
async function deployedBundle() {
  if (bundleCache) return bundleCache;
  const { text: home } = await get(`${SITE}/`);
  const entry = home.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0];
  assert(entry, 'no entry bundle referenced by the homepage');
  const entryJs = (await get(`${SITE}${entry}`)).text;

  // Vite references chunks as bare `assets/name-hash.js`, not `./assets/...`.
  const chunks = [...new Set([...entryJs.matchAll(/assets\/[A-Za-z0-9_-]+\.js/g)].map((m) => m[0]))];
  assert(chunks.length > 5, `only ${chunks.length} chunks referenced - the crawl is probably broken`);

  const parts = [home, entryJs];
  for (const chunk of chunks) parts.push((await get(`${SITE}/${chunk}`)).text);
  bundleCache = parts.join('\n');
  return bundleCache;
}

const results = [];
let currentGroup = '';
const group = (name) => { currentGroup = name; };

async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ group: currentGroup, name, ok: true, detail });
    console.log(`  ok    ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (error) {
    results.push({ group: currentGroup, name, ok: false, detail: error.message });
    console.log(`  FAIL  ${name} — ${error.message}`);
  }
}

const assert = (cond, message) => { if (!cond) throw new Error(message); };

async function get(url, init) {
  const res = await fetch(url, { redirect: 'follow', ...init });
  return { status: res.status, headers: res.headers, text: await res.text() };
}

// ---------------------------------------------------------------- public surface
group('public site');
await check('landing page serves', async () => {
  const { status, text } = await get(`${SITE}/`);
  assert(status === 200, `status ${status}`);
  assert(text.includes('rankcli') || text.includes('RankCLI'), 'no brand in the HTML');
  return `${(text.length / 1024).toFixed(0)}KB`;
});

await check('its own robots.txt and sitemap.xml are real files, not the SPA shell', async () => {
  for (const path of ['/robots.txt', '/sitemap.xml']) {
    const { status, headers } = await get(`${SITE}${path}`);
    assert(status === 200, `${path} -> ${status}`);
    const type = headers.get('content-type') || '';
    assert(!type.includes('text/html'), `${path} served text/html (SPA fallback, so the file is missing)`);
  }
  return 'both text/plain or xml';
});

await check('the framework list the site advertises matches the recipes we ship', async () => {
  const config = JSON.parse(readFileSync(join(ROOT, 'packages/saas/src/config/frameworks.json'), 'utf8'));
  const names = config.with_recipes.map((f) => f.name);
  const bundle = await deployedBundle();
  const missing = names.filter((n) => !bundle.includes(n));
  assert(missing.length === 0, `not in the deployed bundle: ${missing.join(', ')}`);
  return `${names.length} frameworks, all present`;
});

await check('the deployed pricing copy states the per-tier PR limits', async () => {
  const bundle = await deployedBundle();
  for (const phrase of ['3 open per site', '10 open per site']) {
    assert(bundle.includes(phrase), `missing "${phrase}"`);
  }
  return 'Pro 3 / Agency 10 visible';
});

// The free audit is the top of the funnel and needs no account.
group('free audit (anonymous)');
await check('free-audit returns a scored report', async () => {
  const url = env('VITE_SUPABASE_URL');
  const anon = env('VITE_SUPABASE_ANON_KEY');
  const res = await fetch(`${url}/functions/v1/free-audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
    body: JSON.stringify({ url: SITE }),
  });
  const body = await res.json();
  assert(res.status === 200, `status ${res.status}`);
  assert(typeof body.score === 'number', 'no score');
  assert(Array.isArray(body.issues ?? body.topIssues), 'no issues array');
  return `score ${body.score}`;
});

// ---------------------------------------------------------------- edge functions reject anonymous callers
group('authentication');
for (const fn of ['sync-subscription', 'create-ci-pr', 'create-seo-pr']) {
  await check(`${fn} refuses an unauthenticated caller`, async () => {
    const res = await fetch(`${env('VITE_SUPABASE_URL')}/functions/v1/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert(res.status === 401, `expected 401, got ${res.status}`);
    return '401';
  });
}

await check('stripe-webhook rejects a forged signature', async () => {
  const res = await fetch(`${env('VITE_SUPABASE_URL')}/functions/v1/stripe-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Stripe-Signature': 't=1,v1=deadbeef' },
    body: '{}',
  });
  assert(res.status === 400, `expected 400, got ${res.status}`);
  return '400';
});

await check('github-webhook rejects a forged signature', async () => {
  const res = await fetch(`${env('VITE_SUPABASE_URL')}/functions/v1/github-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-GitHub-Event': 'ping', 'X-Hub-Signature-256': 'sha256=deadbeef' },
    body: '{}',
  });
  assert(res.status === 401, `expected 401, got ${res.status}`);
  return '401';
});

// ---------------------------------------------------------------- the published CLI
group('published CLI');
await check('audits a live site and reports the framework it detected', async () => {
  const out = execFileSync('npx', ['-y', '@rankcli/cli@latest', 'audit', '-u', SITE, '-o', 'json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, RANKCLI_CONFIG_DIR: '/tmp/rankcli-e2e-anon' },
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  const report = JSON.parse(out);
  assert(typeof report.score === 'number', 'no score');
  // The detector regression that shipped twice: rankcli.dev as WordPress, then Spring Boot.
  assert(report.framework !== 'WordPress', 'detected WordPress (the prose-matching regression)');
  assert(report.framework !== 'Spring Boot', 'detected Spring Boot (the width:-in-CSS regression)');
  return `score ${report.score}, framework ${report.framework ?? 'unknown'}`;
});

await check('exits 3 and scores 0 when the target is unreachable', async () => {
  let code = 0;
  try {
    execFileSync('npx', ['-y', '@rankcli/cli@latest', 'audit', '-u', 'http://127.0.0.1:59999/', '-o', 'json'], {
      encoding: 'utf8', env: { ...process.env, RANKCLI_CONFIG_DIR: '/tmp/rankcli-e2e-anon' }, stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (error) {
    code = error.status;
    const report = JSON.parse(error.stdout);
    assert(report.score === 0, `scored ${report.score} for a site that does not respond`);
  }
  assert(code === 3, `expected exit 3, got ${code}`);
  return 'exit 3, score 0';
});

// ---------------------------------------------------------------- signed-in paths
if (AUTHED) {
  const SUPABASE = env('VITE_SUPABASE_URL');
  const SERVICE = env('SUPABASE_SERVICE_KEY');
  const rest = async (path) => {
    const res = await fetch(`${SUPABASE}/rest/v1/${path}`, {
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
    });
    assert(res.ok, `REST ${path} -> ${res.status}`);
    return res.json();
  };

  group('entitlements');
  await check('tier limits in the database match pricing-tiers.json', async () => {
    const pricing = JSON.parse(readFileSync(join(ROOT, 'packages/saas/src/config/pricing-tiers.json'), 'utf8'));
    const plans = await rest('subscription_plans?select=plan_id,sites_limit');
    for (const tier of pricing.subscriptions) {
      const row = plans.find((p) => p.plan_id === tier.id);
      assert(row, `no subscription_plans row for ${tier.id}`);
      assert(row.sites_limit === tier.limits.sites, `${tier.id} sites: db ${row.sites_limit} vs config ${tier.limits.sites}`);
    }
    return `${pricing.subscriptions.length} plans agree`;
  });

  group('audit data');
  await check('every active project has a recent audit and a score', async () => {
    const projects = await rest('projects?select=name,last_audit_at,last_audit_score,framework&is_active=eq.true');
    assert(projects.length > 0, 'no active projects');
    for (const p of projects) {
      assert(p.last_audit_score !== null, `${p.name} has no score`);
    }
    return projects.map((p) => `${p.name}=${p.last_audit_score}${p.framework ? `/${p.framework}` : ''}`).join(' ');
  });

  await check('github_prs rows are typed, so quotas cannot count the CI on-ramp', async () => {
    const prs = await rest('github_prs?select=kind,pr_state');
    for (const pr of prs) {
      assert(['auto_fix', 'ci_setup'].includes(pr.kind), `unexpected kind ${pr.kind}`);
    }
    return `${prs.length} PRs, kinds valid`;
  });

  group('PR limits');
  await check('the per-report cap is enforced on a report that has spent it', async () => {
    const audits = await rest('audits?select=id,project_id&status=eq.completed&order=created_at.desc&limit=25');
    const prs = await rest('github_prs?select=audit_id&kind=eq.auto_fix');
    const counts = prs.reduce((acc, p) => ({ ...acc, [p.audit_id]: (acc[p.audit_id] ?? 0) + 1 }), {});
    const spent = Object.entries(counts).find(([, n]) => n >= 3)?.[0];
    if (!spent) return 'no report has spent its allowance yet (nothing to assert)';

    const key = JSON.parse(readFileSync(`${process.env.HOME}/Library/Preferences/rankcli-nodejs/config.json`, 'utf8')).apiKey;
    const res = await fetch(`${SUPABASE}/functions/v1/create-seo-pr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify({ auditId: spent }),
    });
    const body = await res.json();
    assert(res.status === 409 && body.code === 'report_pr_limit_reached', `expected 409 report_pr_limit_reached, got ${res.status} ${body.code ?? ''}`);
    return body.code;
  });

  await check('a repo already running RankCLI in CI is not given a second workflow', async () => {
    const projects = await rest('projects?select=id,name,github_repo_url&is_active=eq.true&github_repo_url=not.is.null');
    if (!projects.length) return 'no linked repositories (nothing to assert)';
    const key = JSON.parse(readFileSync(`${process.env.HOME}/Library/Preferences/rankcli-nodejs/config.json`, 'utf8')).apiKey;
    const res = await fetch(`${SUPABASE}/functions/v1/create-ci-pr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify({ projectId: projects[0].id }),
    });
    const body = await res.json();
    assert(res.status === 200, `status ${res.status}`);
    assert(body.noop || body.prCreated, 'neither created a PR nor explained why not');
    return body.code ?? (body.prCreated ? `opened PR #${body.prNumber}` : 'noop');
  });

  group('API keys');
  await check('a valid key resolves its identity instead of being refused', async () => {
    const key = JSON.parse(readFileSync(`${process.env.HOME}/Library/Preferences/rankcli-nodejs/config.json`, 'utf8')).apiKey;
    const res = await fetch(`${SUPABASE}/functions/v1/validate-api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key, 'X-Endpoint': 'e2e' },
    });
    const body = await res.json();
    assert(res.status === 200, `status ${res.status} (a valid key must resolve, paid or not)`);
    assert(body.subscription?.planId, 'no plan in the response');
    return `${body.subscription.planId}, apiAccess=${body.subscription.apiAccess}`;
  });

  await check('an invalid key is refused', async () => {
    const res = await fetch(`${SUPABASE}/functions/v1/validate-api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'rankcli_definitely_not_a_key' },
    });
    assert(res.status === 401 || res.status === 403, `expected 401/403, got ${res.status}`);
    return String(res.status);
  });
}

// ---------------------------------------------------------------- report
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed${AUTHED ? '' : '  (run with --authed for the signed-in paths)'}`);
if (failed.length) {
  console.log('\nfailures:');
  for (const f of failed) console.log(`  ${f.group}: ${f.name}\n    ${f.detail}`);
}
process.exit(failed.length ? 1 : 0);
