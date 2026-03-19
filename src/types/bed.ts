/**
 * Bed type definition matching Supabase schema
 */
export interface Bed {
  id: string;
  user_id: string;
  garden_id?: string;
  name: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  color?: string;
  shape?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type BedFormData = Omit<Bed, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const BED_SHAPES = [
  { label: 'Rechteck', value: 'rectangle' },
  { label: 'Kreis', value: 'circle' },
];

export const BED_COLORS = [
  { label: 'Grün', value: '#4CAF50' },
  { label: 'Braun', value: '#8D6E63' },
  { label: 'Blau', value: '#2196F3' },
  { label: 'Orange', value: '#FF9800' },
];
