# PDF Knowledge Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CLI script that extracts gardening knowledge from PDFs and integrates it into the app's data layer

**Architecture:** Standalone Node.js script outside Expo/RN, uses pdf-parse for extraction and existing OpenAI proxy for AI analysis

**Tech Stack:** Node.js, pdf-parse, TypeScript, existing `AI_PROXY_URL` from services

---

## File Structure

```
scripts/
├── extract-pdf-knowledge.ts    # Main CLI script
└── extract-pdf-knowledge.ts

src/data/
├── knowledge-articles.ts       # KnowledgeArticle[] - NEW
├── plant-knowledge-map.ts      # PlantKnowledgeEntry[] - NEW  
└── pdf-sources.ts             # ProcessedPDF[] tracking - NEW

docs/
└── pdfs/                      # Input folder (move PDFs here)
    └── processed/             # Archive after processing
```

---

## Tasks

### Task 1: Setup Directory & Install Dependencies

**Files:**
- Create: `docs/pdfs/` directory
- Create: `docs/pdfs/processed/` directory
- Modify: `package.json` - add `pdf-parse` dependency

- [ ] **Step 1: Create directories**

```bash
mkdir -p docs/pdfs/processed
```

- [ ] **Step 2: Add pdf-parse dependency**

```bash
npm install pdf-parse --save-dev
```

- [ ] **Step 3: Commit**

```bash
git add docs/pdfs package.json package-lock.json
git commit -m "chore: setup pdf extraction directories and dependencies"
```

---

### Task 2: Create Type Definitions

**Files:**
- Create: `src/data/knowledge-articles.ts`
- Create: `src/data/plant-knowledge-map.ts`
- Create: `src/data/pdf-sources.ts`

- [ ] **Step 1: Create knowledge-articles.ts**

```typescript
/**
 * Knowledge Articles from PDF extraction
 */

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: 'pflege' | 'schädlinge' | 'pflanzen' | 'ernte' | 'boden' | 'sonstiges';
  tags: string[];
  sourceType: 'pdf';
  sourceFile: string;
  relatedPlants: string[];
  created_at: string;
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [];
```

- [ ] **Step 2: Create plant-knowledge-map.ts**

```typescript
/**
 * Plant to Knowledge mapping
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

export const PLANT_KNOWLEDGE_MAP: PlantKnowledgeEntry[] = [];
```

- [ ] **Step 3: Create pdf-sources.ts**

```typescript
/**
 * PDF processing registry
 */

export interface ProcessedPDF {
  filename: string;
  processedAt: string;
  articleCount: number;
  plantsFound: string[];
}

export const PROCESSED_PDFS: ProcessedPDF[] = [];
```

- [ ] **Step 4: Commit**

```bash
git add src/data/knowledge-articles.ts src/data/plant-knowledge-map.ts src/data/pdf-sources.ts
git commit -m "feat: add PDF extraction data types"
```

---

### Task 3: Create AI Extraction Service

**Files:**
- Create: `scripts/services/pdfExtractionService.ts`

- [ ] **Step 1: Create extraction service**

```typescript
/**
 * AI-powered PDF content extraction
 */

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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/services/pdfExtractionService.ts
git commit -m "feat: add AI extraction service for PDFs"
```

---

### Task 4: Create Main CLI Script

**Files:**
- Create: `scripts/extract-pdf-knowledge.ts`

- [ ] **Step 1: Create main script**

```typescript
#!/usr/bin/env node

/**
 * PDF Knowledge Extraction CLI
 * Usage: npm run extract-knowledge [-- --dry] [-- --file <filename>]
 */

import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';

// Import services (we'll inline what we need to avoid import issues)
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

function generateId(): string {
  return `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function processPdf(pdfPath: string, dryRun: boolean = false): Promise<void> {
  const filename = path.basename(pdfPath);
  console.log(`\n📄 Processing: ${filename}`);
  
  if (dryRun) {
    console.log('   [DRY RUN] Would process this PDF');
    return;
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdfParse(pdfBuffer);
  const text = pdfData.text;

  console.log(`   Pages: ${pdfData.numpages}`);
  console.log(`   Text length: ${text.length} chars`);

  const extracted = await extractKnowledgeFromText(text, filename);
  
  console.log(`   ✅ Extracted ${extracted.articles.length} articles`);
  console.log(`   ✅ Extracted knowledge for ${extracted.plantKnowledge.length} plants`);

  return;
}

async function main() {
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

  for (const pdfPath of pdfFiles) {
    await processPdf(pdfPath, dryRun);
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
```

- [ ] **Step 2: Update package.json scripts**

```json
{
  "scripts": {
    "extract-knowledge": "npx ts-node scripts/extract-pdf-knowledge.ts",
    "extract-knowledge:dry": "npx ts-node scripts/extract-pdf-knowledge.ts -- --dry"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add scripts/extract-pdf-knowledge.ts package.json
git commit -m "feat: add PDF extraction CLI script"
```

---

### Task 5: Move PDFs to Input Directory

**Files:**
- Move: `*.pdf` from root to `docs/pdfs/`

- [ ] **Step 1: Move PDFs**

```bash
mv *.pdf docs/pdfs/
```

- [ ] **Step 2: Commit**

```bash
git add docs/pdfs/*.pdf
git commit -m "chore: move PDFs to docs/pdfs for processing"
```

---

### Task 6: Test with Dry Run

- [ ] **Step 1: Run dry run**

```bash
npm run extract-knowledge:dry
```

Expected: Lists PDFs found, shows what would be processed

---

## Post-Implementation

After successful extraction:
1. Review generated `src/data/knowledge-articles.ts`
2. Update `src/data/plant-knowledge-map.ts`
3. Optionally delete PDFs from `docs/pdfs/` or move to `processed/`
4. Update `.gitignore` if needed

---

## Verification

```bash
# Verify script runs
npm run extract-knowledge:dry

# Check generated files exist
ls -la src/data/knowledge-*.ts
```
