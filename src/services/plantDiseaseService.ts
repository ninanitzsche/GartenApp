import { PlantDiseaseData } from '../types/ai';

const PLANTNET_BASE_URL = 'https://my-api.plantnet.org/v2';

export async function identifyDisease(
  imageUri: string,
  organ: 'leaf' | 'flower' | 'fruit' | 'bark' | 'auto' = 'auto'
): Promise<PlantDiseaseData | null> {
  const apiKey = process.env.EXPO_PUBLIC_PLANTNET_API_KEY;
  
  if (!apiKey) {
    console.warn('PlantNet API key not configured');
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    console.log('Reading image...');
    
    const responseImg = await fetch(imageUri);
    const blob = await responseImg.blob();
    
    console.log('Sending disease identification request...');
    
    const formData = new FormData();
    formData.append('images', blob as any);
    
    const response = await fetch(
      `${PLANTNET_BASE_URL}/diseases/identify?api-key=${apiKey}&lang=de&nb-results=3&include-related-images=true`,
      {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PlantNet disease API error:', response.status, errorText);
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
