-- Backing function for the /rankcli Slack slash command's "users" and
-- "active" subcommands.
--
-- auth.users/auth.sessions are never exposed to PostgREST directly (schema
-- exposure is controlled by Supabase's API config, not by RLS or which key
-- you use - the service role key doesn't bypass this the way it bypasses
-- RLS). A SECURITY DEFINER function in the public schema is the standard
-- way around that, same pattern already used for get_launch_offer_availability
-- (20260903120000_add_founding_member_pricing.sql). Unlike that function,
-- this one is deliberately NOT public - it returns real user counts, so
-- only the service role (i.e. only the slack-commands edge function) can
-- call it.
--
-- last_sign_in_at (a column Supabase's auth.users already maintains) is
-- used as the "active" signal rather than querying auth.sessions directly -
-- a session table row doesn't cleanly mean "logged in right now" once
-- refresh-token rotation is considered, whereas "signed in within the last
-- N hours" is both simpler and a more honest answer to "how many people
-- are actually using this."

CREATE OR REPLACE FUNCTION public.rankcli_admin_user_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'new_today', (SELECT COUNT(*) FROM auth.users WHERE created_at >= date_trunc('day', NOW())),
    'new_7d', (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '7 days'),
    'active_24h', (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at >= NOW() - INTERVAL '24 hours'),
    'active_7d', (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at >= NOW() - INTERVAL '7 days')
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

REVOKE EXECUTE ON FUNCTION public.rankcli_admin_user_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rankcli_admin_user_stats() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rankcli_admin_user_stats() TO service_role;
