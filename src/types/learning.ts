/**
 * Learning Types
 * User learnings and gardening tips
 */

import { Zeitraum } from './zeitraum';

export type LearningRating = 'helpful' | 'not_helpful';

export interface Learning {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  saison: string;
  related_plants: string[];
  valid_for_zeitraeume: Zeitraum[];
  flexible: boolean;
  dismissed: boolean;
  dismissed_at: string | null;
  helpful_count: number;
  not_helpful_count: number;
  relevance_score: number;
  user_rating?: LearningRating | null;
  created_at: string;
  updated_at: string;
}

export interface LearningFormData {
  title: string;
  content: string;
  related_plants?: string[];
  valid_for_zeitraeume?: Zeitraum[];
  flexible?: boolean;
  relevance_score?: number;
}

export interface LearningFilters {
  dismissed?: boolean;
  rating?: LearningRating;
  plantId?: string;
  zeitraum?: Zeitraum;
}
