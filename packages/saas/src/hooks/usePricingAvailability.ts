import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import pricingConfig from '@/config/pricing-tiers.json';

export interface LTDAvailability {
  id: string;
  remaining: number;
  soldCount: number;
  totalLicenses: number;
  percentageSold: number;
  isLow: boolean;
  isAlmostGone: boolean;
  isSoldOut: boolean;
}

export interface FoundingOfferConfig {
  enabled: boolean;
  key: string;
  plan_id: string;
  base_plan_id: string;
  name: string;
  tagline: string;
  discounted_price_cents: number;
  original_price_cents: number;
  discount_percent: number;
  total_seats: number;
  duration_days: number;
  availability_endpoint: string;
}

export interface FoundingAvailability {
  remaining: number;
  totalSeats: number;
  claimedSeats: number;
  isActive: boolean;
  isLow: boolean;
  isAlmostGone: boolean;
  isSoldOut: boolean;
}

const foundingOffer = pricingConfig.founding_offer as FoundingOfferConfig | undefined;
const ltdConfig = pricingConfig.lifetime_deals as {
  enabled: boolean;
  show_remaining: boolean;
  urgency_threshold: number;
  tiers: Array<{ id: string; total_licenses: number }>;
};

// Single source of live founding-offer and LTD availability data, shared by
// every screen that renders pricing (Pricing page, Account billing tab) so
// they never show conflicting prices/availability for the same offer.
export function usePricingAvailability() {
  const [ltdAvailability, setLtdAvailability] = useState<Record<string, LTDAvailability>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [foundingAvailability, setFoundingAvailability] = useState<FoundingAvailability | null>(null);

  // Fails soft: if the migration/function hasn't been deployed yet, callers
  // just fall back to list pricing.
  useEffect(() => {
    if (!foundingOffer?.enabled) return;

    async function fetchFoundingAvailability() {
      try {
        const { data, error } = await supabase.functions.invoke(
          foundingOffer!.availability_endpoint,
          { body: { key: foundingOffer!.key } }
        );
        if (error) throw error;
        setFoundingAvailability({
          remaining: data.remaining,
          totalSeats: data.totalSeats,
          claimedSeats: data.claimedSeats,
          isActive: data.isActive,
          isLow: data.isLow,
          isAlmostGone: data.isAlmostGone,
          isSoldOut: data.isSoldOut,
        });
      } catch (err) {
        console.error('Failed to fetch founding offer availability:', err);
        setFoundingAvailability(null);
      }
    }

    fetchFoundingAvailability();
    const interval = setInterval(fetchFoundingAvailability, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const { data, error } = await supabase.functions.invoke('ltd-availability');
        if (error) throw error;

        const availabilityMap: Record<string, LTDAvailability> = {};
        data.availability?.forEach((tier: LTDAvailability) => {
          availabilityMap[tier.id] = tier;
        });
        setLtdAvailability(availabilityMap);
      } catch (err) {
        console.error('Failed to fetch LTD availability:', err);
      } finally {
        setLoadingAvailability(false);
      }
    }

    if (ltdConfig.enabled) {
      fetchAvailability();
      const interval = setInterval(fetchAvailability, 30000);
      return () => clearInterval(interval);
    } else {
      setLoadingAvailability(false);
    }
  }, []);

  const anyLTDAvailable = ltdConfig.enabled && ltdConfig.tiers.some(
    (tier) => !ltdAvailability[tier.id]?.isSoldOut
  );

  return {
    foundingOffer,
    foundingAvailability,
    ltdConfig,
    ltdAvailability,
    loadingAvailability,
    anyLTDAvailable,
  };
}
