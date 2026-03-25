export interface Learning {
  id: string;
  user_id: string;
  source_type: 'knowledge_base' | 'manual';
  source_id?: string;
  source_name?: string;
  title: string;
  content?: string;
  related_plants: string[];
  related_categories: string[];
  valid_for_zeitraeume: string[];
  relevance_score: number;
  created_at: string;
  updated_at?: string;
  user_rating?: 'helpful' | 'not_helpful';
  dismissed: boolean;
  flexible?: boolean;
}

export type LearningRating = 'helpful' | 'not_helpful';

export interface LearningFormData {
  title: string;
  content?: string;
  related_plants?: string[];
  related_categories?: string[];
  valid_for_zeitraeume?: string[];
  flexible?: boolean;
  relevance_score?: number;
  source_type?: 'knowledge_base' | 'manual';
  source_id?: string;
  source_name?: string;
}