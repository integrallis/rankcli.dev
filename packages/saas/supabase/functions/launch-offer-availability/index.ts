import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LaunchOfferAvailability {
  key: string;
  total_seats: number;
  claimed_seats: number;
  remaining: number;
  is_active: boolean;
  percentage_claimed: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key') || 'pro_founding';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .rpc('get_launch_offer_availability', { p_key: key })
      .single();

    if (error) {
      console.error('Error fetching launch offer availability:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch availability' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tier = data as LaunchOfferAvailability;

    const headers = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30',
    };

    return new Response(
      JSON.stringify({
        key: tier.key,
        totalSeats: tier.total_seats,
        claimedSeats: tier.claimed_seats,
        remaining: tier.remaining,
        isActive: tier.is_active,
        percentageClaimed: tier.percentage_claimed,
        isLow: tier.remaining <= 20 && tier.remaining > 0,
        isAlmostGone: tier.remaining <= 5 && tier.remaining > 0,
        isSoldOut: tier.remaining <= 0 || !tier.is_active,
        timestamp: new Date().toISOString(),
      }),
      { headers }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
