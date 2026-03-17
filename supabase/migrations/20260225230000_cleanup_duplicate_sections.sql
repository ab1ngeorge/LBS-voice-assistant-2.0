-- ============================================
-- Cleanup: Remove outdated duplicate sections from knowledge_base
-- These sections were inserted by earlier migrations and contain
-- outdated fee data that conflicts with the correct sections
-- added by 20260225100000_add_comprehensive_knowledge.sql
-- ============================================

-- Old fee section (₹56,870 — incorrect) — correct one is fee_structure_detail (section 14)
DELETE FROM knowledge_base WHERE section_key = 'fee_structure_202526_academic_year';

-- Duplicate B.Tech fee variations — data already covered by fee_structure_detail
DELETE FROM knowledge_base WHERE section_key = 'btech_fee_variations';
