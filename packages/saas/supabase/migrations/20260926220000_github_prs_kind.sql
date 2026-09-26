-- What kind of PR RankCLI opened.
--
-- 'auto_fix' is the AI-generated SEO fix PR: it costs the customer's AI tokens, and it is
-- what the quotas are about (limits.autoFixPrsPerMonth in _shared/tier.ts, the per-report
-- cap and the one-open-PR cap in create-seo-pr).
--
-- 'ci_setup' is the one-off PR that adds .github/workflows/seo.yml from a template. It
-- involves no AI and no plan: getting SEO into CI is the on-ramp, and charging PR quota
-- for it would tax the thing we give away. Separating them by kind is what lets every
-- quota query say "auto_fix only" instead of accidentally counting the on-ramp.
--
-- Existing rows are all auto-fix PRs, which is why that is the default.
ALTER TABLE github_prs
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'auto_fix';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'github_prs_kind_check'
  ) THEN
    ALTER TABLE github_prs
      ADD CONSTRAINT github_prs_kind_check CHECK (kind IN ('auto_fix', 'ci_setup'));
  END IF;
END $$;

-- Every quota read is "this project's (or user's) auto_fix PRs", and the open-PR cap adds
-- pr_state; the monthly count adds created_at.
CREATE INDEX IF NOT EXISTS github_prs_project_kind_state_idx
  ON github_prs (project_id, kind, pr_state);
CREATE INDEX IF NOT EXISTS github_prs_kind_created_idx
  ON github_prs (kind, created_at);
