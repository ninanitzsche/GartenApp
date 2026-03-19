/**
 * AI Identification Cache Service
 * Caches plant identifications to reduce API calls
 * Extended to support all AI types (plant, pest, suggestion)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PlantIdentificationResult,
  IdentificationCache,
  AICacheType,
  CACHE_TTL,
  PestDetectionResult,
  TaskSuggestion,
} from '../types/ai';

const CACHE_KEY_PREFIX = '@ai_identification:';
const AI_CACHE_PREFIX = 'ai_cache';

const DEFAULT_TTL = CACHE_TTL.PLANT;

function generateSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export const CACHE_PREFIXES = {
  PLANT: `${AI_CACHE_PREFIX}:plant`,
  PEST: `${AI_CACHE_PREFIX}:pest`,
  SUGGESTION: `${AI_CACHE_PREFIX}:suggestion`,
} as const;

export const TTL_MS = CACHE_TTL;

export interface CacheResult {
  found: boolean;
  result?: PlantIdentificationResult;
  age?: number;
}

/**
 * Generate hash for image URI (for cache key)
 */
function generateImageHash(uri: string): string {
  return generateSimpleHash(uri);
}

/**
 * Store identification result in cache
 */
export async function cacheIdentification(
  imageUri: string,
  result: PlantIdentificationResult
): Promise<void> {
  try {
    const imageHash = generateImageHash(imageUri);
    const cache: IdentificationCache = {
      imageHash,
      result,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(
      `${CACHE_KEY_PREFIX}${imageHash}`,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.error('Error caching identification:', error);
  }
}

/**
 * Get cached identification for an image
 */
export async function getCachedIdentification(
  imageUri: string
): Promise<CacheResult> {
  try {
    const imageHash = generateImageHash(imageUri);
    const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${imageHash}`);

    if (!cached) {
      return { found: false };
    }

    const cache: IdentificationCache = JSON.parse(cached);
    const age = Date.now() - cache.timestamp;
    const maxAge = CACHE_TTL.PLANT;

    // Check if cache is still valid
    if (age > maxAge) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(`${CACHE_KEY_PREFIX}${imageHash}`);
      return { found: false };
    }

    return {
      found: true,
      result: cache.result,
      age,
    };
  } catch (error) {
    console.error('Error reading cached identification:', error);
    return { found: false };
  }
}

/**
 * Clear all cached identifications
 */
export async function clearIdentificationCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing identification cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  count: number;
  size: number;
}> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));

    let totalSize = 0;
    for (const key of cacheKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }

    return {
      count: cacheKeys.length,
      size: totalSize,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { count: 0, size: 0 };
  }
}

function cacheKey(type: AICacheType, id: string): string {
  const prefixMap = {
    plant: CACHE_PREFIXES.PLANT,
    pest: CACHE_PREFIXES.PEST,
    suggestion: CACHE_PREFIXES.SUGGESTION,
  };
  return `${prefixMap[type]}:${id}`;
}

function getTTL(type: AICacheType): number {
  switch (type) {
    case 'plant':
      return CACHE_TTL.PLANT;
    case 'pest':
      return CACHE_TTL.PEST;
    case 'suggestion':
      return CACHE_TTL.SUGGESTION;
    default:
      return DEFAULT_TTL;
  }
}

export async function cacheAIIdentification(
  imageUri: string,
  result: PlantIdentificationResult
): Promise<void> {
  try {
    const imageHash = generateImageHash(imageUri);
    const entry = {
      type: 'plant' as AICacheType,
      data: result,
      timestamp: Date.now(),
      ttl: getTTL('plant'),
    };
    await AsyncStorage.setItem(
      cacheKey('plant', imageHash),
      JSON.stringify(entry)
    );
  } catch (error) {
    console.error('Error caching AI identification:', error);
  }
}

export async function cachePestDetection(
  imageUri: string,
  result: PestDetectionResult
): Promise<void> {
  try {
    const imageHash = generateImageHash(imageUri);
    const entry = {
      type: 'pest' as AICacheType,
      data: result,
      timestamp: Date.now(),
      ttl: getTTL('pest'),
    };
    await AsyncStorage.setItem(
      cacheKey('pest', imageHash),
      JSON.stringify(entry)
    );
  } catch (error) {
    console.error('Error caching pest detection:', error);
  }
}

export async function cacheSuggestions(
  plantId: string,
  season: string,
  result: TaskSuggestion[]
): Promise<void> {
  try {
    const key = `${plantId}:${season}`;
    const entry = {
      type: 'suggestion' as AICacheType,
      data: result,
      timestamp: Date.now(),
      ttl: getTTL('suggestion'),
    };
    await AsyncStorage.setItem(
      cacheKey('suggestion', key),
      JSON.stringify(entry)
    );
  } catch (error) {
    console.error('Error caching suggestions:', error);
  }
}

export async function getAICache<T>(
  type: AICacheType,
  id: string
): Promise<{ found: boolean; data?: T; age?: number }> {
  try {
    const key = cacheKey(type, id);
    const cached = await AsyncStorage.getItem(key);

    if (!cached) {
      return { found: false };
    }

    const entry = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;
    const maxAge = entry.ttl || getTTL(type);

    if (age > maxAge) {
      await AsyncStorage.removeItem(key);
      return { found: false };
    }

    return {
      found: true,
      data: entry.data,
      age,
    };
  } catch (error) {
    console.error('Error reading AI cache:', error);
    return { found: false };
  }
}

export async function invalidateAICache(
  type: AICacheType,
  id: string
): Promise<void> {
  try {
    const key = cacheKey(type, id);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error invalidating AI cache:', error);
  }
}

export async function invalidateByPattern(pattern: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    if (matchingKeys.length > 0) {
      await AsyncStorage.multiRemove(matchingKeys);
    }
  } catch (error) {
    console.error('Error invalidating cache by pattern:', error);
  }
}

export async function getAICacheStats(): Promise<{
  plant: { count: number; size: number };
  pest: { count: number; size: number };
  suggestion: { count: number; size: number };
}> {
  try {
    const keys = await AsyncStorage.getAllKeys();

    const getStatsForType = async (prefix: string) => {
      const typeKeys = keys.filter((key) => key.startsWith(prefix));
      let totalSize = 0;
      for (const key of typeKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      return { count: typeKeys.length, size: totalSize };
    };
  
    return {
      plant: await getStatsForType(CACHE_PREFIXES.PLANT),
      pest: await getStatsForType(CACHE_PREFIXES.PEST),
      suggestion: await getStatsForType(CACHE_PREFIXES.SUGGESTION),
    };
  } catch (error) {
    console.error('Error getting AI cache stats:', error);
    return {
      plant: { count: 0, size: 0 },
      pest: { count: 0, size: 0 },
      suggestion: { count: 0, size: 0 },
    };
  }
}

export async function clearAICache(type?: AICacheType): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let keysToRemove: string[] = [];

    if (type) {
      const prefixMap = {
        plant: CACHE_PREFIXES.PLANT,
        pest: CACHE_PREFIXES.PEST,
        suggestion: CACHE_PREFIXES.SUGGESTION,
      };
      keysToRemove = keys.filter((key) => key.startsWith(prefixMap[type]));
    } else {
      keysToRemove = keys.filter(
        (key) =>
          key.startsWith(CACHE_PREFIXES.PLANT) ||
          key.startsWith(CACHE_PREFIXES.PEST) ||
          key.startsWith(CACHE_PREFIXES.SUGGESTION)
      );
    }

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.error('Error clearing AI cache:', error);
  }
}

export async function getAICacheAge(
  type: AICacheType,
  id: string
): Promise<number | null> {
  try {
    const key = cacheKey(type, id);
    const cached = await AsyncStorage.getItem(key);

    if (!cached) {
      return null;
    }

    const entry = JSON.parse(cached);
    return Date.now() - entry.timestamp;
  } catch (error) {
    console.error('Error getting AI cache age:', error);
    return null;
  }
}
