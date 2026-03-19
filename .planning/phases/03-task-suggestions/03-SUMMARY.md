# Phase 3: Task Suggestions - Summary

**Phase:** 03-task-suggestions  
**Completed:** 2026-03-19  
**Status:** ✅ Implemented

---

## Overview

Implemented a rule-based task suggestion system that generates 2-3 relevant tasks after plant identification, with accept/dismiss UI.

---

## What Was Built

### New Files Created

| File | Description |
|------|-------------|
| `src/types/taskSuggestion.ts` | Type definitions for task suggestions, plant family rules, pest treatment tasks |
| `src/services/taskSuggestionService.ts` | Core service with rule-based suggestion logic |
| `src/components/TaskSuggestionModal.tsx` | Bottom sheet modal for displaying task suggestions |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/AIPhotoPicker.tsx` | Added task suggestion integration after plant ID |

---

## Features Implemented

### 1. Rule-Based Task Generation
- Plant family → task mapping (Solanaceae → "Ausgeizen", "Gießen", "Düngen")
- Seasonal weighting (spring → Aussaat, summer → Gartenarbeiten)
- 2-3 suggestions per trigger

### 2. Plant Family Rules
```
Solanaceae (Tomatoes, Peppers) → Ausgeizen, Gießen, Düngen, Ernten
Brassicaceae (Cabbage, Kale) → Gießen, Ernten, Schädlinge kontrollieren
Apiaceae (Carrots, Celery) → Boden lockern, Gießen, Ernten
Asteraceae (Lettuce, Sunflower) → Gießen, Jäten, Ernten
Cucurbitaceae (Cucumber, Zucchini) → Gießen, Ernten, Düngen
Lamiaceae (Basil, Mint) → Gießen, Ernten, Schnitt
Fabaceae (Beans, Peas) → Rankhilfe geben, Ernten, Gießen
Rosaceae → Gießen, Schnitt, Ernten, Schädlinge kontrollieren
Poaceae → Ernten, Bodenpflege
```

### 3. Seasonal Tasks
```
Spring (Mar-May) → Aussaat, Pflanzen, Boden vorbereiten
Summer (Jun-Aug) → Gartenarbeiten, Ernten, Gießen, Düngen
Autumn (Sep-Nov) → Ernten, Wintervorbereitung, Laub kompostieren, Pflanzzeit
Winter (Dec-Feb) → Planung, Samen bestellen, Werkzeug pflegen
```

### 4. Pest Treatment Tasks
```
Aphids → "Behandlung: Läuse bekämpfen" (hoch priority)
Powdery Mildew → "Behandlung: Mehltau behandeln" (hoch priority)
Spider Mites → "Behandlung: Spinnmilben behandeln" (hoch priority)
Slugs → "Behandlung: Schnecken bekämpfen" (mittel priority)
Leaf Spot → "Behandlung: Blattflecken behandeln" (mittel priority)
```

### 5. UI Integration
- Bottom sheet modal pattern (consistent with Phase 1 & 2)
- Task cards with category badge, priority indicator
- "Hinzufügen" (accept) and "Überspringen" (dismiss) buttons
- Success feedback when task is created

---

## Success Criteria ✅

| # | Criterion | Status |
|---|-----------|--------|
| 1 | After plant identification, suggest 2-3 relevant tasks | ✅ |
| 2 | Tasks match plant's current needs (family + season) | ✅ |
| 3 | User can accept/dismiss suggestions | ✅ |

---

## API Usage

```typescript
// Get suggestions for a plant
import { getAllSuggestions } from '../services/taskSuggestionService';

const suggestions = getAllSuggestions({
  plantFamily: 'Solanaceae',
  plantName: 'Tomate',
  linkedPlantId: 'plant-uuid',
  maxSuggestions: 3,
});

// Accept a suggestion (creates task)
import { acceptSuggestion } from '../services/taskSuggestionService';

await acceptSuggestion(suggestion, linkedPlantId);
```

---

## Deferred to Future Phases

- Push notifications for task reminders (Phase 4)
- Full AI task planning from garden photos (Future)
- Learning from accepted/dismissed suggestions (Future)
- Weather-based task suggestions (Future)

---

## Dependencies

- Uses existing `taskService.createTask()` for task creation
- Uses existing `plant_tasks` junction table for plant linking
- Consistent with Phase 1 & 2 modal patterns

---

*Summary created: 2026-03-19*
