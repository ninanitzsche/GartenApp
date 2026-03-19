/**
 * Knowledge Article Types
 * Reference articles for gardening knowledge base
 */

export const KNOWLEDGE_CATEGORIES = [
  'pflege',
  'schädlinge',
  'pflanzen',
  'ernte',
  'boden',
  'sonstiges',
] as const;

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  user_id: null; // System articles only (not user-created)
  created_at: string;
  updated_at?: string;
}

export interface KnowledgeFilters {
  category?: KnowledgeCategory;
  searchQuery?: string;
}

export interface KnowledgeSearchResult extends KnowledgeArticle {
  preview?: string; // First 100 chars of content
}
