-- Keyword Research Results table (for AI-powered keyword analysis history)
CREATE TABLE IF NOT EXISTS keyword_research_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    site_summary JSONB NOT NULL,
    uncertainty JSONB NOT NULL,
    recommendations JSONB DEFAULT '[]'::jsonb,
    free_tool_ideas JSONB DEFAULT '[]'::jsonb,
    wizard_responses JSONB,
    confidence REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_keyword_research_project ON keyword_research_results(project_id);
CREATE INDEX IF NOT EXISTS idx_keyword_research_user ON keyword_research_results(user_id);
CREATE INDEX IF NOT EXISTS idx_keyword_research_created ON keyword_research_results(created_at DESC);

-- RLS policies
ALTER TABLE keyword_research_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own keyword research results" ON keyword_research_results;
DROP POLICY IF EXISTS "Users can insert keyword research results" ON keyword_research_results;
DROP POLICY IF EXISTS "Service role full access to keyword research" ON keyword_research_results;

-- Users can view their own keyword research results
CREATE POLICY "Users can view own keyword research results"
    ON keyword_research_results FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert keyword research results for their projects
CREATE POLICY "Users can insert keyword research results"
    ON keyword_research_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can manage all results (for edge functions)
CREATE POLICY "Service role full access to keyword research"
    ON keyword_research_results FOR ALL
    USING (auth.role() = 'service_role');
