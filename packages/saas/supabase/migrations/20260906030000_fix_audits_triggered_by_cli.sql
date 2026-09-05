-- The CLI's own syncToCloud() (packages/cli/src/commands/audit.ts) has always
-- inserted triggered_by: 'cli', but this table's CHECK constraint never
-- allowed that value - only 'manual', 'scheduled', 'github_push', 'api'.
-- Every cloud sync from every CLI user has been silently failing the audit
-- insert (the project row gets created first and succeeds, so a project can
-- exist with zero audits, zero score, and an empty-looking dashboard, which
-- is exactly what was observed testing a real account end-to-end).
DO $$
DECLARE
  existing_constraint TEXT;
BEGIN
  SELECT conname INTO existing_constraint
  FROM pg_constraint
  WHERE conrelid = 'audits'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%triggered_by%';

  IF existing_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE audits DROP CONSTRAINT %I', existing_constraint);
  END IF;
END $$;

ALTER TABLE audits ADD CONSTRAINT audits_triggered_by_check
  CHECK (triggered_by IN ('manual', 'scheduled', 'github_push', 'api', 'cli'));
