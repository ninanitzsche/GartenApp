/**
 * Harvest Type Definitions
 * Matches Supabase harvests table schema
 */

export const HARVEST_UNITS = ['kg', 'g', 'Stück', 'Bund', 'Liter'] as const;
export type HarvestUnit = (typeof HARVEST_UNITS)[number];

export interface Harvest {
  id: string;
  user_id: string;
  plant_id: string;
  quantity: number;
  unit: HarvestUnit;
  harvest_date: string; // ISO date string (YYYY-MM-DD)
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  plant_name?: string; // For display, not from DB
}

export interface HarvestFormData {
  plant_id: string;
  quantity: number;
  unit: HarvestUnit;
  harvest_date: string; // ISO date string
  notes?: string;
}

export interface HarvestWithPlant extends Harvest {
  plant_name: string;
}

export interface HarvestTotal {
  unit: HarvestUnit;
  quantity: number;
}

export interface HarvestStats {
  totalHarvests: number;
  totalQuantity: number;
  unit: HarvestUnit;
  lastHarvestDate?: string;
  averageQuantityPerHarvest: number;
}
