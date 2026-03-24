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

DROP POLICY IF EXISTS "Service role full access" ON dynamic_faqs;
CREATE POLICY "Service role full access" ON dynamic_faqs
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Anon can read dynamic FAQs" ON dynamic_faqs;
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

DROP TRIGGER IF EXISTS trg_dynamic_faqs_updated_at ON dynamic_faqs;
CREATE TRIGGER trg_dynamic_faqs_updated_at
  BEFORE UPDATE ON dynamic_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_dynamic_faqs_updated_at();

-- ============================================
-- Weekly cron job to auto-promote FAQs
-- NOTE: Set up via Supabase Dashboard > Database > Cron Jobs
-- Schedule: '0 22 * * 0' (Every Sunday 22:00 UTC / 3:30 AM IST Monday)
-- URL: {SUPABASE_URL}/functions/v1/promote-faqs
-- ============================================

