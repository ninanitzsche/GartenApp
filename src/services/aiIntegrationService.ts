/**
 * AI Integration Service
 * Unified service for AI ↔ database operations with caching
 */
import {
  PlantIdentificationResult,
  PestDetectionResult,
} from '../types/ai';
import {
  cacheAIIdentification,
  cachePestDetection,
  cacheSuggestions,
  getAICache,
  invalidateAICache,
} from './cacheService';
import { identifyPlant } from './aiService';

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