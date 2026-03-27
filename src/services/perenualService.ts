/**
 * Perenual Service
 * Plant Care Data API - https://perenual.com
 */

import { PerenualPlantData } from '../types/ai';

const PERENUAL_BASE_URL = 'https://perenual.com/api/v2';

export async function searchPerenualPlant(query: string): Promise<PerenualPlantData | null> {
  const apiKey = process.env.EXPO_PUBLIC_PERENUAL_API_KEY;
  
  if (!apiKey) {
    console.warn('Perenual API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${PERENUAL_BASE_URL}/species-list?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=1`
    );

    if (!response.ok) {
      console.error('Perenual API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const plantId = data.data[0].id;
      return await getPerenualPlantDetails(plantId);
    }

    return null;
  } catch (error) {
    console.error('Perenual search error:', error);
    return null;
  }
}

export async function getPerenualPlantDetails(plantId: number): Promise<PerenualPlantData | null> {
  const apiKey = process.env.EXPO_PUBLIC_PERENUAL_API_KEY;
  
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `${PERENUAL_BASE_URL}/species/details/${plantId}?key=${apiKey}`
    );

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Perenual details error:', error);
    return null;
  }
}
