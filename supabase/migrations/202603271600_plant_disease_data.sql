-- Add disease_data column to plants table
ALTER TABLE plants ADD COLUMN IF NOT EXISTS disease_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMPTZ;
