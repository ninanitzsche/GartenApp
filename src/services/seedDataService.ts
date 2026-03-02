/**
 * Seed Data Import Service
 * Handles importing seed data with progress tracking
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { ESTABLISHED_PLANTS, PLANNED_PLANTS } from '../utils/seedData';

const SEED_DATA_IMPORTED_KEY = '@gartenplaner:seed_data_imported';

export interface ImportProgress {
  current: number;
  total: number;
  message: string;
}

/**
 * Check if seed data has already been imported
 */
export async function hasSeedDataBeenImported(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(SEED_DATA_IMPORTED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking seed data import status:', error);
    return false;
  }
}

/**
 * Mark seed data as imported
 */
export async function markSeedDataAsImported(): Promise<void> {
  try {
    await AsyncStorage.setItem(SEED_DATA_IMPORTED_KEY, 'true');
  } catch (error) {
    console.error('Error marking seed data as imported:', error);
    throw error;
  }
}

/**
 * Import seed data with progress callback
 */
export async function importSeedData(
  onProgress?: (progress: ImportProgress) => void
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be logged in to import seed data');
    }

    const allPlants = [...ESTABLISHED_PLANTS, ...PLANNED_PLANTS];
    const total = allPlants.length;
    let imported = 0;

    // Import plants one by one to track progress
    for (let i = 0; i < allPlants.length; i++) {
      const plant = allPlants[i];

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          message: `Importiere ${plant.name}...`
        });
      }

      const { error } = await supabase
        .from('plants')
        .insert([{
          ...plant,
          user_id: user.id
        }]);

      if (error) {
        console.error(`Error importing plant ${plant.name}:`, error);
        // Continue with next plant even if one fails
      } else {
        imported++;
      }
    }

    // Mark as imported
    await markSeedDataAsImported();

    if (onProgress) {
      onProgress({
        current: total,
        total,
        message: 'Import abgeschlossen!'
      });
    }

    return {
      success: imported > 0,
      count: imported
    };
  } catch (error: any) {
    console.error('Error importing seed data:', error);
    return {
      success: false,
      count: 0,
      error: error.message || 'Fehler beim Importieren der Daten'
    };
  }
}

/**
 * Reset import status (for testing/manual re-import)
 */
export async function resetImportStatus(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SEED_DATA_IMPORTED_KEY);
  } catch (error) {
    console.error('Error resetting import status:', error);
    throw error;
  }
}
