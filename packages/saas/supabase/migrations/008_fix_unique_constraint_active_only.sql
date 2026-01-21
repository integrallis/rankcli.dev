-- Fix unique constraint to only apply to active projects
-- This allows users to reuse names from deleted projects

-- Drop the existing constraint
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_user_id_name_unique;

-- Create a partial unique index that only applies to active projects
CREATE UNIQUE INDEX projects_user_id_name_active_unique
ON projects (user_id, name)
WHERE is_active = true;
