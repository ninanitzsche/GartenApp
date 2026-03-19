# Phase 3: Task Suggestions - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

After plant identification or pest detection, suggest 2-3 relevant tasks based on plant type and current season. User can accept (creates task) or dismiss (discards).

**What's in scope:**
- Suggest tasks after successful plant ID (Phase 1)
- Suggest tasks after pest detection (Phase 2)
- Task generation based on plant type + season
- Accept/dismiss UI for suggestions
- Create accepted tasks via existing taskService

**What's NOT in scope (separate phases):**
- Scheduled/automated task reminders (Phase 4)
- Full AI task planning (future enhancement)
- Push notifications

</domain>

<decisions>
## Implementation Decisions

### Suggestion trigger
- Trigger after successful plant identification (Phase 1 flow completes)
- Trigger after pest detection with treatment (Phase 2 flow completes)
- Don't trigger on failed identifications
- [auto] Selected: Post-identification flow (recommended - natural context after AI analysis)

### Task generation logic
- **Rule-based system** using plant type + season + task categories
- Maps: plant.family → typical tasks (tomatoes → "Ausgeizen", "Gießen")
- Seasonal weighting: spring → Aussaat, summer → Gartenarbeiten, harvest season → Ernten
- Link suggested tasks to identified plant via plant_tasks table
- [auto] Selected: Rule-based with seasonal rules (recommended - cost-effective, predictable, fast)

### Plant-care rules (seed data)
Create a rules table/mapping:
- Tomatoes (Solanaceae) → "Ausgeizen" (pruning), "Gießen", "Düngen"
- Leafy greens → "Gießen", "Ernten" (young leaves)
- Root vegetables → "Boden lockern", "Gießen"
- Pest detected → "Behandlung durchführen" with priority hoch
- [auto] Selected: Built-in rules with plant family mapping (recommended - covers common plants)

### Suggestion count
- Always show 2-3 suggestions per trigger
- Limit to highest-priority relevant tasks
- Don't overwhelm user
- [auto] Selected: 2-3 suggestions (recommended - per success criteria)

### UI presentation
- Bottom sheet modal (consistent with Phase 1 & 2 patterns)
- Task suggestion cards with:
  - Task title
  - Category badge (color-coded)
  - Priority indicator
  - "Add Task" and "Dismiss" buttons
- Show after result card in the same flow
- [auto] Selected: Bottom sheet with task cards (recommended - follows existing modal pattern)

### Accept flow
- Tap "Add Task" → Creates task via taskService.createTask()
- Pre-fills: title, category, priority (hoch for treatments)
- Links to identified plant via plant_tasks
- Shows success toast, closes modal
- [auto] Selected: Pre-filled form + auto-link (recommended - seamless UX)

### Dismiss flow
- Tap "Dismiss" → Discard suggestion, move to next or close
- No logging needed (user chose not to add)
- [auto] Selected: Silent dismiss (recommended - simple, no friction)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### AI Features (Prior Phases)
- `.planning/phases/01-ai-plant-identification/01-CONTEXT.md` — Plant ID flow, AIPhotoPicker pattern
- `.planning/phases/02-pest-detection/02-CONTEXT.md` — Pest detection flow, treatment suggestions

### Task System
- `src/services/taskService.ts` — Task CRUD, plant linking, categories, priorities
- `src/types/task.ts` — Task types (categories: Aussaat, Pflanzen, Gartenarbeiten, Beobachten, Ernten)
- `supabase/migrations/001_initial_schema.sql` — tasks table, plant_tasks junction table

### Plant System
- `src/services/plantService.ts` — Plant CRUD operations
- `src/types/plant.ts` — Plant types with family field
- `src/types/ai.ts` — PlantIdentificationResult with scientificName, family

### Knowledge Base
- `scripts/seed-knowledge.ts` — Existing care articles by category

### Requirements
- `.planning/ROADMAP.md` §Phase 3 — Success criteria: 2-3 tasks, match needs, accept/dismiss
- `.planning/REQUIREMENTS.md` §AI-03 — Photo-driven task generation requirements

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `AIPhotoPicker.tsx` — Bottom sheet modal pattern, extend with task suggestion step
- `taskService.ts` — createTask(), linkPlantsToTask() — already supports plant linking
- `types/task.ts` — Task categories and priorities already defined
- `cacheService.ts` — Extend for caching task suggestions
- `knowledgeService.ts` — Search by tags for plant care tips

### Established Patterns
- Bottom Sheet Modal: Consistent modal pattern from Phase 1 & 2
- Service Layer: CRUD via services, async/await pattern
- Plant linking: plant_tasks junction table already in use
- Categories: Aussaat, Pflanzen, Gartenarbeiten, Beobachten, Ernten

### Integration Points
- After AIPhotoPicker result card → show task suggestions
- After pest detection treatment → suggest "Behandlung" task
- PlantDetailScreen → Add "Get Care Suggestions" button
- Existing tasks list → Accept suggested tasks appear here

### Data Model Needs
- task_suggestion_rules table (plant_family → task templates)
- Or: Inline rules in taskSuggestionService.ts
- Extend PlantIdentificationResult to include care suggestions

</codebase_context>

<specifics>
## Specific Ideas

- "After I identify a tomato plant, suggest: 'Ausgeizen', 'Gießen', 'Düngen'"
- "If pest detected, suggest treatment task with high priority"
- "Seasonal suggestions: 'Aussaat' in spring, 'Ernten' in late summer"
- "Link suggested tasks to identified plant automatically"
- "2-3 suggestions is enough — don't overwhelm"

</specifics>

<deferred>
## Deferred Ideas

- Push notifications for task reminders — Phase 4
- Full AI task planning based on garden photo analysis — Future
- Learning from accepted/dismissed suggestions — Future
- Weather-based task suggestions — Future

</deferred>

---

*Phase: 03-task-suggestions*
*Context gathered: 2026-03-19*
