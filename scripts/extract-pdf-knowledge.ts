#!/usr/bin/env node

/**
 * PDF Knowledge Extraction CLI
 * Usage: 
 *   npm run extract-knowledge [-- --dry] [-- --file=<filename>] [-- --pages=1-50]
 */

import * as fs from 'fs';
import * as path from 'path';
import { PDFParse } from 'pdf-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_PROXY_URL = process.env.EXPO_PUBLIC_SUPABASE_URL 
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-proxy`
  : '';

const MAX_CHUNK_SIZE = 10000;

interface ExtractedKnowledge {
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

async function extractKnowledgeFromText(
  pdfText: string,
  filename: string
): Promise<ExtractedKnowledge> {
  const prompt = `Extrahiere strukturierte Gartenbau-Informationen aus folgendem PDF-Text von "${filename}":

${pdfText.substring(0, MAX_CHUNK_SIZE)}

Antworte NUR mit diesem JSON (keine Erklärungen):

{
  "articles": [
    {
      "title": "Titel des Artikels",
      "content": "Vollständiger Inhalt",
      "category": "pflege|schädlinge|pflanzen|ernte|boden|sonstiges",
      "tags": ["tag1"],
      "relatedPlants": ["Pflanze1"]
    }
  ],
  "plantKnowledge": [
    {
      "plantName": "Pflanzenname",
      "diseases": ["Krankheit1"],
      "pests": ["Schädling1"],
      "careTips": ["Tipp1"],
      "companions": [{"plant": "Pflanze", "type": "good"}],
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
          content: 'Du bist ein Gartenbau-Experte. Extrahiere strukturierte Informationen.'
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
  
  let parsedData;
  const startIdx = cleaned.indexOf('{');
  const arrayStartIdx = cleaned.indexOf('[');
  
  if (startIdx !== -1 && (arrayStartIdx === -1 || startIdx < arrayStartIdx)) {
    let jsonStr = cleaned.substring(startIdx);
    
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
    
    if (inString && lastQuotePos !== -1) {
      jsonStr = jsonStr.substring(0, lastQuotePos) + '"';
    }
    
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
    
    jsonStr = jsonStr.replace(/,\s*$/, '');
    
    for (let i = 0; i < openBrackets; i++) jsonStr += ']';
    for (let i = 0; i < openBraces; i++) jsonStr += '}';
    
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error('Could not extract valid JSON from AI response');
    }
  } else {
    throw new Error('AI response does not contain valid JSON structure');
  }
  
  if (!parsedData || !parsedData.articles || !parsedData.plantKnowledge) {
    throw new Error('Invalid JSON structure from AI');
  }
  
  return parsedData;
}

function mergeExtractedKnowledge(results: ExtractedKnowledge[]): ExtractedKnowledge {
  const allArticles: ExtractedKnowledge['articles'] = [];
  const allPlantKnowledge: ExtractedKnowledge['plantKnowledge'] = [];
  const seenPlants = new Set<string>();

  for (const result of results) {
    for (const article of result.articles) {
      const exists = allArticles.some(a => a.title === article.title);
      if (!exists) {
        allArticles.push(article);
      }
    }

    for (const plant of result.plantKnowledge) {
      const plantKey = plant.plantName.toLowerCase();
      if (!seenPlants.has(plantKey)) {
        seenPlants.add(plantKey);
        allPlantKnowledge.push(plant);
      }
    }
  }

  return {
    articles: allArticles,
    plantKnowledge: allPlantKnowledge,
  };
}

export function generateId(): string {
  return `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function processPdf(
  pdfPath: string, 
  dryRun: boolean = false,
  pageRange?: { start: number; end: number }
): Promise<{ filename: string; articles: number; plants: number }> {
  const filename = path.basename(pdfPath);
  console.log(`\n📄 Processing: ${filename}`);
  
  if (dryRun) {
    console.log('   [DRY RUN] Would process this PDF');
    return { filename, articles: 0, plants: 0 };
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: pdfBuffer });
  
  const parseOptions: any = {};
  if (pageRange) {
    parseOptions.partial = Array.from(
      { length: pageRange.end - pageRange.start + 1 }, 
      (_, i) => pageRange.start + i
    );
  }
  
  const textResult = await parser.getText(parseOptions);
  const text = textResult.text;

  console.log(`   Pages: ${textResult.total}${pageRange ? ` (pages ${pageRange.start}-${pageRange.end})` : ''}`);
  console.log(`   Text length: ${text.length} chars`);

  const chunkSize = MAX_CHUNK_SIZE;
  const numChunks = Math.ceil(text.length / chunkSize);
  console.log(`   Processing in ${numChunks} chunk(s)...`);

  const results: ExtractedKnowledge[] = [];
  
  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.substring(start, end);
    
    console.log(`   Chunk ${i + 1}/${numChunks} (${chunk.length} chars)...`);
    
    let extracted: ExtractedKnowledge | undefined;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        extracted = await extractKnowledgeFromText(chunk, `${filename} (Teil ${i + 1}/${numChunks})`);
        break;
      } catch (error: any) {
        console.log(`   ⚠️ Chunk ${i + 1} attempt ${attempt} failed: ${error.message}`);
        if (attempt === 3) {
          console.log(`   ⚠️ Skipping chunk ${i + 1} due to repeated failures`);
        }
      }
    }
    
    if (extracted) {
      results.push(extracted);
    }
  }

  await parser.destroy();

  if (results.length === 0) {
    throw new Error('Failed to extract knowledge from any chunk');
  }

  const merged = mergeExtractedKnowledge(results);
  
  console.log(`   ✅ Merged: ${merged.articles.length} articles, ${merged.plantKnowledge.length} plants`);

  return {
    filename,
    articles: merged.articles.length,
    plants: merged.plantKnowledge.length,
  };
}

function parsePageRange(rangeStr: string): { start: number; end: number } | undefined {
  if (!rangeStr) return undefined;
  
  const parts = rangeStr.split('-');
  if (parts.length !== 2) {
    console.error(`   Invalid page range format: ${rangeStr}. Use: 1-50`);
    return undefined;
  }
  
  const start = parseInt(parts[0], 10);
  const end = parseInt(parts[1], 10);
  
  if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
    console.error(`   Invalid page range: ${rangeStr}`);
    return undefined;
  }
  
  return { start, end };
}

export async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry');
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const pagesArg = args.find(arg => arg.startsWith('--pages='));
  
  const specificFile = fileArg ? fileArg.split('=')[1] : null;
  const pageRange = pagesArg ? parsePageRange(pagesArg.split('=')[1]) : undefined;

  console.log('🌱 PDF Knowledge Extraction (Chunk Mode)');
  console.log('========================================\n');

  if (!AI_PROXY_URL) {
    console.error('❌ Error: EXPO_PUBLIC_SUPABASE_URL not set');
    process.exit(1);
  }

  const pdfDir = path.join(__dirname, '..', 'docs', 'pdfs');

  if (!fs.existsSync(pdfDir)) {
    console.error(`❌ PDF directory not found: ${pdfDir}`);
    console.log('   Run: mkdir -p docs/pdfs && mv *.pdf docs/pdfs/');
    process.exit(1);
  }

  const pdfFiles = fs.readdirSync(pdfDir)
    .filter(f => f.endsWith('.pdf') && !f.startsWith('.'))
    .map(f => path.join(pdfDir, f))
    .filter(f => {
      if (specificFile) {
        return path.basename(f) === specificFile;
      }
      return true;
    });

  if (pdfFiles.length === 0) {
    console.log('❌ No PDFs found to process');
    process.exit(0);
  }

  console.log(`Found ${pdfFiles.length} PDF(s) to process`);
  if (dryRun) console.log('Mode: DRY RUN (no changes will be made)\n');
  if (pageRange) console.log(`Page range: ${pageRange.start}-${pageRange.end}\n`);

  const results: Array<{ filename: string; articles: number; plants: number }> = [];

  for (const pdfPath of pdfFiles) {
    try {
      const result = await processPdf(pdfPath, dryRun, pageRange);
      results.push(result);
    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Total PDFs: ${results.length}`);
  console.log(`   Total Articles: ${results.reduce((sum, r) => sum + r.articles, 0)}`);
  console.log(`   Total Plants: ${results.reduce((sum, r) => sum + r.plants, 0)}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);
