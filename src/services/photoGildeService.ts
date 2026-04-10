/**
 * Photo-Gilde CRUD Service
 * Handles linking photos to gilden (junction table photo_gilden)
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
 * Fetch all photos for a specific gilde
 */
export async function fetchPhotosForGilde(gildeId: string): Promise<Photo[]> {
  const { data: photoGilden, error: junctionError } = await supabase
    .from('photo_gilden')
    .select('photo_id')
    .eq('gilde_id', gildeId);

  if (junctionError) throw junctionError;
  if (!photoGilden || photoGilden.length === 0) return [];

  const photoIds = photoGilden.map((pg) => pg.photo_id);

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .in('id', photoIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(enrichPhotoWithUrl);
}

/**
 * Link an existing photo to a gilde
 */
export async function linkPhotoToGilde(photoId: string, gildeId: string): Promise<void> {
  const { error } = await supabase
    .from('photo_gilden')
    .insert({ photo_id: photoId, gilde_id: gildeId });

  if (error) throw error;
}

/**
 * Unlink a photo from a gilde
 */
export async function unlinkPhotoFromGilde(photoId: string, gildeId: string): Promise<void> {
  const { error } = await supabase
    .from('photo_gilden')
    .delete()
    .eq('photo_id', photoId)
    .eq('gilde_id', gildeId);

  if (error) throw error;
}

/**
 * Set a photo as the cover image for a gilde
 */
export async function setGildeCoverPhoto(gildeId: string, photoUrl: string): Promise<void> {
  const { error } = await supabase
    .from('gilden')
    .update({ cover_photo_url: photoUrl })
    .eq('id', gildeId);

  if (error) throw error;
}

/**
 * Upload a photo directly linked to a gilde
 */
export async function uploadPhotoForGilde(
  gildeId: string,
  imageUri: string
): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) throw new Error('User not authenticated');

  // 1. Generate unique filename (handle blob: URIs from web image picker)
  const isBlobUrl = imageUri.startsWith('blob:');
  const fileExt = isBlobUrl ? 'jpg' : (imageUri.split('.').pop()?.split('?')[0] || 'jpg');
  const fileName = `${user.id}/gilde/${gildeId}/${Date.now()}-gilde.${fileExt}`;

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

  // 5. Link photo to gilde
  const { error: relationError } = await supabase
    .from('photo_gilden')
    .insert({ photo_id: photoId, gilde_id: gildeId });

  if (relationError) {
    try { await supabase.from('photos').delete().eq('id', photoId); } catch {}
    try { await supabase.storage.from('plant-photos').remove([uploadData.path]); } catch {}
    throw new Error(`Failed to link photo to gilde: ${relationError.message}`);
  }

  return uploadData.path;
}