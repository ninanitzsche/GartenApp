-- Add missing plant_info_sources column
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plant_info_sources TEXT[];
