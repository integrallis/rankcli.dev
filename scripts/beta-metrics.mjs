#!/usr/bin/env node
// The private beta's numbers (docs/launch/BETA-2026-11.md): signups, projects, audits, API
// requests, auto-fix PRs and GitHub App installs per day from the hosted product's tables,
// npm downloads of the CLI and the plugins, and the public repository's stars, clones and
// views. With --invitees, one activation line per invited GitHub login.
//
//   node scripts/beta-metrics.mjs                       # last 14 days
//   node scripts/beta-metrics.mjs 2026-11-05            # from that day (UTC) to now
//   node scripts/beta-metrics.mjs 2026-11-05 2026-11-19 --invitees docs/launch/beta-invitees.txt
//
// Needs VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY from the environment or .env (read line by
// line; never `source` it), and `gh` logged in for the repository traffic. Traffic from
// Cloudflare is a separate script: node scripts/cf-traffic.mjs <start> <end>.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
function fromDotEnv(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(join(root, '.env'), 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).replace(/^['"]|['"]$/g, '').trim() : undefined;
  } catch { return undefined; }
}

const args = process.argv.slice(2);
const inviteesIdx = args.indexOf('--invitees');
const inviteesFile = inviteesIdx >= 0 ? args.splice(inviteesIdx, 2)[1] : null;
const day = (d) => d.toISOString().slice(0, 10);
const start = args[0] ?? day(new Date(Date.now() - 14 * 86400000));
const end = args[1] ?? day(new Date(Date.now() + 86400000));
if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
  console.error('usage: beta-metrics.mjs [start YYYY-MM-DD] [end YYYY-MM-DD] [--invitees file]');
  process.exit(1);
}

const url = fromDotEnv('VITE_SUPABASE_URL');
const key = fromDotEnv('SUPABASE_SERVICE_KEY');
if (!url || !key) { console.error('VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are needed'); process.exit(1); }

async function rows(table, select, timeCol, extra = '') {
  const q = `${url}/rest/v1/${table}?select=${select}&${timeCol}=gte.${start}&${timeCol}=lt.${end}${extra}&limit=10000`;
  const res = await fetch(q, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}
const byDay = (list, col) => {
  const m = new Map();
  for (const r of list) { const d = String(r[col]).slice(0, 10); m.set(d, (m.get(d) ?? 0) + 1); }
  return [...m.entries()].sort();
};
const line = (label, list, col) => {
  const days = byDay(list, col);
  console.log(`${label.padEnd(22)} ${String(list.length).padStart(5)}  ${days.map(([d, n]) => `${d.slice(5)}:${n}`).join(' ')}`);
};

console.log(`Beta numbers ${start} to ${end} (UTC)\n`);
let profiles, projects, audits, apiRequests, prs, installs, freeAudits;
try {
  [profiles, projects, audits, apiRequests, prs, installs, freeAudits] = await Promise.all([
    rows('profiles', 'id,github_username,created_at', 'created_at'),
    rows('projects', 'id,user_id,url,github_installation_id,created_at', 'created_at'),
    rows('audits', 'id,project_id,triggered_by,triggered_by_user,status,score,started_at', 'started_at'),
    rows('api_requests', 'id,user_id,endpoint,created_at', 'created_at'),
    rows('github_prs', 'id,project_id,pr_state,created_at', 'created_at'),
    rows('github_installations', 'id,user_id,account_login,status,installed_at', 'installed_at'),
    rows('free_audits', 'id,converted_to_signup,created_at', 'created_at'),
  ]);
} catch (e) {
  console.error(`could not read the hosted tables: ${e.cause?.message ?? e.message}`);
  process.exit(1);
}
console.log('Hosted product (per day)');
line('signups', profiles, 'created_at');
line('  with GitHub login', profiles.filter((p) => p.github_username), 'created_at');
line('projects added', projects, 'created_at');
line('audits started', audits, 'started_at');
for (const t of ['manual', 'scheduled', 'github_push', 'api']) {
  const l = audits.filter((a) => a.triggered_by === t);
  if (l.length) line(`  ${t}`, l, 'started_at');
}
const done = audits.filter((a) => a.status === 'completed' && a.score != null);
if (done.length) console.log(`  completed ${done.length}, median score ${done.map((a) => a.score).sort((a, b) => a - b)[Math.floor(done.length / 2)]}`);
line('API requests', apiRequests, 'created_at');
line('auto-fix PRs', prs, 'created_at');
line('GitHub App installs', installs, 'installed_at');
line('free audits (homepage)', freeAudits, 'created_at');
if (freeAudits.length) console.log(`  converted to signup: ${freeAudits.filter((f) => f.converted_to_signup).length}`);

console.log('\nnpm downloads (api.npmjs.org, the range includes CI and the corpus run)');
for (const pkg of ['@rankcli/cli', '@rankcli/agent-runtime', '@rankcli/mcp-server', 'astro-rankcli', 'nuxt-rankcli', 'vite-plugin-rankcli', 'next-rankcli']) {
  try {
    const endIncl = day(new Date(new Date(end).getTime() - 86400000));
    const r = await fetch(`https://api.npmjs.org/downloads/range/${start}:${endIncl}/${encodeURIComponent(pkg)}`);
    const j = await r.json();
    const total = (j.downloads ?? []).reduce((s, d) => s + d.downloads, 0);
    console.log(`  ${pkg.padEnd(24)} ${String(total).padStart(6)}`);
  } catch (e) { console.log(`  ${pkg}: ${e.message}`); }
}

console.log('\nintegrallis/rankcli on GitHub (traffic is the trailing 14 days, whatever the range)');
try {
  const gh = (path) => JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8' }));
  const repo = gh('repos/integrallis/rankcli');
  const views = gh('repos/integrallis/rankcli/traffic/views');
  const clones = gh('repos/integrallis/rankcli/traffic/clones');
  console.log(`  stars ${repo.stargazers_count}, forks ${repo.forks_count}, watchers ${repo.subscribers_count}, open issues ${repo.open_issues_count}`);
  console.log(`  views ${views.count} (${views.uniques} unique), clones ${clones.count} (${clones.uniques} unique)`);
} catch (e) { console.log(`  gh api failed: ${e.message.split('\n')[0]}`); }

if (inviteesFile) {
  console.log('\nInvitees (activation: signed up, project, audit, PR)');
  const logins = existsSync(inviteesFile)
    ? readFileSync(inviteesFile, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    : [];
  // Profiles regardless of the date range: an invitee may have signed up earlier.
  const allRes = await fetch(`${url}/rest/v1/profiles?select=id,github_username&github_username=not.is.null&limit=10000`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  const all = allRes.ok ? await allRes.json() : [];
  const projectsAll = await (await fetch(`${url}/rest/v1/projects?select=id,user_id&limit=10000`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })).json();
  let activated = 0;
  logins.forEach((login, i) => {
    const p = all.find((x) => x.github_username && x.github_username.toLowerCase() === login.toLowerCase());
    if (!p) { console.log(`  ${String(i + 1).padStart(2)} ${login.padEnd(20)} -`); return; }
    const theirProjects = new Set(projectsAll.filter((x) => x.user_id === p.id).map((x) => x.id));
    const theirAudits = audits.filter((a) => a.triggered_by_user === p.id || theirProjects.has(a.project_id)).length;
    const theirPrs = prs.filter((x) => theirProjects.has(x.project_id)).length;
    if (theirAudits) activated++;
    console.log(`  ${String(i + 1).padStart(2)} ${login.padEnd(20)} signed up, projects ${theirProjects.size}, audits ${theirAudits}, PRs ${theirPrs}`);
  });
  console.log(`  ${activated} of ${logins.length} ran an audit`);
}
