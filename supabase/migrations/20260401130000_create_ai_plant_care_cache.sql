-- Create table for caching AI-generated plant care data
CREATE TABLE IF NOT EXISTS ai_plant_care_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name VARCHAR(255) NOT NULL,
  care_data JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure each user can only have one cache entry per plant
  UNIQUE(plant_name, user_id)
);

-- Enable real-time (if using supabase realtime)
alter publication supabase_realtime add table ai_plant_care_cache;

-- Add helpful comment
COMMENT ON TABLE ai_plant_care_cache IS 'Cache for AI-generated plant care information and care guides';
COMMENT ON COLUMN ai_plant_care_cache.plant_name IS 'Plant name in lowercase for case-insensitive lookup';
COMMENT ON COLUMN ai_plant_care_cache.care_data IS 'JSONB containing care instructions, guides, tips, etc.';
COMMENT ON COLUMN ai_plant_care_cache.user_id IS 'Reference to the user who requested this data';
COMMENT ON COLUMN ai_plant_care_cache.updated_at IS 'Timestamp of last update for cache invalidation';