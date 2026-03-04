# STORY-009: Aufgaben-Priorisierungs-Algorithmus

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** 🟠 SHOULD HAVE (elevated to MUST for Sprint 6)
**Story Points:** 2
**Status:** Ready for Development
**Assigned To:** Unassigned
**Created:** 2026-03-04
**Sprint:** Sprint 6
**Depends On:** STORY-005 (tasks must exist)

---

## User Story

As a **gardener**
I want to **see tasks automatically sorted by priority and urgency**
So that **I know what to work on first**

---

## Description

### Background
STORY-005 creates tasks with priorities (niedrig, mittel, hoch). Without proper sorting, all priorities look the same. Users need clear visual indication of:
- Which tasks are most urgent
- Which tasks are due soon
- Overdue tasks that need immediate attention

This story implements intelligent sorting and visual badging to make task prioritization obvious.

### Scope

**In Scope:**
- Auto-sort by: Priority (hoch → mittel → niedrig), then due_date, then created_at
- "Due soon" badge (within 3 days)
- "Overdue" badge (past due date)
- Manual sort options dropdown
- Sort preference persistence
- Visual badge styling

**Out of Scope:**
- Task reminders/notifications
- Automatic task suggestions (STORY-007)
- Complex scheduling logic

### User Flow

1. **User opens task list**
   - Tasks auto-sorted by priority (high first)
   - High-priority tasks with due dates show "⚠️ Due soon" badge
   - Overdue tasks show "🚨 Overdue" badge in red

2. **User changes sort order** (optional)
   - Taps "Sort by" dropdown
   - Options: Priority (default), Due Date, Category, Created Date
   - Selection changes task order immediately
   - Preference saved

3. **User sees visual priority indicators**
   - Task colors indicate priority at a glance
   - Badges draw attention to urgent items

---

## Acceptance Criteria

### Auto-Sorting (1 pt)
- [ ] Default sort order:
  - [ ] Primary: Priority (hoch=3, mittel=2, niedrig=1)
  - [ ] Secondary: Due date (soonest first)
  - [ ] Tertiary: Created date (oldest first)
- [ ] Completed tasks remain visible but appear last:
  - [ ] Sort within active tasks separately from completed
  - [ ] Or: Completed tasks always last (regardless of priority)
- [ ] Tasks re-sort automatically when:
  - [ ] Priority changes
  - [ ] Due date changes
  - [ ] Task status changes (complete/incomplete)

### Badge Logic (1 pt)
- [ ] **"Due Soon" Badge** (⚠️ yellow/orange)
  - [ ] Shown when: due_date exists AND within 3 days AND not completed
  - [ ] Text: "⚠️ Fällig in X Tagen"
  - [ ] Example: "⚠️ Fällig in 2 Tagen"
- [ ] **"Overdue" Badge** (🚨 red)
  - [ ] Shown when: due_date < today AND not completed
  - [ ] Text: "🚨 Überfällig"
  - [ ] Bright red color to grab attention
  - [ ] Replace "Due Soon" if overdue

### Sort Options
- [ ] "Sort by" dropdown/menu in task list header
  - [ ] Options:
    - [ ] Priority (default, checked)
    - [ ] Due Date
    - [ ] Category
    - [ ] Created Date
  - [ ] Current selection shows checkmark
  - [ ] Changes apply instantly
- [ ] Sort preference persisted to AsyncStorage
- [ ] Preference restored on app restart

### Visual Indicators
- [ ] Priority color coding (consistent with STORY-005):
  - [ ] High (hoch): Red tint or red badge
  - [ ] Medium (mittel): Yellow/Orange tint
  - [ ] Low (niedrig): Gray tint
- [ ] Due/Overdue badges styled prominently:
  - [ ] High contrast color
  - [ ] Icon (⚠️ or 🚨)
  - [ ] Clear text

### Performance
- [ ] Sorting completes in <500ms even with 50+ tasks
- [ ] UI doesn't freeze when re-sorting
- [ ] No memory leaks from repeat sorts

---

## Technical Notes

### Schema Update (tasks table)

```sql
-- Add due_date column if not exists
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for efficient sorting
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### Type Definition (Update task.ts)

```typescript
export interface Task {
  // ... existing fields
  due_date?: string | null  // ISO timestamp
  completed_at?: string | null
}

export type SortOption = 'priority' | 'due_date' | 'category' | 'created_at'

export interface TaskWithBadge extends Task {
  badge?: {
    type: 'due_soon' | 'overdue'
    text: string
    color: string
  }
}
```

### Service Methods (Extend taskService.ts)

```typescript
// Fetch tasks with smart sorting
export async function fetchTasksSorted(
  sortBy: SortOption = 'priority',
  showCompleted: boolean = false
): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', currentUserId)

  // Filter completed if needed
  if (!showCompleted) {
    query = query.is('completed_at', null)
  }

  // Apply sort
  switch (sortBy) {
    case 'priority':
      // Sort by priority first, then by due_date, then created_at
      query = query
        .order('priority', { ascending: false })  // hoch first
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true })
      break
    case 'due_date':
      query = query.order('due_date', { ascending: true, nullsFirst: false })
      break
    case 'category':
      query = query.order('category', { ascending: true })
      break
    case 'created_at':
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// Calculate badge for task
export function calculateBadge(task: Task): TaskWithBadge {
  if (task.completed_at) {
    return task  // No badge for completed
  }

  if (!task.due_date) {
    return task  // No badge if no due date
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(task.due_date)
  dueDate.setHours(0, 0, 0, 0)

  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Overdue
  if (daysUntilDue < 0) {
    return {
      ...task,
      badge: {
        type: 'overdue',
        text: '🚨 Überfällig',
        color: Colors.error
      }
    }
  }

  // Due soon (within 3 days)
  if (daysUntilDue <= 3) {
    return {
      ...task,
      badge: {
        type: 'due_soon',
        text: `⚠️ Fällig in ${daysUntilDue} Tag${daysUntilDue !== 1 ? 'en' : ''}`,
        color: '#FFC107'  // Yellow
      }
    }
  }

  return task
}
```

### State Management

```typescript
// In TaskListScreen
const [sortBy, setSortBy] = useState<SortOption>('priority')

// Load preference on mount
useEffect(() => {
  AsyncStorage.getItem('taskSortBy')
    .then(val => setSortBy((val as SortOption) || 'priority'))
}, [])

// Handle sort change
const handleSortChange = async (newSort: SortOption) => {
  setSortBy(newSort)
  await AsyncStorage.setItem('taskSortBy', newSort)
  // Re-fetch with new sort
  await loadTasks(newSort)
}

// Load tasks with current sort
const loadTasks = async (sort: SortOption = sortBy) => {
  try {
    const tasks = await fetchTasksSorted(sort, showCompleted)
    // Add badges to each task
    const tasksWithBadges = tasks.map(calculateBadge)
    setTasks(tasksWithBadges)
  } catch (error) {
    showErrorAlert('Konnte Aufgaben nicht laden')
  }
}
```

### UI Components

**TaskListItem with badges:**
```typescript
<View style={styles.taskItem}>
  <View style={styles.taskContent}>
    <Text style={[
      styles.title,
      task.completed_at && styles.completedText
    ]}>
      {task.title}
    </Text>

    {/* Priority color indicator */}
    <View style={[
      styles.priorityBadge,
      { backgroundColor: getPriorityColor(task.priority) }
    ]}>
      <Text style={styles.priorityText}>
        {getPriorityLabel(task.priority)}
      </Text>
    </View>

    {/* Due/Overdue badge */}
    {task.badge && (
      <View style={[styles.badge, { backgroundColor: task.badge.color }]}>
        <Text style={styles.badgeText}>{task.badge.text}</Text>
      </View>
    )}
  </View>
</View>

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'hoch': return Colors.error
    case 'mittel': return '#FFC107'
    case 'niedrig': return Colors.textLight
    default: return Colors.border
  }
}
```

**Sort dropdown menu:**
```typescript
<Menu
  onPress={({ nativeEvent }) => {
    handleSortChange(nativeEvent.name)
  }}
  actions={[
    { title: 'Priorität' },
    { title: 'Fälligkeitsdatum' },
    { title: 'Kategorie' },
    { title: 'Erstellt' }
  ]}
>
  <MenuTrigger text={`Sortieren: ${getSortLabel(sortBy)}`} />
</Menu>
```

---

## Priority Mapping

```typescript
const PRIORITY_VALUES = {
  'hoch': 3,
  'mittel': 2,
  'niedrig': 1
}

const PRIORITY_LABELS = {
  'hoch': 'Hoch',
  'mittel': 'Mittel',
  'niedrig': 'Niedrig'
}
```

---

## Dependencies

### Must Be Done First
- ✅ STORY-005: Task Management
  - Tasks must exist to sort

### Blocking This Story
- None (independent sorting logic)

### Can Run Parallel
- STORY-006: Task Completion (can run at same time)

---

## Definition of Done

### Code Quality
- [ ] Schema migration created (due_date column)
- [ ] taskService.ts extended:
  - [ ] fetchTasksSorted(sortBy, showCompleted)
  - [ ] calculateBadge(task)
  - [ ] Priority mapping constants
- [ ] Sorting logic tested
- [ ] No console.log (except errors)
- [ ] Code reviewed

### Testing
- [ ] Unit tests:
  - [ ] fetchTasksSorted returns correct order
  - [ ] calculateBadge calculates due_soon correctly
  - [ ] calculateBadge calculates overdue correctly
  - [ ] Badges not shown for completed tasks
  - [ ] Sort preference persists
- [ ] Integration tests:
  - [ ] Default sort (priority) works
  - [ ] Changing sort updates order
  - [ ] Overdue badge appears for past due
  - [ ] Due soon badge appears for 3-day window
- [ ] Manual:
  - [ ] Tested on iOS/Android
  - [ ] Sort dropdown works
  - [ ] Badges display correctly
  - [ ] Preference persists on restart

### Documentation
- [ ] Story file (this file ✓)
- [ ] Schema migration documented
- [ ] Service methods have JSDoc
- [ ] Priority mapping documented

### Integration
- [ ] Works with STORY-005 + STORY-006
- [ ] RLS not affected
- [ ] No breaking changes

---

## Story Points Breakdown

| Component | Time | Points |
|-----------|------|--------|
| Schema + service methods | 1h | 0.5 |
| Badge calculation logic | 0.5h | 0.25 |
| UI components + menu | 1h | 0.5 |
| Sort preference persistence | 0.5h | 0.25 |
| Testing | 1h | 0.5 |
| **TOTAL** | **~4h** | **2** |

---

## Risks & Mitigation

**Risk: Sort preference doesn't persist**
- **Mitigation:** Test AsyncStorage on real device

**Risk: Badge calculation is wrong**
- **Mitigation:** Unit test with various dates (overdue, due soon, future)

**Risk: Performance with 100+ tasks**
- **Mitigation:** Sorting happens at database level (Supabase)

---

## Implementation Checklist

- [ ] Add due_date column to tasks table
- [ ] Extend taskService.ts with sort methods
- [ ] Implement calculateBadge function
- [ ] Create sort dropdown menu UI
- [ ] Add AsyncStorage for sort preference
- [ ] Update TaskListItem to show badges
- [ ] Test all sort options
- [ ] Test badge calculation (edge cases)
- [ ] Test preference persistence

---

**Story Status:** 🟡 Ready for Development
**Created:** 2026-03-04
**Next:** Implement after STORY-005 (can run parallel)

---

**Generated by BMAD Method v6**
