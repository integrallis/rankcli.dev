-- API Requests tracking table for rate limiting
CREATE TABLE IF NOT EXISTS api_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for counting requests by key and date (for rate limiting)
CREATE INDEX idx_api_requests_key_date ON api_requests(api_key_id, created_at);
CREATE INDEX idx_api_requests_user_date ON api_requests(user_id, created_at);

-- Partition-friendly index for daily counts
CREATE INDEX idx_api_requests_created ON api_requests(created_at);

-- RLS for api_requests (users can view their own request history)
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API requests"
  ON api_requests FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert (for edge functions)
CREATE POLICY "Service can insert API requests"
  ON api_requests FOR INSERT
  WITH CHECK (true);

-- Cleanup old requests (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_api_requests()
RETURNS void AS $$
BEGIN
  DELETE FROM api_requests WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON TABLE api_requests IS 'Tracks API requests for rate limiting. Solo: 100/day, Pro: 1000/day, Agency: 10000/day';
