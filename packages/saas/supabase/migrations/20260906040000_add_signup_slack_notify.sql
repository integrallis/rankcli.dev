-- Internal ops Slack notification on new signup. Fires independently of
-- handle_new_user_profile (20260906020000_add_profiles.sql) - a separate
-- AFTER INSERT trigger on auth.users so this can never affect profile
-- creation if it errors, and vice versa.
--
-- The shared secret used to authenticate to the notify-slack edge
-- function is read from Supabase Vault at call time (vault.decrypted_secrets),
-- not hardcoded here - see the one-off workflow that seeds
-- 'internal_webhook_secret' into the vault with the same value as the
-- INTERNAL_WEBHOOK_SECRET edge function secret.

-- pg_net creates its own "net" schema by default (net.http_post etc.) -
-- this matches Supabase's own documented Database Webhooks pattern.
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_slack_new_signup()
RETURNS TRIGGER AS $$
DECLARE
  webhook_secret TEXT;
BEGIN
  SELECT decrypted_secret INTO webhook_secret
  FROM vault.decrypted_secrets
  WHERE name = 'internal_webhook_secret'
  LIMIT 1;

  IF webhook_secret IS NULL THEN
    -- Not seeded yet - skip rather than block signup.
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := 'https://plfhfykcoytxkjxnjnez.supabase.co/functions/v1/notify-slack',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', webhook_secret
    ),
    body := jsonb_build_object('event', 'signup', 'email', NEW.email)
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never let a notification failure block signup.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, net, vault;

CREATE TRIGGER on_auth_user_created_notify_slack
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.notify_slack_new_signup();
