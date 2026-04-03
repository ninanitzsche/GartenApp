import { PlantDiseaseData } from '../types/ai';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export async function identifyDisease(
  imageUri: string,
  organ: 'leaf' | 'flower' | 'fruit' | 'bark' | 'auto' = 'auto'
): Promise<PlantDiseaseData | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured');
    return null;
  }

  try {
    console.log('Sending disease identification request via proxy...');

    let imageData = imageUri;
    
    if (imageUri.startsWith('file://') || imageUri.startsWith('/')) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        imageData = base64;
      } catch (e) {
        console.error('Error converting image to base64:', e);
      }
    }
    
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/plantnet-disease-proxy`,
      {
        method: 'POST',
        body: JSON.stringify({ imageUrl: imageData, organ }),
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

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
    console.error('Disease identification error:', error);
    return null;
  }
}
