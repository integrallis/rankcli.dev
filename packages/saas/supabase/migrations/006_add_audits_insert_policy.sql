-- Add INSERT policy for audits table
-- Users should be able to create audits for their own projects

CREATE POLICY "Users can insert audits for own projects"
  ON audits FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Also add UPDATE policy so users can update their audit status
CREATE POLICY "Users can update own audits"
  ON audits FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Service role needs full access for Edge Functions
CREATE POLICY "Service role can manage audits"
  ON audits FOR ALL
  USING (auth.role() = 'service_role');

-- Also add INSERT policy for audit_issues (Edge Function needs to insert issues)
CREATE POLICY "Service role can manage audit_issues"
  ON audit_issues FOR ALL
  USING (auth.role() = 'service_role');
