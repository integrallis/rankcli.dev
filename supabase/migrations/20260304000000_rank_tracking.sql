-- Rank Tracking Enhancement Migration
-- Adds enhanced tracking capabilities for keyword rank monitoring

-- Add tier-based keyword limits and enhanced tracking fields to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS keyword_limit INT DEFAULT 10;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_rank_check_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS rank_check_frequency TEXT DEFAULT 'daily'; -- daily, twice_daily, four_times_daily

-- Add search parameters to keywords table
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS search_engine TEXT DEFAULT 'google';
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS track_url TEXT; -- Specific URL to track (optional)

-- Add SERP features tracking to rankings table
ALTER TABLE rankings ADD COLUMN IF NOT EXISTS serp_features JSONB DEFAULT '[]'; -- featured_snippet, paa, local_pack, etc.
ALTER TABLE rankings ADD COLUMN IF NOT EXISTS competitor_urls JSONB DEFAULT '[]'; -- Top 10 competitor URLs for this keyword

-- Create index for active keyword queries
CREATE INDEX IF NOT EXISTS idx_keywords_active ON keywords(project_id, is_active) WHERE is_active = TRUE;

-- Create index for rank check scheduling
CREATE INDEX IF NOT EXISTS idx_projects_rank_check ON projects(last_rank_check_at) WHERE last_rank_check_at IS NOT NULL;

-- View for keyword rank trends (last 30 days)
CREATE OR REPLACE VIEW keyword_rank_trends AS
SELECT 
    k.id AS keyword_id,
    k.keyword,
    k.project_id,
    k.current_position,
    k.best_position,
    COUNT(r.id) AS data_points,
    AVG(r.position) AS avg_position,
    MIN(r.position) AS min_position,
    MAX(r.position) AS max_position,
    -- Position change (positive = improved ranking)
    k.previous_position - k.current_position AS position_change
FROM keywords k
LEFT JOIN rankings r ON r.keyword_id = k.id 
    AND r.recorded_at > NOW() - INTERVAL '30 days'
WHERE k.is_active = TRUE
GROUP BY k.id, k.keyword, k.project_id, k.current_position, k.best_position, k.previous_position;

-- Function to get rank history for a keyword
CREATE OR REPLACE FUNCTION get_rank_history(
    p_keyword_id UUID,
    p_days INT DEFAULT 30
)
RETURNS TABLE (
    rank_position INT,
    rank_url TEXT,
    rank_serp_features JSONB,
    rank_recorded_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.position, r.url, r.serp_features, r.recorded_at
    FROM rankings r
    WHERE r.keyword_id = p_keyword_id
        AND r.recorded_at > NOW() - (p_days || ' days')::INTERVAL
    ORDER BY r.recorded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update keyword positions after a rank check
CREATE OR REPLACE FUNCTION update_keyword_rank(
    p_keyword_id UUID,
    p_position INT,
    p_url TEXT,
    p_serp_features JSONB DEFAULT '[]'::JSONB,
    p_competitor_urls JSONB DEFAULT '[]'::JSONB
)
RETURNS VOID AS $$
DECLARE
    v_current_position INT;
    v_best_position INT;
BEGIN
    -- Get current state
    SELECT current_position, best_position INTO v_current_position, v_best_position
    FROM keywords WHERE id = p_keyword_id;
    
    -- Insert ranking record
    INSERT INTO rankings (keyword_id, position, url, serp_features, competitor_urls, recorded_at)
    VALUES (p_keyword_id, p_position, p_url, p_serp_features, p_competitor_urls, NOW());
    
    -- Update keyword with new position
    UPDATE keywords SET
        previous_position = current_position,
        current_position = p_position,
        best_position = CASE 
            WHEN v_best_position IS NULL OR p_position < v_best_position THEN p_position
            ELSE v_best_position
        END,
        last_checked = NOW()
    WHERE id = p_keyword_id;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for multi-tenant access
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their project's keywords
CREATE POLICY keywords_user_policy ON keywords
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = keywords.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Allow users to see only their project's rankings
CREATE POLICY rankings_user_policy ON rankings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM keywords k
            JOIN projects p ON p.id = k.project_id
            WHERE k.id = rankings.keyword_id
            AND p.user_id = auth.uid()
        )
    );

-- Success
DO $$ BEGIN RAISE NOTICE 'Rank tracking enhancements applied'; END $$;
