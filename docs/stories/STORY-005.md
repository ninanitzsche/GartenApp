# STORY-005: Aufgaben erstellen und verwalten

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** 🔴 MUST HAVE
**Story Points:** 5
**Status:** Ready for Development
**Assigned To:** Unassigned
**Created:** 2026-03-04
**Sprint:** Sprint 6

---

## User Story

As a **gardener**
I want to **create, edit, and delete tasks for garden work**
So that **I can track what needs to be done**

---

## Description

### Background
TaskListScreen currently shows only an empty state ("Keine Aufgaben"). There's no way to:
- Create tasks
- View task list
- Edit task details
- Link tasks to plants
- Track task status

This story delivers complete **task CRUD functionality**, enabling gardeners to plan and manage garden work.

### Scope

**In Scope:**
- TaskListScreen showing all tasks in sorted list
- AddTaskScreen/form to create new tasks
- TaskDetailScreen to view full task info
- Edit functionality (form pre-filled)
- Delete with confirmation
- Plant linking (multi-select)
- Task categories (Aussaat, Pflanzen, Gartenarbeiten, Beobachten, Ernten)
- Priority levels (niedrig, mittel, hoch)
- Real-time Supabase sync

**Out of Scope:**
- Task completion/timestamps (STORY-006)
- Automatic sorting/prioritization (STORY-009)
- Seasonal suggestions (STORY-007)
- Recurring tasks (STORY-008)

### User Flow

1. **User taps "Tasks" tab**
   - TaskListScreen loads with all tasks
   - Empty state: "Keine Aufgaben" with "Aufgabe erstellen" button
   - Loading spinner while fetching

2. **User taps "Add Task" button**
   - Opens AddTaskScreen with form:
     - Title (required text input)
     - Description (optional textarea)
     - Category dropdown (5 options)
     - Priority (radio buttons: niedrig/mittel/hoch)
     - Linked Plants (multi-select checkboxes)
     - Location (dropdown)
   - Submit saves to Supabase

3. **User sees tasks in list**
   - Each task shows: Title, Category badge, Priority color, Plant names
   - Tap task → TaskDetailScreen

4. **User edits task**
   - Tap task → detail screen
   - Edit button → form opens pre-filled with current values
   - Changes saved to Supabase

5. **User deletes task**
   - Detail screen → Delete button
   - Confirmation dialog
   - Confirmed → task deleted from database

---

## Acceptance Criteria

### Task List Screen (1.5 pts)
- [ ] TaskListScreen component shows all user tasks
  - [ ] Sorted by priority (hoch → mittel → niedrig), then created_at
  - [ ] Each task item shows:
    - [ ] Title (text)
    - [ ] Category badge (colored, text: "Aussaat" etc)
    - [ ] Priority indicator (color: red/yellow/gray)
    - [ ] Linked plant names (comma-separated or tags)
    - [ ] Created date (small text)
- [ ] Tap task → navigate to TaskDetailScreen
- [ ] Pull-to-refresh reloads tasks
- [ ] Empty state when no tasks:
  - [ ] Icon + "Keine Aufgaben" text
  - [ ] "Aufgabe erstellen" action button

### Task Form (Create/Edit) (2 pts)
- [ ] AddTaskScreen with form containing:
  - [ ] **Title input** (required, text input)
    - [ ] Validation: min 3 characters
    - [ ] Error message if empty on submit
  - [ ] **Description** (optional, textarea)
  - [ ] **Category dropdown** (required)
    - [ ] Options: Aussaat, Pflanzen, Gartenarbeiten, Beobachten, Ernten
    - [ ] Shows current selection
  - [ ] **Priority radio buttons** (required)
    - [ ] Options: niedrig, mittel, hoch
    - [ ] Default: mittel
  - [ ] **Linked Plants** (optional, multi-select)
    - [ ] Checkboxes for all user plants
    - [ ] Can select 0 or multiple plants
    - [ ] Shows selected count
  - [ ] **Location dropdown** (optional)
    - [ ] Same options as plant locations
    - [ ] Or auto-set from linked plants
- [ ] Submit button:
  - [ ] Validates required fields
  - [ ] Shows loading spinner while saving
  - [ ] On success: navigates back to list
  - [ ] On error: shows error alert with retry
- [ ] Edit form (when editing existing task):
  - [ ] Form pre-fills with current values
  - [ ] Submit button saves changes to Supabase
  - [ ] Can change any field

### Task Detail Screen (1.5 pts)
- [ ] TaskDetailScreen shows:
  - [ ] Task title (large)
  - [ ] Category (badge)
  - [ ] Priority (color-coded label)
  - [ ] Description (if present)
  - [ ] Location (if set)
  - [ ] Linked plants (as list or tags)
  - [ ] Created date/time
- [ ] Action buttons:
  - [ ] Edit button → opens form
  - [ ] Delete button → confirmation dialog
- [ ] Back navigation works

### Data Persistence
- [ ] All changes sync to Supabase immediately
- [ ] Create new task → appears in list within 1 second
- [ ] Edit task → changes reflected in list
- [ ] Delete task → removed from list
- [ ] Page refresh → loads all saved tasks correctly

### Error Handling
- [ ] Network error on create → show alert + retry
- [ ] Network error on update → show alert + retry
- [ ] Network error on delete → show alert + retry
- [ ] Validation errors → user-friendly messages (German)

---

## Technical Notes

### Components to Create

```typescript
src/screens/TaskListScreen.tsx
  - Shows all user tasks
  - Empty state + refresh
  - Tap to navigate to detail

src/screens/AddTaskScreen.tsx (or TaskFormScreen.tsx)
  - Reusable form for create + edit
  - Handles validation

src/screens/TaskDetailScreen.tsx
  - Shows full task info
  - Edit + Delete buttons
  - Navigation back to list

src/components/TaskListItem.tsx
  - Reusable list item for each task
  - Shows title, category, priority, plants

src/components/TaskForm.tsx
  - Reusable form component
  - All form fields
  - Validation logic
```

### Services

**Create `src/services/taskService.ts`:**

```typescript
// CRUD operations (pattern: plantService.ts)
export async function fetchTasks(): Promise<Task[]>
export async function fetchTask(id: string): Promise<Task>
export async function createTask(data: TaskFormData): Promise<Task>
export async function updateTask(id: string, data: TaskFormData): Promise<Task>
export async function deleteTask(id: string): Promise<void>

// Helper
export async function fetchPlantsForSelection(): Promise<Plant[]>
export async function linkPlantToTask(taskId: string, plantId: string): Promise<void>
export async function unlinkPlantFromTask(taskId: string, plantId: string): Promise<void>
```

### Data Types

```typescript
// src/types/task.ts (NEW)
export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  category: 'Aussaat' | 'Pflanzen' | 'Gartenarbeiten' | 'Beobachten' | 'Ernten'
  priority: 'niedrig' | 'mittel' | 'hoch'
  location?: string
  created_at: string
  updated_at: string
  linked_plants?: Plant[]  // Populated from junction table
}

export interface TaskFormData {
  title: string
  description?: string
  category: string
  priority: string
  location?: string
  plant_ids?: string[]  // List of selected plant IDs
}

export interface TaskListItem extends Task {
  plant_names: string[]  // For display in list
}
```

### Database Schema (Verify/Create)

**tasks table:**
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'mittel',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

**plant_tasks junction table:**
```sql
CREATE TABLE IF NOT EXISTS plant_tasks (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, plant_id)
);

CREATE INDEX idx_plant_tasks_task_id ON plant_tasks(task_id);
CREATE INDEX idx_plant_tasks_plant_id ON plant_tasks(plant_id);
```

### RLS Policies

```sql
-- SELECT: Users see only their own tasks
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Users can create tasks
CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### Navigation

**Update `src/types/navigation.ts`:**
```typescript
export type RootStackParamList = {
  // ... existing
  TaskList: undefined
  AddTask: undefined
  TaskDetail: { taskId: string }
  TaskForm: { taskId?: string }  // Optional for edit mode
}
```

### State & Forms

**Use React state + Supabase for persistence:**
```typescript
const [tasks, setTasks] = useState<Task[]>([])
const [loading, setLoading] = useState(false)
const [formData, setFormData] = useState<TaskFormData>({
  title: '',
  category: 'Gartenarbeiten',
  priority: 'mittel',
  plant_ids: []
})
```

### UI Colors/Styling

**Priority colors (use existing Colors theme):**
- niedrig: Colors.textLight (gray)
- mittel: #FFC107 (yellow)
- hoch: Colors.error (red)

**Category badges:** Use distinct colors per category

---

## Dependencies

### Must Be Done First
- ✅ STORY-001: Plant CRUD (Sprint 1 - COMPLETED)
  - Plants needed for linking
- ✅ STORY-INF-001: Database (Sprint 0 - COMPLETED)
  - Tasks table must exist

### Blocking This Story
- None (independent feature)

### This Story Blocks
- STORY-006: Task Completion (needs task creation first)
- STORY-009: Task Sorting (needs tasks to sort)

---

## Definition of Done

### Code Quality
- [ ] taskService.ts created with all CRUD methods
- [ ] All functions properly typed (no `any`)
- [ ] Error handling on all async operations
- [ ] No console.log (except errors)
- [ ] Code reviewed and approved

### Testing
- [ ] Unit tests for taskService:
  - [ ] createTask (validation, success, error)
  - [ ] updateTask (partial update, error)
  - [ ] deleteTask
  - [ ] fetchTasks (filter by user_id)
- [ ] Integration tests:
  - [ ] Create task → appears in list
  - [ ] Edit task → changes reflected
  - [ ] Delete task → removed from list
  - [ ] Plant linking works
- [ ] Manual testing:
  - [ ] Tested on iOS Simulator
  - [ ] Tested on Android Emulator
  - [ ] Form validation works
  - [ ] Navigation flows correctly
  - [ ] Plant multi-select works

### Documentation
- [ ] Story file created (this file ✓)
- [ ] taskService.ts has JSDoc comments
- [ ] task.ts types exported and used consistently
- [ ] Navigation types updated
- [ ] Migration guide (if schema changes)

### UI/UX
- [ ] Consistent with app design
- [ ] Form is user-friendly
- [ ] Error messages are helpful (German)
- [ ] Loading states show feedback
- [ ] Empty state is clear

### Integration
- [ ] Navigation flows work:
  - [ ] Tasks tab → empty state or list
  - [ ] Add button → form
  - [ ] Tap task → detail
  - [ ] Edit → form pre-filled
  - [ ] Back navigation works
- [ ] RLS enforced (users only see own tasks)
- [ ] Plant linking displays correctly
- [ ] No breaking changes

### Performance
- [ ] TaskList renders smoothly with 50+ tasks
- [ ] Form submission doesn't freeze UI
- [ ] Plant multi-select responsive (50+ plants)

---

## Story Points Breakdown

| Component | Time | Points |
|-----------|------|--------|
| taskService.ts (CRUD) | 2h | 1 |
| TaskListScreen + item | 2h | 1 |
| TaskFormScreen (form logic) | 2.5h | 1 |
| TaskDetailScreen | 1.5h | 0.5 |
| Plant linking (junction table) | 1h | 0.5 |
| Testing | 2h | 1 |
| **TOTAL** | **~11h** | **5** |

---

## Risks & Mitigation

**Risk: Multi-select plant UI too complex**
- **Mitigation:** Use CheckBox components, keep it simple
- **Fallback:** Implement as text tags users can add/remove

**Risk: Form validation complexity**
- **Mitigation:** Use simple required field validation first
- **Fallback:** Add advanced validation in Phase 2

**Risk: Performance with many plants in dropdown**
- **Mitigation:** Limit to plants user actually owns
- **Test:** With 100+ test plants

---

## Implementation Checklist

### Pre-Implementation
- [ ] Verify tasks table exists in Supabase
- [ ] Verify plant_tasks junction table exists
- [ ] Review plantService.ts as pattern
- [ ] Check if RLS policies are in place

### Phase 1: Service Layer (1 pt)
- [ ] Create taskService.ts with CRUD methods
- [ ] Create task.ts types
- [ ] Test queries manually in Supabase

### Phase 2: Screens (2.5 pts)
- [ ] Create TaskListScreen (empty state + list)
- [ ] Create TaskFormScreen (add + edit)
- [ ] Create TaskDetailScreen
- [ ] Create TaskListItem component
- [ ] Hook up navigation

### Phase 3: Plant Linking (1 pt)
- [ ] Add plant_ids to form
- [ ] Implement multi-select UI
- [ ] Save plant links to junction table

### Phase 4: Testing (0.5 pts)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

---

## Notes for Developer

**Key Files to Reference:**
- `src/services/plantService.ts` - CRUD pattern
- `src/screens/AddPlantScreen.tsx` - Form pattern
- `docs/TESTING-GUIDE.md` - Testing patterns

**Commands:**
```bash
npm test -- taskService.test.ts
npm start -- --ios
```

---

**Story Status:** 🟡 Ready for Development
**Created:** 2026-03-04
**Next:** /dev-story STORY-005

---

**Generated by BMAD Method v6**
