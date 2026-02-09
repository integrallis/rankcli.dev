-- Fix RLS policies for keyword_research_results
-- This migration ensures correct project-ownership-based access

-- First, ensure the table exists (in case previous migration was partial)
CREATE TABLE IF NOT EXISTS keyword_research_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    user_id UUID,
    url TEXT NOT NULL,
    site_summary JSONB NOT NULL,
    uncertainty JSONB NOT NULL,
    recommendations JSONB DEFAULT '[]'::jsonb,
    free_tool_ideas JSONB DEFAULT '[]'::jsonb,
    wizard_responses JSONB,
    confidence REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add FK constraint if missing (might fail if already exists, which is fine)
DO $$
BEGIN
    ALTER TABLE keyword_research_results 
    ADD CONSTRAINT fk_keyword_research_project 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'FK constraint already exists, skipping';
END $$;

-- Ensure RLS is enabled
ALTER TABLE keyword_research_results ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view own keyword research results" ON keyword_research_results;
DROP POLICY IF EXISTS "Users can insert keyword research results" ON keyword_research_results;
DROP POLICY IF EXISTS "Service role full access to keyword research" ON keyword_research_results;
DROP POLICY IF EXISTS "Users can view keyword research for own projects" ON keyword_research_results;
DROP POLICY IF EXISTS "Users can insert keyword research for own projects" ON keyword_research_results;

-- Create the correct policies based on PROJECT OWNERSHIP
-- This allows users to access results for projects where they are the owner

-- SELECT: Users can view keyword research results for projects they own
CREATE POLICY "Users can view keyword research for own projects"
    ON keyword_research_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = keyword_research_results.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- INSERT: Users can insert keyword research results for projects they own
-- (Note: Edge functions use service role which bypasses RLS, but this covers direct inserts)
CREATE POLICY "Users can insert keyword research for own projects"
    ON keyword_research_results FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = keyword_research_results.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- DELETE: Users can delete keyword research results for projects they own
CREATE POLICY "Users can delete keyword research for own projects"
    ON keyword_research_results FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = keyword_research_results.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Verify policies were created
DO $$
DECLARE
    policy_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'keyword_research_results';
    
    RAISE NOTICE 'Created % policies for keyword_research_results', policy_count;
END $$;
