# Superpowers Plan: Navigation & Segmented Control Fix

> **Datum:** 2026-03-20  
> **Status:** BRANCH: `feature/navigation-fix`  
> **Goal:** TaskStackNavigator integrieren + SegmentedControl vollständig implementieren

---

## Problem Analysis

### Gefundene Issues:

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | TaskStackNavigator existiert, aber NICHT mit TabNavigator verbunden | 🔴 HOCH | OFFEN |
| 2 | SegmentedControl in PlantListScreen ist PARTIELL implementiert | 🔴 HOCH | OFFEN |
| 3 | Aufgaben/Einkauf-Tabs zeigen nur Placeholder | 🔴 HOCH | OFFEN |
| 4 | Doppelter Filter-UI-Code in PlantListScreen (lines 315-437 & 459-611) | 🟡 MEDIUM | OFFEN |
| 5 | Navigation zu TaskList funktioniert nicht richtig (uses `as any`) | 🟡 MEDIUM | OFFEN |

### Current Architecture:

```
TabNavigator (4 Tabs)
├── Home
├── Plants (Stack)
│   └── PlantListScreen
│       └── SegmentedControl [Pflanzen | Aufgaben | Einkauf]
│           ├── Segment 0: Pflanzen ✅ (implementiert)
│           ├── Segment 1: Aufgaben ⚠️ (Placeholder → navigiert falsch)
│           └── Segment 2: Einkauf ⚠️ (Placeholder → navigiert falsch)
├── Garden
└── More

TaskStackNavigator (existiert, aber NICHT verbunden!)
├── TaskList
├── AddTask
└── TaskDetail
```

---

## Lösungsoptionen

### Option A: Full SegmentedControl Integration (EMPFOHLEN)
- Aufgaben und Einkauf als Content in PlantListScreen einbetten
- SegmentedControl wird zum echten Tab-Switcher
- Keine Navigation zwischen Screens, alles in einem Screen

**Pros:**
- Entspricht dem Design Spec (Approach B)
- Schneller Tab-Wechsel ohne Navigation
- Konsistentes UX

**Cons:**
- PlantListScreen wird groß (~1000+ Lines)
- Duplicate State Management

### Option B: Tab Navigator innerhalb Plants Stack
- PlantsStackNavigator mit eigenem Tab-Navigator
- Separate Screens für Pflanzen/Aufgaben/Einkauf

**Pros:**
- Sauberere Code-Trennung
- Bessere Testbarkeit

**Cons:**
- Mehr Navigationsebenen
- Komplexeres Routing

### Option C: 5. Tab für Tasks
- Tasks als separater Tab (bricht 4-Tab-Design)

**Pros:**
- Einfachste Lösung
- Jeder Screen hat eine Aufgabe

**Cons:**
- Bricht UX-Konsolidierung
- 5 Tabs waren das ursprüngliche Problem

---

## Recommended: Option A - Full SegmentedControl

### Ziel-Architektur:

```
PlantListScreen (mit SegmentedControl)
├── Segment 0: Pflanzen (bereits ✅)
├── Segment 1: Aufgaben (→ TaskListScreen Content)
└── Segment 2: Einkauf (→ ShoppingListScreen Content)
```

---

## Implementation Plan

### Phase 1: TaskStackNavigator integrieren

**Task 1.1: TaskStackNavigator als Component verfügbar machen**

```
Files:
- Create: src/components/TaskListContent.tsx (extrahierter Content)
- Modify: src/screens/PlantListScreen.tsx
```

- [ ] **Step 1:** Extrahiere TaskListScreen Logik in `TaskListContent` Component
- [ ] **Step 2:** Importiere `TaskListContent` in PlantListScreen
- [ ] **Step 3:** Render `TaskListContent` für Segment 1
- [ ] **Step 4:** Entferne Placeholder Code
- [ ] **Step 5:** Test Tab-Switch
- [ ] **Step 6:** Commit

**Task 1.2: ShoppingListContent extrahieren**

```
Files:
- Create: src/components/ShoppingListContent.tsx
- Modify: src/screens/PlantListScreen.tsx
```

- [ ] **Step 1:** Extrahiere ShoppingListScreen Logik in `ShoppingListContent`
- [ ] **Step 2:** Importiere in PlantListScreen
- [ ] **Step 3:** Render für Segment 2
- [ ] **Step 4:** Test Tab-Switch
- [ ] **Step 5:** Commit

### Phase 2: Code Cleanup

**Task 2.1: Doppelten Filter-UI-Code entfernen**

```
Files:
- Modify: src/screens/PlantListScreen.tsx
```

- [ ] **Step 1:** Identifiziere duplicate Filter-Code (lines 315-437)
- [ ] **Step 2:** Extrahiere in `FilterSection` Component
- [ ] **Step 3:** Nutze Component für beide Tab-Bereiche
- [ ] **Step 4:** Lösche duplicate Code
- [ ] **Step 5:** Commit

**Task 2.2: Navigation Types bereinigen**

```
Files:
- Modify: src/types/navigation.ts
```

- [ ] **Step 1:** Entferne ungenutzte Task Routes aus RootStackParamList
- [ ] **Step 2:** ODER: Behalte für direkte Deep-Links
- [ ] **Step 3:** Dokumentiere Decision
- [ ] **Step 4:** Commit

### Phase 3: Testing & Polish

**Task 3.1: Integration Testing**

- [ ] **Step 1:** Test SegmentedControl Switch Performance
- [ ] **Step 2:** Test Filter-Chips in beiden Tabs
- [ ] **Step 3:** Test Add-Task Flow
- [ ] **Step 4:** Test Add-Shopping-Item Flow
- [ ] **Step 5:** Commit

**Task 3.2: UI Polish**

- [ ] **Step 1:** Consistent Loading States
- [ ] **Step 2:** Consistent Empty States
- [ ] **Step 3:** Consistent FABs (jeder Tab braucht eigenen FAB)
- [ ] **Step 4:** Commit

---

## Files to Modify

### High Priority

| File | Changes |
|------|---------|
| `src/screens/PlantListScreen.tsx` | Full SegmentedControl + Content |
| `src/components/TaskListContent.tsx` | NEW - Extracted Task List |
| `src/components/ShoppingListContent.tsx` | NEW - Extracted Shopping List |

### Medium Priority

| File | Changes |
|------|---------|
| `src/components/FilterSection.tsx` | NEW - Shared Filter UI |
| `src/types/navigation.ts` | Cleanup, ggf. TaskRoutes entfernen |

### Low Priority (Cleanup)

| File | Changes |
|------|---------|
| `src/screens/TaskListScreen.tsx` | Evtl. obsolet,deprecated |
| `src/screens/ShoppingListScreen.tsx` | Evtl. obsolet,deprecated |

---

## Estimated Effort

| Phase | Task | Effort | Status |
|-------|------|--------|--------|
| 1.1 | TaskStackNavigator → TaskListContent | 2h | - |
| 1.2 | ShoppingListScreen → ShoppingListContent | 1h | - |
| 2.1 | FilterSection extrahieren | 1h | - |
| 2.2 | Navigation Types cleanup | 30min | - |
| 3.1 | Integration Testing | 1h | - |
| 3.2 | UI Polish | 1h | - |
| **Total** | | **~6.5h** | - |

---

## Alternative: Option B (Tab Navigator im Stack)

Falls Option A zu komplex wird, hier die Alternative:

```
PlantsStackNavigator (mit createMaterialBottomTabNavigator)
├── PlantListScreen (Plant Tab)
├── TaskListScreen (Aufgaben Tab)  
└── ShoppingListScreen (Einkauf Tab)
```

**Changes:**
- Neuer TabNavigator für Plants Stack
- 3 separate Screens
- Bessere Code-Trennung

**Effort:** ~4h

---

## Decision Required

Bitte entscheide:

1. **Option A** (Full SegmentedControl in PlantListScreen) oder
2. **Option B** (Tab Navigator im Plants Stack)

Ich empfehle **Option A** da sie dem Design Spec entspricht und weniger Navigationsebenen hat.

---

## Next Steps

1. [ ] Decision treffen (Option A oder B)
2. [ ] Branch erstellen: `feature/navigation-fix`
3. [ ] Phase 1 implementieren
4. [ ] Testen
5. [ ] Merge

---

*Plan erstellt: 2026-03-20*
*Review:pending*
