/**
 * Google Search Console OAuth Edge Function
 *
 * Handles OAuth 2.0 flow for connecting GSC accounts:
 * - /start: Initiates OAuth flow, returns redirect URL
 * - /callback: Handles OAuth callback, stores tokens
 * - /disconnect: Removes OAuth connection
 * - /sites: Lists verified sites for a connection
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Google OAuth configuration
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const OAUTH_REDIRECT_URI = Deno.env.get('OAUTH_REDIRECT_URI') ||
  `${supabaseUrl}/functions/v1/gsc-oauth/callback`;

// Required scopes for GSC
const GSC_SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly', // Read GSC data
  'https://www.googleapis.com/auth/userinfo.email', // Get user email
].join(' ');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:3005';

// The OAuth state says which user (and project) the Google tokens get saved
// under, and it round-trips through the browser. It is signed so the
// callback can't be pointed at another user's account. The key is derived
// from the service role key, which every function already has.
const STATE_TTL_MS = 10 * 60 * 1000;

async function stateKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`gsc-oauth-state:${supabaseServiceKey}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4)), (c) => c.charCodeAt(0));
}

async function signState(data: { user_id: string; project_id: string | null; timestamp: number }): Promise<string> {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(data)));
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', await stateKey(), new TextEncoder().encode(payload)));
  return `${payload}.${toBase64Url(signature)}`;
}

async function verifyState(state: string): Promise<{ user_id: string; project_id: string | null; timestamp: number } | null> {
  const [payload, signature, extra] = state.split('.');
  if (!payload || !signature || extra !== undefined) return null;
  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await stateKey(),
      fromBase64Url(signature),
      new TextEncoder().encode(payload)
    );
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (typeof data?.user_id !== 'string' || typeof data?.timestamp !== 'number') return null;
    return { user_id: data.user_id, project_id: typeof data.project_id === 'string' ? data.project_id : null, timestamp: data.timestamp };
  } catch {
    return null;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const action = pathParts[pathParts.length - 1];

  try {
    switch (action) {
      case 'start':
        return handleStart(req);
      case 'callback':
        return handleCallback(req);
      case 'disconnect':
        return handleDisconnect(req);
      case 'sites':
        return handleListSites(req);
      case 'refresh':
        return handleRefreshToken(req);
      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'OAuth failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Start OAuth flow - returns authorization URL
 */
async function handleStart(req: Request): Promise<Response> {
  // Verify user is authenticated
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get project_id from body if provided - it must be the caller's project.
  const body = await req.json().catch(() => ({}));
  const projectId = typeof body.project_id === 'string' ? body.project_id : null;
  if (projectId) {
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const state = await signState({
    user_id: user.id,
    project_id: projectId,
    timestamp: Date.now(),
  });

  // Build authorization URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GSC_SCOPES);
  authUrl.searchParams.set('access_type', 'offline'); // Get refresh token
  authUrl.searchParams.set('prompt', 'consent'); // Always show consent screen
  authUrl.searchParams.set('state', state);

  return new Response(JSON.stringify({ auth_url: authUrl.toString() }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Handle OAuth callback - exchange code for tokens
 */
async function handleCallback(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    // Redirect to frontend with error
    return Response.redirect(
      `${frontendUrl}/settings/integrations?error=${encodeURIComponent(error)}`,
      302
    );
  }

  if (!code || !state) {
    return new Response('Missing code or state', { status: 400 });
  }

  const stateData = await verifyState(state);
  if (!stateData) {
    return new Response('Invalid state', { status: 400 });
  }

  // Check state timestamp (10 minute expiry)
  if (Date.now() - stateData.timestamp > STATE_TTL_MS) {
    return Response.redirect(
      `${frontendUrl}/settings/integrations?error=expired`,
      302
    );
  }

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: OAUTH_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token exchange failed:', errorText);
    return Response.redirect(
      `${frontendUrl}/settings/integrations?error=token_exchange_failed`,
      302
    );
  }

  const tokens = await tokenResponse.json();

  // Get user info from Google
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const userInfo = await userInfoResponse.json();

  // Store in database
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  const { error: insertError } = await supabase.from('oauth_connections').upsert({
    user_id: stateData.user_id,
    project_id: stateData.project_id || null,
    provider: 'google',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: expiresAt.toISOString(),
    scopes: GSC_SCOPES.split(' '),
    provider_account_id: userInfo.id,
    verification_status: 'verified',
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,provider,site_url',
  });

  if (insertError) {
    console.error('Failed to store tokens:', insertError);
    return Response.redirect(
      `${frontendUrl}/settings/integrations?error=storage_failed`,
      302
    );
  }

  // Redirect to frontend with success
  return Response.redirect(
    `${frontendUrl}/settings/integrations?gsc=connected`,
    302
  );
}

/**
 * Disconnect OAuth connection
 */
async function handleDisconnect(req: Request): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json().catch(() => ({}));
  const connectionId = body.connection_id;

  // Delete connection (RLS will ensure user owns it)
  const { error: deleteError } = await supabase
    .from('oauth_connections')
    .delete()
    .eq('id', connectionId)
    .eq('user_id', user.id);

  if (deleteError) {
    return new Response(JSON.stringify({ error: 'Failed to disconnect' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * List verified sites from GSC
 */
async function handleListSites(req: Request): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get user's Google OAuth connection
  const { data: connection, error: connError } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .single();

  if (connError || !connection) {
    return new Response(JSON.stringify({ error: 'No Google connection found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Refresh token if expired
  let accessToken = connection.access_token;
  if (new Date(connection.token_expires_at) < new Date()) {
    const refreshed = await refreshAccessToken(connection.refresh_token);
    if (refreshed) {
      accessToken = refreshed.access_token;
      // Update in database
      await supabase
        .from('oauth_connections')
        .update({
          access_token: refreshed.access_token,
          token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        })
        .eq('id', connection.id);
    }
  }

  // Fetch sites from GSC API
  const sitesResponse = await fetch(
    'https://www.googleapis.com/webmasters/v3/sites',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!sitesResponse.ok) {
    const errorText = await sitesResponse.text();
    console.error('GSC API error:', errorText);
    return new Response(JSON.stringify({ error: 'Failed to fetch sites' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const sitesData = await sitesResponse.json();

  return new Response(JSON.stringify({
    sites: sitesData.siteEntry || [],
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Manually refresh access token
 */
async function handleRefreshToken(req: Request): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get connection
  const { data: connection } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .single();

  if (!connection?.refresh_token) {
    return new Response(JSON.stringify({ error: 'No refresh token available' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const refreshed = await refreshAccessToken(connection.refresh_token);
  if (!refreshed) {
    return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Update in database
  await supabase
    .from('oauth_connections')
    .update({
      access_token: refreshed.access_token,
      token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    })
    .eq('id', connection.id);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}
