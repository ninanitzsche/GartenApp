/**
 * Photo CRUD Service
 * Handles all database operations for photos
 * Follows Service Layer Pattern from plantService.ts
 */
import { supabase } from './supabase';
import { Photo } from '../types/photo';

/**
 * Fetch all photos for a specific plant
 */
export async function fetchPhotos(plantId: string): Promise<Photo[]> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('plant_id', plantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
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
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plant-photos')
      .upload(`${user.id}/${plantId}/${fileName}`, blob, {
        contentType: 'image/jpeg',
      });

    if (uploadError) throw uploadError;
    if (!uploadData) throw new Error('No upload response data');

    // 3. Save metadata to photos table
    const { error: insertError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        plant_id: plantId,
        photo_url: uploadData.path,
        created_at: new Date().toISOString(),
      });

    if (insertError) throw insertError;

    return uploadData.path;
  } catch (error: any) {
    throw new Error(`Error uploading photo: ${error.message}`);
  }
}

/**
 * Delete a photo and its file from storage
 */
export async function deletePhoto(photoId: string, photoPath?: string): Promise<void> {
  try {
    // Delete from database first
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) throw dbError;

    // Delete from storage if path provided
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
 * Get public URL for a photo from storage
 * Useful for displaying photos from private bucket
 */
export function getPublicPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from('plant-photos')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}
