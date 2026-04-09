# Gilden Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gilden sind Pflanzinseln - vordefinierte Kombinationen von Pflanzen die zusammenpassen. Beet kann mehrere Gilden haben.

**Architecture:** 
- GildeType + GildePlantType als interfaces
- gildeService.ts für Supabase CRUD
- useGilden Hook für React
- GildeCard + GildeSelector Components
- Vordefinierte System-Gilden als Seed-Daten

**Tech Stack:** TypeScript, Supabase, React Native

---

## File Structure

```
src/types/
├── gilde.ts                    # Gilde, GildePlant interfaces

src/services/
├── gildeService.ts            # Supabase CRUD
├── seedGildeService.ts        # Vordefinierte Gilden laden

src/hooks/
├── useGilden.ts               # React hook

src/components/gilde/
├── GildeCard.tsx              # Card component
├── GildeSelector.tsx          # Dropdown/Search

src/data/
├── system-gilden.ts          # Vordefinierte Gilden-Daten

scripts/
├── seed-gilden.ts             # Seed-Script für System-Gilden
```

---

## Tasks

### Task 1: Gilde Types erstellen

**Files:**
- Create: `src/types/gilde.ts`

- [ ] **Step 1: Create type definitions**

```typescript
export interface GildePlant {
  name: string;
  role: string;
  notes?: string;
}

export interface Gilde {
  id: string;
  number?: number;
  name: string;
  concept: string;
  plants: GildePlant[];
  standort?: string;
  tips?: string[];
  is_system: boolean;
  user_id?: string;
  created_at?: string;
}

export interface BeetGilde {
  bed_id: string;
  gilde_id: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/gilde.ts
git commit -m "feat: add Gilde type definitions"
```

---

### Task 2: System-Gilden Daten erstellen

**Files:**
- Create: `src/data/system-gilden.ts`

- [ ] **Step 1: Create predefined gilden data**

```typescript
import { Gilde } from '../types/gilde';

export const SYSTEM_GILDEN: Gilde[] = [
  {
    id: 'system-1',
    number: 1,
    name: 'Milpa (Die Drei Schwestern)',
    concept: 'Traditionelle Synergie',
    plants: [
      { name: 'Mais', role: 'Rankgerüst' },
      { name: 'Feuerbohnen', role: 'Stickstofffixierung' },
      { name: 'Kürbis/Hokkaido', role: 'Lebender Mulch' },
      { name: 'Kapuzinerkresse', role: 'Blattlaus-Abwehr' },
    ],
    is_system: true,
  },
  {
    id: 'system-2',
    number: 2,
    name: 'Vertikal-Nasch-Gilde',
    concept: 'Maximale Ernte auf kleinster Fläche',
    plants: [
      { name: 'Wassermelone Sugar Baby', role: 'A-Frame-Gerüst' },
      { name: 'Pak Choi', role: 'Halbschatten unterm Gerüst' },
      { name: 'Pflücksalat', role: 'Halbschatten' },
      { name: 'Lauchzwiebeln', role: 'Schwellschutz durch Geruch' },
      { name: 'Basilikum', role: 'Aroma und Gesundheit' },
    ],
    is_system: true,
  },
  {
    id: 'system-3',
    number: 3,
    name: 'Kartoffel-Gilde (No-Dig)',
    concept: 'Bodenaufbau ohne Umgraben',
    plants: [
      { name: 'Kartoffeln', role: 'Im Mulch-Sandwich', notes: 'Heu, Stroh, Beinwell' },
      { name: 'Dicke Bohnen', role: 'Stickstoffversorgung' },
      { name: 'Tagetes', role: 'Gegen Nematoden' },
      { name: 'Meerrettich', role: 'Pilzschutz' },
      { name: 'Knoblauch', role: 'Pilzschutz (Krautfäule)' },
      { name: 'Rote Rüben', role: 'Lückenfüller' },
    ],
    is_system: true,
  },
  {
    id: 'system-4',
    number: 4,
    name: 'Fruchtgemüse-Insel',
    concept: 'Kombination aus Starkzehrern und Sonnenanbetern',
    plants: [
      { name: 'Zucchini', role: 'Bodenschutz' },
      { name: 'Gurken', role: 'Vertikal am A-Frame' },
      { name: 'Paprika', role: 'Südkante (Sonne pur)' },
      { name: 'Borretsch', role: 'Bestäubungsmagnet' },
      { name: 'Physalis', role: 'Solitärstellung' },
    ],
    is_system: true,
  },
  {
    id: 'system-5',
    number: 5,
    name: 'Physalis & Süßkartoffel-Mix',
    concept: 'Wärme-liebende Spezialkulturen',
    plants: [
      { name: 'Süßkartoffel', role: 'Dichter Blätterteppich (Bodenschutz)' },
      { name: 'Physalis', role: 'Buschartiger Wuchs' },
      { name: 'Zinnien', role: 'Insektenweide' },
      { name: 'Kornblumen', role: 'Insektenweide' },
    ],
    is_system: true,
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/system-gilden.ts
git commit -m "feat: add predefined system gilden data"
```

---

### Task 3: GildeService erstellen (TDD)

**Files:**
- Create: `src/services/__tests__/gildeService.test.ts`
- Create: `src/services/gildeService.ts`

- [ ] **Step 1: Write tests**

```typescript
import { fetchGilden, fetchGildeById, createGilde, fetchBeetGilden } from '../gildeService';

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

describe('gildeService', () => {
  describe('fetchGilden', () => {
    it('should be defined', () => {
      expect(fetchGilden).toBeDefined();
    });
  });

  describe('fetchGildeById', () => {
    it('should be defined', () => {
      expect(fetchGildeById).toBeDefined();
    });
  });

  describe('createGilde', () => {
    it('should be defined', () => {
      expect(createGilde).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Run test (expect FAIL)**

```bash
npm test -- src/services/__tests__/gildeService.test.ts
```

- [ ] **Step 3: Implement service**

```typescript
import { supabase } from './supabase';
import { Gilde } from '../types/gilde';

export async function fetchGilden(): Promise<Gilde[]> {
  const { data, error } = await supabase
    .from('gilden')
    .select('*')
    .order('number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchGildeById(id: string): Promise<Gilde | null> {
  const { data, error } = await supabase
    .from('gilden')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createGilde(gilde: Omit<Gilde, 'id' | 'created_at'>): Promise<Gilde> {
  const { data, error } = await supabase
    .from('gilden')
    .insert(gilde)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchBeetGilden(bedId: string): Promise<Gilde[]> {
  const { data, error } = await supabase
    .from('beet_gilden')
    .select(`
      gilde_id,
      gilden (*)
    `)
    .eq('bed_id', bedId);

  if (error) throw error;
  return (data || []).map((item: any) => item.gilden);
}

export async function addGildeToBed(bedId: string, gildeId: string): Promise<void> {
  const { error } = await supabase
    .from('beet_gilden')
    .insert({ bed_id: bedId, gilde_id: gildeId });

  if (error) throw error;
}

export async function removeGildeFromBed(bedId: string, gildeId: string): Promise<void> {
  const { error } = await supabase
    .from('beet_gilden')
    .delete()
    .eq('bed_id', bedId)
    .eq('gilde_id', gildeId);

  if (error) throw error;
}
```

- [ ] **Step 4: Run tests (expect PASS)**

```bash
npm test -- src/services/__tests__/gildeService.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/services/gildeService.ts src/services/__tests__/gildeService.test.ts
git commit -m "feat: add gildeService with CRUD operations"
```

---

### Task 4: useGilden Hook erstellen

**Files:**
- Create: `src/hooks/__tests__/useGilden.test.ts`
- Create: `src/hooks/useGilden.ts`

- [ ] **Step 1: Write test**

```typescript
import { renderHook } from '@testing-library/react-native';
import { useGilden } from '../useGilden';

describe('useGilden', () => {
  it('should be defined', () => {
    const { result } = renderHook(() => useGilden());
    expect(result.current).toBeDefined();
  });

  it('should have gilden array', () => {
    const { result } = renderHook(() => useGilden());
    expect(result.current.gilden).toBeInstanceOf(Array);
  });

  it('should have fetchGilden function', () => {
    const { result } = renderHook(() => useGilden());
    expect(typeof result.current.fetchGilden).toBe('function');
  });
});
```

- [ ] **Step 2: Run test (expect FAIL)**

```bash
npm test -- src/hooks/__tests__/useGilden.test.ts
```

- [ ] **Step 3: Implement hook**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Gilde } from '../types/gilde';
import { fetchGilden, fetchBeetGilden } from '../services/gildeService';
import { SYSTEM_GILDEN } from '../data/system-gilden';

export interface UseGildenReturn {
  gilden: Gilde[];
  loading: boolean;
  error: string | null;
  fetchGilden: () => Promise<void>;
  getBeetGilden: (bedId: string) => Promise<Gilde[]>;
}

export function useGilden(): UseGildenReturn {
  const [gilden, setGilden] = useState<Gilde[]>(SYSTEM_GILDEN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGilden = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userGilden = await fetchGilden();
      setGilden([...SYSTEM_GILDEN, ...userGilden]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const getBeetGilden = useCallback(async (bedId: string): Promise<Gilde[]> => {
    return fetchBeetGilden(bedId);
  }, []);

  useEffect(() => {
    loadGilden();
  }, [loadGilden]);

  return {
    gilden,
    loading,
    error,
    fetchGilden: loadGilden,
    getBeetGilden,
  };
}
```

- [ ] **Step 4: Run tests (expect PASS)**

```bash
npm test -- src/hooks/__tests__/useGilden.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGilden.ts src/hooks/__tests__/useGilden.test.ts
git commit -m "feat: add useGilden hook"
```

---

### Task 5: GildeCard Component erstellen (TDD)

**Files:**
- Create: `src/components/gilde/__tests__/GildeCard.test.tsx`
- Create: `src/components/gilde/GildeCard.tsx`

- [ ] **Step 1: Write test**

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GildeCard from '../GildeCard';
import { Gilde } from '../../types/gilde';

describe('GildeCard', () => {
  const mockGilde: Gilde = {
    id: 'test-1',
    name: 'Milpa',
    concept: 'Traditionelle Synergie',
    number: 1,
    plants: [
      { name: 'Mais', role: 'Rankgerüst' },
      { name: 'Feuerbohnen', role: 'Stickstofffixierung' },
    ],
    is_system: true,
  };

  it('should render gilde name', () => {
    render(<GildeCard gilde={mockGilde} />);
    expect(screen.getByText(/Milpa/)).toBeTruthy();
  });

  it('should render concept', () => {
    render(<GildeCard gilde={mockGilde} />);
    expect(screen.getByText(/Synergie/)).toBeTruthy();
  });

  it('should render plant count', () => {
    render(<GildeCard gilde={mockGilde} />);
    expect(screen.getByText(/2 Pflanzen/)).toBeTruthy();
  });

  it('should show system badge for system gilden', () => {
    render(<GildeCard gilde={mockGilde} />);
    expect(screen.getByText(/System/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test (expect FAIL)**

```bash
npm test -- src/components/gilde/__tests__/GildeCard.test.tsx
```

- [ ] **Step 3: Implement component**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';
import { Gilde } from '../../types/gilde';

interface GildeCardProps {
  gilde: Gilde;
  onPress?: () => void;
}

export default function GildeCard({ gilde, onPress }: GildeCardProps) {
  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        {gilde.number && (
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{gilde.number}</Text>
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{gilde.name}</Text>
          <Text style={styles.concept}>{gilde.concept}</Text>
        </View>
      </View>
      
      <View style={styles.plantCount}>
        <Text style={styles.plantCountText}>
          {gilde.plants.length} Pflanzen
        </Text>
        {gilde.is_system && (
          <View style={styles.systemBadge}>
            <Text style={styles.systemText}>System</Text>
          </View>
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing2026.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors2026.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing2026.sm,
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    ...Typography2026.h4,
    color: Colors2026.text,
  },
  concept: {
    ...Typography2026.small,
    color: Colors2026.textSecondary,
    marginTop: 2,
  },
  plantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing2026.sm,
    gap: Spacing2026.sm,
  },
  plantCountText: {
    ...Typography2026.small,
    color: Colors2026.textMuted,
  },
  systemBadge: {
    backgroundColor: Colors2026.surface,
    paddingHorizontal: Spacing2026.xs,
    paddingVertical: 2,
    borderRadius: Radius2026.sm,
  },
  systemText: {
    ...Typography2026.small,
    color: Colors2026.textSecondary,
  },
});
```

- [ ] **Step 4: Run tests (expect PASS)**

```bash
npm test -- src/components/gilde/__tests__/GildeCard.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/gilde/GildeCard.tsx src/components/gilde/__tests__/GildeCard.test.tsx
git commit -m "feat: add GildeCard component"
```

---

### Task 6: GildeSelector Component erstellen (TDD)

**Files:**
- Create: `src/components/gilde/__tests__/GildeSelector.test.tsx`
- Create: `src/components/gilde/GildeSelector.tsx`

- [ ] **Step 1: Write test**

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GildeSelector from '../GildeSelector';
import { Gilde } from '../../types/gilde';

describe('GildeSelector', () => {
  const mockGilden: Gilde[] = [
    { id: '1', name: 'Milpa', concept: 'Synergie', plants: [], is_system: true },
    { id: '2', name: 'Kartoffel', concept: 'No-Dig', plants: [], is_system: true },
  ];

  it('should render search input', () => {
    render(<GildeSelector gilden={mockGilden} onSelect={jest.fn()} />);
    expect(screen.getByPlaceholderText(/Gilde suchen/)).toBeTruthy();
  });

  it('should render gilde list', () => {
    render(<GildeSelector gilden={mockGilden} onSelect={jest.fn()} />);
    expect(screen.getByText(/Milpa/)).toBeTruthy();
    expect(screen.getByText(/Kartoffel/)).toBeTruthy();
  });

  it('should call onSelect when gilde is tapped', () => {
    const onSelect = jest.fn();
    render(<GildeSelector gilden={mockGilden} onSelect={onSelect} />);
    
    fireEvent.press(screen.getByText(/Milpa/));
    expect(onSelect).toHaveBeenCalledWith(mockGilden[0]);
  });
});
```

- [ ] **Step 2: Run test (expect FAIL)**

```bash
npm test -- src/components/gilde/__tests__/GildeSelector.test.tsx
```

- [ ] **Step 3: Implement component**

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { Gilde } from '../../types/gilde';
import GildeCard from './GildeCard';

interface GildeSelectorProps {
  gilden: Gilde[];
  onSelect: (gilde: Gilde) => void;
  onClose?: () => void;
}

export default function GildeSelector({ gilden, onSelect, onClose }: GildeSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredGilden = gilden.filter(gilde =>
    gilde.name.toLowerCase().includes(search.toLowerCase()) ||
    gilde.concept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gilde auswählen</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Schließen</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Gilde suchen..."
        placeholderTextColor={Colors2026.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredGilden}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)} style={styles.gildeItem}>
            <GildeCard gilde={item} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing2026.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  title: {
    ...Typography2026.h3,
    color: Colors2026.text,
  },
  closeText: {
    ...Typography2026.body,
    color: Colors2026.primary,
  },
  searchInput: {
    margin: Spacing2026.md,
    padding: Spacing2026.sm,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    color: Colors2026.text,
  },
  gildeItem: {
    marginHorizontal: Spacing2026.md,
  },
  separator: {
    height: Spacing2026.sm,
  },
});
```

- [ ] **Step 4: Run tests (expect PASS)**

```bash
npm test -- src/components/gilde/__tests__/GildeSelector.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/gilde/GildeSelector.tsx src/components/gilde/__tests__/GildeSelector.test.tsx
git commit -m "feat: add GildeSelector component"
```

---

### Task 7: Gilden in BedDetailScreen integrieren

**Files:**
- Modify: `src/screens/BedDetailScreen.tsx`

- [ ] **Step 1: Import new components and hooks**

```typescript
import { useGilden } from '../hooks/useGilden';
import { addGildeToBed, removeGildeFromBed } from '../services/gildeService';
import GildeSelector from '../components/gilde/GildeSelector';
import GildeCard from '../components/gilde/GildeCard';
```

- [ ] **Step 2: Add state for gilden**

```typescript
const { gilden } = useGilden();
const [showGildeSelector, setShowGildeSelector] = useState(false);
const [beetGilden, setBeetGilden] = useState<Gilde[]>([]);
```

- [ ] **Step 3: Add button to show gilde selector**

```typescript
<TouchableOpacity onPress={() => setShowGildeSelector(true)}>
  <MaterialIcons name="add" size={20} color={Colors2026.primary} />
  <Text style={styles.addButtonText}>Gilde</Text>
</TouchableOpacity>
```

- [ ] **Step 4: Add gilde list in UI (after plants section)**

```typescript
{beetGilden.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Gilden</Text>
    {beetGilden.map(gilde => (
      <GildeCard key={gilde.id} gilde={gilde} />
    ))}
  </View>
)}
```

- [ ] **Step 5: Add gilde selector modal**

```typescript
{showGildeSelector && (
  <GildeSelector
    gilden={gilden}
    onSelect={async (gilde) => {
      await addGildeToBed(bedId, gilde.id);
      setBeetGilden([...beetGilden, gilde]);
      setShowGildeSelector(false);
    }}
    onClose={() => setShowGildeSelector(false)}
  />
)}
```

- [ ] **Step 6: Commit**

```bash
git add src/screens/BedDetailScreen.tsx
git commit -m "feat: integrate gilden in BedDetailScreen"
```

---

### Task 8: SQL Schema erstellen

**Files:**
- Create: `supabase/migrations/YYYYMMDD_create_gilden.sql`

- [ ] **Step 1: Create migration**

```sql
-- Gilden (Pflanzinseln)
CREATE TABLE IF NOT EXISTS gilden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INT,
  name TEXT NOT NULL,
  concept TEXT,
  plants JSONB NOT NULL DEFAULT '[]',
  standort TEXT,
  tips TEXT[],
  is_system BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beet-Gilde Zuordnung (Many-to-Many)
CREATE TABLE IF NOT EXISTS beet_gilden (
  bed_id UUID REFERENCES beds(id) ON DELETE CASCADE,
  gilde_id UUID REFERENCES gilden(id) ON DELETE CASCADE,
  PRIMARY KEY (bed_id, gilde_id)
);

-- RLS Policies
ALTER TABLE gilden ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all gilden" ON gilden
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own gilden" ON gilden
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gilden" ON gilden
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gilden" ON gilden
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE beet_gilden ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage beet_gilden" ON beet_gilden
  FOR ALL USING (
    bed_id IN (SELECT id FROM beds WHERE user_id = auth.uid())
  );
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/YYYYMMDD_create_gilden.sql
git commit -m "feat: add gilden database schema"
```

---

## Verification

```bash
# Run all tests
npm test

# Expected: 600+ tests passing
```

## Open Questions

- [ ] Gilden-Vorschläge (basierend auf Pflanzen im Beet)
- [ ] Gilden-Bewertung (Wie gut passt die Kombination?)
- [ ] Eigene Gilden erstellen/bearbeiten
