import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';
import { getEntitlement } from '../_shared/tier.ts';

// Callers whose requests spend the plan's metered API quota (limits.apiRequestsPerDay).
// The CLI, the GitHub Action and the MCP server are free on every plan - they identify
// themselves here so their audits sync and their entitlement resolves, and metering them
// would be charging for the free tier. Add a REST API surface's endpoint name here when
// one exists; until then nothing is metered and the daily counters are observability.
const METERED_ENDPOINTS = new Set<string>([]);

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Daily request limits per plan are tier.ts's limits.apiRequestsPerDay (0 = no API access).

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

    // Keyed on the bare plan_id, annual, founding and lifetime-deal customers were refused
    // as free; a canceled or expired subscription still kept its limit.
    const entitlement = await getEntitlement(supabase, keyData.user_id);

    // This endpoint answers two different questions, and it used to answer both with one
    // verdict: "whose key is this?" and "may this key spend metered API quota?". Because
    // free has no metered quota, a valid Free key came back 403 "API access requires a
    // paid subscription" - to the CLI, which then warned "API key rejected - auditing on
    // the Free tier", and to the GitHub Action, which reported the key as invalid. Both
    // are free on every plan, so the gate was denying the two surfaces we give away.
    //
    // Identity now always resolves for a valid key. The daily limit applies only to
    // callers that actually spend metered quota; the first-party surfaces don't.
    const rateLimit = entitlement.limits.apiRequestsPerDay;
    const endpoint = req.headers.get('X-Endpoint') || 'validate';
    const metered = METERED_ENDPOINTS.has(endpoint);

    // Check rate limit - count requests today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: requestCount } = await supabase
      .from('api_requests')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', keyData.id)
      .gte('created_at', today.toISOString());

    const currentCount = requestCount || 0;
    const remaining = Math.max(0, rateLimit - currentCount);
    // Clamped: an unmetered plan has a limit of 0, and "remaining: -1" is not an answer.
    const remainingAfter = Math.max(0, remaining - 1);

    if (metered && currentCount >= rateLimit) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        limit: rateLimit,
        used: currentCount,
        resets_at: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        upgrade_url: entitlement.tier !== 'agency' ? 'https://rankcli.dev/pricing' : undefined
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    }

    // Log this API request
    await supabase
      .from('api_requests')
      .insert({
        api_key_id: keyData.id,
        user_id: keyData.user_id,
        endpoint,
        ip_address: req.headers.get('X-Forwarded-For') || req.headers.get('CF-Connecting-IP'),
      });

    return new Response(JSON.stringify({
      valid: true,
      user: {
        id: userData.user.id,
        email: userData.user.email,
      },
      subscription: {
        // The CLI and the GitHub Action key their check limits on planId, and know the
        // base tier names; tier.ts maps billing variants and lifetime deals onto them.
        planId: entitlement.tier,
        planName: entitlement.planName,
        sitesLimit: entitlement.limits.sites,
        status: entitlement.source === 'lifetime' ? 'lifetime' : 'active',
        source: entitlement.source,
        /** Metered REST API quota. false on Free - the CLI/Action/MCP work regardless. */
        apiAccess: rateLimit > 0,
        /** null = unlimited. tier.ts is the one place this is defined. */
        autoFixPrsPerMonth: entitlement.limits.autoFixPrsPerMonth,
      },
      key: {
        id: keyData.id,
        name: keyData.name,
      },
      rateLimit: {
        limit: rateLimit,
        remaining: remainingAfter, // Account for this request
        resetsAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      },
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimit.toString(),
        'X-RateLimit-Remaining': remainingAfter.toString(),
        'X-RateLimit-Reset': new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
