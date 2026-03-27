# Combined Plant API Integration Plan (PlantNet + Perenual + Permapeople)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatische Pflanzeninformationen von 3 APIs abrufen und anzeigen: PlantNet (Identifikation), Perenual (Pflege), Permapeople (Permakultur).

**Architecture:** Neue Service-Schicht die alle 3 APIs kombiniert, Daten cached in Supabase, UI-Erweiterungen für erweiterte Pflanzen-Infos.

**Tech Stack:** React Native, Supabase, TypeScript, PlantNet API, Perenual API, Permapeople API

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/services/plantInfoService.ts` | Combined API service (already exists, needs update) |
| `src/services/perenualService.ts` | NEW - Perenual API client |
| `src/services/permapeopleService.ts` | NEW - Permapeople API client |
| `src/types/ai.ts` | Add Perenual/Permapeople types |
| `src/types/plant.ts` | Add combined data fields to Plant type |
| `src/screens/PlantDetailScreen.tsx` | Display all API data |
| `.env` | Add PERENUAL_API_KEY, PERMAPEOPLE_KEY_ID, PERMAPEOPLE_KEY_SECRET |

---

## Task 1: Environment & API Keys

**Files:**
- Modify: `.env`

- [ ] **Step 1: Add API keys to .env**

```bash
# Perenual - get free key at https://perenual.com/user/developer
EXPO_PUBLIC_PERENUAL_API_KEY=your_perenual_key

# Permapeople - request access at https://permapeople.org/api_requests/new
EXPO_PUBLIC_PERMAPEOPLE_KEY_ID=your_key_id
EXPO_PUBLIC_PERMAPEOPLE_KEY_SECRET=your_key_secret
```

- [ ] **Step 2: Commit**

```bash
git add .env
git commit -m "chore: add Perenual and Permapeople API keys"
```

---

## Task 2: TypeScript Types

**Files:**
- Modify: `src/types/ai.ts`

- [ ] **Step 1: Add Perenual types**

```typescript
// Add to src/types/ai.ts

export interface PerenualPlantData {
  id: number;
  common_name: string;
  scientific_name: string[];
  family: string;
  cycle: 'Annual' | 'Perennial' | 'Biennial';
  watering: 'frequent' | 'average' | 'minimum' | 'none';
  watering_general_benchmark?: { value: string; unit: string };
  sunlight: string[];
  hardiness: { min: string; max: string };
  care_level: 'Easy' | 'Medium' | 'Hard';
  growth_rate: 'Low' | 'Medium' | 'High';
  soil: string[];
  maintenance: string;
  description: string;
  pruning_month?: string[];
  flowering_season?: string;
  default_image?: {
    regular_url: string;
    medium_url: string;
    small_url: string;
  };
}
```

- [ ] **Step 2: Add Permapeople types**

```typescript
export interface PermapeoplePlantData {
  id: number;
  name: string;
  scientific_name: string;
  data: Array<{
    key: string;
    value: string;
  }>;
  // Parsed fields
  layers?: string[];
  edible_parts?: string[];
  water_requirement?: string;
  light_requirement?: string;
  usda_hardiness_zone?: string;
  soil_type?: string[];
}
```

- [ ] **Step 3: Add CombinedPlantData type**

```typescript
export interface CombinedPlantData {
  plantnet: PlantNetData | null;
  perenual: PerenualPlantData | null;
  permapeople: PermapeoplePlantData | null;
  notFound: boolean;
  sources: string[];
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/ai.ts
git commit -m "types: add Perenual and Permapeople data types"
```

---

## Task 3: Perenual Service

**Files:**
- Create: `src/services/perenualService.ts`

- [ ] **Step 1: Create Perenual service**

```typescript
import { PerenualPlantData } from '../types/ai';

const PERENUAL_BASE_URL = 'https://perenual.com/api/v2';

export async function searchPerenualPlant(query: string): Promise<PerenualPlantData | null> {
  const apiKey = process.env.EXPO_PUBLIC_PERENUAL_API_KEY;
  
  if (!apiKey) {
    console.warn('Perenual API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${PERENUAL_BASE_URL}/species-list?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=1`
    );

    if (!response.ok) {
      console.error('Perenual API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // Get detailed info
      const plantId = data.data[0].id;
      return await getPerenualPlantDetails(plantId);
    }

    return null;
  } catch (error) {
    console.error('Perenual search error:', error);
    return null;
  }
}

export async function getPerenualPlantDetails(plantId: number): Promise<PerenualPlantData | null> {
  const apiKey = process.env.EXPO_PUBLIC_PERENUAL_API_KEY;
  
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `${PERENUAL_BASE_URL}/species/details/${plantId}?key=${apiKey}`
    );

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Perenual details error:', error);
    return null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/perenualService.ts
git commit -m "feat: add Perenual API service"
```

---

## Task 4: Permapeople Service

**Files:**
- Create: `src/services/permapeopleService.ts`

- [ ] **Step 1: Create Permapeople service**

```typescript
import { PermapeoplePlantData } from '../types/ai';

const PERMAPEOPLE_BASE_URL = 'https://permapeople.org/api';

export async function searchPermapeoplePlant(query: string): Promise<PermapeoplePlantData | null> {
  const keyId = process.env.EXPO_PUBLIC_PERMAPEOPLE_KEY_ID;
  const keySecret = process.env.EXPO_PUBLIC_PERMAPEOPLE_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('Permapeople API keys not configured');
    return null;
  }

  try {
    const response = await fetch(`${PERMAPEOPLE_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-permapeople-key-id': keyId,
        'x-permapeople-key-secret': keySecret,
      },
      body: JSON.stringify({ q: query }),
    });

    if (!response.ok) {
      console.error('Permapeople API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.plants && data.plants.length > 0) {
      return parsePermapeopleData(data.plants[0]);
    }

    return null;
  } catch (error) {
    console.error('Permapeople search error:', error);
    return null;
  }
}

function parsePermapeopleData(plant: any): PermapeoplePlantData {
  const data = plant.data || [];
  
  const getValue = (key: string) => data.find((d: any) => d.key === key)?.value;
  
  return {
    id: plant.id,
    name: plant.name,
    scientific_name: plant.scientific_name,
    data,
    layers: getValue('Layer')?.split(',').map((s: string) => s.trim()),
    edible_parts: getValue('Edible parts')?.split(',').map((s: string) => s.trim()),
    water_requirement: getValue('Water requirement'),
    light_requirement: getValue('Light requirement'),
    usda_hardiness_zone: getValue('USDA Hardiness zone'),
    soil_type: getValue('Soil type')?.split(',').map((s: string) => s.trim()),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/permapeopleService.ts
git commit -m "feat: add Permapeople API service"
```

---

## Task 5: Combined PlantInfoService

**Files:**
- Modify: `src/services/plantInfoService.ts`

- [ ] **Step 1: Add combined fetch function**

```typescript
import { PlantNetData } from '../types/ai';
import { searchPerenualPlant } from './perenualService';
import { searchPermapeoplePlant } from './permapeopleService';
import { CombinedPlantData } from '../types/ai';

export async function fetchAllPlantData(plantName: string): Promise<CombinedPlantData> {
  // Check cache first
  const cached = await getCachedPlantData(plantName);
  if (cached) return cached;

  // Fetch from all APIs in parallel
  const [plantnet, perenual, permapeople] = await Promise.all([
    getPlantInfo(plantName),  // Existing PlantNet function
    searchPerenualPlant(plantName),
    searchPermapeoplePlant(plantName),
  ]);

  const sources = [];
  if (plantnet && !plantnet.notFound) sources.push('plantnet');
  if (perenual) sources.push('perenual');
  if (permapeople) sources.push('permapeople');

  const combined: CombinedPlantData = {
    plantnet: plantnet && !plantnet.notFound ? plantnet : null,
    perenual,
    permapeople,
    notFound: sources.length === 0,
    sources,
  };

  // Cache result
  await cachePlantData(plantName, combined);

  return combined;
}

async function getCachedPlantData(plantName: string): Promise<CombinedPlantData | null> {
  try {
    const { data } = await supabase
      .from('plant_info_cache')
      .select('combined_data')
      .eq('plant_name', plantName.toLowerCase().trim())
      .single();

    if (data?.combined_data) {
      const cacheAge = Date.now() - new Date(data.created_at).getTime();
      if (cacheAge < CACHE_DURATION_MS) {
        return data.combined_data;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function cachePlantData(plantName: string, data: CombinedPlantData): Promise<void> {
  await supabase.from('plant_info_cache').upsert({
    plant_name: plantName.toLowerCase().trim(),
    combined_data: data,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/plantInfoService.ts
git commit -m "feat: combine all 3 APIs in plantInfoService"
```

---

## Task 6: Database Schema Update

**Files:**
- Create: `supabase/migrations/202603271300_plant_api_caching.sql`

- [ ] **Step 1: Create migration**

```sql
-- Add combined_data column to plant_info_cache
ALTER TABLE plant_info_cache ADD COLUMN IF NOT EXISTS combined_data JSONB;

-- Rename and add new columns to plants table
ALTER TABLE plants ADD COLUMN IF NOT EXISTS perenual_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS permapeople_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plant_info_fetched_at TIMESTAMPTZ;

-- Add source column to learnings if not exists
ALTER TABLE learnings ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';
```

- [ ] **Step 2: Push migration**

```bash
npx supabase db push
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "db: add combined plant data columns"
```

---

## Task 7: PlantDetailScreen UI Update

**Files:**
- Modify: `src/screens/PlantDetailScreen.tsx`

- [ ] **Step 1: Add combined info display**

Add imports and update the section:

```tsx
import { fetchAllPlantData } from '../services/plantInfoService';

// In component:
const [plantInfo, setPlantInfo] = useState<CombinedPlantData | null>(null);

useEffect(() => {
  if (plant.perenual_data || plant.permapeople_data) {
    setPlantInfo({
      plantnet: plant.plantnet_data,
      perenual: plant.perenual_data,
      permapeople: plant.permapeople_data,
      notFound: false,
      sources: [],
    });
  }
}, [plant]);

// Add sections for each API:
{/* Perenual Section */}
{plantInfo?.perenual && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>💧 Pflege (Perenual)</Text>
    <Text>💦 Gießen: {plantInfo.perenual.watering}</Text>
    <Text>☀️ Licht: {plantInfo.perenual.sunlight?.join(', ')}</Text>
    <Text>📊 Pflege-Level: {plantInfo.perenual.care_level}</Text>
    <Text>📈 Wachstum: {plantInfo.perenual.growth_rate}</Text>
    <Text>🪴 Boden: {plantInfo.perenual.soil?.join(', ')}</Text>
  </View>
)}

{/* Permapeople Section */}
{plantInfo?.permapeople && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>🌿 Permakultur (Permapeople)</Text>
    {plantInfo.permapeople.layers && (
      <Text>🏗️ Layer: {plantInfo.permapeople.layers.join(', ')}</Text>
    )}
    {plantInfo.permapeople.edible_parts && (
      <Text>🍴 Essbar: {plantInfo.permapeople.edible_parts.join(', ')}</Text>
    )}
    <Text>💧 Wasser: {plantInfo.permapeople.water_requirement}</Text>
    <Text>☀️ Licht: {plantInfo.permapeople.light_requirement}</Text>
  </View>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/PlantDetailScreen.tsx
git commit -m "feat: display Perenual and Permapeople data on PlantDetailScreen"
```

---

## Task 8: Update AddPlantScreen

**Files:**
- Modify: `src/screens/AddPlantScreen.tsx`

- [ ] **Step 1: Fetch all API data after plant creation**

```typescript
import { fetchAllPlantData } from '../services/plantInfoService';

// After plant is created:
if (formData.name) {
  setFetchingPlantInfo(true);
  try {
    const allData = await fetchAllPlantData(formData.name);
    
    // Update plant with all data
    await supabase.from('plants').update({
      plantnet_data: allData.plantnet,
      perenual_data: allData.perenual,
      permapeople_data: allData.permapeople,
      plant_info_fetched_at: new Date().toISOString(),
    }).eq('id', newPlant.id);

    // Create learnings from data
    await createLearningsFromPlantData(newPlant.id, allData);
  } catch (error) {
    console.error('Failed to fetch plant data:', error);
  } finally {
    setFetchingPlantInfo(false);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/AddPlantScreen.tsx
git commit -m "feat: fetch all 3 APIs after plant creation"
```

---

## Task 9: Learning Creation with Source Badge

**Files:**
- Modify: `src/services/learningService.ts` or add to plantInfoService

- [ ] **Step 1: Create learnings from combined data**

```typescript
export async function createLearningsFromPlantData(
  plantId: string, 
  plantInfo: CombinedPlantData
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const learnings = [];

  // From Perenual
  if (plantInfo.perenual) {
    learnings.push({
      title: `💧 Gießen: ${plantInfo.perenual.common_name}`,
      content: `Gießen: ${plantInfo.perenual.watering}\nPflege-Level: ${plantInfo.perenual.care_level}\nBoden: ${plantInfo.perenual.soil?.join(', ')}`,
      related_plants: [plantId],
      source: 'ai',
    });

    learnings.push({
      title: `☀️ Standort: ${plantInfo.perenual.common_name}`,
      content: `Licht: ${plantInfo.perenual.sunlight?.join(', ')}\nWinterhärte: Zone ${plantInfo.perenual.hardiness?.min}-${plantInfo.perenual.hardiness?.max}`,
      related_plants: [plantId],
      source: 'ai',
    });
  }

  // From Permapeople
  if (plantInfo.permapeople) {
    if (plantInfo.permapeople.layers?.length) {
      learnings.push({
        title: `🏗️ Permakultur-Layer`,
        content: `Geeignete Layer: ${plantInfo.permapeople.layers.join(', ')}`,
        related_plants: [plantId],
        source: 'ai',
      });
    }

    if (plantInfo.permapeople.edible_parts?.length) {
      learnings.push({
        title: `🍴 Essbare Teile`,
        content: `Essbar: ${plantInfo.permapeople.edible_parts.join(', ')}`,
        related_plants: [plantId],
        source: 'ai',
      });
    }
  }

  // Insert all learnings
  for (const learning of learnings) {
    await supabase.from('learnings').insert({
      user_id: user.id,
      ...learning,
      dismissed: false,
      relevance_score: 0,
      valid_for_zeitraeume: [],
      flexible: false,
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/plantInfoService.ts
git commit -m "feat: auto-create learnings from combined plant data"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Environment & API Keys |
| 2 | TypeScript Types |
| 3 | Perenual Service |
| 4 | Permapeople Service |
| 5 | Combined PlantInfoService |
| 6 | Database Schema |
| 7 | PlantDetailScreen UI |
| 8 | AddPlantScreen Integration |
| 9 | Learning Creation |

---

**Plan complete.** Which execution approach?

1. **Subagent-Driven (recommended)** - I dispatch fresh subagent per task
2. **Inline Execution** - Execute tasks in this session
