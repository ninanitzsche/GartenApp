/**
 * Companion Planting Service
 * Read-only service for companion planting information
 */

import { supabase } from './supabase';
import { PlantCompanion } from '../types/companion';

/**
 * Get companion information for a plant by name
 * @param plantName - Name of the plant to look up
 * @returns Companion data or null if not found
 */
export async function getCompanionsByPlantName(
  plantName: string
): Promise<PlantCompanion | null> {
  try {
    if (!plantName || plantName.trim().length === 0) {
      return null;
    }

    const { data, error } = await supabase
      .from('plant_companions')
      .select('*')
      .ilike('plant_name', plantName)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected
      throw error;
    }

    return (data || null) as PlantCompanion | null;
  } catch (error: any) {
    console.error(`Error fetching companions for plant "${plantName}":`, error.message);
    return null;
  }
}

/**
 * Get all companion planting entries
 * @returns Array of all companion plants
 */
export async function getAllCompanions(): Promise<PlantCompanion[]> {
  try {
    const { data, error } = await supabase
      .from('plant_companions')
      .select('*')
      .order('plant_name', { ascending: true });

    if (error) throw error;

    return (data || []) as PlantCompanion[];
  } catch (error: any) {
    console.error('Error fetching all companions:', error.message);
    return [];
  }
}

/**
 * Search companions by plant name
 * @param query - Partial plant name to search for
 * @returns Array of matching companions
 */
export async function searchCompanions(query: string): Promise<PlantCompanion[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('plant_companions')
      .select('*')
      .ilike('plant_name', `%${query}%`)
      .order('plant_name', { ascending: true });

    if (error) throw error;

    return (data || []) as PlantCompanion[];
  } catch (error: any) {
    console.error('Error searching companions:', error.message);
    return [];
  }
}

/**
 * Check if two plants are compatible
 * @param plantName1 - First plant name
 * @param plantName2 - Second plant name to check compatibility with
 * @returns true if compatible (good companions), false if incompatible (bad companions), null if no data
 */
export async function areCompanionsCompatible(
  plantName1: string,
  plantName2: string
): Promise<boolean | null> {
  try {
    const companions = await getCompanionsByPlantName(plantName1);
    if (!companions) return null;

    // Check if plantName2 is in bad companions (incompatible)
    if (
      companions.bad_companions &&
      companions.bad_companions.some(
        (name) => name.toLowerCase() === plantName2.toLowerCase()
      )
    ) {
      return false;
    }

    // Check if plantName2 is in good companions (compatible)
    if (
      companions.good_companions &&
      companions.good_companions.some(
        (name) => name.toLowerCase() === plantName2.toLowerCase()
      )
    ) {
      return true;
    }

    // No information about this pairing
    return null;
  } catch (error: any) {
    console.error('Error checking companion compatibility:', error.message);
    return null;
  }
}
