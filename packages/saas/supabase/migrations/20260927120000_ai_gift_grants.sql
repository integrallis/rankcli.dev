-- One gifted AI fix PR per account, ever.
--
-- Auto-fix PRs run on the customer's own AI key. That is still the rule, and it is also a
-- wall in front of the first thing a new account wants to try, so each account gets exactly
-- one PR generated on RankCLI's own OpenRouter key. Measured cost of a PR is ~9K input and
-- ~3K output tokens: fractions of a cent. The scarce thing being protected here is not the
-- money, it is that one-per-account has to mean one.
--
-- So the limit is a primary key, not a count. Two concurrent requests cannot both be the
-- first: the second insert fails on the key and falls through to the template fixes. No
-- advisory lock, no read-then-write race, no way for retry logic to spend it twice.
CREATE TABLE IF NOT EXISTS ai_gift_grants (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- What it was spent on and what it cost us, so the unit economics stay visible from the
  -- first grant rather than being reconstructed from OpenRouter's dashboard later.
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  audit_id UUID REFERENCES audits(id) ON DELETE SET NULL,
  model TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  cost_usd NUMERIC(10, 6),
  -- A grant is claimed before the model is called and settled after, so a crash mid-flight
  -- still consumes the gift. 'claimed' rows that never settle are the failure signal.
  status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'settled', 'failed'))
);

-- The daily ceiling query: "how many gifts today". A single actor is already capped by the
-- primary key; this bounds a flood of fresh accounts.
CREATE INDEX IF NOT EXISTS ai_gift_grants_granted_at_idx ON ai_gift_grants (granted_at DESC);

ALTER TABLE ai_gift_grants ENABLE ROW LEVEL SECURITY;

-- Users may see whether they have spent theirs, so the dashboard can say so. Only the
-- service-role edge functions write: a client that could insert here could grant itself.
CREATE POLICY "Users can view own AI gift grant"
  ON ai_gift_grants FOR SELECT
  USING (user_id = auth.uid());

/**
 * Claims the caller's one gifted PR, atomically. Returns true exactly once per user, and
 * only while the day's ceiling has room.
 *
 * SECURITY DEFINER with a fixed search_path, granted to service_role only - this function
 * hands out spend, so it is not something an authenticated client may call.
 */
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
  SELECT COUNT(*) INTO v_today
  FROM ai_gift_grants
  WHERE granted_at >= date_trunc('day', NOW());

  IF v_today >= p_daily_ceiling THEN
    RETURN FALSE;
  END IF;

  -- The primary key is the one-shot. ON CONFLICT DO NOTHING makes a second attempt a
  -- no-op rather than an error, and FOUND tells us which of the two happened.
  INSERT INTO ai_gift_grants (user_id, project_id, audit_id)
  VALUES (p_user_id, p_project_id, p_audit_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_ai_gift(UUID, UUID, UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_ai_gift(UUID, UUID, UUID, INTEGER) TO service_role;

/** Records what the gifted call actually cost, or marks it failed so it can be investigated. */
CREATE OR REPLACE FUNCTION public.settle_ai_gift(
  p_user_id UUID,
  p_status TEXT,
  p_model TEXT DEFAULT NULL,
  p_prompt_tokens INTEGER DEFAULT NULL,
  p_completion_tokens INTEGER DEFAULT NULL,
  p_cost_usd NUMERIC DEFAULT NULL
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE ai_gift_grants
  SET status = p_status,
      model = COALESCE(p_model, model),
      prompt_tokens = COALESCE(p_prompt_tokens, prompt_tokens),
      completion_tokens = COALESCE(p_completion_tokens, completion_tokens),
      cost_usd = COALESCE(p_cost_usd, cost_usd)
  WHERE user_id = p_user_id;
$$;

REVOKE ALL ON FUNCTION public.settle_ai_gift(UUID, TEXT, TEXT, INTEGER, INTEGER, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_ai_gift(UUID, TEXT, TEXT, INTEGER, INTEGER, NUMERIC) TO service_role;
