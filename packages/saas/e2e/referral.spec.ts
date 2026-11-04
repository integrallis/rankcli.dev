import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// The referral program's SQL (migrations 20261104220000 and 20261104235000), exercised
// against the real database with two throwaway accounts that are deleted at the end,
// whatever happens. No browser: the functions are called the way the app and the Stripe
// webhook call them.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const DAY = 86400000;
const daysFromNow = (iso: string | null) => (iso ? Math.round((new Date(iso).getTime() - Date.now()) / DAY) : null);

test.describe('Referral program', () => {
  let admin: SupabaseClient;
  const stamp = Date.now();
  const password = `E2e-referral-${stamp}!`;
  const created: string[] = [];

  const createUser = async (label: string) => {
    const email = `e2e-referral-${label}-${stamp}@rankcli.dev`;
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw error ?? new Error('no user');
    created.push(data.user.id);
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error: signIn } = await client.auth.signInWithPassword({ email, password });
    if (signIn) throw signIn;
    return { id: data.user.id, client };
  };

  const subscription = async (userId: string) => {
    const { data, error } = await admin
      .from('user_subscriptions')
      .select('status, current_period_end, stripe_subscription_id, plan:subscription_plans(plan_id)')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    const plan = Array.isArray(data?.plan) ? data?.plan[0] : data?.plan;
    return { status: data?.status ?? null, end: data?.current_period_end ?? null, plan: plan?.plan_id ?? null };
  };

  test.beforeAll(() => {
    admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  });

  test.afterAll(async () => {
    for (const id of created) {
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw new Error(`throwaway account ${id} not deleted: ${error.message}`);
    }
  });

  test('a code is issued once, a referral is applied once, the referrer is rewarded once', async () => {
    const referrer = await createUser('referrer');
    const referred = await createUser('referred');

    // The code: eight hex characters, issued by the service, the same on every call.
    const { data: code, error: codeError } = await referrer.client.rpc('my_referral_code');
    expect(codeError).toBeNull();
    expect(code).toMatch(/^[0-9a-f]{8}$/);
    const { data: again } = await referrer.client.rpc('my_referral_code');
    expect(again).toBe(code);

    // A self-referral and an unknown code are refused without error.
    expect((await referrer.client.rpc('apply_referral', { p_code: code })).data).toBe(false);
    expect((await referred.client.rpc('apply_referral', { p_code: 'nosuchcode' })).data).toBe(false);

    // The referred account: its 14-day trial becomes 30 days; a second application does nothing.
    const before = await subscription(referred.id);
    expect(before.plan).toBe('pro');
    expect(before.status).toBe('trialing');
    expect(daysFromNow(before.end)).toBe(14);
    const { data: applied, error: applyError } = await referred.client.rpc('apply_referral', { p_code: code.toUpperCase() });
    expect(applyError).toBeNull();
    expect(applied).toBe(true);
    expect(daysFromNow((await subscription(referred.id)).end)).toBe(30);
    expect((await referred.client.rpc('apply_referral', { p_code: code })).data).toBe(false);
    expect(daysFromNow((await subscription(referred.id)).end)).toBe(30);

    // The referrer sees the referral; the referred does not; nobody can edit referred_by.
    const { data: mine } = await referrer.client.from('referrals').select('status, referred_id');
    expect(mine).toEqual([{ status: 'signed_up', referred_id: referred.id }]);
    const { data: theirs } = await referred.client.from('referrals').select('id');
    expect(theirs).toEqual([]);
    const { error: guard } = await referred.client.from('profiles').update({ referred_by: null }).eq('id', referred.id);
    expect(guard?.code).toBe('42501');

    // A referrer from before the trial (a Free row: no plan, no Stripe) gets 30 days of Pro
    // when the referred account first pays; the reward is paid once.
    const { error: legacy } = await admin
      .from('user_subscriptions')
      .update({ plan_id: null, status: 'active', current_period_start: null, current_period_end: null })
      .eq('user_id', referrer.id);
    expect(legacy).toBeNull();
    const { data: reward, error: rewardError } = await admin.rpc('reward_referrer', { p_referred: referred.id });
    expect(rewardError).toBeNull();
    expect(reward?.action).toBe('pro_30d');
    const after = await subscription(referrer.id);
    expect(after.plan).toBe('pro');
    expect(after.status).toBe('trialing');
    expect(daysFromNow(after.end)).toBe(30);
    const { data: entitlement } = await admin.rpc('effective_entitlement', { p_user_id: referrer.id });
    expect(entitlement?.[0]?.tier).toBe('pro');
    const { data: row } = await admin.from('referrals').select('status, reward').eq('referred_id', referred.id).single();
    expect(row).toEqual({ status: 'rewarded', reward: 'pro_30d' });
    expect((await admin.rpc('reward_referrer', { p_referred: referred.id })).data).toBeNull();
    expect(daysFromNow((await subscription(referrer.id)).end)).toBe(30);

    // The service-only functions are refused to a signed-in user.
    const { error: notYours } = await referrer.client.rpc('reward_referrer', { p_referred: referred.id });
    expect(notYours?.code).toBe('42501');
  });
});
