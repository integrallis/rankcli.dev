-- 20260906040000_add_signup_slack_notify.sql hardcoded the wrong project
-- ref in the notify-slack URL (plfhfykcoytxkjxnjnez, stale/wrong - see
-- config.toml's project_id, itself apparently stale). The real, live
-- project is bspljbxwbjiqueeyzyat, confirmed against the SUPABASE_PROJECT_REF
-- GitHub variable and the URL actually baked into the deployed frontend
-- bundle. Corrects the URL; the trigger itself is unchanged since it
-- references this function by name.

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
    url := 'https://bspljbxwbjiqueeyzyat.supabase.co/functions/v1/notify-slack',
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
