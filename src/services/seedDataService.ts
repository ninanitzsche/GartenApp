/**
 * Seed Data Import Service
 * Handles importing seed data with progress tracking
 *
 * Features:
 * - Idempotent import (safe to run multiple times)
 * - Progress tracking for UI updates
 * - Batch operations via upsert
 * - Tracks import status in AsyncStorage
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
 * Import seed data with progress callback (idempotent)
 *
 * Uses upsert to ensure:
 * 1. No duplicate key errors
 * 2. Idempotent (safe to run multiple times)
 * 3. Can update existing plants
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

    // Import plants one by one with progress tracking
    for (let i = 0; i < allPlants.length; i++) {
      const plant = allPlants[i];

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          message: `Synchronisiere ${plant.name}...`
        });
      }

      // Use upsert for idempotency
      const { error } = await supabase
        .from('plants')
        .upsert(
          [{
            ...plant,
            user_id: user.id,
            menge: plant.quantity || plant.menge || 1
          }],
          {
            onConflict: 'name',
            ignoreDuplicates: false
          }
        );

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

    const message = imported > 0
      ? `✅ ${imported} von ${total} Pflanzen importiert`
      : '❌ Import fehlgeschlagen';

    console.log(message);

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
 * Import seed data in bulk (faster, but shows less progress)
 * Better for automated scenarios
 */
export async function importSeedDataBulk(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be logged in to import seed data');
    }

    const allPlants = [...ESTABLISHED_PLANTS, ...PLANNED_PLANTS]
      .map(plant => ({
        ...plant,
        user_id: user.id,
        menge: plant.quantity || plant.menge || 1
      }));

    // Bulk upsert all plants at once
    const { data, error } = await supabase
      .from('plants')
      .upsert(allPlants, {
        onConflict: 'name',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      throw error;
    }

    // Mark as imported
    await markSeedDataAsImported();

    const count = data?.length || allPlants.length;
    console.log(`✅ Bulk imported: ${count} plants`);

    return {
      success: true,
      count
    };
  } catch (error: any) {
    console.error('Error in bulk import:', error);
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
    console.log('🔄 Import status reset - will reimport on next app start');
  } catch (error) {
    console.error('Error resetting import status:', error);
    throw error;
  }
}
