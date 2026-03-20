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

## Status Summary

| Phase | Tasks | Status | Commits |
|-------|-------|--------|---------|
| 1-2: Navigation | 1-2 | ✅ | 21c1897 |
| 3: Zeitraum | 3-5 | ✅ | 975cc9b, b557096 |
| 4: HomeScreen | 6-8 | ✅ | f63d0a0, 18e7571 |
| 5: Learnings | 9-12 | ✅ | 694fa52, ec9fe8e, 02e47d0, 79b4e92 |
| 6: Segmented | 13-14 | ✅ | 4cfaa04, b4aea61 |

### Test Coverage

| Component | Tests | Status |
|-----------|-------|--------|
| zeitraumUtils | ✅ zeitraumUtils.test.ts | VOLLSTÄNDIG |
| zeitraumService | ✅ zeitraumService.test.ts | VOLLSTÄNDIG |
| PrioritaetBadge | ❌ | FEHLT |
| TaskCard | ❌ | FEHLT |
| LearningCard | ❌ | FEHLT |
| LearningService | ❌ | FEHLT |
| SegmentedControl | ❌ | FEHLT |
| HomeScreen | ❌ | FEHLT |

---

## Task Breakdown

### Phase 1: Navigation Restrukturierung (Tasks 1-2)

---

### Task 1: TabNavigator - Photos verschieben

**Files:**
- Modify: `src/navigation/TabNavigator.tsx`
- Modify: `src/types/navigation.ts`

- [x] **Step 1: Backup current TabNavigator** (nicht nötig - git history)

- [x] **Step 2: Remove Photos from Tab Navigator** (Commit: 21c1897)

- [x] **Step 3: Add Photos to GardenStackNavigator** (Commit: 21c1897)

- [x] **Step 4: Update Navigation Types** (Commit: 21c1897)

- [x] **Step 5: Test Navigation** ✅

- [x] **Step 6: Commit** (21c1897)

---

### Task 2: Navigation Types - Update für Segmented Control

**Files:**
- Modify: `src/types/navigation.ts`

- [x] **Step 1: Update TabParamList** (Commit: 21c1897)

- [x] **Step 2: Update PlantsStackParamList für Segmented** (Commit: 21c1897)

- [x] **Step 3: Test Build** ✅

- [x] **Step 4: Commit** (21c1897)

---

### Phase 2: Zeitraum-System (Tasks 3-5)

---

### Task 3: Zeitraum Types und Utils erstellen

**Files:**
- Create: `src/types/zeitraum.ts` ✅
- Create: `src/utils/zeitraumUtils.ts` ✅
- Create: `src/__tests__/zeitraumUtils.test.ts` ✅

- [x] **Step 1: Create Zeitraum Types** (Commit: 975cc9b)

- [x] **Step 2: Create Zeitraum Utils** (Commit: 975cc9b)

- [x] **Step 3: Write Tests** (Commit: 975cc9b)

- [x] **Step 4: Run Tests** ✅

- [x] **Step 5: Commit** (975cc9b)

---

### Task 4: ZeitraumService erstellen

**Files:**
- Create: `src/services/zeitraumService.ts` ✅
- Create: `src/__tests__/zeitraumService.test.ts` ✅

- [x] **Step 1: Create ZeitraumService** (Commit: 975cc9b)

- [x] **Step 2: Write Tests** (Commit: 975cc9b)

- [x] **Step 3: Run Tests** ✅

- [x] **Step 4: Commit** (975cc9b)

---

### Task 5: Task Types erweitern

**Files:**
- Modify: `src/types/task.ts`

- [x] **Step 1: Update Task Interface** (Commit: b557096)

- [x] **Step 2: Update TaskFormData** (Commit: b557096)

- [x] **Step 3: Commit** (Commit: b557096)

---

### Phase 3: HomeScreen Erweiterung (Tasks 6-8)

---

### Task 6: PrioritaetBadge Component

**Files:**
- Create: `src/components/PrioritaetBadge.tsx` ✅
- Create: `src/__tests__/PrioritaetBadge.test.tsx` ❌ **FEHLT**

- [x] **Step 1: Create PrioritaetBadge** (Commit: f63d0a0)

- [ ] **Step 2: Write Test** ❌ **OFFEN**

- [ ] **Step 3: Run Tests** ❌

- [x] **Step 4: Commit** (f63d0a0)

---

### Task 7: TaskCard Component

**Files:**
- Create: `src/components/TaskCard.tsx` ✅
- Create: `src/__tests__/TaskCard.test.tsx` ❌ **FEHLT**

- [x] **Step 1: Create TaskCard** (Commit: f63d0a0)

- [ ] **Step 2: Write Test** ❌ **OFFEN**

- [ ] **Step 3: Run Tests** ❌

- [x] **Step 4: Commit** (f63d0a0)

---

### Task 8: HomeScreen erweitern

**Files:**
- Modify: `src/screens/HomeScreen.tsx` ✅
- Create: `src/__tests__/HomeScreen.test.tsx` ❌ **FEHLT**

- [x] **Step 1: Read current HomeScreen** ✅

- [x] **Step 2: Add Task Imports** (Commit: 18e7571)

- [x] **Step 3: Add Task State** (Commit: 18e7571)

- [x] **Step 4: Add Task Loading in useFocusEffect** (Commit: 18e7571)

- [x] **Step 5: Add Task Section after Harvest Summary** (Commit: 18e7571)

- [x] **Step 6: Add Task Loading Function** (Commit: 18e7571)

- [x] **Step 7: Test Build** ✅

- [x] **Step 8: Commit** (Commit: 18e7571)

---

### Phase 4: Learnings System (Tasks 9-12)

---

### Task 9: Learning Types und Component

**Files:**
- Create: `src/types/learning.ts` ✅
- Create: `src/components/LearningCard.tsx` ✅
- Create: `src/__tests__/LearningCard.test.tsx` ❌ **FEHLT**

- [x] **Step 1: Create Learning Type** (Commit: 694fa52)

- [x] **Step 2: Create LearningCard** (Commit: 694fa52)

- [ ] **Step 3: Write Tests** ❌ **OFFEN**

- [x] **Step 4: Commit** (Commit: 694fa52)

---

### Task 10: LearningService erstellen

**Files:**
- Create: `src/services/learningService.ts` ✅
- Create: `src/__tests__/learningService.test.ts` ❌ **FEHLT**

- [x] **Step 1: Create LearningService** (Commit: ec9fe8e)

- [ ] **Step 2: Write Tests** ❌ **OFFEN**

- [ ] **Step 3: Run Tests** ❌

- [x] **Step 4: Commit** (Commit: ec9fe8e)

---

### Task 11: Learnings Sektion in HomeScreen

**Files:**
- Modify: `src/screens/HomeScreen.tsx` ✅

- [x] **Step 1: Add Learnings State** (Commit: 02e47d0)

- [x] **Step 2: Add Learnings Loading** (Commit: 02e47d0)

- [x] **Step 3: Add Learnings Section** (Commit: 02e47d0)

- [x] **Step 4: Commit** (Commit: 02e47d0)

---

### Task 12: Database Migration Script

**Files:**
- Create: `supabase/migrations/20260320_add_zeitraum_learnings.sql` ✅

- [x] **Step 1: Create Migration SQL** (Commit: 79b4e92)

- [ ] **Step 2: Run Migration** ⚠️ **NOCH NICHT ANGEWENDET**

- [x] **Step 3: Commit** (Commit: 79b4e92)

---

### Phase 5: Segmented Control (Tasks 13-14)

---

### Task 13: SegmentedControl Component

**Files:**
- Create: `src/components/SegmentedControl.tsx` ✅
- Create: `src/__tests__/SegmentedControl.test.tsx` ❌ **FEHLT**

- [x] **Step 1: Create SegmentedControl** (Commit: 4cfaa04)

- [ ] **Step 2: Write Tests** ❌ **OFFEN**

- [ ] **Step 3: Run Tests** ❌

- [x] **Step 4: Commit** (Commit: 4cfaa04)

---

### Task 14: PlantListScreen mit Segmented

**Files:**
- Modify: `src/screens/PlantListScreen.tsx` ✅

- [x] **Step 1: Add Segmented State** (Commit: b4aea61)

- [x] **Step 2: Add SegmentedControl** (Commit: b4aea61)

- [x] **Step 3: Conditional Content Based on Tab** ⚠️ **PARTIELL** (TODO: full tab switching)

- [x] **Step 4: Commit** (Commit: b4aea61)

---

## Remaining Work

### Tests (hohe Priorität)

| # | Test | Task-Referenz |
|---|------|---------------|
| 1 | PrioritaetBadge.test.tsx | Task 6 |
| 2 | TaskCard.test.tsx | Task 7 |
| 3 | HomeScreen.test.tsx | Task 8 |
| 4 | LearningCard.test.tsx | Task 9 |
| 5 | LearningService.test.ts | Task 10 |
| 6 | SegmentedControl.test.tsx | Task 13 |

### Database

| # | Task | Status |
|---|------|--------|
| 1 | Migration anwenden | ⚠️ OFFEN |

### Feature Gaps

| # | Task | Status |
|---|------|--------|
| 1 | SegmentedControl full tab switching | ⚠️ PARTIELL |

---

## Summary

| Phase | Tasks | Implementiert | Getestet | Aufwand |
|-------|-------|---------------|----------|---------|
| 1-2: Navigation | 1-2 | ✅ | ⚠️ | 1h |
| 3: Zeitraum | 3-5 | ✅ | ✅ | 2h |
| 4: HomeScreen | 6-8 | ✅ | ❌ | 3h |
| 5: Learnings | 9-12 | ✅ | ❌ | 4h |
| 6: Segmented | 13-14 | ✅ | ❌ | 1h |
| **Total** | **14 Tasks** | **14/14** | **2/14** | **~11h** |

---

*Plan erstellt: 2026-03-20*
*Aktualisiert: 2026-03-20*
*Status: Implementation Complete, Tests Needed*
