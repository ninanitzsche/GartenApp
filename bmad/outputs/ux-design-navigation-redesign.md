# UX Design: Gartenplaner App - Navigation & Visual Polish

**Project:** Gartenplaner App  
**Date:** 2026-03-20  
**Version:** 1.0

---

## Design Overview

### Problem Summary

1. **Navigation:** Kein dedizierter "Aufgaben" Tab - Tasks sind versteckt
2. **Filter-Bereich:** Pflanzen-Filter oben zu lang, wird abgeschnitten
3. **Visuals:** App wirkt nicht "schick" genug

### Design Goals

1. Intuitive 5-Tab-Navigation mit prominentem Aufgaben-Tab
2. Kompakter, scrollbarer Filter-Bereich mit cleverer Verdichtung
3. Modernes, frisches visuelles Design mit Tiefe und Polierung

---

## Neue Tab-Navigation

### Vorher (4 Tabs):
```
┌─────────────────────────────────────────┐
│  [Home]  [Pflanzen]  [Garten]  [Mehr]  │
└─────────────────────────────────────────┘
```

### Nachher (5 Tabs):
```
┌─────────────────────────────────────────┐
│  [Home]  [Pflanzen]  [Aufgaben]  [Mehr] │
└─────────────────────────────────────────┘
```

**Änderungen:**
- "Garten" → versteckt unter "Mehr" als Menüpunkt
- "Aufgaben" → neuer prominenter Tab mit Badge für offene Tasks

---

## Wireframes

### 1. Tab-Navigator (Bottom Navigation)

```
┌─────────────────────────────────────────────────────────┐
│                    Gartenplaner                         │
│                   ─────────────────                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    [Screen Content]                     │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│    🏠      🌱      ✓       ⋮                            │
│   Home  Pflanzen  Aufgaben  Mehr                         │
│                    (3)                                  │
└─────────────────────────────────────────────────────────┘
                   ↑ Badge für offene Aufgaben
```

**Spezifikationen:**
- Tab-Bar Höhe: 60px (iOS Standard)
- Icon-Größe: 24px
- Badge: Circular, 18px, accent color (#FFC107)
- Aktiver Tab: primary (#4CAF50)
- Inaktiver Tab: neutral (#9E9E9E)

---

### 2. Aufgaben Tab - TaskListScreen

```
┌─────────────────────────────────────────────────────────┐
│                    Aufgaben                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔍 [Suchen...                              ] 🗕         │
│                                                         │
│  ── Heute ─────────────────────────────────────────────  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ☐  Tomaten pikieren                    ⭐⭐⭐       │ │
│  │    Beet A • Aussaat                      15 min   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ☐  Gießen: Gurken                     ⭐⭐         │ │
│  │    Gewächshaus                      ohne Zeitangabe│ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ── Morgen ────────────────────────────────────────────  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ☐  Unkraut jäten                      ⭐           │ │
│  │    Gemüsegarten                        30 min    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ── Diese Woche ───────────────────────────────────────  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ☐  Düngen: Kürbis                     ⭐⭐         │ │
│  │    Beet B                                10 min   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                                    [+]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design-Entscheidungen:**
- Zeitgruppierung oben (Heute, Morgen, Diese Woche)
- Prioritäts-Sterne visuell prominent
- Checkbox zum Abhaken
- Schwimmende Aktionstaste unten rechts (+)

---

### 3. Pflanzen Tab - PlantListScreen (REDESIGN)

#### Problem: Zu viele Filter oben = abgeschnitten

#### Lösung: Kompakter Filter-Bereich

```
┌─────────────────────────────────────────────────────────┐
│  🌱 Pflanzen     🌿 Aufgaben     🛒 Einkauf              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔍 [Pflanze suchen...                    ] [⚙ Filter] │
│                                                         │
│  [Alle ▾] [Standort ▾] [Typ ▾]     🌱 Essbar  🔄 Mix   │
│  ────────────────────────────────────────────────────── │
│  (1 Standort-Filter aktiv, 1 Typ aktiv)  [× Löschen]    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  🍅 Tomate 'Moneymaker'                            │ │
│  │  📍 Gewächshaus • Ausgepflanzt         [Essbar]    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  🥒 Gurke 'Schnegka'                              │ │
│  │  📍 Beet A • Bestellt                 [Essbar]   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Filter-Dropdown-Pattern:**
- Statt horizontaler Chips: Kompakte Dropdowns
- "Alle" = Alle Status
- "Standort" = Dropdown mit Checkboxen
- "Typ" = Dropdown mit Checkboxen  
- Toggle für "Essbar"
- Icon-Button für Mischkultur-Suche
- Aktive Filter: Badge-Count + "Löschen" Button

---

### 4. Mehr Menü (MehrMenuScreen) - MIT GARTEN

```
┌─────────────────────────────────────────────────────────┐
│                    Mehr                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                   👤                                     │
│              Max Mustermann                              │
│           max@beispiel.de                                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 👤 Mein Profil                               →    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🌻 Mein Garten                               →    │ │
│  │    Gartenansicht und Beete                      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🛒 Einkaufsliste                             →    │ │
│  │ 🗓 Ernte-Tagebuch                           →    │ │
│  │ 📚 Wissensdatenbank                          →    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ❓ Hilfe & Feedback                          →    │ │
│  │ ⚙ Einstellungen                             →    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │              🚪 Abmelden                           │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design-Änderungen:**
- User-Header mit Avatar und Name
- "Garten" prominent als Menüpunkt (war früher Tab)
- Gruppierung: Profil → Garten → Features → Einstellungen

---

## Component Specifications

### Filter-Dropdown

```
┌──────────────────────────────────────┐
│ Standort                      [▾]   │
└──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │
│ │ ☑ Gewächshaus                   │ │
│ │ ☑ Beet A                        │ │
│ │ ☐ Beet B                        │ │
│ │ ☐ Komposthaufen                 │ │
│ └──────────────────────────────────┘ │
│              [Abbrechen] [Anwenden]   │
└──────────────────────────────────────┘
```

**Specs:**
- Dropdown-Breite: 160px
- Max-Height: 200px (scrollbar)
- Border: 1px solid #E0E0E0
- Border-Radius: 8px
- Shadow: 0 4px 12px rgba(0,0,0,0.15)
- Touch-Target: 44px minimum

### Task Card

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ☐  Aufgabe Name hier                        ⭐⭐⭐     │
│      📍 Standort • Kategorie                  ⏱ 15 min │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**States:**
- Default: White background, subtle shadow
- Pressed: Scale 0.98, darker shadow
- Completed: Strikethrough text, muted colors
- Overdue: Red left border accent

---

## Visual Polish Recommendations

### 1. Elevation & Depth

```typescript
const shadows = {
  sm: { shadowOffset: {0, 1}, shadowRadius: 2, shadowOpacity: 0.1, elevation: 2 },
  md: { shadowOffset: {0, 4}, shadowRadius: 8, shadowOpacity: 0.12, elevation: 4 },
  lg: { shadowOffset: {0, 8}, shadowRadius: 16, shadowOpacity: 0.15, elevation: 8 },
};
```

### 2. Micro-Interactions

- Tab-Wechsel: Smooth icon scale (1.0 → 1.2 → 1.0)
- FAB: Pulse animation when empty
- Cards: Subtle lift on press
- Checkboxes: Satisfying check animation

### 3. Color Refinements

```
Primary Gradient: #4CAF50 → #66BB6A (subtle top-to-bottom)
Surface: #FFFFFF with subtle shadow
Cards: White with 8px border-radius
Dividers: #EEEEEE (softer than before)
```

### 4. Typography Scale

```
H1: 28px, Bold, #212121
H2: 22px, SemiBold, #424242  
Body: 16px, Regular, #616161
Caption: 14px, Regular, #757575
```

### 5. Spacing System

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
```

---

## Implementation Notes

### Step 1: TabNavigator.tsx
- Replace GardenOverview tab with Tasks tab
- Add badge support for open tasks
- Import TaskStackNavigator

### Step 2: MoreMenuScreen.tsx
- Add "Garten" menu item
- Add user profile header
- Reorganize menu groups

### Step 3: PlantListScreen.tsx
- Replace horizontal chip filters with dropdowns
- Add "Filter" toggle button
- Consolidate filter row
- Improve scroll behavior

### Step 4: Visual Polish
- Update shadows across cards
- Add subtle gradients to headers
- Refine typography scale
- Add micro-interactions

---

## Accessibility (WCAG 2.1 AA)

- All touch targets: 44px minimum
- Color contrast: 4.5:1 for text
- Focus indicators for keyboard nav
- Screen reader labels for icons
- Semantic heading hierarchy

---

**Next:** Implementation by Developer
