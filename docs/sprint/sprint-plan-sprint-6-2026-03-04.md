# Sprint 6 Plan: Gartenplaner MVP

**Date:** 2026-03-04
**Sprint:** Sprint 6 (2026-03-04 bis 2026-03-18)
**Scrum Master:** ninanitzsche
**Project Level:** 2 (MVP)
**Team Size:** 1 developer (Senior)
**Sprint Length:** 2 weeks
**Status:** 🟡 PLANNED

---

## Executive Summary

Sprint 6 focuses on **solving critical user-facing issues**: making migrated photos visible in a standalone gallery and enabling full task management with priority sorting.

**Key Objectives:**
1. Fix photos not showing in large gallery → Implement STORY-013
2. Enable task creation & completion → Implement STORY-005 + STORY-006
3. Make tasks sortable by priority → Implement STORY-009

**Metrics:**
- Total Stories: 4
- Total Points: 12 (target capacity)
- Team Capacity: 12 points/sprint
- Utilization: 100% (optimal)
- Target Completion: 2026-03-18

---

## Sprint 6 Goal

**"Enable task management and make photos discoverable through filterable gallery"**

Deliver:
- ✅ Standalone photo gallery with filtering (fixes gray photos issue)
- ✅ Task creation, editing, deletion
- ✅ Task completion with timestamps
- ✅ Automatic task sorting by priority

---

## Story Inventory

### STORY-013: Foto-Galerie mit Filter

**Epic:** EPIC-003 (Foto-Dokumentation & KI-Erkennung)
**Priority:** 🔴 MUST HAVE
**Points:** 3
**Dependencies:** STORY-011 (photos exist - ✅ completed in Sprint 5)

**User Story:**
As a gardener
I want to browse my photos chronologically and filter by context
So that I can find specific photos and see garden progress

**Acceptance Criteria:**
- [ ] **Gallery Screen** (1 pt)
  - [x] Standalone PhotoGalleryScreen (not tied to single plant)
  - [x] Shows all user photos in 2-column grid
  - [x] Sorted chronologically (newest first)
  - [x] Pull-to-refresh functionality
  - [x] Empty state when no photos

- [ ] **Filtering** (1 pt)
  - [ ] Filter by Location (Hauptbeet, Hochbeet, Gewächshaus, Pergola, Zaunseite)
  - [ ] Filter by Linked Plant (multi-select)
  - [ ] Filter by Date Range (this month, this year, all-time)
  - [ ] Multiple filters combinable
  - [ ] Active filter count badge ("Filter (2)")

- [ ] **Photo Interaction** (1 pt)
  - [ ] Tap photo → opens full-screen modal
  - [ ] Modal shows high-res image, date, notes, linked plants
  - [ ] Delete photo with confirmation
  - [ ] Infinite scroll/pagination for 50+ photos

**Technical Notes:**
- Component: `src/screens/PhotoGalleryScreen.tsx` (refactor existing)
- Use FlatList with numColumns={2} for grid
- Service: Extend `photoService.ts` with filter methods
- Query: Supabase with `.eq()`, `.gte()` for date ranges, `.range()` for pagination
- Cache photo URLs with React Native Image component
- Performance: removeClippedSubviews=true, maxToRenderPerBatch=10

**Issues Fixed:**
- Photos showing as gray → verify file_url paths match Supabase Storage
- No way to see all photos → standalone gallery tab

**Sprint Effort:** 3 points = ~6-7 hours
**Dev Story File:** `docs/stories/STORY-013.md` (to be created)

---

### STORY-005: Aufgaben erstellen und verwalten

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** 🔴 MUST HAVE
**Points:** 5
**Dependencies:** STORY-INF-001 (tasks table - ✅ exists), STORY-001 (plants - ✅ exists)

**User Story:**
As a gardener
I want to create, edit, and delete tasks for garden work
So that I can track what needs to be done

**Acceptance Criteria:**
- [ ] **Task List Screen** (1.5 pts)
  - [ ] TaskListScreen shows all tasks in sorted list
  - [ ] Each task shows: Title, Category badge, Priority indicator (color), Plant names
  - [ ] Empty state: "Keine Aufgaben" with "Aufgabe erstellen" button
  - [ ] Tap task → navigate to task detail screen
  - [ ] Pull-to-refresh

- [ ] **Task Form (Add/Edit)** (2 pts)
  - [ ] AddTaskScreen with form:
    - [ ] Title (required, text input)
    - [ ] Description (optional, textarea)
    - [ ] Category dropdown (Aussaat, Pflanzen, Gartenarbeiten, Beobachten, Ernten)
    - [ ] Priority (niedrig/mittel/hoch radio buttons)
    - [ ] Linked Plants (multi-select from plant list)
    - [ ] Location (dropdown: same as plant locations)
  - [ ] Submit button → saves to Supabase
  - [ ] Edit form pre-fills all fields

- [ ] **Task Details & Actions** (1.5 pts)
  - [ ] TaskDetailScreen shows all fields
  - [ ] Edit button → open form
  - [ ] Delete button with confirmation dialog
  - [ ] Changes sync to Supabase in real-time

**Technical Notes:**
- Components: TaskListScreen.tsx, TaskFormScreen.tsx, TaskDetailScreen.tsx, TaskListItem.tsx
- Services: Create `src/services/taskService.ts` (pattern: plantService.ts)
- Table: tasks (id, user_id, title, description, category, priority, due_date, location, created_at)
- Junction: plant_tasks (task_id, plant_id) for many-to-many linking
- Navigation: Add to RootStackParamList
- Priority colors: niedrig=gray, mittel=yellow, hoch=red
- Multi-select: Use CheckBox component for plant selection

**Sprint Effort:** 5 points = ~10-12 hours
**Dev Story File:** `docs/stories/STORY-005.md` (to be created)

---

### STORY-006: Aufgaben abhaken mit Zeitstempel

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** 🔴 MUST HAVE
**Points:** 2
**Dependencies:** STORY-005 (tasks exist)

**User Story:**
As a gardener
I want to mark tasks as complete and track when they were done
So that I can see my progress and task history

**Acceptance Criteria:**
- [ ] **Task Completion** (1 pt)
  - [ ] Checkbox on each task in TaskListItem
  - [ ] Tap checkbox → task marked complete with completed_at timestamp
  - [ ] Completed tasks shown with strikethrough + green checkmark
  - [ ] Optimistic update (instant UI feedback)

- [ ] **Completion History** (1 pt)
  - [ ] "Show Completed" toggle (default: hidden)
  - [ ] Completed tasks movable to separate section
  - [ ] Undo button on completed task
  - [ ] TaskDetailScreen shows completion date/time if completed
  - [ ] Completion history visible (list of past completions)

**Technical Notes:**
- Schema: Add to tasks table: completed_at TIMESTAMPTZ (NULL if incomplete)
- Query: `.is('completed_at', null)` for active tasks
- Supabase: `UPDATE tasks SET completed_at = NOW()` on completion
- Undo: `UPDATE tasks SET completed_at = NULL`
- Use optimistic updates in React state
- Filter display: Separate active/completed sections or toggle visibility

**Sprint Effort:** 2 points = ~4-5 hours
**Dev Story File:** `docs/stories/STORY-006.md` (to be created)

---

### STORY-009: Aufgaben-Priorisierungs-Algorithmus

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** 🟠 SHOULD HAVE (elevated to Must Have for this sprint)
**Points:** 2
**Dependencies:** STORY-005 (tasks exist)

**User Story:**
As a gardener
I want tasks automatically sorted by priority and urgency
So that I know what to work on first

**Acceptance Criteria:**
- [ ] **Auto-Sorting** (1 pt)
  - [ ] Default sort: Priority (hoch → mittel → niedrig), then by due_date, then by created_at
  - [ ] High-priority tasks with due dates show "⚠️ Due soon" badge (3 days)
  - [ ] Overdue tasks show "🚨 Overdue" badge in red
  - [ ] Task list re-sorts automatically when priority/due_date changes

- [ ] **Sort Options** (1 pt)
  - [ ] "Sort by" dropdown: Priority (default), Due Date, Category, Created Date
  - [ ] Sort preference persisted to user settings
  - [ ] Visual indicator of current sort method

**Technical Notes:**
- Schema: Update tasks table with due_date TIMESTAMPTZ (optional)
- Query: `.order('priority_int', { ascending: false }).order('due_date', { ascending: true }).order('created_at', { ascending: true })`
- Priority mapping: hoch=3, mittel=2, niedrig=1 (store as integer for sorting)
- Badge logic:
  - Due soon: due_date between now and +3 days, not completed
  - Overdue: due_date < today, not completed
- Settings: useAuth context to store sort preference

**Sprint Effort:** 2 points = ~4 hours
**Dev Story File:** `docs/stories/STORY-009.md` (to be created)

---

## Sprint 6 Allocation

| Story | Points | Priority | Technical Effort | Acceptance |
|-------|--------|----------|------------------|-----------|
| STORY-013: Photo Gallery Filter | 3 | MUST | Medium | 8 criteria |
| STORY-005: Task Management | 5 | MUST | High | 10 criteria |
| STORY-006: Task Completion | 2 | MUST | Low | 5 criteria |
| STORY-009: Task Sorting | 2 | SHOULD | Low | 4 criteria |
| **TOTAL** | **12** | - | - | **27 criteria** |

**Capacity Utilization:** 12/12 points (100%) ✅

---

## Epic Traceability

| Epic ID | Epic Name | Stories in Sprint 6 | Total Points | Status |
|---------|-----------|-------------------|--------------|--------|
| EPIC-001 | Pflanzen-Inventar | (none) | - | ✅ Sprint 5 done |
| EPIC-002 | Dynamische Aufgaben | STORY-005, 006, 009 | 9 pts | 🟡 Starting |
| EPIC-003 | Foto-Dokumentation | STORY-013 | 3 pts | 🟡 Starting |

---

## Functional Requirements Coverage (Sprint 6)

| Requirement | Story | Status |
|------------|-------|--------|
| FR-001: Photo gallery (all photos) | STORY-013 | 🟡 Planned |
| FR-002: Photo filtering | STORY-013 | 🟡 Planned |
| FR-003: Task creation | STORY-005 | 🟡 Planned |
| FR-004: Task editing | STORY-005 | 🟡 Planned |
| FR-005: Task deletion | STORY-005 | 🟡 Planned |
| FR-006: Task completion | STORY-006 | 🟡 Planned |
| FR-007: Task sorting | STORY-009 | 🟡 Planned |

---

## Dependencies & Risks

### External Dependencies:
- ✅ Supabase configured (Sprint 0)
- ✅ Photo upload working (Sprint 5)
- ✅ Plant inventory functional (Sprint 1-3)
- ✅ Database schema ready (Sprint 0)

### Technical Dependencies (In-Sprint):
- STORY-005 must be 80% done before STORY-006 starts
- STORY-009 can run parallel to STORY-005/006
- All stories depend on existing photo/plant data being accessible

### Risks & Mitigation:

**High Risk:** Photo URLs still not resolving → gray thumbnails persist
- **Mitigation:**
  - Verify file_url format in database matches Supabase Storage paths
  - Check RLS policies allow public read
  - Test image loading with direct URL in browser
  - Fallback: Re-run migration with corrected file_url paths

**Medium Risk:** Task form too complex for STORY-005
- **Mitigation:**
  - Break multi-select plant selection into separate step
  - Start with required fields (title, priority)
  - Add optional fields in STORY-006 or Phase 2

**Medium Risk:** Performance with 50+ photos
- **Mitigation:**
  - Implement pagination (50 photos/page)
  - Use FlatList with optimizations
  - Cache photo URLs
  - Test with actual 21 photos first, then add 50-photo test case

**Low Risk:** Filter UX complexity
- **Mitigation:**
  - Modal-based filter UI (simpler than in-screen filters)
  - Start with location filter only, add more in Phase 2
  - Clear active filters button

---

## Definition of Done (Sprint 6)

For each story to be considered complete:

### Code Quality
- [ ] All code committed to feature branch (per story)
- [ ] TypeScript strict mode: 0 errors
- [ ] No console.log (except error logs)
- [ ] Error handling: 100% of async operations
- [ ] Code review: 1+ approval

### Testing
- [ ] Unit tests written (≥75% coverage per service)
  - [ ] STORY-013: Gallery filters, pagination queries
  - [ ] STORY-005: CRUD operations, validation
  - [ ] STORY-006: Completion logic, timestamp tracking
  - [ ] STORY-009: Sorting algorithm, badge logic
- [ ] Integration tests for critical flows:
  - [ ] Create task → see in gallery → complete → verify timestamp
  - [ ] Apply filters → verify results
- [ ] Manual testing:
  - [ ] Tested on iOS Simulator
  - [ ] Tested on Android Emulator
  - [ ] Works with 21 migrated photos
  - [ ] Works with 5+ test tasks
  - [ ] Navigation works correctly

### Documentation
- [ ] Story documents created: STORY-013.md, STORY-005.md, STORY-006.md, STORY-009.md
- [ ] Code comments for complex logic
- [ ] Navigation types updated (RootStackParamList)
- [ ] Service functions documented (JSDoc)

### Database
- [ ] Schema validated (tasks, plant_tasks tables exist)
- [ ] RLS policies verified (users see only own data)
- [ ] Indexes created for performance (tasks.user_id, tasks.priority, tasks.due_date)
- [ ] Migrations tested (if schema changes needed)

### Integration
- [ ] Navigation flows working:
  - [ ] Photos tab → Gallery → Filter → Detail → Back
  - [ ] Tasks tab → List → Create → Detail → Complete → Back
- [ ] Data sync: Changes persist in Supabase
- [ ] No breaking changes to existing features
- [ ] Error messages user-friendly (German)

### Deployment
- [ ] All tests passing (unit + integration)
- [ ] Code merged to main branch
- [ ] Demo-ready (can show features working)
- [ ] No regressions from Sprint 5

---

## Sprint Metrics & Velocity

**Planned Velocity:** 12 points

**Team Capacity Breakdown:**
- Developer: 1 senior
- Hours available: 10 days × 6 hours = 60 hours
- Estimate: 1 point = ~5 hours (senior dev)
- **Capacity: 60 ÷ 5 = 12 points**

**Effort Distribution:**
- Story investigation: 2 hours
- Implementation: 40 hours
- Testing: 12 hours
- Code review: 3 hours
- Documentation: 3 hours

**Expected Burndown:**
- Mid-sprint: ~6 points completed (50%)
- End-sprint: ~12 points completed (100%)

---

## Implementation Order

**Recommended sequence** (respects dependencies):

### Phase 1: Photo Gallery (Days 1-2, 3 pts)
1. **STORY-013:** Photo Gallery Filter
   - Set up gallery screen, FlatList
   - Implement filter modal, location/plant/date filters
   - Test with 21 migrated photos
   - *Unblocks:* Nothing (standalone feature)

### Phase 2: Task Foundation (Days 3-5, 5 pts)
2. **STORY-005:** Task Management
   - Create TaskListScreen, TaskFormScreen, TaskDetailScreen
   - Implement CRUD operations
   - Add plant linking
   - *Unblocks:* STORY-006

### Phase 3: Task Completion (Days 6-7, 2 pts)
3. **STORY-006:** Task Completion
   - Add completed_at field
   - Implement completion checkbox + toggle
   - Show completion history
   - *Unblocks:* Nothing (builds on STORY-005)

### Phase 4: Task Sorting (Days 7-8, 2 pts)
4. **STORY-009:** Task Sorting (runs parallel with Phase 2-3)
   - Implement priority sorting
   - Add badge logic (due soon, overdue)
   - Sorting preferences

**Parallel Possible:** STORY-013 and STORY-005 can run in parallel since independent

---

## Next Steps

### Immediate (Today):
1. ✅ Sprint 6 plan finalized
2. Create detailed story documents:
   - `docs/stories/STORY-013.md`
   - `docs/stories/STORY-005.md`
   - `docs/stories/STORY-006.md`
   - `docs/stories/STORY-009.md`
3. Create feature branches for each story

### Week 1:
- Implement STORY-013 (Photo Gallery)
- Start STORY-005 (Tasks)

### Week 2:
- Complete STORY-005
- Implement STORY-006 (Completion)
- Implement STORY-009 (Sorting)
- Testing & refinement
- Sprint review & planning for Sprint 7

### Sprint 6 Review (2026-03-18):
- Demo: Full photo gallery with filters
- Demo: Complete task workflow (create → complete → see history)
- Metrics: Test coverage, velocity, burndown
- Planning for Sprint 7

---

## Sprint 7 Preview

If Sprint 6 goes well, Sprint 7 will include:
- STORY-007: Saisonale Aufgaben-Vorschläge (5 pts)
- STORY-012: Foto-Notizen mit Kategorien (2 pts)
- STORY-008: Wiederholende Aufgaben (3 pts)
- **Total: ~10 pts** (leave buffer for bugs/refinement)

---

## Assumptions & Notes

**Assumptions:**
- 21 photos are correctly migrated with proper file_url paths
- photo_plants junction table has correct links
- Tasks table schema exists in database
- User has 45+ plants for task linking tests

**Known Issues to Address:**
- Gray photo preview rendering → verify Supabase URLs
- TaskListScreen shows empty state → will be fixed by STORY-005

**Lessons from Sprint 5:**
- Type safety matters (STORY-040 foundation helps)
- Service layer pattern reusable (use for taskService)
- Integration tests catch edge cases
- ~2 points/day realistic velocity for solo senior dev

---

**Sprint 6 Status:** 🟡 READY TO START
**Created:** 2026-03-04
**Review Date:** 2026-03-18

---

**This sprint plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
