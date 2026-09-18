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
