-- Gilden (Pflanzinseln)
CREATE TABLE IF NOT EXISTS gilden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INT,
  name TEXT NOT NULL,
  concept TEXT,
  plants JSONB NOT NULL DEFAULT '[]',
  standort TEXT,
  tips TEXT[],
  is_system BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beet-Gilde Zuordnung (Many-to-Many)
CREATE TABLE IF NOT EXISTS beet_gilden (
  bed_id UUID REFERENCES beds(id) ON DELETE CASCADE,
  gilde_id UUID REFERENCES gilden(id) ON DELETE CASCADE,
  PRIMARY KEY (bed_id, gilde_id)
);

-- RLS Policies
ALTER TABLE gilden ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all gilden" ON gilden
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own gilden" ON gilden
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_system = true);

CREATE POLICY "Users can update own gilden" ON gilden
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gilden" ON gilden
  FOR DELETE USING (auth.uid() = user_id AND is_system = false);

ALTER TABLE beet_gilden ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage beet_gilden" ON beet_gilden
  FOR ALL USING (
    bed_id IN (SELECT id FROM beds WHERE user_id = auth.uid())
  );