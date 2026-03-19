# Phase 3: Task Suggestions - Plan

**Phase:** 03-task-suggestions  
**Created:** 2026-03-19  
**Status:** Ready for implementation

---

## Overview

Implement a rule-based task suggestion system that generates 2-3 relevant tasks after plant identification or pest detection, with accept/dismiss UI.

---

## Files to Create

### 1. `src/types/taskSuggestion.ts`
New types for task suggestions:
- `TaskSuggestion` interface (title, category, priority, reason)
- `PlantFamilyRule` interface (plant family → task templates)
- `SeasonalTask` interface (season → task mappings)

### 2. `src/services/taskSuggestionService.ts`
Core service implementing rule-based suggestion logic:
- `getSuggestionsForPlant(family, season)` - returns 2-3 tasks
- `getSuggestionsForPest(pestType)` - returns treatment task
- Built-in rules mapping (tomatoes → ausgeizen, gießen, düngen, etc.)
- Seasonal weighting (spring → aussaat, summer → gartenarbeiten, harvest → ernten)

### 3. `src/components/TaskSuggestionModal.tsx`
Bottom sheet modal component:
- Receives suggestions array + plant context
- Task cards with title, category badge, priority indicator
- "Hinzufügen" (accept) and "Verwerfen" (dismiss) buttons
- Auto-links to identified plant via plant_tasks
- Shows success toast on accept

### 4. `supabase/migrations/004_task_suggestion_rules.sql`
Optional: Seed data for plant family → task rules (can be inline instead)

---

## Files to Modify

### 1. `src/components/AIPhotoPicker.tsx`
- After successful identification, trigger task suggestions modal
- Pass plant result to TaskSuggestionModal
- Accept flow: create task + link plant

### 2. `src/components/AIPestDetector.tsx` (if exists) or pest flow
- After pest detection with treatment, suggest treatment task
- Pass pest type to TaskSuggestionModal

---

## Implementation Details

### Plant Family Rules (Built-in)
```
Solanaceae (Tomatoes, Peppers) → "Ausgeizen", "Gießen", "Düngen"
Brassicaceae (Cabbage, Kale) → "Gießen", "Ernten", "Schädlinge kontrollieren"
Apiaceae (Carrots, Celery) → "Boden lockern", "Gießen", "Ernten"
Asteraceae (Lettuce, Sunflower) → "Gießen", "Jäten", "Ernten"
Cucurbitaceae (Cucumber, Zucchini) → "Gießen", "Ernten", "Düngen"
Lamiaceae (Basil, Mint) → "Gießen", "Ernten", "Schnitt"
Fabaceae (Beans, Peas) → "Rankhilfe geben", "Ernten", "Gießen"
All (fallback) → "Gießen", "Beobachten"
```

### Seasonal Rules
```
Frühling (Mar-May) → +Aussaat, +Pflanzen
Sommer (Jun-Aug) → +Gartenarbeiten, +Ernten (early)
Herbst (Sep-Nov) → +Ernten, +Wintervorbereitung
Winter (Dec-Feb) → +Planung, +Samen bestellen
```

### Pest → Task Mapping
```
Aphids → "Behandlung: Läuse bekämpfen" (priority: hoch)
Powdery Mildew → "Behandlung: Mehltau behandeln" (priority: hoch)
Spider Mites → "Behandlung: Spinnmilben behandeln" (priority: hoch)
Slugs → "Behandlung: Schnecken bekämpfen" (priority: mittel)
Leaf Spot → "Behandlung: Blattflecken behandeln" (priority: mittel)
```

---

## Success Criteria

1. After plant identification, 2-3 relevant tasks appear
2. Tasks match plant's current needs (based on family + season)
3. User can accept (creates task) or dismiss (closes modal)

---

## Acceptance Tests

1. Identify tomato plant → suggests "Ausgeizen", "Gießen", "Düngen"
2. Detect aphids → suggests "Behandlung: Läuse bekämpfen" with hoch priority
3. Accept suggestion → task created with plant linked
4. Dismiss suggestion → modal closes, no task created
5. Suggestion count always 2-3

---

*Plan created: 2026-03-19*
