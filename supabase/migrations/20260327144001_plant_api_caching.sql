-- Add combined_data column to plant_info_cache
ALTER TABLE plant_info_cache ADD COLUMN IF NOT EXISTS combined_data JSONB;

-- Add new columns to plants table for all APIs
ALTER TABLE plants ADD COLUMN IF NOT EXISTS perenual_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS permapeople_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plant_info_fetched_at TIMESTAMPTZ;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plant_info_sources TEXT[];

-- Add source column to learnings if not exists
ALTER TABLE learnings ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';

-- Add source column to tasks if not exists
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';
