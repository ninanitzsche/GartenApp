-- Add scheduled_date column to tasks table
-- Run this in: Supabase Dashboard → SQL Editor

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_date DATE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);

-- Verify the column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'scheduled_date';
