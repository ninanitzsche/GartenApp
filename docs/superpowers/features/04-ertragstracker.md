# Feature: Ertrags-Tracker mit Vergleich

> **Datum:** 2026-03-20  
> **Feature #:** 4 (von 5)  
> **Priorität:** 📊 Medium  
> **Status:** Brainstorming

---

## Problem Statement

**Aktuell:**
- Ernten werden in `harvests` Tabelle gespeichert
- Keine **aggregierte Auswertung**
- User hat **keinen Überblick** über Ertrags-Entwicklung

**Gewünscht:**
- Ertrags-**Dashboard** pro Pflanze und gesamt
- **Jahresvergleich** (2025 vs 2026)
- **Prognosen** basierend auf Trends

---

## Vision

> *"Dein persönlicher Garten-Erntebericht - mit dem du deine Erfolge messen und aus Vorjahren lernen kannst."*

---

## User Stories

### US 4.1: Ertrags-Dashboard pro Pflanze
```
Als: Gärtner
Ich möchte: Übersicht meiner Tomaten-Ernte über alle Jahre
So dass: Ich sehen kann, ob ich mich verbessere
```

### US 4.2: Jahresvergleich
```
Als: Optimierer
Ich möchte: 2025 vs 2026 Ertrag vergleichen
So dass: Ich Verbesserungen/Abschwächungen erkenne
```

### US 4.3: Ertrags-Prognose
```
Als: Planer
Ich möchte: Prognose für Rest der Saison sehen
So dass: Ich realistisch planen kann
```

### US 4.4: Leaderboard / Stats
```
Als: Motivierter Gärtner
Ich möchte: Meine Garten-Statistiken sehen
So dass: Ich motiviert bleibe und Fortschritt erkenne
```

---

## Funktionale Anforderungen

### FR 1: Ertrags-Aggregation
- [ ] Summe, Durchschnitt, Max pro Pflanze
- [ ] Pro Zeitraum: Woche, Monat, Saison, Jahr
- [ ] Trend-Anzeige (↑↓→)

### FR 2: Vergleichs-View
- [ ] Side-by-Side: Jahr 1 vs Jahr 2
- [ ] Prozentuale Veränderung
- [ ] Highlight: Bestes Jahr

### FR 3: Ertrags-Charts
- [ ] Line-Chart: Ertrag über Zeit
- [ ] Bar-Chart: Top 10 Pflanzen
- [ ] Pie-Chart: Verteilung nach Pflanzenart

### FR 4: Prognose
- [ ] Basierend auf historischen Daten
- [ ] Saisonal angepasst
- [ ] Confidence-Intervall

---

## Non-Funktionale Anforderungen

### NFR 1: Performance
- Dashboard Load < 2 Sekunden
- Caching für häufige Queries

### NFR 2: Privacy
- Keine externen Daten-Shares
- Nur eigene Daten sichtbar

---

## UI/UX Entwurf

### Wireframe: Ertrags-Dashboard (Neuer Tab)

```
┌─────────────────────────────────────────┐
│ 📊 Ertrags-Dashboard                    │
├─────────────────────────────────────────┤
│                                         │
│ 📅 Zeitraum: [2026 ▼]                  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🏆 SAISON-ÜBERSICHT                 │ │
│ │                                     │ │
│ │    45.2 kg                         │ │
│ │    Gesamternte diesen Jahr          │ │
│ │                                     │ │
│ │    ↑ +12% vs. Vorjahr              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📈 TOP 5 ERNTEN                     │ │
│ │                                     │ │
│ │ 1. 🍅 Tomaten      15.2 kg  ↑ +20% │ │
│ │ 2. 🥕 Möhren       8.5 kg   → 0%  │ │
│ │ 3. 🥒 Gurken       7.1 kg   ↑ +5%  │ │
│ │ 4. 🥬 Salat        5.8 kg   ↓ -10% │ │
│ │ 5. 🌶️ Paprika     4.2 kg   ↑ +30% │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📉 ERTRAGS-TREND                    │ │
│ │                                     │ │
│ │ kg                                 │ │
│ │ 16│    ╭─╮                        │ │
│ │ 12│ ╭──╯  ╰─╮                    │ │
│ │  8│─╯       ╰───╮                 │ │
│ │  4│              ╰──╮              │ │
│ │  0└─────────────────────────        │ │
│ │    Mrz Apr Mai Jun Jul Aug Sep     │ │
│ │                                     │ │
│ │ Prognose: 55kg (Konfidenz: 85%)   │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Wireframe: Pflanzen-Ertrag Detail

```
┌─────────────────────────────────────────┐
│ ← Ertrags-Dashboard                     │
├─────────────────────────────────────────┤
│                                         │
│ 🍅 Tomate - Ertragshistorie            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📊 SAISON 2026                      │ │
│ │                                     │ │
│ │ Gesamt: 15.2 kg                    │ │
│ │ Durchschnitt: 320g pro Ernte        │ │
│ │ Anzahl Ernten: 47                   │ │
│ │ Letzte Ernte: 18. September        │ │
│ │                                     │ │
│ │ Trend: ↑ +20% vs. Vorjahr          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📅 JAHRESVERGLEICH                 │ │
│ │                                     │ │
│ │ 2026: ████████████████ 15.2 kg    │ │
│ │ 2025: ██████████████ 12.7 kg       │ │
│ │ 2024: ████████████ 10.1 kg         │ │
│ │                                     │ │
│ │ Beste Jahr: 2026 (15.2 kg)         │ │
│ │ Verbesserung: +40% seit 2024       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📈 SAISON-PROGNOSE                 │ │
│ │                                     │ │
│ │ Basierend auf Trend:                │ │
│ │ Prognostiziert: 18-22 kg           │ │
│ │                                     │ │
│ │ Saisonal: 8 Wochen verbleibend     │ │
│ │ Geschätzter Zusatzertrag: 3-5 kg   │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Wireframe: Stats / Achievement (Optional)

```
┌─────────────────────────────────────────┐
│ 🏅 Deine Garten-Stats                   │
├─────────────────────────────────────────┤
│                                         │
│ GESAMT SEIT BEGINN                      │
│                                         │
│ 🍅 245.8 kg Tomaten geerntet            │
│ 🥕 156.3 kg Möhren geerntet            │
│ 🌶️ 89.4 kg Paprika geerntet           │
│                                     =   │
│ 🥇 BESTE ERNTE                          │
│    2.5 kg Tomaten (12. August 2025)     │
│                                     =   │
│ 📅 STREAK                               │
│    12 Wochen 연속 Ernte dokumentiert     │
│                                     =   │
│ 🌱 ANZAHL PFLANZEN                      │
│    47 verschiedene Pflanzen angebaut    │
│                                     =   │
│ 💧 PFLANZEN-TROCKEN                     │
│    156 Gießen-Erinnerungen erledigt     │
│                                     =   │
│ 🏆 LEVEL 12 - ERTRAGS-KÖNIG             │
│    ████████████░░░░░░ 72%              │
│    28kg bis Level 13                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Datenmodell

### Existing: `harvests` Tabelle (bereits vorhanden)
```sql
-- Bereits vorhanden, prüfen:
-- id, plant_id, user_id, harvest_date, quantity, unit, notes, created_at
```

### Neue Tabelle: `harvest_stats` (Cache)
```sql
CREATE TABLE harvest_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plant_id UUID REFERENCES plants(id),
  
  -- Zeitraum
  year INT NOT NULL,
  month INT,
  
  -- Aggregierte Stats
  total_quantity DECIMAL(10,2),
  avg_quantity DECIMAL(10,2),
  harvest_count INT,
  first_harvest DATE,
  last_harvest DATE,
  
  -- Vergleich
  previous_year_total DECIMAL(10,2),
  percentage_change DECIMAL(5,2),
  
  -- Metadaten
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, plant_id, year, month)
);
```

### Neue Tabelle: `garden_achievements`
```sql
CREATE TABLE garden_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  achievement_type TEXT NOT NULL, -- 'harvest_streak', 'total_yield', 'plant_diversity'
  value DECIMAL(10,2),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_type)
);
```

---

## Aufwandsschätzung

| Task | Aufwand | Komplexität |
|------|---------|-------------|
| Backend: Harvest-Aggregation | 4h | Medium |
| Backend: Stats-Cache | 3h | Medium |
| Frontend: Dashboard mit Charts | 8h | High |
| Frontend: Pflanzen-Detail | 4h | Medium |
| Frontend: Vergleichs-View | 4h | Medium |
| Prognose-Algorithmus | 6h | High |
| **Gesamt** | **~29h** | |

---

## Akzeptanzkriterien

### AC 1: Dashboard
```
GIVEN: User hat 10+ Ernten dokumentiert
WHEN: Ertrags-Dashboard geladen wird
THEN: Top 5 Pflanzen mit Trends angezeigt
AND: Gesamternte mit Vorjahresvergleich
```

### AC 2: Pflanzen-Detail
```
GIVEN: User öffnet Detail für Tomate
WHEN: Seite lädt
THEN: Jahresvergleich 2024/2025/2026 angezeigt
AND: Trend-Prognose für Rest der Saison
```

### AC 3: Prognose-Genauigkeit
```
GIVEN: Es ist August, Prognose zeigt 18kg Tomaten
WHEN: Saison endet im September
THEN: Tatsächlicher Ertrag ist zwischen 15-21kg (in 85% der Fälle)
```

---

## Abhängigkeiten

- Existing: harvests Tabelle, PlantDetailScreen
- Existing: harvestService
- New: harvest_stats Tabelle
- Optional: Charting Library (react-native-chart-kit)

---

## Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Zu wenige Daten für Prognose | Medium | Medium | Klare Messaging wenn < 2 Jahre |
| Chart-Performance | Low | Medium | Lazy Loading, Virtualisierung |
| Einheiten-Inkonsistenz | High | High | Normalisierung in Backend |

---

## Synergien mit anderen Features

- **Feature #3:** Mischkultur beeinflusst Ertrags-Daten
- **Feature #5:** Timeline zeigt Ernte-Historie
- **Gamification:** Achievements aus Ertrags-Daten

---

*Nächste Phase: Technical Design → Aggregation-Logik → Implementation*
