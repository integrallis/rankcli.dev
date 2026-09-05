-- Backs the landing page's SocialProof widget (components/landing/SocialProof.tsx),
-- which calls supabase.rpc('get_audit_stats') - that function never existed, so the
-- call always failed silently (console.error only) and the widget never rendered.
--
-- "Checks" here = completed audits (both registered-user audits and anonymous
-- free-audits) * 280, since every audit path in this codebase requests
-- checksLimit: 280 from the worker (see free-audit/index.ts, run-audit/index.ts).
CREATE OR REPLACE FUNCTION get_audit_stats()
RETURNS TABLE (
  checks_today BIGINT,
  checks_month BIGINT,
  checks_year BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (
      (SELECT COUNT(*) FROM audits WHERE status = 'completed' AND completed_at >= CURRENT_DATE)
      + (SELECT COUNT(*) FROM free_audits WHERE created_at >= CURRENT_DATE)
    ) * 280 AS checks_today,
    (
      (SELECT COUNT(*) FROM audits WHERE status = 'completed' AND completed_at >= date_trunc('month', CURRENT_DATE))
      + (SELECT COUNT(*) FROM free_audits WHERE created_at >= date_trunc('month', CURRENT_DATE))
    ) * 280 AS checks_month,
    (
      (SELECT COUNT(*) FROM audits WHERE status = 'completed' AND completed_at >= date_trunc('year', CURRENT_DATE))
      + (SELECT COUNT(*) FROM free_audits WHERE created_at >= date_trunc('year', CURRENT_DATE))
    ) * 280 AS checks_year;
$$;

-- Aggregate counts only, no row-level data - safe for anonymous landing-page visitors.
GRANT EXECUTE ON FUNCTION get_audit_stats() TO anon, authenticated;
