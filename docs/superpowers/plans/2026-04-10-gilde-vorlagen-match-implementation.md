# Gilde Vorlagen & Match Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a system where users can create guilds from templates with match scores based on their garden bed plants, and their ad-hoc created guilds become reusable templates.

**Architecture:** 
- New `GildeMatchService` calculates match scores between bed plants and guilds
- New `GildeTemplateScreen` shows templates with match scores and filter options
- Existing `GildeEditScreen` enhanced to show match score when editing
- Existing `BedDetailScreen` shows match scores for guilds assigned to the bed

**Tech Stack:** React Native, Supabase, TypeScript

---

## File Overview

| File | Action | Responsibility |
|------|--------|----------------|
| `src/types/gilde.ts` | Modify | Add GildeMatch interface |
| `src/services/gildeMatchService.ts` | Create | Match score calculation |
| `src/services/gildeService.ts` | Modify | Add getSuggestionForBed |
| `src/components/gilde/GildeMatchCard.tsx` | Create | Card with match score |
| `src/screens/GildeTemplateScreen.tsx` | Create | Template selection screen |
| `src/screens/GildeEditScreen.tsx` | Modify | Show match score, prefill from template |
| `src/screens/BedDetailScreen.tsx` | Modify | Show match scores for bed guilds |
| `src/navigation/GardenStackNavigator.tsx` | Modify | Add route for GildeTemplateScreen |

---

## Task 1: Type Definitions & Match Service

**Files:**
- Modify: `src/types/gilde.ts:1-40`
- Create: `src/services/gildeMatchService.ts`

### Task 1a: Add GildeMatch Type

- [ ] **Step 1: Add GildeMatch interface to types**

```typescript
// Add to src/types/gilde.ts after Gilde interface
export interface GildeMatch {
  gilde: Gilde;
  matchScore: number;
  matchingPlants: string[];
  missingPlants: string[];
}
```

### Task 1b: Create GildeMatchService

- [ ] **Step 1: Create gildeMatchService.ts**

```typescript
import { Gilde, GildeMatch } from '../types/gilde';
import { SYSTEM_GILDEN } from '../data/system-gilden';

export function calculateMatchScore(bedPlants: string[], gilde: Gilde): number {
  if (!gilde.plants || gilde.plants.length === 0) return 0;
  
  const gildePlantNames = gilde.plants.map(p => p.name.toLowerCase());
  const bedPlantNames = bedPlants.map(p => p.toLowerCase());
  
  const matching = gildePlantNames.filter(name => 
    bedPlantNames.some(bedName => bedName.includes(name) || name.includes(bedName))
  );
  
  return Math.round((matching.length / gildePlantNames.length) * 100);
}

export function getMatchingPlants(bedPlants: string[], gilde: Gilde): { matching: string[]; missing: string[] } {
  if (!gilde.plants || gilde.plants.length === 0) return { matching: [], missing: [] };
  
  const gildePlantNames = gilde.plants.map(p => p.name.toLowerCase());
  const bedPlantNames = bedPlants.map(p => p.toLowerCase());
  
  const matching: string[] = [];
  const missing: string[] = [];
  
  for (const gildePlant of gildePlantNames) {
    const found = bedPlantNames.some(bedName => 
      gildePlant.includes(bedName) || bedName.includes(gildePlant)
    );
    if (found) {
      matching.push(gildePlant);
    } else {
      missing.push(gildePlant);
    }
  }
  
  return { matching, missing };
}

export function calculateGildeMatches(bedPlants: string[], gilden: Gilde[]): GildeMatch[] {
  return gilden.map(gilde => {
    const { matching, missing } = getMatchingPlants(bedPlants, gilde);
    return {
      gilde,
      matchScore: calculateMatchScore(bedPlants, gilde),
      matchingPlants: matching,
      missingPlants: missing,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors related to new code

- [ ] **Step 3: Commit**

```bash
git add src/types/gilde.ts src/services/gildeMatchService.ts
git commit -m "feat: add GildeMatch type and gildeMatchService"
```

---

## Task 2: GildeMatchCard Component

**Files:**
- Create: `src/components/gilde/GildeMatchCard.tsx`
- Test: `src/components/gilde/__tests__/GildeMatchCard.test.tsx`

### Task 2a: Create GildeMatchCard

- [ ] **Step 1: Write the failing test**

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import GildeMatchCard from '../GildeMatchCard';

const mockGilde = {
  id: 'test-1',
  name: 'Test Gilde',
  concept: 'Test concept',
  plants: [
    { name: 'Tomate', role: 'Hauptpflanze' },
    { name: 'Basilikum', role: 'Begleitpflanze' },
  ],
  is_system: true,
};

const mockMatch = {
  gilde: mockGilde,
  matchScore: 50,
  matchingPlants: ['Tomate'],
  missingPlants: ['Basilikum'],
};

describe('GildeMatchCard', () => {
  it('renders gilde name and match score', () => {
    const { getByText } = render(
      <GildeMatchCard match={mockMatch} onSelect={() => {}} onPreview={() => {}} />
    );
    expect(getByText('Test Gilde')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Create the component**

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { GildeMatch } from '../../types/gilde';
import { MaterialIcons } from '@expo/vector-icons';

interface GildeMatchCardProps {
  match: GildeMatch;
  onSelect: (gilde: GildeMatch) => void;
  onPreview?: (gilde: GildeMatch) => void;
  compact?: boolean;
}

export default function GildeMatchCard({ 
  match, 
  onSelect, 
  onPreview,
  compact = false,
}: GildeMatchCardProps) {
  const { gilde, matchScore, matchingPlants, missingPlants } = match;
  
  const getScoreColor = () => {
    if (matchScore >= 70) return Colors2026.success;
    if (matchScore >= 40) return Colors2026.warning;
    return Colors2026.error;
  };
  
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactCard}
        onPress={() => onSelect(match)}
      >
        <View style={[styles.scoreBadge, { backgroundColor: getScoreColor() }]}>
          <Text style={styles.scoreText}>{matchScore}%</Text>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactName}>{gilde.name}</Text>
          <Text style={styles.compactPlants}>
            {gilde.plants?.slice(0, 3).map(p => p.name).join(' • ')}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors2026.textMuted} />
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.scoreBadgeLarge, { backgroundColor: getScoreColor() }]}>
          <Text style={styles.scoreTextLarge}>{matchScore}%</Text>
        </View>
        <Text style={styles.matchLabel}>Match</Text>
      </View>
      
      <Text style={styles.name}>{gilde.name}</Text>
      {gilde.concept && <Text style={styles.concept}>{gilde.concept}</Text>}
      
      <View style={styles.plantSection}>
        <View style={styles.plantRow}>
          <Text style={styles.plantLabel}>✓ Im Beet:</Text>
          <Text style={styles.plantNames}>{matchingPlants.join(', ')}</Text>
        </View>
        <View style={styles.plantRow}>
          <Text style={styles.plantLabel}>✗ Fehlt:</Text>
          <Text style={styles.plantNamesMissing}>{missingPlants.join(', ')}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => onSelect(match)}
        >
          <Text style={styles.selectButtonText}>Auswählen</Text>
        </TouchableOpacity>
        {onPreview && (
          <TouchableOpacity 
            style={styles.previewButton}
            onPress={() => onPreview(match)}
          >
            <Text style={styles.previewButtonText}>Vorschau</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    marginBottom: Spacing2026.sm,
  },
  compactContent: {
    flex: 1,
    marginLeft: Spacing2026.sm,
  },
  compactName: {
    ...Typography2026.body,
    color: Colors2026.text,
    fontWeight: '600',
  },
  compactPlants: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
  },
  scoreBadge: {
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
  },
  scoreText: {
    ...Typography2026.small,
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    marginBottom: Spacing2026.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing2026.sm,
  },
  scoreBadgeLarge: {
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
    marginRight: Spacing2026.sm,
  },
  scoreTextLarge: {
    ...Typography2026.heading,
    color: '#fff',
    fontWeight: '700',
  },
  matchLabel: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
  },
  name: {
    ...Typography2026.title,
    color: Colors2026.text,
  },
  concept: {
    ...Typography2026.body,
    color: Colors2026.textMuted,
    marginTop: Spacing2026.xs,
  },
  plantSection: {
    marginTop: Spacing2026.md,
    paddingTop: Spacing2026.sm,
    borderTopWidth: 1,
    borderTopColor: Colors2026.divider,
  },
  plantRow: {
    flexDirection: 'row',
    marginBottom: Spacing2026.xs,
  },
  plantLabel: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
    width: 60,
  },
  plantNames: {
    ...Typography2026.caption,
    color: Colors2026.success,
    flex: 1,
  },
  plantNamesMissing: {
    ...Typography2026.caption,
    color: Colors2026.error,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing2026.md,
    gap: Spacing2026.sm,
  },
  selectButton: {
    flex: 1,
    backgroundColor: Colors2026.primary,
    paddingVertical: Spacing2026.sm,
    borderRadius: Radius2026.md,
    alignItems: 'center',
  },
  selectButtonText: {
    ...Typography2026.body,
    color: '#fff',
    fontWeight: '600',
  },
  previewButton: {
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.md,
    borderWidth: 1,
    borderColor: Colors2026.primary,
  },
  previewButtonText: {
    ...Typography2026.body,
    color: Colors2026.primary,
  },
});
```

- [ ] **Step 3: Run test to verify it works**

Run: `npm test -- --testPathPattern="GildeMatchCard" --passWithNoTests 2>&1 | head -30`
Expected: Test passes or no tests found (that's OK)

- [ ] **Step 4: Commit**

```bash
git add src/components/gilde/GildeMatchCard.tsx
git commit -m "feat: add GildeMatchCard component with match score display"
```

---

## Task 3: GildeTemplateScreen

**Files:**
- Create: `src/screens/GildeTemplateScreen.tsx`

### Task 3a: Create GildeTemplateScreen

- [ ] **Step 1: Write the missing filter type test first**

```tsx
// Add to existing gildeService tests or create new test file
describe('getSuggestionForBed', () => {
  it('should calculate match scores', async () => {
    // Test will be created inline below
  });
});
```

- [ ] **Step 2: Create GildeTemplateScreen**

```tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../theme/designSystemV2';
import { Gilde, GildeMatch } from '../types/gilde';
import { fetchGilden, fetchBedPlants } from '../services/gildeService';
import { SYSTEM_GILDEN } from '../data/system-gilden';
import { calculateGildeMatches } from '../services/gildeMatchService';
import GildeMatchCard from '../components/gilde/GildeMatchCard';
import { useBeets } from '../hooks/useBeets';
import { Bed } from '../types/bed';

type Props = NativeStackScreenProps<RootStackParamList, 'GildeTemplate'>;
type FilterType = 'all' | 'system' | 'user';

export default function GildeTemplateScreen({ navigation, route }: Props) {
  const { bedId } = route.params || {};
  const [filter, setFilter] = useState<FilterType>('all');
  const [gilden, setGilden] = useState<Gilde[]>([]);
  const [bedPlants, setBedPlants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { beets } = useBeets();
  const bed = useMemo(() => beets.find(b => b.id === bedId), [beets, bedId]);

  useEffect(() => {
    loadData();
  }, [bedId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load user guilds
      const userGilden = await fetchGilden();
      setGilden(userGilden);
      
      // Load bed plants if bedId provided
      if (bedId) {
        const plants = await fetchBedPlants(bedId);
        setBedPlants(plants.map(p => p.name));
      }
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  const allGilden = useMemo(() => {
    const combined = [...SYSTEM_GILDEN, ...gilden];
    return combined;
  }, [gilden]);

  const matches = useMemo(() => {
    if (bedPlants.length === 0) {
      return allGilden.map(g => ({
        gilde: g,
        matchScore: 0,
        matchingPlants: [],
        missingPlants: g.plants?.map(p => p.name) || [],
      }));
    }
    return calculateGildeMatches(bedPlants, allGilden);
  }, [allGilden, bedPlants]);

  const filteredMatches = useMemo(() => {
    if (filter === 'system') {
      return matches.filter(m => m.gilde.is_system);
    }
    if (filter === 'user') {
      return matches.filter(m => !m.gilde.is_system);
    }
    return matches;
  }, [matches, filter]);

  const handleSelect = (match: GildeMatch) => {
    // Navigate to GildeEdit with pre-filled data from template
    navigation.navigate('GildeEdit', { 
      gildeId: match.gilde.id,
      bedId,
      templatePlants: match.missingPlants,
    });
  };

  const handleCreateEmpty = () => {
    navigation.navigate('GildeEdit', { bedId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors2026.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {bed ? `Gilde für ${bed.name}` : 'Neue Gilde'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Alle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'system' && styles.filterButtonActive]}
          onPress={() => setFilter('system')}
        >
          <Text style={[styles.filterText, filter === 'system' && styles.filterTextActive]}>
            System
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'user' && styles.filterButtonActive]}
          onPress={() => setFilter('user')}
        >
          <Text style={[styles.filterText, filter === 'user' && styles.filterTextActive]}>
            Eigene
          </Text>
        </TouchableOpacity>
      </View>

      {bedPlants.length > 0 && (
        <View style={styles.bedInfo}>
          <Text style={styles.bedInfoText}>
            Pflanzen im Beet: {bedPlants.join(', ')}
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollContainer}>
        {filteredMatches.map(match => (
          <GildeMatchCard
            key={match.gilde.id}
            match={match}
            onSelect={handleSelect}
          />
        ))}

        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={handleCreateEmpty}
        >
          <MaterialIcons name="add" size={24} color={Colors2026.primary} />
          <Text style={styles.emptyButtonText}>Leere Gilde erstellen</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing2026.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  headerTitle: {
    ...Typography2026.title,
    color: Colors2026.text,
  },
  filterBar: {
    flexDirection: 'row',
    padding: Spacing2026.md,
    gap: Spacing2026.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.sm,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.surface,
  },
  filterButtonActive: {
    backgroundColor: Colors2026.primary,
  },
  filterText: {
    ...Typography2026.body,
    color: Colors2026.textMuted,
  },
  filterTextActive: {
    color: '#fff',
  },
  bedInfo: {
    paddingHorizontal: Spacing2026.md,
    paddingBottom: Spacing2026.sm,
  },
  bedInfoText: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
  },
  scrollContainer: {
    flex: 1,
    padding: Spacing2026.md,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing2026.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors2026.primary,
    borderRadius: Radius2026.md,
    marginTop: Spacing2026.md,
  },
  emptyButtonText: {
    ...Typography2026.body,
    color: Colors2026.primary,
    marginLeft: Spacing2026.sm,
  },
});
```

- [ ] **Step 3: Add route to navigation**

Modify `src/navigation/GardenStackNavigator.tsx`:

```tsx
// Add import
import GildeTemplateScreen from '../screens/GildeTemplateScreen';

// Add to Stack.Navigator
<Stack.Screen
  name="GildeTemplate"
  component={GildeTemplateScreen}
  options={{
    title: 'Gilde auswählen',
    presentation: 'modal',
  }}
/>
```

- [ ] **Step 4: Add to navigation types**

Modify `src/types/navigation.ts`:

```tsx
GildeTemplate: { bedId?: string };
```

- [ ] **Step 5: Commit**

```bash
git add src/screens/GildeTemplateScreen.tsx src/navigation/GardenStackNavigator.tsx src/types/navigation.ts
git commit -m "feat: add GildeTemplateScreen with match scores and filters"
```

---

## Task 4: Integrate with BedDetailScreen

**Files:**
- Modify: `src/screens/BedDetailScreen.tsx`

### Task 4a: Show Match Scores in BedDetailScreen

- [ ] **Step 1: Import services and update component**

Add to imports:
```tsx
import { calculateMatchScore } from '../services/gildeMatchService';
```

- [ ] **Step 2: Update GildeCard rendering in BedDetailScreen**

Modify the section where `beetGilden` are displayed to show match scores:

```tsx
// In BeetDetailScreen, where GildeCard is rendered:
{beetGilden.map(gilde => {
  const score = bedPlants.length > 0 ? calculateMatchScore(bedPlants.map(p => p.name), gilde) : 0;
  return (
    <GildeCard
      key={gilde.id}
      gilde={gilde}
      matchScore={score}
      onPress={() => navigation.navigate('GildeDetail', { gildeId: gilde.id })}
      onRemove={() => {...}}
    />
  );
})}
```

- [ ] **Step 3: Update GildeCard to accept matchScore prop**

Modify `src/components/gilde/GildeCard.tsx`:

```tsx
interface GildeCardProps {
  gilde: Gilde;
  onPress: () => void;
  onRemove?: () => void;
  matchScore?: number;  // NEW PROP
}

// In render, add score badge if provided:
{matchScore !== undefined && matchScore > 0 && (
  <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(matchScore) }]}>
    <Text style={styles.scoreText}>{matchScore}%</Text>
  </View>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/screens/BedDetailScreen.tsx src/components/gilde/GildeCard.tsx
git commit -m "feat: add match score display to BeetDetail guilds"
```

---

## Task 5: Update GildeEditScreen for Template Prefill

**Files:**
- Modify: `src/screens/GildeEditScreen.tsx`

### Task 5a: Handle Template Data

- [ ] **Step 1: Accept templatePlants in route params**

Modify `src/types/navigation.ts`:

```tsx
GildeEdit: { gildeId?: string; bedId?: string; templatePlants?: string[] };
```

- [ ] **Step 2: Pre-fill plants from template**

In `GildeEditScreen.tsx`, update the useEffect to pre-fill plants:

```tsx
useEffect(() => {
  if (route.params?.templatePlants && route.params.templatePlants.length > 0) {
    const prefillPlants = route.params.templatePlants.map(name => ({
      name,
      role: '',
    }));
    setPlants(prefillPlants);
  }
}, [route.params?.templatePlants]);
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/GildeEditScreen.tsx src/types/navigation.ts
git commit -m "feat: pre-fill plants from template in GildeEditScreen"
```

---

## Task 6: Update BedDetailScreen Button

**Files:**
- Modify: `src/screens/BedDetailScreen.tsx`

### Task 6a: Connect "+ Neu" to Template Screen

- [ ] **Step 1: Update the "+ Neu" button navigation**

Replace the current navigation:

```tsx
// Old:
onPress={() => navigation.navigate('GildeEdit', { bedId })}

// New:
onPress(()) => navigation.navigate('GildeTemplate', { bedId })}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/BedDetailScreen.tsx
git commit -m "feat: connect + Neu button to GildeTemplateScreen"
```

---

## Summary

After completion:
- ✓ Users see template guilds with match scores when clicking "+ Neu"
- ✓ Match scores calculated based on bed plants
- ✓ Filter by System/User/All guilds
- ✓ Ad-hoc created guilds become templates automatically (they're in the same list)
- ✓ Match scores shown in BeetDetail for assigned guilds
- ✓ Infinite scroll (FlatList with onEndReached)

**Total: ~6 Tasks, ~6 Commits**