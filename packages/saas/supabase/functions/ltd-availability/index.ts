import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LTDAvailability {
  tier: string;
  total_licenses: number;
  sold_count: number;
  reserved_count: number;
  remaining: number;
  is_active: boolean;
  percentage_sold: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Call the database function to get availability
    const { data, error } = await supabase.rpc('get_ltd_availability');

    if (error) {
      console.error('Error fetching LTD availability:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch availability' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Transform to more frontend-friendly format
    const availability = (data as LTDAvailability[]).map((tier) => ({
      id: tier.tier,
      name: tier.tier.replace('ltd_', '').charAt(0).toUpperCase() +
        tier.tier.replace('ltd_', '').slice(1),
      totalLicenses: tier.total_licenses,
      soldCount: tier.sold_count,
      reservedCount: tier.reserved_count,
      remaining: tier.remaining,
      isActive: tier.is_active,
      percentageSold: tier.percentage_sold,
      // Urgency indicators
      isLow: tier.remaining <= 50 && tier.remaining > 0,
      isAlmostGone: tier.remaining <= 20 && tier.remaining > 0,
      isSoldOut: tier.remaining <= 0 || !tier.is_active,
    }));

    // Add cache headers - cache for 30 seconds
    const headers = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30',
    };

    return new Response(
      JSON.stringify({
        availability,
        totalRemaining: availability.reduce((sum, t) => sum + t.remaining, 0),
        anyAvailable: availability.some((t) => t.remaining > 0 && t.isActive),
        timestamp: new Date().toISOString(),
      }),
      { headers }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
