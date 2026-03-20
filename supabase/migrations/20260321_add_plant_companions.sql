-- =====================================================
-- Migration: Add plant_companions columns and config
-- Date: 2026-03-21
-- Note: Table already exists with basic columns
-- =====================================================

-- Add missing columns
ALTER TABLE plant_companions ADD COLUMN IF NOT EXISTS plant_name_de TEXT;
ALTER TABLE plant_companions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE plant_companions ADD COLUMN IF NOT EXISTS good_reasons TEXT[];
ALTER TABLE plant_companions ADD COLUMN IF NOT EXISTS bad_reasons TEXT[];
ALTER TABLE plant_companions ADD COLUMN IF NOT EXISTS distance_cm INTEGER;
ALTER TABLE plant_companions ADD COLUMN IF NOT EXISTS nitrogen_fixer BOOLEAN DEFAULT FALSE;
ALTER TABLE plant_companions ADD COLUMN IF NOT EXISTS pest_repellent TEXT[];
ALTER TABLE plant_companions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_companion_name_de ON plant_companions(plant_name_de);
CREATE INDEX IF NOT EXISTS idx_companion_category ON plant_companions(category);

-- Enable RLS
ALTER TABLE plant_companions ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Public read access for companions" ON plant_companions;
CREATE POLICY "Public read access for companions" ON plant_companions
  FOR SELECT USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_plant_companions_updated_at ON plant_companions;
CREATE TRIGGER update_plant_companions_updated_at
  BEFORE UPDATE ON plant_companions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Rollback:
-- ALTER TABLE plant_companions DROP COLUMN IF EXISTS plant_name_de;
-- ALTER TABLE plant_companions DROP COLUMN IF EXISTS category;
-- ALTER TABLE plant_companions DROP COLUMN IF EXISTS good_reasons;
-- ALTER TABLE plant_companions DROP COLUMN IF EXISTS bad_reasons;
-- ALTER TABLE plant_companions DROP COLUMN IF EXISTS distance_cm;
-- ALTER TABLE plant_companions DROP COLUMN IF EXISTS nitrogen_fixer;
-- ALTER TABLE plant_companions DROP COLUMN IF EXISTS pest_repellent;
-- ALTER TABLE plant_companions DROP COLUMN IF EXISTS updated_at;
-- =====================================================
