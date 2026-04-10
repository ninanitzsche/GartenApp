-- Cover photos for gilden and plants
ALTER TABLE gilden ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Junction table photo_gilden
CREATE TABLE IF NOT EXISTS photo_gilden (
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  gilde_id UUID REFERENCES gilden(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, gilde_id)
);

-- Junction table photo_plants
CREATE TABLE IF NOT EXISTS photo_plants (
  photo_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, plant_id)
);