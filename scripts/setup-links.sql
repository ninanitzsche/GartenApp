-- Add links between tasks and knowledge articles
-- Run in Supabase SQL Editor

-- Add knowledge_article_id field to tasks table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS knowledge_article_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Add task_ids field to knowledge_articles table
ALTER TABLE public.knowledge_articles
ADD COLUMN IF NOT EXISTS related_task_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Add plant_ids field to knowledge_articles table
ALTER TABLE public.knowledge_articles
ADD COLUMN IF NOT EXISTS plant_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_knowledge_articles ON public.tasks USING GIN(knowledge_article_ids);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_tasks ON public.knowledge_articles USING GIN(related_task_ids);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_plants ON public.knowledge_articles USING GIN(plant_ids);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('tasks', 'knowledge_articles')
  AND column_name IN ('knowledge_article_ids', 'related_task_ids', 'plant_ids')
ORDER BY table_name, column_name;
