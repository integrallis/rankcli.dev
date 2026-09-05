-- github-webhook's handleInstallation() writes a "pending" row (user_id: null,
-- status: 'pending') whenever a GitHub App install's sender has no matching
-- profiles.github_username - which is always, since nothing in the codebase
-- ever sets that column. The original schema made user_id NOT NULL and only
-- allowed status IN ('active','suspended','deleted'), so every such write has
-- been silently rejected (the webhook never checks the Supabase error).

ALTER TABLE github_installations ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE github_installations DROP CONSTRAINT IF EXISTS github_installations_status_check;
ALTER TABLE github_installations ADD CONSTRAINT github_installations_status_check
  CHECK (status IN ('active', 'pending', 'suspended', 'deleted'));
