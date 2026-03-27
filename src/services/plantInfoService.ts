import { supabase } from './supabase';
import { PlantNetData, CombinedPlantData } from '../types/ai';
import { searchPerenualPlant } from './perenualService';
import { searchPermapeoplePlant } from './permapeopleService';

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

export async function fetchAllPlantsInfo(
  onProgress?: (current: number, total: number, plantName: string) => void
): Promise<{ updated: number; failed: number }> {
  const { data: plants, error } = await supabase
    .from('plants')
    .select('id, name, plantnet_fetched_at');

  if (error || !plants) {
    throw new Error('Failed to fetch plants');
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const plantsToUpdate = plants.filter(p => {
    if (!p.plantnet_fetched_at) return true;
    return new Date(p.plantnet_fetched_at) < thirtyDaysAgo;
  });

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < plantsToUpdate.length; i++) {
    const plant = plantsToUpdate[i];
    
    onProgress?.(i + 1, plantsToUpdate.length, plant.name);

    try {
      const plantInfo = await getPlantInfo(plant.name);
      
      if (plantInfo && !plantInfo.notFound) {
        await updatePlantWithPlantInfo(plant.id, plantInfo);
        
        await createLearningsFromPlantInfo(plant.id, plantInfo);
        
        updated++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to fetch info for ${plant.name}:`, error);
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { updated, failed };
}

async function createLearningsFromPlantInfo(plantId: string, plantInfo: PlantNetData): Promise<void> {
  if (plantInfo.notFound) return;

  const learnings = [];

  if (plantInfo.commonNames.length > 0) {
    learnings.push({
      title: `Wissenswertes über ${plantInfo.name}`,
      content: `Deutsche Namen: ${plantInfo.commonNames.join(', ')}\n\nFamilie: ${plantInfo.family}\nGattung: ${plantInfo.genus}\nWissenschaftlicher Name: ${plantInfo.scientificName}`,
      related_plants: [plantId],
      source: 'ai',
    });
  }

  if (learnings.length === 0) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  for (const learning of learnings) {
    await supabase.from('learnings').insert({
      user_id: user.id,
      ...learning,
      dismissed: false,
      relevance_score: 0,
      valid_for_zeitraeume: [],
      flexible: false,
    });
  }
}

export async function fetchAllPlantData(plantName: string): Promise<CombinedPlantData> {
  if (!plantName || plantName.trim().length === 0) {
    return { plantnet: null, perenual: null, permapeople: null, notFound: true, sources: [] };
  }

  const cached = await getCachedPlantData(plantName);
  if (cached) return cached;

  const [plantnet, perenual, permapeople] = await Promise.all([
    getPlantInfo(plantName),
    searchPerenualPlant(plantName),
    searchPermapeoplePlant(plantName),
  ]);

  const sources = [];
  if (plantnet && !plantnet.notFound) sources.push('plantnet');
  if (perenual) sources.push('perenual');
  if (permapeople) sources.push('permapeople');

  const combined: CombinedPlantData = {
    plantnet: plantnet && !plantnet.notFound ? plantnet : null,
    perenual,
    permapeople,
    notFound: sources.length === 0,
    sources,
  };

  await cachePlantData(plantName, combined);

  return combined;
}

async function getCachedPlantData(plantName: string): Promise<CombinedPlantData | null> {
  try {
    const { data } = await supabase
      .from('plant_info_cache')
      .select('combined_data, created_at')
      .eq('plant_name', plantName.toLowerCase().trim())
      .single();

    if (data?.combined_data) {
      const cacheAge = Date.now() - new Date(data.created_at).getTime();
      if (cacheAge < CACHE_DURATION_MS) {
        return data.combined_data;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function cachePlantData(plantName: string, data: CombinedPlantData): Promise<void> {
  try {
    await supabase.from('plant_info_cache').upsert({
      plant_name: plantName.toLowerCase().trim(),
      combined_data: data,
    });
  } catch (error) {
    console.error('Error caching plant data:', error);
  }
}
