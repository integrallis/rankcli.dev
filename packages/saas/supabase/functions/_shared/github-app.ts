// Shared GitHub App JWT/installation-token helpers.
// GITHUB_PRIVATE_KEY is stored as base64-encoded PEM (atob() below) because
// GitHub App private keys are PKCS#1 by default and jose only supports
// PKCS#8 - convertPkcs1ToPkcs8 bridges that gap.

import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

// Convert PKCS#1 PEM to PKCS#8 PEM format
export function convertPkcs1ToPkcs8(pkcs1Pem: string): string {
  // If already PKCS#8, return as-is
  if (pkcs1Pem.includes('BEGIN PRIVATE KEY')) {
    return pkcs1Pem;
  }

  // Extract the base64 content
  const base64 = pkcs1Pem
    .replace('-----BEGIN RSA PRIVATE KEY-----', '')
    .replace('-----END RSA PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  // Decode the PKCS#1 key
  const pkcs1Bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  // PKCS#8 header for RSA keys (ASN.1 structure)
  // SEQUENCE {
  //   INTEGER 0 (version)
  //   SEQUENCE { OID rsaEncryption, NULL }
  //   OCTET STRING { <PKCS#1 key> }
  // }
  const rsaOid = [0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];

  // Build the PKCS#8 structure
  const algorithmSeq = [0x30, rsaOid.length, ...rsaOid];

  // Encode OCTET STRING with PKCS#1 content
  const octetStringHeader = encodeLength(pkcs1Bytes.length);
  const octetString = [0x04, ...octetStringHeader, ...pkcs1Bytes];

  // Version (INTEGER 0)
  const version = [0x02, 0x01, 0x00];

  // Inner content
  const innerContent = [...version, ...algorithmSeq, ...octetString];

  // Outer SEQUENCE
  const outerHeader = encodeLength(innerContent.length);
  const pkcs8Bytes = new Uint8Array([0x30, ...outerHeader, ...innerContent]);

  // Convert to base64
  const pkcs8Base64 = btoa(String.fromCharCode(...pkcs8Bytes));

  // Format as PEM with line breaks every 64 chars
  const lines = pkcs8Base64.match(/.{1,64}/g) || [];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
}

// ASN.1 DER length encoding
function encodeLength(length: number): number[] {
  if (length < 128) {
    return [length];
  } else if (length < 256) {
    return [0x81, length];
  } else if (length < 65536) {
    return [0x82, (length >> 8) & 0xff, length & 0xff];
  }
  return [0x83, (length >> 16) & 0xff, (length >> 8) & 0xff, length & 0xff];
}

// Sign a short-lived App JWT (used to authenticate as the App itself, e.g.
// to look up an installation or mint an installation access token).
export async function signAppJwt(privateKeyBase64: string, appId: string): Promise<string> {
  let pemKey = atob(privateKeyBase64);
  pemKey = convertPkcs1ToPkcs8(pemKey);
  const privateKey = await jose.importPKCS8(pemKey, 'RS256');

  return await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(appId)
    .setIssuedAt(Math.floor(Date.now() / 1000) - 60)
    .setExpirationTime('10m')
    .sign(privateKey);
}

// Get installation access token from GitHub App
export async function getInstallationToken(installationId: number, privateKeyBase64: string, appId: string): Promise<string> {
  const jwt = await signAppJwt(privateKeyBase64, appId);

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get installation token: ${error}`);
  }

  const result = await response.json();
  return result.token;
}

// Look up the installation covering a specific repo, authenticated as the
// App itself (JWT, not an installation token - this is the one GitHub API
// call that must happen before you have an installation token). The
// Installation object has no repo id on it - fetch that separately with
// the resulting installation token if you need it.
/**
 * Which GitHub App this deployment authenticates as. `GET /repos/:owner/:repo/installation`
 * answers 404 both when nobody installed the App and when this deployment holds a
 * *different* App's credentials - a dev GITHUB_APP_ID/GITHUB_PRIVATE_KEY in production
 * looks exactly like "you forgot to install it". Naming the App in the error tells the two
 * apart at a glance. Best-effort: a diagnostic must never be the thing that fails.
 */
export async function getAppIdentity(
  privateKeyBase64: string,
  appId: string
): Promise<{ slug: string; id: number } | null> {
  try {
    const jwt = await signAppJwt(privateKeyBase64, appId);
    const response = await fetch('https://api.github.com/app', {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!response.ok) return null;
    const app = await response.json();
    return { slug: app.slug as string, id: app.id as number };
  } catch {
    return null;
  }
}

export async function getInstallationForRepo(
  owner: string,
  repo: string,
  privateKeyBase64: string,
  appId: string
): Promise<number | null> {
  const jwt = await signAppJwt(privateKeyBase64, appId);

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/installation`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to look up installation: ${error}`);
  }

  const result = await response.json();
  return result.id;
}
