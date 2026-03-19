# Phase 1: AI Plant Identification - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

User uploads a photo → System identifies the plant using Claude Vision API → Returns plant name, confidence score, and links to existing plant database.

**What's in scope:**
- Photo capture (camera or gallery)
- Claude Vision API integration for plant identification
- Confidence score display
- Link to existing plant or create new entry

**What's NOT in scope (separate phases):**
- Pest/disease detection (Phase 2)
- Auto task generation (Phase 3)
- Offline-first architecture (Phase 4)

</domain>

<decisions>
## Implementation Decisions

### Photo Source
- Both camera and gallery (via expo-image-picker)
- Standard photo picker flow - no custom camera UI needed
- [auto] Selected: Camera + Gallery options (recommended - covers all use cases)

### UI Flow
- Bottom sheet modal (leverages existing modal patterns)
- User selects photo → Loading indicator → Results
- [auto] Selected: Bottom sheet modal (recommended - consistent with app patterns)

### Result Display
- Plant name with confidence percentage
- Show care tips or link to knowledge base
- Option to add to existing plants or create new
- [auto] Selected: Inline result card (recommended - clear feedback)

### Error Handling
- Show retry option on failure
- Suggest checking lighting/angle
- Cache failed attempts to avoid repeated API calls
- [auto] Selected: Retry with guidance (recommended - helpful UX)

### Confidence Threshold
- Show all results above 50% confidence
- Below 50%: "Couldn't identify - create manually?"
- [auto] Selected: 50% threshold (recommended - balanced)

### Caching
- Cache successful identifications locally (AsyncStorage)
- Key by image hash or dominant features
- Reduce API calls for repeated plants
- [auto] Selected: Local cache enabled (recommended - cost optimization)

### API Integration
- Use Claude Sonnet for vision (balanced cost/quality)
- Max 1MB image size (resize before upload)
- Timeout: 30 seconds
- [auto] Selected: Claude Sonnet (recommended - good plant ID accuracy)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### AI Integration
- `.planning/PROJECT.md` — AI vision goals, Claude API constraints
- `.planning/REQUIREMENTS.md` §AI-01 — Plant identification requirements

### Existing Patterns
- `src/services/photoService.ts` — Photo upload service pattern
- `src/components/PhotoFilterModal.tsx` — Modal pattern in app
- `src/services/plantService.ts` — Plant CRUD operations
- `.planning/codebase/01-stack.md` — Expo SDK for image handling

### Database
- `supabase/migrations/001_initial_schema.sql` — Plants table structure
- `docs/database/database-guide.md` — Database patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `expo-image-picker` — Already in stack, use for camera/gallery
- `expo-image-manipulator` — Image resizing before upload
- `AsyncStorage` — Already used for auth caching, extend for ID cache
- `photoService.ts` — Service pattern to follow

### Established Patterns
- Service Layer Pattern: CRUD via services, types in `/types`
- Modal pattern: Bottom sheet for photo selection
- Error handling: console.error + throw with user message

### Integration Points
- `PhotoUploadScreen.tsx` — Add AI ID button here
- `PlantListScreen.tsx` — Filter by "identified" vs "manual"
- `supabase.storage` — Store identified photos
- `plants` table — Add `identification_source: 'ai' | 'manual'` field

</code_context>

<specifics>
## Specific Ideas

- "Upload photo → Get plant name with confidence score"
- "80%+ accuracy target for common plants"
- "Link identified plants to existing database"
- "Cache identifications to reduce API costs"

</specifics>

<deferred>
## Deferred Ideas

- Pest/disease detection — Phase 2
- Auto task generation from photos — Phase 3
- Offline-first with sync — Phase 4
- Real-time plant scanning — Out of scope

</deferred>

---

*Phase: 01-ai-plant-identification*
*Context gathered: 2026-03-19*
