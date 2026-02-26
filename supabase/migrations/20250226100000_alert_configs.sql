-- Alert Configurations
-- Stores webhook URLs and alert preferences for Slack/Discord notifications

CREATE TABLE IF NOT EXISTS alert_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Alert channel type
    channel TEXT NOT NULL CHECK (channel IN ('slack', 'discord', 'email')),
    
    -- Webhook URL (encrypted at rest by Supabase)
    webhook_url TEXT NOT NULL,
    
    -- What events to alert on
    on_error BOOLEAN DEFAULT TRUE,
    on_score_drop BOOLEAN DEFAULT TRUE,
    on_weekly_report BOOLEAN DEFAULT FALSE,
    on_pr_created BOOLEAN DEFAULT TRUE,
    
    -- Score drop threshold (only alert if drop is >= this value)
    score_drop_threshold INT DEFAULT 10,
    
    -- Is this config active?
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Each user can have one config per channel per project
    UNIQUE(user_id, project_id, channel)
);

-- RLS policies
ALTER TABLE alert_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alert configs"
    ON alert_configs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alert configs"
    ON alert_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert configs"
    ON alert_configs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alert configs"
    ON alert_configs FOR DELETE
    USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_alert_configs_user_project ON alert_configs(user_id, project_id);
CREATE INDEX idx_alert_configs_enabled ON alert_configs(enabled) WHERE enabled = TRUE;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_alert_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alert_configs_updated_at
    BEFORE UPDATE ON alert_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_configs_updated_at();

-- White-label branding settings (for Agency tier)
CREATE TABLE IF NOT EXISTS branding_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Branding settings
    company_name TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    accent_color TEXT DEFAULT '#10b981',
    contact_email TEXT,
    website_url TEXT,
    
    -- Is white-label enabled?
    white_label_enabled BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for branding
ALTER TABLE branding_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own branding config"
    ON branding_configs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own branding config"
    ON branding_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branding config"
    ON branding_configs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branding config"
    ON branding_configs FOR DELETE
    USING (auth.uid() = user_id);

-- Update timestamp trigger for branding
CREATE TRIGGER branding_configs_updated_at
    BEFORE UPDATE ON branding_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_configs_updated_at();

COMMENT ON TABLE alert_configs IS 'Webhook configurations for Slack/Discord notifications on SEO events';
COMMENT ON TABLE branding_configs IS 'White-label branding settings for Agency tier users';
