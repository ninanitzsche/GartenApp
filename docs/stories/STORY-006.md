# STORY-006: Aufgaben abhaken mit Zeitstempel

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** 🔴 MUST HAVE
**Story Points:** 2
**Status:** Ready for Development
**Assigned To:** Unassigned
**Created:** 2026-03-04
**Sprint:** Sprint 6
**Depends On:** STORY-005 (tasks must exist)

---

## User Story

As a **gardener**
I want to **mark tasks as complete and track when they were done**
So that **I can see my progress and task history**

---

## Description

### Background
STORY-005 delivers task creation and editing. This story adds the ability to **complete tasks** and track completion history. Users need to know:
- Which tasks are done vs. pending
- When tasks were completed
- Historical record of completed work

This story adds completion tracking without full task prioritization sorting (that's STORY-009).

### Scope

**In Scope:**
- Checkbox to mark task complete
- Timestamp saved (completed_at)
- Visual feedback (strikethrough, green checkmark)
- Toggle to show/hide completed tasks
- Undo button to mark incomplete
- Completion history in detail view
- Optimistic UI updates

**Out of Scope:**
- Automatic sorting (STORY-009)
- Recurring task auto-creation
- Task reminders

### User Flow

1. **User sees task in list**
   - Uncompleted: normal text
   - Completed: strikethrough + green checkmark

2. **User taps checkbox to complete**
   - Checkbox fills/checks
   - Text gets strikethrough
   - Timestamp saved to Supabase
   - UI updates instantly (optimistic)

3. **User hides completed tasks**
   - Toggle "Show Completed" (default: OFF)
   - Completed tasks disappear from list
   - Still saved in database

4. **User clicks task to view history**
   - TaskDetailScreen shows:
     - Completed date/time if done
     - "Completed on: 3. März 2026 14:30"
     - Undo button if completed

5. **User undoes completion**
   - Clicks undo → task marked incomplete
   - Completed_at cleared
   - Text returns to normal

---

## Acceptance Criteria

### Completion UI (1 pt)
- [ ] Checkbox on each TaskListItem
  - [ ] Unchecked for active tasks
  - [ ] Checked + filled for completed tasks
- [ ] Tap checkbox → task marked complete
  - [ ] Optimistic update (instant UI feedback)
  - [ ] Save completed_at timestamp to Supabase
- [ ] Completed task visual styling:
  - [ ] Title text: strikethrough + dimmed (opacity 0.6)
  - [ ] Green checkmark icon visible
  - [ ] Category/priority badges slightly dimmed
- [ ] Optimistic failure recovery:
  - [ ] If save fails, show error toast + revert checkbox

### Task List Toggle (1 pt)
- [ ] "Show Completed" toggle in task list header
  - [ ] Default: OFF (hide completed tasks)
  - [ ] Toggle label: "Zeige abgeschlossene" (oder ähnlich)
- [ ] When OFF: Only active (non-completed) tasks shown
  - [ ] Count updates (e.g., "3 aktive Aufgaben")
- [ ] When ON: All tasks shown (active + completed)
- [ ] Toggle preference persisted to AsyncStorage
- [ ] Completed section visually separate (optional)

### Completion History
- [ ] TaskDetailScreen shows completion status:
  - [ ] If not completed: "Nicht abgeschlossen"
  - [ ] If completed: "Abgeschlossen am: 3. März 2026 um 14:30"
- [ ] Undo button visible if task completed:
  - [ ] Tap → clears completed_at
  - [ ] Task returns to active list
- [ ] Completion timestamp in ISO format stored
- [ ] Historical record preserved

### Data Persistence
- [ ] completed_at saved to Supabase (TIMESTAMPTZ, NULL if not completed)
- [ ] Refresh page → completed status preserved
- [ ] Undo → saves NULL to completed_at
- [ ] New tasks: completed_at = NULL

### Error Handling
- [ ] Network error on complete → show alert + retry
- [ ] Network error on undo → show alert + retry
- [ ] Graceful fallback if toggle save fails

---

## Technical Notes

### Database Schema (Update tasks table)

```sql
-- Add completion tracking to tasks table
ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Index for efficient filtering
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
```

### Service Methods (Extend taskService.ts)

```typescript
// Mark task as complete
export async function completeTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', currentUserId)

  if (error) throw error
}

// Mark task as incomplete (undo)
export async function uncompleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ completed_at: null })
    .eq('id', taskId)
    .eq('user_id', currentUserId)

  if (error) throw error
}

// Fetch active tasks only
export async function fetchActiveTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', currentUserId)
    .is('completed_at', null)  // Only incomplete
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Fetch all tasks (active + completed)
export async function fetchAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', currentUserId)
    .order('completed_at', { ascending: true })  // Active first
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
```

### State Management

```typescript
// In TaskListScreen
const [showCompleted, setShowCompleted] = useState(false)

// Persist toggle preference
useEffect(() => {
  AsyncStorage.getItem('showCompletedTasks')
    .then(val => setShowCompleted(val === 'true'))
}, [])

const handleToggleCompleted = async (value: boolean) => {
  setShowCompleted(value)
  await AsyncStorage.setItem('showCompletedTasks', String(value))
}

// Filter display
const displayedTasks = showCompleted
  ? tasks
  : tasks.filter(t => !t.completed_at)
```

### Optimistic Updates

```typescript
// In TaskListItem onPress handler
const handleComplete = async () => {
  // Optimistic: update UI immediately
  const wasComplete = task.completed_at !== null
  setTask({
    ...task,
    completed_at: wasComplete ? null : new Date().toISOString()
  })

  try {
    // Then sync to Supabase
    if (wasComplete) {
      await uncompleteTask(task.id)
    } else {
      await completeTask(task.id)
    }
  } catch (error) {
    // Rollback on error
    setTask(originalTask)
    showErrorAlert('Konnte Task-Status nicht speichern')
  }
}
```

### UI Components

**TaskListItem updates:**
```typescript
<View style={[
  styles.taskItem,
  task.completed_at && styles.completedItem
]}>
  <Checkbox
    value={!!task.completed_at}
    onValueChange={() => handleComplete()}
  />
  <Text style={[
    styles.title,
    task.completed_at && styles.completedText
  ]}>
    {task.title}
  </Text>
  {task.completed_at && (
    <MaterialIcons name="check-circle" color="green" size={20} />
  )}
</View>

// Styles
const styles = StyleSheet.create({
  completedItem: {
    opacity: 0.6
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.textLight
  }
})
```

**TaskDetailScreen update:**
```typescript
<View style={styles.completionSection}>
  {task.completed_at ? (
    <View>
      <Text style={styles.label}>Abgeschlossen am</Text>
      <Text style={styles.value}>
        {formatDate(task.completed_at)}
      </Text>
      <TouchableOpacity
        style={styles.undoButton}
        onPress={handleUndo}
      >
        <Text style={styles.undoText}>Rückgängig machen</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <Text style={styles.incompleteText}>Nicht abgeschlossen</Text>
  )}
</View>
```

### Date Formatting

```typescript
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  // Output: "3. März 2026 um 14:30"
}
```

---

## Dependencies

### Must Be Done First
- ✅ STORY-005: Task Management (Sprint 6)
  - Tasks must exist before completing them

### Blocking This Story
- None (can be tested independently)

### Future
- STORY-007: Seasonal Suggestions (independent)
- STORY-008: Recurring Tasks (build on completion logic)

---

## Definition of Done

### Code Quality
- [ ] Schema migration created (if needed)
- [ ] taskService.ts extended with complete/uncomplete methods
- [ ] Optimistic update logic implemented
- [ ] Error handling for network failures
- [ ] No console.log (except errors)
- [ ] Code reviewed and approved

### Testing
- [ ] Unit tests:
  - [ ] completeTask saves timestamp
  - [ ] uncompleteTask clears timestamp
  - [ ] fetchActiveTasks returns only incomplete
  - [ ] fetchAllTasks returns all
- [ ] Integration tests:
  - [ ] Complete task → appears as completed in UI
  - [ ] Toggle "Show Completed" → tasks disappear/reappear
  - [ ] Undo completion → task returns to active
  - [ ] Refresh page → completed status persists
- [ ] Manual testing:
  - [ ] Tested on iOS Simulator
  - [ ] Tested on Android Emulator
  - [ ] Optimistic update works (instant feedback)
  - [ ] Network error handling works
  - [ ] Toggle preference persists

### Documentation
- [ ] Story file created (this file ✓)
- [ ] Schema migration documented
- [ ] Service methods have JSDoc
- [ ] Task.ts type updated (completed_at field)

### Integration
- [ ] Works with STORY-005 (task creation)
- [ ] RLS enforced (users only update own tasks)
- [ ] No breaking changes to existing task features
- [ ] Navigation still works

---

## Story Points Breakdown

| Component | Time | Points |
|-----------|------|--------|
| Schema migration | 0.5h | 0 |
| Service methods (complete/undo) | 1h | 0.5 |
| UI components (checkbox + styles) | 1h | 0.5 |
| Toggle + persistence | 0.5h | 0 |
| Optimistic updates | 1h | 0.5 |
| Testing | 1h | 0.5 |
| **TOTAL** | **~5h** | **2** |

---

## Risks & Mitigation

**Risk: Optimistic update causes UI inconsistency**
- **Mitigation:** Always rollback on error, show clear error message

**Risk: Toggle preference not persisted**
- **Mitigation:** Use AsyncStorage, verify on app restart

**Risk: Performance with 100+ completed tasks**
- **Mitigation:** Add pagination for completed section (Phase 2)

---

## Implementation Checklist

- [ ] Create schema migration (completed_at column)
- [ ] Extend taskService.ts (completeTask, uncompleteTask, fetch methods)
- [ ] Update Task type (add completed_at: string | null)
- [ ] Update TaskListScreen (toggle + filter logic)
- [ ] Update TaskListItem (checkbox + styling)
- [ ] Update TaskDetailScreen (completion info + undo)
- [ ] Implement AsyncStorage for toggle preference
- [ ] Test complete/incomplete flows
- [ ] Test toggle persistence
- [ ] Test error handling

---

**Story Status:** 🟡 Ready for Development
**Created:** 2026-03-04
**Next:** Implement after STORY-005

---

**Generated by BMAD Method v6**
