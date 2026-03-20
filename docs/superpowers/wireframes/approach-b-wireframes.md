# Approach B Wireframes - Konsolidiertes Tab-Design (FINAL v3)

## User Feedback integriert

> "Keine 'Heute/Morgen'-Labels, stattdessen Zeiträume + Priorisierung. Die Natur funktioniert nicht nach Kalendertagen."

---

## Zeiträume & Phasen

### Zeitraum-Definitionen mit Phasen

```
┌─────────────────────────────────────────────────────────────┐
│ Zeitraum-Struktur: Jahreszeit + Phase                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌱 FRÜHJAHR                                                │
│  ├── 🌰 FRÜH (Feb-Mär)  → Radieschen, Spinat, Erbsen      │
│  ├── 🌿 MITTE (Apr-Mai)  → Salate, Kohlrabi                │
│  └── 🌸 SPÄT (Mai-Jun)   → Tomaten-Vorkultur              │
│                                                             │
│  ☀️ SOMMER                                                  │
│  ├── 🔥 FRÜH (Jun-Jul)  → Auspflanzen, Giessen            │
│  ├── 🌡️ MITTE (Jul)      → Haupternte, Pflege              │
│  └── 🍂 SPÄT (Aug)       → Letzte Ernten, Folientunnel     │
│                                                             │
│  🍂 HERBST                                                  │
│  ├── 🍁 FRÜH (Sep-Okt)   → Haupternte, Samen sammeln       │
│  ├── 🍃 MITTE (Okt-Nov)  → Bodenpflege, Kompost           │
│  └── ❄️ SPÄT (Nov)       → Wintervorbereitung              │
│                                                             │
│  ❄️ WINTER                                                  │
│  ├── 🎄 FRÜH (Dez-Jan)   → Planung, Kataloge wälzen        │
│  ├── 📋 MITTE (Jan-Feb)  → Bestellungen, Vorzucht          │
│  └── 🌱 SPÄT (Feb-Mär)    → Anzucht starten                │
│                                                             │
│  📅 DIESE WOCHE     → Kurzfristig, dringend                │
│  ⚪ FLEXIBEL        → Kein Zeitraum                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
┌─────────────────────────────────────────────────────────────┐
│ Zeitraum-Logik                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌱 FRÜHJAHR (März - Mai)                                    │
│     → Aussaat, Anzucht, Vorbereitung                       │
│                                                             │
│  ☀️ SOMMER (Juni - August)                                   │
│     → Pflege, Bewässerung, Ernte (Früh)                     │
│                                                             │
│  🍂 HERBST (September - November)                            │
│     → Haupternte, Vorbereitung Winter                       │
│                                                             │
│  ❄️ WINTER (Dezember - Februar)                              │
│     → Planung, Bestellung, Ruhephase                        │
│                                                             │
│  📅 DIESE SAISON                                             │
│     → Aktuelle Saison-basierte Aufgaben                     │
│                                                             │
│  ⚡ DIESE WOCHE                                             │
│     → Kurzfristige, dringende Aufgaben                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Aufgaben-Sortierung nach Zeitraum

```
Home Tab - Aufgaben nach Zeiträumen sortiert:

┌─────────────────────────────────────────────────────────────┐
│  🏠 Home                                    🔍 Suchen       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Aufgaben nach Priorität & Zeitraum                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 HOCH                                               │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ ☐ Tomaten giessen                                     │   │
│  │    Standort: Beet #3 • Zeitraum: Sommer              │   │
│  │                                                     │   │
│  │ ☐ Gurken düngen                                       │   │
│  │    Standort: Beet #1 • Zeitraum: Sommer              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟡 MITTEL                                             │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ ☐ Samen bestellen                                     │   │
│  │    Zeitraum: Herbst • Kategorie: Bestellung         │   │
│  │                                                     │   │
│  │ ☐ Boden verbessern                                    │   │
│  │    Standort: Beet #2 • Zeitraum: Winter             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 NIEDRIG                                            │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ ☐ Gartengeräte reinigen                               │   │
│  │    Zeitraum: Winter                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📋 SAISON-AUFGABEN                                     │   │
│  │ (Aktuell: Sommer)                                     │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ ☐ Regelmäßig giessen (täglich)                       │   │
│  │ ☐ Unkraut jäten                                      │   │
│  │ ☐ Schädlinge kontrollieren                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Zeitraum-Matching für Learnings

```
┌─────────────────────────────────────────────────────────────┐
│ Zeitraum → Learnings-Matching                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌱 FRÜHJAHR                                               │
│     → Aussaat-Tipps, Anzucht, Keimung                     │
│     → "Tomaten aussäen: 2cm tief, 50cm Abstand"            │
│                                                             │
│  ☀️ SOMMER                                                 │
│     → Bewässerungs-Tipps, Hitzeschutz                      │
│     → "Bei Hitze morgens und abends giessen"              │
│                                                             │
│  🍂 HERBST                                                 │
│     → Erntezeitpunkt, Lagerung                             │
│     → "Tomaten vor Frost ernten"                           │
│                                                             │
│  ❄️ WINTER                                                 │
│     → Planung, Bodenverbesserung                            │
│     → "Kompost einarbeiten für nächste Saison"             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Task-Zeiträume (Datenmodell)

```typescript
enum Zeitraum {
  FRUEHJAHR = 'fruehjahr',
  SOMMER = 'sommer', 
  HERBST = 'herbst',
  WINTER = 'winter',
  SAISON = 'saison',      // Wiederkehrend pro Saison
  DIESE_WOCHE = 'diese_woche',  // Kurzfristig
  FLEXIBEL = 'flexibel',  // Kein Zeitraum
}

enum Prioritaet {
  HOCH = 'hoch',
  MITTEL = 'mittel',
  NIEDRIG = 'niedrig',
}

interface Task {
  id: string;
  title: string;
  zeitraum: Zeitraum;
  prioritaet: Prioritaet;
  kategorie: string;
  due_date?: string;       // Optional, für "diese Woche"
  completed_at?: string;
}
```

---

## Home Tab Layout (Final)

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Home                                    🔍 Suchen       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Guten Morgen! Es ist Sommer.                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Aufgaben nach Priorität                          │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │                                                     │   │
│  │ 🟡 Hohe Priorität                                  │   │
│  │   ☐ Tomaten giessen                    ☀️ Sommer  │   │
│  │   ☐ Gurken düngen                      ☀️ Sommer  │   │
│  │                                                     │   │
│  │ 🟡 Mittlere Priorität                             │   │
│  │   ☐ Samen bestellen                    🍂 Herbst  │   │
│  │                                                     │   │
│  │ 🟢 Niedrige Priorität                             │   │
│  │   ☐ Gartengeräte reinigen              ❄️ Winter  │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🌱 Saison-Tipps (Sommer)                            │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │                                                     │   │
│  │ 💡 Tomaten brauchen viel Wasser                     │   │
│  │    Täglich giessen bei Hitze                        │   │
│  │    💡 [Nützlich]  👎 [Nicht nützlich]             │   │
│  │                                                     │   │
│  │ 💡 Gurken mögen Mulch                              │   │
│  │    Hält Feuchtigkeit im Boden                       │   │
│  │    💡 [Nützlich]  👎 [Nicht nützlich]             │   │
│  │                                                     │   │
│  │ [+ Eigenes Learning hinzufügen]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⚡ Schnellzugriff                                    │   │
│  │ [➕ Neue Aufgabe]  [🛒 Einkauf]  [📷 Foto]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## PlantDetail: Zeitraum-Bewusstsein

```
┌─────────────────────────────────────────────────────────────┐
│  🍅 Tomaten                                    [Bearbeiten]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Status: Ausgepflanzt • Standort: Beet #3                  │
│  Saison-Status: ☀️ Sommer                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Aktuelle Aufgaben (Sommer)                       │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ ☐ Giessen (täglich)              🔴 HOCH          │   │
│  │ ☐ Düngen (wöchentlich)           🟡 MITTEL        │   │
│  │ [+ Aufgabe hinzufügen]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📋 Geplante Aufgaben (Herbst)                       │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ ☐ Erntezeitpunkt-Prüfung      🍂 Herbst           │   │
│  │ ☐ Samen für nächstes Jahr     🍂 Herbst           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💡 Learnings                                          │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │                                                     │   │
│  │ 💡 Brauchen viel Wasser (Saison-Tipp)              │   │
│  │    Täglich giessen, besonders bei Hitze              │   │
│  │    💡 [Nützlich]  👎 [Nicht nützlich]             │   │
│  │                                                     │   │
│  │ 💡 Regelmäßig ausgeizen                             │   │
│  │    Seitentriebe für bessere Frucht                  │   │
│  │    💡 [Nützlich]  👎 [Nicht nützlich]             │   │
│  │                                                     │   │
│  │ [+ Eigenes Learning hinzufügen]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Task-Erstellung mit Zeitraum

```
┌─────────────────────────────────────────────────────────────┐
│  Neue Aufgabe                                    [Abbrechen]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Titel:                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tomaten giessen                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Priorität:                                                │
│  ┌────────┬────────┬────────┐                             │
│  │ 🔴 HOCH │ 🟡 MITTEL│ 🟢 NIEDRIG│                     │
│  └────────┴────────┴────────┘                             │
│                                                             │
│  Zeitraum:                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [☀️ Sommer]  [🍂 Herbst]  [❄️ Winter]  [🌱 Frühjahr]│   │
│  │                                                     │   │
│  │ [📅 Diese Woche]  [🔄 Saison]  [⚪ Flexibel]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Kategorie:                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Aussaat] [Pflanzen] [Gartenarbeiten] [Ernten]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Standort (optional):                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Beet #1] [Beet #2] [Beet #3] [+ Neues Beet]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Verbundene Pflanzen:                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🍅 Tomaten (bereits ausgewählt)              [×]   │   │
│  │ [＋ Weitere Pflanze hinzufügen]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                         [💾 Speichern]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Zeitraum-Erkennung (Auto-Suggestion)

```typescript
// Automatische Zeitraum-Vorschläge basierend auf:
function suggestZeitraum(
  kategorie: string,
  plantName?: string,
  season?: Season
): Zeitraum {
  
  // Pflanzen-spezifische Zeiträume
  const plantZeitraeume: Record<string, Zeitraum> = {
    'Tomate': 'sommer',
    'Gurke': 'sommer', 
    'Kürbis': 'herbst',
    'Knoblauch': 'winter',
    // ...
  };
  
  // Kategorie-basierte Zeiträume
  const kategorieZeitraeume: Record<string, Zeitraum> = {
    'Aussaat': 'fruehjahr',
    'Ernten': 'herbst',
    'Bodenpflege': 'winter',
    'Bewässerung': 'sommer',
    // ...
  };
  
  // Logik:
  if (plantName && plantZeitraeume[plantName]) {
    return plantZeitraeume[plantName];
  }
  
  if (kategorieZeitraeume[kategorie]) {
    return kategorieZeitraeume[kategorie];
  }
  
  // Fallback: Aktuelle Saison
  return getCurrentSeason();
}
```

---

## Finales Tab-Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HOME              Plants      Photos (Garden)    Mehr       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  4 Tabs:                                                    │
│  ┌────────┬────────┬─────────┬────────┐                    │
│  │  🏠   │  🌱   │   📷   │   ☰   │                    │
│  │ Home   │ Plants │ Photos  │ More   │                    │
│  └────────┴────────┴─────────┴────────┘                    │
│                                                             │
│  Home = Dashboard + Priorisierte Aufgaben + Saison-Tipps    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Zeitplan (Final)

| Phase | Aufwand | Inhalt |
|-------|---------|--------|
| 1a | 1h | TabNavigator: Photos → Garden verschieben |
| 1b | 2h | HomeScreen: Priorisierte Aufgaben + Zeitraum-Gruppen |
| 1c | 1h | Segmented Control in PlantList |
| 1d | 2h | Learnings-Service (KB-Integration + Saison-Matching) |
| 1e | 1h | Learnings UI (manuell, bewerten, Zeitraum-Tipps) |
| 1f | 2h | Task-Zeitraum-Auswahl in Forms |
| 2 | 2h | Testing + Bugfixes |
| **Total** | **~11h** | |

---

## Features (Final)

| Feature | Beschreibung |
|---------|--------------|
| **Priorisierte Aufgaben** | 🔴HOCH 🟡MITTEL 🟢NIEDRIG |
| **Zeiträume** | 🌱☀️🍂❄️ + Saison + Diese Woche + Flexibel |
| **Saison-Tipps** | Learnings basierend auf aktueller Jahreszeit |
| **Auto-Zeitraum** | Vorschlag basierend auf Pflanze/Kategorie |

---

*Wireframe Final v3: 2026-03-20*
