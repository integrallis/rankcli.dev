-- A 14-day Pro trial on every new account, no card (pricing-tiers.json `trial`, enabled from
-- here on). What the established tools do (SE Ranking and Seobility: 14 days, no card): the
-- paid capability is felt before it is bought. The signup trigger creates the subscription row
-- on the Pro plan with status 'trialing' and a period of 14 days; nothing else changes.
--
-- A trial ends by its date, not by a job: effective_entitlement() now counts a 'trialing' row
-- only while current_period_end is in the future (as it already did for 'canceled'), so an
-- expired trial reads as the Free plan everywhere the database decides. Stripe's own trials
-- carry a current_period_end from the webhook, so they are unaffected.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
  SELECT NEW.id, sp.id, 'trialing', NOW(), NOW() + INTERVAL '14 days'
  FROM subscription_plans sp
  WHERE sp.plan_id = 'pro'
  ON CONFLICT (user_id) DO NOTHING;
  IF NOT FOUND THEN
    -- No Pro plan row (a fresh environment): the Free plan, as before.
    INSERT INTO user_subscriptions (user_id, status)
    VALUES (NEW.id, 'active')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create subscription for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.effective_entitlement(p_user_id UUID)
RETURNS TABLE (tier TEXT, plan_id TEXT, source TEXT, sites_limit INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH candidates AS (
    SELECT 0 AS rank, 2 AS pref, 'free'::TEXT AS tier, 'free'::TEXT AS plan_id,
           'free'::TEXT AS source, 1 AS sites_limit

    UNION ALL

    -- past_due is Stripe's payment-retry window. 'canceled' with a future period end is a
    -- row the old webhook marked canceled as soon as the customer chose cancel-at-period-end.
    SELECT CASE b.base WHEN 'solo' THEN 1 WHEN 'pro' THEN 2 WHEN 'agency' THEN 3 END,
           0, b.base, sp.plan_id, 'subscription', sp.sites_limit
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON sp.id = us.plan_id
    CROSS JOIN LATERAL (SELECT regexp_replace(sp.plan_id, '_(annual|founding)$', '') AS base) b
    WHERE us.user_id = p_user_id
      AND b.base IN ('solo', 'pro', 'agency')
      AND (us.status IN ('active', 'past_due')
           OR (us.status IN ('trialing', 'canceled') AND us.current_period_end > NOW()))

    UNION ALL

    SELECT CASE lp.tier WHEN 'ltd_starter' THEN 1 WHEN 'ltd_pro' THEN 2 WHEN 'ltd_agency' THEN 3 END,
           1,
           CASE lp.tier WHEN 'ltd_starter' THEN 'solo' WHEN 'ltd_pro' THEN 'pro' WHEN 'ltd_agency' THEN 'agency' END,
           lp.tier::TEXT, 'lifetime',
           CASE lp.tier WHEN 'ltd_starter' THEN 1 WHEN 'ltd_pro' THEN 3 WHEN 'ltd_agency' THEN 10 END
    FROM public.ltd_purchases lp
    WHERE lp.user_id = p_user_id
      AND lp.refunded_at IS NULL
  )
  SELECT c.tier, c.plan_id, c.source, c.sites_limit
  FROM candidates c
  ORDER BY c.rank DESC, c.pref ASC
  LIMIT 1;
$$;

-- Takes any user id, so only the service role (and definer-owned functions) may call it.
-- Supabase grants EXECUTE on new functions to anon and authenticated by default, hence
-- the explicit revokes.
