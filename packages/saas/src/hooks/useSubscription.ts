import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SubscriptionPlan {
  id: string;
  plan_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  billing_period: string;
  sites_limit: number;
  team_members_limit: number | null;
  keywords_limit: number;
  historical_days: number;
  features: Record<string, boolean | number>;
  stripe_price_id: string | null;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  plan?: SubscriptionPlan;
}

// get_my_entitlement(): see supabase/functions/_shared/tier.ts for how it's resolved.
interface Entitlement {
  tier: 'free' | 'solo' | 'pro' | 'agency';
  plan_id: string;
  source: 'free' | 'subscription' | 'lifetime';
  sites_limit: number;
}

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's subscription
  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<UserSubscription | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // The effective plan as the database enforces it (effective_entitlement): counts
  // lifetime deals, which have no plan row, and ignores a subscription that has ended.
  const { data: entitlement } = useQuery({
    queryKey: ['entitlement', user?.id],
    queryFn: async (): Promise<Entitlement | null> => {
      const { data, error } = await supabase.rpc('get_my_entitlement').maybeSingle();
      if (error) throw error;
      return (data as Entitlement | null) ?? null;
    },
    enabled: !!user,
  });

  // Fetch all available plans
  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data;
    },
  });

  // Create checkout session
  const createCheckout = useMutation({
    mutationFn: async ({ priceId, planId }: { priceId: string; planId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ priceId, planId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  // Create customer portal session
  const createPortal = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create portal session');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  // Check if user has a specific feature
  const hasFeature = (feature: string): boolean => {
    if (!subscription?.plan?.features) return false;
    return !!subscription.plan.features[feature];
  };

  // Get limit for a specific resource
  const getLimit = (resource: 'sites' | 'keywords' | 'team_members' | 'historical_days'): number => {
    // The same number the projects insert trigger enforces.
    if (resource === 'sites' && entitlement) return entitlement.sites_limit;

    if (!subscription?.plan) {
      // Free tier limits
      return { sites: 1, keywords: 10, team_members: 1, historical_days: 7 }[resource];
    }

    const limitMap = {
      sites: subscription.plan.sites_limit,
      keywords: subscription.plan.keywords_limit,
      team_members: subscription.plan.team_members_limit ?? Infinity,
      historical_days: subscription.plan.historical_days,
    };

    return limitMap[resource];
  };

  // Check if subscription is active
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

  // Check if on free tier
  const isFreeTier = !subscription?.plan_id;

  // Get current plan name
  const planName = entitlement?.source === 'lifetime'
    ? `Lifetime ${entitlement.tier.charAt(0).toUpperCase()}${entitlement.tier.slice(1)}`
    : entitlement?.source === 'free'
      ? 'Free'
      : subscription?.plan?.name || 'Free';

  return {
    subscription,
    plans,
    isLoading,
    error,
    createCheckout,
    createPortal,
    hasFeature,
    getLimit,
    isActive,
    isFreeTier,
    planName,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  };
}
