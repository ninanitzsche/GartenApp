import { supabase } from './supabase';
import { PlantNetData, PlantIdentificationResult } from '../types/ai';

const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function getPlantInfo(plantName: string): Promise<PlantNetData | null> {
  if (!plantName || plantName.trim().length === 0) {
    return null;
  }

  try {
    // Check cache first
    const { data: cached } = await supabase
      .from('plant_info_cache')
      .select('*')
      .eq('plant_name', plantName.toLowerCase().trim())
      .single();

    if (cached) {
      const cacheAge = Date.now() - new Date(cached.created_at).getTime();
      if (cacheAge < CACHE_DURATION_MS) {
        return parsePlantNetResponse(cached.plantnet_response);
      }
    }

    // Fetch from PlantNet API using existing identifyPlantWithImage function logic
    // Since PlantNet is image-based, we'll use the existing AI identification
    // For name-based lookup, we need to call the API directly
    const plantData = await fetchFromPlantNetByName(plantName);
    
    if (!plantData) {
      // Store not found result
      await supabase
        .from('plant_info_cache')
        .upsert({
          plant_name: plantName.toLowerCase().trim(),
          scientific_name: null,
          plantnet_response: { notFound: true },
        });
      return { notFound: true } as PlantNetData;
    }

    // Cache the result
    await supabase
      .from('plant_info_cache')
      .upsert({
        plant_name: plantName.toLowerCase().trim(),
        scientific_name: plantData.scientificName,
        plantnet_response: plantData,
      });

    return plantData;
  } catch (error) {
    console.error('Error fetching plant info:', error);
    return null;
  }
}

async function fetchFromPlantNetByName(plantName: string): Promise<PlantNetData | null> {
  // PlantNet requires images for identification, not name search
  // For name-based lookup, return null - user must use AI identification with image
  // This function is a placeholder for future name-based API integration
  console.log('PlantNet name lookup not available - use AI identification with image');
  return null;
}

function parsePlantNetResponse(response: any): PlantNetData | null {
  if (!response || response.notFound) {
    return { notFound: true } as PlantNetData;
  }
  
  return {
    id: response.id || response.gbifId || '',
    name: response.name || '',
    scientificName: response.scientificName || '',
    family: response.family || '',
    genus: response.genus || '',
    commonNames: response.commonNames || [],
    confidence: response.confidence || 0,
    gbifId: response.gbifId,
    powoId: response.powoId,
    images: response.images || [],
  };
}

export async function updatePlantWithPlantInfo(plantId: string, plantInfo: PlantNetData): Promise<void> {
  await supabase
    .from('plants')
    .update({
      plantnet_data: plantInfo,
      plantnet_id: plantInfo.id,
      plantnet_fetched_at: new Date().toISOString(),
    })
    .eq('id', plantId);
}
