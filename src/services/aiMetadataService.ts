/**
 * AI Metadata Service
 * Cloud persistence for AI results
 */
import { supabase } from './supabase';
import { AIIdentification, PhotoAIAnalysis } from '../types/ai';

export async function saveAIIdentification(
  aiType: 'plant' | 'pest',
  imageUrl: string,
  result: any,
  confidence: number
): Promise<string> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('ai_identifications')
      .insert({
        user_id: user.id,
        ai_type: aiType,
        image_url: imageUrl,
        result_json: result,
        confidence: confidence,
      })
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to get inserted identification ID');

    return data.id;
  } catch (error: any) {
    console.error('Error saving AI identification:', error);
    throw new Error(`Error saving AI identification: ${error.message}`);
  }
}

export async function linkIdentificationToPlant(
  identificationId: string,
  plantId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('plant_identifications')
      .insert({
        plant_id: plantId,
        identification_id: identificationId,
      });

    if (error) throw error;
  } catch (error: any) {
    console.error('Error linking identification to plant:', error);
    throw new Error(`Error linking identification: ${error.message}`);
  }
}

export async function linkPhotoToAnalysis(
  photoId: string,
  analysisId: string,
  aiType: 'plant' | 'pest'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('photo_ai_analysis')
      .insert({
        photo_id: photoId,
        ai_type: aiType,
        analysis_id: analysisId,
      });

    if (error) throw error;
  } catch (error: any) {
    console.error('Error linking photo to analysis:', error);
    throw new Error(`Error linking photo to analysis: ${error.message}`);
  }
}

export async function getAnalysesForPhoto(
  photoId: string
): Promise<PhotoAIAnalysis[]> {
  try {
    const { data, error } = await supabase
      .from('photo_ai_analysis')
      .select('*')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error getting analyses for photo:', error);
    return [];
  }
}

export async function getIdentificationsForPlant(
  plantId: string
): Promise<AIIdentification[]> {
  try {
    const { data, error } = await supabase
      .from('plant_identifications')
      .select('ai_identifications(*)')
      .eq('plant_id', plantId)
      .order('linked_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any): AIIdentification => {
      const ident = item.ai_identifications;
      return {
        id: ident.id,
        user_id: ident.user_id,
        ai_type: ident.ai_type,
        image_url: ident.image_url,
        result_json: ident.result_json,
        confidence: ident.confidence,
        created_at: ident.created_at,
      };
    });
  } catch (error: any) {
    console.error('Error getting identifications for plant:', error);
    return [];
  }
}

export async function syncLocalCacheToCloud(): Promise<void> {
  console.log('Syncing local cache to cloud - not yet implemented');
}

export async function fetchCloudAnalysisForPhoto(
  photoId: string
): Promise<AIIdentification | null> {
  try {
    const { data, error } = await supabase
      .from('photo_ai_analysis')
      .select('ai_identifications(*)')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    if (!data) return null;

    return data.ai_identifications;
  } catch (error: any) {
    console.error('Error fetching cloud analysis:', error);
    return null;
  }
}