/**
 * Plant Companion Type
 * Companion planting information for plants
 */

export interface PlantCompanion {
  id: string;
  plant_name: string;
  good_companions: string[];
  bad_companions: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CompanionInfo {
  plant: string;
  goodCompanions: string[];
  badCompanions: string[];
}
