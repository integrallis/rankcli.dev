#!/usr/bin/env node
/**
 * Asserts that the GitHub App credentials a deployment is about to use belong to the App
 * that deployment is supposed to be.
 *
 * There are two Apps - rankcli (production) and rankcli-dev - and the failure mode when
 * they get crossed is invisible: the frontend sends users to install `rankcli`, the
 * backend authenticates as `rankcli-dev`, and GitHub answers
 * `GET /repos/:owner/:repo/installation` with a 404 that reads exactly like "you never
 * installed the App". The user installs it again, sees the same message, and there is
 * nothing in any log that says which App was asking. So: ask GitHub who we are, once,
 * at deploy time, and fail the deploy if it is not who we expect.
 *
 * Usage:
 *   GITHUB_APP_ID=... GITHUB_PRIVATE_KEY=<base64 or PEM> EXPECTED_APP_SLUG=rankcli \
 *     node scripts/verify-github-app.mjs
 *
 * Exits 0 when the slug matches, 1 when it does not. A missing credential or an
 * unreachable GitHub is a skip, not a failure: this guards against the wrong key, it
 * is not a reason to block a deploy on a network blip.
 */
import crypto from 'node:crypto';

const appId = process.env.GITHUB_APP_ID?.trim();
const rawKey = process.env.GITHUB_PRIVATE_KEY?.trim();
const expected = (process.env.EXPECTED_APP_SLUG || 'rankcli').trim();

if (!appId || !rawKey) {
  console.log('ℹ️  GITHUB_APP_ID / GITHUB_PRIVATE_KEY not provided - skipping App check');
  process.exit(0);
}

// The secret is stored base64-encoded (that is what the edge functions decode), but a
// raw PEM pasted into the secret should work too.
function toPem(value) {
  if (value.includes('-----BEGIN')) return value.replace(/\\n/g, '\n');
  return Buffer.from(value, 'base64').toString('utf8');
}

function appJwt(pem) {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = b64({ alg: 'RS256', typ: 'JWT' });
  // 60s back-date absorbs clock skew between the runner and GitHub.
  const payload = b64({ iat: now - 60, exp: now + 300, iss: appId });
  const signature = crypto
    .sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), pem)
    .toString('base64url');
  return `${header}.${payload}.${signature}`;
}

let jwt;
try {
  jwt = appJwt(toPem(rawKey));
} catch (error) {
  console.error(`❌ GITHUB_PRIVATE_KEY is not a usable RSA key: ${error.message}`);
  process.exit(1);
}

let response;
try {
  response = await fetch('https://api.github.com/app', {
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
} catch (error) {
  console.log(`ℹ️  Could not reach GitHub (${error.message}) - skipping App check`);
  process.exit(0);
}

if (response.status === 401) {
  console.error('❌ GitHub rejected the App JWT: GITHUB_APP_ID and GITHUB_PRIVATE_KEY are not a matching pair.');
  process.exit(1);
}
if (!response.ok) {
  console.log(`ℹ️  GitHub answered ${response.status} - skipping App check`);
  process.exit(0);
}

const app = await response.json();
if (app.slug !== expected) {
  console.error(
    `❌ Wrong GitHub App: these credentials are "${app.slug}" (id ${app.id}), expected "${expected}".\n` +
      `   The site sends users to install github.com/apps/${expected}, so an installation of ${expected}\n` +
      `   is invisible to ${app.slug} and repository linking fails with a 404 that looks like\n` +
      `   "App not installed". Point RANKCLI_GITHUB_APP_ID and RANKCLI_GITHUB_APP_PRIVATE_KEY at ${expected}.`
  );
  process.exit(1);
}

console.log(`✅ GitHub App credentials are "${app.slug}" (id ${app.id}), as expected`);
