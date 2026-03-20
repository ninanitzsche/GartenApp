-- =====================================================
-- Migration: Add zeitraum and learnings support
-- Date: 2026-03-20
-- =====================================================

-- 1. Add zeitraum column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS zeitraum TEXT DEFAULT 'flexibel'
  CHECK (zeitraum IN (
    'fruehjahr_frueh', 'fruehjahr_mitte', 'fruehjahr_spaet',
    'sommer_frueh', 'sommer_mitte', 'sommer_spaet',
    'herbst_frueh', 'herbst_mitte', 'herbst_spaet',
    'winter_frueh', 'winter_mitte', 'winter_spaet',
    'diese_woche', 'flexibel'
  ));

-- 2. Add indexes for zeitraum queries
CREATE INDEX IF NOT EXISTS idx_tasks_zeitraum ON tasks(zeitraum);

-- 3. Create learnings table
CREATE TABLE IF NOT EXISTS learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('knowledge_base', 'manual')),
  source_id UUID,
  source_name TEXT,
  title TEXT NOT NULL,
  content TEXT,
  related_plants TEXT[] DEFAULT '{}',
  related_categories TEXT[] DEFAULT '{}',
  valid_for_zeitraeume TEXT[] NOT NULL DEFAULT '{}',
  relevance_score DECIMAL(3,2) DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  user_rating TEXT CHECK (user_rating IN ('helpful', 'not_helpful')),
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add RLS policies for learnings
ALTER TABLE learnings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own learnings" ON learnings;
DROP POLICY IF EXISTS "Users can insert own learnings" ON learnings;
DROP POLICY IF EXISTS "Users can update own learnings" ON learnings;
DROP POLICY IF EXISTS "Users can delete own learnings" ON learnings;

-- Users can only see their own learnings
CREATE POLICY "Users can view own learnings" ON learnings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learnings" ON learnings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learnings" ON learnings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own learnings" ON learnings
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create indexes for learnings
CREATE INDEX IF NOT EXISTS idx_learnings_user ON learnings(user_id);
CREATE INDEX IF NOT EXISTS idx_learnings_zeitraeume ON learnings USING GIN(valid_for_zeitraeume);
CREATE INDEX IF NOT EXISTS idx_learnings_relevance ON learnings(relevance_score DESC);

-- 6. Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_learnings_updated_at ON learnings;
CREATE TRIGGER update_learnings_updated_at
  BEFORE UPDATE ON learnings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Rollback:
-- DROP TABLE IF EXISTS learnings;
-- ALTER TABLE tasks DROP COLUMN IF EXISTS zeitraum;
-- DROP INDEX IF EXISTS idx_tasks_zeitraum;
-- =====================================================
