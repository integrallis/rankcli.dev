-- Where an account came from (docs/OUTCOME_PLAN_2026-11.md, item 4.6): the UTM parameters,
-- landing path and referrer of the visit that led to signup, captured by the site on first
-- load and written once to the profile after the first sign-in. Lets the outcome report
-- count GitHub App installs by source, so an ad is judged on installs and not on clicks.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_source JSONB;

COMMENT ON COLUMN profiles.signup_source IS
  'utm_source, utm_medium, utm_campaign, landing_path, referrer, captured_at of the visit that led to signup; written once by the client, read in aggregate by the outcome report';

-- Write-once: a visitor's own first-touch data may be recorded, never rewritten, and
-- github_username stays locked as before.
CREATE OR REPLACE FUNCTION public.guard_profile_github_username()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon')
     AND NEW.github_username IS DISTINCT FROM OLD.github_username THEN
    RAISE EXCEPTION 'github_username comes from your GitHub sign-in and cannot be edited'
      USING ERRCODE = '42501';
  END IF;
  IF current_user IN ('authenticated', 'anon')
     AND OLD.signup_source IS NOT NULL
     AND NEW.signup_source IS DISTINCT FROM OLD.signup_source THEN
    RAISE EXCEPTION 'signup_source is recorded once' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
