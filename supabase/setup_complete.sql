-- ============================================================================
-- Gartenplaner - Complete Database Setup (All-in-One)
-- Sprint 1 - STORY-INF-001
-- Created: 2026-03-02
--
-- This file combines all migrations for quick setup.
-- Run this in Supabase SQL Editor to set up everything at once!
-- ============================================================================

-- STEP 1: Create all tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plants table
CREATE TABLE IF NOT EXISTS plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  type TEXT,
  status TEXT NOT NULL DEFAULT 'geplant',
  winterhart BOOLEAN DEFAULT false,
  essbar BOOLEAN DEFAULT false,
  menge INTEGER,
  pflanz_datum DATE,
  ernte_datum DATE,
  pflegehinweise TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_plants_status ON plants(status);
CREATE INDEX idx_plants_location ON plants(location);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority INTEGER DEFAULT 2,
  standort TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_interval TEXT,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);

-- Plant-Tasks junction table
CREATE TABLE IF NOT EXISTS plant_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plant_id, task_id)
);

CREATE INDEX idx_plant_tasks_plant_id ON plant_tasks(plant_id);
CREATE INDEX idx_plant_tasks_task_id ON plant_tasks(task_id);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  standort TEXT,
  notes TEXT,
  note_category TEXT,
  photo_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_standort ON photos(standort);

-- Photo-Plants junction table
CREATE TABLE IF NOT EXISTS photo_plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(photo_id, plant_id)
);

CREATE INDEX idx_photo_plants_photo_id ON photo_plants(photo_id);
CREATE INDEX idx_photo_plants_plant_id ON photo_plants(plant_id);

-- Shopping items table
CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artikel_name TEXT NOT NULL,
  kategorie TEXT,
  menge TEXT,
  priority TEXT DEFAULT 'optional',
  geschaetzter_preis DECIMAL(10, 2),
  actual_price DECIMAL(10, 2),
  wo_kaufen TEXT,
  link TEXT,
  notizen TEXT,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shopping_items_user_id ON shopping_items(user_id);

-- Harvests table
CREATE TABLE IF NOT EXISTS harvests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_harvests_user_id ON harvests(user_id);
CREATE INDEX idx_harvests_plant_id ON harvests(plant_id);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  plan_image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, area)
);

CREATE INDEX idx_plans_user_id ON plans(user_id);

-- Knowledge articles table
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  short_description TEXT,
  read_time_minutes INTEGER,
  is_user_created BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_knowledge_articles_category ON knowledge_articles(category);

-- Plant companions table
CREATE TABLE IF NOT EXISTS plant_companions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_name TEXT NOT NULL,
  companion_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plant_name, companion_name)
);

CREATE INDEX idx_plant_companions_plant_name ON plant_companions(plant_name);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_items_updated_at BEFORE UPDATE ON shopping_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 2: Enable RLS and create policies
-- ============================================================================

ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_companions ENABLE ROW LEVEL SECURITY;

-- Plants policies
CREATE POLICY "Users can manage their own plants" ON plants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can manage their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Plant-tasks policies
CREATE POLICY "Users can manage their own plant-task links" ON plant_tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM plants WHERE plants.id = plant_tasks.plant_id AND plants.user_id = auth.uid()));

-- Photos policies
CREATE POLICY "Users can manage their own photos" ON photos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Photo-plants policies
CREATE POLICY "Users can manage their own photo-plant links" ON photo_plants FOR ALL
  USING (EXISTS (SELECT 1 FROM photos WHERE photos.id = photo_plants.photo_id AND photos.user_id = auth.uid()));

-- Shopping items policies
CREATE POLICY "Users can manage their own shopping items" ON shopping_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Harvests policies
CREATE POLICY "Users can manage their own harvests" ON harvests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Plans policies
CREATE POLICY "Users can manage their own plans" ON plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Knowledge articles policies (public read, user-created write)
CREATE POLICY "Anyone can view knowledge articles" ON knowledge_articles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own articles" ON knowledge_articles FOR ALL
  USING (auth.uid() = user_id AND is_user_created = true)
  WITH CHECK (auth.uid() = user_id AND is_user_created = true);

-- Plant companions policies (public read)
CREATE POLICY "Anyone can view plant companions" ON plant_companions FOR SELECT USING (true);

-- STEP 3: Create storage buckets
-- ============================================================================
-- Note: Storage buckets must be created via Supabase Dashboard → Storage
-- Or run this after enabling storage in your project:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('garden-photos', 'garden-photos', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('garden-plans', 'garden-plans', true) ON CONFLICT DO NOTHING;

-- Storage policies will be created automatically when buckets are created via Dashboard

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Gartenplaner Database Setup Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: 11';
  RAISE NOTICE 'RLS policies: Applied';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Go to Storage in Supabase Dashboard';
  RAISE NOTICE '2. Create bucket: garden-photos (public)';
  RAISE NOTICE '3. Create bucket: garden-plans (public)';
  RAISE NOTICE '4. Copy your API credentials to .env file';
  RAISE NOTICE '========================================';
END $$;
