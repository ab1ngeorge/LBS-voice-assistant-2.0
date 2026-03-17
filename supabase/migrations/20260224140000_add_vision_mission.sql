-- Add Vision & Mission to knowledge_base
-- Source: Official LBS College of Engineering Kasaragod website

INSERT INTO knowledge_base (section_key, section_title, content, section_order) VALUES
(
  'vision_mission',
  '2. Vision & Mission',
  E'## 2. Vision & Mission\n\n### Vision\nTo become a paragon institution for the pursuance of education and research in engineering and technology.\n\n### Mission\n- Impart the finest quality technical education and training\n- Nurture a vision of sustainable development\n- Bequeath it to the next generation of professionals',
  2
)
ON CONFLICT (section_key) DO UPDATE
SET content = EXCLUDED.content,
    section_title = EXCLUDED.section_title,
    section_order = EXCLUDED.section_order;
