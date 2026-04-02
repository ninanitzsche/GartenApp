import { PlantDiseaseData } from '../types/ai';

export async function identifyDisease(
  imageUri: string,
  organ: 'leaf' | 'flower' | 'fruit' | 'bark' | 'auto' = 'auto'
): Promise<PlantDiseaseData | null> {
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  
  if (!SUPABASE_URL) {
    console.warn('Supabase URL not configured');
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    console.log('Sending disease identification request via proxy...');
    
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/plantnet-disease-proxy`,
      {
        method: 'POST',
        body: JSON.stringify({ imageUrl: imageUri, organ }),
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('PlantNet disease API error:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    
    return {
      results: data.results || [],
      remainingRequests: data.remainingIdentificationRequests || 0,
      identifiedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.error('Disease identification timeout');
      return null;
    }
    console.error('Disease identification error:', error);
    return null;
  }
}
