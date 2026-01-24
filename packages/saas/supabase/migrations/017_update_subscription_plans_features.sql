-- Update subscription plans with new tier structure
-- Solo: Local auto-fix, no GitHub
-- Pro: GitHub integration + auto-fix PRs
-- Agency: API access + white-label

-- Update Solo plan
UPDATE subscription_plans
SET
  price_cents = 900,
  features = jsonb_build_object(
    'full_audit', true,
    'checks_limit', 280,
    'export_reports', true,
    'local_auto_fix', true,
    'github_connect', false,
    'github_auto_fix', false,
    'slack_alerts', false,
    'api_access', false,
    'competitor_tracking', 0,
    'white_label', false,
    'priority_support', false,
    'weekly_schedule', true
  )
WHERE plan_id = 'solo';

-- Update Pro plan
UPDATE subscription_plans
SET
  features = jsonb_build_object(
    'full_audit', true,
    'checks_limit', 280,
    'export_reports', true,
    'local_auto_fix', true,
    'github_connect', true,
    'github_auto_fix', true,
    'slack_alerts', true,
    'api_access', false,
    'competitor_tracking', 3,
    'white_label', false,
    'priority_support', false,
    'daily_schedule', true
  )
WHERE plan_id = 'pro';

-- Update Agency plan
UPDATE subscription_plans
SET
  features = jsonb_build_object(
    'full_audit', true,
    'checks_limit', 280,
    'export_reports', true,
    'local_auto_fix', true,
    'github_connect', true,
    'github_auto_fix', true,
    'slack_alerts', true,
    'api_access', true,
    'competitor_tracking', 10,
    'white_label', true,
    'priority_support', true,
    'hourly_schedule', true
  )
WHERE plan_id = 'agency';

-- Add checks_limit column to subscription_plans if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'checks_limit'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN checks_limit INTEGER DEFAULT 280;
  END IF;
END $$;

-- Update checks limits per tier
UPDATE subscription_plans SET checks_limit = 280 WHERE plan_id IN ('solo', 'pro', 'agency');

-- Add free tier limits to user_subscriptions for users without a plan
-- Free registered users get 100 checks, 1 site
COMMENT ON TABLE user_subscriptions IS 'User subscription status. Users without a plan_id are on free tier (100 checks, 1 site)';
