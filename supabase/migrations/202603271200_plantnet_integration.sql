-- PlantNet cache table
CREATE TABLE IF NOT EXISTS plant_info_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255),
  plantnet_response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plant_name)
);

-- Add columns to plants table
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plantnet_id VARCHAR(100);
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plantnet_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plantnet_fetched_at TIMESTAMPTZ;

-- Add source column to learnings
ALTER TABLE learnings ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';

-- Add source column to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';

-- Index for caching
CREATE INDEX IF NOT EXISTS idx_plant_info_cache_name ON plant_info_cache(plant_name);
