import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

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
    // Get API key from header or body
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate key format
    if (!apiKey.startsWith('rankcli_')) {
      return new Response(JSON.stringify({ error: 'Invalid API key format' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hash the key to look it up
    const keyHash = await hashKey(apiKey);

    // Find the key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, user_id, name, last_used_at')
      .eq('key_hash', keyHash)
      .is('revoked_at', null)
      .single();

    if (keyError || !keyData) {
      return new Response(JSON.stringify({ error: 'Invalid or revoked API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    // Get user info
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(keyData.user_id);

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get subscription info
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        plan_id,
        status,
        plan:subscription_plans (
          plan_id,
          name,
          sites_limit
        )
      `)
      .eq('user_id', keyData.user_id)
      .single();

    const plan = subscription?.plan as { plan_id: string; name: string; sites_limit: number } | null;

    return new Response(JSON.stringify({
      valid: true,
      user: {
        id: userData.user.id,
        email: userData.user.email,
      },
      subscription: {
        planId: plan?.plan_id || 'free',
        planName: plan?.name || 'Free',
        sitesLimit: plan?.sites_limit || 1,
        status: subscription?.status || 'active',
      },
      key: {
        id: keyData.id,
        name: keyData.name,
      },
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
