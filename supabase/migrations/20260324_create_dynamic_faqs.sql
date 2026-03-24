-- ============================================
-- Dynamic FAQs table for auto-promoted questions
-- Populated by the promote-faqs edge function
-- ============================================

CREATE TABLE IF NOT EXISTS dynamic_faqs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  hit_count INT NOT NULL DEFAULT 0,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique on question to allow upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_dynamic_faqs_question
  ON dynamic_faqs (question);

-- RLS
ALTER TABLE dynamic_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON dynamic_faqs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon can read dynamic FAQs" ON dynamic_faqs
  FOR SELECT USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_dynamic_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dynamic_faqs_updated_at
  BEFORE UPDATE ON dynamic_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_dynamic_faqs_updated_at();

-- ============================================
-- Weekly cron job to auto-promote FAQs
-- ============================================
-- Requires pg_cron and pg_net (already enabled by sync cron migration)

SELECT cron.schedule(
  'promote-faqs-weekly',
  '0 22 * * 0',  -- Every Sunday at 22:00 UTC (3:30 AM IST Monday)
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/promote-faqs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
