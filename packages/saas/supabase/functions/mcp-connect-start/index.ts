// Starts a device-flow-style connect session for the local MCP server.
// Public, unauthenticated - the connect id itself (32 random bytes) is the
// bearer secret, same security model as an OAuth device code. The user code
// is shown by the CLI/MCP client and again on /connect before the user
// approves, so they can tell their own request from a link someone sent them.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SESSION_TTL_MS = 10 * 60 * 1000;

// No 0/O, 1/I/L - the code is read off one screen and compared with another.
const USER_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateUserCode(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes).map((b) => USER_CODE_ALPHABET[b % USER_CODE_ALPHABET.length]);
  return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
}

function generateConnectId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const connectId = generateConnectId();
    const userCode = generateUserCode();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    const { error } = await supabase.from('mcp_connect_sessions').insert({
      id: connectId,
      status: 'pending',
      user_code: userCode,
      expires_at: expiresAt,
    });
    if (error) throw error;

    return new Response(
      JSON.stringify({
        connectId,
        userCode,
        url: `https://rankcli.dev/connect?id=${connectId}`,
        expiresInSeconds: SESSION_TTL_MS / 1000,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('mcp-connect-start error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
