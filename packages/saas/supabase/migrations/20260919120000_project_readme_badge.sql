-- README score badge (the badge edge function). A badge publishes a project's score to anyone
-- who can read the README, so it's opt-in per project: off until the owner turns it on.
-- Owners change it through the existing projects UPDATE policy.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS badge_enabled BOOLEAN NOT NULL DEFAULT false;
