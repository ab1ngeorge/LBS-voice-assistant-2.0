-- ============================================
-- Hybrid Search: pgvector + Full-Text Search
-- Enables semantic (embedding) + keyword (tsvector) search
-- ============================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column (384-dim for all-MiniLM-L6-v2 or gte-small)
ALTER TABLE knowledge_base
  ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Add tsvector column for full-text search
ALTER TABLE knowledge_base
  ADD COLUMN IF NOT EXISTS search_tsv tsvector;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_embedding
  ON knowledge_base USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_knowledge_tsv
  ON knowledge_base USING gin (search_tsv);

-- Auto-update tsvector on insert/update
CREATE OR REPLACE FUNCTION knowledge_base_tsv_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english', COALESCE(NEW.section_title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_knowledge_base_tsv ON knowledge_base;
CREATE TRIGGER trg_knowledge_base_tsv
  BEFORE INSERT OR UPDATE OF section_title, content
  ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION knowledge_base_tsv_trigger();

-- Backfill tsvector for existing rows
UPDATE knowledge_base SET
  search_tsv =
    setweight(to_tsvector('english', COALESCE(section_title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(content, '')), 'B');

-- ============================================
-- Hybrid Search RPC Function
-- Combines vector similarity + full-text relevance
-- Returns top N matches sorted by weighted score
-- ============================================

CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding vector(384) DEFAULT NULL,
  match_count INT DEFAULT 5,
  semantic_weight FLOAT DEFAULT 0.6,
  keyword_weight FLOAT DEFAULT 0.4
)
RETURNS TABLE (
  id BIGINT,
  section_key TEXT,
  section_title TEXT,
  content TEXT,
  semantic_score FLOAT,
  keyword_score FLOAT,
  combined_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH
  -- Semantic search (only if embedding is provided)
  semantic AS (
    SELECT
      kb.id,
      CASE
        WHEN query_embedding IS NOT NULL AND kb.embedding IS NOT NULL
        THEN 1 - (kb.embedding <=> query_embedding)  -- cosine similarity
        ELSE 0
      END AS score
    FROM knowledge_base kb
  ),
  -- Full-text keyword search
  keyword AS (
    SELECT
      kb.id,
      CASE
        WHEN query_text IS NOT NULL AND query_text != ''
        THEN ts_rank_cd(kb.search_tsv, plainto_tsquery('english', query_text))
        ELSE 0
      END AS score
    FROM knowledge_base kb
  ),
  -- Combine scores
  combined AS (
    SELECT
      kb.id,
      kb.section_key,
      kb.section_title,
      kb.content,
      COALESCE(s.score, 0)::FLOAT AS sem_score,
      COALESCE(k.score, 0)::FLOAT AS kw_score,
      (
        semantic_weight * COALESCE(s.score, 0) +
        keyword_weight * COALESCE(k.score, 0)
      )::FLOAT AS total_score
    FROM knowledge_base kb
    LEFT JOIN semantic s ON s.id = kb.id
    LEFT JOIN keyword k ON k.id = kb.id
  )
  SELECT
    c.id,
    c.section_key,
    c.section_title,
    c.content,
    c.sem_score AS semantic_score,
    c.kw_score AS keyword_score,
    c.total_score AS combined_score
  FROM combined c
  WHERE c.total_score > 0
  ORDER BY c.total_score DESC
  LIMIT match_count;
END;
$$;
