// SSRF guard for the hosted worker. Every URL this service fetches comes from
// a caller (free audits, dashboard audits, the MCP endpoints), and the worker
// runs inside Fly's private network, so without a guard a caller could make
// it read loopback services, cloud metadata (169.254.169.254) or Fly
// `.internal` apps - directly, through a redirect, or through a link the
// crawler follows.
//
// installOutboundGuard() checks the destination of every outbound TCP
// connection the process opens (fetch, http, https and tls all end in
// net.Socket#connect), after DNS resolution, so redirects, crawled links and
// DNS rebinding are all covered. assertPublicUrl() is the early, friendly
// check for route inputs.
//
// The CLI and the local MCP server audit localhost dev servers on purpose, so
// this lives here, not in agent-runtime or mcp-server.
// packages/saas/supabase/functions/_shared/url-guard.ts is the Deno
// counterpart for edge functions - keep isPrivateAddress in step.

import dns from 'node:dns';
import net from 'node:net';

// ALLOW_PRIVATE_NETWORK_FETCH=true turns the guard off for local development,
// where Supabase and the sites under test run on localhost.
const guardDisabled = process.env.ALLOW_PRIVATE_NETWORK_FETCH === 'true';

// ---------------------------------------------------------------------------
// Address classification
// ---------------------------------------------------------------------------

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
  [[0xfc], 7], // unique local, includes Fly's fdaa::/16 private network
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

export class BlockedUrlError extends Error {
  code = 'EBLOCKEDURL';
}

// ---------------------------------------------------------------------------
// Route-level check
// ---------------------------------------------------------------------------

/**
 * Throws BlockedUrlError unless `input` is an http(s) URL whose host is
 * public. A host that doesn't resolve is let through - the fetch fails on
 * its own - so this never turns a dead site into a different error.
 */
export async function assertPublicUrl(input: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new BlockedUrlError('Invalid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BlockedUrlError('Only http and https URLs can be audited');
  }
  if (guardDisabled) return url;
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host)) {
    if (isPrivateAddress(host)) throw new BlockedUrlError('This URL points to a private or internal address');
    return url;
  }
  if (isInternalHostname(host)) throw new BlockedUrlError('This URL points to a private or internal address');
  let addresses: dns.LookupAddress[] = [];
  try {
    addresses = await dns.promises.lookup(host, { all: true });
  } catch {
    return url;
  }
  if (addresses.some((a) => isPrivateAddress(a.address))) {
    throw new BlockedUrlError('This URL points to a private or internal address');
  }
  return url;
}

// ---------------------------------------------------------------------------
// Connection-level guard
// ---------------------------------------------------------------------------

type LookupCallback = (err: NodeJS.ErrnoException | null, address?: string | dns.LookupAddress[], family?: number) => void;
type LookupFunction = (hostname: string, options: dns.LookupOptions, callback: LookupCallback) => void;

function guardedLookup(original: LookupFunction): LookupFunction {
  return (hostname, options, callback) => {
    const opts = typeof options === 'object' && options !== null ? options : {};
    original(hostname, { ...opts, all: true }, (err, addresses) => {
      if (err) return callback(err);
      const list = (Array.isArray(addresses) ? addresses : []) as dns.LookupAddress[];
      const blocked = list.find((a) => isPrivateAddress(a.address));
      if (blocked || list.length === 0) {
        return callback(new BlockedUrlError(`Blocked connection to ${hostname}: it resolves to a private or internal address`));
      }
      if (opts.all) return callback(null, list);
      return callback(null, list[0].address, list[0].family);
    });
  };
}

let installed = false;

/**
 * Patches net.Socket#connect so every outbound TCP connection is checked
 * against isPrivateAddress after DNS resolution. `allow` lists host:port pairs
 * that stay reachable (the Supabase URL, which is local in development).
 */
export function installOutboundGuard(allow: string[] = []): void {
  if (installed || guardDisabled) return;
  installed = true;

  const allowed = new Set(allow.filter(Boolean).map((a) => a.toLowerCase()));
  const originalConnect = net.Socket.prototype.connect as (...args: unknown[]) => net.Socket;

  net.Socket.prototype.connect = function patchedConnect(this: net.Socket, ...args: unknown[]) {
    // net.connect() passes [options, cb] pre-normalized as an array; direct
    // calls pass (options, cb) or (port, host, cb).
    let options: net.TcpNetConnectOpts | net.IpcNetConnectOpts | null = null;
    let callback: unknown;
    if (Array.isArray(args[0])) {
      [options, callback] = args[0] as [net.TcpNetConnectOpts, unknown];
    } else if (typeof args[0] === 'object' && args[0] !== null) {
      options = args[0] as net.TcpNetConnectOpts;
      callback = args[1];
    } else if (typeof args[0] === 'number' || (typeof args[0] === 'string' && /^\d+$/.test(args[0]))) {
      options = { port: Number(args[0]), host: typeof args[1] === 'string' ? args[1] : 'localhost' };
      callback = args.find((a) => typeof a === 'function');
    }

    if (!options || ('path' in options && options.path)) {
      return originalConnect.apply(this, args); // unix socket or unknown form
    }

    const tcp = options as net.TcpNetConnectOpts;
    const host = String(tcp.host || 'localhost').replace(/^\[|\]$/g, '');
    if (allowed.has(`${host.toLowerCase()}:${tcp.port}`)) {
      return originalConnect.apply(this, args);
    }

    if (net.isIP(host)) {
      if (isPrivateAddress(host)) {
        const err = new BlockedUrlError(`Blocked connection to private or internal address ${host}`);
        process.nextTick(() => this.destroy(err));
        return this;
      }
      return originalConnect.apply(this, args);
    }

    const guarded = {
      ...tcp,
      lookup: guardedLookup((tcp.lookup as LookupFunction | undefined) || (dns.lookup as unknown as LookupFunction)),
    };
    return typeof callback === 'function'
      ? originalConnect.call(this, guarded, callback)
      : originalConnect.call(this, guarded);
  } as unknown as typeof net.Socket.prototype.connect;
}

/** host:port of a URL, for installOutboundGuard's allow list. */
export function hostPort(url: string | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    const port = u.port || (u.protocol === 'https:' ? '443' : '80');
    return `${u.hostname.replace(/^\[|\]$/g, '')}:${port}`;
  } catch {
    return '';
  }
}
