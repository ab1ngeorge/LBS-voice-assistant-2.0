-- ============================================
-- Clean up duplicate College Union row (id 447)
-- Keep row 448 (college_union_2026) as the canonical entry
-- ============================================

DELETE FROM knowledge_base WHERE id = 447;
