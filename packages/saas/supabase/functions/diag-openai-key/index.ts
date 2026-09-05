// TEMPORARY diagnostic - checks whether the deployed OPENAI_API_KEY works
// against a trivial real call, without ever exposing the key value.
// Delete this function after use.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!openaiApiKey) {
    return new Response(JSON.stringify({ configured: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
        max_tokens: 5,
      }),
    });
    const body = await response.text();
    return new Response(
      JSON.stringify({ configured: true, ok: response.ok, status: response.status, errorCode: response.ok ? null : (JSON.parse(body)?.error?.code ?? null) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ configured: true, ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
