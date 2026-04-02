import { supabase } from './supabase';
import { HealthCheck, HealthCheckFormData, calculateHealthStatus } from '../types/healthCheck';
import { uploadPhoto, enrichPhotoWithUrl } from './photoService';
import { identifyDisease } from './plantDiseaseService';

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
