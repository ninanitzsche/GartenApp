-- Add bed_id column to plants table
ALTER TABLE plants ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES beds(id) ON DELETE SET NULL;