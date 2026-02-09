-- Add project_id to ai_visibility_checks for persistence
ALTER TABLE ai_visibility_checks 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Add index for fetching by project
CREATE INDEX IF NOT EXISTS idx_ai_visibility_checks_project 
ON ai_visibility_checks(project_id, created_at DESC);

-- Add provider details JSONB for richer data
ALTER TABLE ai_visibility_checks
ADD COLUMN IF NOT EXISTS providers JSONB;
