-- Two fixes to the referral program's SQL (2026-11-04, found by the E2E spec in e2e/referral.spec.ts).
--
-- 1. my_referral_code() failed on every call: it used gen_random_bytes(), which lives in the
--    `extensions` schema on Supabase, under a search_path of `public` alone. The code now comes
--    from gen_random_uuid() (core PostgreSQL), hashed and cut to eight hex characters.
--
-- 2. reward_referrer(): the 30 days of Pro reach every referrer who has no live Stripe
--    subscription. The first cut kept the row's plan (a legacy Free row has plan_id NULL, which
--    COALESCE turned into Pro, but a Solo or Agency row that Stripe had canceled kept its plan
--    and, having a stripe_subscription_id, was skipped altogether) and granted nothing to an
--    account with no subscription row. Now: a live Stripe subscription gets the balance credit
--    (unchanged); any other row becomes a Pro trial for 30 more days, keeping its Stripe ids;
--    no row at all gets one.

CREATE OR REPLACE FUNCTION public.my_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT referral_code INTO v_code FROM profiles WHERE id = auth.uid();
  WHILE v_code IS NULL LOOP
    BEGIN
      v_code := substr(md5(gen_random_uuid()::text), 1, 8);
      UPDATE profiles SET referral_code = v_code WHERE id = auth.uid() AND referral_code IS NULL;
      IF NOT FOUND THEN
        SELECT referral_code INTO v_code FROM profiles WHERE id = auth.uid();
      END IF;
    EXCEPTION WHEN unique_violation THEN
      v_code := NULL;
    END;
  END LOOP;
  RETURN v_code;
END;
$$;
REVOKE ALL ON FUNCTION public.my_referral_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_referral_code() TO authenticated;

CREATE OR REPLACE FUNCTION public.reward_referrer(p_referred UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r referrals%ROWTYPE;
  v_customer TEXT;
  v_cents INTEGER;
  v_pro UUID;
BEGIN
  SELECT * INTO r FROM referrals WHERE referred_id = p_referred AND status = 'signed_up';
  IF NOT FOUND THEN RETURN NULL; END IF;
  UPDATE referrals SET status = 'converted', converted_at = NOW() WHERE id = r.id;

  SELECT us.stripe_customer_id, sp.price_cents INTO v_customer, v_cents
    FROM user_subscriptions us
    JOIN subscription_plans sp ON sp.id = us.plan_id
   WHERE us.user_id = r.referrer_id
     AND us.stripe_subscription_id IS NOT NULL
     AND us.status IN ('active', 'trialing', 'past_due');
  IF v_customer IS NOT NULL AND COALESCE(v_cents, 0) > 0 THEN
    RETURN jsonb_build_object('action', 'stripe_credit', 'referral_id', r.id, 'customer', v_customer, 'amount_cents', v_cents);
  END IF;

  SELECT id INTO v_pro FROM subscription_plans WHERE plan_id = 'pro';
  UPDATE user_subscriptions
     SET plan_id = v_pro,
         status = 'trialing',
         current_period_start = COALESCE(current_period_start, NOW()),
         current_period_end = GREATEST(COALESCE(current_period_end, NOW()), NOW()) + INTERVAL '30 days'
   WHERE user_id = r.referrer_id
     AND NOT (stripe_subscription_id IS NOT NULL AND status IN ('active', 'trialing', 'past_due'));
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
    VALUES (r.referrer_id, v_pro, 'trialing', NOW(), NOW() + INTERVAL '30 days')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  UPDATE referrals SET status = 'rewarded', reward = 'pro_30d', rewarded_at = NOW() WHERE id = r.id;
  RETURN jsonb_build_object('action', 'pro_30d', 'referral_id', r.id);
END;
$$;
REVOKE ALL ON FUNCTION public.reward_referrer(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reward_referrer(UUID) TO service_role;
