-- ============================================
-- Create rate_limits table
-- Tracks request counts per IP per time window
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
  client_ip TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('minute', now()),
  request_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (client_ip, window_start)
);

-- Index for fast IP lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(client_ip, window_start);

-- RLS: only service role
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- Cleanup: remove rows older than 5 minutes (run via cron or on-demand)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < now() - interval '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
