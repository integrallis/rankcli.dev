-- Schedule enforcement for tier-based audit frequency limits
-- Solo: weekly, Pro: daily, Agency: hourly

-- Add schedule tracking columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS last_scheduled_audit_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_audit_source TEXT; -- 'cli', 'github_action', 'web'

-- Create index for schedule lookups
CREATE INDEX IF NOT EXISTS idx_projects_last_scheduled_audit 
ON projects(user_id, last_scheduled_audit_at);

-- Schedule intervals per tier (in hours)
-- Stored in subscription_plans.features as 'schedule_interval_hours'
-- Solo: 168 (weekly), Pro: 24 (daily), Agency: 1 (hourly)

-- Add schedule_interval_hours to plans
UPDATE subscription_plans 
SET features = features || '{"schedule_interval_hours": 168}'::jsonb
WHERE plan_id = 'solo' AND NOT (features ? 'schedule_interval_hours');

UPDATE subscription_plans 
SET features = features || '{"schedule_interval_hours": 24}'::jsonb
WHERE plan_id = 'pro' AND NOT (features ? 'schedule_interval_hours');

UPDATE subscription_plans 
SET features = features || '{"schedule_interval_hours": 1}'::jsonb
WHERE plan_id = 'agency' AND NOT (features ? 'schedule_interval_hours');

-- Function to check if audit is allowed based on schedule
CREATE OR REPLACE FUNCTION check_audit_schedule(
  p_user_id UUID,
  p_project_id UUID,
  p_plan_id TEXT
)
RETURNS TABLE (
  allowed BOOLEAN,
  next_allowed_at TIMESTAMPTZ,
  interval_hours INTEGER,
  last_audit_at TIMESTAMPTZ
) AS $$
DECLARE
  v_interval_hours INTEGER;
  v_last_audit TIMESTAMPTZ;
  v_next_allowed TIMESTAMPTZ;
BEGIN
  -- Get interval for plan
  SELECT COALESCE((features->>'schedule_interval_hours')::INTEGER, 168)
  INTO v_interval_hours
  FROM subscription_plans
  WHERE plan_id = p_plan_id;

  -- Default to weekly for free tier
  IF v_interval_hours IS NULL THEN
    v_interval_hours := 168;
  END IF;

  -- Get last scheduled audit for project
  SELECT last_scheduled_audit_at
  INTO v_last_audit
  FROM projects
  WHERE id = p_project_id AND user_id = p_user_id;

  -- Calculate next allowed time
  IF v_last_audit IS NOT NULL THEN
    v_next_allowed := v_last_audit + (v_interval_hours || ' hours')::INTERVAL;
  ELSE
    v_next_allowed := NOW() - INTERVAL '1 second'; -- Allow immediately if never audited
  END IF;

  RETURN QUERY SELECT 
    NOW() >= v_next_allowed AS allowed,
    v_next_allowed,
    v_interval_hours,
    v_last_audit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last audit timestamp (called after successful audit)
CREATE OR REPLACE FUNCTION update_audit_schedule(
  p_project_id UUID,
  p_source TEXT DEFAULT 'cli'
)
RETURNS VOID AS $$
BEGIN
  UPDATE projects
  SET 
    last_scheduled_audit_at = NOW(),
    scheduled_audit_source = p_source
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_audit_schedule IS 'Check if scheduled audit is allowed based on tier limits';
COMMENT ON FUNCTION update_audit_schedule IS 'Update last scheduled audit timestamp after successful audit';
