-- URL comparisons tracking table
CREATE TABLE IF NOT EXISTS url_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  your_url TEXT NOT NULL,
  competitor_url TEXT NOT NULL,
  your_score INTEGER NOT NULL DEFAULT 0,
  competitor_score INTEGER NOT NULL DEFAULT 0,
  your_errors INTEGER NOT NULL DEFAULT 0,
  your_warnings INTEGER NOT NULL DEFAULT 0,
  competitor_errors INTEGER NOT NULL DEFAULT 0,
  competitor_warnings INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rate limiting and analytics
CREATE INDEX idx_url_comparisons_ip_date ON url_comparisons(ip_hash, created_at);
CREATE INDEX idx_url_comparisons_created ON url_comparisons(created_at);

-- Comment for documentation
COMMENT ON TABLE url_comparisons IS 'Tracks SEO URL comparisons. Rate limited to 3/hour per IP.';
