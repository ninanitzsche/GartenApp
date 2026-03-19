/**
 * AI Plant Identification Service
 * Uses Pl@ntNet API for plant identification
 * 
 * API Docs: https://my.plantnet.org/doc/api/identify
 * Free tier: 500 identifications/day
 */

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import {
  PlantIdentificationResult,
  PlantNetResponse,
  AI_ERROR_CODES,
} from '../types/ai';

const PLANTNET_API_URL = 'https://my-api.plantnet.org/v2/identify/all';
const PLANTNET_API_KEY = process.env.EXPO_PUBLIC_PLANTNET_API_KEY || '';

export interface IdentifyPlantOptions {
  organ?: 'leaf' | 'flower' | 'fruit' | 'bark' | 'auto';
  language?: string;
  includeRelatedImages?: boolean;
}

/**
 * Identify a plant from an image URI using Pl@ntNet API
 */
export async function identifyPlant(
  imageUri: string,
  options: IdentifyPlantOptions = {}
): Promise<PlantIdentificationResult> {
  const { organ = 'auto', language = 'de' } = options;

  if (!PLANTNET_API_KEY) {
    throw new Error('Pl@ntNet API key not configured. Set EXPO_PUBLIC_PLANTNET_API_KEY in .env');
  }

  try {
    // Read image as base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create form data
    const formData = new FormData();
    formData.append('images', {
      uri: imageUri,
      name: 'plant_image.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('organs', organ);

    // Call Pl@ntNet API
    const response = await fetch(
      `${PLANTNET_API_URL}?api-key=${PLANTNET_API_KEY}&lang=${language}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        // Don't set Content-Type for FormData - fetch will set it with boundary
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: formData,
    });

    if (!response.ok) {
      throw {
        code: AI_ERROR_CODES.API_ERROR,
        message: `Pl@ntNet API error: ${response.status}`,
      };
    }

    const data: PlantNetResponse = await response.json();

    // Parse response
    return parseIdentificationResult(data);
  } catch (error: any) {
    if (error.code) {
      throw error;
    }
    console.error('Error identifying plant:', error);
    throw {
      code: AI_ERROR_CODES.NETWORK_ERROR,
      message: `Network error: ${error.message}`,
    };
  }
}

/**
 * Parse Pl@ntNet response into our format
 */
function parseIdentificationResult(data: PlantNetResponse): PlantIdentificationResult {
  if (!data.results || data.results.length === 0) {
    throw {
      code: AI_ERROR_CODES.NO_RESULTS,
      message: 'No identification results found',
    };
  }

  const topResult = data.results[0];
  const species = topResult.species;

  return {
    name: species.commonNames?.[0] || species.scientificNameWithoutAuthor,
    scientificName: species.scientificName,
    confidence: topResult.score,
    family: species.family?.scientificNameWithoutAuthor || '',
    commonNames: species.commonNames || [],
    gbifId: topResult.gbif?.id,
    powoId: topResult.powo?.id,
  };
}

/**
 * Pick image from camera or gallery
 */
export async function pickImage(
  source: 'camera' | 'gallery'
): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
        });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0];
}

/**
 * Check remaining API quota
 */
export async function getRemainingQuota(): Promise<number> {
  try {
    const response = await fetch(
      `${PLANTNET_API_URL}?api-key=${PLANTNET_API_KEY}`
    );
    const data: PlantNetResponse = await response.json();
    return data.remainingIdentificationRequests || 0;
  } catch {
    return -1;
  }
}

/**
 * Get multiple identification suggestions
 */
export async function identifyPlantMultiple(
  imageUri: string,
  maxResults: number = 5
): Promise<PlantIdentificationResult[]> {
  const result = await identifyPlant(imageUri);
  
  // For now, return just the top result
  // TODO: Extend to return multiple results from Pl@ntNet
  return [result];
}
