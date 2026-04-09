/**
 * Knowledge Articles from PDF extraction
 */

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: 'pflege' | 'schädlinge' | 'pflanzen' | 'ernte' | 'boden' | 'sonstiges';
  tags: string[];
  sourceType: 'pdf';
  sourceFile: string;
  relatedPlants: string[];
  created_at: string;
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [];
