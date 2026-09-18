// SSRF guard for edge functions that fetch URLs a caller supplied. A hosted
// function must never be steered at loopback, private networks, link-local or
// cloud-metadata addresses - directly or through a redirect.
//
// Deno exposes no hook on the connection itself, so this checks the URL (and
// its DNS answers, when Deno.resolveDns is available) before every request
// and follows redirects by hand, re-checking each hop. A DNS answer that
// changes between the check and the connection (rebinding) is not caught
// here; the audit worker, which does the heavy fetching, checks at the
// socket instead.
//
// packages/audit-worker/src/url-guard.ts is the Node counterpart - keep
// isPrivateAddress in step.

function parseIPv4(ip: string): number[] | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  const bytes = parts.map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN));
  return bytes.every((b) => b >= 0 && b <= 255) ? bytes : null;
}

function parseIPv6(input: string): number[] | null {
  let ip = input.replace(/^\[|\]$/g, '').split('%')[0].toLowerCase();
  // Embedded IPv4 tail (::ffff:1.2.3.4) becomes two hex groups.
  const v4Tail = ip.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (v4Tail) {
    const v4 = parseIPv4(v4Tail[2]);
    if (!v4) return null;
    ip = `${v4Tail[1]}${((v4[0] << 8) | v4[1]).toString(16)}:${((v4[2] << 8) | v4[3]).toString(16)}`;
  }
  const halves = ip.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill('0'), ...tail];
  if (groups.length !== 8 || !groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.flatMap((g) => {
    const n = parseInt(g, 16);
    return [n >> 8, n & 0xff];
  });
}

function inRange(bytes: number[], prefix: number[], bits: number): boolean {
  for (let i = 0; i < bits; i++) {
    const byte = i >> 3;
    const mask = 0x80 >> (i & 7);
    if ((bytes[byte] & mask) !== ((prefix[byte] ?? 0) & mask)) return false;
  }
  return true;
}

const PRIVATE_V4: Array<[number[], number]> = [
  [[0, 0, 0, 0], 8], // "this network"
  [[10, 0, 0, 0], 8],
  [[100, 64, 0, 0], 10], // carrier-grade NAT, also Alibaba metadata
  [[127, 0, 0, 0], 8],
  [[169, 254, 0, 0], 16], // link-local, cloud metadata
  [[172, 16, 0, 0], 12],
  [[192, 0, 0, 0], 24],
  [[192, 0, 2, 0], 24],
  [[192, 88, 99, 0], 24],
  [[192, 168, 0, 0], 16],
  [[198, 18, 0, 0], 15],
  [[198, 51, 100, 0], 24],
  [[203, 0, 113, 0], 24],
  [[224, 0, 0, 0], 4], // multicast
  [[240, 0, 0, 0], 4], // reserved, broadcast
];

const PRIVATE_V6: Array<[number[], number]> = [
  [[], 96], // ::/96 - unspecified, loopback, IPv4-compatible
  [[0, 0x64, 0xff, 0x9b, 0, 1], 48], // 64:ff9b:1::/48 local-use NAT64
  [[0x01, 0x00], 64], // 100::/64 discard
  [[0x20, 0x01, 0x00, 0x00], 32], // 2001::/32 Teredo
  [[0x20, 0x01, 0x0d, 0xb8], 32], // documentation
  [[0xfc], 7], // unique local
  [[0xfe, 0x80], 10], // link-local
  [[0xfe, 0xc0], 10], // site-local (deprecated)
  [[0xff], 8], // multicast
];

function isPrivateV4(bytes: number[]): boolean {
  return PRIVATE_V4.some(([prefix, bits]) => inRange(bytes, prefix, bits));
}

/** True for any address a hosted service must not connect to. */
export function isPrivateAddress(ip: string): boolean {
  const v4 = parseIPv4(ip);
  if (v4) return isPrivateV4(v4);
  const v6 = parseIPv6(ip);
  if (!v6) return true; // unparseable: refuse rather than guess
  // IPv4-mapped (::ffff:0:0/96), NAT64 (64:ff9b::/96) and 6to4 (2002::/16)
  // carry an IPv4 address that decides where the packet really goes.
  if (inRange(v6, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff], 96)) return isPrivateV4(v6.slice(12));
  if (inRange(v6, [0, 0x64, 0xff, 0x9b], 96)) return isPrivateV4(v6.slice(12));
  if (inRange(v6, [0x20, 0x02], 16)) return isPrivateV4(v6.slice(2, 6));
  return PRIVATE_V6.some(([prefix, bits]) => inRange(v6, prefix, bits));
}

function isIPLiteral(host: string): boolean {
  return parseIPv4(host) !== null || (host.includes(':') && parseIPv6(host) !== null);
}

// Names that only mean something inside a private network.
function isInternalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.internal') ||
    host.endsWith('.local') ||
    !host.includes('.') // single-label names resolve through internal search domains
  );
}

export class BlockedUrlError extends Error {}

async function resolveAll(host: string): Promise<string[] | null> {
  // deno-lint-ignore no-explicit-any
  const resolveDns = (Deno as any).resolveDns as ((name: string, type: 'A' | 'AAAA') => Promise<string[]>) | undefined;
  if (typeof resolveDns !== 'function') return null;
  const results = await Promise.allSettled([resolveDns(host, 'A'), resolveDns(host, 'AAAA')]);
  const addresses = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  // Both lookups failing for a reason other than "no such record" means DNS
  // isn't usable here; the hostname checks are all we can do.
  const unusable = results.every(
    (r) => r.status === 'rejected' && !(r.reason instanceof Deno.errors.NotFound)
  );
  return unusable ? null : addresses;
}

/**
 * Throws BlockedUrlError unless `input` is an http(s) URL whose host is
 * public. A host that doesn't resolve is let through - the fetch fails on
 * its own - so a dead site keeps producing the same error as before.
 */
export async function assertPublicUrl(input: string | URL): Promise<URL> {
  let url: URL;
  try {
    url = new URL(String(input));
  } catch {
    throw new BlockedUrlError('Invalid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BlockedUrlError('Only http and https URLs are allowed');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (isIPLiteral(host)) {
    if (isPrivateAddress(host)) throw new BlockedUrlError('This URL points to a private or internal address');
    return url;
  }
  if (isInternalHostname(host)) throw new BlockedUrlError('This URL points to a private or internal address');
  const addresses = await resolveAll(host);
  if (addresses?.some(isPrivateAddress)) {
    throw new BlockedUrlError('This URL points to a private or internal address');
  }
  return url;
}

const nativeFetch = globalThis.fetch.bind(globalThis);
const MAX_REDIRECTS = 10;

/**
 * fetch() that refuses private destinations and follows redirects itself,
 * checking every hop. Same signature as fetch.
 */
export async function guardedFetch(input: string | URL | Request, init: RequestInit = {}): Promise<Response> {
  let url = input instanceof Request ? input.url : String(input);
  let requestInit: RequestInit = input instanceof Request
    ? { method: input.method, headers: input.headers, body: input.body, signal: input.signal, ...init }
    : { ...init };
  const redirectMode = requestInit.redirect ?? 'follow';

  for (let hop = 0; ; hop++) {
    await assertPublicUrl(url);
    const response = await nativeFetch(url, { ...requestInit, redirect: 'manual' });
    const location = response.headers.get('location');
    if (response.status < 300 || response.status > 399 || !location || redirectMode === 'manual') {
      return response;
    }
    await response.body?.cancel();
    if (redirectMode === 'error') throw new TypeError(`Redirect from ${url} was not allowed`);
    if (hop >= MAX_REDIRECTS) throw new TypeError(`Too many redirects from ${url}`);

    url = new URL(location, url).toString();
    const method = (requestInit.method || 'GET').toUpperCase();
    if (response.status === 303 || ((response.status === 301 || response.status === 302) && method === 'POST')) {
      requestInit = { ...requestInit, method: method === 'HEAD' ? 'HEAD' : 'GET', body: undefined };
    }
  }
}

/**
 * Replaces globalThis.fetch for this function's isolate with guardedFetch,
 * for code that calls fetch itself (the bundled audit engine). Origins in
 * `allow` - the Supabase URL, for the function's own database calls - use
 * the real fetch.
 */
export function installFetchGuard(allow: string[] = []): void {
  const allowed = new Set(
    allow.flatMap((a) => {
      try {
        return [new URL(a).origin];
      } catch {
        return [];
      }
    })
  );
  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    try {
      const url = new URL(input instanceof Request ? input.url : String(input));
      if (allowed.has(url.origin)) return nativeFetch(input, init);
    } catch {
      // not a URL fetch can use either; let guardedFetch reject it
    }
    return guardedFetch(input, init);
  }) as typeof fetch;
}
