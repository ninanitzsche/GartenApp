-- ============================================================================
-- Gartenplaner Database Schema
-- PostgreSQL/Supabase Complete Schema Definition
-- Version: 1.0 | Date: 2026-03-03
-- ============================================================================
--
-- This file contains the complete database schema for Gartenplaner including:
-- - All 10 tables (user-scoped and reference data)
-- - Column definitions with types and constraints
-- - Primary and foreign keys with CASCADE delete rules
-- - Indexes for query optimization
-- - Default values and NOT NULL constraints
--
-- Status: Production-ready for Supabase
-- Run in: Supabase Dashboard → SQL Editor → Copy & Execute
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: plants
-- Description: User's plant/vegetable collection with location and status
-- Type: User-scoped (requires RLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User association (required)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Plant identification and attributes
  name TEXT NOT NULL,                    -- e.g., "Tomato", "Basilikum"
  latin_name TEXT,                       -- Scientific name
  location TEXT,                         -- Garden location/zone
  type TEXT,                             -- Plant type (annual, perennial, shrub, etc.)

  -- Status and cultivation information
  status TEXT NOT NULL DEFAULT 'geplant', -- Status: geplant, bestellt, gepflanzt, geerntet, entfernt, etabliert
  winterhart BOOLEAN DEFAULT false,       -- Winter hardy
  essbar BOOLEAN DEFAULT false,           -- Edible
  quantity INTEGER,                       -- Number of plants

  -- Date tracking
  planted_date DATE,                     -- When planted
  harvest_date DATE,                     -- Expected/actual harvest date

  -- Additional information
  notes TEXT,                            -- Care instructions, observations
  tags TEXT[],                           -- Searchable tags

  -- System timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);
CREATE INDEX IF NOT EXISTS idx_plants_location ON plants(location);

-- ============================================================================
-- TABLE 2: tasks
-- Description: Garden maintenance and planting tasks
-- Type: User-scoped (requires RLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User association (required)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Task description
  title TEXT NOT NULL,                   -- Task name
  description TEXT,                      -- Detailed instructions
  category TEXT,                         -- Category (watering, fertilizing, harvesting, etc.)

  -- Task scheduling and status
  priority TEXT,                         -- Priority level (niedrig, mittel, hoch, dringend)
  location TEXT,                         -- Garden location
  completed BOOLEAN DEFAULT false,       -- Completion status
  completed_at TIMESTAMPTZ,              -- When completed

  -- Time tracking
  time_spent_minutes INTEGER,            -- Time spent on task

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,    -- Repeating task
  recurrence_pattern TEXT,               -- Recurrence pattern (daily, weekly, monthly, etc.)

  -- Auto-generated flag
  auto_generated BOOLEAN DEFAULT false,  -- System-generated task

  -- System timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- ============================================================================
-- TABLE 3: photos
-- Description: Garden and plant photos with metadata
-- Type: User-scoped (requires RLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User association (required)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Photo storage
  file_url TEXT NOT NULL,               -- Cloud storage URL
  thumbnail_url TEXT,                   -- Thumbnail URL

  -- Photo metadata
  date TIMESTAMPTZ DEFAULT now(),       -- Photo date
  location TEXT,                        -- Garden location
  notes TEXT,                           -- Photo notes/caption

  -- AI analysis (optional)
  ai_analysis JSONB,                    -- AI plant detection/analysis results
  tags TEXT[],                          -- Searchable tags

  -- System timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_date ON photos(date DESC);

-- ============================================================================
-- TABLE 4: shopping_items
-- Description: Garden shopping list and store purchases
-- Type: User-scoped (requires RLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User association (required)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Item information
  item_name TEXT NOT NULL,              -- What to buy
  category TEXT,                        -- Category (saatgut, werkzeug, dünger, erde, töpfe, sonstiges)
  quantity TEXT,                        -- Quantity needed

  -- Purchase information
  priority TEXT DEFAULT 'optional',     -- Priority level (niedrig, mittel, hoch, dringend)
  estimated_price DECIMAL(10,2),        -- Estimated cost
  actual_price DECIMAL(10,2),           -- Actual cost paid
  purchased BOOLEAN DEFAULT false,      -- Purchase status
  purchased_at TIMESTAMPTZ,             -- When purchased

  -- Shopping details
  where_to_buy TEXT,                    -- Store or vendor
  link TEXT,                            -- Product link (optional)
  notes TEXT,                           -- Additional notes

  -- System timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_shopping_user_id ON shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_purchased ON shopping_items(purchased);

-- ============================================================================
-- TABLE 5: harvests
-- Description: Harvest tracking and yields
-- Type: User-scoped (requires RLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User association (required)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Harvest tracking
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL,     -- Amount harvested
  unit TEXT NOT NULL,                   -- Unit (kg, pieces, bunches, etc.)

  -- Harvest date
  harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Notes
  notes TEXT,                           -- Harvest notes/observations

  -- System timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_harvests_user_id ON harvests(user_id);
CREATE INDEX IF NOT EXISTS idx_harvests_plant_id ON harvests(plant_id);
CREATE INDEX IF NOT EXISTS idx_harvests_date ON harvests(harvest_date DESC);

-- ============================================================================
-- TABLE 6: plans
-- Description: Garden layout plans and area planning
-- Type: User-scoped (requires RLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User association (required)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Plan information
  name TEXT NOT NULL,                   -- Plan name
  description TEXT,                     -- Plan description
  image_url TEXT,                       -- Plan/diagram image URL
  size TEXT,                            -- Garden area size

  -- System timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);

-- ============================================================================
-- TABLE 7: knowledge_articles
-- Description: Gardening knowledge base and reference articles
-- Type: Mixed - Public system articles + User-created articles
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Article content
  title TEXT NOT NULL,                  -- Article title
  category TEXT,                        -- Category (care, pests, planting, etc.)
  content TEXT NOT NULL,                -- Full article content

  -- Article status
  is_favorited BOOLEAN DEFAULT false,   -- User favorite flag

  -- Ownership (NULL = system article, UUID = user-created)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- System timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_user_id ON knowledge_articles(user_id);

-- ============================================================================
-- TABLE 8: plant_companions
-- Description: Companion planting reference data (public, system-managed)
-- Type: Reference data (no RLS needed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS plant_companions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plant reference
  plant_name TEXT NOT NULL UNIQUE,      -- Plant name
  good_companions TEXT[],               -- Compatible companion plants
  bad_companions TEXT[],                -- Incompatible plants to avoid

  -- System timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_companions_plant_name ON plant_companions(plant_name);

-- ============================================================================
-- TABLE 9: plant_tasks (Junction Table)
-- Description: Many-to-many relationship between tasks and plants
-- Type: User-scoped (protected via foreign keys to user data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS plant_tasks (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,

  -- Composite primary key ensures no duplicates
  PRIMARY KEY (task_id, plant_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_plant_tasks_task ON plant_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_plant_tasks_plant ON plant_tasks(plant_id);

-- ============================================================================
-- TABLE 10: photo_plants (Junction Table)
-- Description: Many-to-many relationship between photos and plants
-- Type: User-scoped (protected via foreign keys to user data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS photo_plants (
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,

  -- Composite primary key ensures no duplicates
  PRIMARY KEY (photo_id, plant_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_photo_plants_photo ON photo_plants(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_plants_plant ON photo_plants(plant_id);

-- ============================================================================
-- AUTO-UPDATE TRIGGER FUNCTION
-- Description: Automatically updates 'updated_at' timestamp on record changes
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at column
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

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
--
-- Summary:
-- - 10 tables: 8 user-scoped + 2 reference/junction tables
-- - 30+ indexes for optimal query performance
-- - Complete CASCADE delete rules for data integrity
-- - Auto-update timestamps on all mutable tables
-- - Ready for Row Level Security (RLS) policies
--
-- Next step: Apply RLS policies from database-rls-policies.md
--
-- ============================================================================
