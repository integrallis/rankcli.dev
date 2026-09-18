-- Row level security gaps found in the 2026-09-18 audit. Every table touched
-- here is written only by edge functions or the audit worker, which use the
-- service role and bypass RLS, so nothing below changes a server-side path.

-- -----------------------------------------------------------------------------
-- ai_visibility_checks (024), url_comparisons (025), chatgpt_checks (023)
-- -----------------------------------------------------------------------------
-- Created without RLS, so the anon key could read, change and delete every
-- row. check-ai-visibility and compare-urls rate-limit by counting these rows,
-- which meant deleting your own reset the limit on paid LLM calls.
ALTER TABLE ai_visibility_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatgpt_checks ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ai_visibility_checks, url_comparisons, chatgpt_checks FROM anon, authenticated;
GRANT SELECT ON ai_visibility_checks TO authenticated;

-- The dashboard's AIVisibilityCard and the AI visibility tool page read a
-- project's history by project_id. Rows from the public tool have no project
-- and stay private. url_comparisons and chatgpt_checks have no owner column,
-- so they get no policy at all: service role only.
DROP POLICY IF EXISTS "Users can view own ai_visibility_checks" ON ai_visibility_checks;
CREATE POLICY "Users can view own ai_visibility_checks"
  ON ai_visibility_checks FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- api_requests (029)
-- -----------------------------------------------------------------------------
-- "Service can insert API requests" was WITH CHECK (true) for every role, so
-- the anon key could insert rows into the table daily API quotas are counted
-- from. validate-api-key and the audit worker, on the service role, are the
-- only writers.
DROP POLICY IF EXISTS "Service can insert API requests" ON api_requests;
CREATE POLICY "Service can insert API requests"
  ON api_requests FOR INSERT TO service_role
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- widget_tokens (026 and 20250303)
-- -----------------------------------------------------------------------------
-- Two INSERT policies are OR'd. 026's only checked user_id = auth.uid(), and
-- a trigger always sets user_id to the caller, so any signed-in user could
-- mint a widget token for any project and read its scores through
-- widget-data. The remaining 20250303 policy requires owning the project.
DROP POLICY IF EXISTS "Users can create widget tokens" ON widget_tokens;

-- Tokens minted that way belong to someone other than the project owner.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'widget_tokens' AND column_name = 'user_id'
  ) THEN
    DELETE FROM widget_tokens wt
    USING projects p
    WHERE wt.project_id = p.id AND wt.user_id IS DISTINCT FROM p.user_id;
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- oauth_connections (020)
-- -----------------------------------------------------------------------------
-- "Users can manage own oauth_connections" checked user_id only, so a user
-- could attach their own Search Console token to another user's project and
-- sync-gsc-metrics would write that data into the victim's metrics.
DROP POLICY IF EXISTS "Users can manage own oauth_connections" ON oauth_connections;
CREATE POLICY "Users can manage own oauth_connections"
  ON oauth_connections FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (project_id IS NULL OR project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  );

DELETE FROM oauth_connections oc
USING projects p
WHERE oc.project_id = p.id AND oc.user_id <> p.user_id;

-- -----------------------------------------------------------------------------
-- free_audits (001)
-- -----------------------------------------------------------------------------
-- "Anyone can create free audit" let the anon key insert leads with any
-- email address. send-audit-followups mails those leads, and
-- send-free-audit-report now only mails reports for a real free_audits row,
-- so both rely on rows coming from the free-audit function (service role).
DROP POLICY IF EXISTS "Anyone can create free audit" ON free_audits;
