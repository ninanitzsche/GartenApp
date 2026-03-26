# UX Design: Aufgaben-Liste mit intelligenten Filtern und Navigation

**Datum:** 2026-03-26  
**Version:** 1.0

---

## 1. Übersicht

Modernes, pflanzen-erde-basiertes UI für die Aufgaben-Liste mit intelligenten Filtern, sortierung und Modal-Navigation zu TaskDetail.

**Design-Prinzipien:**
- Natürlicher Rhythmus (Wochen/Monate, nicht "heute")
- Kaskadierende Filter (max 3-4 sichtbar, Unteroptionen bei Klick)
- Ganzer Listeneintrag klickbar → Modal
- Pflanzen-Erde Stil mit organischen Icons

---

## 2. Navigation

### Tab-Struktur
- Neuer Tab "Aufgaben" im TabNavigator (zwischen Home und Pflanzen)
- TaskDetail als Modal (Slide-up/Fade-in) über aktueller Seite

### Stack
```
TabNavigator
├── Home
├── Plants
├── TasksStackNavigator (NEU)
│   ├── TaskListScreen
│   └── TaskDetailScreen (Modal)
├── GardenOverview
└── More
```

---

## 3. Filter-System

### 3.1 Suchleiste (Top)
```
🔍  Aufgabe suchen...                    [filter-icon]
```
- Freitext-Suche nach Titel, Beschreibung, Kategorie
- Clear-Button bei Text

### 3.2 Quick-Chips (Horizontal Scroll)
```
[Überfällig]  [Diese Woche]  [Nächste Woche]  [Next Steps]
```

| Chip | Funktion |
|------|----------|
| Überfällig | Alle überfälligen Aufgaben (scheduled_date < heute) |
| Diese Woche | Aufgaben in KW aktuell |
| Nächste Woche | Aufgaben in KW+1 |
| Next Steps | Prioritär, anstehend (nicht überfällig, aber "hoch" Priorität) |

### 3.3 Filter-Pill (Dropdown)
```
[Jahreszeit ▼]  [Sortieren ▼]
```

**Jahreszeit-Dropdown:**
- Alle
- Frühling
- Sommer
- Herbst
- Winter

**Sortierung-Dropdown:**
- Priorität (Hoch → Niedrig)
- Erstellt (Neueste zuerst)
- Alphabet (A-Z)
- **Monat** (NEU - sortiert nach scheduled_date/Monat)

### 3.4 Erweiterter Filter (Modal)
Bei Klick auf Filter-Icon → Modal mit:
- Priorität (Hoch/Mittel/Niedrig) - Checkbox-Multi
- Kategorie (Aussaat, Pflanzen, Gartenarbeiten, Beobachten, Ernten) - Checkbox-Multi
- Pflanze (aus verknüpften Pflanzen) - Checkbox-Multi
- Zeitraum (Diese Woche, Nächste Woche, Dieser Monat, Nächster Monat) - Checkbox-Multi
- Status (Offen/Erledigt) - Checkbox-Multi

---

## 4. Task-Liste

### Layout
```
┌─────────────────────────────────────────────────────┐
│ ○  Tomaten pikieren      [🌱]  🔥  📅 KW 12       │
│ ─────────────────────────────────────────────────── │
│ ○  Beet vorbereiten       [🌽]  🔥  📅 KW 13     │
│ ─────────────────────────────────────────────────── │
│ ○  Basilikum giessen     [🌿]  ○   📅 KW 14      │
└─────────────────────────────────────────────────────┘
```

### Elemente pro Item
- **Checkbox** (links) → Toggle Completion
- **Title** → Task-Titel
- **Plant Icon** → Verknüpfte Pflanze (oder generisches Icon)
- **Priority Dot** → 🔥=Hoch, ○=Mittel, ·=Niedrig
- **Zeitraum** → "KW 12" oder "Juni"

### Interaktionen
- **Ganze Zeile klickbar** → Öffnet TaskDetail als Modal
- **Checkbox klickbar** → Toggle Completion (auch ohne Modal)
- **Swipe links** → Quick-Complete / Löschen (optional)

---

## 5. TaskDetail Modal

### Design
- Slide-up Modal (60-80% Screen)
- Header mit X-Button (schließen)
- Glassmorphism-Hintergrund odernatürliches Beige

### Inhalt
- Task-Titel (groß)
- Priorität, Kategorie, Zeitraum (Badges)
- Beschreibung
- Verknüpfte Pflanzen (Chips)
- Verknüpfte Wissensbasis-Artikel
- Button: "Als erledigt markieren"

---

## 6. Visuelles Design

### Farben (Pflanzen-Erde Stil)
| Element | Farbe |
|---------|-------|
| Primary | Moos-Grün #4A7C59 |
| Secondary | Erde-Braun #8B7355 |
| Accent | Terrakotta #C67B4E |
| Background | Natürliches Beige #F5F0E6 |
| Surface | Hell-Beige #FAF7F2 |
| Error | Warn-Rot #D32F2F |
| Text Primary | Dunkel-Braun #3D3229 |
| Text Secondary | Mittel-Braun #6B5D4D |

### Icons (MaterialIcons)
- Checkbox: `check-box` / `check-box-outline-blank`
- Priority: `flag` (mit Farbe)
- Pflanze: `local-florist` / `grass`
- Zeitraum: `event` / `date-range`
- Filter: `filter-list`
- Sort: `sort`
- Modal: `expand-less` (slide-up)

### Typography
- Title: 18-20px, Semi-Bold
- Body: 14-16px, Regular
- Caption: 12px, Light

### Border Radius
- Cards: 12-16px
- Chips: 20px (abgerundet)
- Buttons: 8-12px

---

## 7. Technische Anforderungen

### Navigation
- TaskStackNavigator im TabNavigator
- Modal-Präsentation für TaskDetail (native-stack `presentation: 'modal'`)

### State Management
- Filter-State in TaskListContent (useState)
- Quick-Chips als abgeleiteter Filter
- API-Call bei Filteränderung (debounced)

### Performance
- FlatList mit keyExtractor
- useMemo für filteredTasks
- Debounced Search (300ms)

---

## 8. Abgrenzung

### Nicht in diesem Scope
- Push-Benachrichtigungen
- Wiederkehrende Aufgaben
- Aufgaben teilen/assignen
- Integration in Kalender-App

### Zukünftige Erweiterungen
- Wetter-Integration (Eisheiligen-Warnung)
- Pflanze-basiertes Dashboard
- Ernte-Prognose

---

## 9. Erfolgskriterien

- [ ] Aufgaben-Tab sichtbar im Tab-Navigator
- [ ] Quick-Chips: Überfällig, Diese Woche, Nächste Woche, Next Steps
- [ ] Jahreszeit-Filter (Frühling/Sommer/Herbst/Winter)
- [ ] Monat-Sortierung
- [ ] Erweiterter Filter (Modal)
- [ ] Ganzer Listeneintrag klickbar → TaskDetail Modal
- [ ] Checkbox toggelt Completion (auch ohne Modal)
- [ ] Pflanzen-Erde Farbschema
- [ ] Icons für visuelle Orientierung