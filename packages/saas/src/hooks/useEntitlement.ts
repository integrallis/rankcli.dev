import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type PlanTier = 'free' | 'solo' | 'pro' | 'agency';

/** The signed-in user's effective plan, as get_my_entitlement() returns it. */
export interface Entitlement {
  tier: PlanTier;
  plan_id: string;
  source: 'free' | 'subscription' | 'lifetime';
  sites_limit: number;
}

const FREE: Entitlement = { tier: 'free', plan_id: 'free', source: 'free', sites_limit: 1 };

/** pro_annual / pro_founding -> pro. Anything unrecognised is free. */
export function baseTier(planId: string | null | undefined): PlanTier {
  const base = (planId ?? '').replace(/_(annual|founding)$/, '');
  return base === 'solo' || base === 'pro' || base === 'agency' ? base : 'free';
}

/**
 * The plan the database enforces: get_my_entitlement() resolves the plan
 * UUID, billing variants (annual, founding), subscription status and
 * lifetime deals the same way the projects site-limit trigger does.
 *
 * If that RPC isn't available (its migration not applied yet), falls back to
 * the subscription's joined plan row, which covers subscriptions but not
 * lifetime deals.
 */
export function useEntitlement() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-entitlement', user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<Entitlement> => {
      const { data, error } = await supabase.rpc('get_my_entitlement').maybeSingle();
      if (!error) return (data as Entitlement | null) ?? FREE;

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('status, plan:subscription_plans ( plan_id, sites_limit )')
        .eq('user_id', user!.id)
        .maybeSingle();
      const joined = subscription?.plan as
        | { plan_id: string; sites_limit: number }
        | Array<{ plan_id: string; sites_limit: number }>
        | null
        | undefined;
      const plan = Array.isArray(joined) ? joined[0] : joined;
      const active = ['active', 'trialing', 'past_due'].includes(subscription?.status ?? '');
      const tier = active ? baseTier(plan?.plan_id) : 'free';
      if (tier === 'free' || !plan) return FREE;
      return { tier, plan_id: plan.plan_id, source: 'subscription', sites_limit: plan.sites_limit };
    },
  });
}
