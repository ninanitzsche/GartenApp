CREATE TABLE IF NOT EXISTS gilde_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_id UUID REFERENCES beds(id) ON DELETE CASCADE,
  gilde_id UUID REFERENCES gilden(id) ON DELETE CASCADE,
  rating INT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);