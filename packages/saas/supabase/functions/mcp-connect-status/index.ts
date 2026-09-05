// Polled by the local MCP process while it waits for the user to approve
// the connection in their browser. Public, unauthenticated - the connect id
// is the bearer secret. Returns the API key exactly once: on the first
// 'claimed' read, the row is deleted so the key can't be retrieved twice.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { connectId } = await req.json();
    if (!connectId) {
      return new Response(JSON.stringify({ error: 'connectId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: session } = await supabase
      .from('mcp_connect_sessions')
      .select('status, expires_at, email, api_key, api_key_name')
      .eq('id', connectId)
      .single();

    if (!session) {
      return new Response(JSON.stringify({ status: 'not_found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (session.status === 'pending') {
      const status = new Date(session.expires_at).getTime() < Date.now() ? 'expired' : 'pending';
      return new Response(JSON.stringify({ status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Claimed - hand over the key once, then delete so it can't be replayed.
    await supabase.from('mcp_connect_sessions').delete().eq('id', connectId);

    return new Response(
      JSON.stringify({
        status: 'claimed',
        email: session.email,
        apiKey: session.api_key,
        apiKeyName: session.api_key_name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('mcp-connect-status error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
