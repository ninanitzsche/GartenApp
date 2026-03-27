/**
 * Permapeople Service
 * Permaculture Plant Database API - https://permapeople.org
 */

import { PermapeoplePlantData } from '../types/ai';

const PERMAPEOPLE_BASE_URL = 'https://permapeople.org/api';

export async function searchPermapeoplePlant(query: string): Promise<PermapeoplePlantData | null> {
  const keyId = process.env.EXPO_PUBLIC_PERMAPEOPLE_KEY_ID;
  const keySecret = process.env.EXPO_PUBLIC_PERMAPEOPLE_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('Permapeople API keys not configured');
    return null;
  }

  try {
    const response = await fetch(`${PERMAPEOPLE_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-permapeople-key-id': keyId,
        'x-permapeople-key-secret': keySecret,
      },
      body: JSON.stringify({ q: query }),
    });

    if (!response.ok) {
      console.error('Permapeople API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.plants && data.plants.length > 0) {
      return parsePermapeopleData(data.plants[0]);
    }

    return null;
  } catch (error) {
    console.error('Permapeople search error:', error);
    return null;
  }
}

function parsePermapeopleData(plant: any): PermapeoplePlantData {
  const data = plant.data || [];
  
  return {
    id: plant.id,
    name: plant.name,
    scientific_name: plant.scientific_name,
    data,
  };
}
