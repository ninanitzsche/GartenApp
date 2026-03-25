-- Migration: Add photo_beds junction table and bed cover photo
-- Created: 2026-03-25

-- Junction table linking photos to beds (same pattern as photo_plants)
CREATE TABLE photo_beds (
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, bed_id)
);

CREATE INDEX idx_photo_beds_photo ON photo_beds(photo_id);
CREATE INDEX idx_photo_beds_bed ON photo_beds(bed_id);

ALTER TABLE photo_beds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own photo_beds"
  ON photo_beds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM photos WHERE photos.id = photo_beds.photo_id AND photos.user_id = auth.uid()
    )
  );

-- Add cover_photo_url column to beds for title image in gallery
ALTER TABLE beds ADD COLUMN cover_photo_url TEXT;
