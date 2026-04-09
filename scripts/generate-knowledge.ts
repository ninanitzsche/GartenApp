#!/usr/bin/env node

/**
 * Knowledge Generator CLI
 * Generates and saves gardening knowledge to TypeScript files
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_PROXY_URL = process.env.EXPO_PUBLIC_SUPABASE_URL 
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-proxy`
  : '';

const PLANTS_TO_GENERATE = [
  'Tomate',
  'Paprika',
  'Gurke',
  'Zucchini',
  'Karotte',
  'Möhhre',
  'Salat',
  'Spinat',
  'Erbse',
  'Bohne',
  'Kartoffel',
  'Zwiebel',
  'Knoblauch',
  'Lauch',
  'Kohl',
  'Brokkoli',
  'Blumenkohl',
  'Radieschen',
  'Rettich',
  'Rote Bete',
  'Mangold',
  'Zuckermais',
  'Kürbis',
  'Melone',
  'Erdbeere',
  'Himbeere',
  'Johannisbeere',
  'Stachelbeere',
  'Apfel',
  'Birne',
  'Pflaume',
  'Kirsche',
  'Basilikum',
  'Petersilie',
  'Schnittlauch',
  'Dill',
  'Koriander',
  'Minze',
  'Thymian',
  'Rosmarin',
  'Salbei',
  'Oregano',
];

interface GeneratedPlantKnowledge {
  plantName: string;
  diseases: string[];
  pests: string[];
  careTips: string[];
  companions: { plant: string; type: 'good' | 'avoid' }[];
  sowingTime: string;
  harvestTime: string;
}

async function generatePlantKnowledge(plantName: string): Promise<GeneratedPlantKnowledge> {
  const prompt = `Generiere Gartenbau-Wissen für "${plantName}" auf Deutsch.

Antworte NUR mit diesem JSON (keine Erklärungen):

{
  "plantName": "${plantName}",
  "diseases": ["Krankheit 1", "Krankheit 2"],
  "pests": ["Schädling 1", "Schädling 2"],
  "careTips": ["Pflegetipp 1", "Pflegetipp 2", "Pflegetipp 3"],
  "companions": [
    {"plant": "Pflanze X", "type": "good"},
    {"plant": "Pflanze Y", "type": "avoid"}
  ],
  "sowingTime": "März-Mai oder N/A",
  "harvestTime": "Juli-September oder N/A"
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
          content: 'Du bist ein Gartenbau-Experte. Antworte NUR im JSON-Format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
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
  
  try {
    return JSON.parse(cleaned);
  } catch {
    const startIdx = cleaned.indexOf('{');
    if (startIdx !== -1) {
      let jsonStr = cleaned.substring(startIdx);
      jsonStr = jsonStr.replace(/,\s*$/, '');
      return JSON.parse(jsonStr);
    }
    throw new Error('Could not parse JSON');
  }
}

function generateId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function main() {
  console.log('🌱 Knowledge Generator');
  console.log('====================\n');

  if (!AI_PROXY_URL) {
    console.error('❌ Error: EXPO_PUBLIC_SUPABASE_URL not set');
    process.exit(1);
  }

  const dataDir = path.join(__dirname, '..', 'src', 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const plantKnowledgeMapPath = path.join(dataDir, 'plant-knowledge-map.ts');
  const pdfSourcesPath = path.join(dataDir, 'pdf-sources.ts');

  const existingKnowledge: any[] = [];
  const existingPlants = new Set<string>();

  if (fs.existsSync(plantKnowledgeMapPath)) {
    const content = fs.readFileSync(plantKnowledgeMapPath, 'utf-8');
    const match = content.match(/export const PLANT_KNOWLEDGE_MAP.*?= (.*?);/s);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        existingKnowledge.push(...parsed);
        parsed.forEach((entry: any) => existingPlants.add(entry.plantName.toLowerCase()));
      } catch {}
    }
  }

  console.log(`Already have knowledge for ${existingPlants.size} plants`);
  console.log(`Generating knowledge for ${PLANTS_TO_GENERATE.length} plants...\n`);

  const newKnowledge: any[] = [];
  let skipped = 0;

  for (const plant of PLANTS_TO_GENERATE) {
    if (existingPlants.has(plant.toLowerCase())) {
      console.log(`⏭️  Skipping ${plant} (already exists)`);
      skipped++;
      continue;
    }

    console.log(`🌱 Generating knowledge for: ${plant}...`);
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const knowledge = await generatePlantKnowledge(plant);
        newKnowledge.push({
          plantName: knowledge.plantName || plant,
          articleIds: [],
          extractedInfo: {
            diseases: knowledge.diseases || [],
            pests: knowledge.pests || [],
            careTips: knowledge.careTips || [],
            companions: knowledge.companions || [],
            sowingTime: knowledge.sowingTime || '',
            harvestTime: knowledge.harvestTime || '',
          },
        });
        console.log(`   ✅ Done`);
        break;
      } catch (error: any) {
        if (attempt === 3) {
          console.log(`   ❌ Failed after 3 attempts: ${error.message}`);
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const allKnowledge = [...existingKnowledge, ...newKnowledge];

  const fileContent = `/**
 * Plant to Knowledge mapping
 * Generated by scripts/generate-knowledge.ts
 */

export interface PlantKnowledgeEntry {
  plantName: string;
  articleIds: string[];
  extractedInfo: {
    diseases?: string[];
    pests?: string[];
    careTips?: string[];
    companions?: { plant: string; type: 'good' | 'avoid' }[];
    sowingTime?: string;
    harvestTime?: string;
  };
}

export const PLANT_KNOWLEDGE_MAP: PlantKnowledgeEntry[] = ${JSON.stringify(allKnowledge, null, 2)};
`;

  fs.writeFileSync(plantKnowledgeMapPath, fileContent);
  console.log(`\n✅ Saved ${allKnowledge.length} plants to plant-knowledge-map.ts`);

  console.log('\n📊 Summary:');
  console.log(`   Total plants: ${allKnowledge.length}`);
  console.log(`   New plants: ${newKnowledge.length}`);
  console.log(`   Skipped: ${skipped}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);
