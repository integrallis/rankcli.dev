-- A gifted PR that failed is not a gifted PR.
--
-- The grant is claimed before the model is called, so a crash mid-flight still consumes it. That
-- is the right order - it is what makes the one-per-account limit hold under concurrency and
-- retries - but it means our own failures were charged to the user. It happened: a model replied
-- with something JSON.parse could not read, create-seo-pr returned a 500, and the account's one
-- free PR was gone with nothing to show for it.
--
-- So 'failed' becomes a state a grant can be claimed out of. The primary key still guarantees one
-- *successful* gift per account: a settled grant can never be re-claimed, and two concurrent
-- requests still cannot both win, because the conditional ON CONFLICT ... DO UPDATE updates the
-- row at most once.
CREATE OR REPLACE FUNCTION public.claim_ai_gift(
  p_user_id UUID,
  p_project_id UUID DEFAULT NULL,
  p_audit_id UUID DEFAULT NULL,
  p_daily_ceiling INTEGER DEFAULT 200
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_today INTEGER;
BEGIN
  -- Only grants that went somewhere count against the day's ceiling; a failed attempt should not
  -- consume the pool any more than it consumes the user's gift.
  SELECT COUNT(*) INTO v_today
  FROM ai_gift_grants
  WHERE granted_at >= date_trunc('day', NOW())
    AND status <> 'failed';

  IF v_today >= p_daily_ceiling THEN
    RETURN FALSE;
  END IF;

  INSERT INTO ai_gift_grants (user_id, project_id, audit_id)
  VALUES (p_user_id, p_project_id, p_audit_id)
  ON CONFLICT (user_id) DO UPDATE
    SET granted_at = NOW(),
        status = 'claimed',
        project_id = EXCLUDED.project_id,
        audit_id = EXCLUDED.audit_id,
        model = NULL,
        prompt_tokens = NULL,
        completion_tokens = NULL,
        cost_usd = NULL
    -- The condition is the whole point: a settled grant is untouched, so FOUND stays false and
    -- the caller falls through to the template fixes.
    WHERE ai_gift_grants.status = 'failed';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_ai_gift(UUID, UUID, UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_ai_gift(UUID, UUID, UUID, INTEGER) TO service_role;
