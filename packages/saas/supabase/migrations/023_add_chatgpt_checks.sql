-- ChatGPT checks tracking table
CREATE TABLE IF NOT EXISTS chatgpt_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  brand TEXT NOT NULL,
  mentioned BOOLEAN NOT NULL DEFAULT false,
  position INTEGER,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  context TEXT,
  queries_tested TEXT[],
  response_snippet TEXT,
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rate limiting and analytics
CREATE INDEX idx_chatgpt_checks_ip_date ON chatgpt_checks(ip_hash, created_at);
CREATE INDEX idx_chatgpt_checks_domain ON chatgpt_checks(domain);
CREATE INDEX idx_chatgpt_checks_created ON chatgpt_checks(created_at);

-- RLS disabled for this table (public inserts via edge function)
-- Service role handles all operations

-- Comment for documentation
COMMENT ON TABLE chatgpt_checks IS 'Tracks ChatGPT visibility checks for the free tool. Rate limited to 5/hour per IP.';
