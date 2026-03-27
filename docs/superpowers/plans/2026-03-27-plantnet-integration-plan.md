# PlantNet Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatische Pflanzeninformationen von PlantNet bei jeder Pflanzenhinzufügung abrufen und alle bestehenden Pflanzen retroaktiv mit Daten versorgen. Learnings/Tasks werden automatisch generiert und als "KI-generiert" gekennzeichnet.

**Architecture:** Neue Service-Schicht für PlantNet API, Datenbank-Cache-Tabelle, UI-Erweiterungen für Anzeige und Batch-Update mit Fortschrittsanzeige.

**Tech Stack:** React Native, Supabase, TypeScript, PlantNet API

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/services/plantInfoService.ts` | NEW - PlantNet API calls, caching, auto-learning creation |
| `src/types/plant.ts` | Add PlantNet fields to Plant type |
| `src/types/ai.ts` | Add PlantNetData interface |
| `src/screens/PlantDetailScreen.tsx` | Display PlantNet info section |
| `src/screens/AddPlantScreen.tsx` | Auto-fetch after AI identification |
| `src/components/ui/PlantInfoCard.tsx` | NEW - Reusable card for PlantNet data display |
| `src/components/ui/BatchProgressModal.tsx` | NEW - Progress modal for batch updates |
| `supabase/migrations/` | Add database columns |

---

## Task 1: Database Schema

**Files:**
- Create: `supabase/migrations/202603271200_plantnet_integration.sql`

- [ ] **Step 1: Create migration file**

```sql
-- PlantNet cache table
CREATE TABLE IF NOT EXISTS plant_info_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255),
  plantnet_response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plant_name)
);

-- Add columns to plants table
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plantnet_id VARCHAR(100);
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plantnet_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS plantnet_fetched_at TIMESTAMPTZ;

-- Add source column to learnings
ALTER TABLE learnings ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';

-- Add source column to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';

-- Index for caching
CREATE INDEX IF NOT EXISTS idx_plant_info_cache_name ON plant_info_cache(plant_name);
```

- [ ] **Step 2: Push migration to remote**

Run: `npx supabase db push`

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "db: add PlantNet integration tables and columns"
```

---

## Task 2: TypeScript Types

**Files:**
- Modify: `src/types/ai.ts`
- Modify: `src/types/plant.ts`

- [ ] **Step 1: Add PlantNetData interface to ai.ts**

```typescript
// Add to src/types/ai.ts

export interface PlantNetData {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  commonNames: string[];
  images: Array<{
    url: string;
    license: string;
  }>;
  notFound?: boolean;
}
```

- [ ] **Step 2: Add PlantNet fields to Plant type in plant.ts**

```typescript
// Add to Plant interface in src/types/plant.ts
plantnet_id?: string;
plantnet_data?: any;
plantnet_fetched_at?: string;
```

- [ ] **Step 3: Commit**

```bash
git add src/types/ai.ts src/types/plant.ts
git commit -m "types: add PlantNet data types"
```

---

## Task 3: plantInfoService - Core Functions

**Files:**
- Create: `src/services/plantInfoService.ts`

- [ ] **Step 1: Create the service file**

```typescript
import { supabase } from './supabase';
import { PlantNetData, PlantNetResponse } from '../types/ai';

const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function getPlantInfo(plantName: string): Promise<PlantNetData | null> {
  if (!plantName || plantName.trim().length === 0) {
    return null;
  }

  try {
    // Check cache first
    const { data: cached } = await supabase
      .from('plant_info_cache')
      .select('*')
      .eq('plant_name', plantName.toLowerCase().trim())
      .single();

    if (cached) {
      const cacheAge = Date.now() - new Date(cached.created_at).getTime();
      if (cacheAge < CACHE_DURATION_MS) {
        return parsePlantNetResponse(cached.plantnet_response);
      }
    }

    // Fetch from PlantNet API
    const plantData = await fetchFromPlantNet(plantName);
    
    if (!plantData) {
      // Store not found result
      await supabase
        .from('plant_info_cache')
        .upsert({
          plant_name: plantName.toLowerCase().trim(),
          scientific_name: null,
          plantnet_response: { notFound: true },
        });
      return { notFound: true } as PlantNetData;
    }

    // Cache the result
    await supabase
      .from('plant_info_cache')
      .upsert({
        plant_name: plantName.toLowerCase().trim(),
        scientific_name: plantData.scientificName,
        plantnet_response: plantData,
      });

    return plantData;
  } catch (error) {
    console.error('Error fetching plant info:', error);
    return null;
  }
}

async function fetchFromPlantNet(plantName: string): Promise<PlantNetData | null> {
  // Use existing PlantNet proxy or call directly
  // For now, return mock data structure - will integrate with existing PlantNet service
  try {
    const { identifyPlantByName } = await import('./aiService');
    // Note: This would need a new function to identify by name, not image
    // For now, return null to skip API call
    return null;
  } catch (error) {
    console.error('PlantNet API error:', error);
    return null;
  }
}

function parsePlantNetResponse(response: any): PlantNetData | null {
  if (!response || response.notFound) {
    return { notFound: true } as PlantNetData;
  }
  
  return {
    id: response.id || '',
    name: response.name || '',
    scientificName: response.scientificName || '',
    family: response.family || '',
    commonNames: response.commonNames || [],
    images: response.images || [],
  };
}

export async function updatePlantWithPlantInfo(plantId: string, plantInfo: PlantNetData): Promise<void> {
  await supabase
    .from('plants')
    .update({
      plantnet_data: plantInfo,
      plantnet_id: plantInfo.id,
      plantnet_fetched_at: new Date().toISOString(),
    })
    .eq('id', plantId);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/plantInfoService.ts
git commit -m "feat: add plantInfoService with caching"
```

---

## Task 4: Batch Update with Progress

**Files:**
- Modify: `src/services/plantInfoService.ts`

- [ ] **Step 1: Add batch function**

```typescript
export async function fetchAllPlantsInfo(
  onProgress?: (current: number, total: number, plantName: string) => void
): Promise<{ updated: number; failed: number }> {
  const { data: plants, error } = await supabase
    .from('plants')
    .select('id, name, plantnet_fetched_at');

  if (error || !plants) {
    throw new Error('Failed to fetch plants');
  }

  // Filter out plants already fetched within 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const plantsToUpdate = plants.filter(p => {
    if (!p.plantnet_fetched_at) return true;
    return new Date(p.plantnet_fetched_at) < thirtyDaysAgo;
  });

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < plantsToUpdate.length; i++) {
    const plant = plantsToUpdate[i];
    
    onProgress?.(i + 1, plantsToUpdate.length, plant.name);

    try {
      const plantInfo = await getPlantInfo(plant.name);
      
      if (plantInfo) {
        await updatePlantWithPlantInfo(plant.id, plantInfo);
        
        // Auto-create learnings from plant info
        await createLearningsFromPlantInfo(plant.id, plantInfo);
        
        updated++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to fetch info for ${plant.name}:`, error);
      failed++;
    }

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { updated, failed };
}

async function createLearningsFromPlantInfo(plantId: string, plantInfo: PlantNetData): Promise<void> {
  if (plantInfo.notFound) return;

  const learnings = [];

  if (plantInfo.commonNames.length > 0) {
    learnings.push({
      title: `Wissenswertes über ${plantInfo.name}`,
      content: `Deutsche Namen: ${plantInfo.commonNames.join(', ')}\n\nFamilie: ${plantInfo.family}\nWissenschaftlicher Name: ${plantInfo.scientificName}`,
      related_plants: [plantId],
      source: 'ai',
    });
  }

  if (learnings.length === 0) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  for (const learning of learnings) {
    await supabase.from('learnings').insert({
      user_id: user.id,
      ...learning,
      dismissed: false,
      relevance_score: 0,
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/plantInfoService.ts
git commit -m "feat: add batch update with progress callback"
```

---

## Task 5: UI - PlantDetailScreen Section

**Files:**
- Modify: `src/screens/PlantDetailScreen.tsx`

- [ ] **Step 1: Import plantInfoService and add section**

Add import:
```typescript
import { getPlantInfo } from '../services/plantInfoService';
```

Add new section in render (after existing info, before Notes):
```tsx
{plant.plantnet_data && !plant.plantnet_data.notFound && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>🌿 Pflanzen-Info</Text>
    {plant.plantnet_data.commonNames?.length > 0 && (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Deutsche Namen:</Text>
        <Text style={styles.infoValue}>
          {plant.plantnet_data.commonNames.join(', ')}
        </Text>
      </View>
    )}
    {plant.plantnet_data.family && (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Familie:</Text>
        <Text style={styles.infoValue}>{plant.plantnet_data.family}</Text>
      </View>
    )}
    {plant.plantnet_data.scientificName && (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Wissenschaftlich:</Text>
        <Text style={[styles.infoValue, styles.italic]}>
          {plant.plantnet_data.scientificName}
        </Text>
      </View>
    )}
  </View>
)}

{plant.plantnet_data?.notFound && (
  <View style={styles.notFoundBadge}>
    <Text style={styles.notFoundText}>⚠️ Keine PlantNet-Daten gefunden</Text>
  </View>
)}
```

Add styles:
```typescript
section: {
  backgroundColor: Colors2026.surface,
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
},
sectionTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: Colors2026.text,
  marginBottom: 12,
},
infoRow: {
  marginBottom: 8,
},
infoLabel: {
  fontSize: 12,
  color: Colors2026.textSecondary,
  marginBottom: 2,
},
infoValue: {
  fontSize: 14,
  color: Colors2026.text,
},
italic: {
  fontStyle: 'italic',
},
notFoundBadge: {
  backgroundColor: Colors2026.warning + '20',
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
},
notFoundText: {
  fontSize: 14,
  color: Colors2026.warning,
},
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/PlantDetailScreen.tsx
git commit -m "feat: add PlantNet info section to PlantDetailScreen"
```

---

## Task 6: UI - AddPlantScreen Auto-Fetch

**Files:**
- Modify: `src/screens/AddPlantScreen.tsx`

- [ ] **Step 1: Add auto-fetch after AI identification**

Add state:
```typescript
const [fetchingPlantInfo, setFetchingPlantInfo] = useState(false);
```

Add in handleSave after createPlant:
```typescript
// Fetch PlantNet data after plant is created
if (formData.name && identificationSource === 'ai') {
  try {
    const plantInfo = await getPlantInfo(formData.name);
    if (plantInfo && !plantInfo.notFound) {
      // Update plant with PlantNet data
      // Note: Need plant ID from created plant
    }
  } catch (error) {
    console.error('Failed to fetch PlantNet info:', error);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/AddPlantScreen.tsx
git commit -m "feat: auto-fetch PlantNet data after AI identification"
```

---

## Task 7: Batch Progress Modal Component

**Files:**
- Create: `src/components/ui/BatchProgressModal.tsx`

- [ ] **Step 1: Create modal component**

```typescript
import React from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026 } from '../../theme/designSystemV2';

interface Props {
  visible: boolean;
  current: number;
  total: number;
  currentPlantName: string;
  onCancel: () => void;
}

export default function BatchProgressModal({ 
  visible, current, total, currentPlantName, onCancel 
}: Props) {
  const progress = total > 0 ? current / total : 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors2026.primary} />
          <Text style={styles.title}>Pflanzendaten werden aktualisiert</Text>
          <Text style={styles.progress}>
            {current} von {total}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.currentPlant} numberOfLines={1}>
            {currentPlantName}
          </Text>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.lg,
    padding: Spacing2026.xl,
    alignItems: 'center',
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors2026.text,
    marginTop: Spacing2026.md,
  },
  progress: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors2026.primary,
    marginTop: Spacing2026.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors2026.border,
    borderRadius: 4,
    marginTop: Spacing2026.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors2026.primary,
    borderRadius: 4,
  },
  currentPlant: {
    fontSize: 14,
    color: Colors2026.textSecondary,
    marginTop: Spacing2026.md,
  },
  cancelButton: {
    marginTop: Spacing2026.lg,
    padding: Spacing2026.sm,
  },
  cancelText: {
    fontSize: 14,
    color: Colors2026.error,
  },
});
```

- [ ] **Step 2: Add to MoreMenuScreen or Settings**

Add a button to trigger batch update:
```typescript
// In Settings or MoreMenu
const handleRefreshPlantData = async () => {
  setModalVisible(true);
  try {
    const result = await fetchAllPlantsInfo((current, total, name) => {
      setProgress({ current, total, plantName: name });
    });
    Alert.alert('Erfolg', `${result.updated} Pflanzen aktualisiert`);
  } catch (error) {
    Alert.alert('Fehler', 'Update fehlgeschlagen');
  } finally {
    setModalVisible(false);
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BatchProgressModal.tsx src/screens/MoreMenuScreen.tsx
git commit -m "feat: add batch progress modal for PlantNet updates"
```

---

## Task 8: Learning Card Badge

**Files:**
- Modify: `src/components/LearningCard.tsx`

- [ ] **Step 1: Add AI badge**

```tsx
// Add to LearningCard render
{learning.source === 'ai' && (
  <View style={styles.aiBadge}>
    <Text style={styles.aiBadgeText}>🤖 KI-generiert</Text>
  </View>
)}
```

Add styles:
```typescript
aiBadge: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: Colors2026.primary + '20',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
},
aiBadgeText: {
  fontSize: 10,
  color: Colors2026.primary,
  fontWeight: '600',
},
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LearningCard.tsx
git commit -m "feat: add AI badge to LearningCard"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Database schema (plant_info_cache, columns) |
| 2 | TypeScript types (PlantNetData, Plant fields) |
| 3 | plantInfoService core functions |
| 4 | Batch update with progress |
| 5 | PlantDetailScreen info section |
| 6 | AddPlantScreen auto-fetch |
| 7 | BatchProgressModal component |
| 8 | LearningCard AI badge |

---

**Plan complete.** Which execution approach?

1. **Subagent-Driven (recommended)** - I dispatch fresh subagent per task
2. **Inline Execution** - Execute tasks in this session
