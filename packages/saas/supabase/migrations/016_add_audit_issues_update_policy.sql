-- Add UPDATE policy for audit_issues so users can update status (ignore, wont_fix, etc.)
CREATE POLICY "Users can update own audit_issues"
ON audit_issues FOR UPDATE
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
