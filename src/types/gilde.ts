export interface GildePlant {
  name: string;
  role: string;
  notes?: string;
}

export interface Gilde {
  id: string;
  cover_photo_url?: string;
  number?: number;
  name: string;
  concept: string;
  plants: GildePlant[];
  standort?: string;
  tips?: string[];
  is_system: boolean;
  user_id?: string;
  created_at?: string;
}

export interface GildeRating {
  id: string;
  bed_id: string;
  gilde_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BeetGilde {
  bed_id: string;
  gilde_id: string;
}

export interface BeetGildeWithRating extends BeetGilde {
  rating?: GildeRating;
  gilde?: Gilde;
}