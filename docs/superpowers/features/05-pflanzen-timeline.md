# Feature: Pflanzen-Timeline

> **Datum:** 2026-03-20  
> **Feature #:** 5 (von 5)  
> **Priorität:** 📊 Medium  
> **Status:** Brainstorming

---

## Problem Statement

**Aktuell:**
- User sieht **keinen klaren Überblick** über Pflanzen-Lebenszyklus
- Keine **visuelle Zeitleiste**
- Status-Änderungen sind **diskret**, nicht verlaufend

**Gewünscht:**
- Visuelle Timeline pro Pflanze
- Alle Events auf einen Blick
- Animierte Übergänge zwischen Phasen

---

## Vision

> *"Eine lebendige Zeitreise durch das Leben jeder Pflanze - von der Aussaat bis zur letzten Ernte."*

---

## User Stories

### US 5.1: Lebenszyklus-Visualisierung
```
Als: Gärtner
Ich möchte: Timeline meiner Pflanze sehen
So dass: Ich weiß, was als nächstes kommt
```

### US 5.2: Alle Events auf einen Blick
```
Als: Reviewer
Ich möchte: Alle Fotos, Ernten, Pflege-Events in einer Timeline
So dass: Ich die Geschichte der Pflanze verstehe
```

### US 5.3: Phase-Übergang Animation
```
Als: Gärtner
Ich möchte: Animation sehen wenn Pflanze in neue Phase kommt
So dass: Das Erfolgserlebnis verstärkt wird
```

### US 5.4: Vergleichbare Zeitleiste
```
Als: Analytiker
Ich möchte: Timeline mehrerer Pflanzen vergleichen
So dass: Ich Muster erkenne
```

---

## Funktionale Anforderungen

### FR 1: Timeline-Komponente
- [ ] Vertikale Timeline mit Events
- [ ] Event-Typen: Foto, Ernte, Pflege, Statusänderung
- [ ] Infinite Scroll für lange Histories

### FR 2: Pflanzen-Phasen
- [ ] Phase-Indikator (Keimung → Wachstum → Blüte → Frucht → Ernte)
- [ ] Fortschritts-Balken
- [ ] Erwartete Dauer pro Phase

### FR 3: Event-Timeline
- [ ] Chronologische Liste aller Events
- [ ] Gruppierung nach Monat/Jahr
- [ ] Filter nach Event-Typ

### FR 4: Animation & UI
- [ ] Smooth Scroll Animation
- [ ] Phase-Übergang Animation
- [ ] Pull-to-refresh

---

## Non-Funktionale Anforderungen

### NFR 1: Performance
- Timeline Load < 1 Sekunde für 100 Events
- Lazy Loading für Bilder
- Virtualisierung für lange Listen

### NFR 2: Mobile-Optimiert
- Touch-friendly Timeline
- Responsive Layout
- Offline-fähig

---

## UI/UX Entwurf

### Wireframe: Pflanzen-Timeline (PlantDetailScreen Tab)

```
┌─────────────────────────────────────────┐
│ 🍅 Tomate "Oma's Liebling"              │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🌱 LEBENSPHASE                      │ │
│ │                                     │ │
│ │ ●───●───●═══●═══●═══●───○          │ │
│ │     │   │   │   │   │   │          │ │
│ │  Aussaat Keimung Wachstum Blüte Frucht│ │
│ │                                     │ │
│ │ Aktuell: Frucht-Phase              │ │
│ │ Fortschritt: 65%                   │ │
│ │                                     │ │
│ │ 📅 Geschätzte Ernte: ~3 Wochen     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Timeline] [Fotos] [Ernten] [Info]    │ ← Tabs
│                                         │
│ ╎ 18. September 2026                    │
│ ╎ ┌─────────────────────────────────┐   │
│ ╎ │ 📸 Neues Foto                   │   │
│ ╎ │ [Bild-Thumbnail]                │   │
│ ╎ │ "Erste reife Tomate!"          │   │
│ ╎ └─────────────────────────────────┘   │
│ ╎                                      │
│ ╎ 15. September 2026                    │
│ ╎ ┌─────────────────────────────────┐   │
│ ╎ │ 🌡️ Erntemenge erfasst         │   │
│ ╎ │ 320g geerntet                  │   │
│ ╎ └─────────────────────────────────┘   │
│ ╎                                      │
│ ╎ 10. September 2026                    │
│ ╎ ┌─────────────────────────────────┐   │
│ ╎ │ ⭐ Status: "Frucht"           │   │
│ ╎ │ Erste Blüten zeigen Früchte    │   │
│ ╎ └─────────────────────────────────┘   │
│ ╎                                      │
│ ╎ 01. August 2026                       │
│ ╎ ┌─────────────────────────────────┐   │
│ ╎ │ 💧 Gießen                       │   │
│ ╎ │ 2. Gießen diese Woche          │   │
│ ╎ └─────────────────────────────────┘   │
│ ╎                                      │
│ ╎ 20. Juni 2026                         │
│ ╎ ┌─────────────────────────────────┐   │
│ ╎ │ 🌱 Ausgepflanzt                 │   │
│ ╎ │ ins Hochbeet #2                │   │
│ ╎ │ [Foto vom Tag]                 │   │
│ ╎ └─────────────────────────────────┘   │
│ :                                      │
│ ╎ 01. März 2026                         │
│ ╎ ┌─────────────────────────────────┐   │
│ ╎ │ 🌱 Gekeimt!                     │   │
│ ╎ │ [Zeitraffer-Foto]              │   │
│ ╎ └─────────────────────────────────┘   │
│ ╎                                      │
│ ╎ 15. Februar 2026                      │
│ ╎ ┌─────────────────────────────────┐   │
│ ╎ │ 🫘 Ausgesät                     │   │
│ ╎ │ Vorkultur gestartet             │   │
│ ╎ └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Wireframe: Multi-Plant Vergleich

```
┌─────────────────────────────────────────┐
│ 📊 Pflanzen-Vergleich                   │
├─────────────────────────────────────────┤
│                                         │
│ Pflanzen auswählen:                     │
│ ☑ Tomate  ☑ Gurke  ☐ Möhre           │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ VERGLEICH: AUSSATZ BIS ERNTE       │ │
│ │                                     │ │
│ │ Mrz ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░  │ │
│ │     ░░▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░  │ │
│ │ Apr ░░░░░▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░  │ │
│ │     ░░░░░░░░░▓▓▓▓▓▓▓▓▓▓░░░░░░░░░  │ │
│ │ Mai ░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓░░░░  │ │
│ │     ░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓  │ │
│ │ Jun ░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓  │ │
│ │     ░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓  │ │
│ │                                     │ │
│ │ ▓ Tomate (Aussaat Feb)            │ │
│ │ ░ Gurke (Direktsaat Mai)           │ │
│ │                                     │ │
│ │ Erkenntnis: Tomaten brauchen 2     │ │
│ │ Monate Vorlauf                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Wireframe: Phase-Animation

```
┌─────────────────────────────────────────┐
│ 🎉 NEUE PHASE!                          │
├─────────────────────────────────────────┤
│                                         │
│        ╔═══════════════════╗          │
│        ║                   ║          │
│        ║   🌸 → 🍅         ║          │
│        ║                   ║          │
│        ║   BLÜTE → FRUCHT ║          │
│        ║                   ║          │
│        ╚═══════════════════╝          │
│                                         │
│ Deine Tomate ist jetzt in der          │
│ Frucht-Phase!                          │
│                                         │
│ 💡 Tipp: Jetzt regelmäßig düngen     │
│    für beste Früchte                   │
│                                         │
│              [Weiter]                   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Datenmodell

### Neue Tabelle: `plant_events`
```sql
CREATE TABLE plant_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plant_id UUID REFERENCES plants(id) NOT NULL,
  
  event_type TEXT NOT NULL, -- 'photo', 'harvest', 'care', 'status_change', 'note'
  
  -- Event Data
  event_data JSONB, -- { photo_url, harvest_quantity, care_type, new_status }
  
  -- Timestamps
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Timeline-Queries
CREATE INDEX idx_plant_events_plant_id_date 
ON plant_events(plant_id, event_date DESC);
```

### Phase Enum:
```typescript
enum PlantPhase {
  SEED = 'seed',
  GERMINATION = 'germination',
  SEEDLING = 'seedling',
  VEGETATIVE = 'vegetative',
  FLOWERING = 'flowering',
  FRUITING = 'fruiting',
  HARVEST = 'harvest',
  DORMANT = 'dormant',
  ENDED = 'ended'
}
```

---

## Aufwandsschätzung

| Task | Aufwand | Komplexität |
|------|---------|-------------|
| Backend: plant_events Tabelle | 3h | Low |
| Service: Event-Aggregation | 4h | Medium |
| Komponente: Timeline-UI | 8h | High |
| Komponente: Phase-Indikator | 4h | Medium |
| Animation: Phase-Übergang | 4h | High |
| Frontend: Multi-Plant Vergleich | 6h | High |
| **Gesamt** | **~29h** | |

---

## Akzeptanzkriterien

### AC 1: Timeline laden
```
GIVEN: User öffnet Pflanzen-Tab
WHEN: Seite lädt
THEN: Timeline mit neuesten Events zuerst
AND: Phase-Indikator oben sichtbar
```

### AC 2: Event-Anzeige
```
GIVEN: Pflanze hat 10+ Events
WHEN: Timeline gerendert wird
THEN: Alle Events chronologisch angezeigt
AND: Fotos lazy-loaded
```

### AC 3: Phase-Animation
```
GIVEN: Pflanze wechselt von Blüte zu Frucht
WHEN: Status-Update erfasst wird
THEN: Animation wird angezeigt
AND: User kann "Weiter" klicken
```

---

## Abhängigkeiten

- Existing: PlantDetailScreen
- Existing: Status-Historie (plant_status_history?)
- New: plant_events Tabelle
- Existing: Photo-Service

---

## Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Performance bei vielen Events | Medium | Medium | Virtualisierung |
| Doppelte Events (Harvest + Care) | Low | Low | Dedup-Logik |
| Animation-Battery | Low | Low | Deaktivieren-Option |

---

## Synergien mit anderen Features

- **Feature #1:** Care-Events in Timeline
- **Feature #2:** Saison-Phasen in Timeline
- **Feature #3:** Mischkultur-Events
- **Feature #4:** Ernte-Events

---

## Implementierungs-Reihenfolge

1. Timeline-Komponente (universell nutzbar)
2. plant_events Tabelle
3. Event-Erfassung im Background
4. Phase-Indikator
5. Phase-Animation
6. Multi-Plant Vergleich

---

*Nächste Phase: Technical Design → Komponenten-Spezifikation → Implementation*
