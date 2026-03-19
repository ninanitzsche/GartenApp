# Phase 2: Pest Detection - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

User uploads a photo of a plant problem → System analyzes for common pests/diseases → Returns detected issue with treatment recommendation and links to knowledge base.

**What's in scope:**
- Photo upload (camera or gallery) — reuse AIPhotoPicker pattern
- AI analysis for visual pest/disease indicators
- Detection of 5+ common issues
- Treatment recommendations
- Links to knowledge base articles

**What's NOT in scope (separate phases):**
- Real-time video analysis
- Plant identification (Phase 1)
- Auto task generation (Phase 3)

</domain>

<decisions>
## Implementation Decisions

### Detection approach
- Use Claude Vision API (not Pl@ntNet — Pl@ntNet identifies plants, not problems)
- Analyze photos for visual indicators of common issues
- Prompt-based detection with defined symptom checklist
- [auto] Selected: Claude Vision with structured symptom prompts (recommended - flexible, can detect multiple issues)

### Problem scope
Detect these 5+ common issues:
- Aphids (Läuse) — clustered small insects, curled leaves
- Powdery mildew (Echter Mehltau) — white powdery coating
- Spider mites (Spinnmilben) — fine webbing, stippled leaves
- Slug/snail damage — irregular holes, slime trails
- Leaf spots/yellowing — fungal or bacterial issues
- [auto] Selected: 5 core problems + extendable list (recommended - covers common issues)

### Detection UI
- Reuse AIPhotoPicker bottom sheet pattern from Phase 1
- Separate flow from plant identification ("Check for Problems" button)
- Results shown in pest-specific result card
- [auto] Selected: Separate flow with dedicated UI (recommended - clear user intent)

### Treatment display
- Show inline treatment summary (1-2 sentences)
- Link to relevant knowledge article for detailed info
- Severity indicator (mild/moderate/severe)
- Actionable next steps
- [auto] Selected: Inline summary + knowledge link (recommended - quick help + deeper info)

### Knowledge integration
- Detect issue → query existing knowledge_articles where category = 'schädlinge'
- Create new pest treatment articles if needed
- Search by detected pest name/tags
- [auto] Selected: Link to existing + create new articles as needed (recommended - leverage existing KB)

### Confidence handling
- Show confidence percentage for detection
- Below threshold: "Couldn't identify — try another photo"
- [auto] Selected: 60% confidence threshold (recommended - balanced for pest detection)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### AI Features
- `.planning/PROJECT.md` — AI vision goals, Phase 2 pest detection focus
- `.planning/REQUIREMENTS.md` §AI-02 — Pest/disease detection requirements
- `.planning/phases/01-ai-plant-identification/01-CONTEXT.md` — Plant ID patterns to reuse

### Existing Patterns
- `src/services/aiService.ts` — AI service pattern, error handling
- `src/components/AIPhotoPicker.tsx` — Bottom sheet modal pattern
- `src/services/knowledgeService.ts` — Knowledge article fetching, category filtering
- `src/types/ai.ts` — AI result types
- `src/types/knowledge.ts` — Knowledge article types, KNOWLEDGE_CATEGORIES

### Knowledge Base
- `scripts/seed-knowledge.ts` — Existing articles (has 'schädlinge' category articles)
- `src/types/knowledge.ts` §KNOWLEDGE_CATEGORIES — 'schädlinge' category defined

### Database
- `supabase/migrations/001_initial_schema.sql` — Plants table (may need pest_analysis table)

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `AIPhotoPicker.tsx` — Reuse bottom sheet modal, extend with "Check for Problems" option
- `aiService.ts` — Extend with pest detection function, follow error handling pattern
- `knowledgeService.ts` — Already has `getArticlesByCategory('schädlinge')` and `searchArticles()`
- `cacheService.ts` — Extend caching for pest detection results
- `types/ai.ts` — Add PestDetectionResult interface

### Established Patterns
- Service Layer: `src/services/*.ts` pattern with async functions, error throwing
- Bottom Sheet Modals: Consistent modal pattern with dismissible sheets
- Knowledge Articles: Category-based filtering, tag-based search

### Integration Points
- `PlantDetailScreen.tsx` — Add "Check for Problems" button
- `GardenPhotoGalleryScreen.tsx` — Analyze existing garden photos
- `knowledge_articles` table — Query 'schädlinge' category for treatments

</codebase_context>

<specifics>
## Specific Ideas

- "User sees yellowing leaves → taps 'Check for Problems' → gets diagnosis + treatment"
- "5 common issues that every gardener encounters"
- "Treatment should be actionable — what to do right now"
- "Link to detailed knowledge article for background"

</specifics>

<deferred>
## Deferred Ideas

- Real-time camera analysis — Phase 3+
- Automatic task generation from pest detection — Phase 3
- Push notifications for detected issues — Phase 4

</deferred>

---

*Phase: 02-pest-detection*
*Context gathered: 2026-03-19*
