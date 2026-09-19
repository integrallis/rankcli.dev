// Google Search Console: the pieces gsc-oauth and sync-gsc-metrics share. The pure helpers
// (property matching, date windows, totals) are unit-tested in src/test/gsc.test.ts.
//
// Tokens: one Google connection per project in oauth_connections, readable only by the
// service role. Both tokens are stored encrypted (AES-GCM, crypto.ts) with the same secret as
// users' AI keys; the access token is short-lived and refreshed on demand.

import { decryptSecret, encryptSecret } from './crypto.ts';

export const GSC_SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

/** Search Console data runs about two days behind. */
const DATA_LAG_DAYS = 2;
/** The window the dashboard shows (Search Console's own default is 28 days). */
export const WINDOW_DAYS = 28;

export interface GscProperty {
  siteUrl: string;
  permissionLevel: string;
}

export interface GscRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function hostOf(url: string): string | null {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * The property that covers a project's URL: a URL-prefix property for its origin first (the
 * most specific), then the domain property (sc-domain:example.com). Unverified access can't
 * read data, so it never matches.
 */
export function matchProperty(projectUrl: string, properties: GscProperty[]): string | null {
  const host = hostOf(projectUrl);
  if (!host) return null;
  const usable = properties.filter((p) => p.permissionLevel !== 'siteUnverifiedUser');
  const prefix = usable.find((p) => !p.siteUrl.startsWith('sc-domain:') && hostOf(p.siteUrl) === host);
  if (prefix) return prefix.siteUrl;
  const domain = usable.find((p) => p.siteUrl === `sc-domain:${host}`);
  return domain?.siteUrl ?? null;
}

/** YYYY-MM-DD in UTC. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The last `days` days of data Search Console has (it lags ~2 days). */
export function dateWindow(days: number, now: Date = new Date()): { startDate: string; endDate: string } {
  const end = new Date(now.getTime() - DATA_LAG_DAYS * 86_400_000);
  const start = new Date(end.getTime() - (days - 1) * 86_400_000);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

/** Totals over rows: clicks and impressions add up; CTR is recomputed; position is impression-weighted. */
export function totals(rows: GscRow[]): { clicks: number; impressions: number; ctr: number; position: number } {
  const clicks = rows.reduce((sum, r) => sum + r.clicks, 0);
  const impressions = rows.reduce((sum, r) => sum + r.impressions, 0);
  const weighted = rows.reduce((sum, r) => sum + r.position * r.impressions, 0);
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: impressions ? weighted / impressions : 0,
  };
}

// ---------------------------------------------------------------------------
// Google APIs
// ---------------------------------------------------------------------------

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  encryptionSecret: string;
}

// Through globalThis so the pure helpers above also load in the app's vitest (no Deno there).
const env = (name: string): string | undefined =>
  (globalThis as { Deno?: { env: { get(n: string): string | undefined } } }).Deno?.env.get(name);

/** Null when the Google OAuth client isn't configured (GOOGLE_CLIENT_ID / _SECRET). */
export function googleConfig(): GoogleConfig | null {
  const clientId = env('GOOGLE_CLIENT_ID');
  const clientSecret = env('GOOGLE_CLIENT_SECRET');
  const encryptionSecret = env('AI_KEY_ENCRYPTION_SECRET');
  return clientId && clientSecret && encryptionSecret ? { clientId, clientSecret, encryptionSecret } : null;
}

export async function sealToken(token: string, config: GoogleConfig): Promise<string> {
  return encryptSecret(token, config.encryptionSecret);
}

interface ConnectionRow {
  id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
}

// deno-lint-ignore no-explicit-any
type Db = any;

/** A valid access token for a connection, refreshing (and saving) it when it has expired. */
export async function accessTokenFor(db: Db, connection: ConnectionRow, config: GoogleConfig): Promise<string> {
  const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0;
  if (connection.access_token && expiresAt - Date.now() > 60_000) {
    return decryptSecret(connection.access_token, config.encryptionSecret);
  }
  if (!connection.refresh_token) throw new Error('The Google connection has no refresh token - connect Search Console again');

  const refreshToken = await decryptSecret(connection.refresh_token, config.encryptionSecret);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!response.ok) {
    // invalid_grant: the user revoked access or the token expired - they need to reconnect.
    const detail = await response.text();
    throw new Error(/invalid_grant/.test(detail)
      ? 'Google access was revoked or expired - connect Search Console again'
      : `Google token refresh failed (HTTP ${response.status})`);
  }
  const refreshed = await response.json() as { access_token: string; expires_in: number };
  await db.from('oauth_connections').update({
    access_token: await sealToken(refreshed.access_token, config),
    token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', connection.id);
  return refreshed.access_token;
}

export async function listProperties(accessToken: string): Promise<GscProperty[]> {
  const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`Search Console returned HTTP ${response.status} listing properties`);
  const data = await response.json() as { siteEntry?: GscProperty[] };
  return data.siteEntry ?? [];
}

export async function searchAnalytics(
  accessToken: string,
  siteUrl: string,
  body: { startDate: string; endDate: string; dimensions: string[]; rowLimit?: number },
): Promise<GscRow[]> {
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) throw new Error(`Search Console returned HTTP ${response.status} for ${siteUrl}`);
  const data = await response.json() as { rows?: GscRow[] };
  return data.rows ?? [];
}
