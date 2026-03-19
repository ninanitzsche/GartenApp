# Phase 4: AI Integration - Plan

**Phase:** 4
**Created:** 2026-03-19
**Status:** Ready for execution

---

## Goal

Connect all AI features (Phase 1-3) to existing app infrastructure. Ensure identifications cache locally, integrate with plant database, and photo gallery displays AI analysis results.

---

## Requirements

- AI-04: Integration with existing data

---

## Wave 1 (Caching Infrastructure)

### Plan 1.1: Unified AI Cache Service

**Description:** Extend cache service to support all AI types (plant, pest, task suggestions) with typed keys and TTL management.

**Files Modified:**
- `src/services/cacheService.ts` (update)
- `src/types/ai.ts` (update)

**Tasks:**

```xml
<task name="1.1.1: Extend AI cache types">
<read_first>
- src/types/ai.ts (existing types)
</read_first>
<action>
Update src/types/ai.ts with:
- AICacheType: 'plant' | 'pest' | 'suggestion'
- AICacheEntry<T> interface with type, data, timestamp, ttl
- CACHE_TTL constants (PLANT: 7 days, PEST: 24h, SUGGESTION: 1 day)
- PlantIdentificationCacheEntry, PestDetectionCacheEntry, SuggestionCacheEntry
</action>
<acceptance_criteria>
- AICacheType union type defined
- Cache entries have consistent structure with timestamp and TTL
- TTL constants exported
</acceptance_criteria>
</task>

<task name="1.1.2: Extend cache service with AI functions">
<read_first>
- src/services/cacheService.ts (existing implementation)
</read_first>
<action>
Update src/services/cacheService.ts:
- Add cacheKey() helper: `${PREFIX}:${type}:${id}`
- Add cacheAIIdentification() wrapping existing cacheIdentification()
- Add cachePestDetection() new function for pest results
- Add cacheSuggestions() new function for task suggestions
- Add getAICache(type, id) generic getter with TTL check
- Add invalidateAICache(type, id) function
- Add invalidateByPattern(pattern) for bulk invalidation
- Keep existing functions for backwards compatibility
</action>
<acceptance_criteria>
- cachePestDetection() stores pest detection results
- cacheSuggestions() stores task suggestions with plantId key
- getAICache() checks TTL and returns cached or null
- invalidateAICache() removes specific cache entries
</acceptance_criteria>
</task>

<task name="1.1.3: Add cache statistics and management">
<read_first>
- src/services/cacheService.ts
</read_first>
<action>
Add to cacheService.ts:
- getAICacheStats() returns count and size by type
- clearAICache(type?) selectively clears by AI type
- getAICacheAge() returns age of specific cache entry
- Export cache constants: CACHE_PREFIXES, TTL_MS
</action>
<acceptance_criteria>
- Cache stats show breakdown by type
- Selective clearing works per AI type
- Constants exported for other services to use
</acceptance_criteria>
</task>
```

---

### Plan 1.2: AI Integration Service

**Description:** Create unified service for AI ↔ database operations.

**Files Modified:**
- `src/services/aiIntegrationService.ts` (new)

**Tasks:**

```xml
<task name="1.2.1: Create AI integration service">
<read_first>
- src/services/aiService.ts (Phase 1-2 AI services)
- src/services/cacheService.ts (extended cache)
- src/services/plantService.ts (plant operations)
</read_first>
<action>
Create src/services/aiIntegrationService.ts:
- aiIdentificationWithCache(imageUri): Promise<PlantIdentificationResult>
  - Check cache first → return cached if valid
  - Call aiService.identifyPlant() → cache result → return
- pestDetectionWithCache(imageUri): Promise<PestDetectionResult>
  - Same pattern for pest detection
- getSuggestionsWithCache(plantId): Promise<Task[]>
  - Check cache → return or generate → cache → return
- invalidatePlantAICache(plantId)
- invalidateSuggestionCache(plantId, season?)
- linkPhotoToAIAnalysis(photoId, analysisId, analysisType)
- getAIAnalysisForPhoto(photoId): Promise<AIAnalysis[]>
</action>
<acceptance_criteria>
- aiIdentificationWithCache checks and uses cache
- pestDetectionWithCache checks and uses cache
- getSuggestionsWithCache uses cache with plantId key
- Cache invalidation functions work correctly
</acceptance_criteria>
</task>
```

---

## Wave 2 (Database Integration)

### Plan 2.1: AI Metadata Storage

**Description:** Store AI analysis results in Supabase for persistence across devices.

**Files Modified:**
- `supabase/migrations/004_ai_metadata.sql` (new)
- `src/types/ai.ts` (update)

**Tasks:**

```xml
<task name="2.1.1: Create AI metadata migration">
<read_first>
- supabase/migrations/001_initial_schema.sql (existing schema)
</read_first>
<action>
Create supabase/migrations/004_ai_metadata.sql:
- ai_identifications table:
  - id UUID PRIMARY KEY
  - user_id UUID REFERENCES users
  - ai_type TEXT ('plant' | 'pest')
  - image_url TEXT
  - result_json JSONB
  - confidence DECIMAL
  - created_at TIMESTAMPTZ
  
- plant_identifications table:
  - id UUID PRIMARY KEY
  - plant_id UUID REFERENCES plants
  - identification_id UUID REFERENCES ai_identifications
  - linked_at TIMESTAMPTZ
  
- photo_ai_analysis table:
  - id UUID PRIMARY KEY
  - photo_id UUID REFERENCES photos
  - ai_type TEXT
  - analysis_id UUID REFERENCES ai_identifications
  - created_at TIMESTAMPTZ
  
Create indexes for:
- ai_identifications(user_id, created_at)
- photo_ai_analysis(photo_id)
</action>
<acceptance_criteria>
- Migration creates required tables
- Foreign key relationships established
- Indexes created for query performance
</acceptance_criteria>
</task>

<task name="2.1.2: Add AI metadata types">
<read_first>
- src/types/ai.ts
</read_first>
<action>
Update src/types/ai.ts:
- AIIdentification interface (db row)
- PlantIdentificationLink interface
- PhotoAIAnalysis interface
- AIAnalysisResult union type
</action>
<acceptance_criteria>
- TypeScript types match database schema
- Types can serialize to/from JSONB
</acceptance_criteria>
</task>

<task name="2.1.3: Create AI metadata service">
<read_first>
- src/services/photoService.ts (DB pattern)
</read_first>
<action>
Create src/services/aiMetadataService.ts:
- saveAIIdentification(type, imageUrl, result, confidence): Promise<string>
- linkIdentificationToPlant(identificationId, plantId): Promise<void>
- linkPhotoToAnalysis(photoId, analysisId, aiType): Promise<void>
- getAnalysesForPhoto(photoId): Promise<PhotoAIAnalysis[]>
- getIdentificationsForPlant(plantId): Promise<AIIdentification[]>
- syncLocalCacheToCloud(): Promise<void> (uploads local cache)
- fetchCloudAnalysisForPhoto(photoId): Promise<AIAnalysis | null>
</action>
<acceptance_criteria>
- Identifications save to cloud
- Photo → AI analysis linking works
- Local cache syncs to cloud on demand
</acceptance_criteria>
</task>
```

---

## Wave 3 (Gallery Enhancement)

### Plan 3.1: Photo Gallery AI Features

**Description:** Add AI badges, filtering, and analysis display to photo gallery.

**Files Modified:**
- `src/screens/GardenPhotoGalleryScreen.tsx` (update)
- `src/screens/PhotoGalleryScreen.tsx` (update)

**Tasks:**

```xml
<task name="3.1.1: Add AI filter and badge types">
<read_first>
- src/types/photo.ts (existing types)
</read_first>
<action>
Update src/types/photo.ts:
- PhotoFilters enum: ALL, AI_ANALYZED, MANUAL
- Extend Photo interface with: ai_analysis_ids?, has_ai_analysis: boolean
</action>
<acceptance_criteria>
- Filter type defined
- Photo type has AI analysis flag
</acceptance_criteria>
</task>

<task name="3.1.2: Update GardenPhotoGalleryScreen with AI features">
<read_first>
- src/screens/GardenPhotoGalleryScreen.tsx
- src/services/aiMetadataService.ts
</read_first>
<action>
Update GardenPhotoGalleryScreen.tsx:
- Add filter state: PhotoFilters (default: ALL)
- Add filter chips UI: "Alle" | "KI-Analysiert" | "Manuell"
- Load photos with AI analysis info
- Show AI badge (sparkles icon) on photos with analysis
- Filter photos based on selected filter
- Pass filter to loadPhotos()
</action>
<acceptance_criteria>
- Filter chips visible in header
- AI badge shows on analyzed photos
- Filter correctly shows/hides photos
</acceptance_criteria>
</task>

<task name="3.1.3: Update PhotoGalleryScreen with AI features">
<read_first>
- src/screens/PhotoGalleryScreen.tsx
</read_first>
<action>
Update PhotoGalleryScreen.tsx with same AI features:
- Filter chips for AI analysis
- AI badge on photos
- Filter state and logic
</action>
<acceptance_criteria>
- Same features as GardenPhotoGalleryScreen
- Consistent UX across gallery screens
</acceptance_criteria>
</task>
```

---

### Plan 3.2: Photo Detail with AI Analysis

**Description:** Show AI analysis results when viewing photo details.

**Files Modified:**
- `src/screens/GardenPhotoGalleryScreen.tsx` (update)
- `src/screens/PhotoGalleryScreen.tsx` (update)

**Tasks:**

```xml
<task name="3.2.1: Add AI analysis section to photo modal">
<read_first>
- src/screens/GardenPhotoGalleryScreen.tsx (modal implementation)
- src/services/aiMetadataService.ts
</read_first>
<action>
Update photo detail modal in GardenPhotoGalleryScreen.tsx:
- On photo tap, fetch AI analyses for this photo
- If has AI analysis, show collapsible section below image:
  - "KI-Analyse" header with sparkles icon
  - Plant identification result (if plant type)
  - Pest detection result (if pest type)
  - Confidence score with color coding
  - "Mehr erfahren" link to linked plant
- Show "Noch nicht analysiert" if no analysis
- "Analysieren" button if not yet analyzed
</action>
<acceptance_criteria>
- AI analysis section appears for analyzed photos
- Shows plant ID or pest detection results
- "Analysieren" button navigates to AI picker
</acceptance_criteria>
</task>
```

---

## Wave 4 (Integration)

### Plan 4.1: Connect All AI Features

**Description:** Wire up Phase 1-3 AI features to use the integration layer.

**Files Modified:**
- `src/services/aiService.ts` (update)
- `src/components/AIPhotoPicker.tsx` (update)
- `src/screens/PlantDetailScreen.tsx` (update)

**Tasks:**

```xml
<task name="4.1.1: Update aiService to use cache integration">
<read_first>
- src/services/aiService.ts
- src/services/aiIntegrationService.ts
</read_first>
<action>
Update aiService.ts:
- Replace direct API calls with aiIntegrationService calls
- identifyPlant() → aiIdentificationWithCache()
- detectPest() → pestDetectionWithCache()
- Ensure cache invalidation on errors
</action>
<acceptance_criteria>
- AI service uses caching layer
- Cached results returned when available
</acceptance_criteria>
</task>

<task name="4.1.2: Update AIPhotoPicker to save to cloud">
<read_first>
- src/components/AIPhotoPicker.tsx
- src/services/aiMetadataService.ts
</read_first>
<action>
Update AIPhotoPicker.tsx:
- After successful identification, save to ai_metadata_service
- Link to photo if photo provided
- Link to plant if plant selected
- Show synced indicator when saved to cloud
</action>
<acceptance_criteria>
- Identifications persist to cloud
- Photos linked to AI analyses
- Works across app restarts
</acceptance_criteria>
</task>

<task name="4.1.3: Show AI history on PlantDetailScreen">
<read_first>
- src/screens/PlantDetailScreen.tsx
- src/services/aiMetadataService.ts
</read_first>
<action>
Update PlantDetailScreen.tsx:
- Add "KI-Analysen" section
- Show past identifications for this plant
- Show identification date and confidence
- Link to photos that were used for identification
</action>
<acceptance_criteria>
- AI history visible on plant detail
- Shows past identification results
- Links to relevant photos
</acceptance_criteria>
</task>
```

---

## Verification

### Must-Haves (Goal-Backward)

1. AI identifications cached locally
2. Cache works across all AI types (plant, pest, suggestion)
3. Cache has TTL (7 days for plants, 24h for pests)
4. Photo gallery shows AI badge on analyzed photos
5. Photo gallery can filter by AI analyzed vs manual
6. Tapping analyzed photo shows AI results
7. Identifications stored in Supabase for cross-device access
8. AI metadata links photos, plants, and analyses

### Success Criteria

- [ ] Cache service supports all AI types with proper TTL
- [ ] Photo gallery has AI filter chips
- [ ] AI badge visible on analyzed photos
- [ ] Photo detail modal shows AI analysis results
- [ ] Identifications persist to Supabase
- [ ] Cache invalidation works correctly
- [ ] Integration service coordinates all AI operations

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/aiIntegrationService.ts` | Unified AI cache + API coordination |
| `src/services/aiMetadataService.ts` | Cloud persistence for AI results |
| `supabase/migrations/004_ai_metadata.sql` | Database tables for AI metadata |

## Files to Modify

| File | Change |
|------|--------|
| `src/services/cacheService.ts` | Add AI caching functions, TTL support |
| `src/services/aiService.ts` | Use integration service |
| `src/types/ai.ts` | Add cache types, AI metadata types |
| `src/types/photo.ts` | Add AI filter type, analysis flag |
| `src/screens/GardenPhotoGalleryScreen.tsx` | AI badges, filtering, detail view |
| `src/screens/PhotoGalleryScreen.tsx` | AI badges, filtering, detail view |
| `src/components/AIPhotoPicker.tsx` | Save to cloud metadata |
| `src/screens/PlantDetailScreen.tsx` | Show AI history |

---

*Plan created: 2026-03-19*
