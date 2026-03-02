-- Gartenplaner Initial Database Schema
-- Migration: 001
-- Created: 2026-03-02
-- Description: Create all 11 tables with RLS policies for MVP

-- ============================================================================
-- TABLE 1: plants
-- ============================================================================

CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latin_name TEXT,
  location TEXT,
  type TEXT,
  status TEXT NOT NULL,
  winterhart BOOLEAN DEFAULT false,
  essbar BOOLEAN DEFAULT false,
  quantity INTEGER,
  planted_date DATE,
  harvest_date DATE,
  notes TEXT,
  tags TEXT[],
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_location ON plants(location);

ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plants"
  ON plants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plants"
  ON plants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants"
  ON plants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants"
  ON plants FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 2: tasks
-- ============================================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT,
  location TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  auto_generated BOOLEAN DEFAULT false,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 3: photos
-- ============================================================================

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  date TIMESTAMPTZ DEFAULT now(),
  location TEXT,
  notes TEXT,
  ai_analysis JSONB,
  tags TEXT[],
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_date ON photos(date DESC);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own photos"
  ON photos FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 4: shopping_items
-- ============================================================================

CREATE TABLE shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category TEXT,
  quantity TEXT,
  priority TEXT,
  estimated_price DECIMAL(10,2),
  actual_price DECIMAL(10,2),
  purchased BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ,
  where_to_buy TEXT,
  link TEXT,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shopping_user_id ON shopping_items(user_id);
CREATE INDEX idx_shopping_purchased ON shopping_items(purchased);

ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping items"
  ON shopping_items FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 5: harvests
-- ============================================================================

CREATE TABLE harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  harvest_date DATE NOT NULL,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_harvests_user_id ON harvests(user_id);
CREATE INDEX idx_harvests_plant_id ON harvests(plant_id);
CREATE INDEX idx_harvests_date ON harvests(harvest_date DESC);

ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own harvests"
  ON harvests FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 6: plans
-- ============================================================================

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  size TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plans_user_id ON plans(user_id);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own plans"
  ON plans FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 7: knowledge_articles
-- ============================================================================

CREATE TABLE knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  is_favorited BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_knowledge_category ON knowledge_articles(category);
CREATE INDEX idx_knowledge_user_id ON knowledge_articles(user_id);

ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and system articles"
  ON knowledge_articles FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage own articles"
  ON knowledge_articles FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 8: plant_companions
-- ============================================================================

CREATE TABLE plant_companions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name TEXT NOT NULL UNIQUE,
  good_companions TEXT[],
  bad_companions TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_companions_plant_name ON plant_companions(plant_name);

-- ============================================================================
-- TABLE 9: plant_tasks (Junction)
-- ============================================================================

CREATE TABLE plant_tasks (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, plant_id)
);

CREATE INDEX idx_plant_tasks_task ON plant_tasks(task_id);
CREATE INDEX idx_plant_tasks_plant ON plant_tasks(plant_id);

-- ============================================================================
-- TABLE 10: photo_plants (Junction)
-- ============================================================================

CREATE TABLE photo_plants (
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, plant_id)
);

CREATE INDEX idx_photo_plants_photo ON photo_plants(photo_id);
CREATE INDEX idx_photo_plants_plant ON photo_plants(plant_id);
