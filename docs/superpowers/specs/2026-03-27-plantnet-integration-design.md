# Plant API Integration Design (PlantNet + Perenual + Permapeople)

> **Status:** Draft → In Review  
> **Date:** 2026-03-27  
> **Feature:** Automatische Pflanzeninformationen via 3 APIs

---

## Goal

Bei jeder Pflanzenhinzufügung sollen automatisch alle verfügbaren Informationen von drei APIs abgerufen werden:
1. **PlantNet** - Identifikation & Bilder
2. **Perenual** - Pflege-Infos (Gießen, Sonnenlicht, Winterhärte)
3. **Permapeople** - Permakultur-Daten (Layer, essbare Teile)

Automatisch generierte Learnings/Tasks werden als "KI-generiert" gekennzeichnet.

---

## Architecture

### APIs Overview

| API | Stärke | Liefert |
|-----|--------|---------|
| **PlantNet** | 🔍 Identifikation | Namen (alle Sprachen), Familie, Gattung, Bilder, GBIF/POWO IDs |
| **Perenual** | 💧 Pflege | Gießen, Sonnenlicht, Winterhärte, Pflege-Level, Wachstum, Boden, Schädlinge |
| **Permapeople** | 🌿 Permakultur | Layer-System, essbare Teile, USDA-Zonen, Licht/Wasser |

### Database Schema

```sql
-- Cache table for combined API responses
CREATE TABLE plant_info_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255),
  combined_data JSONB NOT NULL,  -- All APIs combined
  plantnet_data JSONB,
  perenual_data JSONB,
  permapeople_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plant_name)
);

-- Add to existing plants table
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plantnet_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS perenual_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS permapeople_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plant_info_fetched_at TIMESTAMPTZ;

-- Add source column to learnings for "KI-generiert" badge
ALTER TABLE learnings ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';
```

---

## Combined Data Structure

```typescript
interface CombinedPlantData {
  // PlantNet Data
  plantnet: {
    id: string;
    name: string;
    scientificName: string;
    family: string;
    genus: string;
    commonNames: string[];
    images: Array<{ url: string; license: string }>;
    gbifId?: string;
    powoId?: string;
  } | null;
  
  // Perenual Data
  perenual: {
    id: number;
    watering: 'frequent' | 'average' | 'minimum' | 'none';
    sunlight: string[];
    hardiness: { min: number; max: number };
    careLevel: 'Easy' | 'Medium' | 'Hard';
    growthRate: 'Low' | 'Medium' | 'High';
    soil: string[];
    cycle: 'Annual' | 'Perennial' | 'Biennial';
    maintenance: string;
    description: string;
    wateringBenchmark?: { value: string; unit: string };
    pruningMonth?: string[];
    floweringSeason?: string;
  } | null;
  
  // Permapeople Data
  permapeople: {
    layers: string[];  // ['Trees', 'Shrubs', 'Herb', 'Ground', 'Root', ' Vine', 'Annual']
    edibleParts: string[];
    waterRequirement: string;
    lightRequirement: string;
    usdaHardinessZone: string;
    soilType: string[];
    attractors: string[];
    medicinal: boolean;
  } | null;
  
  // Meta
  notFound: boolean;
  sources: string[];  // Which APIs returned data
}
```

---

## Data Flow

```
User adds plant (Name or AI-identified)
         ↓
1. PlantNet → Identifikation + Bilder
         ↓
2. Perenual → Pflege-Infos via Such-API
         ↓
3. Permapeople → Permakultur-Daten via Such-API
         ↓
Alle Daten in plant_info_cache speichern
         ↓
In plants JSONB-Spalten speichern
         ↓
Auto-create learnings (source='ai')
         ↓
Display on PlantDetailScreen
```

---

## UI/UX Specification

### A. PlantDetailScreen - "Pflanzen-Info" Section

**Location:** Below existing plant info, above Notes section

**Content:**

```tsx
// PlantNet Section
{plantInfo.plantnet && (
  <View>
    <Text style={styles.sectionTitle}>🔬 Botanik</Text>
    <Text>{plantInfo.plantnet.scientificName}</Text>
    <Text>{plantInfo.plantnet.family}</Text>
  </View>
)}

// Perenual Section
{plantInfo.perenual && (
  <View>
    <Text style={styles.sectionTitle}>💧 Pflege</Text>
    <Text>💦 Gießen: {plantInfo.perenual.watering}</Text>
    <Text>☀️ Licht: {plantInfo.perenual.sunlight.join(', ')}</Text>
    <Text>📊 Pflege-Level: {plantInfo.perenual.careLevel}</Text>
    <Text>📈 Wachstum: {plantInfo.perenual.growthRate}</Text>
    <Text>🪴 Boden: {plantInfo.perenual.soil.join(', ')}</Text>
  </View>
)}

// Permapeople Section
{plantInfo.permapeople && (
  <View>
    <Text style={styles.sectionTitle}>🌿 Permakultur</Text>
    <Text>🏗️ Layer: {plantInfo.permapeople.layers.join(', ')}</Text>
    <Text>🍴 Essbar: {plantInfo.permapeople.edibleParts.join(', ')}</Text>
    <Text>🐝 Bienenfreundlich: {plantInfo.permapeople.attractors?.join(', ')}</Text>
  </View>
)}
```

### B. Badges

- "Von KI generiert" badge on all auto-created learnings
- API source indicators: 🌐 PlantNet | 💧 Perenual | 🌿 Permapeople

---

## Functionality

### 1. fetchAllPlantData(plantName: string)

1. Check `plant_info_cache` for existing combined data
2. If cached < 30 days → return cached
3. Else → call all 3 APIs in parallel:
   - PlantNet (if not already identified)
   - Perenual species search
   - Permapeople search
4. Combine results
5. Cache in `plant_info_cache`
6. Return combined data

### 2. Batch Update for Existing Plants

1. Fetch all user plants
2. For each plant → call `fetchAllPlantData(plant.name)`
3. Update plant with combined data
4. Create learnings from data
5. Show progress in UI

### 3. Learning Generation

```typescript
// Auto-generate learnings from combined data
const learnings = [];

// From Perenual
if (perenual?.watering) {
  learnings.push({
    title: `💧 Gießen: ${plantName}`,
    content: `Gießen: ${perenual.watering}\nHäufigkeit: ${perenual.wateringBenchmark?.value} ${perenual.wateringBenchmark?.unit}`,
    source: 'ai'
  });
}

// From Permapeople
if (permapeople?.layers) {
  learnings.push({
    title: `🏗️ Permakultur-Layer: ${plantName}`,
    content: `Geeignet für: ${permapeople.layers.join(', ')}`,
    source: 'ai'
  });
}

// From Permapeople
if (permapeople?.edibleParts?.length) {
  learnings.push({
    title: `🍴 Essbar: ${plantName}`,
    content: `Essbare Teile: ${permapeople.edibleParts.join(', ')}`,
    source: 'ai'
  });
}
```

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| API returns 429 (rate limit) | Queue request, retry after delay |
| API returns 404 (not found) | Store partial data, mark source as missing |
| Network error | Show toast, skip that API |
| All APIs fail | Mark as `{ notFound: true }` |

---

## API Keys Required

| API | Key Location | Status |
|-----|-------------|--------|
| PlantNet | `.env` | ✅ Already configured |
| Perenual | `.env` | ⚠️ Need to add |
| Permapeople | `.env` | ⚠️ Need to request |

---

## Acceptance Criteria

- [ ] PlantNet identification + images displayed
- [ ] Perenual care info displayed (watering, sunlight, etc.)
- [ ] Permapeople permaculture info displayed (layers, edible)
- [ ] All 3 APIs cached in database
- [ ] Batch update works with progress UI
- [ ] Learnings auto-created with "KI-generiert" badge
- [ ] Graceful error handling per API

---

## Files to Modify

| File | Change |
|------|--------|
| `src/services/plantInfoService.ts` | Merge all 3 APIs |
| `src/types/plant.ts` | Add combined data fields |
| `src/types/ai.ts` | Add Perenual/Permapeople types |
| `src/screens/PlantDetailScreen.tsx` | Display all data |
| `src/screens/AddPlantScreen.tsx` | Auto-fetch after add |
| `supabase/migrations/` | Add database columns |
| `.env` | Add PERENUAL_API_KEY, PERMAPEOPLE_KEY |

---

## Dependencies

- PlantNet API key (already in `.env`)
- Perenual API key (needs to be added)
- Permapeople API access (needs account request)
