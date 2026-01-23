-- Migration: Add threat_hashes table for URL safety checks
-- This implements a Google Safe Browsing-style local hash database
-- populated from URLhaus and other threat intelligence feeds

-- Create threat_hashes table
CREATE TABLE IF NOT EXISTS public.threat_hashes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hash_prefix VARCHAR(16) NOT NULL,
  hash_type VARCHAR(20) NOT NULL DEFAULT 'url', -- 'url' or 'domain'
  threat_type VARCHAR(50) NOT NULL DEFAULT 'malware', -- malware, phishing, etc.
  source VARCHAR(50) NOT NULL DEFAULT 'urlhaus', -- urlhaus, phishtank, etc.
  original_url TEXT, -- For debugging/reference (optional)
  tags TEXT[], -- Tags from the source (e.g., 'c2', 'botnet', 'ransomware')
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(hash_prefix, hash_type, source)
);

-- Create index for fast hash prefix lookups
CREATE INDEX IF NOT EXISTS idx_threat_hashes_prefix ON public.threat_hashes (hash_prefix) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_threat_hashes_type ON public.threat_hashes (hash_type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_threat_hashes_source ON public.threat_hashes (source);

-- Create threat_sync_log table to track sync operations
CREATE TABLE IF NOT EXISTS public.threat_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'running', -- running, completed, failed
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for sync log queries
CREATE INDEX IF NOT EXISTS idx_threat_sync_log_source ON public.threat_sync_log (source, started_at DESC);

-- RLS Policies

-- Enable RLS
ALTER TABLE public.threat_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_sync_log ENABLE ROW LEVEL SECURITY;

-- Threat hashes are read-only for authenticated users (public data)
CREATE POLICY "threat_hashes_select_authenticated" ON public.threat_hashes
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only service role can insert/update threat hashes
CREATE POLICY "threat_hashes_insert_service" ON public.threat_hashes
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

CREATE POLICY "threat_hashes_update_service" ON public.threat_hashes
  FOR UPDATE
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "threat_hashes_delete_service" ON public.threat_hashes
  FOR DELETE
  TO service_role
  USING (TRUE);

-- Sync log policies
CREATE POLICY "threat_sync_log_select_authenticated" ON public.threat_sync_log
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "threat_sync_log_insert_service" ON public.threat_sync_log
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

CREATE POLICY "threat_sync_log_update_service" ON public.threat_sync_log
  FOR UPDATE
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Function to get active threat hash count
CREATE OR REPLACE FUNCTION public.get_threat_hash_stats()
RETURNS TABLE (
  source VARCHAR(50),
  hash_type VARCHAR(20),
  total_count BIGINT,
  active_count BIGINT,
  last_sync TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    th.source,
    th.hash_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE th.is_active = TRUE) as active_count,
    MAX(tsl.completed_at) as last_sync
  FROM public.threat_hashes th
  LEFT JOIN public.threat_sync_log tsl ON th.source = tsl.source AND tsl.status = 'completed'
  GROUP BY th.source, th.hash_type;
$$;

-- Grant execute on the function
GRANT EXECUTE ON FUNCTION public.get_threat_hash_stats() TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE public.threat_hashes IS 'Local hash database for URL safety checks, populated from URLhaus and other threat feeds';
COMMENT ON TABLE public.threat_sync_log IS 'Log of threat database sync operations';
