import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { functionErrorMessage } from '@/lib/utils';
import { useAuth } from './useAuth';

interface LTDTierAvailability {
  id: string;
  name: string;
  remaining: number;
  soldCount: number;
  totalLicenses: number;
  percentageSold: number;
  isLow: boolean;
  isAlmostGone: boolean;
  isSoldOut: boolean;
  isActive: boolean;
}

interface LTDAvailabilityResponse {
  availability: LTDTierAvailability[];
  totalRemaining: number;
  anyAvailable: boolean;
  timestamp: string;
}

interface UserLTD {
  hasLtd: boolean;
  tier: string | null;
  purchasedAt: string | null;
}

interface CheckoutResult {
  url: string;
  sessionId: string;
  tier: string;
  reserved: boolean;
}

export function useLTDAvailability() {
  const [availability, setAvailability] = useState<LTDTierAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase.functions.invoke<LTDAvailabilityResponse>(
        'ltd-availability'
      );

      if (fetchError) throw fetchError;

      setAvailability(data?.availability || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch LTD availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAvailability, 30000);
    return () => clearInterval(interval);
  }, [fetchAvailability]);

  const getTierAvailability = useCallback(
    (tierId: string) => availability.find((t) => t.id === tierId),
    [availability]
  );

  return {
    availability,
    loading,
    error,
    refetch: fetchAvailability,
    getTierAvailability,
    totalRemaining: availability.reduce((sum, t) => sum + t.remaining, 0),
    anyAvailable: availability.some((t) => t.remaining > 0 && t.isActive),
  };
}

export function useUserLTD() {
  const { user } = useAuth();
  const [userLTD, setUserLTD] = useState<UserLTD | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserLTD() {
      if (!user) {
        setUserLTD(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('user_has_ltd', {
          p_user_id: user.id,
        });

        if (error) throw error;

        const result = data?.[0];
        setUserLTD({
          hasLtd: result?.has_ltd || false,
          tier: result?.tier || null,
          purchasedAt: result?.purchased_at || null,
        });
      } catch (err) {
        console.error('Failed to fetch user LTD status:', err);
        setUserLTD({ hasLtd: false, tier: null, purchasedAt: null });
      } finally {
        setLoading(false);
      }
    }

    fetchUserLTD();
  }, [user]);

  return { userLTD, loading, hasLTD: userLTD?.hasLtd || false };
}

// ltd-checkout requires a signed-in user and buys for that account.
export function useLTDCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (tierId: string): Promise<CheckoutResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: checkoutError } = await supabase.functions.invoke<CheckoutResult>(
          'ltd-checkout',
          {
            body: {
              tier: tierId,
              successUrl: `${window.location.origin}/account/billing?ltd_success=true`,
              cancelUrl: `${window.location.origin}/pricing?ltd_canceled=true`,
            },
          }
        );

        if (checkoutError) throw new Error(await functionErrorMessage(checkoutError, 'Failed to start checkout'));

        if (data?.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url;
          return data;
        }

        throw new Error('No checkout URL returned');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start checkout';
        setError(message);
        console.error('LTD checkout error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { startCheckout, loading, error };
}
