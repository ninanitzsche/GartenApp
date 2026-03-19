/**
 * Bed CRUD Service
 * Handles all database operations for beds and bed-plant relationships
 */
import { supabase } from './supabase';
import { Bed, BedFormData } from '../types/bed';
import { Plant } from '../types/plant';

/**
 * Fetch all beds for user, optionally filtered by garden
 */
export async function fetchBeds(gardenId?: string): Promise<Bed[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be logged in to fetch beds');
  }

  let query = supabase
    .from('beds')
    .select('*')
    .eq('user_id', user.id);

  if (gardenId) {
    query = query.eq('garden_id', gardenId);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Fetch single bed by ID
 */
export async function fetchBed(id: string): Promise<Bed | null> {
  const { data, error } = await supabase
    .from('beds')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching bed:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new bed
 */
export async function createBed(bedData: BedFormData): Promise<Bed> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be logged in to create a bed');
  }

  const { data, error } = await supabase
    .from('beds')
    .insert([
      {
        ...bedData,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating bed:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing bed
 */
export async function updateBed(id: string, bedData: BedFormData): Promise<Bed> {
  const { data, error } = await supabase
    .from('beds')
    .update(bedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating bed:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a bed
 */
export async function deleteBed(id: string): Promise<void> {
  const { error } = await supabase
    .from('beds')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting bed:', error);
    throw error;
  }
}

/**
 * Link a plant to a bed
 */
export async function linkBedToPlant(bedId: string, plantId: string): Promise<void> {
  const { data, error } = await supabase
    .from('bed_plants')
    .insert([{ bed_id: bedId, plant_id: plantId }])
    .select();

  if (error) {
    throw error;
  }
}

/**
 * Unlink a plant from a bed
 */
export async function unlinkBedFromPlant(bedId: string, plantId: string): Promise<void> {
  const { error } = await supabase
    .from('bed_plants')
    .delete()
    .eq('bed_id', bedId)
    .eq('plant_id', plantId);

  if (error) {
    console.error('Error unlinking plant from bed:', error);
    throw error;
  }
}

/**
 * Fetch all plants in a specific bed
 */
export async function fetchBedPlants(bedId: string): Promise<Plant[]> {
  const { data, error } = await supabase
    .from('bed_plants')
    .select('plant_id')
    .eq('bed_id', bedId);

  if (error) {
    console.error(`Error fetching bed_plants:`, error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Fetch full plant details for all plant IDs
  const plantIds = data.map(item => item.plant_id);
  const { data: plants, error: plantsError } = await supabase
    .from('plants')
    .select('*')
    .in('id', plantIds);

  if (plantsError) {
    console.error(`Error fetching plant details:`, plantsError);
    throw plantsError;
  }

  return plants || [];
}

/**
 * Get count of plants in a bed
 */
export async function getBedPlantCount(bedId: string): Promise<number> {
  const { data, error, count } = await supabase
    .from('bed_plants')
    .select('*', { count: 'exact', head: true })
    .eq('bed_id', bedId);

  if (error) {
    console.error(`Error fetching plant count:`, error);
    throw error;
  }

  return count || 0;
}
