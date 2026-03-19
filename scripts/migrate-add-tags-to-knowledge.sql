-- Add tags column to knowledge_articles table
ALTER TABLE knowledge_articles
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for tag search
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON knowledge_articles USING GIN(tags);

-- Add comment
COMMENT ON COLUMN knowledge_articles.tags IS 'Array of searchable tags (e.g., [''permakultur'', ''low-maintenance''])';
