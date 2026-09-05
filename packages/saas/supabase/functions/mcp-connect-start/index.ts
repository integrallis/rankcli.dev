// Starts a device-flow-style connect session for the local MCP server.
// Public, unauthenticated - the connect id itself (32 random bytes) is the
// bearer secret, same security model as an OAuth device code.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SESSION_TTL_MS = 10 * 60 * 1000;

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
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    const { error } = await supabase.from('mcp_connect_sessions').insert({
      id: connectId,
      status: 'pending',
      expires_at: expiresAt,
    });
    if (error) throw error;

    return new Response(
      JSON.stringify({
        connectId,
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
