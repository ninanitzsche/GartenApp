# UI/UX Redesign - Design Specification

**Datum:** 2026-03-20  
**Status:** Approved  
**Approach:** B (Konsolidiertes Tab-Design)  
**Zeitaufwand:** ~11 Stunden  

---

## 1. Overview

### Ziel
Konsolidierung der Navigation von 7 auf 4 Tabs mit Integration von Tasks und Learnings ins Dashboard, basierend auf Zeiträumen und Prioritäten statt Kalendertagen.

###Scope
- Tab-Navigation Restrukturierung
- Home Dashboard Erweiterung (Tasks + Learnings)
- Learnings-System mit Knowledge Base Integration
- Segmented Controls in Plants Tab
- Photo Gallery Verschiebung

### Nicht im Scope
- Komplettes visuelles Redesign (Approach C)
- Neue Datenbank-Migrationen
- Offline-Support

---

## 2. Architecture

### 2.1 Tab-Struktur

```
NavigationContainer
└── TabNavigator (4 Tabs)
    ├── Home (Dashboard + Tasks + Learnings)
    ├── Plants (Stack Navigator)
    │   ├── PlantList (mit Segmented Control)
    │   ├── PlantDetail
    │   └── ...
    ├── Photos (Screen - aus Garden Stack)
    └── More (Stack Navigator)
        ├── MoreMenu
        ├── Profile
        ├── KnowledgeBase
        └── ...
```

### 2.2 Tab-Mapping

| Alt | Neu | Änderung |
|-----|-----|----------|
| Home | Home | +Tasks + Learnings |
| Plants | Plants | Unverändert |
| Tasks | Home | → Dashboard |
| Shopping | Plants | Quick-Access |
| Photos | Photos | Verschoben |
| Garden | Garden | Unverändert |
| More | More | Unverändert |

---

## 3. Data Models

### 3.1 Zeitraum Enum (mit Phasen)

```typescript
// Jahreszeiten mit Phasen für feinere Granularität
// Früher/Mittlerer/Später Zeitraum innerhalb einer Saison

enum ZeitraumPhase {
  FRUEH = 'frueh',     // Erste Phase der Saison
  MITTE = 'mitte',     // Mittlere Phase
  SPAET = 'spaet',     // Späte Phase
}

enum Jahreszeit {
  FRUEHJAHR = 'fruehjahr',   // März - Mai
  SOMMER = 'sommer',          // Juni - August
  HERBST = 'herbst',         // September - November
  WINTER = 'winter',          // Dezember - Februar
}

enum Zeitraum {
  // Mit Phasen (empfohlen)
  FRUEHJAHR_FRUH = 'fruehjahr_frueh',     // Feb-Mär
  FRUEHJAHR_MITTE = 'fruehjahr_mitte',     // Apr-Mai
  FRUEHJAHR_SPAET = 'fruehjahr_spaet',     // Mai-Jun
  SOMMER_FRUH = 'sommer_frueh',             // Jun-Jul
  SOMMER_MITTE = 'sommer_mitte',            // Jul
  SOMMER_SPAET = 'sommer_spaet',            // Aug
  HERBST_FRUH = 'herbst_frueh',             // Sep-Okt
  HERBST_MITTE = 'herbst_mitte',            // Okt-Nov
  HERBST_SPAET = 'herbst_spaet',            // Nov
  WINTER_FRUH = 'winter_frueh',             // Dez-Jan
  WINTER_MITTE = 'winter_mitte',            // Jan-Feb
  WINTER_SPAET = 'winter_spaet',            // Feb-Mär

  // Kurzfristig
  DIESE_WOCHE = 'diese_woche',

  // Ohne Zeitraum
  FLEXIBEL = 'flexibel',
}

// Hilfsfunktionen
function getJahreszeit(zeitraum: Zeitraum): Jahreszeit {
  // Extrahiert die Jahreszeit aus dem Zeitraum
}

function getPhase(zeitraum: Zeitraum): ZeitraumPhase {
  // Extrahiert die Phase aus dem Zeitraum
}

function getAktuelleSaison(): Zeitraum {
  // Berechnet basierend auf Monat + Phase
}
```

### 3.2 Prioritaet Enum

```typescript
enum Prioritaet {
  HOCH = 'hoch',
  MITTEL = 'mittel',
  NIEDRIG = 'niedrig',
}
```

### 3.3 Learning Model (Phase-basiert)

```typescript
interface Learning {
  id: string;
  user_id: string;

  // Quelle
  source_type: 'knowledge_base' | 'manual';
  source_id?: string;        // KB article ID
  source_name?: string;      // Article title

  // Inhalt
  title: string;
  content?: string;

  // Zuordnung
  related_plants: string[];
  related_categories: string[];

  // Phase-Zuordnung (NEU)
  // Welche Phase ist dieses Learning relevant?
  valid_for_zeitraeume: Zeitraum[];  // ['SOMMER_FRUH', 'SOMMER_MITTE']
  valid_for_categories?: string[];    // Für welche Task-Kategorien

  // Metadaten
  relevance_score: number;   // 0-1
  created_at: string;
  user_rating?: 'helpful' | 'not_helpful';
  dismissed: boolean;
}
```

### 3.4 Task Erweiterung

```typescript
interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  
  // NEU:
  zeitraum: Zeitraum;
  prioritaet: Prioritaet;
  
  // Existierend:
  category: string;
  location?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
}
```

---

## 4. UI Components

### 4.1 HomeScreen Layout (Phase-basiert)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Guten Morgen! Wir sind im 🌱 Frühjahr, früh."    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Priorisierte Aufgaben                               │   │
│ │ ─────────────────────────────────────────────────── │   │
│ │                                                     │   │
│ │ 🔴 Hohe Priorität                                   │   │
│ │   ☐ Tomaten giessen                                 │   │
│ │      🌱 Frühjahr · Mittlere Phase                   │   │
│ │                                                     │   │
│ │ 🟡 Mittlere Priorität                               │   │
│ │   ☐ Radieschen aussäen                              │   │
│ │      🌱 Frühjahr · Frühe Phase                      │   │
│ │                                                     │   │
│ │ 🟢 Niedrige Priorität                               │   │
│ │   ☐ Kompost umsetzen                                │   │
│ │      ❄️ Winter · Mittlere Phase                     │   │
│ │                                                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 💡 Tipps für diese Phase                             │   │
│ │ 🌱 Frühjahr · Frühe Phase                            │   │
│ │ ─────────────────────────────────────────────────── │   │
│ │                                                     │   │
│ │ 💡 Radieschen jetzt aussäen!                        │   │
│ │    Direktsaat im Freiland möglich                   │   │
│ │    💡 [Nützlich]  👎 [Nicht]                      │   │
│ │                                                     │   │
│ │ 💡 Tomaten noch nicht nach draußen!                 │   │
│ │    Zu kalt, erst ab mittlerer Phase                 │   │
│ │    💡 [Nützlich]  👎 [Nicht]                      │   │
│ │                                                     │   │
│ │ [+ Eigenes Learning hinzufügen]                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ⚡ Schnellzugriff                                    │   │
│ │ [➕ Neue Aufgabe]  [🛒 Einkauf]  [📷 Foto]         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
┌─────────────────────────────────────────┐
│ Header: "Guten Morgen! Es ist Sommer." │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Priorisierte Aufgaben               │ │
│ │ ─────────────────────────────────── │ │
│ │                                     │ │
│ │ 🔴 Hohe Priorität                   │ │
│ │   [Task Cards...]                   │ │
│ │                                     │ │
│ │ 🟡 Mittlere Priorität               │ │
│ │   [Task Cards...]                   │ │
│ │                                     │ │
│ │ 🟢 Niedrige Priorität               │ │
│ │   [Task Cards...]                   │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Saison-Tipps                        │ │
│ │ ─────────────────────────────────── │ │
│ │                                     │ │
│ │ [Learnings Cards...]                │ │
│ │ [+ Eigenes Learning]                │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Schnellzugriff                      │ │
│ │ [Neue Aufgabe] [Einkauf] [Foto]     │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 4.2 TaskCard Component

```typescript
interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
}

// Layout:
// ┌─────────────────────────────────────┐
// │ ☐ Task Title                       │
// │    Standort: Beet #3 • Zeitraum:    │
// │    Sommer • Priorität: HOCH        │
// └─────────────────────────────────────┘
```

### 4.3 LearningCard Component

```typescript
interface LearningCardProps {
  learning: Learning;
  onRate: (helpful: boolean) => void;
  onDismiss: () => void;
}

// Layout:
// ┌─────────────────────────────────────┐
// │ 💡 Learning Title                   │
// │    Context/Description              │
// │    Quelle: KB Article               │
// │    💡 [Nützlich]  👎 [Nicht]     │
// └─────────────────────────────────────┘
```

### 4.4 SegmentedControl Component

```typescript
interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

// Segments: ["🌱 Pflanzen", "📋 Aufgaben", "🛒 Einkauf"]
```

### 4.5 ZeitraumPicker Component (Phase-basiert)

```typescript
interface ZeitraumPickerProps {
  selected: Zeitraum;
  onSelect: (zeitraum: Zeitraum) => void;
}

// Layout: Erst Jahreszeit wählen, dann Phase
// ┌─────────────────────────────────────┐
// │ Jahreszeit:                         │
// │ [🌱 F] [☀️] [🍂] [❄️]            │
// │                                     │
// │ Phase (innerhalb der Jahreszeit):   │
// │ [FRÜH] [MITTE] [SPÄT]             │
// │                                     │
// │ Oder:                               │
// │ [📅 Diese Woche]  [⚪ Flexibel]   │
// └─────────────────────────────────────┘
```

### 4.6 Zeitraum-Anzeige auf Tasks

```typescript
// TaskCard zeigt:
// ┌─────────────────────────────────────┐
// │ ☐ Tomaten giessen                   │
// │    🌱 Frühjahr · Mittlere Phase     │
// │    🔴 HOCH                         │
// └─────────────────────────────────────┘
```

---

## 5. Services

### 5.1 learningService

```typescript
interface LearningService {
  // Fetch Learnings für aktuelle Saison
  getLearningsForSeason(
    plantIds: string[],
    season: Zeitraum
  ): Promise<Learning[]>;
  
  // Fetch Learnings für Pflanze
  getLearningsForPlant(plantId: string): Promise<Learning[]>;
  
  // Manuelles Learning erstellen
  createLearning(data: CreateLearningInput): Promise<Learning>;
  
  // Learning bewerten
  rateLearning(id: string, rating: 'helpful' | 'not_helpful'): Promise<void>;
  
  // Learning verwerfen
  dismissLearning(id: string): Promise<void>;
}
```

### 5.2 zeitraumService

```typescript
interface ZeitraumService {
  // Aktuelle Phase ermitteln
  getCurrentZeitraum(): Zeitraum;

  // Aktuelle Jahreszeit
  getCurrentJahreszeit(): Jahreszeit;

  // Aktuelle Phase
  getCurrentPhase(): ZeitraumPhase;

  // Zeitraum-Label (z.B. "Frühjahr · Mittlere Phase")
  getZeitraumLabel(zeitraum: Zeitraum): string;

  // Zeitraum-Kurzlabel (z.B. "🌱 Frühjahr, früh")
  getZeitraumShortLabel(zeitraum: Zeitraum): string;

  // Zeitraum-Icon
  getZeitraumIcon(zeitraum: Zeitraum): string;

  // Nächste Phase
  getNextPhase(zeitraum: Zeitraum): Zeitraum;

  // Auto-Suggestion für Task basierend auf Pflanze
  suggestZeitraum(
    plantName: string,
    kategorie?: string
  ): Zeitraum;

  // Prüfe ob Zeitraum zur aktuellen Phase passt
  isRelevantForCurrentPhase(zeitraum: Zeitraum): boolean;
}

// Beispiel-Logik für Auto-Suggestion
const PFLANZEN_ZEITRAUM: Record<string, Zeitraum> = {
  'Tomate': 'SOMMER_MITTE',
  'Radieschen': 'FRUEHJAHR_FRUH',
  'Kürbis': 'HERBST_FRUH',
  'Knoblauch': 'HERBST_SPAET',
  // ...
};

const KATEGORIE_ZEITRAUM: Record<string, ZeitraumPhase> = {
  'Aussaat': 'FRUEH',
  'Ernten': 'SPAET',
  'Bodenpflege': 'MITTE',
  // ...
};
```

### 5.3 taskService Erweiterung

```typescript
// Neue Funktionen:
interface TaskServiceExtended {
  // Fetch mit Gruppierung
  fetchTasksGroupedByPriority(): Promise<{
    hoch: Task[];
    mittel: Task[];
    niedrig: Task[];
  }>;
  
  // Fetch für Dashboard
  fetchTasksForDashboard(
    limit: number
  ): Promise<Task[]>;
  
  // Fetch nach Zeitraum
  fetchTasksByZeitraum(zeitraum: Zeitraum): Promise<Task[]>;
}
```

---

## 6. Database Changes

### 6.1 Tasks Table - Neue Spalten

```sql
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS zeitraum TEXT DEFAULT 'flexibel',
ADD COLUMN IF NOT EXISTS prioritaet TEXT DEFAULT 'mittel';

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_tasks_zeitraum ON tasks(zeitraum);
CREATE INDEX IF NOT EXISTS idx_tasks_prioritaet ON tasks(prioritaet);
```

### 6.2 Learnings Table (NEU - Phase-basiert)

```sql
CREATE TABLE IF NOT EXISTS learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Quelle
  source_type TEXT NOT NULL CHECK (source_type IN ('knowledge_base', 'manual')),
  source_id UUID,
  source_name TEXT,

  -- Inhalt
  title TEXT NOT NULL,
  content TEXT,

  -- Zuordnung
  related_plants TEXT[],  -- Array von Pflanzennamen
  related_categories TEXT[],

  -- Phase-Zuordnung (NEU)
  valid_for_zeitraeume TEXT[] NOT NULL,  -- ['SOMMER_FRUH', 'SOMMER_MITTE']

  -- Metadaten
  relevance_score DECIMAL(3,2) DEFAULT 0.5,
  user_rating TEXT CHECK (user_rating IN ('helpful', 'not_helpful')),
  dismissed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_learnings_user ON learnings(user_id);
CREATE INDEX IF NOT EXISTS idx_learnings_plants ON learnings USING GIN(related_plants);
CREATE INDEX IF NOT EXISTS idx_learnings_zeitraeume ON learnings USING GIN(valid_for_zeitraeume);
```

---

## 7. Implementation Tasks

### Phase 1: Navigation Restrukturierung (1h)

- [ ] TabNavigator: Photos → Garden verschieben
- [ ] NavigationTypes aktualisieren
- [ ] Testen: Navigation funktioniert

### Phase 2: HomeScreen Erweiterung (4h)

- [ ] Zeitraum-Service implementieren
- [ ] Prioritäts-basierte Task-Gruppierung
- [ ] HomeScreen: Aufgaben nach Priorität
- [ ] HomeScreen: Saison-Tipps Sektion
- [ ] Schnellzugriff-Leiste

### Phase 3: Segmented Control (1h)

- [ ] SegmentedControl Komponente
- [ ] PlantListScreen mit Segmented
- [ ] Tab-Wechsel Logik

### Phase 4: Learnings System (5h)

- [ ] Learnings Datenbank-Tabelle
- [ ] learningService implementieren
- [ ] Knowledge Base Integration
- [ ] Learnings UI (Cards, Bewertung)
- [ ] Manuelles Hinzufügen

### Phase 5: Task-Forms (2h)

- [ ] ZeitraumPicker Komponente
- [ ] AddTaskScreen mit Zeitraum
- [ ] EditTaskScreen mit Zeitraum
- [ ] Auto-Suggestion

### Phase 6: Testing (2h)

- [ ] Unit Tests für Services
- [ ] Integration Tests
- [ ] UI Tests

---

## 8. Zeitplan

| Phase | Aufwand | Status |
|-------|---------|--------|
| 1: Navigation | 1h | - |
| 2: HomeScreen | 4h | - |
| 3: Segmented | 1h | - |
| 4: Learnings | 5h | - |
| 5: Task-Forms | 2h | - |
| 6: Testing | 2h | - |
| **Total** | **~15h** | - |

---

## 9. Dependencies

### Neu hinzufügen:
- Keine externen Dependencies erforderlich

### Existierende Services erweitern:
- taskService
- plantService
- knowledgeService (für Learnings)

---

## 10. Error Handling

### Learnings
- KB-Artikel nicht gefunden: Fallback zu saison-basierten Defaults
- Rating fehlgeschlagen: Retry mit Exponential Backoff

### Navigation
- Tab-Wechsel während Daten-Ladung: Loading-State anzeigen
- Deep-Link zu gelöschtem Tab: Redirect zu Home

---

## 11. Testing Strategy

### Unit Tests
- zeitraumService: Saison-Berechnung, Auto-Suggestion
- learningService: CRUD Operationen
- Task-Gruppierung Logik

### Integration Tests
- Navigation zwischen Tabs
- Task erstellen mit Zeitraum
- Learnings aus KB generieren

### UI Tests
- Segmented Control Wechsel
- Task Toggle
- Learning Bewertung

---

## 12. Success Criteria

- [ ] Navigation von 7 auf 4 Tabs reduziert
- [ ] Home zeigt priorisierte Aufgaben
- [ ] Learnings werden aus KB vorgeschlagen
- [ ] Manuelle Learnings können hinzugefügt werden
- [ ] Tasks haben Zeitraum-Zuordnung
- [ ] Auto-Suggestion für Zeitraum funktioniert
- [ ] Keine Regression in bestehenden Features

---

## 13. Open Questions

1. ~~**Zeitraum-System?**~~ → **ENTSCHIEDEN: Phasen-System (Früh/Mitte/Spät)**
2. **Soll es eine Migrations-Guidance geben?** (Ja, für bestehende Nutzer)
3. **Wie viele Learnings pro Pflanze anzeigen?** (Vorschlag: max 5)
4. **Sollen Learnings auch aus Aufgaben generiert werden?** (Future Feature)

---

*Design Doc erstellt: 2026-03-20*
*Approved by: User*
