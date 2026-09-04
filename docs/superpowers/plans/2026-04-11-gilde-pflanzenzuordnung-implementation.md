# Gilde Pflanzen-Zuordnung UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement UX improvements for Gilde plant assignment: Role dropdown, smart suggestions, bulk actions, toptip marking, and plant status display.

**Architecture:**
- PlantToggleRow erweitert mit Role-Dropdown
- Neue CompanionSuggestion Component
- PlantSearchWithToptip erweitert
- Pflanzendetail zeigt Gilden-Zugehörigkeit
- KI-Integration für Rollen-Vorschläge

**Tech Stack:** React Native, Supabase, TypeScript

---

## File Overview

| File | Action | Responsibility |
|------|--------|----------------|
| `src/data/plant-roles.ts` | Create | Konstante für Rollen |
| `src/components/gilde/PlantToggleRow.tsx` | Modify | Role-Dropdown hinzufügen |
| `src/components/gilde/CompanionSuggestion.tsx` | Create | Vorschläge anzeigen |
| `src/components/gilde/PlantSearchWithToptip.tsx` | Create | Suche mit Toptip |
| `src/components/gilde/BulkActionBar.tsx` | Create | Bulk-Aktionen |
| `src/screens/PlantDetailScreen.tsx` | Modify | Gilden-Zugehörigkeit anzeigen |
| `src/services/gildePlantService.ts` | Create/Modify | Gilde-Pflanzen Logik |

---

## Task 1: Plant Roles Data

**Files:**
- Create: `src/data/plant-roles.ts`

### Task 1a: Create plant-roles.ts

- [ ] **Step 1: Create roles data**

```typescript
export const PLANT_ROLES = [
  'Rankgerüst',
  'Stickstofffixierung',
  'Lebender Mulch',
  'Bestäubungsmagnet',
  'Pilzschutz',
  'Blattlaus-Abwehr',
  'Lückenfüller',
  'Halbschatten',
  'Aroma',
  'Bodenschutz',
  'Hauptpflanze',
  'Begleitpflanze',
  'Füllpflanze',
] as const;

export type PlantRole = typeof PLANT_ROLES[number];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/plant-roles.ts
git commit -m "feat: add PLANT_ROLES constant"
```

---

## Task 2: PlantToggleRow with Role-Dropdown

**Files:**
- Modify: `src/components/gilde/PlantToggleRow.tsx`

### Task 2a: Add Role-Dropdown

- [ ] **Step 1: Import PLANT_ROLES**

```typescript
import { PLANT_ROLES } from '../../data/plant-roles';
```

- [ ] **Step 2: Replace TextInput with Picker**

Add to component:
```typescript
import { Picker } from '@react-native-picker/picker';

// In render, replace role TextInput with:
<Picker
  selectedValue={role}
  onValueChange={onRoleChange}
  style={styles.rolePicker}
>
  <Picker.Item label="Rolle wählen..." value="" />
  {PLANT_ROLES.map(r => (
    <Picker.Item key={r} label={r} value={r} />
  ))}
</Picker>
```

- [ ] **Step 3: Add styles for picker**

```typescript
rolePicker: {
  height: 44,
  fontSize: 14,
},
```

- [ ] **Step 4: Commit**

```bash
git add src/components/gilde/PlantToggleRow.tsx
git commit -m "feat: add role dropdown to PlantToggleRow"
```

---

## Task 3: CompanionSuggestion Component

**Files:**
- Create: `src/components/gilde/CompanionSuggestion.tsx`
- Modify: `src/screens/GildeEditScreen.tsx`

### Task 3a: Create CompanionSuggestion

- [ ] **Step 1: Create component**

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { MaterialIcons } from '@expo/vector-icons';

interface CompanionSuggestionProps {
  mainPlant: string;
  suggestions: { name: string; benefit: string }[];
  onSelect: (plantName: string) => void;
}

export default function CompanionSuggestion({ 
  mainPlant, 
  suggestions,
  onSelect,
}: CompanionSuggestionProps) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💡 Passend für {mainPlant}:</Text>
      <View style={styles.chips}>
        {suggestions.map(s => (
          <TouchableOpacity
            key={s.name}
            style={styles.chip}
            onPress={() => onSelect(s.name)}
          >
            <Text style={styles.chipName}>● {s.name}</Text>
            <Text style={styles.chipBenefit}>{s.benefit}</Text>
            <MaterialIcons name="add" size={16} color={Colors2026.primary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing2026.md },
  title: { ...Typography2026.caption, color: Colors2026.textMuted, marginBottom: Spacing2026.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing2026.sm },
  chip: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: Colors2026.surface,
    padding: Spacing2026.sm,
    borderRadius: Radius2026.md,
    gap: Spacing2026.xs,
  },
  chipName: { ...Typography2026.body, color: Colors2026.text },
  chipBenefit: { ...Typography2026.caption, color: Colors2026.success },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/gilde/CompanionSuggestion.tsx
git commit -m "feat: add CompanionSuggestion component"
```

---

## Task 4: PlantSearchWithToptip

**Files:**
- Create: `src/components/gilde/PlantSearchWithToptip.tsx`

### Task 4a: Create search with toptip

- [ ] **Step 1: Create component**

```typescript
import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity 
} from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { MaterialIcons } from '@expo/vector-icons';
import { plantKnowledgeMap, getGoodCompanions } from '../../data/plant-knowledge-map';

interface PlantSearchWithToptipProps {
  onSelectPlant: (plantName: string) => void;
  existingPlants: string[];
}

export default function PlantSearchWithToptip({ 
  onSelectPlant, 
  existingPlants = [],
}: PlantSearchWithToptipProps) {
  const [search, setSearch] = useState('');

  const allPlants = useMemo(() => {
    return plantKnowledgeMap.map(p => p.plantName);
  }, []);

  const filteredPlants = useMemo(() => {
    if (!search) return [];
    return allPlants.filter(p => 
      p.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 10);
  }, [search, allPlants]);

  const toptipPlants = useMemo(() => {
    return existingPlants.flatMap(plant => 
      getGoodCompanions(plant).slice(0, 2)
    ).filter((p, i, arr) => arr.indexOf(p) === i);
  }, [existingPlants]);

  const isToptip = (plantName: string) => 
    toptipPlants.some(t => t.name === plantName);

  const renderPlant = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.plantItem, isToptip(item) && styles.toptipItem]}
      onPress={() => onSelectPlant(item)}
    >
      <View style={styles.plantContent}>
        {isToptip(item) && (
          <View style={styles.toptipBadge}>
            <Text style={styles.toptipText}>★</Text>
          </View>
        )}
        <Text style={styles.plantName}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pflanze suchen..."
        placeholderTextColor={Colors2026.textMuted}
        value={search}
        onChangeText={setSearch}
      />
      {filteredPlants.length > 0 && (
        <FlatList
          data={filteredPlants}
          renderItem={renderPlant}
          keyExtractor={item => item}
          style={styles.results}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing2026.md },
  searchInput: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    color: Colors2026.text,
    fontSize: 16,
  },
  results: { maxHeight: 200, marginTop: Spacing2026.sm },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing2026.sm,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    marginBottom: Spacing2026.xs,
  },
  toptipItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors2026.primary,
  },
  plantContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  toptipBadge: { marginRight: Spacing2026.sm },
  toptipText: { color: Colors2026.primary, fontWeight: '700' },
  plantName: { ...Typography2026.body, color: Colors2026.text },
});
```

- [ ] **Step 2: Add helper functions to plant-knowledge-map.ts**

```typescript
export function getGoodCompanions(plantName: string): { name: string; benefit: string }[] {
  const plant = plantKnowledgeMap.find(p => 
    p.plantName.toLowerCase() === plantName.toLowerCase()
  );
  if (!plant?.extractedInfo?.companions) return [];
  
  return plant.extractedInfo.companions
    .filter(c => c.type === 'good')
    .map(c => ({ name: c.plant, benefit: '+' }));
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/gilde/PlantSearchWithToptip.tsx src/data/plant-knowledge-map.ts
git commit -m "feat: add PlantSearchWithToptip component"
```

---

## Task 5: BulkActionBar Component

**Files:**
- Create: `src/components/gilde/BulkActionBar.tsx`

### Task 5a: Create BulkActionBar

- [ ] **Step 1: Create component**

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';

interface BulkActionBarProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
  count: number;
}

export default function BulkActionBar({ 
  onSelectAll, 
  onDeselectAll,
  count,
}: BulkActionBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onSelectAll}>
        <Text style={styles.buttonText}>Alle auswählen</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onDeselectAll}>
        <Text style={styles.buttonText}>Alle abwählen</Text>
      </TouchableOpacity>
      <Text style={styles.count}>{count} ausgewählt</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing2026.sm,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    marginBottom: Spacing2026.md,
  },
  button: {
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
    borderWidth: 1,
    borderColor: Colors2026.primary,
  },
  buttonText: { ...Typography2026.caption, color: Colors2026.primary },
  count: { ...Typography2026.caption, color: Colors2026.textMuted },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/gilde/BulkActionBar.tsx
git commit -m "feat: add BulkActionBar component"
```

---

## Task 6: PlantDetailScreen - Gilden-Zugehörigkeit

**Files:**
- Modify: `src/screens/PlantDetailScreen.tsx`

### Task 6a: Show Gilde associations

- [ ] **Step 1: Find section where plant details are shown**

In PlantDetailScreen, add Gilde section after Beet section:

```typescript
// Find: where plant.beetId or similar is displayed
// Add after it:
{gilden.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Gilden</Text>
    {gilden.map(g => (
      <View key={g.id} style={styles.gildeItem}>
        <MaterialIcons name="group-work" size={20} color={Colors2026.primary} />
        <Text style={styles.gildeName}>{g.name}</Text>
        <Text style={styles.gildeRole}>({g.role})</Text>
      </View>
    ))}
  </View>
)}
```

- [ ] **Step 2: Load gilden for this plant**

```typescript
// Add to useEffect or data loading:
const gildenWithPlant = useMemo(() => {
  return allGilden.filter(g => 
    g.plants?.some(p => p.name === plant.name)
  );
}, [allGilden, plant]);
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/PlantDetailScreen.tsx
git commit -m "feat: show gilde associations in PlantDetail"
```

---

## Task 7: GildeEditScreen Integration

**Files:**
- Modify: `src/screens/GildeEditScreen.tsx`

### Task 7a: Add all components together

- [ ] **Step 1: Import new components**

```typescript
import CompanionSuggestion from '../components/gilde/CompanionSuggestion';
import PlantSearchWithToptip from '../components/gilde/PlantSearchWithToptip';
import BulkActionBar from '../components/gilde/BulkActionBar';
```

- [ ] **Step 2: Add to render**

Add after the plants list:
```typescript
{/* Companion Suggestions */}
<CompanionSuggestion
  mainPlant="Tomate"
  suggestions={[
    { name: 'Basilikum', benefit: '+ Bestäubung' },
    { name: 'Knoblauch', benefit: '+ Pilzschutz' },
  ]}
  onSelect={(name) => addPlant(name)}
/>

{/* Search with Toptip */}
<PlantSearchWithToptip
  onSelectPlant={addPlant}
  existingPlants={plants.map(p => p.name)}
/>

{/* Bulk Actions (if editing) */}
{isEditing && (
  <BulkActionBar
    onSelectAll={selectAllPlants}
    onDeselectAll={deselectAllPlants}
    count={selectedCount}
  />
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/GildeEditScreen.tsx
git commit -m "feat: integrate new components in GildeEditScreen"
```

---

## Summary

After completion:
- ✓ Role dropdown replaces text input
- ✓ Companion suggestions show below plant list
- ✓ Toptip marking with ★ in search
- ✓ Bulk action bar for select all/deselect all
- ✓ PlantDetailScreen shows Gilde associations
- ✓ All components integrated in GildeEditScreen

**Total: ~7 Tasks, ~7 Commits**