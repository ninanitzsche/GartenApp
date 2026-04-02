import { supabase } from './supabase';
import { PlantNetData, CombinedPlantData } from '../types/ai';
import { generatePlantCareInfo, AIPlantCareData } from './aiService';
import { createTask } from './taskService';

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

export async function updatePlantWithAllData(plantId: string, combinedData: CombinedPlantData): Promise<void> {
  const updates: any = {
    plant_info_fetched_at: new Date().toISOString(),
    plant_info_sources: combinedData.sources,
  };

  if (combinedData.plantnet) {
    updates.plantnet_data = combinedData.plantnet;
    updates.plantnet_id = combinedData.plantnet.id;
    updates.plantnet_fetched_at = new Date().toISOString();
  }

  if (combinedData.ai_care) {
    updates.openai_care = combinedData.ai_care;
  }

  const { error } = await supabase
    .from('plants')
    .update(updates)
    .eq('id', plantId);

  if (error) {
    console.error('Supabase update error:', error);
    throw error;
  }
}

export async function refreshPlantData(plantId: string, plantName: string): Promise<{ success: boolean; sources: string[] }> {
  try {
    const allData = await fetchAllPlantData(plantName, plantId, true);
    
    if (allData.sources.length === 0) {
      return { success: false, sources: [] };
    }
    
    await updatePlantWithAllData(plantId, allData);
    try {
      await createLearningsFromCombinedData(plantId, allData);
    } catch (e) {
      console.log('Learnings creation failed (non-blocking):', e);
    }
    if (allData.ai_care?.tasks?.length) {
      try {
        await createTasksFromAI(plantId, plantName, allData.ai_care);
      } catch (e) {
        console.error('Tasks creation failed:', e);
      }
    }
    return { success: true, sources: allData.sources };
  } catch (error) {
    console.error('Failed to refresh plant data:', error);
    return { success: false, sources: [] };
  }
}

/**
 * Fetch all plant data from APIs. Uses cache unless bypassCache is true.
 */
export async function fetchAllPlantData(plantName: string, plantId?: string, bypassCache: boolean = false): Promise<CombinedPlantData> {
  if (!plantName || plantName.trim().length === 0) {
    return { plantnet: null, perenual: null, permapeople: null, ai_care: null, notFound: true, sources: [] };
  }

  // Check cache first (unless bypassing)
  if (!bypassCache) {
    try {
      const cached = await getCachedPlantData(plantName);
      if (cached) return cached;
    } catch (e) {
      console.log('Cache read error, continuing...');
    }
  }

  let plantnet = null;

  // Only fetch PlantNet if plant has photos
  if (plantId) {
    const { data: photos } = await supabase
      .from('photo_plants')
      .select('photo_id')
      .eq('plant_id', plantId)
      .limit(1);

    if (photos && photos.length > 0) {
      plantnet = await getPlantInfo(plantName);
    }
  }

  // Always generate AI care info (AI-only approach)
  let aiCareData: AIPlantCareData | null = null;
  try {
    aiCareData = await generatePlantCareInfo(
      plantName,
      plantnet?.scientificName || plantName,
      {
        ...(plantnet && !plantnet.notFound ? {
          family: plantnet.family,
          genus: plantnet.genus,
          commonNames: plantnet.commonNames,
          scientificName: plantnet.scientificName,
          confidence: plantnet.confidence
        } : {})
      }
    );
  } catch (e) {
    console.log('AI care info generation failed:', e);
  }

  const sources: string[] = [];
  if (plantnet && !plantnet.notFound) sources.push('plantnet');
  if (aiCareData) sources.push('ai');

  const combined: CombinedPlantData = {
    plantnet: plantnet && !plantnet.notFound ? plantnet : null,
    perenual: null,
    permapeople: null,
    ai_care: aiCareData,
    notFound: sources.length === 0,
    sources,
  };

  // Cache the result
  try {
    await cachePlantData(plantName, combined);
  } catch (e) {
    console.log('Cache write skipped');
  }

  return combined;
}

export function hasAllSources(sources?: string[]): boolean {
  if (!sources) return false;
  return sources.includes('plantnet') || sources.includes('perenual') || sources.includes('ai');
}

export async function createLearningsFromCombinedData(plantId: string, combinedData: CombinedPlantData): Promise<void> {
  const learnings: Array<{ title: string; content: string; related_plants: string[]; source: string }> = [];

  if (combinedData.plantnet && !combinedData.plantnet.notFound && combinedData.plantnet.commonNames.length > 0) {
    learnings.push({
      title: `Wissenswertes über ${combinedData.plantnet.name}`,
      content: `Deutsche Namen: ${combinedData.plantnet.commonNames.join(', ')}\nFamilie: ${combinedData.plantnet.family}\nWissenschaftlich: ${combinedData.plantnet.scientificName}`,
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

export async function fetchAllPlantsInfo(
  onProgress?: (current: number, total: number, plantName: string) => void,
  forceRefresh: boolean = false
): Promise<{ updated: number; failed: number }> {
  const { data: plants, error } = await supabase
    .from('plants')
    .select('id, name, plant_info_fetched_at');

  if (error || !plants) {
    throw new Error('Failed to fetch plants');
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const plantsToUpdate = plants.filter(p => {
    if (forceRefresh) return true;
    if (!p.plant_info_fetched_at) return true;
    return new Date(p.plant_info_fetched_at) < thirtyDaysAgo;
  });

  let updated = 0;
  let failed = 0;
  let rateLimited = false;

  for (let i = 0; i < plantsToUpdate.length; i++) {
    const plant = plantsToUpdate[i];
    
    if (rateLimited) {
      onProgress?.(i + 1, plantsToUpdate.length, `${plant.name} (Rate Limited - gestoppt)`);
      continue;
    }

    onProgress?.(i + 1, plantsToUpdate.length, plant.name);

    try {
      const allData = await fetchAllPlantData(plant.name, plant.id);
      
      if (!allData.notFound || allData.sources.length > 0) {
        await updatePlantWithAllData(plant.id, allData);
        
        await createLearningsFromCombinedData(plant.id, allData);
        
        updated++;
      } else {
        failed++;
      }
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.status === 429) {
        rateLimited = true;
        console.log('Rate limit reached, stopping...');
        continue;
      }
      console.error(`Failed to fetch info for ${plant.name}:`, error);
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  return { updated, failed };
}

async function getCachedPlantData(plantName: string): Promise<CombinedPlantData | null> {
  try {
    const { data, error } = await supabase
      .from('plant_info_cache')
      .select('combined_data, created_at')
      .eq('plant_name', plantName.toLowerCase().trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error reading plant info cache:', error);
      return null;
    }

    if (data?.combined_data) {
      const cacheAge = Date.now() - new Date(data.created_at).getTime();
      if (cacheAge < CACHE_DURATION_MS) {
        console.log('Cache hit for:', plantName, 'age:', Math.round(cacheAge / 1000 / 60), 'minutes');
        return data.combined_data;
      } else {
        console.log('Cache expired for:', plantName, 'age:', Math.round(cacheAge / 1000 / 60), 'minutes');
      }
    }
    return null;
  } catch (err) {
    console.error('Unexpected error in getCachedPlantData:', err);
    return null;
  }
}

async function cachePlantData(plantName: string, data: CombinedPlantData): Promise<void> {
  try {
    const existing = await supabase
      .from('plant_info_cache')
      .select('id')
      .eq('plant_name', plantName.toLowerCase().trim())
      .single();
    
    if (existing.data) {
      await supabase
        .from('plant_info_cache')
        .update({ combined_data: data })
        .eq('id', existing.data.id);
    } else {
      await supabase
        .from('plant_info_cache')
        .insert({ plant_name: plantName.toLowerCase().trim(), combined_data: data });
    }
  } catch (error) {
    console.log('Cache skipped for', plantName);
  }
}

export async function createTasksFromAI(plantId: string, plantName: string, aiCare: AIPlantCareData): Promise<void> {
  console.log('createTasksFromAI called with tasks:', aiCare.tasks?.length);
  if (!aiCare.tasks || aiCare.tasks.length === 0) {
    console.log('No tasks to create');
    return;
  }

  const zeitraumMap: Record<string, string> = {
    'januar': 'winter_mitte', 'februar': 'winter_spaet', 'märz': 'fruehjahr_frueh',
    'april': 'fruehjahr_mitte', 'mai': 'fruehjahr_spaet', 'juni': 'sommer_frueh',
    'juli': 'sommer_mitte', 'august': 'sommer_spaet', 'september': 'herbst_frueh',
    'oktober': 'herbst_mitte', 'november': 'herbst_spaet', 'dezember': 'winter_frueh',
    'frühling': 'fruehjahr_mitte', 'sommer': 'sommer_mitte', 'herbst': 'herbst_mitte',
    'winter': 'winter_mitte', 'spring': 'fruehjahr_mitte', 'summer': 'sommer_mitte',
    'autumn': 'herbst_mitte',
  };

  const zeitraumLabel: Record<string, string> = {
    'winter_mitte': 'Januar', 'winter_spaet': 'Februar', 'fruehjahr_frueh': 'März',
    'fruehjahr_mitte': 'April', 'fruehjahr_spaet': 'Mai', 'sommer_frueh': 'Juni',
    'sommer_mitte': 'Juli', 'sommer_spaet': 'August', 'herbst_frueh': 'September',
    'herbst_mitte': 'Oktober', 'herbst_spaet': 'November', 'winter_frueh': 'Dezember',
  };

  const monatZuDate: Record<string, string> = {
    'winter_mitte': '01-15', 'winter_spaet': '02-15', 'fruehjahr_frueh': '03-15',
    'fruehjahr_mitte': '04-15', 'fruehjahr_spaet': '05-15', 'sommer_frueh': '06-15',
    'sommer_mitte': '07-15', 'sommer_spaet': '08-15', 'herbst_frueh': '09-15',
    'herbst_mitte': '10-15', 'herbst_spaet': '11-15', 'winter_frueh': '12-15',
  };

  const now = new Date();
  const year = now.getFullYear();

  for (const task of aiCare.tasks) {
    try {
      const zeitraum = zeitraumMap[task.zeitraum?.toLowerCase()] || 'flexibel';
      const label = zeitraumLabel[zeitraum] || task.zeitraum;
      const dayMonth = monatZuDate[zeitraum];
      let dueDate: string | null = null;
      if (dayMonth) {
        const target = new Date(`${year}-${dayMonth}`);
        if (target < now) {
          dueDate = new Date(`${year + 1}-${dayMonth}`).toISOString();
        } else {
          dueDate = target.toISOString();
        }
      }

      console.log('Creating task:', task.title, 'zeitraum:', zeitraum, 'due:', dueDate);
      const created = await createTask({
        title: task.title,
        description: `${plantName}: ${task.title} (${label})`,
        category: task.category || 'pflege',
        priority: 'medium',
        zeitraum,
        due_date: dueDate,
        scheduled_date: dueDate ? dueDate.split('T')[0] : null,
        plant_ids: [plantId],
      });
      console.log('Task created:', created.id);
    } catch (e: any) {
      console.error('Task creation failed:', task.title, e?.message || e);
    }
  }
}
