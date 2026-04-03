-- Add identification_source column to plants
ALTER TABLE plants ADD COLUMN IF NOT EXISTS identification_source TEXT DEFAULT 'manual';
ALTER TABLE plants ADD COLUMN IF NOT EXISTS identified_at TIMESTAMPTZ;
