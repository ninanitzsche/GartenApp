# Phase 4: AI Integration - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect all AI features (Phase 1-3) to existing app infrastructure. Ensure identifications cache locally, integrate with plant database, and photo gallery displays AI analysis results.

**What's in scope:**
- Local caching layer for all AI identifications
- Integration between AI results and existing plant database
- Photo gallery with AI analysis metadata
- Unified caching strategy across all AI features

**What's NOT in scope (separate phases):**
- Offline-first sync (future enhancement)
- Push notifications (future enhancement)
- Real-time camera analysis

</domain>

<decisions>
## Implementation Decisions

### Caching Strategy
- Use AsyncStorage for local cache (already used in Phase 1)
- Cache key: `ai_cache_{type}_{identifier}` (type: plant, pest, task)
- Cache TTL: 7 days for identifications, 24h for pest detections
- Background refresh on app open
- [auto] Selected: AsyncStorage with typed keys and TTL (recommended - consistent with Phase 1)

### Cache Structure
```
ai_cache:
  plant_{imageHash}: { plant, confidence, timestamp }
  pest_{imageHash}: { pest, treatment, timestamp }
  suggestions_{plantId}_{season}: { tasks, timestamp }
```
- [auto] Selected: Typed cache entries with timestamps (recommended - easy invalidation)

### Plant Database Integration
- Identified plants link to existing `plants` table via `identification_source: 'ai' | 'manual'`
- Store AI metadata in `plant_identifications` table (separate from main plant)
- Link photos to plants via `plant_photos` table
- [auto] Selected: Separate identification table + plant linking (recommended - clean separation)

### Photo Gallery Enhancement
- Show AI badge/icon on photos with analysis
- Filter by: All | AI-Analyzed | Manual
- Tap photo → show AI analysis card (reuse result card pattern)
- [auto] Selected: AI badge + filter + detail view (recommended - discoverable AI features)

### Cache Invalidation
- Plant update → invalidate related suggestions cache
- Photo delete → invalidate related AI cache
- Season change → invalidate suggestions cache
- [auto] Selected: Cascade invalidation on relevant events (recommended - data consistency)

### Service Layer
- Extend `cacheService.ts` with AI-specific caching functions
- Create `aiIntegrationService.ts` for unified AI ↔ DB operations
- [auto] Selected: Extended cacheService + new integration service (recommended - separation of concerns)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### AI Features (Prior Phases)
- `.planning/phases/01-ai-plant-identification/01-CONTEXT.md` — Plant ID with Pl@ntNet, caching pattern
- `.planning/phases/02-pest-detection/02-CONTEXT.md` — Pest detection with Claude, knowledge links
- `.planning/phases/03-task-suggestions/03-CONTEXT.md` — Task generation, plant linking

### Caching Infrastructure
- `src/services/cacheService.ts` — Existing caching pattern, extend for AI
- `src/services/storageService.ts` — Local storage abstractions

### Database
- `supabase/migrations/001_initial_schema.sql` — Plants, plant_photos, plant_tasks tables
- `src/types/plant.ts` — Plant types with identification_source
- `src/types/ai.ts` — AI result types (PlantIdentificationResult, PestDetectionResult)

### Photo System
- `src/services/photoService.ts` — Photo upload, gallery patterns
- `src/components/GardenPhotoGalleryScreen.tsx` — Gallery screen to enhance

### Requirements
- `.planning/ROADMAP.md` §Phase 4 — AI-04: Integration with existing data
- `.planning/REQUIREMENTS.md` §AI-04 — Success criteria: cached, database, gallery

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `cacheService.ts` — Extend with `cacheAIIdentification()`, `getAICache()`, `invalidateAICache()`
- `aiService.ts` — Phase 1 & 2 services, add caching wrapper
- `plantService.ts` — Plant CRUD, link with AI identifications
- `photoService.ts` — Photo storage, gallery operations
- `types/ai.ts` — Extend with CacheEntry types

### Established Patterns
- Service Layer: Async CRUD operations with error handling
- Cache Pattern: Key-based storage with optional TTL
- Modal Pattern: Bottom sheet for AI results
- Plant Linking: plant_tasks junction table pattern

### Integration Points
- `AIPhotoPicker.tsx` → Cache service → Plant service
- `GardenPhotoGalleryScreen.tsx` → Add AI badge, filter
- `PlantDetailScreen.tsx` → Show AI analysis history
- `CacheService` → Background refresh on app open

### Data Model Needs
- `plant_identifications` table: plant_id, ai_type, result_json, confidence, cached_at
- `ai_cache` keys in AsyncStorage
- Extend `plant_photos` with `ai_analysis_id` FK

</codebase_context>

<specifics>
## Specific Ideas

- "Cache plant ID results locally so I don't re-identify the same plant"
- "See AI badge on photos that have been analyzed"
- "Filter gallery to show only AI-analyzed photos"
- "Tap analyzed photo to see past AI results"
- "Works offline for cached identifications"
- "Syncing AI metadata with Supabase when online"

</specifics>

<deferred>
## Deferred Ideas

- Offline-first sync with conflict resolution — Future sprint
- Push notifications for cached reminders — Future
- Background AI analysis — Future
- Learning from user corrections — Future

</deferred>

---

*Phase: 04-ai-integration*
*Context gathered: 2026-03-19*
