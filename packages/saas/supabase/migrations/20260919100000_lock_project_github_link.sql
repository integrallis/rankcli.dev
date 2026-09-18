-- projects.github_installation_id, github_repo_id and github_repo_url decide
-- which repository create-seo-pr opens pull requests against and which GitHub
-- webhook events start a project's audits. The projects UPDATE policy
-- (001_initial_schema.sql) lets an owner write every column, so any user could
-- point their project at another account's installation or repository.
--
-- From now on only the service role sets them: connect-github-repo, after it
-- has checked on GitHub that the user can write to the repository, and
-- github-webhook. Users can still clear them, which is how "Disconnect"
-- works. A trigger rather than a column REVOKE, because the table-level
-- UPDATE grant would override a column revoke, and clearing must keep working.

CREATE OR REPLACE FUNCTION public.guard_project_github_link()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only the API roles end users act as are restricted. service_role (edge
  -- functions) and direct database sessions (migrations) pass through.
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.github_installation_id IS NOT NULL
       OR NEW.github_repo_id IS NOT NULL
       OR NEW.github_repo_url IS NOT NULL THEN
      RAISE EXCEPTION 'GitHub repositories are connected through connect-github-repo'
        USING ERRCODE = '42501';
    END IF;
  ELSIF (NEW.github_installation_id IS DISTINCT FROM OLD.github_installation_id AND NEW.github_installation_id IS NOT NULL)
     OR (NEW.github_repo_id IS DISTINCT FROM OLD.github_repo_id AND NEW.github_repo_id IS NOT NULL)
     OR (NEW.github_repo_url IS DISTINCT FROM OLD.github_repo_url AND NEW.github_repo_url IS NOT NULL) THEN
    RAISE EXCEPTION 'GitHub repositories are connected through connect-github-repo'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_project_github_link ON projects;
CREATE TRIGGER guard_project_github_link
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.guard_project_github_link();

-- profiles.github_username is how github-webhook assigns a new App
-- installation to a RankCLI user. It comes from the GitHub identity at
-- sign-in (handle_new_user_profile), but "Users can update own profile" let
-- anyone rewrite it to another person's GitHub login and have that person's
-- installations recorded under their account. Users keep updating the rest of
-- their profile (AccountPage writes deleted_at).
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
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_github_username ON profiles;
CREATE TRIGGER guard_profile_github_username
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_github_username();
