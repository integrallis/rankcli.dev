// Node copy of packages/saas/supabase/functions/_shared/tier.ts - Deno and npm can't share a
// module, so the two name each other (as ai-provider.ts and models.ts do). Keep them in step,
// along with public.effective_entitlement() in saas migration 20260919111000;
// packages/saas/src/test/tier.test.ts runs both copies against the same cases.
//
// A user's effective plan: billing rows (user_subscriptions + subscription_plans, and
// ltd_purchases) turned into a tier and its limits. user_subscriptions.plan_id is a UUID, so
// keying limits on it directly gave every paid user the fallback limits, and lifetime-deal
// buyers have no plan row at all.
//
// This file has no imports so the saas vitest suite can load it.

export type BaseTier = 'free' | 'solo' | 'pro' | 'agency';
export type LtdTier = 'ltd_starter' | 'ltd_pro' | 'ltd_agency';

export interface TierLimits {
  sites: number;
  /**
   * Auto-fix PRs a calendar month; null = unlimited. Kept in step with the Deno copy in
   * supabase/functions/_shared/tier.ts (src/test/tier.test.ts asserts they are identical).
   */
  autoFixPrsPerMonth: number | null;
  /**
   * Auto-fix PRs that may be open on one project at once. Not a quota - a review-queue
   * throttle: an unbounded one lets a repo audited on every push accumulate PRs nobody reads.
   * It is also the one PR limit that scales with the plan, because parallel review is what a
   * team running many client sites actually needs (pricing-tiers.json auto_fix_prs_open).
   */
  autoFixPrsOpen: number;
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
  free: { sites: 1, apiRequestsPerDay: 0, domainsPerMonth: 2, autoFixPrsPerMonth: 3, autoFixPrsOpen: 1 },
  solo: { sites: 3, apiRequestsPerDay: 100, domainsPerMonth: 5, autoFixPrsPerMonth: null, autoFixPrsOpen: 1 },
  pro: { sites: 10, apiRequestsPerDay: 1000, domainsPerMonth: 15, autoFixPrsPerMonth: null, autoFixPrsOpen: 3 },
  agency: { sites: 50, apiRequestsPerDay: 10000, domainsPerMonth: null, autoFixPrsPerMonth: null, autoFixPrsOpen: 10 },
};

// Lifetime deals were sold against a subscription tier ("pays for itself vs Solo/Pro/Agency")
// with their own site and API caps (pricing-tiers.json lifetime_deals.tiers). They list no
// domains-per-month cap, so they take their tier's.
export const LTD_TIERS: Record<LtdTier, { tier: BaseTier; name: string; limits: TierLimits }> = {
  ltd_starter: { tier: 'solo', name: 'LTD Starter', limits: { sites: 1, apiRequestsPerDay: 50, domainsPerMonth: 5, autoFixPrsPerMonth: null, autoFixPrsOpen: 1 } },
  ltd_pro: { tier: 'pro', name: 'LTD Pro', limits: { sites: 3, apiRequestsPerDay: 200, domainsPerMonth: 15, autoFixPrsPerMonth: null, autoFixPrsOpen: 3 } },
  ltd_agency: { tier: 'agency', name: 'LTD Agency', limits: { sites: 10, apiRequestsPerDay: 500, domainsPerMonth: null, autoFixPrsPerMonth: null, autoFixPrsOpen: 10 } },
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
