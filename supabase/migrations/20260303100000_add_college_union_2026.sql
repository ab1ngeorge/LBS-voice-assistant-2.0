-- ============================================
-- Add College Union 2026 data to knowledge_base
-- ============================================

INSERT INTO knowledge_base (section_key, section_title, content, section_order) VALUES

('college_union_2026', '30. LBS College Union 2026',
E'## 30. 🎓 LBS College Union 2026\n\n### 🏛 Executive Committee\n- **Chairperson:** Fathima Rifda\n- **General Secretary:** Adhiraj\n- **Vice Chairperson:** Nandana K\n\n### 🎨 Cultural & Publications\n- **Magazine Editor:** Abhinand\n- **Arts Secretary:** Jasil\n\n### 🎓 University Union Councillors\n- **UUC1:** Abhijith\n- **UCC2:** Mohammed Rizza\n\n### 👩‍🎓 Lady Representatives\n- **Lady Rep 1:** Nafida\n- **Lady Rep 2:** Afna', 30)

ON CONFLICT (section_key) DO UPDATE
SET content = EXCLUDED.content,
    section_title = EXCLUDED.section_title,
    section_order = EXCLUDED.section_order;
