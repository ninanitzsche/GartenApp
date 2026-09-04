-- Health checks table for plant disease tracking history
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  disease_data JSONB,
  health_status TEXT NOT NULL CHECK (health_status IN ('gesund', 'krank', 'unsicher')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_health_checks_plant_id ON health_checks(plant_id);
CREATE INDEX idx_health_checks_created_at ON health_checks(created_at DESC);
CREATE INDEX idx_health_checks_user_id ON health_checks(user_id);

ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health checks"
  ON health_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health checks"
  ON health_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health checks"
  ON health_checks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health checks"
  ON health_checks FOR DELETE
  USING (auth.uid() = user_id);
