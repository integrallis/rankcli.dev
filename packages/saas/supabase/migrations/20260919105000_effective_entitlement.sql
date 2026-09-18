-- A user's effective plan, computed in the database.
--
-- The inputs are awkward enough that every caller got them wrong:
--   - user_subscriptions.plan_id is a UUID into subscription_plans, whose text plan_id
--     includes billing variants of a tier (solo_annual, pro_founding, ...);
--   - only some statuses grant the plan;
--   - lifetime-deal buyers have no plan row at all, only an ltd_purchases row.
--
-- effective_entitlement() is the SQL copy of supabase/functions/_shared/tier.ts
-- (resolveEntitlement) and audit-worker/src/tier.ts. Keep the three in step: same statuses,
-- same LTD mapping (starter/pro/agency -> solo/pro/agency with 1/3/10 sites, from
-- pricing-tiers.json), and the same tie-break (higher tier wins; at the same tier a
-- subscription wins over a lifetime deal).

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
      AND (us.status IN ('active', 'trialing', 'past_due')
           OR (us.status = 'canceled' AND us.current_period_end > NOW()))

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
REVOKE ALL ON FUNCTION public.effective_entitlement(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.effective_entitlement(UUID) TO service_role;

-- The signed-in user's own plan, for the dashboard.
CREATE OR REPLACE FUNCTION public.get_my_entitlement()
RETURNS TABLE (tier TEXT, plan_id TEXT, source TEXT, sites_limit INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM public.effective_entitlement(auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_my_entitlement() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_entitlement() TO authenticated, service_role;
