/**
 * Perenual Service
 * Plant Care Data API - https://perenual.com
 * 
 * This service returns the complete data object from the Perenual API,
 * ensuring all available data fields are accessible to callers.
 */

import { PerenualPlantData } from '../types/ai';

const PERENUAL_BASE_URL = 'https://perenual.com/api/v2';

console.log('Perenual service loaded! API key from env:', process.env.EXPO_PUBLIC_PERENUAL_API_KEY ? 'SET' : 'NOT SET');

export async function searchPerenualPlant(query: string): Promise<PerenualPlantData | null> {
  const apiKey = process.env.EXPO_PUBLIC_PERENUAL_API_KEY;
  
  console.log('Perenual service: API key check:', apiKey ? 'present' : 'missing');
  
  if (!apiKey) {
    console.warn('Perenual API key not configured');
    return null;
  }
  
  try {
    console.log('Perenual service: Making request for query:', query);
    const response = await fetch(
      `${PERENUAL_BASE_URL}/species-list?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=1`
    );
    
    console.log('Perenual service: Response status:', response.status);
    
    if (response.status === 429) {
      const error = new Error('Rate limited');
      error.message = '429';
      console.error('Perenual service: Rate limited');
      throw error;
    }
    
    if (!response.ok) {
      console.error('Perenual service: API error:', response.status, await response.text());
      return null;
    }
    
    const data = await response.json();
    console.log('Perenual service: Response data:', JSON.stringify(data).substring(0, 200) + '...');
    
    if (data.data && data.data.length > 0) {
      const plantId = data.data[0].id;
      console.log('Perenual service: Found plant ID:', plantId);
      return await getPerenualPlantDetails(plantId);
    }
    
    console.log('Perenual service: No plants found for query:', query);
    return null;
  } catch (error) {
    console.error('Perenual service: Search error:', error);
    return null;
  }
}

export async function getPerenualPlantDetails(plantId: number): Promise<PerenualPlantData | null> {
  const apiKey = process.env.EXPO_PUBLIC_PERENUAL_API_KEY;
  
  if (!apiKey) return null;
  
  try {
    console.log('Perenual service: Getting details for plant ID:', plantId);
    const response = await fetch(
      `${PERENUAL_BASE_URL}/species/details/${plantId}?key=${apiKey}`
    );
    
    console.log('Perenual service: Details response status:', response.status);
    
    if (!response.ok) {
      console.error('Perenual service: Details API error:', response.status, await response.text());
      return null;
    }
    
    const data = await response.json();
    console.log('Perenual service: Details data received for plant ID:', plantId);
    return data;
  } catch (error) {
    console.error('Perenual service: Details error:', error);
    return null;
  }
}
