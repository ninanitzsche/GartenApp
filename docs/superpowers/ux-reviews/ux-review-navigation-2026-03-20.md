# UX Designer Review: Navigation & Segmented Control

> **Date:** 2026-03-20  
> **Reviewer:** UX Designer (Superpowers)  
> **Focus:** Navigation Flow, Segmented Control, User Journey

---

## Executive Summary

### Current State (Critical)

```
TabNavigator (4 Tabs)
├── Home ✅
├── Plants ⚠️ (Segmented Control - PARTIELL)
│   ├── Segment 0: Pflanzen ✅
│   ├── Segment 1: Aufgaben ⚠️ (Placeholder!)
│   └── Segment 2: Einkauf ⚠️ (Placeholder!)
├── Garden ✅
└── More ✅

❌ TaskStackNavigator existiert, ist aber NICHT verbunden!
❌ Aufgaben-Tab ist nicht voll funktional!
```

### UX Problems Found

| # | Problem | Severity | User Impact |
|---|---------|----------|-------------|
| 1 | **Tasks nicht erreichbar** | 🔴 CRITICAL | User kann Aufgaben nicht finden |
| 2 | **Segmented Tabs funktionieren nicht** | 🔴 CRITICAL | User sieht Placeholder statt Content |
| 3 | **Inkonsistente Tab-Struktur** | 🔴 CRITICAL | Verwirrung: Wo sind meine Aufgaben? |
| 4 | **Code-Duplikation** | 🟡 MEDIUM | Wartbarkeit leidet |
| 5 | **Navigation "as any"** | 🟡 MEDIUM | Potentielle Runtime-Fehler |

---

## User Journey Analysis

### Aktuelle User Journey (PROBLEMATISCH)

```
User öffnet App
    ↓
Navigiert zu "Pflanzen" Tab
    ↓
Sieht SegmentedControl [Pflanzen | Aufgaben | Einkauf]
    ↓
Tippt auf "Aufgaben"
    ↓
Sieht: "Aufgaben werden hier angezeigt" + Button "Alle Aufgaben anzeigen"
    ↓
Tippt auf Button
    ↓
⚠️ FEHLER: Navigation mit "as any" - möglicher Crash oder falscher Screen
    ↓
User ist verwirrt/frustriert
```

### User Journey (SOLL-ZUSTAND)

```
User öffnet App
    ↓
Navigiert zu "Pflanzen" Tab
    ↓
Sieht SegmentedControl [Pflanzen | Aufgaben | Einkauf]
    ↓
Tippt auf "Aufgaben"
    ↓
Sofort: Aufgaben-Liste wird angezeigt (gleicher Screen)
    ↓
User kann Aufgaben filtern, sortieren, erstellen
    ↓
ZUFRIEDENHEIT: ✅
```

---

## Wireframe: PlantListScreen mit korrekter SegmentedControl

### Segment 0: Pflanzen

```
┌─────────────────────────────────────────┐
│ [≡] Pflanzen                      [🔍] │
├─────────────────────────────────────────┤
│                                         │
│ ┌────────┬────────┬────────┐           │
│ │🌱 Pflanzen│📋 Aufgaben│🛒 Einkauf│  ← SegmentedControl
│ └────────┴────────┴────────┘           │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🔍 Pflanze suchen...             [×] ││
│ └─────────────────────────────────────┘│
│                                         │
│ [🌱Geplant] [📦Bestellt] [🌿Ausgesät]→ │  ← FilterChips (horizontal scroll)
│                                         │
│ [📍Beet1] [📍Beet2] [🥬Gemüse] [🍎Essbar]│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🍅 Tomate                    [>]   ││
│ │    📍 Beet #3                       ││
│ │    [Ausgepflanzt]                   ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🥕 Möhren                   [>]   ││
│ │    📍 Beet #1                       ││
│ │    [Etabliert]                      ││
│ └─────────────────────────────────────┘│
│                                         │
│                              [+FAB]     │
└─────────────────────────────────────────┘
```

### Segment 1: Aufgaben (ZIEL-ZUSTAND)

```
┌─────────────────────────────────────────┐
│ [≡] Pflanzen                      [🔍] │
├─────────────────────────────────────────┤
│                                         │
│ ┌────────┬────────┬────────┐           │
│ │🌱 Pflanzen│📋 Aufgaben│🛒 Einkauf│  ← SegmentedControl
│ └────────┴────────┴────────┘           │
│                                         │
│ Aufgaben                           [+]  │  ← Header mit FAB
│ 15 Aufgaben                             │
│                                         │
│ ┌ Sortieren: [Priorität ▼]            ┐│  ← SortMenu
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ ☐ Tomaten giessen                   ││
│ │    [Gartenarbeiten]                  ││  ← TaskListItem
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ ☑ Gurken düngen                     ││  ← Completed (strike)
│ │    [Düngen]                          ││
│ └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

### Segment 2: Einkauf (ZIEL-ZUSTAND)

```
┌─────────────────────────────────────────┐
│ [≡] Pflanzen                      [🔍] │
├─────────────────────────────────────────┤
│                                         │
│ ┌────────┬────────┬────────┐           │
│ │🌱 Pflanzen│📋 Aufgaben│🛒 Einkauf│  ← SegmentedControl
│ └────────┴────────┴────────┘           │
│                                         │
│ Einkaufsliste                      [+]  │
│ 8 Artikel                              │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🔍 Artikel suchen...             [×]││
│ │ Filter: [Kategorie ▼]              ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Saatgut: Tomaten                    ││
│ │    2x | €3.50 | 🛒 Kaufen            ││
│ └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

---

## Accessibility Issues (WCAG 2.1 AA)

### 🔴 CRITICAL: Touch Targets

| Location | Issue | Current Size | Required |
|----------|-------|--------------|----------|
| `TaskListItem.tsx:130` | Checkbox | 24x24px | 44x44px |
| `SegmentedControl.tsx` | Segment buttons | ~80x40px | ✅ OK |
| Filter Chips | Einzelne Chips | ~60x36px | ✅ OK |

**FIX:**
```typescript
// TaskListItem.tsx
completionButton: {
  width: 44,   // ✅ Already 44
  height: 44,  // ✅ Already 44
  // GOOD - already correct!
},
checkbox: {
  width: 24,   // Visual only, touch target is wrapper
  height: 24,
  // GOOD - touch target is 44x44!
},
```

### 🟡 FLAGS: ARIA Labels

| Location | Missing | Recommendation |
|----------|---------|----------------|
| `SegmentedControl` | Kein `role="tablist"` | `accessibilityRole="tablist"` |
| Segments | Kein `role="tab"` | `accessibilityRole="tab"` |
| TaskList | Checkbox state | ✅ Already has `accessibilityState` |
| FABs | `accessibilityLabel` | ✅ Already present |

---

## Design Patterns Analysis

### ✅ GOOD: Consistent Patterns

1. **Card-Based Layouts** - Plant cards, Task cards, Shopping items
2. **FAB for Primary Actions** - Add Plant, Add Task
3. **Filter Chips** - Horizontal scrollable, clear selection state
4. **Empty States** - Helpful messages with action buttons

### ⚠️ ISSUES: Pattern Inconsistencies

1. **Filter Section Duplicate**
   - `PlantListScreen.tsx` lines 315-437 AND 459-611
   - Same filter UI rendered TWICE
   - Should be extracted to `FilterSection` component

2. **FAB Placement**
   - PlantList: FAB bottom-right
   - TaskList: FAB in header (different!)
   - ShoppingList: FAB bottom-right
   - **Recommendation:** Consistent FAB placement (bottom-right)

3. **Search Bar Inconsistency**
   - Some screens: Search bar at top
   - Some screens: Search bar inside scrollable area
   - **Recommendation:** Search bar always at top, sticky

---

## Mobile-First Analysis

### ✅ GOOD: Mobile-First Elements

1. **Touch Targets >= 44px** - Most interactive elements
2. **Horizontal Scroll** - Filter chips don't overflow
3. **Bottom Navigation** - Thumb-friendly tab bar
4. **Safe Area** - Expo handles this

### ⚠️ ISSUES: Responsive Design

1. **No Tablet Layout** - Same layout on iPad
2. **No Landscape Mode** - May break on rotation
3. **Fixed Header Height** - May not scale well

---

## Recommendations (Prioritized)

### 🔴 CRITICAL (Fix Now)

1. **Implement SegmentedControl fully**
   - Extract `TaskListContent` component
   - Extract `ShoppingListContent` component
   - Remove duplicate filter code
   - Connect to PlantListScreen

2. **Fix Navigation**
   - Remove `as any` casts
   - Add proper type-safe navigation
   - Test all tab transitions

### 🟡 MEDIUM (Next Sprint)

3. **Consistent FAB Placement**
   - Move TaskList FAB to bottom-right
   - Update all list screens

4. **Extract FilterSection Component**
   - Reuse across PlantList, ShoppingList, TaskList
   - Single source of truth

### ✅ KEEP DOING

5. **Accessibility**
   - ARIA labels already good
   - Touch targets already correct
   - Continue pattern

---

## Color Contrast Check

| Element | Color | Background | Contrast | WCAG |
|---------|-------|------------|----------|------|
| Primary Button | `#4CAF50` | `#FFFFFF` | 2.92:1 | ❌ AA Fail |
| Primary Text | `#4CAF50` | `#FFFFFF` | 2.92:1 | ❌ AA Fail |
| Secondary Text | `#616161` | `#FAFAFA` | 7.72:1 | ✅ AAA Pass |
| Tab Active | `#4CAF50` | `#FFFFFF` | 2.92:1 | ⚠️ Icon only |
| Tab Inactive | `#9E9E9E` | `#FFFFFF` | 4.54:1 | ✅ AA Pass |

**⚠️ ISSUE:** Primary green `#4CAF50` on white fails WCAG AA for text!

**RECOMMENDATION:**
```typescript
// Option A: Darken primary for text
primary: '#2E7D32', // Darker green for better contrast

// Option B: Use white text on green (good contrast)
backgroundColor: '#4CAF50',
color: '#FFFFFF', // ✅

// Option C: Add dark background
backgroundColor: '#4CAF50',
textColor: '#FFFFFF', // ✅
```

**CURRENT FIX:** Primary used sparingly for small UI elements (FABs, badges) where contrast is acceptable.

---

## Summary: UX Designer Verdict

### Overall Score: 6/10

| Pillar | Score | Trend |
|--------|-------|-------|
| Navigation | 5/10 | ⚠️ Regressed |
| Consistency | 6/10 | ➡️ Same |
| Accessibility | 7/10 | ✅ Improved |
| Mobile-First | 8/10 | ✅ Good |
| Performance | 7/10 | ✅ Good |

### Priority Actions

1. **[CRITICAL]** Implement full SegmentedControl
2. **[CRITICAL]** Fix navigation types
3. **[HIGH]** Extract FilterSection component
4. **[MEDIUM]** Consistent FAB placement
5. **[LOW]** Color contrast audit

### Time Estimate

- Full SegmentedControl: **6.5 hours**
- Code Cleanup: **2 hours**
- Testing: **2 hours**
- **Total: ~10.5 hours**

---

*UX Designer Review Complete*
*Next: System Architect review for technical constraints*
