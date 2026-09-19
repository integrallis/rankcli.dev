// Google Search Console connection for a project. POST /gsc-oauth/<action>:
//   status       { project_id }             -> configured? plan allows it? connected? property?
//   start        { project_id }             -> { auth_url } (Google consent)
//   callback     (GET, from Google)         -> stores the tokens, back to the project page
//   sites        { project_id }             -> the account's properties + the one matching the project
//   select-site  { project_id, site_url }   -> saves the property (must be one the account has)
//   disconnect   { project_id }             -> revokes the token at Google and forgets it
// Everything but the callback needs the project owner's session. Tokens never leave the
// server (oauth_connections is service-role only) and are stored encrypted (_shared/gsc.ts).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { identifyCaller } from '../_shared/caller-auth.ts';
import { getEntitlement } from '../_shared/tier.ts';
import { decryptSecret } from '../_shared/crypto.ts';
import {
  GSC_SCOPES,
  accessTokenFor,
  googleConfig,
  listProperties,
  matchProperty,
  sealToken,
  type GoogleConfig,
} from '../_shared/gsc.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const REDIRECT_URI = `${supabaseUrl}/functions/v1/gsc-oauth/callback`;
const appUrl = Deno.env.get('APP_URL') || 'https://rankcli.dev';

// Plans with Search Console (pricing-tiers.json: features.gsc_integration).
const GSC_TIERS = new Set(['solo', 'pro', 'agency']);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// The OAuth state says which user and project the tokens belong to and round-trips through the
// browser, so it's signed (and expires): the callback can't be pointed at someone else's project.
const STATE_TTL_MS = 10 * 60 * 1000;

async function stateKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`gsc-oauth-state:${supabaseServiceKey}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4)), (c) => c.charCodeAt(0));
}

interface State {
  user_id: string;
  project_id: string;
  timestamp: number;
}

async function signState(data: State): Promise<string> {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(data)));
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', await stateKey(), new TextEncoder().encode(payload)));
  return `${payload}.${toBase64Url(signature)}`;
}

async function verifyState(state: string): Promise<State | null> {
  const [payload, signature, extra] = state.split('.');
  if (!payload || !signature || extra !== undefined) return null;
  try {
    const valid = await crypto.subtle.verify('HMAC', await stateKey(), fromBase64Url(signature), new TextEncoder().encode(payload));
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (typeof data?.user_id !== 'string' || typeof data?.project_id !== 'string' || typeof data?.timestamp !== 'number') return null;
    return data;
  } catch {
    return null;
  }
}

// deno-lint-ignore no-explicit-any
type Db = any;

/** The caller's project, or an error response. */
async function ownedProject(req: Request, db: Db, body: Record<string, unknown>) {
  const caller = await identifyCaller(req, db, supabaseServiceKey);
  if (caller?.kind !== 'user') return { error: json({ error: 'Unauthorized' }, 401) };
  const projectId = typeof body.project_id === 'string' ? body.project_id : '';
  const { data: project } = await db.from('projects').select('id, url, user_id').eq('id', projectId).eq('user_id', caller.userId).maybeSingle();
  if (!project) return { error: json({ error: 'Project not found' }, 404) };
  return { project: project as { id: string; url: string; user_id: string }, userId: caller.userId };
}

async function connectionFor(db: Db, projectId: string) {
  const { data } = await db.from('oauth_connections').select('*').eq('project_id', projectId).eq('provider', 'google').maybeSingle();
  return data;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const action = new URL(req.url).pathname.split('/').pop();
  const db = createClient(supabaseUrl, supabaseServiceKey);
  const config = googleConfig();

  try {
    if (action === 'callback') return await handleCallback(req, db, config);

    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const owned = await ownedProject(req, db, body);
    if (owned.error) return owned.error;
    const { project, userId } = owned;

    const tier = (await getEntitlement(db, userId)).tier;
    const allowed = GSC_TIERS.has(tier);

    if (action === 'status') {
      const connection = await connectionFor(db, project.id);
      const { data: lastSync } = await db.from('sync_jobs')
        .select('status, completed_at, error_message')
        .eq('project_id', project.id).eq('job_type', 'gsc_sync')
        .order('started_at', { ascending: false }).limit(1).maybeSingle();
      return json({
        configured: !!config,
        allowed,
        connected: !!connection,
        email: connection?.provider_account_email ?? null,
        siteUrl: connection?.site_url ?? null,
        lastSync: lastSync ?? null,
      });
    }

    if (!config) return json({ error: 'Search Console is not configured on this server' }, 503);
    if (!allowed) return json({ error: 'Search Console is part of the Solo, Pro and Agency plans', code: 'plan_required' }, 402);

    switch (action) {
      case 'start': {
        const state = await signState({ user_id: userId, project_id: project.id, timestamp: Date.now() });
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', config.clientId);
        authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', GSC_SCOPES);
        authUrl.searchParams.set('access_type', 'offline'); // a refresh token, for the daily sync
        authUrl.searchParams.set('prompt', 'consent'); // Google only sends a refresh token on consent
        authUrl.searchParams.set('include_granted_scopes', 'true');
        authUrl.searchParams.set('state', state);
        return json({ auth_url: authUrl.toString() });
      }

      case 'sites': {
        const connection = await connectionFor(db, project.id);
        if (!connection) return json({ error: 'Search Console is not connected' }, 404);
        const properties = await listProperties(await accessTokenFor(db, connection, config));
        return json({
          sites: properties,
          suggested: matchProperty(project.url, properties),
          selected: connection.site_url ?? null,
        });
      }

      case 'select-site': {
        const connection = await connectionFor(db, project.id);
        if (!connection) return json({ error: 'Search Console is not connected' }, 404);
        const siteUrl = typeof body.site_url === 'string' ? body.site_url : '';
        // Only a property this Google account can read - never an arbitrary string.
        const properties = await listProperties(await accessTokenFor(db, connection, config));
        const property = properties.find((p) => p.siteUrl === siteUrl && p.permissionLevel !== 'siteUnverifiedUser');
        if (!property) return json({ error: 'That property is not in this Google account' }, 400);
        await db.from('oauth_connections').update({ site_url: siteUrl, updated_at: new Date().toISOString() }).eq('id', connection.id);
        return json({ success: true, siteUrl });
      }

      case 'disconnect': {
        const connection = await connectionFor(db, project.id);
        if (connection) {
          await revoke(connection, config);
          await db.from('oauth_connections').delete().eq('id', connection.id);
        }
        return json({ success: true });
      }

      default:
        return json({ error: 'Unknown action' }, 400);
    }
  } catch (error) {
    console.error('gsc-oauth error:', error);
    return json({ error: error instanceof Error ? error.message : 'Search Console request failed' }, 502);
  }
});

async function revoke(connection: { refresh_token: string | null }, config: GoogleConfig) {
  if (!connection.refresh_token) return;
  try {
    const token = await decryptSecret(connection.refresh_token, config.encryptionSecret);
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: 'POST' });
  } catch (error) {
    // Forgetting the token matters more than telling Google; the user can also remove access
    // at myaccount.google.com.
    console.warn('Google token revoke failed:', error);
  }
}

async function handleCallback(req: Request, db: Db, config: GoogleConfig | null): Promise<Response> {
  const url = new URL(req.url);
  const state = url.searchParams.get('state');
  const stateData = state ? await verifyState(state) : null;
  if (!stateData) return new Response('Invalid state', { status: 400 });

  const back = (params: string) => Response.redirect(`${appUrl}/dashboard/projects/${stateData.project_id}?${params}`, 302);

  if (url.searchParams.get('error')) return back(`gsc_error=${encodeURIComponent(url.searchParams.get('error')!)}`);
  if (Date.now() - stateData.timestamp > STATE_TTL_MS) return back('gsc_error=expired');
  const code = url.searchParams.get('code');
  if (!code || !config) return back('gsc_error=unavailable');

  // The project must still belong to the user who started the flow.
  const { data: project } = await db.from('projects').select('id').eq('id', stateData.project_id).eq('user_id', stateData.user_id).maybeSingle();
  if (!project) return back('gsc_error=project');

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenResponse.ok) {
    console.error('Google token exchange failed:', tokenResponse.status, await tokenResponse.text());
    return back('gsc_error=token_exchange_failed');
  }
  const tokens = await tokenResponse.json() as { access_token: string; refresh_token?: string; expires_in: number; scope?: string };
  if (!tokens.scope?.includes('webmasters')) return back('gsc_error=scope_not_granted');

  const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  }).then((r) => r.json()).catch(() => ({})) as { id?: string; email?: string };

  // Replace any earlier connection for this project.
  await db.from('oauth_connections').delete().eq('project_id', stateData.project_id).eq('provider', 'google');
  const { error } = await db.from('oauth_connections').insert({
    user_id: stateData.user_id,
    project_id: stateData.project_id,
    provider: 'google',
    access_token: await sealToken(tokens.access_token, config),
    refresh_token: tokens.refresh_token ? await sealToken(tokens.refresh_token, config) : null,
    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    scopes: GSC_SCOPES.split(' '),
    provider_account_id: userInfo.id ?? null,
    provider_account_email: userInfo.email ?? null,
    verification_status: 'verified',
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error('Storing the Google connection failed:', error);
    return back('gsc_error=storage_failed');
  }
  return back('gsc=connected');
}
