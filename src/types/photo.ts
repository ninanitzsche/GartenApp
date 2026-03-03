/**
 * Photo type definitions matching Supabase schema
 */

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
  created_at?: string;
  updated_at?: string;
}

export interface PhotoPlant {
  photo_id: string;
  plant_id: string;
  photos?: Photo; // For joined queries
}
