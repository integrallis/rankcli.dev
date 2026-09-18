-- Functions from 020 and 20250225 ran as SECURITY DEFINER (bypassing RLS),
-- took a project id from the caller, never checked who owned it, and had no
-- search_path. Supabase grants EXECUTE on public functions to anon and
-- authenticated by default, so with the public anon key anyone could read any
-- project's Search Console metrics and audit history, or move a project's
-- audit schedule. Revoking from PUBLIC alone doesn't undo Supabase's explicit
-- grants, hence anon and authenticated are named too.
--
-- Each statement is guarded with to_regprocedure so a signature that was
-- dropped by hand doesn't fail the whole deploy.
DO $$
DECLARE
  fn TEXT;
BEGIN
  -- Read-only trend helpers. Nothing calls them yet. They become SECURITY
  -- INVOKER, so the owner-only SELECT policies on seo_metrics,
  -- audit_snapshots and seo_changes decide what a signed-in user sees; the
  -- service role still sees everything.
  FOREACH fn IN ARRAY ARRAY[
    'public.get_metrics_trend(uuid, text, text, integer)',
    'public.get_audit_trend(uuid, integer)',
    'public.correlate_seo_changes(uuid, integer)'
  ] LOOP
    IF to_regprocedure(fn) IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION %s SECURITY INVOKER SET search_path = public', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', fn);
    END IF;
  END LOOP;

  -- Server-side only. The audit worker calls check_audit_schedule with the
  -- service role key; 20250227 added a UUID overload beside 20250225's TEXT
  -- one, so both are locked. Nothing calls update_audit_schedule, which
  -- updates any project by id. 029's cleanup_old_api_requests deletes
  -- api_requests rows as the table owner.
  FOREACH fn IN ARRAY ARRAY[
    'public.check_audit_schedule(uuid, uuid, text)',
    'public.check_audit_schedule(uuid, uuid, uuid)',
    'public.update_audit_schedule(uuid, text)',
    'public.cleanup_old_api_requests()'
  ] LOOP
    IF to_regprocedure(fn) IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn);
    END IF;
  END LOOP;
END;
$$;
