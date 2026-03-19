/**
 * Garden CRUD Service
 * Handles all database operations for gardens
 */
import { supabase } from './supabase';
import { Garden, GardenFormData } from '../types/garden';

/**
 * Fetch user's garden (typically one per user)
 * Creates a default garden if none exists
 */
export async function fetchGarden(): Promise<Garden | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be logged in to fetch garden');
  }

  const { data, error } = await supabase
    .from('gardens')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is expected on first load
    throw error;
  }

  // If no garden exists, create default one
  if (!data) {
    return createGarden({ name: 'Mein Garten' });
  }

  return data;
}

/**
 * Create a new garden
 */
export async function createGarden(gardenData: GardenFormData): Promise<Garden> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be logged in to create a garden');
  }

  const { data, error } = await supabase
    .from('gardens')
    .insert([
      {
        ...gardenData,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating garden:', error);
    throw error;
  }

  return data;
}

/**
 * Update garden metadata
 */
export async function updateGarden(id: string, gardenData: GardenFormData): Promise<Garden> {
  const { data, error } = await supabase
    .from('gardens')
    .update(gardenData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating garden:', error);
    throw error;
  }

  return data;
}

/**
 * Delete garden
 */
export async function deleteGarden(id: string): Promise<void> {
  const { error } = await supabase
    .from('gardens')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting garden:', error);
    throw error;
  }
}
