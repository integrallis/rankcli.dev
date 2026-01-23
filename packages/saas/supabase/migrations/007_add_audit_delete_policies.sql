-- Add DELETE policies for audits and audit_issues tables
-- Allows users to delete their own audits and associated issues

-- Policy for deleting audits
CREATE POLICY "Users can delete own audits"
ON audits
FOR DELETE
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Policy for deleting audit issues
CREATE POLICY "Users can delete own audit_issues"
ON audit_issues
FOR DELETE
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
