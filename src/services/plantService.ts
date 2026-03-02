/**
 * Plant CRUD Service
 * Handles all database operations for plants
 */
import { supabase } from './supabase';
import { Plant, PlantFormData } from '../types/plant';

export interface PlantFilters {
  searchQuery?: string;
  status?: string;
  location?: string;
  type?: string;
}

/**
 * Fetch all plants for current user with optional filters
 */
export async function fetchPlants(filters?: PlantFilters): Promise<Plant[]> {
  let query = supabase
    .from('plants')
    .select('*');

  // Apply filters if provided
  if (filters?.searchQuery) {
    query = query.or(`name.ilike.%${filters.searchQuery}%,latin_name.ilike.%${filters.searchQuery}%`);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.location) {
    query = query.eq('location', filters.location);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching plants:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch single plant by ID
 */
export async function fetchPlant(id: string): Promise<Plant | null> {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching plant:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new plant
 */
export async function createPlant(plantData: PlantFormData): Promise<Plant> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be logged in to create plants');
  }

  const { data, error } = await supabase
    .from('plants')
    .insert([
      {
        ...plantData,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating plant:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing plant
 */
export async function updatePlant(id: string, plantData: PlantFormData): Promise<Plant> {
  const { data, error } = await supabase
    .from('plants')
    .update(plantData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating plant:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a plant
 */
export async function deletePlant(id: string): Promise<void> {
  const { error } = await supabase
    .from('plants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting plant:', error);
    throw error;
  }
}

/**
 * Search plants by name
 */
export async function searchPlants(query: string): Promise<Plant[]> {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching plants:', error);
    throw error;
  }

  return data || [];
}

/**
 * Filter plants by status
 */
export async function filterPlantsByStatus(status: string): Promise<Plant[]> {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error filtering plants:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get unique locations from all plants
 */
export async function getUniqueLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('plants')
    .select('location')
    .not('location', 'is', null);

  if (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }

  const locations = data
    .map(item => item.location)
    .filter((location, index, self) => location && self.indexOf(location) === index)
    .sort();

  return locations;
}
