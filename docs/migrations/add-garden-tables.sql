-- Migration: Add Garden Overview Feature (Sprint 7)
-- Description: Create tables for gardens and beds with interactive map positioning

-- Create gardens table
CREATE TABLE IF NOT EXISTS public.gardens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mein Garten',
  description TEXT,
  size TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create beds table
CREATE TABLE IF NOT EXISTS public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES public.gardens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,

  -- Position (x, y in percentage 0-100 for responsive layout)
  position_x DECIMAL(5,2) DEFAULT 50,
  position_y DECIMAL(5,2) DEFAULT 50,

  -- Size (width, height in percentage)
  width DECIMAL(5,2) DEFAULT 20,
  height DECIMAL(5,2) DEFAULT 15,

  -- Visual properties
  color TEXT DEFAULT '#4CAF50',
  shape TEXT DEFAULT 'rectangle',

  -- Additional info
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create junction table for bed-plant relationships
CREATE TABLE IF NOT EXISTS public.bed_plants (
  bed_id UUID NOT NULL REFERENCES public.beds(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (bed_id, plant_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gardens_user_id ON public.gardens(user_id);
CREATE INDEX IF NOT EXISTS idx_beds_user_id ON public.beds(user_id);
CREATE INDEX IF NOT EXISTS idx_beds_garden_id ON public.beds(garden_id);
CREATE INDEX IF NOT EXISTS idx_bed_plants_bed ON public.bed_plants(bed_id);
CREATE INDEX IF NOT EXISTS idx_bed_plants_plant ON public.bed_plants(plant_id);

-- Enable Row Level Security
ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_plants ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Gardens - Users can only see/edit their own gardens
CREATE POLICY gardens_user_policy ON public.gardens
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policy: Beds - Users can only see/edit their own beds
CREATE POLICY beds_user_policy ON public.beds
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policy: Bed Plants - Users can only see plants in their beds
CREATE POLICY bed_plants_user_policy ON public.bed_plants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.beds
      WHERE public.beds.id = public.bed_plants.bed_id
      AND public.beds.user_id = auth.uid()
    )
  );

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gardens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.beds TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bed_plants TO authenticated;

-- Verify creation
SELECT 'Gardens table created' as status
UNION ALL
SELECT 'Beds table created' as status
UNION ALL
SELECT 'Bed_plants table created' as status;
