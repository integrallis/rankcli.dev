-- Add unique constraint on (user_id, name) for projects table
-- This ensures each user can only have one project with a given name

-- First, check for and handle any existing duplicates
-- This will add a suffix to duplicate names to make them unique
DO $$
DECLARE
  r RECORD;
  suffix_num INTEGER;
BEGIN
  -- Find duplicates
  FOR r IN
    SELECT user_id, name, COUNT(*) as cnt
    FROM projects
    GROUP BY user_id, name
    HAVING COUNT(*) > 1
  LOOP
    -- Update all but the first (oldest) one with a suffix
    suffix_num := 1;
    FOR r IN
      SELECT id FROM projects
      WHERE user_id = r.user_id AND name = r.name
      ORDER BY created_at ASC
      OFFSET 1
    LOOP
      UPDATE projects
      SET name = name || ' (' || suffix_num || ')'
      WHERE id = r.id;
      suffix_num := suffix_num + 1;
    END LOOP;
  END LOOP;
END $$;

-- Now add the unique constraint
ALTER TABLE projects
ADD CONSTRAINT projects_user_id_name_unique UNIQUE (user_id, name);
