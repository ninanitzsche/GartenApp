-- AI Metadata Storage
-- Migration: 004
-- Created: 2026-03-19
-- Description: Store AI analysis results in Supabase for persistence across devices

-- ============================================================================
-- TABLE: ai_identifications
-- Stores AI identification results (plant and pest)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_type TEXT NOT NULL CHECK (ai_type IN ('plant', 'pest')),
  image_url TEXT,
  result_json JSONB NOT NULL,
  confidence DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_identifications_user_id ON ai_identifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_identifications_created_at ON ai_identifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_identifications_user_created ON ai_identifications(user_id, created_at DESC);

ALTER TABLE ai_identifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own identifications"
  ON ai_identifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own identifications"
  ON ai_identifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own identifications"
  ON ai_identifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own identifications"
  ON ai_identifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: plant_identifications
-- Links AI plant identifications to plants
-- ============================================================================

CREATE TABLE IF NOT EXISTS plant_identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  identification_id UUID NOT NULL REFERENCES ai_identifications(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plant_identifications_plant_id ON plant_identifications(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_identifications_identification_id ON plant_identifications(identification_id);

ALTER TABLE plant_identifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plant identifications"
  ON plant_identifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = plant_identifications.plant_id
        AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own plant identifications"
  ON plant_identifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = plant_identifications.plant_id
        AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own plant identifications"
  ON plant_identifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = plant_identifications.plant_id
        AND plants.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLE: photo_ai_analysis
-- Links photos to AI analyses
-- ============================================================================

CREATE TABLE IF NOT EXISTS photo_ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  ai_type TEXT NOT NULL,
  analysis_id UUID NOT NULL REFERENCES ai_identifications(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photo_ai_analysis_photo_id ON photo_ai_analysis(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_ai_analysis_analysis_id ON photo_ai_analysis(analysis_id);

ALTER TABLE photo_ai_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photo analyses"
  ON photo_ai_analysis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = photo_ai_analysis.photo_id
        AND photos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own photo analyses"
  ON photo_ai_analysis FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = photo_ai_analysis.photo_id
        AND photos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own photo analyses"
  ON photo_ai_analysis FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = photo_ai_analysis.photo_id
        AND photos.user_id = auth.uid()
    )
  );

-- End of migration