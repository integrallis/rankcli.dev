-- Site limit on projects.
--
-- Nothing enforced subscription_plans.sites_limit: the dashboard hides its "Add project"
-- button at the limit, but the projects INSERT policy only checks ownership, so any client
-- could insert past it. This trigger uses the user's effective plan (effective_entitlement,
-- 20260919105000), so annual, founding and lifetime-deal customers get their real limit.
--
-- Only a row becoming an active site counts: a new project, or a soft-deleted one
-- (deleting a project sets is_active = false) being reactivated or moved to another user.
-- Existing projects over the limit (e.g. after a downgrade) are left alone. It runs for
-- the service role too, so sync-audit's project creation is bound by it as well.

CREATE OR REPLACE FUNCTION public.enforce_project_site_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ent RECORD;
  v_active INTEGER;
BEGIN
  IF NOT COALESCE(NEW.is_active, TRUE) THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND COALESCE(OLD.is_active, TRUE) AND OLD.user_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Without this, two concurrent inserts would both count limit - 1 and both pass.
  PERFORM pg_advisory_xact_lock(hashtextextended('projects_site_limit:' || NEW.user_id::TEXT, 0));

  SELECT * INTO v_ent FROM public.effective_entitlement(NEW.user_id);

  SELECT COUNT(*) INTO v_active
  FROM public.projects
  WHERE user_id = NEW.user_id
    AND is_active
    AND id IS DISTINCT FROM NEW.id;

  IF v_active >= v_ent.sites_limit THEN
    -- The dashboard shows this message as-is; the hint lets clients recognise it.
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = format(
        'Site limit reached: your %s plan includes %s active site%s. Remove a site or upgrade your plan to add another.',
        CASE WHEN v_ent.source = 'lifetime' THEN 'lifetime ' || initcap(v_ent.tier) ELSE initcap(v_ent.tier) END,
        v_ent.sites_limit,
        CASE WHEN v_ent.sites_limit = 1 THEN '' ELSE 's' END
      ),
      HINT = 'site_limit_reached';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_project_site_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_project_site_limit ON public.projects;
CREATE TRIGGER enforce_project_site_limit
  BEFORE INSERT OR UPDATE OF is_active, user_id ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_project_site_limit();
