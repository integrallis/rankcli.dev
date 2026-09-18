// The tier helper exists twice - Deno (edge functions) and Node (audit worker) - plus a SQL
// copy, effective_entitlement(). These tests run both TS copies against the same cases so
// they can't drift, and check their limits against pricing-tiers.json.
import { describe, it, expect } from 'vitest';
import * as deno from '../../supabase/functions/_shared/tier.ts';
import * as node from '../../../audit-worker/src/tier.ts';
import pricing from '@/config/pricing-tiers.json';

const NOW = new Date('2026-09-18T12:00:00Z');
const plan = (plan_id: string, sites_limit?: number) => ({ plan_id, name: plan_id, sites_limit });

describe.each([
  ['Deno copy', deno],
  ['Node copy', node],
])('%s', (_name, tier) => {
  it('strips billing variants to the base tier', () => {
    expect(tier.baseTier('pro_annual')).toBe('pro');
    expect(tier.baseTier('agency_annual')).toBe('agency');
    expect(tier.baseTier('solo_annual')).toBe('solo');
    expect(tier.baseTier('pro_founding')).toBe('pro');
    expect(tier.baseTier('agency')).toBe('agency');
    expect(tier.baseTier('free')).toBe('free');
    expect(tier.baseTier('ltd_pro')).toBe('free');
    expect(tier.baseTier(null)).toBe('free');
    expect(tier.baseTier('proplus')).toBe('free');
  });

  it('gives annual and founding subscribers their tier (validate-api-key refused them)', () => {
    for (const [planId, base, api] of [
      ['pro_annual', 'pro', 1000],
      ['agency_annual', 'agency', 10000],
      ['pro_founding', 'pro', 1000],
      ['solo_annual', 'solo', 100],
    ] as const) {
      const e = tier.resolveEntitlement({ subscription: { status: 'active', plan: plan(planId) }, now: NOW });
      expect(e.tier).toBe(base);
      expect(e.planId).toBe(planId);
      expect(e.source).toBe('subscription');
      expect(e.limits.apiRequestsPerDay).toBe(api);
    }
  });

  it('keeps the plan through trialing and past_due, not after it ends', () => {
    for (const status of ['active', 'trialing', 'past_due']) {
      expect(tier.resolveEntitlement({ subscription: { status, plan: plan('pro') }, now: NOW }).tier).toBe('pro');
    }
    for (const status of ['expired', 'incomplete', 'unpaid']) {
      expect(tier.resolveEntitlement({ subscription: { status, plan: plan('pro') }, now: NOW }).tier).toBe('free');
    }
  });

  it('honours a canceled subscription until its paid period ends', () => {
    const until = (end: string) =>
      tier.resolveEntitlement({ subscription: { status: 'canceled', current_period_end: end, plan: plan('pro') }, now: NOW }).tier;
    expect(until('2026-10-01T00:00:00Z')).toBe('pro');
    expect(until('2026-09-01T00:00:00Z')).toBe('free');
    expect(tier.resolveEntitlement({ subscription: { status: 'canceled', plan: plan('pro') }, now: NOW }).tier).toBe('free');
  });

  it('treats a row with no plan as free', () => {
    const e = tier.resolveEntitlement({ subscription: { status: 'active', plan: null }, now: NOW });
    expect(e).toEqual(tier.FREE_ENTITLEMENT);
    expect(e.limits.apiRequestsPerDay).toBe(0);
    expect(tier.resolveEntitlement({}).tier).toBe('free');
  });

  it('uses the plan row sites_limit when present', () => {
    expect(tier.resolveEntitlement({ subscription: { status: 'active', plan: plan('pro', 12) }, now: NOW }).limits.sites).toBe(12);
    expect(tier.resolveEntitlement({ subscription: { status: 'active', plan: plan('pro') }, now: NOW }).limits.sites).toBe(10);
  });

  it('grants lifetime deals the tier they were sold as, with their own caps', () => {
    for (const [ltd, base, sites, api] of [
      ['ltd_starter', 'solo', 1, 50],
      ['ltd_pro', 'pro', 3, 200],
      ['ltd_agency', 'agency', 10, 500],
    ] as const) {
      const e = tier.resolveEntitlement({ subscription: { status: 'active', plan: null }, ltdTiers: [ltd], now: NOW });
      expect(e).toMatchObject({ tier: base, planId: ltd, source: 'lifetime' });
      expect(e.limits.sites).toBe(sites);
      expect(e.limits.apiRequestsPerDay).toBe(api);
    }
    expect(tier.resolveEntitlement({ ltdTiers: ['ltd_bogus', null] }).tier).toBe('free');
  });

  it('picks the higher of a subscription and a lifetime deal; the subscription on a tie', () => {
    const sub = (p: string) => ({ status: 'active', plan: plan(p) });
    expect(tier.resolveEntitlement({ subscription: sub('solo'), ltdTiers: ['ltd_pro'], now: NOW }).planId).toBe('ltd_pro');
    expect(tier.resolveEntitlement({ subscription: sub('agency'), ltdTiers: ['ltd_pro'], now: NOW }).planId).toBe('agency');
    expect(tier.resolveEntitlement({ subscription: sub('pro_annual'), ltdTiers: ['ltd_pro'], now: NOW }).planId).toBe('pro_annual');
    expect(tier.resolveEntitlement({ ltdTiers: ['ltd_starter', 'ltd_agency'] }).planId).toBe('ltd_agency');
  });

  it('loads subscription and lifetime deals and throws on a database error', async () => {
    const client = (results: Record<string, { data: unknown; error: { message: string } | null }>) => ({
      from: (table: string) => {
        const result = results[table];
        const chain = {
          select: () => chain,
          eq: () => chain,
          is: () => Promise.resolve(result),
          maybeSingle: () => Promise.resolve(result),
        };
        return chain;
      },
    });

    const ok = client({
      user_subscriptions: { data: { status: 'active', plan: [plan('pro_founding', 10)] }, error: null },
      ltd_purchases: { data: [{ tier: 'ltd_starter' }], error: null },
    });
    await expect(tier.getEntitlement(ok, 'u1')).resolves.toMatchObject({ tier: 'pro', planId: 'pro_founding' });

    const broken = client({
      user_subscriptions: { data: null, error: { message: 'boom' } },
      ltd_purchases: { data: [], error: null },
    });
    await expect(tier.getEntitlement(broken, 'u1')).rejects.toThrow('boom');
  });
});

describe('tier limits match pricing-tiers.json', () => {
  it('has the same numbers in both copies', () => {
    expect(node.TIER_LIMITS).toEqual(deno.TIER_LIMITS);
    expect(node.LTD_TIERS).toEqual(deno.LTD_TIERS);
    expect(node.ENTITLED_STATUSES).toEqual(deno.ENTITLED_STATUSES);
  });

  it('matches the subscription tiers', () => {
    for (const sub of pricing.subscriptions) {
      const limits = deno.TIER_LIMITS[sub.id as deno.BaseTier];
      expect(limits.sites).toBe(sub.limits.sites);
      expect(limits.apiRequestsPerDay).toBe(sub.limits.api_requests_day);
      expect(limits.domainsPerMonth).toBe(sub.limits.domains_per_month);
    }
    expect(deno.TIER_LIMITS.free.sites).toBe(pricing.free_registered.sites_limit);
    expect(deno.TIER_LIMITS.free.domainsPerMonth).toBe(pricing.free_registered.domains_per_month);
  });

  it('matches the lifetime deals', () => {
    for (const ltd of pricing.lifetime_deals.tiers) {
      const deal = deno.LTD_TIERS[ltd.id as deno.LtdTier];
      expect(deal.limits.sites).toBe(ltd.limits.sites);
      expect(deal.limits.apiRequestsPerDay).toBe(ltd.limits.api_requests_day);
    }
  });
});
