-- Annual billing for Solo/Pro/Agency
--
-- Same pattern as the founding-offer migration (20260903120000): a second
-- Stripe price can't live on the same subscription_plans row, because
-- stripe_price_id is a single column, unique on plan_id. So each annual
-- variant gets its own plan_id row (solo_annual/pro_annual/agency_annual),
-- copied from its base tier's limits/features, with billing_period='year'.
-- The webhook/create-checkout path needs no changes - both resolve plans
-- purely by whatever plan_id string the client sends, exactly like
-- pro_founding already proves.
--
-- price_cents here matches pricing-tiers.json's price_cents_annual for each
-- tier (the JSON already carried these values for display; they were just
-- never backed by a real plan row or Stripe price). stripe_price_id is left
-- NULL until `pnpm run seed:pricing:stripe` creates the actual annual Stripe
-- Prices and fills it in - see seed-pricing.ts's syncAnnualPricing().

INSERT INTO subscription_plans (
  plan_id, name, description, price_cents, billing_period,
  sites_limit, team_members_limit, audits_per_month, api_requests_per_day,
  keywords_limit, historical_days, features, checks_limit, is_active, sort_order
)
SELECT
  'solo_annual', 'Solo (Annual)', description, 7200, 'year',
  sites_limit, team_members_limit, audits_per_month, api_requests_per_day,
  keywords_limit, historical_days, features, checks_limit, is_active, sort_order
FROM subscription_plans
WHERE plan_id = 'solo'
ON CONFLICT (plan_id) DO NOTHING;

INSERT INTO subscription_plans (
  plan_id, name, description, price_cents, billing_period,
  sites_limit, team_members_limit, audits_per_month, api_requests_per_day,
  keywords_limit, historical_days, features, checks_limit, is_active, sort_order
)
SELECT
  'pro_annual', 'Pro (Annual)', description, 23200, 'year',
  sites_limit, team_members_limit, audits_per_month, api_requests_per_day,
  keywords_limit, historical_days, features, checks_limit, is_active, sort_order
FROM subscription_plans
WHERE plan_id = 'pro'
ON CONFLICT (plan_id) DO NOTHING;

INSERT INTO subscription_plans (
  plan_id, name, description, price_cents, billing_period,
  sites_limit, team_members_limit, audits_per_month, api_requests_per_day,
  keywords_limit, historical_days, features, checks_limit, is_active, sort_order
)
SELECT
  'agency_annual', 'Agency (Annual)', description, 79200, 'year',
  sites_limit, team_members_limit, audits_per_month, api_requests_per_day,
  keywords_limit, historical_days, features, checks_limit, is_active, sort_order
FROM subscription_plans
WHERE plan_id = 'agency'
ON CONFLICT (plan_id) DO NOTHING;
