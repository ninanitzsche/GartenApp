-- Add openai_care column to plants table for AI-generated care data
ALTER TABLE plants ADD COLUMN IF NOT EXISTS openai_care JSONB;
