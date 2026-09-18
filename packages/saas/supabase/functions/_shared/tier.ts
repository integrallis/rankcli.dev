// A user's effective plan: the one place edge functions turn billing rows into a tier and
// its limits. Before this, each function keyed on the bare subscription_plans.plan_id, so
// pro_annual, agency_annual and pro_founding were "unknown" (validate-api-key refused them
// API access), lifetime-deal buyers (no plan row at all) were free, and a subscription's
// status was checked in some places and not others.
//
// Copies, kept in step with this file:
//   - packages/audit-worker/src/tier.ts (Node; Deno and npm can't share a module)
//   - public.effective_entitlement() in migration 20260919105000 (the projects site-limit
//     trigger needs the same answer inside the database)
// packages/saas/src/test/tier.test.ts runs both TS copies against the same cases and checks
// the limits below against src/config/pricing-tiers.json.
//
// This file has no imports so the vitest suite can load it.

export type BaseTier = 'free' | 'solo' | 'pro' | 'agency';
export type LtdTier = 'ltd_starter' | 'ltd_pro' | 'ltd_agency';

export interface TierLimits {
  sites: number;
  /** 0 = no API access. */
  apiRequestsPerDay: number;
  /** Distinct domains deep-audited per month; null = unlimited. */
  domainsPerMonth: number | null;
}

export interface Entitlement {
  /** The tier used for feature gates and tier-keyed limits. */
  tier: BaseTier;
  /** 'free', the subscription_plans.plan_id ('pro_annual', ...), or the LTD tier ('ltd_pro'). */
  planId: string;
  planName: string;
  source: 'free' | 'subscription' | 'lifetime';
  limits: TierLimits;
}

// pricing-tiers.json: free_registered and subscriptions[].limits.
export const TIER_LIMITS: Record<BaseTier, TierLimits> = {
  free: { sites: 1, apiRequestsPerDay: 0, domainsPerMonth: 2 },
  solo: { sites: 3, apiRequestsPerDay: 100, domainsPerMonth: 5 },
  pro: { sites: 10, apiRequestsPerDay: 1000, domainsPerMonth: 15 },
  agency: { sites: 50, apiRequestsPerDay: 10000, domainsPerMonth: null },
};

// Lifetime deals were sold against a subscription tier ("pays for itself vs Solo/Pro/Agency")
// with their own site and API caps (pricing-tiers.json lifetime_deals.tiers). They list no
// domains-per-month cap, so they take their tier's.
export const LTD_TIERS: Record<LtdTier, { tier: BaseTier; name: string; limits: TierLimits }> = {
  ltd_starter: { tier: 'solo', name: 'LTD Starter', limits: { sites: 1, apiRequestsPerDay: 50, domainsPerMonth: 5 } },
  ltd_pro: { tier: 'pro', name: 'LTD Pro', limits: { sites: 3, apiRequestsPerDay: 200, domainsPerMonth: 15 } },
  ltd_agency: { tier: 'agency', name: 'LTD Agency', limits: { sites: 10, apiRequestsPerDay: 500, domainsPerMonth: null } },
};

const TIER_RANK: Record<BaseTier, number> = { free: 0, solo: 1, pro: 2, agency: 3 };

// past_due is Stripe's payment-retry window; a paying customer keeps their tier through it.
export const ENTITLED_STATUSES = ['active', 'trialing', 'past_due'];

/** plan_id rows include billing variants (solo_annual, pro_founding, ...) of a base tier. */
export function baseTier(planId: string | null | undefined): BaseTier {
  const base = (planId || '').replace(/_(annual|founding)$/, '');
  return base === 'solo' || base === 'pro' || base === 'agency' ? base : 'free';
}

export interface SubscriptionRow {
  status?: string | null;
  current_period_end?: string | null;
  plan?: { plan_id: string; name?: string | null; sites_limit?: number | null } | null;
}

/**
 * Whether a user_subscriptions row still grants its plan. 'canceled' with a period end in
 * the future covers rows the old webhook marked canceled as soon as the customer chose
 * cancel-at-period-end; they paid through current_period_end.
 */
export function subscriptionIsEntitled(sub: SubscriptionRow | null | undefined, now: Date = new Date()): boolean {
  if (!sub?.status) return false;
  if (ENTITLED_STATUSES.includes(sub.status)) return true;
  return sub.status === 'canceled' && !!sub.current_period_end && new Date(sub.current_period_end) > now;
}

export const FREE_ENTITLEMENT: Entitlement = {
  tier: 'free',
  planId: 'free',
  planName: 'Free',
  source: 'free',
  limits: TIER_LIMITS.free,
};

/**
 * The best of: the free tier, an entitled subscription, and any unrefunded lifetime deal.
 * Higher tier wins; at the same tier a subscription wins over a lifetime deal (its caps are
 * the larger ones).
 */
export function resolveEntitlement(input: {
  subscription?: SubscriptionRow | null;
  ltdTiers?: Array<string | null | undefined>;
  now?: Date;
}): Entitlement {
  let best = FREE_ENTITLEMENT;

  const sub = input.subscription;
  if (sub?.plan && subscriptionIsEntitled(sub, input.now)) {
    const tier = baseTier(sub.plan.plan_id);
    if (tier !== 'free') {
      best = {
        tier,
        planId: sub.plan.plan_id,
        planName: sub.plan.name || tier,
        source: 'subscription',
        // The plan row's sites_limit is what the site-limit trigger enforces.
        limits: { ...TIER_LIMITS[tier], sites: sub.plan.sites_limit ?? TIER_LIMITS[tier].sites },
      };
    }
  }

  for (const ltd of input.ltdTiers || []) {
    const deal = ltd ? LTD_TIERS[ltd as LtdTier] : undefined;
    if (!deal || TIER_RANK[deal.tier] <= TIER_RANK[best.tier]) continue;
    best = { tier: deal.tier, planId: ltd as string, planName: deal.name, source: 'lifetime', limits: deal.limits };
  }

  return best;
}

// Structural, so this file needs no supabase-js import: the service-role client.
// deno-lint-ignore no-explicit-any
type SupabaseLike = { from: (table: string) => any };

/**
 * Loads a user's subscription and lifetime deals and resolves them. Throws on a database
 * error rather than quietly treating a paying customer as free.
 */
export async function getEntitlement(supabase: SupabaseLike, userId: string): Promise<Entitlement> {
  const [subResult, ltdResult] = await Promise.all([
    supabase
      .from('user_subscriptions')
      .select('status, current_period_end, plan:subscription_plans (plan_id, name, sites_limit)')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('ltd_purchases')
      .select('tier')
      .eq('user_id', userId)
      .is('refunded_at', null),
  ]);
  if (subResult.error) throw new Error(`Could not load subscription: ${subResult.error.message}`);
  if (ltdResult.error) throw new Error(`Could not load lifetime deals: ${ltdResult.error.message}`);

  // PostgREST returns the many-to-one plan embed as an object; tolerate an array anyway.
  const sub = subResult.data as (SubscriptionRow & { plan?: unknown }) | null;
  const plan = Array.isArray(sub?.plan) ? sub?.plan[0] ?? null : sub?.plan ?? null;

  return resolveEntitlement({
    subscription: sub ? { ...sub, plan: plan as SubscriptionRow['plan'] } : null,
    ltdTiers: ((ltdResult.data || []) as Array<{ tier: string }>).map((row) => row.tier),
  });
}
