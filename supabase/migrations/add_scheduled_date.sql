-- Add scheduled_date column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS scheduled_date DATE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON public.tasks(scheduled_date);
