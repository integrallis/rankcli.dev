-- SEO Autopilot SaaS Database Schema
-- Initial migration

-- =====================================================
-- SUBSCRIPTION PLANS
-- =====================================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT UNIQUE NOT NULL, -- 'solo', 'pro', 'agency'
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  billing_period TEXT DEFAULT 'month' CHECK (billing_period IN ('month', 'year', 'lifetime')),

  -- Limits
  sites_limit INTEGER NOT NULL DEFAULT 1,
  team_members_limit INTEGER DEFAULT 1,
  audits_per_month INTEGER, -- NULL = unlimited
  api_requests_per_day INTEGER, -- NULL = unlimited
  keywords_limit INTEGER DEFAULT 10,
  historical_days INTEGER DEFAULT 30,

  -- Features (JSONB for flexibility)
  features JSONB NOT NULL DEFAULT '{
    "github_connect": false,
    "github_auto_fix": false,
    "slack_alerts": false,
    "api_access": false,
    "competitor_tracking": 0,
    "white_label": false,
    "priority_support": false
  }'::jsonb,

  stripe_price_id TEXT,
  stripe_product_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER SUBSCRIPTIONS
-- =====================================================

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),

  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,

  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- =====================================================
-- PROJECTS (Sites being monitored)
-- =====================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  url TEXT NOT NULL,

  -- GitHub integration
  github_repo_url TEXT,
  github_repo_id INTEGER,
  github_installation_id INTEGER,
  github_default_branch TEXT DEFAULT 'main',

  -- Framework detection
  framework TEXT,
  config JSONB DEFAULT '{}'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_audit_at TIMESTAMPTZ,
  last_audit_score INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDITS
-- =====================================================

CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Trigger info
  triggered_by TEXT NOT NULL DEFAULT 'manual'
    CHECK (triggered_by IN ('manual', 'scheduled', 'github_push', 'api')),
  triggered_by_user UUID REFERENCES auth.users(id),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  -- Results
  score INTEGER CHECK (score >= 0 AND score <= 100),
  pages_crawled INTEGER DEFAULT 0,
  issues_found INTEGER DEFAULT 0,

  -- Detailed results (JSONB)
  health_scores JSONB,
  summary JSONB,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT ISSUES
-- =====================================================

CREATE TABLE audit_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Issue details
  code TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'notice')),
  category TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT,
  impact TEXT,
  how_to_fix TEXT,

  -- Affected pages
  affected_urls TEXT[],
  details JSONB,

  -- Fix status
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open', 'fixing', 'fixed', 'ignored', 'wont_fix')),
  fixed_at TIMESTAMPTZ,
  fixed_by UUID REFERENCES auth.users(id),
  fix_pr_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT PAGES (Crawled pages)
-- =====================================================

CREATE TABLE audit_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,

  url TEXT NOT NULL,
  status_code INTEGER,

  title TEXT,
  description TEXT,
  h1 TEXT[],
  canonical TEXT,

  word_count INTEGER,
  load_time_ms INTEGER,

  issue_codes TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- KEYWORDS
-- =====================================================

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  keyword TEXT NOT NULL,
  search_volume INTEGER,
  difficulty INTEGER CHECK (difficulty >= 0 AND difficulty <= 100),

  current_position INTEGER,
  previous_position INTEGER,
  best_position INTEGER,

  target_url TEXT,

  last_checked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, keyword)
);

-- =====================================================
-- KEYWORD RANKINGS HISTORY
-- =====================================================

CREATE TABLE keyword_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,

  position INTEGER,
  url TEXT,

  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keyword_rankings_time ON keyword_rankings(keyword_id, recorded_at DESC);

-- =====================================================
-- GITHUB INSTALLATIONS
-- =====================================================

CREATE TABLE github_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  installation_id INTEGER NOT NULL UNIQUE,
  account_login TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('User', 'Organization')),

  permissions JSONB DEFAULT '{}'::jsonb,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),

  installed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- GITHUB PRS
-- =====================================================

CREATE TABLE github_prs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES audits(id),

  pr_number INTEGER NOT NULL,
  pr_url TEXT NOT NULL,
  pr_title TEXT NOT NULL,
  pr_state TEXT DEFAULT 'open' CHECK (pr_state IN ('open', 'closed', 'merged')),

  issue_ids UUID[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  merged_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- =====================================================
-- API KEYS
-- =====================================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL DEFAULT 'Default',
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,

  scopes TEXT[] DEFAULT ARRAY['read', 'audit'],

  rate_limit_per_minute INTEGER DEFAULT 60,

  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FREE AUDITS (Lead capture)
-- =====================================================

CREATE TABLE free_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  url TEXT NOT NULL,
  domain TEXT NOT NULL,

  score INTEGER,
  issues_summary JSONB,
  top_issues JSONB,

  email TEXT,
  subscribed_to_newsletter BOOLEAN DEFAULT false,

  converted_to_signup BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,

  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_free_audits_ip_time ON free_audits(ip_hash, created_at DESC);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,

  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_prs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read for subscription plans
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Users can view/manage their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (user_id = auth.uid());

-- Users can view audits for their projects
CREATE POLICY "Users can view own audits"
  ON audits FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Users can view issues for their audits
CREATE POLICY "Users can view own issues"
  ON audit_issues FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Users can view pages for their audits
CREATE POLICY "Users can view own pages"
  ON audit_pages FOR SELECT
  USING (audit_id IN (SELECT id FROM audits WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())));

-- Users can manage keywords for their projects
CREATE POLICY "Users can view own keywords"
  ON keywords FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own keywords"
  ON keywords FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own keywords"
  ON keywords FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own keywords"
  ON keywords FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Users can view keyword rankings
CREATE POLICY "Users can view own rankings"
  ON keyword_rankings FOR SELECT
  USING (keyword_id IN (SELECT id FROM keywords WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())));

-- Users can view their GitHub installations
CREATE POLICY "Users can view own installations"
  ON github_installations FOR SELECT
  USING (user_id = auth.uid());

-- Users can view PRs for their projects
CREATE POLICY "Users can view own prs"
  ON github_prs FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Users can manage their API keys
CREATE POLICY "Users can view own api keys"
  ON api_keys FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own api keys"
  ON api_keys FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own api keys"
  ON api_keys FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own api keys"
  ON api_keys FOR DELETE
  USING (user_id = auth.uid());

-- Free audits - anyone can insert (public tool)
CREATE POLICY "Anyone can create free audit"
  ON free_audits FOR INSERT
  WITH CHECK (true);

-- Users can view their notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- SEED DATA - Subscription Plans
-- =====================================================

INSERT INTO subscription_plans (plan_id, name, description, price_cents, sites_limit, team_members_limit, keywords_limit, historical_days, features, sort_order) VALUES
('solo', 'Solo', 'For indie developers', 900, 3, 1, 50, 30,
  '{"github_connect": true, "github_auto_fix": false, "slack_alerts": false, "api_access": true, "competitor_tracking": 0, "white_label": false, "priority_support": false}'::jsonb,
  1),
('pro', 'Pro', 'For teams & startups', 2900, 10, 5, 200, 90,
  '{"github_connect": true, "github_auto_fix": true, "slack_alerts": true, "api_access": true, "competitor_tracking": 3, "white_label": false, "priority_support": false}'::jsonb,
  2),
('agency', 'Agency', 'For agencies & enterprises', 9900, 50, NULL, 1000, 365,
  '{"github_connect": true, "github_auto_fix": true, "slack_alerts": true, "api_access": true, "competitor_tracking": 10, "white_label": true, "priority_support": true}'::jsonb,
  3);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-create user subscription on signup (free tier)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, status)
  VALUES (NEW.id, 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_github_installations_updated_at
  BEFORE UPDATE ON github_installations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
