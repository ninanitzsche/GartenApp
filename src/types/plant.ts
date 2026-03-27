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
  identification_source?: 'ai' | 'manual';
  identified_at?: string;
  plantnet_id?: string;
  plantnet_data?: any;
  plantnet_fetched_at?: string;
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
  identification_source?: 'ai' | 'manual';
}

export const PLANT_STATUSES = [
  { label: 'Geplant', value: 'geplant' },
  { label: 'Bestellt', value: 'bestellt' },
  { label: 'Ausgesät', value: 'ausgesät' },
  { label: 'Pikiert', value: 'pikiert' },
  { label: 'Ausgepflanzt', value: 'ausgepflanzt' },
  { label: 'Etabliert', value: 'etabliert' },
  { label: 'Geerntet', value: 'geerntet' },
  { label: 'Unklar', value: 'unklar' },
  { label: 'Entfernt', value: 'entfernt' },
];

export const PLANT_TYPES = [
  { label: 'Einjährig', value: 'einjährig' },
  { label: 'Mehrjährig', value: 'mehrjährig' },
  { label: 'Staude', value: 'staude' },
  { label: 'Strauch', value: 'strauch' },
  { label: 'Baum', value: 'baum' },
];
