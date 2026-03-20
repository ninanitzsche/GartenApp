/**
 * Plant Companion Type
 * Companion planting information for plants
 */

export interface PlantCompanion {
  id: string;
  plant_name: string;
  plant_name_de?: string;
  category?: 'gemüse' | 'kräuter' | 'blumen' | 'obst';
  good_companions: string[];
  good_reasons?: string[];
  bad_companions: string[];
  bad_reasons?: string[];
  distance_cm?: number;
  nitrogen_fixer?: boolean;
  pest_repellent?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CompanionInfo {
  plant: string;
  goodCompanions: string[];
  badCompanions: string[];
}
