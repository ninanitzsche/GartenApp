-- Add new fields for manual entries feature
ALTER TABLE knowledge_articles 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_file VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS topic VARCHAR(100);

-- Create index for topic queries
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_topic ON knowledge_articles(topic);

-- Create index for source_type queries  
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_source_type ON knowledge_articles(source_type);
