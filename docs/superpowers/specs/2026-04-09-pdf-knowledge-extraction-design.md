# PDF Knowledge Extraction Feature

## Overview

CLI script that extracts gardening knowledge from PDFs and integrates it into the app's data layer. Once processed, PDFs can be deleted.

## Input

PDFs in project root:
- `eBook_gemuesegartenkurs.pdf` (13 MB)
- `Sch-C3-A4dlingshandbuch.pdf` (4.7 MB)
- `Kleiner-20Gartenplan.pdf` (2.3 MB)
- `Obstgarten_starten_ebook_...pdf` (2.4 MB)
- `Gem-C3-BCsekrankheiten.pdf` (2.3 MB)

## Output

### 1. Knowledge Articles (`src/data/knowledge-articles.ts`)

```typescript
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: 'pflege' | 'schädlinge' | 'pflanzen' | 'ernte' | 'boden' | 'sonstiges';
  tags: string[];
  sourceType: 'pdf';
  sourceFile: string; // original PDF filename
  relatedPlants: string[]; // plant names this article applies to
  created_at: string;
}
```

### 2. Plant Knowledge Map (`src/data/plant-knowledge-map.ts`)

```typescript
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
```

### 3. PDF Source Registry (`src/data/pdf-sources.ts`)

```typescript
export interface ProcessedPDF {
  filename: string;
  processedAt: string;
  articleCount: number;
  plantsFound: string[];
}
```

## Process Flow

1. User runs `npm run extract-knowledge`
2. Script lists unprocessed PDFs from `/docs/pdfs/`
3. For each PDF:
   - Parse text content (pdf-parse)
   - Send to OpenAI for structured extraction
   - Save extracted articles to knowledge-articles.ts
   - Update plant-knowledge-map.ts
   - Update pdf-sources.ts
   - Move PDF to `/docs/pdfs/processed/`
4. Report summary

## Extraction Categories

- **Krankheiten**: Symptoms, causes, prevention, treatment
- **Schädlinge**: Pest names, damage signs, organic countermeasures
- **Pflege**: Watering, fertilizing, pruning tips
- **Mischkultur**: Companion planting info
- **Aussaat/Ernte**: Timing information
- **Standort**: Light, soil requirements

## Technical Approach

- **Runtime**: Node.js script (not Expo/RN)
- **PDF Parsing**: `pdf-parse` npm package
- **AI Extraction**: OpenAI API via existing `src/services/openai.ts`
- **Output**: TypeScript files in `src/data/`

## Commands

```bash
npm run extract-knowledge          # Process all PDFs in /docs/pdfs/
npm run extract-knowledge -- --dry # Preview what would be extracted
npm run extract-knowledge -- --file eBook_gemuesegartenkurs.pdf # Single file
```

## Post-Processing

After successful extraction:
- Move PDFs to `/docs/pdfs/processed/` (archive)
- Or delete after manual review
- Update `.gitignore` to exclude processed PDFs

## Future Considerations

- Admin UI screen for re-processing
- Integration with bed planning (Permagilden)
- Plant identification enhancement with extracted knowledge
