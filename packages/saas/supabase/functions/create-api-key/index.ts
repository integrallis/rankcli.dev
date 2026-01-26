import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a secure random API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  let key = 'seo_';
  for (const byte of randomBytes) {
    key += chars[byte % chars.length];
  }
  return key;
}

// Hash the API key using SHA-256
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from auth header
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

    const { name = 'Default' } = await req.json().catch(() => ({}));

    // Check how many active keys user has (limit to 5)
    const { count } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('revoked_at', null);

    if (count && count >= 5) {
      return new Response(JSON.stringify({ error: 'Maximum 5 API keys allowed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate the key
    const apiKey = generateApiKey();
    const keyHash = await hashKey(apiKey);
    const keyPrefix = apiKey.substring(0, 12) + '...';

    // Store the key (only the hash, never the full key)
    const { data: keyRecord, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
      })
      .select('id, name, key_prefix, created_at')
      .single();

    if (insertError) {
      console.error('Error creating API key:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create API key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the full key ONLY THIS ONCE (user must copy it now)
    return new Response(JSON.stringify({
      ...keyRecord,
      key: apiKey, // Full key - only shown once!
      message: 'Copy this key now. It will not be shown again.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
