-- Fix audit throttling: add schedule_interval_hours to plans and fix function

-- Add schedule_interval_hours to subscription plans
UPDATE subscription_plans 
SET features = features || '{"schedule_interval_hours": 168}'::jsonb 
WHERE plan_id = 'solo' AND NOT (features ? 'schedule_interval_hours');

UPDATE subscription_plans 
SET features = features || '{"schedule_interval_hours": 24}'::jsonb 
WHERE plan_id = 'pro' AND NOT (features ? 'schedule_interval_hours');

UPDATE subscription_plans 
SET features = features || '{"schedule_interval_hours": 1}'::jsonb 
WHERE plan_id = 'agency' AND NOT (features ? 'schedule_interval_hours');

-- Add error_message column to audits if not exists
ALTER TABLE audits ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Fix check_audit_schedule function to use UUID id instead of text plan_id
CREATE OR REPLACE FUNCTION check_audit_schedule(
  p_user_id UUID, 
  p_project_id UUID, 
  p_plan_id UUID
) 
RETURNS TABLE(
  allowed BOOLEAN, 
  next_allowed_at TIMESTAMPTZ, 
  interval_hours INTEGER, 
  last_audit_at TIMESTAMPTZ
) 
LANGUAGE plpgsql AS $$
DECLARE
  v_interval_hours INTEGER;
  v_last_audit TIMESTAMPTZ;
  v_next_allowed TIMESTAMPTZ;
BEGIN
  -- Look up by subscription_plans.id (UUID), not plan_id (text)
  SELECT COALESCE((features->>'schedule_interval_hours')::INTEGER, 168)
  INTO v_interval_hours
  FROM subscription_plans
  WHERE id = p_plan_id;

  IF v_interval_hours IS NULL THEN
    v_interval_hours := 168;
  END IF;

  SELECT last_scheduled_audit_at
  INTO v_last_audit
  FROM projects
  WHERE id = p_project_id AND user_id = p_user_id;

  IF v_last_audit IS NOT NULL THEN
    v_next_allowed := v_last_audit + (v_interval_hours || ' hours')::INTERVAL;
  ELSE
    v_next_allowed := NOW() - INTERVAL '1 second';
  END IF;

  RETURN QUERY SELECT 
    NOW() >= v_next_allowed AS allowed,
    v_next_allowed,
    v_interval_hours,
    v_last_audit;
END;
$$;

-- Clean up any stuck audits (pending/running for more than 10 minutes)
UPDATE audits 
SET 
  status = 'failed', 
  error_message = 'Audit timed out during deployment',
  completed_at = NOW()
WHERE 
  status IN ('pending', 'running') 
  AND created_at < NOW() - INTERVAL '10 minutes';

-- Create function to clean up stuck audits (can be called manually or on deploy)
CREATE OR REPLACE FUNCTION cleanup_stuck_audits() 
RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  UPDATE audits 
  SET 
    status = 'failed', 
    error_message = 'Audit timed out',
    completed_at = NOW()
  WHERE 
    status IN ('pending', 'running') 
    AND created_at < NOW() - INTERVAL '10 minutes';
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN cleaned_count;
END;
$$;
