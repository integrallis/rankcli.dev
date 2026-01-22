-- AI-Powered Keyword Research Results
-- Stores results from the AI keyword engine with uncertainty quantification

CREATE TABLE IF NOT EXISTS keyword_research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  url TEXT NOT NULL,

  -- Site analysis
  site_summary JSONB NOT NULL DEFAULT '{}',

  -- Uncertainty assessment
  uncertainty JSONB NOT NULL DEFAULT '{}',
  confidence DECIMAL(3,2) DEFAULT 0.0,

  -- Recommendations
  recommendations JSONB DEFAULT '[]',
  free_tool_ideas JSONB DEFAULT '[]',

  -- Wizard responses (for improving accuracy)
  wizard_responses JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keyword_research_results_project ON keyword_research_results(project_id);
CREATE INDEX idx_keyword_research_results_user ON keyword_research_results(user_id);
CREATE INDEX idx_keyword_research_results_confidence ON keyword_research_results(confidence);

-- RLS
ALTER TABLE keyword_research_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own research results
CREATE POLICY "Users can view own keyword research results"
  ON keyword_research_results FOR SELECT
  USING (
    user_id = auth.uid() OR
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Service role can insert
CREATE POLICY "Service role can insert keyword research results"
  ON keyword_research_results FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS for tool_opportunities (was missing)
ALTER TABLE tool_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tool opportunities"
  ON tool_opportunities FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert tool opportunities"
  ON tool_opportunities FOR INSERT
  TO service_role
  WITH CHECK (true);
