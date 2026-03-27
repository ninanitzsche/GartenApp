# PlantNet KI-Integration Design

> **Status:** Draft → In Review  
> **Date:** 2026-03-27  
> **Feature:** Automatische Pflanzeninformationen via PlantNet API

---

## Goal

Bei jeder Pflanzenhinzufügung (besonders nach KI-Identifikation) sollen automatisch alle verfügbaren Informationen von PlantNet abgerufen und angezeigt werden. Zusätzlich sollen alle bestehenden Pflanzen im Garten retroaktiv mit PlantNet-Daten versorgt werden. Automatisch generierte Learnings/Tasks werden als "KI-generiert" gekennzeichnet.

---

## Architecture

### 1. New Database Schema

```sql
-- Cache table for PlantNet API responses
CREATE TABLE plant_info_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255),
  plantnet_response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plant_name)
);

-- Add to existing plants table
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plantnet_id VARCHAR(100);
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plantnet_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plantnet_fetched_at TIMESTAMPTZ;

-- Add source column to learnings for "KI-generiert" badge
ALTER TABLE learnings ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';
-- Add source column to tasks (if needed)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';
```

### 2. New Service: `plantInfoService.ts`

```typescript
// Core functions
export async function getPlantInfo(plantName: string): Promise<PlantNetData | null>
export async function fetchAllPlantsInfo(onProgress?: (current: number, total: number) => void): Promise<void>
export async function createLearningsFromPlantInfo(plantId: string, plantInfo: PlantNetData): Promise<void>
```

### 3. Data Flow

```
User adds plant (AI-identified)
    ↓
AddPlantScreen saves plant
    ↓
plantInfoService.getPlantInfo(plantName) 
    ↓ (if not cached)
PlantNet API → cache in plant_info_cache
    ↓
Store in plants.plantnet_data
    ↓
Auto-create learnings with source='ai'
    ↓
Display on PlantDetailScreen
```

---

## UI/UX Specification

### A. PlantDetailScreen - New "Pflanzen-Info" Section

**Location:** Below existing plant info, above Notes section

**Content:**
- 🌿 **Deutsche Namen** - List of common names in German
- 🔬 **Wissenschaftlicher Name** - Italicized scientific name
- 👨‍👩‍👧‍👦 **Familie** - Plant family
- 🖼️ **Bilder** - Carousel of PlantNet images (if available)
- 📋 **Status** - "Von KI generiert" / "Nicht gefunden" badge

**Empty State:**
- "Keine PlantNet-Daten verfügbar"
- Button: "Manuell abrufen"

### B. AddPlantScreen - Auto-Fetch

After AI identification completes:
1. Show loading indicator "Pflanzeninformationen werden geladen..."
2. Fetch PlantNet data in background
3. Pre-fill plant details with available data
4. Store PlantNet response for later use

### C. Batch Progress Modal

**Trigger:** Settings → "Pflanzendaten aktualisieren" or first app launch

**UI:**
- Modal with progress bar
- Text: "X von Y Pflanzen werden aktualisiert"
- Current plant name being processed
- Cancel button
- Auto-close on completion

---

## Functionality Specification

### 1. getPlantInfo(plantName: string)

1. Check `plant_info_cache` for existing data
2. If cached &lt; 30 days old → return cached data
3. Otherwise → call PlantNet API
4. Cache response in `plant_info_cache`
5. Return PlantNet data or null if not found

### 2. fetchAllPlantsInfo(onProgress?)

1. Fetch all user's plants from database
2. Filter out plants already with `plantnet_fetched_at` within 30 days
3. For each remaining plant:
   - Call `getPlantInfo(plant.name)`
   - Update plant with `plantnet_data`, `plantnet_id`, `plantnet_fetched_at`
   - Call progress callback
   - Create learnings from PlantNet data (source='ai')
4. Mark plants with no result as `plantnet_data = { notFound: true }`

### 3. createLearningsFromPlantInfo

Auto-generate learnings based on PlantNet data:

```typescript
// Example learnings to create
[
  {
    title: `Pflege: ${plantName}`,
    content: `Allgemeine Pflegehinweise für ${plantName}`,
    related_plants: [plantId],
    source: 'ai'
  },
  {
    title: `Standort: ${plantName}`,
    content: `Optimale Standortbedingungen`,
    related_plants: [plantId],
    source: 'ai'
  }
]
```

### 4. Badge Display

On LearningCard and TaskCard:
- If `source === 'ai'` → show "🤖 KI-generiert" badge
- Style: Small pill badge in top-right corner

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| PlantNet API returns 429 (rate limit) | Queue request, retry after delay |
| PlantNet API returns 404 (not found) | Store `{ notFound: true }`, don't retry |
| Network error | Show toast, allow manual retry |
| Empty plant name | Skip, log warning |

---

## Acceptance Criteria

- [ ] New plants (AI-identified) automatically fetch PlantNet data
- [ ] All existing plants can be retroactively enriched via progress UI
- [ ] PlantNet data displays correctly on PlantDetailScreen
- [ ] Learnings auto-created with "KI-generiert" badge
- [ ] Not-found plants show appropriate status
- [ ] Rate limiting handled gracefully

---

## Files to Modify

| File | Change |
|------|--------|
| `src/services/plantInfoService.ts` | NEW - PlantNet integration service |
| `src/types/plant.ts` | Add PlantNet fields to Plant type |
| `src/screens/PlantDetailScreen.tsx` | Add "Pflanzen-Info" section |
| `src/screens/AddPlantScreen.tsx` | Auto-fetch after AI identification |
| `supabase/migrations/` | Add database columns |
| `src/services/learningService.ts` | Support source='ai' parameter |

---

## Dependencies

- PlantNet API key (already configured in `.env`)
- Existing AI identification flow
- Existing learnings/tasks system
