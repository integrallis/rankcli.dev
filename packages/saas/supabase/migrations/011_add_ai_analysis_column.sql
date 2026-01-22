-- Add ai_analysis column to audits table for storing AI-powered analysis results
ALTER TABLE audits
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN audits.ai_analysis IS 'Stores AI-powered SEO analysis including content analysis, meta optimization suggestions, and fix prioritization from GPT-4o';

-- Create index for querying audits with AI analysis
CREATE INDEX IF NOT EXISTS idx_audits_ai_analysis ON audits ((ai_analysis IS NOT NULL));
