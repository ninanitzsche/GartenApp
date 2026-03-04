/**
 * Photo CRUD Service
 * Handles all database operations for photos
 * Follows Service Layer Pattern from plantService.ts
 */
import { supabase } from './supabase';
import { Photo } from '../types/photo';
import { Plant } from '../types/plant';

/**
 * Filter options for gallery
 */
export interface PhotoFilters {
  locations?: string[];
  plantIds?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

/**
 * Fetch all photos for a specific plant
 * Uses junction table photo_plants to find related photos
 */
export async function fetchPhotos(plantId: string): Promise<Photo[]> {
  try {
    // Get photo IDs from photo_plants junction table
    const { data: photoPlants, error: junctionError } = await supabase
      .from('photo_plants')
      .select('photo_id')
      .eq('plant_id', plantId);

    if (junctionError) throw junctionError;

    if (!photoPlants || photoPlants.length === 0) {
      return [];
    }

    // Extract photo IDs
    const photoIds = photoPlants.map((pp) => pp.photo_id);

    // Fetch full photo data
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .in('id', photoIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich photos with public URLs
    return (data || []).map(enrichPhotoWithUrl);
  } catch (error: any) {
    console.error('Error fetching photos:', error);
    throw new Error(`Error fetching photos: ${error.message}`);
  }
}

/**
 * Fetch single photo by ID
 */
export async function fetchPhoto(id: string): Promise<Photo | null> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw new Error(`Error fetching photo: ${error.message}`);
  }
}

/**
 * Upload a photo file and save metadata to database
 * Steps:
 * 1. Get current user
 * 2. Upload file to Storage
 * 3. Save metadata to photos table
 */
export async function uploadPhoto(
  plantId: string,
  fileUri: string,
  fileName: string
): Promise<string> {
  try {
    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // 2. Upload file to Storage
    let uploadData;
    let uploadError;

    try {
      const response = await fetch(fileUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // Get blob and convert to ArrayBuffer for better compatibility
      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error('Image blob is empty');
      }

      // Convert blob to ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const storagePath = `${user.id}/${plantId}/${fileName}`;

      // Upload using the ArrayBuffer directly
      const result = await supabase.storage
        .from('plant-photos')
        .upload(storagePath, uint8Array, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      uploadData = result.data;
      uploadError = result.error;
    } catch (fetchError: any) {
      throw new Error(`Image fetch failed: ${fetchError.message}`);
    }

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    if (!uploadData) throw new Error('No upload response data');

    // 3. Save metadata to photos table
    const { data: photoData, error: insertError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        file_url: uploadData.path,
        created_at: new Date().toISOString(),
      })
      .select();

    if (insertError) {
      // Clean up storage if DB insert fails
      await supabase.storage
        .from('plant-photos')
        .remove([uploadData.path])
        .catch(() => {});

      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    if (!photoData || photoData.length === 0) {
      throw new Error('Failed to get inserted photo ID');
    }

    const photoId = photoData[0].id;

    // 4. Create relationship in photo_plants junction table
    const { error: relationError } = await supabase
      .from('photo_plants')
      .insert({
        photo_id: photoId,
        plant_id: plantId,
      });

    if (relationError) {
      // Clean up if junction insert fails
      await supabase.from('photos').delete().eq('id', photoId).catch(() => {});
      await supabase.storage
        .from('plant-photos')
        .remove([uploadData.path])
        .catch(() => {});

      throw new Error(`Failed to link photo to plant: ${relationError.message}`);
    }

    return uploadData.path;
  } catch (error: any) {
    console.error('Upload error details:', error);
    throw new Error(`Error uploading photo: ${error.message}`);
  }
}

/**
 * Delete a photo and its file from storage
 * Also removes the relationship from photo_plants junction table
 */
export async function deletePhoto(photoId: string, photoPath?: string): Promise<void> {
  try {
    // 1. Delete from junction table first
    const { error: junctionError } = await supabase
      .from('photo_plants')
      .delete()
      .eq('photo_id', photoId);

    if (junctionError) throw junctionError;

    // 2. Delete from photos table
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) throw dbError;

    // 3. Delete from storage if path provided
    if (photoPath) {
      const { error: storageError } = await supabase.storage
        .from('plant-photos')
        .remove([photoPath]);

      if (storageError) throw storageError;
    }
  } catch (error: any) {
    throw new Error(`Error deleting photo: ${error.message}`);
  }
}

/**
 * Fetch all photos for the current user (standalone gallery)
 * Supports filtering by location, linked plants, and date range
 */
export async function fetchAllPhotos(
  filters?: PhotoFilters,
  pagination?: { offset: number; limit: number }
): Promise<Photo[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // Start with base query for all user photos
    let query = supabase
      .from('photos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply location filter if provided
    if (filters?.locations && filters.locations.length > 0) {
      query = query.in('location', filters.locations);
    }

    // Apply date range filter if provided
    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.from.toISOString())
        .lte('created_at', filters.dateRange.to.toISOString());
    }

    // Apply pagination
    if (pagination) {
      query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    // If filtering by plants, filter results in-memory (since it requires junction table)
    if (filters?.plantIds && filters.plantIds.length > 0) {
      // Fetch junction table for these photos
      const photoIds = (data || []).map(p => p.id);
      if (photoIds.length === 0) return [];

      const { data: links, error: linkError } = await supabase
        .from('photo_plants')
        .select('photo_id')
        .in('photo_id', photoIds)
        .in('plant_id', filters.plantIds);

      if (linkError) throw linkError;

      const linkedPhotoIds = new Set((links || []).map(l => l.photo_id));
      const filtered = (data || []).filter(p => linkedPhotoIds.has(p.id));

      // Enrich with public URLs
      return filtered.map(enrichPhotoWithUrl);
    }

    // Enrich photos with public URLs
    return (data || []).map(enrichPhotoWithUrl);
  } catch (error: any) {
    throw new Error(`Error fetching photos: ${error.message}`);
  }
}

/**
 * Fetch distinct locations where photos exist
 */
export async function fetchPhotoLocations(): Promise<string[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('photos')
      .select('location')
      .eq('user_id', user.id)
      .not('location', 'is', null)
      .order('location');

    if (error) throw error;

    // Get unique locations
    const locations = new Set(
      (data || [])
        .map((p: any) => p.location)
        .filter((l: any) => l && typeof l === 'string')
    );

    return Array.from(locations).sort();
  } catch (error: any) {
    throw new Error(`Error fetching locations: ${error.message}`);
  }
}

/**
 * Fetch plants that have linked photos
 */
export async function fetchPlantsWithPhotos(): Promise<Plant[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('photo_plants')
      .select('plant_id, plants(*)')
      .in(
        'photo_id',
        (await supabase
          .from('photos')
          .select('id')
          .eq('user_id', user.id)
          .then(r => (r.data || []).map((p: any) => p.id))
        ) as string[]
      );

    if (error) throw error;

    // Extract unique plants
    const plantsMap = new Map();
    (data || []).forEach((link: any) => {
      if (link.plants) {
        plantsMap.set(link.plants.id, link.plants);
      }
    });

    return Array.from(plantsMap.values()).sort((a: Plant, b: Plant) =>
      (a.name || '').localeCompare(b.name || '')
    );
  } catch (error: any) {
    throw new Error(`Error fetching plants with photos: ${error.message}`);
  }
}

/**
 * Count total photos for user
 */
export async function countUserPhotos(): Promise<number> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) throw error;

    return count || 0;
  } catch (error: any) {
    throw new Error(`Error counting photos: ${error.message}`);
  }
}

/**
 * Get public URL for a photo from storage
 */
export function getPublicPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from('plant-photos')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * Transform photo data with public URLs
 */
export function enrichPhotoWithUrl(photo: Photo): Photo {
  return {
    ...photo,
    photo_url: photo.file_url ? getPublicPhotoUrl(photo.file_url) : undefined,
  };
}
