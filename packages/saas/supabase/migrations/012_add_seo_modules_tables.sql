-- SEO Modules Tables
-- Tables for keyword research, content optimization, backlinks, and competitor intelligence

-- Keyword Research Results
CREATE TABLE IF NOT EXISTS keyword_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  seed_keyword TEXT NOT NULL,
  total_keywords INTEGER DEFAULT 0,
  golden_keywords JSONB DEFAULT '[]',
  quick_wins JSONB DEFAULT '[]',
  clusters JSONB DEFAULT '[]',
  content_briefs JSONB DEFAULT '[]',
  competitor_gaps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keyword_research_project ON keyword_research(project_id);

-- Content Optimizations
CREATE TABLE IF NOT EXISTS content_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  target_keyword TEXT NOT NULL,
  current_score INTEGER,
  target_score INTEGER,
  optimization_data JSONB,
  generated_content JSONB,
  applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_optimizations_project ON content_optimizations(project_id);

-- Backlink Opportunities
CREATE TABLE IF NOT EXISTS backlink_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  total_opportunities INTEGER DEFAULT 0,
  opportunities JSONB DEFAULT '[]',
  outreach_plan JSONB,
  templates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backlink_opportunities_project ON backlink_opportunities(project_id);

-- Competitor Analyses
CREATE TABLE IF NOT EXISTS competitor_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  your_domain TEXT NOT NULL,
  competitor_count INTEGER DEFAULT 0,
  competitors JSONB DEFAULT '[]',
  gaps JSONB DEFAULT '[]',
  keyword_opportunities JSONB DEFAULT '[]',
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitor_analyses_project ON competitor_analyses(project_id);

-- SERP Tracking (for keyword position monitoring)
CREATE TABLE IF NOT EXISTS serp_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  current_position INTEGER,
  previous_position INTEGER,
  best_position INTEGER,
  url_ranking TEXT,
  serp_features JSONB DEFAULT '[]',
  tracked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_serp_tracking_project ON serp_tracking(project_id);
CREATE INDEX idx_serp_tracking_keyword ON serp_tracking(keyword);

-- Local SEO Data
CREATE TABLE IF NOT EXISTS local_seo_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  business_name TEXT,
  address TEXT,
  phone TEXT,
  nap_consistency_score INTEGER,
  google_business_profile JSONB,
  citations JSONB DEFAULT '[]',
  reviews_summary JSONB,
  local_keywords JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_local_seo_project ON local_seo_data(project_id);

-- Tool Opportunities (Engineering as Marketing)
CREATE TABLE IF NOT EXISTS tool_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  product_description TEXT,
  industry TEXT,
  total_opportunities INTEGER DEFAULT 0,
  opportunities JSONB DEFAULT '[]',
  roadmap JSONB,
  estimated_traffic INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tool_opportunities_project ON tool_opportunities(project_id);

-- RLS Policies
ALTER TABLE keyword_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlink_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE serp_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_seo_data ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own keyword research"
  ON keyword_research FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own content optimizations"
  ON content_optimizations FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own backlink opportunities"
  ON backlink_opportunities FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own competitor analyses"
  ON competitor_analyses FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own serp tracking"
  ON serp_tracking FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own local seo data"
  ON local_seo_data FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Service role can insert all
CREATE POLICY "Service role can insert keyword research"
  ON keyword_research FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert content optimizations"
  ON content_optimizations FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert backlink opportunities"
  ON backlink_opportunities FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert competitor analyses"
  ON competitor_analyses FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert serp tracking"
  ON serp_tracking FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert local seo data"
  ON local_seo_data FOR INSERT
  TO service_role
  WITH CHECK (true);
