/**
 * Photo type definitions matching Supabase schema
 */

export enum PhotoFilters {
  ALL = 'ALL',
  AI_ANALYZED = 'AI_ANALYZED',
  MANUAL = 'MANUAL',
}

export interface Photo {
  id: string;
  file_url?: string;
  photo_url?: string;
  thumbnail_url?: string;
  date?: string;
  location?: string;
  notes?: string;
  plant_id: string;
  user_id: string;
  ai_analysis?: any;
  ai_analysis_ids?: string[];
  has_ai_analysis?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PhotoPlant {
  photo_id: string;
  plant_id: string;
  photos?: Photo;
}

export interface PhotoPlant {
  photo_id: string;
  plant_id: string;
  photos?: Photo; // For joined queries
}
