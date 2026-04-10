/**
 * Photo-Pflanze CRUD Service
 * Handles linking photos to plants (junction table photo_plants)
 */
import { supabase } from './supabase';
import { Photo } from '../types/photo';

/**
 * Enrich photo with public URL from Supabase storage
 */
function enrichPhotoWithUrl(photo: any): Photo {
  if (!photo.file_url) return { ...photo, photo_url: undefined };

  const { data } = supabase.storage
    .from('plant-photos')
    .getPublicUrl(photo.file_url);

  return {
    ...photo,
    photo_url: data.publicUrl,
    thumbnail_url: photo.thumbnail_url || data.publicUrl,
  };
}

/**
 * Fetch all photos for a specific plant
 */
export async function fetchPhotosForPlant(plantId: string): Promise<Photo[]> {
  const { data: photoPlants, error: junctionError } = await supabase
    .from('photo_plants')
    .select('photo_id')
    .eq('plant_id', plantId);

  if (junctionError) throw junctionError;
  if (!photoPlants || photoPlants.length === 0) return [];

  const photoIds = photoPlants.map((pp) => pp.photo_id);

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .in('id', photoIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(enrichPhotoWithUrl);
}

/**
 * Link an existing photo to a plant
 */
export async function linkPhotoToPlant(photoId: string, plantId: string): Promise<void> {
  const { error } = await supabase
    .from('photo_plants')
    .insert({ photo_id: photoId, plant_id: plantId });

  if (error) throw error;
}

/**
 * Unlink a photo from a plant
 */
export async function unlinkPhotoFromPlant(photoId: string, plantId: string): Promise<void> {
  const { error } = await supabase
    .from('photo_plants')
    .delete()
    .eq('photo_id', photoId)
    .eq('plant_id', plantId);

  if (error) throw error;
}

/**
 * Set a photo as the cover image for a plant
 */
export async function setPlantCoverPhoto(plantId: string, photoUrl: string): Promise<void> {
  const { error } = await supabase
    .from('plants')
    .update({ cover_photo_url: photoUrl })
    .eq('id', plantId);

  if (error) throw error;
}

/**
 * Upload a photo directly linked to a plant
 */
export async function uploadPhotoForPlant(
  plantId: string,
  imageUri: string
): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) throw new Error('User not authenticated');

  // 1. Generate unique filename (handle blob: URIs from web image picker)
  const isBlobUrl = imageUri.startsWith('blob:');
  const fileExt = isBlobUrl ? 'jpg' : (imageUri.split('.').pop()?.split('?')[0] || 'jpg');
  const fileName = `${user.id}/plant/${plantId}/${Date.now()}-plant.${fileExt}`;

  // 2. Fetch the image and convert to ArrayBuffer
  const response = await fetch(imageUri);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    throw new Error('Image blob is empty');
  }

  const contentType = isBlobUrl ? 'image/jpeg' : (blob.type || 'image/jpeg');
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // 3. Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('plant-photos')
    .upload(fileName, uint8Array, {
      contentType,
      upsert: false,
    });

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);
  if (!uploadData) throw new Error('No upload response data');

  // 4. Save metadata to photos table
  const { data: photoData, error: insertError } = await supabase
    .from('photos')
    .insert({
      user_id: user.id,
      file_url: uploadData.path,
      created_at: new Date().toISOString(),
    })
    .select();

  if (insertError) {
    try { await supabase.storage.from('plant-photos').remove([uploadData.path]); } catch {}
    throw new Error(`Database insert failed: ${insertError.message}`);
  }

  if (!photoData || photoData.length === 0) throw new Error('Failed to get inserted photo ID');

  const photoId = photoData[0].id;

  // 5. Link photo to plant
  const { error: relationError } = await supabase
    .from('photo_plants')
    .insert({ photo_id: photoId, plant_id: plantId });

  if (relationError) {
    try { await supabase.from('photos').delete().eq('id', photoId); } catch {}
    try { await supabase.storage.from('plant-photos').remove([uploadData.path]); } catch {}
    throw new Error(`Failed to link photo to plant: ${relationError.message}`);
  }

  return uploadData.path;
}