-- ============================================
-- Daily cron job to auto-sync knowledge base
-- Requires: pg_cron and pg_net extensions enabled
-- ============================================

-- Enable extensions (safe to run if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule: every day at 21:30 UTC = 3:00 AM IST
-- Calls the sync-knowledge edge function via HTTP POST
SELECT cron.schedule(
  'sync-knowledge-daily',  -- job name
  '30 21 * * *',           -- cron expression: 21:30 UTC daily
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/sync-knowledge',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
