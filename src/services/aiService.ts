/**
 * AI Service
 * Uses Supabase Edge Function as CORS proxy for OpenCode Zen API
 */

import { supabase } from './supabase';

const AI_PROXY_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-proxy`;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export interface AIPlantCareData {
  plantingNotes: string[];
  careTips: string[];
  companionPlants: string[];
  badCompanions: string[];
  tasks: Array<{ title: string; zeitraum: string; category: string }>;
  profile: {
    height: string;
    spread: string;
    waterNeeds: string;
    wateringMethod: string;
    light: string;
    soil: string;
    pollinatorScore: number;
    beneficialInsectScore: number;
    frostTolerance: string;
    isToxic: boolean;
    toxicTo: string;
    isInvasive: boolean;
    edibleParts: string;
    harvestTime: string;
    expectedYield: string;
  };
  permaculture: {
    pestControl: string[];
    soilImprovement: string[];
    interactions: string[];
    weedManagement: string[];
  };
}

export interface AITaskSuggestion {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  season: string;
  frequency?: string; // e.g., "weekly", "monthly", "as needed"
}

/**
 * Generate comprehensive plant care information using AI
 */
export async function generatePlantCareInfo(
  plantName: string,
  scientificName: string,
  structuredData: any
): Promise<AIPlantCareData | null> {
  try {
    const context = preparePlantContext(plantName, scientificName, structuredData);
    
    const prompt = `Erstelle umfassende Pflegeinformationen für: ${plantName} (${scientificName}).
${context}

Antworte NUR mit diesem JSON (keine Erklärungen, alle Felder ausfüllen):

{
  "plantingNotes": ["Pflanzzeit und Monate", "Standort und Licht", "Boden und pH", "Pflanzabstand", "Tiefe"],
  "careTips": ["Wasserbedarf konkret", "Düngung mit Menge", "Schnittzeitpunkt", "Überwinterung", "Häufige Fehler"],
  "companionPlants": ["Pflanze - warum gut", "Pflanze - warum gut", "Pflanze - warum gut", "Pflanze - warum gut", "Pflanze - warum gut"],
  "badCompanions": ["Pflanze - warum schlecht", "Pflanze - warum schlecht", "Pflanze - warum schlecht"],
  "tasks": [
    {"title": "Konkrete Aufgabe", "zeitraum": "Monat", "category": "gießen|düngen|ernten|pflanzen|schneiden|kontrollieren"}
  ],
  "profile": {
    "height": "Min-Max cm",
    "spread": "Min-Max cm",
    "waterNeeds": "niedrig|mittel|hoch",
    "wateringMethod": "Wie gießen",
    "light": "Sonne|Halbschatten|Schatten",
    "soil": "Bodentyp und pH",
    "pollinatorScore": 1-5,
    "beneficialInsectScore": 1-5,
    "frostTolerance": "bis -X°C",
    "isToxic": true/false,
    "toxicTo": "Mensch|Tier|keine",
    "isInvasive": true/false,
    "edibleParts": "Blätter|Blüten|Wurzeln|Früchte|keine",
    "harvestTime": "Monat-Monat oder N/A",
    "expectedYield": "Menge pro Pflanze oder N/A"
  },
  "permaculture": {
    "pestControl": ["Schädling und natürliche Bekämpfung", "Schädling und Bekämpfung"],
    "soilImprovement": ["Bodenverbesserung 1", "Bodenverbesserung 2"],
    "interactions": ["Positive Interaktion", "Negative Interaktion"],
    "weedManagement": ["Unkrautbekämpfung 1", "Unkrautbekämpfung 2"]
  }
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Botanik-Experte mit jahrzehntelanger Erfahrung. Antworte AUSSCHLIESSLICH im JSON-Format. Fülle ALLE Felder aus - keine leeren Arrays. Sei konkret und prägnant. companionPlants und badCompanions müssen 3-5 Einträge haben. Tasks brauchen konkrete Aufgaben mit Zeitangaben.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI API error:', errorData);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response message:', JSON.stringify(data.choices?.[0]?.message));
    let content = data.choices[0]?.message?.content?.trim();
    
    // MiMo model puts response in reasoning field sometimes
    if (!content && data.choices[0]?.message?.reasoning) {
      content = data.choices[0].message.reasoning.trim();
      console.log('Using reasoning field as content');
    }
    
    if (!content) {
      console.error('Empty AI response. Full data:', JSON.stringify(data));
      throw new Error('Empty response from AI');
    }

    console.log('AI raw content (first 300):', content.substring(0, 300));

    // Parse JSON response
    let parsedData;
    // Strip markdown code blocks
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      parsedData = JSON.parse(cleaned);
    } catch (parseError) {
      console.log('Direct parse failed, trying to fix truncated JSON');
      // Try to fix truncated JSON by closing open brackets/braces
      const startIdx = cleaned.indexOf('{');
      if (startIdx !== -1) {
        let jsonStr = cleaned.substring(startIdx);
        
        // If we're in the middle of a string, close it first
        let inString = false, escape = false;
        let lastQuotePos = -1;
        for (let i = 0; i < jsonStr.length; i++) {
          const c = jsonStr[i];
          if (escape) { escape = false; continue; }
          if (c === '\\') { escape = true; continue; }
          if (c === '"') { 
            inString = !inString;
            if (inString) lastQuotePos = i;
          }
        }
        
        // If we're in a string when it ends, close it
        if (inString && lastQuotePos !== -1) {
          jsonStr = jsonStr.substring(0, lastQuotePos) + '"';
        }
        
        // Count open brackets and braces
        let openBraces = 0, openBrackets = 0;
        inString = false; escape = false;
        for (let i = 0; i < jsonStr.length; i++) {
          const c = jsonStr[i];
          if (escape) { escape = false; continue; }
          if (c === '\\') { escape = true; continue; }
          if (c === '"') { inString = !inString; continue; }
          if (inString) continue;
          if (c === '{') openBraces++;
          if (c === '}') openBraces--;
          if (c === '[') openBrackets++;
          if (c === ']') openBrackets--;
        }
        
        // Remove trailing comma if present
        jsonStr = jsonStr.replace(/,\s*$/, '');
        
        // Close open structures
        for (let i = 0; i < openBrackets; i++) jsonStr += ']';
        for (let i = 0; i < openBraces; i++) jsonStr += '}';
        
        try {
          parsedData = JSON.parse(jsonStr);
          console.log('Successfully parsed truncated JSON');
        } catch (e) {
          console.error('Failed to repair JSON:', e);
          throw new Error('Could not extract valid JSON from AI response');
        }
      } else {
        throw new Error('AI response does not contain valid JSON');
      }
    }

    // Validate required fields
    const requiredFields = ['plantingNotes', 'careTips', 'companionPlants', 'badCompanions'];
    
    for (const field of requiredFields) {
      if (!(field in parsedData) || !Array.isArray(parsedData[field])) {
        parsedData[field] = [];
      }
    }
    if (!parsedData.profile || typeof parsedData.profile !== 'object') parsedData.profile = {};
    if (!parsedData.permaculture || typeof parsedData.permaculture !== 'object') parsedData.permaculture = {};
    if (!Array.isArray(parsedData.tasks)) parsedData.tasks = [];
    
    // Ensure permaculture arrays are actually arrays
    const permacultureArrays = ['pestControl', 'soilImprovement', 'interactions', 'weedManagement'];
    for (const field of permacultureArrays) {
      if (!Array.isArray(parsedData.permaculture[field])) {
        parsedData.permaculture[field] = [];
      }
    }

    return parsedData;
  } catch (error) {
    console.error('Error generating plant care info with AI:', error);
    return null;
  }
}

/**
 * Generate task suggestions for a plant based on its data and season
 */
export async function generateTaskSuggestions(
  plantName: string,
  scientificName: string,
  structuredData: any,
  currentSeason: string
): Promise<AITaskSuggestion[]> {
  try {
    const context = preparePlantContext(plantName, scientificName, structuredData);
    
    const prompt = `
Du bist ein Experte für Botanik und Pflanzenpflege. Erstelle konkrete, umsetzbare Pflegetätigkeiten für die folgende Pflanze für die aktuelle Saison.

Pflanzenname: ${plantName}
Wissenschaftlicher Name: ${scientificName}
Aktuelle Saison: ${currentSeason}
${context}

Bitte erstelle eine Liste von 3-5 konkreten Pflegetätigkeiten im folgenden JSON-Format:
[
  {
    "title": "Kurze, prägnante Überschrift der Tätigkeit",
    "description": "Detaillierte Beschreibung, wie die Tätigkeit ausgeführt wird",
    "category": "Kategorie wie gießen, düngen, schneiden, kontrollieren, umtopfen usw.",
    "priority": "low|medium|high",
    "season": "${currentSeason}",
    "frequency": "optional: wie oft die Tätigkeit wiederholt werden sollte (z.B. 'wöchentlich', 'alle 2 Wochen')"
  }
]

Antworte NUR mit dem JSON-Array, kein zusätzlicher Text.
`;

    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 45000);

    const response = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Botanik und Pflanzenpflege. Antworte ausschließlich im geforderten JSON-Format ohne zusätzlichen Erklärungstext.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
      signal: controller2.signal,
    });

    clearTimeout(timeout2);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI API error:', errorData);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error('Could not extract valid JSON array from AI response');
        }
      } else {
        throw new Error('AI response does not contain valid JSON array');
      }
    }

    // Validate each task has required fields
    if (!Array.isArray(parsedData)) {
      throw new Error('AI response is not an array');
    }

    return parsedData.map((task: any, index: number) => ({
      title: task.title || `Pflegetätigkeit ${index + 1}`,
      description: task.description || 'Beschreibung nicht verfügbar',
      category: task.category || 'allgemein',
      priority: task.priority === 'low' || task.priority === 'medium' || task.priority === 'high' ? task.priority : 'medium',
      season: task.season || currentSeason,
      frequency: task.frequency || undefined
    }));
  } catch (error) {
    console.error('Error generating task suggestions with AI:', error);
    return [];
  }
}

/**
 * Prepare context string from structured plant data
 */
function preparePlantContext(plantName: string, scientificName: string, structuredData: any): string {
  const contextParts = [];

  if (structuredData) {
    if (structuredData.watering) {
      contextParts.push(`Wasserbedarf: ${structuredData.watering}`);
    }
    if (structuredData.sunlight) {
      contextParts.push(`Sonnenlicht: ${Array.isArray(structuredData.sunlight) ? structuredData.sunlight.join(', ') : structuredData.sunlight}`);
    }
    if (structuredData.hardiness) {
      contextParts.push(`Winterhärte: Zone ${structuredData.hardiness?.min}-${structuredData.hardiness?.max}`);
    }
    if (structuredData.care_level) {
      contextParts.push(`Pflegelevel: ${structuredData.care_level}`);
    }
    if (structuredData.growth_rate) {
      contextParts.push(`Wachstumsrate: ${structuredData.growth_rate}`);
    }
    if (structuredData.soil) {
      contextParts.push(`Boden: ${Array.isArray(structuredData.soil) ? structuredData.soil.join(', ') : structuredData.soil}`);
    }
    if (structuredData.cycle) {
      contextParts.push(`Wuchszyklus: ${structuredData.cycle}`);
    }
    if (structuredData.maintenance) {
      contextParts.push(`Wartungsaufwand: ${structuredData.maintenance}`);
    }
    if (structuredData.flowering_season) {
      contextParts.push(`Blütezeit: ${structuredData.flowering_season}`);
    }
    if (structuredData.pruning_month) {
      contextParts.push(`Schnittmonat(e): ${Array.isArray(structuredData.pruning_month) ? structuredData.pruning_month.join(', ') : structuredData.pruning_month}`);
    }
    if (structuredData.description) {
      contextParts.push(`Beschreibung: ${structuredData.description}`);
    }
  }

  return contextParts.length > 0 ? `Zusatzinformationen:\n- ${contextParts.join('\n- ')}\n` : '';
}

/**
 * Get default values for missing fields
 */
function getDefaultValueForField(field: string): any {
  switch (field) {
    case 'careInstructions':
      return 'Pflegeinformationen für diese Pflanze sind derzeit nicht verfügbar.';
    case 'wateringGuide':
      return 'Gieße gemäß den spezifischen Bedürfnissen der Pflanze. Achte darauf, Staunässe zu vermeiden.';
    case 'sunlightGuide':
      return 'stelle die Pflanze an einen Standort mit passendem Lichtverhältnis.';
    case 'soilGuide':
      return 'verwende gut durchlässige Erde, die den spezifischen Bedürfnissen der Pflanze entspricht.';
    case 'fertilizingGuide':
      return 'dünge während der Wachstumsphase gemäß den Bedürfnissen der Pflanze.';
    case 'pruningGuide':
      return 'schneide bei Bedarf, um die Form zu erhalten und gesundes Wachstum zu fördern.';
    case 'commonProblems':
      return ['Keine spezifischen Probleme dokumentiert'];
    case 'seasonalTips':
      return {
        spring: 'Allgemeine Frühjahrspflege beachten',
        summer: 'Allgemeine Sommerpflege beachten',
        autumn: 'Allgemeine Herbstpflege beachten',
        winter: 'Allgemeine Winterpflege beachten'
      };
    case 'difficultyLevel':
      return 'intermediate';
    default:
      return null;
  }
}

/**
 * Identify a plant from an image using PlantNet API via Supabase proxy
 */
export async function identifyPlant(imageUri: string): Promise<import('../types/ai').PlantIdentificationResult> {
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL) throw new Error('Supabase URL not configured');
  if (!SUPABASE_ANON_KEY) throw new Error('Supabase anon key not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/plantnet-proxy`,
      {
        method: 'POST',
        body: JSON.stringify({ imageUrl: imageUri }),
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `PlantNet API error: ${response.status}`);
    }

    const data = await response.json();
    const best = data.results?.[0];

    if (!best) throw new Error('No identification results');

    return {
      name: best.species?.commonNames?.[0] || best.species?.scientificNameWithoutAuthor || 'Unbekannt',
      scientificName: best.species?.scientificName || '',
      confidence: best.score || 0,
      family: best.species?.family?.scientificNameWithoutAuthor || '',
      commonNames: best.species?.commonNames || [],
      genus: best.species?.genus?.scientificNameWithoutAuthor,
      gbifId: best.gbif?.id,
      powoId: best.powo?.id,
    };
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('PlantNet API timeout');
    }
    throw error;
  }
}

/**
 * Pick an image from gallery or camera
 */
export async function pickImage(source: 'gallery' | 'camera'): Promise<{ uri: string } | null> {
  const ImagePicker = await import('expo-image-picker');

  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return null;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return null;
    return { uri: result.assets[0].uri };
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled || !result.assets[0]) return null;
  return { uri: result.assets[0].uri };
}