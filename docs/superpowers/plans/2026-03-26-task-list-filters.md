# Aufgaben-Liste mit intelligenten Filtern Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Moderner Aufgaben-Tab mit intelligenten Filtern (Jahreszeiten, Wochen-basiert), Modal-Navigation zu TaskDetail, und Pflanzen-Erde-Design.

**Architecture:** 
- Neuer TaskStackNavigator als Tab zwischen Home und Plants
- TaskDetail als Modal (native-stack presentation: 'modal')
- Kaskadierende Filter in TaskListContent mit Quick-Chips
- Service-Layer Erweiterung für Jahreszeit/wochen-basierte Filter
- **TDD:** Tests zuerst schreiben, dann implementieren

**Tech Stack:** React Navigation (native-stack), React Native, TypeScript, Supabase, Jest/Vitest

---

## File Structure

**Neu:**
- `src/navigation/TasksStackNavigator.tsx` (kopiert von TaskStackNavigator mit Modal)
- `src/components/ui/QuickFilterChips.tsx` (neue Komponente)
- `src/components/ui/SeasonFilterDropdown.tsx` (neue Komponente)
- `src/components/ui/ExtendedFilterModal.tsx` (neue Komponente)

**Modify:**
- `src/navigation/TabNavigator.tsx` - TaskStack hinzufügen
- `src/components/TaskListContent.tsx` - Neue Filter integrieren
- `src/types/navigation.ts` - TaskStackParamList erweitern
- `src/services/taskService.ts` - Zeitraum-Filter-Funktionen

---

## Task 1: Navigation vorbereiten

**Files:**
- Modify: `src/navigation/TabNavigator.tsx`
- Modify: `src/types/navigation.ts`

- [ ] **Step 1: TaskStackParamList in navigation.ts erweitern**

```typescript
// src/types/navigation.ts - hinzufügen:
export type TasksStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
  TaskDetail: { taskId: string };
};

export type TabParamList = {
  // ... existing
  Tasks: undefined;
};
```

- [ ] **Step 2: TaskStackNavigator als Tab in TabNavigator.tsx**

```typescript
// Import
import TasksStackNavigator from './TasksStackNavigator';

// Add to Tab.Navigator:
<Tab.Screen
  name="Tasks"
  component={TasksStackNavigator}
  options={{
    title: 'Aufgaben',
    tabBarLabel: 'Aufgaben',
    headerShown: false,
  }}
/>
```

- [ ] **Step 3: TaskStackNavigator.tsx kopieren und als Modal konfigurieren**

- [ ] **Step 4: Commit**
```bash
git add src/navigation/TabNavigator.tsx src/types/navigation.ts src/navigation/TasksStackNavigator.tsx
git commit -m "feat(tasks): add Tasks tab with modal navigation"
```

---

## Task 2: Service-Layer erweitern

**Files:**
- Modify: `src/services/taskService.ts`

- [ ] **Step 1: Zeitraum-Filter-Funktionen hinzufügen**

```typescript
// src/services/taskService.ts - hinzufügen:

/**
 * Get current season based on month
 */
export function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'Frühling';
  if (month >= 6 && month <= 8) return 'Sommer';
  if (month >= 9 && month <= 11) return 'Herbst';
  return 'Winter';
}

/**
 * Get season from scheduled_date
 */
export function getSeasonFromDate(dateStr: string | null): string {
  if (!dateStr) return 'Unbekannt';
  const month = new Date(dateStr).getMonth() + 1;
  if (month >= 3 && month <= 5) return 'Frühling';
  if (month >= 6 && month <= 8) return 'Sommer';
  if (month >= 9 && month <= 11) return 'Herbst';
  return 'Winter';
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(scheduledDate: string | null): boolean {
  if (!scheduledDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(scheduledDate);
  return scheduled < today;
}

/**
 * Check if task is due this week
 */
export function isTaskDueThisWeek(scheduledDate: string | null): boolean {
  if (!scheduledDate) return false;
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const scheduled = new Date(scheduledDate);
  return scheduled >= monday && scheduled <= sunday;
}

/**
 * Check if task is due next week
 */
export function isTaskDueNextWeek(scheduledDate: string | null): boolean {
  if (!scheduledDate) return false;
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  
  const followingSunday = new Date(nextMonday);
  followingSunday.setDate(nextMonday.getDate() + 6);
  
  const scheduled = new Date(scheduledDate);
  return scheduled >= nextMonday && scheduled <= followingSunday;
}

/**
 * Filter tasks by season
 */
export function filterTasksBySeason(tasks: TaskListItem[], season: string): TaskListItem[] {
  if (season === 'Alle' || !season) return tasks;
  return tasks.filter(task => getSeasonFromDate(task.scheduled_date || task.due_date || null) === season);
}

/**
 * Sort tasks by month
 */
export function sortTasksByMonth(tasks: TaskListItem[]): TaskListItem[] {
  return [...tasks].sort((a, b) => {
    const dateA = a.scheduled_date || a.due_date || '';
    const dateB = b.scheduled_date || b.due_date || '';
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });
}

/**
 * Get sort label for "month"
 */
export function getSortLabel(sortBy: string): string {
  const labels: Record<string, string> = {
    'priority': 'Nach Priorität',
    'created_at': 'Nach Erstellungsdatum',
    'category': 'Nach Kategorie',
    'title': 'Nach Titel',
    'month': 'Nach Monat',
  };
  return labels[sortBy] || 'Sortierung';
}
```

- [ ] **Step 2: Commit**
```bash
git add src/services/taskService.ts
git commit -m "feat(tasks): add season and week filter functions"
```

---

## Task 3: UI-Komponenten erstellen

**Files:**
- Create: `src/components/ui/QuickFilterChips.tsx`
- Create: `src/components/ui/SeasonFilterDropdown.tsx`
- Create: `src/components/ui/ExtendedFilterModal.tsx`

- [ ] **Step 1: QuickFilterChips.tsx erstellen**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../../theme/designSystemV2';

export type QuickFilterType = 'overdue' | 'thisWeek' | 'nextWeek' | 'nextSteps';

interface Props {
  activeFilter: QuickFilterType | null;
  onFilterChange: (filter: QuickFilterType | null) => void;
  counts: {
    overdue: number;
    thisWeek: number;
    nextWeek: number;
    nextSteps: number;
  };
}

const FILTERS: { key: QuickFilterType; label: string; icon: string }[] = [
  { key: 'overdue', label: 'Überfällig', icon: 'warning' },
  { key: 'thisWeek', label: 'Diese Woche', icon: 'event' },
  { key: 'nextWeek', label: 'Nächste Woche', icon: 'event-note' },
  { key: 'nextSteps', label: 'Next Steps', icon: 'star' },
];

export default function QuickFilterChips({ activeFilter, onFilterChange, counts }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.chipsContainer}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          const count = counts[filter.key];
          
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onFilterChange(isActive ? null : filter.key)}
            >
              <MaterialIcons 
                name={filter.icon as any} 
                size={16} 
                color={isActive ? '#fff' : Colors2026.primary} 
              />
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {filter.label}
              </Text>
              {count > 0 && (
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors2026.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors2026.primaryLight,
    borderWidth: 1,
    borderColor: Colors2026.primary,
  },
  chipActive: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  chipTextActive: {
    color: '#fff',
  },
  badge: {
    backgroundColor: Colors2026.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 2,
  },
  badgeActive: {
    backgroundColor: '#fff',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  badgeTextActive: {
    color: Colors2026.primary,
  },
});
```

- [ ] **Step 2: SeasonFilterDropdown.tsx erstellen**

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../../theme/designSystemV2';
import { getCurrentSeason } from '../../services/taskService';

const SEASONS = ['Alle', 'Frühling', 'Sommer', 'Herbst', 'Winter'];

interface Props {
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
}

export default function SeasonFilterDropdown({ selectedSeason, onSeasonChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const defaultSeason = getCurrentSeason();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropdown}
        onPress={() => setIsOpen(true)}
      >
        <MaterialIcons name="filter-list" size={18} color={Colors2026.primary} />
        <Text style={styles.dropdownText}>
          {selectedSeason === 'Alle' ? 'Jahreszeit' : selectedSeason}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={20} color={Colors2026.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Jahreszeit</Text>
            {SEASONS.map((season) => (
              <TouchableOpacity
                key={season}
                style={[styles.menuItem, selectedSeason === season && styles.menuItemActive]}
                onPress={() => {
                  onSeasonChange(season);
                  setIsOpen(false);
                }}
              >
                <Text style={[styles.menuItemText, selectedSeason === season && styles.menuItemTextActive]}>
                  {season === 'Alle' ? season : season}
                </Text>
                {season === defaultSeason && (
                  <Text style={styles.currentBadge}>Aktuell</Text>
                )}
                {selectedSeason === season && (
                  <MaterialIcons name="check" size={20} color={Colors2026.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors2026.primaryLight,
    borderWidth: 1,
    borderColor: Colors2026.primary,
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: Colors2026.surface,
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: Colors2026.primaryLight,
  },
  menuItemText: {
    fontSize: 14,
    color: Colors2026.text,
  },
  menuItemTextActive: {
    color: Colors2026.primary,
    fontWeight: '600',
  },
  currentBadge: {
    fontSize: 10,
    color: Colors2026.status.success,
    marginRight: 8,
  },
});
```

- [ ] **Step 3: ExtendedFilterModal.tsx erstellen**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026, Spacing2026, Radius2026 } from '../../theme/designSystemV2';

interface FilterOptions {
  priorities: string[];
  categories: string[];
  plants: string[];
  timeframes: string[];
  status: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availablePlants: { id: string; name: string }[];
}

const PRIORITIES = ['hoch', 'mittel', 'niedrig'];
const CATEGORIES = ['Aussaat', 'Pflanzen', 'Gartenarbeiten', 'Beobachten', 'Ernten'];
const TIMEFRAMES = ['Diese Woche', 'Nächste Woche', 'Dieser Monat', 'Nächster Monat'];
const STATUS_OPTIONS = ['offen', 'erledigt'];

export default function ExtendedFilterModal({ visible, onClose, filters, onFiltersChange, availablePlants }: Props) {
  const toggleArray = (arr: string[], item: string) => 
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const togglePriority = (p: string) => 
    onFiltersChange({ ...filters, priorities: toggleArray(filters.priorities, p) });

  const toggleCategory = (c: string) => 
    onFiltersChange({ ...filters, categories: toggleArray(filters.categories, c) });

  const togglePlant = (p: string) => 
    onFiltersChange({ ...filters, plants: toggleArray(filters.plants, p) });

  const toggleTimeframe = (t: string) => 
    onFiltersChange({ ...filters, timeframes: toggleArray(filters.timeframes, t) });

  const toggleStatus = (s: string) => 
    onFiltersChange({ ...filters, status: toggleArray(filters.status, s) });

  const clearFilters = () => {
    onFiltersChange({
      priorities: [],
      categories: [],
      plants: [],
      timeframes: [],
      status: [],
    });
  };

  const hasFilters = filters.priorities.length > 0 || filters.categories.length > 0 || 
    filters.plants.length > 0 || filters.timeframes.length > 0 || filters.status.length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={Colors2026.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Priorität */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priorität</Text>
            <View style={styles.chips}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, filters.priorities.includes(p) && styles.chipActive]}
                  onPress={() => togglePriority(p)}
                >
                  <Text style={[styles.chipText, filters.priorities.includes(p) && styles.chipTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Kategorie */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kategorie</Text>
            <View style={styles.chips}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, filters.categories.includes(c) && styles.chipActive]}
                  onPress={() => toggleCategory(c)}
                >
                  <Text style={[styles.chipText, filters.categories.includes(c) && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Zeitraum */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zeitraum</Text>
            <View style={styles.chips}>
              {TIMEFRAMES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, filters.timeframes.includes(t) && styles.chipActive]}
                  onPress={() => toggleTimeframe(t)}
                >
                  <Text style={[styles.chipText, filters.timeframes.includes(t) && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.chips}>
              {STATUS_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, filters.status.includes(s) && styles.chipActive]}
                  onPress={() => toggleStatus(s)}
                >
                  <Text style={[styles.chipText, filters.status.includes(s) && styles.chipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pflanzen (wenn verfügbar) */}
          {availablePlants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pflanzen</Text>
              <View style={styles.chips}>
                {availablePlants.slice(0, 10).map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.chip, filters.plants.includes(p.id) && styles.chipActive]}
                    onPress={() => togglePlant(p.id)}
                  >
                    <Text style={[styles.chipText, filters.plants.includes(p.id) && styles.chipTextActive]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {hasFilters && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Zurücksetzen</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Anwenden</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing2026.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors2026.text,
  },
  content: {
    flex: 1,
    padding: Spacing2026.lg,
  },
  section: {
    marginBottom: Spacing2026.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing2026.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors2026.surface,
    borderWidth: 1,
    borderColor: Colors2026.divider,
  },
  chipActive: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors2026.text,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing2026.md,
    padding: Spacing2026.lg,
    borderTopWidth: 1,
    borderTopColor: Colors2026.divider,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius2026.md,
    borderWidth: 1,
    borderColor: Colors2026.divider,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors2026.textSecondary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
```

- [ ] **Step 4: Commit**
```bash
git add src/components/ui/QuickFilterChips.tsx src/components/ui/SeasonFilterDropdown.tsx src/components/ui/ExtendedFilterModal.tsx
git commit -m "feat(tasks): add UI components for filtering"
```

---

## Task 4: TaskListContent integrieren

**Files:**
- Modify: `src/components/TaskListContent.tsx`

- [ ] **Step 1: Neue State-Variablen und Imports hinzufügen**

```typescript
// Imports erweitern:
import { 
  // ... existing
  getCurrentSeason, 
  getSeasonFromDate,
  isTaskOverdue, 
  isTaskDueThisWeek, 
  isTaskDueNextWeek,
  filterTasksBySeason,
  sortTasksByMonth,
  getSortLabel as getSortLabelNew,
} from '../services/taskService';

// Neue State-Variablen:
const [quickFilter, setQuickFilter] = useState<QuickFilterType | null>(null);
const [selectedSeason, setSelectedSeason] = useState('Alle');
const [showExtendedFilter, setShowExtendedFilter] = useState(false);
const [extendedFilters, setExtendedFilters] = useState({
  priorities: [] as string[],
  categories: [] as string[],
  plants: [] as string[],
  timeframes: [] as string[],
  status: [] as string[],
});
```

- [ ] **Step 2: Filter-Logik in useMemo erweitern**

```typescript
const filteredAndSortedTasks = useMemo(() => {
  let result = [...tasks];

  // Quick Filter
  if (quickFilter === 'overdue') {
    result = result.filter(t => isTaskOverdue(t.scheduled_date || t.due_date || null));
  } else if (quickFilter === 'thisWeek') {
    result = result.filter(t => isTaskDueThisWeek(t.scheduled_date || t.due_date || null));
  } else if (quickFilter === 'nextWeek') {
    result = result.filter(t => isTaskDueNextWeek(t.scheduled_date || t.due_date || null));
  } else if (quickFilter === 'nextSteps') {
    // High priority, not overdue, not completed
    result = result.filter(t => 
      t.priority === 'hoch' && 
      !isTaskOverdue(t.scheduled_date || t.due_date || null) &&
      !t.completed_at
    );
  }

  // Season Filter
  if (selectedSeason !== 'Alle') {
    result = filterTasksBySeason(result, selectedSeason);
  }

  // Extended Filters
  if (extendedFilters.priorities.length > 0) {
    result = result.filter(t => extendedFilters.priorities.includes(t.priority));
  }
  if (extendedFilters.categories.length > 0) {
    result = result.filter(t => extendedFilters.categories.includes(t.category));
  }
  if (extendedFilters.status.includes('erledigt') && !extendedFilters.status.includes('offen')) {
    result = result.filter(t => t.completed_at);
  } else if (extendedFilters.status.includes('offen') && !extendedFilters.status.includes('erledigt')) {
    result = result.filter(t => !t.completed_at);
  }

  // Sort
  if (sortBy === 'month') {
    return sortTasksByMonth(result);
  }
  return sortTasks(result, sortBy);
}, [tasks, quickFilter, selectedSeason, extendedFilters, sortBy]);
```

- [ ] **Step 3: Counts für Quick-Chips berechnen**

```typescript
const quickFilterCounts = useMemo(() => ({
  overdue: tasks.filter(t => isTaskOverdue(t.scheduled_date || t.due_date || null)).length,
  thisWeek: tasks.filter(t => isTaskDueThisWeek(t.scheduled_date || t.due_date || null)).length,
  nextWeek: tasks.filter(t => isTaskDueNextWeek(t.scheduled_date || t.due_date || null)).length,
  nextSteps: tasks.filter(t => 
    t.priority === 'hoch' && 
    !isTaskOverdue(t.scheduled_date || t.due_date || null) &&
    !t.completed_at
  ).length,
}), [tasks]);
```

- [ ] **Step 4: UI-Komponenten einbauen (nach Search Bar)**

```tsx
{/* Quick Filter Chips */}
<QuickFilterChips
  activeFilter={quickFilter}
  onFilterChange={setQuickFilter}
  counts={quickFilterCounts}
/>

{/* Season & Sort Filter Row */}
<View style={styles.filterRow}>
  <SeasonFilterDropdown
    selectedSeason={selectedSeason}
    onSeasonChange={setSelectedSeason}
  />
  
  {/* Sort Dropdown (bestehende Logik mit 'month' erweitern) */}
  <TouchableOpacity
    style={styles.sortChip}
    onPress={() => setShowSortMenu(!showSortMenu)}
  >
    <MaterialIcons name="sort" size={16} color={Colors2026.primary} />
    <Text style={styles.sortChipText}>{getSortLabelNew(sortBy)}</Text>
  </TouchableOpacity>

  {/* Extended Filter Button */}
  <TouchableOpacity
    style={styles.filterButton}
    onPress={() => setShowExtendedFilter(true)}
  >
    <MaterialIcons name="tune" size={18} color={Colors2026.primary} />
  </TouchableOpacity>
</View>

{/* Extended Filter Modal */}
<ExtendedFilterModal
  visible={showExtendedFilter}
  onClose={() => setShowExtendedFilter(false)}
  filters={extendedFilters}
  onFiltersChange={setExtendedFilters}
  availablePlants={tasks.flatMap(t => t.linked_plants || []).filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)}
/>
```

- [ ] **Step 5: Styles erweitern**

```typescript
const styles = StyleSheet.create({
  // ... existing styles
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: Colors2026.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors2026.primaryLight,
    borderWidth: 1,
    borderColor: Colors2026.primary,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors2026.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

- [ ] **Step 6: Commit**
```bash
git add src/components/TaskListContent.tsx
git commit -m "feat(tasks): integrate new filters and components"
```

---

## Task 5: TaskDetail als Modal konfigurieren

**Files:**
- Modify: `src/navigation/TasksStackNavigator.tsx`

- [ ] **Step 1: TaskDetail als Modal konfigurieren**

```typescript
<Stack.Screen
  name="TaskDetail"
  component={TaskDetailScreen}
  options={{
    title: 'Aufgabe',
    presentation: 'modal',
    headerShown: true,
    headerStyle: {
      backgroundColor: Colors2026.surface,
    },
    headerTintColor: Colors2026.text,
  }}
/>
```

- [ ] **Step 2: Commit**
```bash
git add src/navigation/TasksStackNavigator.tsx
git commit -m "feat(tasks): configure TaskDetail as modal"
```

---

## Task 6: Testen und verifizieren

- [ ] **Step 1: App starten und navigieren**

```bash
npm run start
# or
npx expo start
```

- [ ] **Step 2: Tab "Aufgaben" sichtbar?**
- [ ] **Step 3: Quick-Chips angezeigt (Überfällig, Diese Woche, Nächste Woche, Next Steps)?**
- [ ] **Step 4: Jahreszeit-Dropdown funktioniert?**
- [ ] **Step 5: Monat-Sortierung in Sort-Dropdown?**
- [ ] **Step 6: Auf Klick auf Task → Modal öffnet sich?**
- [ ] **Step 7: Checkbox toggelt Completion ohne Modal?**
- [ ] **Step 8: Erweiterter Filter (Modal) öffnet sich?**

- [ ] **Step 9: Final Commit**
```bash
git add -A
git commit -m "feat(tasks): complete task list with intelligent filters and modal navigation"
```

---

## Erfolgskriterien

- [ ] Aufgaben-Tab sichtbar im Tab-Navigator
- [ ] Quick-Chips: Überfällig, Diese Woche, Nächste Woche, Next Steps
- [ ] Jahreszeit-Filter (Alle/Frühling/Sommer/Herbst/Winter)
- [ ] Monat-Sortierung
- [ ] Erweiterter Filter (Modal) mit Priority, Kategorie, Zeitraum, Status
- [ ] Ganzer Listeneintrag klickbar → TaskDetail Modal
- [ ] Checkbox toggelt Completion (auch ohne Modal)
- [ ] Pflanzen-Erde Farbschema (Moos-Grün #4A7C59, Terrakotta #C67B4E)
- [ ] MaterialIcons für visuelle Orientierung