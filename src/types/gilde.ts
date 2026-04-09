export interface GildePlant {
  name: string;
  role: string;
  notes?: string;
}

export interface Gilde {
  id: string;
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

export interface BeetGilde {
  bed_id: string;
  gilde_id: string;
}