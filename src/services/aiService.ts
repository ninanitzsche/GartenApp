/**
 * AI Plant Identification Service
 * Uses Pl@ntNet API directly from the browser
 *
 * API Docs: https://my.plantnet.org/doc/api/identify
 * Free tier: 500 identifications/day
 */

import * as ImagePicker from 'expo-image-picker';
import {
  PlantIdentificationResult,
  PlantNetResponse,
  AI_ERROR_CODES,
} from '../types/ai';

const PLANTNET_API_KEY = process.env.EXPO_PUBLIC_PLANTNET_API_KEY || '';
const PLANTNET_URL = `https://my-api.plantnet.org/v2/identify/weurope`;

export interface IdentifyPlantOptions {
  organ?: 'leaf' | 'flower' | 'fruit' | 'bark' | 'auto';
  language?: string;
  includeRelatedImages?: boolean;
}

/**
 * Identify a plant from an image URI using Pl@ntNet API directly
 */
export async function identifyPlant(
  imageUri: string,
  options: IdentifyPlantOptions = {}
): Promise<PlantIdentificationResult> {
  const { organ = 'auto', language = 'de' } = options;

  if (!PLANTNET_API_KEY) {
    throw new Error('PlantNet API key not configured. Set EXPO_PUBLIC_PLANTNET_API_KEY in .env');
  }

  try {
    let imageBlob: Blob;

    if (imageUri.startsWith('blob:')) {
      const response = await fetch(imageUri);
      imageBlob = await response.blob();
    } else if (imageUri.startsWith('data:')) {
      const response = await fetch(imageUri);
      imageBlob = await response.blob();
    } else {
      const response = await fetch(imageUri);
      imageBlob = await response.blob();
    }

    // Create form data with image
    const formData = new FormData();
    formData.append('images', imageBlob, 'plant.jpg');
    formData.append('organs', organ);

    // Call PlantNet API directly
    const response = await fetch(`${PLANTNET_URL}?api-key=${PLANTNET_API_KEY}&lang=${language}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        code: AI_ERROR_CODES.API_ERROR,
        message: errorData.error || `API error: ${response.status}`,
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
  return -1;
}

/**
 * Get multiple identification suggestions
 */
export async function identifyPlantMultiple(
  imageUri: string,
  maxResults: number = 5
): Promise<PlantIdentificationResult[]> {
  const result = await identifyPlant(imageUri);
  return [result];
}
