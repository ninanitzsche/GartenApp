/**
 * Harvest Service
 * Handles harvest logging and tracking
 * Integrates with plant status updates
 */

import { supabase } from './supabase';
import { Harvest, HarvestFormData, HarvestWithPlant, HarvestTotal } from '../types/harvest';
import * as plantService from './plantService';

/**
 * Fetch all harvests for current user
 * Sorted by harvest_date descending (newest first)
 */
export async function fetchHarvests(filters?: {
  plantId?: string;
}): Promise<HarvestWithPlant[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    let query = supabase
      .from('harvests')
      .select(`*, plants(name)`)
      .eq('user_id', user.id)
      .order('harvest_date', { ascending: false });

    if (filters?.plantId) {
      query = query.eq('plant_id', filters.plantId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return ((data || []) as any[]).map((h) => ({
      ...h,
      plant_name: h.plants?.name || 'Unknown Plant',
    }));
  } catch (error: any) {
    throw new Error(`Error fetching harvests: ${error.message}`);
  }
}

/**
 * Fetch single harvest by ID
 */
export async function fetchHarvest(harvestId: string): Promise<HarvestWithPlant | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('harvests')
      .select(`*, plants(name)`)
      .eq('id', harvestId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) return null;

    return {
      ...(data as any),
      plant_name: (data as any).plants?.name || 'Unknown Plant',
    };
  } catch (error: any) {
    throw new Error(`Error fetching harvest: ${error.message}`);
  }
}

/**
 * Create new harvest and auto-update plant status to "geerntet"
 */
export async function createHarvest(formData: HarvestFormData): Promise<Harvest> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // Validate required fields
    if (!formData.plant_id || formData.plant_id.trim().length === 0) {
      throw new Error('Plant selection is required');
    }
    if (!formData.quantity || formData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (!formData.unit || formData.unit.trim().length === 0) {
      throw new Error('Unit is required');
    }
    if (!formData.harvest_date || formData.harvest_date.trim().length === 0) {
      throw new Error('Harvest date is required');
    }

    // Insert harvest
    const { data, error } = await supabase
      .from('harvests')
      .insert({
        user_id: user.id,
        plant_id: formData.plant_id,
        quantity: formData.quantity,
        unit: formData.unit,
        harvest_date: formData.harvest_date,
        notes: formData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to create harvest');

    const harvest = data[0] as Harvest;

    // Auto-update plant status to "geerntet"
    try {
      await plantService.updatePlantStatus(formData.plant_id, 'geerntet');
    } catch (statusError) {
      console.error('Warning: Could not auto-update plant status:', statusError);
      // Don't fail harvest creation if status update fails
    }

    return harvest;
  } catch (error: any) {
    throw new Error(`Error creating harvest: ${error.message}`);
  }
}

/**
 * Update existing harvest
 */
export async function updateHarvest(harvestId: string, formData: HarvestFormData): Promise<Harvest> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // Validate required fields
    if (!formData.quantity || formData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const { data, error } = await supabase
      .from('harvests')
      .update({
        quantity: formData.quantity,
        unit: formData.unit,
        harvest_date: formData.harvest_date,
        notes: formData.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', harvestId)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to update harvest');

    return data[0] as Harvest;
  } catch (error: any) {
    throw new Error(`Error updating harvest: ${error.message}`);
  }
}

/**
 * Delete harvest by ID
 */
export async function deleteHarvest(harvestId: string): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('harvests')
      .delete()
      .eq('id', harvestId)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error: any) {
    throw new Error(`Error deleting harvest: ${error.message}`);
  }
}

/**
 * Get all harvests for a specific plant
 */
export async function getHarvestsByPlant(plantId: string): Promise<Harvest[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('harvests')
      .select('*')
      .eq('user_id', user.id)
      .eq('plant_id', plantId)
      .order('harvest_date', { ascending: false });

    if (error) throw error;

    return (data || []) as Harvest[];
  } catch (error: any) {
    throw new Error(`Error fetching harvests by plant: ${error.message}`);
  }
}

/**
 * Get total harvest quantity for a plant, grouped by unit
 * Returns array of quantities per unit type
 */
export async function getTotalHarvestByPlant(
  plantId: string
): Promise<HarvestTotal[]> {
  try {
    const harvests = await getHarvestsByPlant(plantId);

    // Group by unit and sum quantities
    const totals: Record<string, number> = {};

    harvests.forEach((h) => {
      totals[h.unit] = (totals[h.unit] || 0) + h.quantity;
    });

    return Object.entries(totals).map(([unit, quantity]) => ({
      unit: unit as any,
      quantity,
    }));
  } catch (error: any) {
    throw new Error(`Error calculating total harvest: ${error.message}`);
  }
}

/**
 * Get harvest statistics for a plant
 */
export async function getHarvestStatsForPlant(
  plantId: string,
  unit?: string
): Promise<{ count: number; total: number; average: number; lastDate?: string } | null> {
  try {
    const harvests = await getHarvestsByPlant(plantId);

    if (harvests.length === 0) return null;

    // Filter by unit if specified
    const filtered = unit ? harvests.filter((h) => h.unit === unit) : harvests;

    if (filtered.length === 0) return null;

    const total = filtered.reduce((sum, h) => sum + h.quantity, 0);

    return {
      count: filtered.length,
      total,
      average: total / filtered.length,
      lastDate: filtered[0]?.harvest_date,
    };
  } catch (error: any) {
    console.error('Error calculating harvest stats:', error.message);
    return null;
  }
}

/**
 * Get recent harvests across all plants (for dashboard)
 */
export async function getRecentHarvests(limit: number = 5): Promise<HarvestWithPlant[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('harvests')
      .select(`*, plants(name)`)
      .eq('user_id', user.id)
      .order('harvest_date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return ((data || []) as any[]).map((h) => ({
      ...h,
      plant_name: h.plants?.name || 'Unknown Plant',
    }));
  } catch (error: any) {
    throw new Error(`Error fetching recent harvests: ${error.message}`);
  }
}

/**
 * Format harvest for display
 */
export function formatHarvest(harvest: Harvest | HarvestWithPlant): string {
  return `${harvest.quantity} ${harvest.unit}`;
}

/**
 * Format harvest with plant name for display
 */
export function formatHarvestWithPlant(harvest: HarvestWithPlant): string {
  return `${harvest.plant_name}: ${harvest.quantity} ${harvest.unit}`;
}
