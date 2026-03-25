/**
 * Photo-Bed CRUD Service
 * Handles linking photos to beds (junction table photo_beds)
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
 * Fetch all photos for a specific bed
 */
export async function fetchPhotosForBed(bedId: string): Promise<Photo[]> {
  const { data: photoBeds, error: junctionError } = await supabase
    .from('photo_beds')
    .select('photo_id')
    .eq('bed_id', bedId);

  if (junctionError) throw junctionError;
  if (!photoBeds || photoBeds.length === 0) return [];

  const photoIds = photoBeds.map((pb) => pb.photo_id);

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .in('id', photoIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(enrichPhotoWithUrl);
}

/**
 * Link an existing photo to a bed
 */
export async function linkPhotoToBed(photoId: string, bedId: string): Promise<void> {
  const { error } = await supabase
    .from('photo_beds')
    .insert({ photo_id: photoId, bed_id: bedId });

  if (error) throw error;
}

/**
 * Unlink a photo from a bed
 */
export async function unlinkPhotoFromBed(photoId: string, bedId: string): Promise<void> {
  const { error } = await supabase
    .from('photo_beds')
    .delete()
    .eq('photo_id', photoId)
    .eq('bed_id', bedId);

  if (error) throw error;
}

/**
 * Set a photo as the cover image for a bed
 */
export async function setBedCoverPhoto(bedId: string, photoUrl: string): Promise<void> {
  const { error } = await supabase
    .from('beds')
    .update({ cover_photo_url: photoUrl })
    .eq('id', bedId);

  if (error) throw error;
}

/**
 * Upload a photo directly linked to a bed
 */
export async function uploadPhotoForBed(
  bedId: string,
  imageUri: string
): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) throw new Error('User not authenticated');

  // 1. Generate unique filename (handle blob: URIs from web image picker)
  const isBlobUrl = imageUri.startsWith('blob:');
  const fileExt = isBlobUrl ? 'jpg' : (imageUri.split('.').pop()?.split('?')[0] || 'jpg');
  const fileName = `${user.id}/${bedId}/${Date.now()}-bed.${fileExt}`;

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

  // 5. Link photo to bed
  const { error: relationError } = await supabase
    .from('photo_beds')
    .insert({ photo_id: photoId, bed_id: bedId });

  if (relationError) {
    try { await supabase.from('photos').delete().eq('id', photoId); } catch {}
    try { await supabase.storage.from('plant-photos').remove([uploadData.path]); } catch {}
    throw new Error(`Failed to link photo to bed: ${relationError.message}`);
  }

  return uploadData.path;
}
