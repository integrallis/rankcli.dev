-- AI Visibility checks tracking table
CREATE TABLE IF NOT EXISTS ai_visibility_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  brand TEXT NOT NULL,
  overall_score INTEGER NOT NULL DEFAULT 0,
  openai_mentioned BOOLEAN DEFAULT false,
  openai_position INTEGER,
  anthropic_mentioned BOOLEAN DEFAULT false,
  anthropic_position INTEGER,
  google_mentioned BOOLEAN DEFAULT false,
  google_position INTEGER,
  perplexity_mentioned BOOLEAN DEFAULT false,
  perplexity_position INTEGER,
  queries_tested TEXT[],
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rate limiting and analytics
CREATE INDEX idx_ai_visibility_checks_ip_date ON ai_visibility_checks(ip_hash, created_at);
CREATE INDEX idx_ai_visibility_checks_domain ON ai_visibility_checks(domain);
CREATE INDEX idx_ai_visibility_checks_created ON ai_visibility_checks(created_at);

-- Comment for documentation
COMMENT ON TABLE ai_visibility_checks IS 'Tracks AI visibility checks across ChatGPT, Claude, Gemini, Perplexity. Rate limited to 5/hour per IP.';
