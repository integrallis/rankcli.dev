-- Public function to get audit statistics for social proof
-- Returns counts of audits and estimated checks (audits × 100)
-- No auth required - this is public social proof data

CREATE OR REPLACE FUNCTION public.get_audit_stats()
RETURNS TABLE (
  audits_today BIGINT,
  audits_month BIGINT,
  audits_year BIGINT,
  checks_today BIGINT,
  checks_month BIGINT,
  checks_year BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::BIGINT as audits_today,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP))::BIGINT as audits_month,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('year', CURRENT_TIMESTAMP))::BIGINT as audits_year,
    (COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) * 100)::BIGINT as checks_today,
    (COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP)) * 100)::BIGINT as checks_month,
    (COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('year', CURRENT_TIMESTAMP)) * 100)::BIGINT as checks_year
  FROM public.audits;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_audit_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_audit_stats() TO authenticated;

COMMENT ON FUNCTION public.get_audit_stats() IS 'Returns audit statistics for social proof display. Checks = audits × 100.';
