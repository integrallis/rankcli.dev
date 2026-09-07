-- Free-audit lead re-engagement: track conversion + follow-up state
--
-- free_audits already had converted_to_signup/converted_at/subscribed_to_newsletter
-- columns (001_initial_schema.sql) but nothing ever set them - a lead who
-- signed up after running a free audit looked identical to one who never
-- came back. This backfills existing conversions, adds a trigger so future
-- signups are marked automatically (matched by email, the only identifier
-- free_audits has), and adds the two columns a follow-up sender needs:
-- followup_sent_at (so a lead only ever gets the one re-engagement email,
-- not one per cron run) and followup_opted_out (a real, working unsubscribe -
-- see the unsubscribe-audit-followup function).

ALTER TABLE free_audits
  ADD COLUMN IF NOT EXISTS followup_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS followup_opted_out BOOLEAN NOT NULL DEFAULT false;

-- One-time backfill: mark every free_audits row whose email already belongs
-- to a real account, so the very first follow-up run doesn't email people
-- who converted weeks ago.
UPDATE free_audits fa
SET converted_to_signup = true,
    converted_at = COALESCE(fa.converted_at, u.created_at)
FROM auth.users u
WHERE fa.email IS NOT NULL
  AND lower(fa.email) = lower(u.email)
  AND fa.converted_to_signup = false;

-- Keep it current: every future signup checks for a matching free_audits
-- lead and marks it converted. Runs AFTER INSERT ON auth.users, same
-- pattern as notify_slack_new_signup (20260906040000_add_signup_slack_notify.sql) -
-- wrapped in an exception handler so a matching failure can never block
-- signup itself.
CREATE OR REPLACE FUNCTION mark_free_audit_converted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE free_audits
  SET converted_to_signup = true,
      converted_at = NOW()
  WHERE email IS NOT NULL
    AND lower(email) = lower(NEW.email)
    AND converted_to_signup = false;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_mark_free_audit_converted ON auth.users;
CREATE TRIGGER on_auth_user_created_mark_free_audit_converted
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION mark_free_audit_converted();

-- No anon UPDATE policy here on purpose - a broad "anyone can update their
-- own row by email" RLS policy would let an anonymous client rewrite any
-- other column too (email, score, url...), not just opt out. The
-- unsubscribe-audit-followup edge function handles opt-out instead, using
-- the service role key and writing only followup_opted_out.
