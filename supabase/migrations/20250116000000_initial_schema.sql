-- SEO Autopilot Database Schema
-- Compatible with both local PostgreSQL and Supabase

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    domain TEXT,
    github_repo TEXT,
    framework TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keywords with tracking
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    search_volume INT,
    difficulty INT,
    cpc DECIMAL(10,2),
    intent TEXT, -- informational, transactional, navigational, commercial
    current_position INT,
    previous_position INT,
    best_position INT,
    last_checked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, keyword)
);

-- Ranking history (time-series)
CREATE TABLE IF NOT EXISTS rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    position INT,
    url TEXT,
    search_engine TEXT DEFAULT 'google',
    device TEXT DEFAULT 'desktop',
    location TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rankings_keyword_time ON rankings(keyword_id, recorded_at DESC);

-- Audits
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    url TEXT,
    score INT,
    issues JSONB DEFAULT '[]',
    lighthouse JSONB,
    core_web_vitals JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixes (proposed and applied)
CREATE TABLE IF NOT EXISTS fixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    audit_id UUID REFERENCES audits(id),
    issue_type TEXT NOT NULL,
    severity TEXT NOT NULL, -- critical, warning, info
    category TEXT NOT NULL, -- meta, schema, content, technical, performance
    file_path TEXT,
    before_code TEXT,
    after_code TEXT,
    pr_url TEXT,
    applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events for event-driven processing
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_events_unprocessed ON events(project_id, created_at) WHERE processed = FALSE;

-- Generated tools (Engineering as Marketing)
CREATE TABLE IF NOT EXISTS generated_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    tool_type TEXT NOT NULL, -- calculator, generator, validator, converter, checker
    target_keyword TEXT,
    search_volume INT,
    description TEXT,
    component_code TEXT,
    deployed_url TEXT,
    traffic INT DEFAULT 0,
    conversions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search Console data cache
CREATE TABLE IF NOT EXISTS search_console_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    query TEXT,
    page TEXT,
    clicks INT,
    impressions INT,
    ctr DECIMAL(5,4),
    position DECIMAL(6,2),
    date DATE NOT NULL,
    country TEXT,
    device TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gsc_project_date ON search_console_data(project_id, date DESC);

-- Competitors
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    name TEXT,
    notes TEXT,
    last_analyzed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, domain)
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER generated_tools_updated_at BEFORE UPDATE ON generated_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Success
DO $$ BEGIN RAISE NOTICE 'SEO Autopilot schema initialized'; END $$;
