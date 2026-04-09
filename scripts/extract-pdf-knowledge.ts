#!/usr/bin/env node

/**
 * PDF Knowledge Extraction CLI
 * Usage: npm run extract-knowledge [-- --dry] [-- --file=<filename>]
 */

import * as fs from 'fs';
import * as path from 'path';
import { PDFParse } from 'pdf-parse';

const AI_PROXY_URL = process.env.EXPO_PUBLIC_SUPABASE_URL 
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-proxy`
  : '';

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

${pdfText.substring(0, 12000)}

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
  return JSON.parse(cleaned);
}

export function generateId(): string {
  return `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function processPdf(
  pdfPath: string, 
  dryRun: boolean = false
): Promise<{ filename: string; articles: number; plants: number }> {
  const filename = path.basename(pdfPath);
  console.log(`\n📄 Processing: ${filename}`);
  
  if (dryRun) {
    console.log('   [DRY RUN] Would process this PDF');
    return { filename, articles: 0, plants: 0 };
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: pdfBuffer });
  const textResult = await parser.getText();
  const text = textResult.text;

  console.log(`   Pages: ${textResult.total}`);
  console.log(`   Text length: ${text.length} chars`);

  const extracted = await extractKnowledgeFromText(text, filename);
  
  console.log(`   ✅ Extracted ${extracted.articles.length} articles`);
  console.log(`   ✅ Extracted knowledge for ${extracted.plantKnowledge.length} plants`);

  await parser.destroy();

  return {
    filename,
    articles: extracted.articles.length,
    plants: extracted.plantKnowledge.length,
  };
}

export async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry');
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const specificFile = fileArg ? fileArg.split('=')[1] : null;

  console.log('🌱 PDF Knowledge Extraction');
  console.log('==========================\n');

  if (!AI_PROXY_URL) {
    console.error('❌ Error: EXPO_PUBLIC_SUPABASE_URL not set');
    process.exit(1);
  }

  const pdfDir = path.join(__dirname, '..', 'docs', 'pdfs');
  const processedDir = path.join(pdfDir, 'processed');

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

  const results: Array<{ filename: string; articles: number; plants: number }> = [];

  for (const pdfPath of pdfFiles) {
    const result = await processPdf(pdfPath, dryRun);
    results.push(result);
  }

  console.log('\n📊 Summary:');
  console.log(`   Total PDFs: ${results.length}`);
  console.log(`   Total Articles: ${results.reduce((sum, r) => sum + r.articles, 0)}`);
  console.log(`   Total Plants: ${results.reduce((sum, r) => sum + r.plants, 0)}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);
