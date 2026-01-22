-- Add additional columns to github_prs table for better tracking
ALTER TABLE github_prs
ADD COLUMN IF NOT EXISTS branch_name TEXT,
ADD COLUMN IF NOT EXISTS files_changed INTEGER DEFAULT 0;

-- Add insert policy for github_prs (for edge functions)
CREATE POLICY "Service role can insert github_prs"
  ON github_prs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add update policy for github_prs
CREATE POLICY "Service role can update github_prs"
  ON github_prs FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
