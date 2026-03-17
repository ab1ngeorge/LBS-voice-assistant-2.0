-- ============================================
-- Create knowledge_base table for LBS Chat
-- ============================================
-- Stores the FALLBACK_KNOWLEDGE sections that were
-- previously hardcoded in the lbs-chat edge function.
-- Each row = one ## section from the knowledge base.

CREATE TABLE IF NOT EXISTS knowledge_base (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  section_title TEXT NOT NULL,
  content TEXT NOT NULL,
  section_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ordering
CREATE INDEX idx_knowledge_base_order ON knowledge_base(section_order);

-- Enable RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Public read policy (edge functions use service role, but this also allows anon reads)
CREATE POLICY "Allow public read access"
  ON knowledge_base
  FOR SELECT
  USING (true);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_updated_at();


-- ============================================
-- Seed data: existing FALLBACK_KNOWLEDGE sections
-- ============================================

INSERT INTO knowledge_base (section_key, section_title, content, section_order) VALUES

-- Header (always included as preamble)
('header', 'LBS College of Engineering, Kasaragod (LBSCEK)', E'# LBS College of Engineering, Kasaragod (LBSCEK)\n\nWebsite: https://lbscek.ac.in/', 0),

-- Section 1: General Information
('general_information', '1. General Information', E'## 1. General Information\n- **Full Name:** Lal Bahadur Shastri College of Engineering, Kasaragod\n- **Established:** 1993\n- **Management:** L B S Centre for Science and Technology (Govt. of Kerala Undertaking)\n- **Location:** Povval, Muliyar P.O., Kasaragod, Kerala - 671542 (12 km from Kasaragod town)\n- **Campus Area:** 52 acres\n- **Affiliation:** APJ Abdul Kalam Technological University (KTU)\n- **Approval:** AICTE\n- **Contact:** +91-4994-256300, +91-4994-256301\n- **Email:** principal@lbscek.ac.in, office@lbscek.ac.in, admission@lbscek.ac.in\n- **Working Hours:** 9:00 AM - 4:30 PM (Class Timings: 9:15 AM - 4:00 PM)\n- **Office Hours:** 9:00 AM - 5:00 PM (Mon-Fri), 9:00 AM - 1:00 PM (Sat)', 1),

-- Section 160: Final Remarks & Future Plans
('final_remarks', '160. Final Remarks & Future Plans', E'## 160. Final Remarks & Future Plans\n- **Vision 2030:** Aiming for autonomous status\n- **Infrastructure Expansion:** New blocks planned\n- **NAAC Accreditation:** Preparation underway\n- **International Collaborations:** More MOUs in pipeline\n- **Placement Target:** 90%+ placement rate goal\n- **Research Focus:** More funded projects and publications\n- **Startup Ecosystem:** Stronger incubation support', 160);
