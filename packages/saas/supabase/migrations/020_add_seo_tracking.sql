-- =============================================================================
-- SEO Metrics Tracking
-- =============================================================================
-- Stores periodic GSC/Bing metrics, audit history, and change attribution
-- for measuring SEO impact over time.

-- -----------------------------------------------------------------------------
-- Weekly/Daily Metrics Snapshots (from GSC, Bing, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seo_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),

  -- Source
  source TEXT NOT NULL CHECK (source IN ('gsc', 'bing', 'crux', 'dataforseo')),

  -- Core metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0, -- 0.0000 to 1.0000
  avg_position DECIMAL(6,2) DEFAULT 0,

  -- Indexed pages (GSC only)
  indexed_pages INTEGER,
  crawl_errors INTEGER,

  -- Core Web Vitals (CrUX only)
  lcp_p75 DECIMAL(8,2), -- Largest Contentful Paint (ms)
  fid_p75 DECIMAL(8,2), -- First Input Delay (ms)
  cls_p75 DECIMAL(6,4), -- Cumulative Layout Shift
  inp_p75 DECIMAL(8,2), -- Interaction to Next Paint (ms)
  cwv_pass_rate DECIMAL(5,2), -- % of origins passing all CWV

  -- Top queries snapshot (for trend analysis)
  top_queries JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"query": "...", "impressions": N, "clicks": N, "position": N}]

  -- Top pages snapshot
  top_pages JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"page": "...", "impressions": N, "clicks": N, "position": N}]

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per project/period/source
  UNIQUE(project_id, period_start, period_type, source)
);

-- Index for efficient querying
CREATE INDEX idx_seo_metrics_project_period ON seo_metrics(project_id, period_start DESC);
CREATE INDEX idx_seo_metrics_source ON seo_metrics(source, period_start DESC);

-- -----------------------------------------------------------------------------
-- Keyword Position Tracking
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS keyword_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Keyword info
  keyword TEXT NOT NULL,
  search_engine TEXT NOT NULL DEFAULT 'google' CHECK (search_engine IN ('google', 'bing', 'yahoo')),
  device TEXT NOT NULL DEFAULT 'desktop' CHECK (device IN ('desktop', 'mobile', 'tablet')),
  location TEXT DEFAULT 'us', -- Country/region code

  -- Current ranking
  current_position INTEGER, -- NULL if not ranking
  previous_position INTEGER,
  position_change INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN previous_position IS NULL THEN NULL
      WHEN current_position IS NULL THEN NULL
      ELSE previous_position - current_position -- Positive = improved
    END
  ) STORED,

  -- Best/worst tracking
  best_position INTEGER,
  best_position_date DATE,

  -- Metrics from SERP
  search_volume INTEGER,
  keyword_difficulty INTEGER,

  -- URL currently ranking
  ranking_url TEXT,

  -- SERP features present
  serp_features TEXT[] DEFAULT '{}', -- ['featured_snippet', 'people_also_ask', 'ai_overview', etc.]

  -- Timestamps
  first_tracked_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, keyword, search_engine, device, location)
);

CREATE INDEX idx_keyword_rankings_project ON keyword_rankings(project_id);
CREATE INDEX idx_keyword_rankings_keyword ON keyword_rankings(keyword);

-- -----------------------------------------------------------------------------
-- Keyword Ranking History (for trend charts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS keyword_ranking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_ranking_id UUID NOT NULL REFERENCES keyword_rankings(id) ON DELETE CASCADE,

  position INTEGER,
  ranking_url TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keyword_history_ranking ON keyword_ranking_history(keyword_ranking_id, checked_at DESC);

-- -----------------------------------------------------------------------------
-- Audit History (for regression detection)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Scores
  overall_score INTEGER NOT NULL,
  category_scores JSONB DEFAULT '{}'::jsonb,
  -- Format: {"technical": 85, "content": 72, "performance": 90, ...}

  -- Issue counts by severity
  critical_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  info_count INTEGER DEFAULT 0,

  -- Issue hashes for change detection
  issue_hashes TEXT[] DEFAULT '{}', -- Hash of each issue for comparison

  -- Comparison to previous
  score_change INTEGER, -- Compared to previous audit
  new_issues_count INTEGER,
  fixed_issues_count INTEGER,
  regression_count INTEGER, -- Issues that came back

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_snapshots_project ON audit_snapshots(project_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- SEO Changes (for attribution)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seo_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Change type
  change_type TEXT NOT NULL CHECK (change_type IN (
    'pr_merged',      -- GitHub PR was merged
    'audit_fix',      -- Fix applied via RankCLI
    'manual',         -- User-reported change
    'deploy',         -- Deployment detected
    'content_update', -- Content was modified
    'technical_fix'   -- Technical SEO fix
  )),

  -- Details
  title TEXT NOT NULL,
  description TEXT,

  -- Links
  pr_url TEXT,
  commit_sha TEXT,

  -- Related issues that were fixed
  issues_fixed UUID[] DEFAULT '{}', -- References to audit_issues

  -- Impact tracking (filled in later)
  impact_measured_at TIMESTAMPTZ,
  impact_metrics JSONB,
  -- Format: {"impressions_change": 15, "position_change": -2.3, "ctr_change": 0.02}

  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seo_changes_project ON seo_changes(project_id, occurred_at DESC);

-- -----------------------------------------------------------------------------
-- OAuth Connections (GSC, Bing, GA4)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL = user-level

  provider TEXT NOT NULL CHECK (provider IN ('google', 'bing', 'github')),

  -- OAuth tokens (encrypted)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Scopes granted
  scopes TEXT[] DEFAULT '{}',

  -- Provider-specific IDs
  provider_account_id TEXT, -- e.g., Google account ID

  -- GSC/Bing specific
  site_url TEXT, -- The verified site URL in GSC/Bing
  verification_status TEXT CHECK (verification_status IN ('verified', 'pending', 'failed')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, provider, site_url)
);

CREATE INDEX idx_oauth_connections_user ON oauth_connections(user_id);
CREATE INDEX idx_oauth_connections_project ON oauth_connections(project_id);

-- -----------------------------------------------------------------------------
-- Sync Jobs (for tracking sync status)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  job_type TEXT NOT NULL CHECK (job_type IN ('gsc_sync', 'bing_sync', 'crux_sync', 'rank_check')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  -- Progress
  progress INTEGER DEFAULT 0,
  total_items INTEGER,

  -- Results
  metrics_synced INTEGER DEFAULT 0,
  keywords_checked INTEGER DEFAULT 0,
  error_message TEXT,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_project ON sync_jobs(project_id, created_at DESC);
CREATE INDEX idx_sync_jobs_next_run ON sync_jobs(next_run_at) WHERE status = 'pending';

-- -----------------------------------------------------------------------------
-- RLS Policies
-- -----------------------------------------------------------------------------
ALTER TABLE seo_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_ranking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own project's data
CREATE POLICY "Users can view own seo_metrics"
ON seo_metrics FOR SELECT
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own keyword_rankings"
ON keyword_rankings FOR SELECT
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own keyword_ranking_history"
ON keyword_ranking_history FOR SELECT
USING (keyword_ranking_id IN (
  SELECT id FROM keyword_rankings WHERE project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can view own audit_snapshots"
ON audit_snapshots FOR SELECT
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own seo_changes"
ON seo_changes FOR SELECT
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own seo_changes"
ON seo_changes FOR ALL
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own oauth_connections"
ON oauth_connections FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own oauth_connections"
ON oauth_connections FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can view own sync_jobs"
ON sync_jobs FOR SELECT
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- Functions
-- -----------------------------------------------------------------------------

-- Get metrics trend for a project
CREATE OR REPLACE FUNCTION get_metrics_trend(
  p_project_id UUID,
  p_source TEXT DEFAULT 'gsc',
  p_period_type TEXT DEFAULT 'weekly',
  p_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
  period_start DATE,
  impressions INTEGER,
  clicks INTEGER,
  ctr DECIMAL,
  avg_position DECIMAL,
  impressions_change INTEGER,
  clicks_change INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH metrics_with_lag AS (
    SELECT
      m.period_start,
      m.impressions,
      m.clicks,
      m.ctr,
      m.avg_position,
      LAG(m.impressions) OVER (ORDER BY m.period_start) as prev_impressions,
      LAG(m.clicks) OVER (ORDER BY m.period_start) as prev_clicks
    FROM seo_metrics m
    WHERE m.project_id = p_project_id
      AND m.source = p_source
      AND m.period_type = p_period_type
    ORDER BY m.period_start DESC
    LIMIT p_limit
  )
  SELECT
    mwl.period_start,
    mwl.impressions,
    mwl.clicks,
    mwl.ctr,
    mwl.avg_position,
    (mwl.impressions - COALESCE(mwl.prev_impressions, mwl.impressions))::INTEGER,
    (mwl.clicks - COALESCE(mwl.prev_clicks, mwl.clicks))::INTEGER
  FROM metrics_with_lag mwl
  ORDER BY mwl.period_start ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get audit score trend
CREATE OR REPLACE FUNCTION get_audit_trend(
  p_project_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  audit_id UUID,
  overall_score INTEGER,
  score_change INTEGER,
  critical_count INTEGER,
  warning_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.audit_id,
    s.overall_score,
    s.score_change,
    s.critical_count,
    s.warning_count,
    s.created_at
  FROM audit_snapshots s
  WHERE s.project_id = p_project_id
  ORDER BY s.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Correlate changes with metric improvements
CREATE OR REPLACE FUNCTION correlate_seo_changes(
  p_project_id UUID,
  p_days_after INTEGER DEFAULT 28
)
RETURNS TABLE (
  change_id UUID,
  change_title TEXT,
  occurred_at TIMESTAMPTZ,
  impressions_before INTEGER,
  impressions_after INTEGER,
  impressions_change_pct DECIMAL,
  position_before DECIMAL,
  position_after DECIMAL,
  position_improvement DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH change_windows AS (
    SELECT
      c.id as change_id,
      c.title as change_title,
      c.occurred_at,
      c.occurred_at::DATE as change_date,
      (c.occurred_at + (p_days_after || ' days')::INTERVAL)::DATE as measure_date
    FROM seo_changes c
    WHERE c.project_id = p_project_id
      AND c.occurred_at > NOW() - INTERVAL '6 months'
  ),
  metrics_before AS (
    SELECT DISTINCT ON (cw.change_id)
      cw.change_id,
      m.impressions,
      m.avg_position
    FROM change_windows cw
    JOIN seo_metrics m ON m.project_id = p_project_id
      AND m.period_start < cw.change_date
      AND m.source = 'gsc'
    ORDER BY cw.change_id, m.period_start DESC
  ),
  metrics_after AS (
    SELECT DISTINCT ON (cw.change_id)
      cw.change_id,
      m.impressions,
      m.avg_position
    FROM change_windows cw
    JOIN seo_metrics m ON m.project_id = p_project_id
      AND m.period_start >= cw.measure_date
      AND m.source = 'gsc'
    ORDER BY cw.change_id, m.period_start ASC
  )
  SELECT
    cw.change_id,
    cw.change_title,
    cw.occurred_at,
    mb.impressions as impressions_before,
    ma.impressions as impressions_after,
    CASE WHEN mb.impressions > 0
      THEN ROUND(((ma.impressions - mb.impressions)::DECIMAL / mb.impressions) * 100, 1)
      ELSE 0
    END as impressions_change_pct,
    mb.avg_position as position_before,
    ma.avg_position as position_after,
    ROUND(mb.avg_position - ma.avg_position, 1) as position_improvement
  FROM change_windows cw
  LEFT JOIN metrics_before mb ON mb.change_id = cw.change_id
  LEFT JOIN metrics_after ma ON ma.change_id = cw.change_id
  WHERE mb.impressions IS NOT NULL AND ma.impressions IS NOT NULL
  ORDER BY cw.occurred_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
