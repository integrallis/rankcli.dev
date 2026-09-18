// Called by the /connect web page once the user is authenticated. Mints a
// real API key (same shape as create-api-key) and parks it on the connect
// session row for the waiting local MCP process to pick up exactly once via
// mcp-connect-status. The browser never sees the raw key - only the local
// process that started the flow does, matching device-flow trust semantics.
//
// Whoever starts a session can send its link to anyone, so opening the page
// must not grant anything. The page first asks for the session ('describe'),
// shows its user code - the same code the CLI/MCP client printed - and only
// an explicit Approve click ('approve', with that code) mints the key. 'deny'
// discards the session. A request without an action mints nothing: that is
// what the old page sent on load.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  let key = 'rankcli_';
  for (const byte of randomBytes) key += chars[byte % chars.length];
  return key;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { connectId, action, userCode } = await req.json();
    if (!connectId || typeof connectId !== 'string') {
      return new Response(JSON.stringify({ error: 'connectId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (action !== 'describe' && action !== 'approve' && action !== 'deny') {
      return new Response(JSON.stringify({ error: 'Reload this page and approve the connection to continue.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: session } = await supabase
      .from('mcp_connect_sessions')
      .select('id, status, expires_at, user_code, created_at')
      .eq('id', connectId)
      .single();

    if (!session) {
      return new Response(JSON.stringify({ error: 'This connection link is invalid.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (session.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'This connection link has already been used.' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Sessions started before user codes existed can't be confirmed; they
    // expire within 10 minutes anyway.
    if (new Date(session.expires_at).getTime() < Date.now() || !session.user_code) {
      return new Response(JSON.stringify({ error: 'This connection link has expired. Run the connect command again.' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'describe') {
      return new Response(
        JSON.stringify({ userCode: session.user_code, createdAt: session.created_at, expiresAt: session.expires_at }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'deny') {
      await supabase.from('mcp_connect_sessions').delete().eq('id', connectId).eq('status', 'pending');
      return new Response(JSON.stringify({ denied: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalizeCode = (code: unknown) => String(code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (normalizeCode(userCode) !== normalizeCode(session.user_code)) {
      return new Response(JSON.stringify({ error: 'The confirmation code does not match this connection request.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { count } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('revoked_at', null);
    if (count && count >= 5) {
      return new Response(
        JSON.stringify({ error: 'You already have the maximum of 5 API keys. Remove one at rankcli.dev/account?tab=api-keys and try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = generateApiKey();
    const keyHash = await hashKey(apiKey);
    const keyPrefix = apiKey.substring(0, 12) + '...';
    const apiKeyName = 'MCP Connect';

    const { error: insertError } = await supabase.from('api_keys').insert({
      user_id: user.id,
      name: apiKeyName,
      key_prefix: keyPrefix,
      key_hash: keyHash,
    });
    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('mcp_connect_sessions')
      .update({
        status: 'claimed',
        user_id: user.id,
        email: user.email,
        api_key: apiKey,
        api_key_name: apiKeyName,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', connectId)
      .eq('status', 'pending');
    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, email: user.email }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('mcp-connect-claim error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
