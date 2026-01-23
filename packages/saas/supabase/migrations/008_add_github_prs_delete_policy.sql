-- Add DELETE policy for github_prs table
-- Allows users to delete github_prs for their own audits

CREATE POLICY "Users can delete own github_prs"
ON github_prs
FOR DELETE
USING (audit_id IN (
  SELECT a.id FROM audits a
  JOIN projects p ON a.project_id = p.id
  WHERE p.user_id = auth.uid()
));
