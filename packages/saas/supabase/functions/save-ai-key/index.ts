// Saves a user's BYOK AI provider credentials. Tests the key with a real,
// cheap call before storing it (encrypted) - so the user finds out
// immediately if it's wrong, not the next time an auto-fix PR silently
// fails hours later.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encryptSecret } from '../_shared/crypto.ts';
import { testProviderConnection, type AIProvider } from '../_shared/ai-provider.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const encryptionSecret = Deno.env.get('AI_KEY_ENCRYPTION_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_PROVIDERS: AIProvider[] = ['openai', 'anthropic', 'openrouter', 'groq', 'gemini', 'perplexity', 'custom'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!encryptionSecret) {
      return new Response(JSON.stringify({ error: 'AI key storage not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    const { provider, apiKey, baseUrl, model } = await req.json();

    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      return new Response(JSON.stringify({ error: `provider must be one of: ${VALID_PROVIDERS.join(', ')}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!apiKey && provider !== 'custom') {
      return new Response(JSON.stringify({ error: 'apiKey is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (provider === 'custom' && (!baseUrl || !model)) {
      return new Response(JSON.stringify({ error: 'Custom provider requires both baseUrl and model' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const test = await testProviderConnection({ provider, apiKey: apiKey || '', baseUrl, model });
    if (!test.ok) {
      return new Response(JSON.stringify({ error: `Could not verify this key: ${test.error}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const encryptedKey = await encryptSecret(apiKey || '', encryptionSecret);

    const { error: upsertError } = await supabase
      .from('user_ai_keys')
      .upsert({
        user_id: user.id,
        provider,
        encrypted_key: encryptedKey,
        base_url: baseUrl || null,
        model: model || null,
        verified_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' }); // one key per provider; saving replaces that provider's

    if (upsertError) {
      throw upsertError;
    }

    return new Response(JSON.stringify({ success: true, provider, verified: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('save-ai-key error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
