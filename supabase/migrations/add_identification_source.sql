-- Migration: Add AI identification fields to plants
-- Created: 2026-03-19
-- Description: Track how plants were added (manual vs AI)

ALTER TABLE plants
ADD COLUMN IF NOT EXISTS identification_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS identified_at TIMESTAMPTZ;

COMMENT ON COLUMN plants.identification_source IS 'How the plant was added: manual or ai';
COMMENT ON COLUMN plants.identified_at IS 'When the plant was identified via AI';

-- Update existing plants to have 'manual' as default
UPDATE plants SET identification_source = 'manual' WHERE identification_source IS NULL;
