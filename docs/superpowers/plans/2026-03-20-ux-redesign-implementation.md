# UI/UX Redesign - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Konsolidierung der Navigation von 7 auf 4 Tabs mit priorisierten Aufgaben, saisonalen Phasen und Learnings-System.

**Architecture:** 
- Tab-Navigation: 4 Tabs (Home, Plants, Photos, More)
- Home = Dashboard + Priorisierte Tasks + Learnings
- Plants mit Segmented Control (Pflanzen/Aufgaben/Einkauf)
- Zeitraum-System mit Jahreszeiten + Phasen (Früh/Mitte/Spät)

**Tech Stack:** React Native, Expo, React Navigation, Supabase, TypeScript

---

## File Structure

```
Modified Files:
├── src/navigation/
│   └── TabNavigator.tsx              # Navigation Restrukturierung
├── src/screens/
│   └── HomeScreen.tsx               # Erweitert mit Tasks + Learnings
├── src/components/
│   ├── SegmentedControl.tsx         # NEU
│   ├── TaskCard.tsx                 # NEU
│   ├── LearningCard.tsx             # NEU
│   ├── ZeitraumPicker.tsx           # NEU
│   └── PrioritaetBadge.tsx          # NEU
├── src/services/
│   ├── zeitraumService.ts           # NEU
│   ├── learningService.ts            # NEU
│   └── taskService.ts               # MODIFIED (extend)
├── src/types/
│   ├── task.ts                      # MODIFIED (add zeitraum/prioritaet)
│   └── learning.ts                   # NEU
├── src/utils/
│   └── zeitraumUtils.ts             # NEU

New Files:
├── src/components/SegmentedControl.tsx
├── src/components/TaskCard.tsx
├── src/components/LearningCard.tsx
├── src/components/ZeitraumPicker.tsx
├── src/components/PrioritaetBadge.tsx
├── src/services/zeitraumService.ts
├── src/services/learningService.ts
├── src/types/learning.ts
└── src/utils/zeitraumUtils.ts
```

---

## Task Breakdown

### Phase 1: Navigation Restrukturierung (Tasks 1-3)

---

### Task 1: TabNavigator - Photos verschieben

**Files:**
- Modify: `src/navigation/TabNavigator.tsx:1-127`
- Modify: `src/types/navigation.ts`

- [ ] **Step 1: Backup current TabNavigator**

Copy current file to backup comment

- [ ] **Step 2: Remove Photos from Tab Navigator**

```typescript
// Remove this Tab.Screen:
<Tab.Screen
  name="Photos"
  component={PhotoGalleryScreen}
  options={{
    title: 'Fotos',
    tabBarLabel: 'Fotos',
    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name="photo-library" size={size} color={color} />
    ),
  }}
/>
```

- [ ] **Step 3: Add Photos to GardenStackNavigator**

Modify `GardenStackNavigator.tsx` to include PhotoGalleryScreen

- [ ] **Step 4: Update Navigation Types**

```typescript
// In navigation.ts - Add Photos as screen in GardenStack
type GardenStackParamList = {
  GardenOverview: undefined;
  PhotoGallery: { plantId?: string } | undefined;  // ADD THIS
  // ... rest
};
```

- [ ] **Step 5: Test Navigation**

```bash
# Start app and verify:
# - 4 tabs: Home, Plants, Garden, More
# - Photos accessible via Garden > Photos
```

- [ ] **Step 6: Commit**

```bash
git add src/navigation/TabNavigator.tsx src/types/navigation.ts
git commit -m "feat(nav): move Photos to Garden stack, reduce to 4 tabs"
```

---

### Task 2: Navigation Types - Update für Segmented Control

**Files:**
- Modify: `src/types/navigation.ts`

- [ ] **Step 1: Update TabParamList**

```typescript
// Current (7 tabs):
export type TabParamList = {
  Home: undefined;
  Plants: undefined;
  Tasks: undefined;
  Photos: undefined;
  Shopping: undefined;
  GardenOverview: undefined;
  More: undefined;
};

// Target (4 tabs):
export type TabParamList = {
  Home: undefined;
  Plants: undefined;
  GardenOverview: undefined;
  More: undefined;
};
```

- [ ] **Step 2: Update PlantsStackParamList für Segmented**

```typescript
export type PlantsStackParamList = {
  PlantList: undefined;
  PlantDetail: { plantId: string };
  // ... add tabs for segmented control
};
```

- [ ] **Step 3: Test Build**

```bash
npx tsc --noEmit
# Fix any navigation type errors
```

- [ ] **Step 4: Commit**

```bash
git add src/types/navigation.ts
git commit -m "refactor(types): update navigation types for 4-tab structure"
```

---

### Phase 2: Zeitraum-System (Tasks 3-5)

---

### Task 3: Zeitraum Types und Utils erstellen

**Files:**
- Create: `src/types/zeitraum.ts`
- Create: `src/utils/zeitraumUtils.ts`
- Create: `src/__tests__/zeitraumUtils.test.ts`

- [ ] **Step 1: Create Zeitraum Types**

```typescript
// src/types/zeitraum.ts
export enum ZeitraumPhase {
  FRUEH = 'frueh',
  MITTE = 'mitte',
  SPAET = 'spaet',
}

export enum Jahreszeit {
  FRUEHJAHR = 'fruehjahr',
  SOMMER = 'sommer',
  HERBST = 'herbst',
  WINTER = 'winter',
}

export enum Zeitraum {
  // Frühjahr
  FRUEHJAHR_FRUH = 'fruehjahr_frueh',
  FRUEHJAHR_MITTE = 'fruehjahr_mitte',
  FRUEHJAHR_SPAET = 'fruehjahr_spaet',
  // Sommer
  SOMMER_FRUH = 'sommer_frueh',
  SOMMER_MITTE = 'sommer_mitte',
  SOMMER_SPAET = 'sommer_spaet',
  // Herbst
  HERBST_FRUH = 'herbst_frueh',
  HERBST_MITTE = 'herbst_mitte',
  HERBST_SPAET = 'herbst_spaet',
  // Winter
  WINTER_FRUH = 'winter_frueh',
  WINTER_MITTE = 'winter_mitte',
  WINTER_SPAET = 'winter_spaet',
  // Kurzfristig
  DIESE_WOCHE = 'diese_woche',
  // Flexibel
  FLEXIBEL = 'flexibel',
}
```

- [ ] **Step 2: Create Zeitraum Utils**

```typescript
// src/utils/zeitraumUtils.ts
import { Zeitraum, Jahreszeit, ZeitraumPhase } from '../types/zeitraum';

export function getJahreszeit(zeitraum: Zeitraum): Jahreszeit {
  if (zeitraum.startsWith('fruehjahr')) return Jahreszeit.FRUEHJAHR;
  if (zeitraum.startsWith('sommer')) return Jahreszeit.SOMMER;
  if (zeitraum.startsWith('herbst')) return Jahreszeit.HERBST;
  if (zeitraum.startsWith('winter')) return Jahreszeit.WINTER;
  return Jahreszeit.FRUEHJAHR; // fallback
}

export function getPhase(zeitraum: Zeitraum): ZeitraumPhase | null {
  if (zeitraum.endsWith('frueh')) return ZeitraumPhase.FRUEH;
  if (zeitraum.endsWith('mitte')) return ZeitraumPhase.MITTE;
  if (zeitraum.endsWith('spaet')) return ZeitraumPhase.SPAET;
  return null;
}

export function getAktuelleSaison(): Zeitraum {
  const month = new Date().getMonth();
  // Calculate phase based on month
  // ... implementation
}

export function getZeitraumLabel(zeitraum: Zeitraum): string {
  // "Frühjahr · Mittlere Phase"
}

export function getZeitraumIcon(zeitraum: Zeitraum): string {
  // Return emoji based on jahreszeit
}
```

- [ ] **Step 3: Write Tests**

```typescript
// src/__tests__/zeitraumUtils.test.ts
describe('Zeitraum Utils', () => {
  test('getJahreszeit returns correct value', () => {
    expect(getJahreszeit(Zeitraum.SOMMER_FRUH)).toBe(Jahreszeit.SOMMER);
  });

  test('getPhase returns correct value', () => {
    expect(getPhase(Zeitraum.FRUEHJAHR_SPAET)).toBe(ZeitraumPhase.SPAET);
  });

  test('getAktuelleSaison returns valid zeitraum', () => {
    const aktuell = getAktuelleSaison();
    expect(Object.values(Zeitraum)).toContain(aktuell);
  });
});
```

- [ ] **Step 4: Run Tests**

```bash
npm test -- zeitraumUtils.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/types/zeitraum.ts src/utils/zeitraumUtils.ts src/__tests__/zeitraumUtils.test.ts
git commit -m "feat(zeitraum): add zeitraum types and utilities"
```

---

### Task 4: ZeitraumService erstellen

**Files:**
- Create: `src/services/zeitraumService.ts`
- Create: `src/__tests__/zeitraumService.test.ts`

- [ ] **Step 1: Create ZeitraumService**

```typescript
// src/services/zeitraumService.ts
import { Zeitraum, Jahreszeit, ZeitraumPhase } from '../types/zeitraum';
import { getJahreszeit, getPhase, getAktuelleSaison } from '../utils/zeitraumUtils';

const PFLANZEN_ZEITRAUM: Record<string, Zeitraum> = {
  'Tomate': Zeitraum.SOMMER_MITTE,
  'Tomaten': Zeitraum.SOMMER_MITTE,
  'Radieschen': Zeitraum.FRUEHJAHR_FRUH,
  'Gurke': Zeitraum.SOMMER_FRUH,
  'Kürbis': Zeitraum.HERBST_FRUH,
  // ... more mappings
};

const KATEGORIE_ZEITRAUM: Record<string, ZeitraumPhase> = {
  'Aussaat': ZeitraumPhase.FRUEH,
  'Ernten': ZeitraumPhase.SPAET,
  'Bodenpflege': ZeitraumPhase.MITTE,
};

export const zeitraumService = {
  getCurrentZeitraum(): Zeitraum {
    return getAktuelleSaison();
  },

  getCurrentJahreszeit(): Jahreszeit {
    return getJahreszeit(getAktuelleSaison());
  },

  getCurrentPhase(): ZeitraumPhase {
    return getPhase(getAktuelleSaison()) || ZeitraumPhase.MITTE;
  },

  suggestZeitraum(plantName: string, kategorie?: string): Zeitraum {
    // Try plant mapping first
    const plantZeitraum = PFLANZEN_ZEITRAUM[plantName];
    if (plantZeitraum) return plantZeitraum;

    // Fallback to current season
    return getAktuelleSaison();
  },

  isRelevantForCurrentPhase(zeitraum: Zeitraum): boolean {
    if (zeitraum === Zeitraum.FLEXIBEL || zeitraum === Zeitraum.DIESE_WOCHE) {
      return true;
    }
    return zeitraum === getAktuelleSaison();
  },
};
```

- [ ] **Step 2: Write Tests**

```typescript
// src/__tests__/zeitraumService.test.ts
describe('ZeitraumService', () => {
  test('suggestZeitraum returns plant-specific zeitraum', () => {
    const result = zeitraumService.suggestZeitraum('Tomate');
    expect(result).toBe(Zeitraum.SOMMER_MITTE);
  });

  test('suggestZeitraum falls back to current for unknown plant', () => {
    const result = zeitraumService.suggestZeitraum('UnknownPlant');
    expect(result).toBe(zeitraumService.getCurrentZeitraum());
  });
});
```

- [ ] **Step 3: Run Tests**

```bash
npm test -- zeitraumService.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/services/zeitraumService.ts src/__tests__/zeitraumService.test.ts
git commit -m "feat(zeitraum): add zeitraumService with auto-suggestion"
```

---

### Task 5: Task Types erweitern

**Files:**
- Modify: `src/types/task.ts`

- [ ] **Step 1: Update Task Interface**

```typescript
// Add to existing Task interface:
interface Task {
  // ... existing fields
  
  // NEW:
  zeitraum: Zeitraum;
  prioritaet: 'hoch' | 'mittel' | 'niedrig';
}

interface TaskListItem extends Task {
  plant_names: string[];
  linked_plants: Plant[];
}
```

- [ ] **Step 2: Update TaskFormData**

```typescript
interface TaskFormData {
  title: string;
  description?: string;
  category: string;
  priority: string;
  location?: string;
  time_spent_minutes?: number;
  plant_ids?: string[];
  // NEW:
  zeitraum: Zeitraum;
  prioritaet: 'hoch' | 'mittel' | 'niedrig';
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/task.ts
git commit -m "feat(tasks): add zeitraum and prioritaet to task types"
```

---

### Phase 3: HomeScreen Erweiterung (Tasks 6-8)

---

### Task 6: PrioritaetBadge Component

**Files:**
- Create: `src/components/PrioritaetBadge.tsx`
- Create: `src/__tests__/PrioritaetBadge.test.tsx`

- [ ] **Step 1: Create PrioritaetBadge**

```typescript
// src/components/PrioritaetBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../theme/colors';

interface PrioritaetBadgeProps {
  prioritaet: 'hoch' | 'mittel' | 'niedrig';
  size?: 'small' | 'medium';
}

export default function PrioritaetBadge({ prioritaet, size = 'small' }: PrioritaetBadgeProps) {
  const colors = {
    hoch: '#F44336',
    mittel: '#FFC107',
    niedrig: '#9E9E9E',
  };

  const labels = {
    hoch: 'HOCH',
    mittel: 'MITTEL',
    niedrig: 'NIEDRIG',
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[prioritaet] }]}>
      <Text style={[styles.text, size === 'medium' && styles.medium]}>
        {labels[prioritaet]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  medium: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
```

- [ ] **Step 2: Write Test**

```typescript
// src/__tests__/PrioritaetBadge.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import PrioritaetBadge from '../components/PrioritaetBadge';

describe('PrioritaetBadge', () => {
  test('renders hoch badge correctly', () => {
    const { getByText } = render(<PrioritaetBadge prioritaet="hoch" />);
    expect(getByText('HOCH')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run Tests**

```bash
npm test -- PrioritaetBadge.test.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/components/PrioritaetBadge.tsx src/__tests__/PrioritaetBadge.test.tsx
git commit -m "feat(ui): add PrioritaetBadge component"
```

---

### Task 7: TaskCard Component

**Files:**
- Create: `src/components/TaskCard.tsx`
- Create: `src/__tests__/TaskCard.test.tsx`

- [ ] **Step 1: Create TaskCard**

```typescript
// src/components/TaskCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../types/task';
import { getZeitraumLabel, getZeitraumIcon } from '../utils/zeitraumUtils';
import Colors from '../theme/colors';
import PrioritaetBadge from './PrioritaetBadge';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
}

export default function TaskCard({ task, onToggle, onPress }: TaskCardProps) {
  const isCompleted = !!task.completed_at;
  const zeitraumIcon = getZeitraumIcon(task.zeitraum);
  const zeitraumLabel = getZeitraumLabel(task.zeitraum);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
        <MaterialIcons
          name={isCompleted ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color={isCompleted ? Colors.success : Colors.textLight}
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, isCompleted && styles.completed]}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          {task.location && <Text style={styles.location}>{task.location}</Text>}
          <Text style={styles.zeitraum}>
            {zeitraumIcon} {zeitraumLabel}
          </Text>
        </View>
      </View>
      <PrioritaetBadge prioritaet={task.prioritaet} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: Colors.textLight,
  },
  zeitraum: {
    fontSize: 12,
    color: Colors.primary,
  },
});
```

- [ ] **Step 2: Write Test**

```typescript
// src/__tests__/TaskCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskCard from '../components/TaskCard';

const mockTask = {
  id: '1',
  title: 'Test Task',
  zeitraum: 'sommer_mitte' as Zeitraum,
  prioritaet: 'hoch' as const,
  completed_at: null,
};

describe('TaskCard', () => {
  test('renders task title', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onToggle={() => {}} onPress={() => {}} />
    );
    expect(getByText('Test Task')).toBeTruthy();
  });

  test('calls onToggle when checkbox pressed', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <TaskCard task={mockTask} onToggle={onToggle} onPress={() => {}} />
    );
    fireEvent.press(getByText('Test Task'));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run Tests**

```bash
npm test -- TaskCard.test.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/components/TaskCard.tsx src/__tests__/TaskCard.test.tsx
git commit -m "feat(ui): add TaskCard component"
```

---

### Task 8: HomeScreen erweitern

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Create: `src/__tests__/HomeScreen.test.tsx`

- [ ] **Step 1: Read current HomeScreen**

```bash
cat src/screens/HomeScreen.tsx
```

- [ ] **Step 2: Add Task Imports**

```typescript
import TaskCard from '../components/TaskCard';
import PrioritaetBadge from '../components/PrioritaetBadge';
import { Task } from '../types/task';
import { toggleTaskCompletion } from '../services/taskService';
```

- [ ] **Step 3: Add Task State**

```typescript
const [tasks, setTasks] = useState<Task[]>([]);
```

- [ ] **Step 4: Add Task Loading in useFocusEffect**

```typescript
useFocusEffect(
  useCallback(() => {
    loadDashboard();
    loadTasks(); // ADD THIS
  }, [])
);
```

- [ ] **Step 5: Add Task Section after Harvest Summary**

```tsx
{/* Tasks Section */}
{tasks.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Priorisierte Aufgaben</Text>

    {/* Hoch */}
    {tasks.filter(t => t.prioritaet === 'hoch').length > 0 && (
      <View style={styles.prioritaetGroup}>
        <Text style={styles.prioritaetLabel}>🔴 Hohe Priorität</Text>
        {tasks
          .filter(t => t.prioritaet === 'hoch')
          .map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => handleToggleTask(task.id)}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            />
          ))}
      </View>
    )}

    {/* Mittel */}
    {/* ... same pattern */}

    {/* Niedrig */}
    {/* ... same pattern */}
  </View>
)}
```

- [ ] **Step 6: Add Task Loading Function**

```typescript
const loadTasks = async () => {
  try {
    const data = await fetchTasks();
    setTasks(data);
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
};

const handleToggleTask = async (taskId: string) => {
  try {
    await toggleTaskCompletion(taskId);
    await loadTasks();
  } catch (error) {
    console.error('Error toggling task:', error);
  }
};
```

- [ ] **Step 7: Test Build**

```bash
npx react-native run-android  # or ios
# Verify tasks appear on home screen
```

- [ ] **Step 8: Commit**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat(home): add prioritized tasks to dashboard"
```

---

### Phase 4: Learnings System (Tasks 9-12)

---

### Task 9: Learning Types und Component

**Files:**
- Create: `src/types/learning.ts`
- Create: `src/components/LearningCard.tsx`
- Create: `src/__tests__/LearningCard.test.tsx`

- [ ] **Step 1: Create Learning Type**

```typescript
// src/types/learning.ts
export interface Learning {
  id: string;
  user_id: string;
  source_type: 'knowledge_base' | 'manual';
  source_id?: string;
  source_name?: string;
  title: string;
  content?: string;
  related_plants: string[];
  related_categories: string[];
  valid_for_zeitraeume: string[];
  relevance_score: number;
  created_at: string;
  user_rating?: 'helpful' | 'not_helpful';
  dismissed: boolean;
}
```

- [ ] **Step 2: Create LearningCard**

```typescript
// src/components/LearningCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Learning } from '../types/learning';
import Colors from '../theme/colors';

interface LearningCardProps {
  learning: Learning;
  onRate: (helpful: boolean) => void;
  onDismiss: () => void;
}

export default function LearningCard({ learning, onRate, onDismiss }: LearningCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="lightbulb" size={20} color={Colors.warning} />
        <Text style={styles.title}>{learning.title}</Text>
      </View>
      {learning.content && (
        <Text style={styles.content}>{learning.content}</Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.action, learning.user_rating === 'helpful' && styles.active]}
          onPress={() => onRate(true)}
        >
          <MaterialIcons name="thumb-up" size={16} color={Colors.success} />
          <Text style={styles.actionText}>Nützlich</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.action, learning.user_rating === 'not_helpful' && styles.active]}
          onPress={() => onRate(false)}
        >
          <MaterialIcons name="thumb-down" size={16} color={Colors.error} />
          <Text style={styles.actionText}>Nicht</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  content: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  active: {
    backgroundColor: Colors.background,
    borderRadius: 4,
  },
  actionText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
```

- [ ] **Step 3: Write Tests**

- [ ] **Step 4: Commit**

```bash
git add src/types/learning.ts src/components/LearningCard.tsx
git commit -m "feat(learnings): add learning types and card component"
```

---

### Task 10: LearningService erstellen

**Files:**
- Create: `src/services/learningService.ts`
- Create: `src/__tests__/learningService.test.ts`

- [ ] **Step 1: Create LearningService**

```typescript
// src/services/learningService.ts
import { supabase } from './supabase';
import { Learning } from '../types/learning';
import { zeitraumService } from './zeitraumService';

export const learningService = {
  async getLearningsForSeason(
    plantNames: string[],
    zeitraum: string
  ): Promise<Learning[]> {
    const { data, error } = await supabase
      .from('learnings')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .contains('valid_for_zeitraeume', [zeitraum])
      .eq('dismissed', false)
      .order('relevance_score', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  async createLearning(data: Partial<Learning>): Promise<Learning> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: result, error } = await supabase
      .from('learnings')
      .insert({
        ...data,
        user_id: user.id,
        source_type: 'manual',
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async rateLearning(id: string, rating: 'helpful' | 'not_helpful'): Promise<void> {
    const { error } = await supabase
      .from('learnings')
      .update({ user_rating: rating })
      .eq('id', id);

    if (error) throw error;
  },

  async dismissLearning(id: string): Promise<void> {
    const { error } = await supabase
      .from('learnings')
      .update({ dismissed: true })
      .eq('id', id);

    if (error) throw error;
  },
};
```

- [ ] **Step 2: Write Tests**

- [ ] **Step 3: Commit**

---

### Task 11: Learnings Sektion in HomeScreen

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

- [ ] **Step 1: Add Learnings State**

```typescript
const [learnings, setLearnings] = useState<Learning[]>([]);
```

- [ ] **Step 2: Add Learnings Loading**

```typescript
const loadLearnings = async () => {
  try {
    const currentZeitraum = zeitraumService.getCurrentZeitraum();
    const plants = /* get plant names */;
    const data = await learningService.getLearningsForSeason(plants, currentZeitraum);
    setLearnings(data);
  } catch (error) {
    console.error('Error loading learnings:', error);
  }
};
```

- [ ] **Step 3: Add Learnings Section**

```tsx
<View style={styles.section}>
  <Text style={styles.sectionTitle}>
    💡 Tipps für {zeitraumService.getCurrentJahreszeit()}
  </Text>
  {learnings.map(learning => (
    <LearningCard
      key={learning.id}
      learning={learning}
      onRate={(helpful) => handleRateLearning(learning.id, helpful)}
      onDismiss={() => handleDismissLearning(learning.id)}
    />
  ))}
  <TouchableOpacity style={styles.addLearningButton}>
    <MaterialIcons name="add" size={16} color={Colors.primary} />
    <Text style={styles.addLearningText}>Eigenes Learning hinzufügen</Text>
  </TouchableOpacity>
</View>
```

- [ ] **Step 4: Commit**

---

### Task 12: Database Migration Script

**Files:**
- Create: `scripts/migrate-add-zeitraum-learnings.sql`

- [ ] **Step 1: Create Migration SQL**

```sql
-- Add zeitraum and prioritaet to tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS zeitraum TEXT DEFAULT 'flexibel',
ADD COLUMN IF NOT EXISTS prioritaet TEXT DEFAULT 'mittel';

CREATE INDEX IF NOT EXISTS idx_tasks_zeitraum ON tasks(zeitraum);
CREATE INDEX IF NOT EXISTS idx_tasks_prioritaet ON tasks(prioritaet);

-- Create learnings table
CREATE TABLE IF NOT EXISTS learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  source_type TEXT NOT NULL CHECK (source_type IN ('knowledge_base', 'manual')),
  source_id UUID,
  source_name TEXT,
  title TEXT NOT NULL,
  content TEXT,
  related_plants TEXT[],
  related_categories TEXT[],
  valid_for_zeitraeume TEXT[] NOT NULL,
  relevance_score DECIMAL(3,2) DEFAULT 0.5,
  user_rating TEXT CHECK (user_rating IN ('helpful', 'not_helpful')),
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learnings_user ON learnings(user_id);
CREATE INDEX IF NOT EXISTS idx_learnings_zeitraeume ON learnings USING GIN(valid_for_zeitraeume);
```

- [ ] **Step 2: Run Migration**

```bash
# Apply migration
psql $DATABASE_URL -f scripts/migrate-add-zeitraum-learnings.sql
```

- [ ] **Step 3: Commit**

---

### Phase 5: Segmented Control (Tasks 13-14)

---

### Task 13: SegmentedControl Component

**Files:**
- Create: `src/components/SegmentedControl.tsx`

- [ ] **Step 1: Create SegmentedControl**

```typescript
// src/components/SegmentedControl.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../theme/colors';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function SegmentedControl({ segments, selectedIndex, onSelect }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.segment, index === selectedIndex && styles.selected]}
          onPress={() => onSelect(index)}
        >
          <Text style={[styles.text, index === selectedIndex && styles.selectedText]}>
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: Colors.surface,
  },
  text: {
    fontSize: 12,
    color: Colors.textLight,
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
```

- [ ] **Step 2: Commit**

---

### Task 14: PlantListScreen mit Segmented

**Files:**
- Modify: `src/screens/PlantListScreen.tsx`

- [ ] **Step 1: Add Segmented State**

```typescript
const [selectedTab, setSelectedTab] = useState(0);
const tabs = ['🌱 Pflanzen', '📋 Aufgaben', '🛒 Einkauf'];
```

- [ ] **Step 2: Add SegmentedControl**

```tsx
<SegmentedControl
  segments={tabs}
  selectedIndex={selectedTab}
  onSelect={setSelectedTab}
/>
```

- [ ] **Step 3: Conditional Content Based on Tab**

```tsx
{switch (selectedTab) {
  case 0: return <PlantList />;
  case 1: return <TaskListForPlants />;
  case 2: return <ShoppingQuickAccess />;
}}
```

- [ ] **Step 4: Commit**

---

## Summary

| Phase | Tasks | Aufwand |
|-------|-------|---------|
| 1: Navigation | 1-2 | 1h |
| 2: Zeitraum | 3-5 | 2h |
| 3: HomeScreen | 6-8 | 3h |
| 4: Learnings | 9-12 | 4h |
| 5: Segmented | 13-14 | 1h |
| **Total** | **14 Tasks** | **~11h** |

---

*Plan erstellt: 2026-03-20*
