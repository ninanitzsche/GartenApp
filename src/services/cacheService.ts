/**
 * AI Identification Cache Service
 * Caches plant identifications to reduce API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  PlantIdentificationResult,
  IdentificationCache,
} from '../types/ai';

const CACHE_KEY_PREFIX = '@ai_identification:';
const CACHE_TTL_DAYS = 30;

export interface CacheResult {
  found: boolean;
  result?: PlantIdentificationResult;
  age?: number;
}

/**
 * Generate hash for image URI (for cache key)
 */
async function generateImageHash(uri: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    uri
  );
  return hash;
}

/**
 * Store identification result in cache
 */
export async function cacheIdentification(
  imageUri: string,
  result: PlantIdentificationResult
): Promise<void> {
  try {
    const imageHash = await generateImageHash(imageUri);
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
    const imageHash = await generateImageHash(imageUri);
    const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${imageHash}`);

    if (!cached) {
      return { found: false };
    }

    const cache: IdentificationCache = JSON.parse(cached);
    const age = Date.now() - cache.timestamp;
    const maxAge = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

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
