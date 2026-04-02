import { supabase } from './supabase';
import { HealthCheck, HealthCheckFormData, calculateHealthStatus } from '../types/healthCheck';
import { uploadPhoto, enrichPhotoWithUrl, fetchPhotos } from './photoService';
import { identifyDisease } from './plantDiseaseService';
import { fetchPlants } from './plantService';

export interface BatchHealthCheckResult {
  plantId: string;
  plantName: string;
  status: 'success' | 'skipped' | 'error';
  reason?: string;
}

export async function fetchHealthChecks(plantId: string): Promise<HealthCheck[]> {
  const { data, error } = await supabase
    .from('health_checks')
    .select('*, photos(*)')
    .eq('plant_id', plantId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((hc: any) => ({
    ...hc,
    photo: hc.photos ? enrichPhotoWithUrl(hc.photos) : undefined,
  }));
}

export async function createHealthCheck(
  plantId: string,
  formData: HealthCheckFormData
): Promise<HealthCheck> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) throw new Error('User not authenticated');

  const fileName = `health-check-${Date.now()}.jpg`;
  const photoPath = await uploadPhoto(plantId, formData.photoUri, fileName);

  const { data: photos } = await supabase
    .from('photos')
    .select('id')
    .eq('file_url', photoPath)
    .single();

  let diseaseData = null;
  if (formData.runAI) {
    diseaseData = await identifyDisease(formData.photoUri);
  }

  const healthStatus = calculateHealthStatus(diseaseData || undefined);

  const { data, error } = await supabase
    .from('health_checks')
    .insert({
      plant_id: plantId,
      photo_id: photos?.id,
      disease_data: diseaseData,
      health_status: healthStatus,
      notes: formData.notes,
      user_id: user.id,
    })
    .select('*, photos(*)')
    .single();

  if (error) throw error;

  return {
    ...data,
    photo: data.photos ? enrichPhotoWithUrl(data.photos) : undefined,
  };
}

export async function updateHealthCheckNotes(
  healthCheckId: string,
  notes: string
): Promise<void> {
  const { error } = await supabase
    .from('health_checks')
    .update({ notes })
    .eq('id', healthCheckId);

  if (error) throw error;
}

export async function deleteHealthCheck(healthCheckId: string): Promise<void> {
  const { error } = await supabase
    .from('health_checks')
    .delete()
    .eq('id', healthCheckId);

  if (error) throw error;
}

export async function runBatchHealthCheck(
  onProgress?: (current: number, total: number, plantName: string) => void
): Promise<BatchHealthCheckResult[]> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) throw new Error('User not authenticated');

  const plants = await fetchPlants();
  const results: BatchHealthCheckResult[] = [];

  for (let i = 0; i < plants.length; i++) {
    const plant = plants[i];
    onProgress?.(i + 1, plants.length, plant.name);

    try {
      const photos = await fetchPhotos(plant.id);

      if (photos.length > 0) {
        const photoUrl = photos[0].photo_url;
        if (!photoUrl) {
          results.push({ plantId: plant.id, plantName: plant.name, status: 'skipped', reason: 'Kein Bild-URL' });
          continue;
        }

        const diseaseData = await identifyDisease(photoUrl);
        const healthStatus = calculateHealthStatus(diseaseData || undefined);

        await supabase.from('health_checks').insert({
          plant_id: plant.id,
          photo_id: photos[0].id,
          disease_data: diseaseData,
          health_status: healthStatus,
          user_id: user.id,
        });

        results.push({ plantId: plant.id, plantName: plant.name, status: 'success' });
      } else {
        await supabase.from('health_checks').insert({
          plant_id: plant.id,
          health_status: 'gesund',
          notes: 'Ohne Bild angelegt',
          user_id: user.id,
        });

        results.push({ plantId: plant.id, plantName: plant.name, status: 'skipped', reason: 'Kein Bild' });
      }
    } catch (error: any) {
      results.push({ plantId: plant.id, plantName: plant.name, status: 'error', reason: error.message });
    }
  }

  return results;
}
