// Every edge function deploys with --no-verify-jwt, so each one has to check
// its own caller. This identifies who is calling: another function or the
// worker (the service role key), a scheduled workflow (CRON_SECRET), or a
// signed-in user (a Supabase access token). Callers that are none of these
// get null, and the function should answer 401.

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type Caller =
  | { kind: 'service' }
  | { kind: 'cron' }
  | { kind: 'user'; userId: string };

export function bearerToken(req: Request): string {
  const header = req.headers.get('Authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

// Constant-time comparison, so a secret can't be recovered byte by byte from
// response timing. Empty strings never match: an unset secret must not let
// an empty bearer through.
export function safeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/** SHA-256 hex, the form api_keys.key_hash stores. */
export async function hashApiKey(key: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * The user behind an X-API-Key header, or null. API keys are how the CLI, CI and the MCP
 * server authenticate - they never hold a Supabase session - so any function those surfaces
 * need must accept one, not just a Bearer JWT.
 */
export async function userIdFromApiKey(
  req: Request,
  supabase: SupabaseClient
): Promise<string | null> {
  const key = req.headers.get('X-API-Key');
  if (!key?.startsWith('rankcli_')) return null;

  const { data } = await supabase
    .from('api_keys')
    .select('user_id')
    .eq('key_hash', await hashApiKey(key))
    .is('revoked_at', null)
    .maybeSingle();
  return data?.user_id ?? null;
}

export async function identifyCaller(
  req: Request,
  supabase: SupabaseClient,
  serviceKey: string,
  options: { allowCron?: boolean } = {}
): Promise<Caller | null> {
  const token = bearerToken(req);
  if (!token) return null;

  if (safeEqual(token, serviceKey)) return { kind: 'service' };

  if (options.allowCron && safeEqual(token, Deno.env.get('CRON_SECRET') || '')) {
    return { kind: 'cron' };
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return { kind: 'user', userId: data.user.id };
}
