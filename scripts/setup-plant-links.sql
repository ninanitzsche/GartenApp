-- Add knowledge_article_ids field to plants table
ALTER TABLE public.plants
ADD COLUMN IF NOT EXISTS knowledge_article_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_plants_knowledge_articles ON public.plants USING GIN(knowledge_article_ids);

-- Verify column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'plants'
  AND column_name = 'knowledge_article_ids';
