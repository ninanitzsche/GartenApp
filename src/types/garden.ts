/**
 * Garden type definition matching Supabase schema
 */
export interface Garden {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  size?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export type GardenFormData = Omit<Garden, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
