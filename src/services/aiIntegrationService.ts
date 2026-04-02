/**
 * AI Integration Service
 * Unified service for AI ↔ database operations with caching
 */
import * as ImageManipulator from 'expo-image-manipulator';
import {
  PlantIdentificationResult,
  PestDetectionResult,
  AIPhotoAnalysis,
  PlantDiseaseData,
} from '../types/ai';
import { Plant } from '../types/plant';
import {
  cacheAIIdentification,
  cachePestDetection,
  cacheSuggestions,
  cacheDisease,
  getAICache,
  invalidateAICache,
} from './cacheService';
import { identifyPlant } from './aiService';
import { identifyDisease } from './plantDiseaseService';

export async function compressImage(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error: any) {
    console.error('Image compression error:', error);
    throw new Error(`Bildkomprimierung fehlgeschlagen: ${error.message}`);
  }
}

export async function aiIdentificationWithCache(
  imageUri: string
): Promise<PlantIdentificationResult> {
  const imageHash = generateSimpleHash(imageUri);
  
  const cached = await getAICache<PlantIdentificationResult>('plant', imageHash);
  if (cached.found && cached.data) {
    return cached.data;
  }

  const identification = await identifyPlant(imageUri);
  await cacheAIIdentification(imageUri, identification);
  
  return identification;
}

export async function pestDetectionWithCache(
  imageUri: string
): Promise<PestDetectionResult> {
  const imageHash = generateSimpleHash(imageUri);
  
  const cached = await getAICache<PestDetectionResult>('pest', imageHash);
  if (cached.found && cached.data) {
    return cached.data;
  }

  const detection = await detectPest(imageUri);
  await cachePestDetection(imageUri, detection);
  
  return detection;
}

export async function getSuggestionsWithCache(
  plantId: string,
  season?: string
): Promise<any[]> {
  const currentSeason = season || getCurrentSeason();
  const cacheKey = `${plantId}:${currentSeason}`;
  
  const cached = await getAICache<any[]>('suggestion', cacheKey);
  if (cached.found && cached.data) {
    return cached.data;
  }

  const suggestions = await generateSuggestions(plantId, currentSeason);
  await cacheSuggestions(plantId, currentSeason, suggestions);
  
  return suggestions;
}

export async function invalidatePlantAICache(plantId: string): Promise<void> {
  await invalidateAICache('plant', plantId);
}

export async function invalidateSuggestionCache(
  plantId: string,
  season?: string
): Promise<void> {
  const currentSeason = season || getCurrentSeason();
  await invalidateAICache('suggestion', `${plantId}:${currentSeason}`);
}

export async function linkPhotoToAIAnalysis(
  photoId: string,
  analysisId: string,
  analysisType: 'plant' | 'pest'
): Promise<void> {
  console.log('Linking photo to AI analysis:', { photoId, analysisId, analysisType });
}

export async function getAIAnalysisForPhoto(photoId: string): Promise<any[]> {
  console.log('Getting AI analysis for photo:', photoId);
  return [];
}

async function detectPest(imageUri: string): Promise<PestDetectionResult> {
  return {
    pest: 'Unknown',
    confidence: 0,
    treatment: 'Please identify via plant identification first',
  };
}

async function generateSuggestions(plantId: string, season: string): Promise<any[]> {
  return [
    {
      id: `sug-${plantId}-${season}-1`,
      title: `Pflege für Saison ${season}`,
      description: 'Regelmäßig gießen und düngen',
      category: 'care',
    },
  ];
}

function generateSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function findMatchingPlants(
  identifiedName: string,
  existingPlants: Plant[]
): Plant[] {
  if (!identifiedName || existingPlants.length === 0) return [];
  
  const nameLower = identifiedName.toLowerCase().trim();
  
  return existingPlants.filter(plant => {
    const plantName = (plant.name || '').toLowerCase();
    const latinName = (plant.latin_name || '').toLowerCase();
    
    if (plantName === nameLower || latinName === nameLower) return true;
    if (plantName.includes(nameLower) || nameLower.includes(plantName)) return true;
    if (latinName.includes(nameLower) || nameLower.includes(latinName)) return true;
    
    return false;
  });
}

export async function identifyDiseaseWithCache(
  imageUri: string
): Promise<PlantDiseaseData | null> {
  const imageHash = generateSimpleHash(imageUri);
  
  const cached = await getAICache<PlantDiseaseData>('pest', imageHash);
  if (cached.found && cached.data) {
    return cached.data;
  }

  const diseaseData = await identifyDisease(imageUri);
  if (diseaseData) {
    await cacheDisease(imageUri, diseaseData);
  }
  
  return diseaseData;
}

function calculateHealthStatus(
  diseaseData?: PlantDiseaseData
): 'gesund' | 'krank' | 'unsicher' {
  if (!diseaseData || !diseaseData.results || diseaseData.results.length === 0) {
    return 'gesund';
  }
  const topScore = diseaseData.results[0]?.score || 0;
  if (topScore >= 0.7) return 'krank';
  if (topScore >= 0.4) return 'unsicher';
  return 'gesund';
}

export async function analyzePhotoWithHealth(
  photoUri: string,
  existingPlants: Plant[]
): Promise<AIPhotoAnalysis> {
  let identification: PlantIdentificationResult;
  try {
    identification = await aiIdentificationWithCache(photoUri);
  } catch (error) {
    return {
      plantIdentification: null,
      diseaseAnalysis: null,
      healthStatus: 'unsicher',
      matchingPlants: [],
      bestMatch: null,
      errors: { identification: (error as Error).message },
    };
  }

  const [diseaseResult, matchingResult] = await Promise.allSettled([
    identifyDiseaseWithCache(photoUri),
    findMatchingPlants(identification.name, existingPlants),
  ]);

  return {
    plantIdentification: identification,
    diseaseAnalysis: diseaseResult.status === 'fulfilled' ? diseaseResult.value : null,
    matchingPlants: matchingResult.status === 'fulfilled' ? matchingResult.value : [],
    bestMatch: matchingResult.status === 'fulfilled' && matchingResult.value.length > 0 
      ? matchingResult.value[0] 
      : null,
    healthStatus: calculateHealthStatus(
      diseaseResult.status === 'fulfilled' ? diseaseResult.value ?? undefined : undefined
    ),
    errors: {
      identification: undefined,
      disease: diseaseResult.status === 'rejected' ? String(diseaseResult.reason) : undefined,
      matching: matchingResult.status === 'rejected' ? String(matchingResult.reason) : undefined,
    },
  };
}