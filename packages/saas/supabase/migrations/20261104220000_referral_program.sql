-- The referral program (2026-11-04). What Otterly, SE Ranking and Seobility run as affiliate
-- programs with cash, done as credit, in-product, with no payouts to administer:
--
--   - every account has a referral code (profiles.referral_code, issued by my_referral_code());
--     the link is rankcli.dev/?ref=<code>, captured by the site with the signup source;
--   - the referred account, within 7 days of signing up, gets 30 days of Pro instead of 14
--     (apply_referral(): its signup trial is extended; a Stripe subscription is never touched);
--   - when the referred account first pays, the referrer gets one month of their own plan as a
--     Stripe balance credit (reward_referrer() returns what the webhook applies), or 30 days of
--     Pro when they are not paying.
--
-- One referral per referred account, never yourself; referred_by is written once.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'converted', 'rewarded')),
  reward TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Referrers see their referrals" ON referrals;
CREATE POLICY "Referrers see their referrals" ON referrals FOR SELECT USING (referrer_id = auth.uid());

-- The profile guard: github_username and signup_source as before; referral_code is issued by
-- the service and referred_by is written once.
CREATE OR REPLACE FUNCTION public.guard_profile_github_username()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon')
     AND NEW.github_username IS DISTINCT FROM OLD.github_username THEN
    RAISE EXCEPTION 'github_username comes from your GitHub sign-in and cannot be edited'
      USING ERRCODE = '42501';
  END IF;
  IF current_user IN ('authenticated', 'anon')
     AND OLD.signup_source IS NOT NULL
     AND NEW.signup_source IS DISTINCT FROM OLD.signup_source THEN
    RAISE EXCEPTION 'signup_source is recorded once' USING ERRCODE = '42501';
  END IF;
  IF current_user IN ('authenticated', 'anon')
     AND NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'referral_code is issued by the service' USING ERRCODE = '42501';
  END IF;
  IF current_user IN ('authenticated', 'anon')
     AND NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'referred_by is set through apply_referral()' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

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
      v_code := substr(encode(gen_random_bytes(6), 'hex'), 1, 8);
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

CREATE OR REPLACE FUNCTION public.apply_referral(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me UUID := auth.uid();
  v_referrer UUID;
BEGIN
  IF v_me IS NULL OR p_code IS NULL OR length(trim(p_code)) = 0 THEN RETURN FALSE; END IF;
  SELECT id INTO v_referrer FROM profiles WHERE referral_code = lower(trim(p_code));
  IF v_referrer IS NULL OR v_referrer = v_me THEN RETURN FALSE; END IF;
  IF EXISTS (SELECT 1 FROM profiles WHERE id = v_me AND (referred_by IS NOT NULL OR created_at < NOW() - INTERVAL '7 days')) THEN
    RETURN FALSE;
  END IF;
  UPDATE profiles SET referred_by = v_referrer WHERE id = v_me;
  INSERT INTO referrals (referrer_id, referred_id) VALUES (v_referrer, v_me) ON CONFLICT (referred_id) DO NOTHING;
  -- 30 days of Pro instead of 14: the signup trial only, never a Stripe subscription.
  UPDATE user_subscriptions
     SET current_period_end = GREATEST(COALESCE(current_period_end, NOW()), NOW()) + INTERVAL '16 days'
   WHERE user_id = v_me AND status = 'trialing' AND stripe_subscription_id IS NULL;
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_referral(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_referral(TEXT) TO authenticated;

-- Called by the Stripe webhook on a referred account's first paid invoice. Returns what the
-- webhook has to do: {"action":"stripe_credit",...} to credit a paying referrer one month of
-- their plan, or {"action":"pro_30d"} when the referrer got 30 days of Pro here.
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
     SET plan_id = COALESCE(plan_id, v_pro),
         status = 'trialing',
         current_period_start = COALESCE(current_period_start, NOW()),
         current_period_end = GREATEST(COALESCE(current_period_end, NOW()), NOW()) + INTERVAL '30 days'
   WHERE user_id = r.referrer_id AND stripe_subscription_id IS NULL;
  UPDATE referrals SET status = 'rewarded', reward = 'pro_30d', rewarded_at = NOW() WHERE id = r.id;
  RETURN jsonb_build_object('action', 'pro_30d', 'referral_id', r.id);
END;
$$;
REVOKE ALL ON FUNCTION public.reward_referrer(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reward_referrer(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.mark_referral_rewarded(p_referral UUID, p_reward TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE referrals SET status = 'rewarded', reward = p_reward, rewarded_at = NOW() WHERE id = p_referral;
$$;
REVOKE ALL ON FUNCTION public.mark_referral_rewarded(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_referral_rewarded(UUID, TEXT) TO service_role;
