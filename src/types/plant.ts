/**
 * Plant type definition matching Supabase schema
 */
export interface Plant {
  id: string;
  name: string;
  latin_name?: string;
  location?: string;
  type?: string;
  status: string;
  winterhart?: boolean;
  essbar?: boolean;
  quantity?: number;
  planted_date?: string;
  harvest_date?: string;
  notes?: string;
  tags?: string[];
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlantFormData {
  name: string;
  latin_name?: string;
  location?: string;
  type?: string;
  status: string;
  winterhart?: boolean;
  essbar?: boolean;
  quantity?: number;
  planted_date?: string;
  harvest_date?: string;
  notes?: string;
  tags?: string[];
}

export const PLANT_STATUSES = [
  { label: 'Etabliert', value: 'etabliert' },
  { label: 'Geplant', value: 'geplant' },
  { label: 'Bestellt', value: 'bestellt' },
  { label: 'Gepflanzt', value: 'gepflanzt' },
  { label: 'Geerntet', value: 'geerntet' },
  { label: 'Entfernt', value: 'entfernt' },
];

export const PLANT_TYPES = [
  { label: 'Einjährig', value: 'einjährig' },
  { label: 'Mehrjährig', value: 'mehrjährig' },
  { label: 'Staude', value: 'staude' },
  { label: 'Strauch', value: 'strauch' },
  { label: 'Baum', value: 'baum' },
];
