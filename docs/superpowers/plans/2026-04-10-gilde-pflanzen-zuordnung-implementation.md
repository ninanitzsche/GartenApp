# Gilde Pflanzen-Zuordnung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**.toggle-buttons UI für Pflanzen-Zuordnung zu Gilden, mit Fallback Inventar-Suche und Reihenfolge-Pfeilen nach dem Speichern

**Architecture:** Bestehendes GildeEditScreen erweitern: Toggle-Buttons statt Autovervollständigung, Beet-Pflanzen zuerst laden, Fallback-Button, Reihenfolge-Pfeile

**Tech Stack:** React Native, TypeScript, Supabase

---

## Task 1: PlantToggleRow Komponente erstellen

**Files:**
- Create: `src/components/gilde/PlantToggleRow.tsx`

```typescript
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';

interface PlantToggleRowProps {
  plantName: string;
  role: string;
  isZugeordnet: boolean;
  onToggle: () => void;
  onRoleChange: (role: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showReorder?: boolean;
}

export default function PlantToggleRow({
  plantName,
  role,
  isZugeordnet,
  onToggle,
  onRoleChange,
  onMoveUp,
  onMoveDown,
  showReorder = false,
}: PlantToggleRowProps) {
  return (
    <View style={[styles.row, isZugeordnet && styles.rowActive]}>
      <TouchableOpacity style={styles.toggleButton} onPress={onToggle}>
        <MaterialIcons
          name={isZugeordnet ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={isZugeordnet ? Colors2026.primary : Colors2026.textMuted}
        />
      </TouchableOpacity>
      
      <Text style={[styles.plantName, isZugeordnet && styles.plantNameActive]}>
        {plantName}
      </Text>
      
      <TextInput
        style={styles.roleInput}
        value={role}
        onChangeText={onRoleChange}
        placeholder="Rolle"
        placeholderTextColor={Colors2026.textMuted}
        editable={isZugeordnet}
      />
      
      {showReorder && isZugeordnet && (
        <View style={styles.reorderButtons}>
          <TouchableOpacity onPress={onMoveUp} style={styles.reorderButton}>
            <MaterialIcons name="arrow-upward" size={20} color={Colors2026.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onMoveDown} style={styles.reorderButton}>
            <MaterialIcons name="arrow-downward" size={20} color={Colors2026.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.sm,
    borderRadius: Radius2026.sm,
    marginBottom: Spacing2026.xs,
  },
  rowActive: {
    backgroundColor: Colors2026.primary + '15',
  },
  toggleButton: {
    marginRight: Spacing2026.sm,
  },
  plantName: {
    ...Typography2026.body,
    color: Colors2026.textMuted,
    flex: 1,
  },
  plantNameActive: {
    color: Colors2026.text,
    fontWeight: '600',
  },
  roleInput: {
    ...Typography2026.body,
    color: Colors2026.text,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    padding: Spacing2026.xs,
    width: 100,
    textAlign: 'center',
  },
  reorderButtons: {
    flexDirection: 'row',
    marginLeft: Spacing2026.sm,
  },
  reorderButton: {
    padding: Spacing2026.xs,
  },
});
```

- [ ] **Step 1: Create PlantToggleRow component**

- [ ] **Step 2: Run test to verify it compiles**

Run: `npx tsc --noEmit src/components/gilde/PlantToggleRow.tsx`
Expected: No errors (may show deprecation warnings but should compile)

- [ ] **Step 3: Commit**

```bash
git add src/components/gilde/PlantToggleRow.tsx
git commit -m "feat: add PlantToggleRow component for Gilde plant assignment"
```

---

## Task 2: GildeEditScreen - Toggle-UI integrieren

**Files:**
- Modify: `src/screens/GildeEditScreen.tsx:380-430`

- [ ] **Step 1: Add new state for toggle mode**

```typescript
const [toggleMode, setToggleMode] = useState(false);
const [pflanzenZugeordnet, setPflanzenZugeordnet] = useState<string[]>([]);
```

- [ ] **Step 2: Implement toggle functions**

```typescript
const togglePflanze = (plantName: string) => {
  if (pflanzenZugeordnet.includes(plantName)) {
    setPflanzenZugeordnet(pflanzenZugeordnet.filter(p => p !== plantName));
    setPlants(plants.filter(p => p.name !== plantName));
  } else {
    setPflanzenZugeordnet([...pflanzenZugeordnet, plantName]);
    setPlants([...plants, { name: plantName, role: '' }]);
  }
};

const isZugeordnet = (plantName: string) => pflanzenZugeordnet.includes(plantName);

const movePlantUp = (index: number) => {
  if (index === 0) return;
  const updated = [...plants];
  const temp = updated[index];
  updated[index] = updated[index - 1];
  updated[index - 1] = temp;
  setPlants(updated);
};

const movePlantDown = (index: number) => {
  if (index === plants.length - 1) return;
  const updated = [...plants];
  const temp = updated[index];
  updated[index] = updated[index + 1];
  updated[index + 1] = temp;
  setPlants(updated);
};
```

- [ ] **Step 3: Replace plant list UI with toggle list**

Replace lines 389-425 with:

```typescript
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Pflanzen *</Text>
  <View style={styles.toggleModeContainer}>
    <TouchableOpacity
      style={[styles.toggleModeButton, !toggleMode && styles.toggleModeButtonActive]}
      onPress={() => setToggleMode(false)}
    >
      <Text style={[styles.toggleModeText, !toggleMode && styles.toggleModeTextActive]}>
        Liste
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.toggleModeButton, toggleMode && styles.toggleModeButtonActive]}
      onPress={() => setToggleMode(true)}
    >
      <Text style={[styles.toggleModeText, toggleMode && styles.toggleModeTextActive]}>
        Toggle
      </Text>
    </TouchableOpacity>
  </View>
</View>

{/* Beet-Pflanzen anzeigen */}
{selectedBedId && beetPflanzen.length > 0 && (
  <View style={styles.plantSection}>
    <Text style={styles.sectionLabel}>Aus Beet</Text>
    {toggleMode ? (
      beetPflanzen.map((plant, index) => (
        <PlantToggleRow
          key={plant.id}
          plantName={plant.name}
          role={plants.find(p => p.name === plant.name)?.role || ''}
          isZugeordnet={isZugeordnet(plant.name)}
          onToggle={() => togglePflanze(plant.name)}
          onRoleChange={(role) => {
            const idx = plants.findIndex(p => p.name === plant.name);
            if (idx >= 0) {
              const updated = [...plants];
              updated[idx] = { ...updated[idx], role };
              setPlants(updated);
            }
          }}
          onMoveUp={() => movePlantUp(idx)}
          onMoveDown={() => movePlantDown(idx)}
          showReorder={isEditing}
        />
      ))
    ) : (
      /* existing list code */
    )}
  </View>
)}

{/* Fallback Button */}
{(!selectedBedId || beetPflanzen.length === 0) && (
  <TouchableOpacity style={styles.fallbackButton} onPress={() => setShowPlantPicker(true)}>
    <MaterialIcons name="search" size={20} color={Colors2026.primary} />
    <Text style={styles.fallbackButtonText}>Im Inventar suchen</Text>
  </TouchableOpacity>
)}

{/* Alle Pflanzen im Toggle-Modus wenn kein Beet */}
{selectedBedId && beetPflanzen.length > 0 && (
  <TouchableOpacity style={styles.fallbackButton} onPress={() => setShowAllPlants(true)}>
    <MaterialIcons name="search" size={20} color={Colors2026.primary} />
    <Text style={styles.fallbackButtonText}>Im Inventar suchen</Text>
  </TouchableOpacity>
)}
```

- [ ] **Step 4: Add fallback button styles**

```typescript
fallbackButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: Spacing2026.md,
  marginTop: Spacing2026.sm,
  borderTopWidth: 1,
  borderTopColor: Colors2026.border,
  gap: Spacing2026.sm,
},
fallbackButtonText: {
  ...Typography2026.body,
  color: Colors2026.primary,
},
toggleModeContainer: {
  flexDirection: 'row',
  backgroundColor: Colors2026.surface,
  borderRadius: Radius2026.sm,
  padding: 2,
},
toggleModeButton: {
  paddingHorizontal: Spacing2026.sm,
  paddingVertical: Spacing2026.xs,
  borderRadius: Radius2026.sm - 2,
},
toggleModeButtonActive: {
  backgroundColor: Colors2026.primary + '20',
},
toggleModeText: {
  ...Typography2026.small,
  color: Colors2026.textMuted,
},
toggleModeTextActive: {
  color: Colors2026.primary,
  fontWeight: '600',
},
sectionLabel: {
  ...Typography2026.caption,
  color: Colors2026.textSecondary,
  marginTop: Spacing2026.sm,
  marginBottom: Spacing2026.xs,
},
plantSection: {
  marginBottom: Spacing2026.sm,
},
```

- [ ] **Step 5: Run to verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/screens/GildeEditScreen.tsx
git commit -m "feat: add toggle UI for Gilde plant assignment"
```

---

## Task 3: Beet-Pflanzen beim Laden initialisieren

**Files:**
- Modify: `src/screens/GildeEditScreen.tsx:142-161`

- [ ] **Step 1: Ensure pflanzenZugeordnet is populated when editing existing gilde**

After loading existing gilde (line 140), add:

```typescript
useEffect(() => {
  if (gilde?.plants) {
    setPflanzenZugeordnet(gilde.plants.map(p => p.name));
  }
}, [gilde]);
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/GildeEditScreen.tsx
git commit -m "feat: initialize zugeordnet plants when editing existing gilde"
```

---

## Task 4: Tests schreiben

**Files:**
- Create: `src/components/gilde/__tests__/PlantToggleRow.test.tsx`

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlantToggleRow from '../PlantToggleRow';

describe('PlantToggleRow', () => {
  it('renders plant name', () => {
    const { getByText } = render(
      <PlantToggleRow
        plantName="Tomate"
        role=""
        isZugeordnet={false}
        onToggle={() => {}}
        onRoleChange={() => {}}
      />
    );
    expect(getByText('Tomate')).toBeTruthy();
  });

  it('calls onToggle when pressed', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <PlantToggleRow
        plantName="Tomate"
        role=""
        isZugeordnet={false}
        onToggle={onToggle}
        onRoleChange={() => {}}
      />
    );
    fireEvent.press(getByText('Tomate'));
    expect(onToggle).toHaveBeenCalled();
  });
});
```

- [ ] **Step 1: Write test**

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/gilde/__tests__/PlantToggleRow.test.tsx`
Expected: FAIL (component exists but may have import issues)

- [ ] **Step 3: Verify test passes after implementation**

- [ ] **Step 4: Commit**

---

## Akzeptanzkriterien Coverage

- [x] Task 1-2: Beet auswählen → Beet-Pflanzen laden (existiert bereits)
- [x] Task 1-2: Toggle-Button für jede Pflanze sichtbar
- [x] Task 2: Tap auf Toggle → Pflanze zur Gilde hinzufügen/entfernen
- [x] Task 2: Rolle direkt eingeben möglich
- [x] Task 2: Fallback "Im Inventar suchen" bei leerem Beet
- [x] Task 3: Nach Speichern: Reihenfolge-Pfeile sichtbar
- [x] Task 2: Pfeile ändern Position in der Liste

---

## Offene Fragen

- [x] Reihenfolge beim Erstellen? → Nein, erst nach Speichern (showReorder={isEditing})
- [x] Rolle Pflicht? → Nein, optional
- [x] Fallback wann? → Wenn kein Beet oder Beet leer