# Feature: Saison-Planer Dashboard

> **Datum:** 2026-03-20  
> **Feature #:** 2 (von 5)  
> **Priorität:** 🔥 High  
> **Status:** Brainstorming

---

## Problem Statement

**Aktuell:**
- User weiß nicht **was sie wann pflanzen** sollen
- Saison-Informationen sind **verstreut** oder nicht vorhanden
- **Entscheidungs-Müdigkeit** bei Anfängern

**Gewünscht:**
- Klare Übersicht: **"Was pflanze ich jetzt?"**
- Kalender-basierte Planung
- Region-/Klima-Anpassung

---

## Vision

> *"Dein persönlicher Gartenkalender - genau richtig für dein Klima und deine Region."*

---

## User Stories

### US 2.1: Was kann ich jetzt pflanzen?
```
Als: Hobby-Gärtner
Ich möchte: Eine Liste von Pflanzen sehen, die ich JETZT säen/pflanzen kann
So dass: Ich nicht den optimalen Zeitpunkt verpasse
```

### US 2.2: Pflanzkalender pro Pflanze
```
Als: Anfänger
Ich möchte: Sehen wann ich meine Tomaten säen und auspflanzen soll
So dass: Ich nichts falsch mache
```

### US 2.3: Zeitraum-Empfehlung
```
Als: Gärtner
Ich möchte: Meine Pflanzen nach optimalen Pflanzzeiten sortiert sehen
So dass: Ich den Überblick behalte
```

### US 2.4: Region-Anpassung
```
Als: Gärtner in Zone 7a
Ich möchte: Nur für meine Zone relevante Empfehlungen sehen
So dass: Kalte-/Warme-Sorten korrekt angezeigt werden
```

---

## Funktionale Anforderungen

### FR 1: Pflanzen-Kalender
- [ ] Übersicht: Aussaat → Vorkultur → Auspflanzung → Ernte
- [ ] Pro Pflanze: Optimaler Zeitraum mit Zeitraum-Tolerance
- [ ] Filter nach: Aktuelle Woche, Nächste 4 Wochen, Diese Saison

### FR 2: "Jetzt Pflanzbare" Liste
- [ ] Liste aller Pflanzen, die jetzt gesät werden können
- [ ] Sortierung nach: Einfachheit, Beliebtheit, Zeit bis Ernte
- [ ] Quick-Action: Pflanze zur Liste hinzufügen

### FR 3: Region/Klima-Integration
- [ ] USDA Winterhärte-Zonen (oder ISSUU-Länder equivalents)
- [ ] Letzter Frost / Erster Frost Datum
- [ ] Automatische Anpassung der Zeitraeume

### FR 4: Pflanzzeit-Erinnerung
- [ ] Benachrichtigung: "Zeit Tomaten vorzuziehen!"
- [ ] 2 Wochen Vorlauf für Vorkultur
- [ ] Integriert mit Feature #1 (Pflege-Erinnerungen)

---

## Non-Funktionale Anforderungen

### NFR 1: Datenqualität
- Mindestens 50 häufige Gemüse/Salate mit Kalenderdaten
- Quellenangabe für Kalenderdaten

### NFR 2: Performance
- Initial Load < 1 Sekunde
- Kein API-Call für Kalender (statische Daten)

### NFR 3: Offline
- Kalender muss offline funktionieren
- Region-Auswahl muss offline sein

---

## Technische Überlegungen

### Datenquelle Optionen:

| Option | Quelle | Kosten | Qualität |
|--------|--------|--------|----------|
| A | Lokale DB (CSV/JSON) | Kostenlos | ★★★ |
| B | OpenFarm API | Kostenlos | ★★☆ |
| C | Custom API (Perplexity) | €€ | ★★★ |

### Empfehlung: **Option A** (Hybrid)
- Kern-Gemüse: Lokale JSON-Datei
- Erweiterung: OpenFarm als Backup

---

## UI/UX Entwurf

### Wireframe: Saison-Planer (Neuer Tab)

```
┌─────────────────────────────────────────┐
│ 🌱 Saison-Planer                        │
├─────────────────────────────────────────┤
│                                         │
│ 📅 MÄRZ 2026                           │
│ KW 12 | Letzter Frost: ~15. April      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔴 JETZT SÄEN                       │ │
│ │                                     │ │
│ │ • Radieschen (5 min)               │ │
│ │ • Spinat (7-14 Tage)              │ │
│ │ • Salat (8-12 Wochen)             │ │
│ │                                     │ │
│ │ [+ Alle säen]                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🟡 APRIL VORBEREITEN                │ │
│ │                                     │ │
│ │ • Tomaten (Vorkultur)              │ │
│ │ • Paprika (Vorkultur)              │ │
│ │ • Zucchini (Direktsaat ab Mai)    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🟢 INDOOR BEREITS VORBEREITET      │ │
│ │                                     │ │
│ │ • Chili (3 Wochen alt)            │ │
│ │ • Basilikum (2 Wochen alt)        │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Wireframe: Pflanzkalender pro Pflanze

```
┌─────────────────────────────────────────┐
│ ← Zurück                                  │
├─────────────────────────────────────────┤
│                                         │
│ 🍅 Tomate                                 │
│ Solanum lycopersicum                     │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📅 PFLANZKALENDER                   │ │
│ │                                     │ │
│ │ Feb  🟦🟦🟦🟦🟦🟦 [Vorkultur]     │ │
│ │ Mrz  [🟦][🟦][🟦][🟦] [Aussaat]   │ │
│ │ Apr  [🟦][🟦][🟦][🟦] [Auspflanz]  │ │
│ │ Mai  [🟦][🟦][🟦][🟦][🟦][🟦]     │ │
│ │ Jun  ████🟩🟩🟩🟩 ████ [Ernte]   │ │
│ │ Jul  ████████████[🟩🟩🟩][🟩]     │ │
│ │ Aug  ████████[🟩🟩] ████         │ │
│ │ Sep  [🟩][🟩] ████               │ │
│ │                                     │ │
│ │ 🟦 = Vor dir   ████ = Vergangen   │ │
│ │ 🟩 = Jetzt     [ ] = Optional     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ⏱️ Von Aussaat bis Ernte: 60-80 Tage   │
│ 🌡️ Mindesttemperatur: 15°C             │
│ ☀️ Standort: Vollsonne                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Datenmodell

### Neue Tabelle: `planting_calendar`
```sql
CREATE TABLE planting_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name TEXT NOT NULL, -- 'Tomate', 'Möhre'
  latin_name TEXT,
  
  -- Vorkultur (indoor)
  pre_cultivation_start DATE,
  pre_cultivation_end DATE,
  
  -- Direktsaat
  direct_sowing_start DATE,
  direct_sowing_end DATE,
  
  -- Auspflanzung (nach draußen)
  transplant_start DATE,
  transplant_end DATE,
  
  -- Ernte
  harvest_start DATE,
  harvest_end DATE,
  
  -- Metadaten
  days_to_harvest_min INT,
  days_to_harvest_max INT,
  min_temperature_c INT,
  sunlight TEXT, -- 'full', 'partial', 'shade'
  difficulty TEXT, -- 'easy', 'medium', 'hard'
  
  -- Region-Anpassung (JSON)
  zone_adjustments JSONB, -- { "zone_6": { transplant_start: "2026-05-01" } }
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Sample Data (Deutschland Zonen 6-8):
```json
{
  "plant_name": "Tomate",
  "latin_name": "Solanum lycopersicum",
  "pre_cultivation_start": "02-15",
  "pre_cultivation_end": "03-31",
  "transplant_start": "05-15",
  "transplant_end": "06-15",
  "harvest_start": "07-15",
  "harvest_end": "09-30",
  "days_to_harvest_min": 60,
  "days_to_harvest_max": 90,
  "min_temperature_c": 15,
  "sunlight": "full",
  "difficulty": "medium"
}
```

---

## Aufwandsschätzung

| Task | Aufwand | Komplexität |
|------|---------|-------------|
| Kalender-Datenbank erstellen (50+ Pflanzen) | 8h | Low |
| Frontend: Saison-Planer Dashboard | 6h | Medium |
| Frontend: Pflanzkalender pro Pflanze | 4h | Medium |
| Region/Zonen-Integration | 4h | Medium |
| Erinnerungs-Integration | 3h | Low |
| **Gesamt** | **~25h** | |

---

## Akzeptanzkriterien

### AC 1: Jetzt-Pflanzbare
```
GIVEN: User öffnet Saison-Planer am 20. März
WHEN: Kalender wird geladen
THEN: Liste zeigt Radieschen, Spinat, Salat als "Jetzt säen"
AND: Tomaten zeigt "Vorkultur" oder "April"
```

### AC 2: Region-Anpassung
```
GIVEN: User hat Zone 6 (kalt) ausgewählt
WHEN: Pflanzkalender geladen wird
THEN: Alle Daten sind um 2-3 Wochen später als Zone 8
```

### AC 3: Pflanzkalender Visualisierung
```
GIVEN: User öffnet Pflanzkalender für Tomate
WHEN: Kalender gerendert wird
THEN: Klar visualisiert: Vorkultur → Auspflanzung → Ernte
```

---

## Abhängigkeiten

- Existing: PlantDetailScreen (für Kalender-Integration)
- New: planting_calendar Tabelle
- Optional: Weather-API (für regionale Frost-Daten)

---

## Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Datenqualität | Medium | High | Manual Review |
| Zone-Daten nicht verfügbar | Low | Medium | Fallback auf "gemäßigt" |
| User-Verwirrung bei Kalender | Medium | Medium | Tooltips & Help |

---

## Synergien mit anderen Features

- **Feature #1:** Erinnerungen für Aussaht-Zeitpunkte
- **Feature #3:** Mischkultur passt sich an Saison an
- **Feature #5:** Timeline zeigt Saison-Phasen

---

*Nächste Phase: Technical Design → Datenbank-Schema → Implementation*
