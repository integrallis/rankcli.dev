-- public.profiles never existed, even though two things already depend on it:
-- AccountPage.tsx's "Delete account" flow writes profiles.deleted_at (so
-- self-service account deletion has been failing for every user), and
-- github-webhook looks up profiles.github_username to auto-link a GitHub App
-- installation to the user who installed it (so that link has always failed
-- too, silently falling through to the pending-installation path instead).
--
-- auth.users itself can't be written to by a regular authenticated user via
-- RLS, which is exactly why this shadow table pattern exists - one row per
-- auth.users row, kept in sync via a trigger.
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  github_username TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_github_username ON profiles(github_username) WHERE github_username IS NOT NULL;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Keep profiles in sync with auth.users. GitHub OAuth sign-ins populate
-- raw_user_meta_data.user_name (GitHub's own field name for this via
-- Supabase's provider mapping) - pull it in here so github-webhook's lookup
-- actually has something to match against, instead of a column that's
-- always null.
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, github_username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'user_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_profile();

-- Backfill existing users, who predate this trigger.
INSERT INTO public.profiles (id, github_username)
SELECT id, raw_user_meta_data->>'user_name'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
