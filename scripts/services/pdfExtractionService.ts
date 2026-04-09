/**
 * AI-powered PDF content extraction
 */

const AI_PROXY_URL = process.env.EXPO_PUBLIC_SUPABASE_URL 
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-proxy`
  : '';

export interface ExtractedKnowledge {
  articles: Array<{
    title: string;
    content: string;
    category: 'pflege' | 'schädlinge' | 'pflanzen' | 'ernte' | 'boden' | 'sonstiges';
    tags: string[];
    relatedPlants: string[];
  }>;
  plantKnowledge: Array<{
    plantName: string;
    diseases?: string[];
    pests?: string[];
    careTips?: string[];
    companions?: { plant: string; type: 'good' | 'avoid' }[];
    sowingTime?: string;
    harvestTime?: string;
  }>;
}

export async function extractKnowledgeFromText(
  pdfText: string,
  filename: string
): Promise<ExtractedKnowledge> {
  if (!AI_PROXY_URL) {
    throw new Error('AI_PROXY_URL not configured');
  }

  const prompt = `Extrahiere strukturierte Gartenbau-Informationen aus folgendem PDF-Text von "${filename}":

${pdfText.substring(0, 12000)}

Antworte NUR mit diesem JSON (keine Erklärungen):

{
  "articles": [
    {
      "title": "Titel des Artikels",
      "content": "Vollständiger Inhalt (max 500 Wörter)",
      "category": "pflege|schädlinge|pflanzen|ernte|boden|sonstiges",
      "tags": ["tag1", "tag2"],
      "relatedPlants": ["Pflanze1", "Pflanze2"]
    }
  ],
  "plantKnowledge": [
    {
      "plantName": "Pflanzenname",
      "diseases": ["Krankheit1", "Krankheit2"],
      "pests": ["Schädling1"],
      "careTips": ["Tipp1", "Tipp2"],
      "companions": [{"plant": "Pflanze", "type": "good|avoid"}],
      "sowingTime": "März-Mai",
      "harvestTime": "Juli-September"
    }
  ]
}`;

  const response = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'Du bist ein Gartenbau-Experte. Extrahiere strukturierte Informationen aus Gartenbau-Texten. Antworte NUR im JSON-Format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0]?.message?.content?.trim();
  
  if (!content) {
    throw new Error('Empty AI response');
  }

  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
