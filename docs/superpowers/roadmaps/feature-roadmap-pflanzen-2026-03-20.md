# Feature Roadmap: Pflanzen-Features

> **Datum:** 2026-03-20  
> **Fokus:** Neue Features für Pflanzen-Modul  
> **Anzahl Features:** 5

---

## Übersicht

| # | Feature | Priorität | Aufwand | Synergien |
|---|---------|-----------|---------|-----------|
| 1 | Intelligente Pflege-Erinnerungen | 🔥 High | ~25h | #2, #5 |
| 2 | Saison-Planer Dashboard | 🔥 High | ~25h | #1, #3 |
| 3 | Mischkultur-Automat | 📊 Medium | ~35h | #2, #4 |
| 4 | Ertrags-Tracker | 📊 Medium | ~29h | #3, #5 |
| 5 | Pflanzen-Timeline | 📊 Medium | ~29h | #1, #4 |

**Gesamt-Aufwand:** ~143h

---

## Abhängigkeiten

```
┌─────────────────────────────────────────────────────┐
│                    FEATURE-MAP                       │
│                                                      │
│     Feature #2 ──┬── Feature #3 ──┐                │
│     (Saison)    │  (Mischkultur) │                │
│         │       │       │        │                │
│         └───────┴───────┼────────┘                │
│                         │                           │
│                    Feature #1                       │
│               (Pflege-Erinnerungen)                │
│                         │                           │
│         ┌───────────────┴───────────────┐           │
│         │                               │           │
│    Feature #5                    Feature #4         │
│   (Pflanzen-Timeline)           (Ertrags-Tracker)   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Implementierungs-Phasen

### Phase 1: Foundation (Feature #2 + #5)
**Aufwand:** ~54h

| Feature | Tasks |
|---------|-------|
| **#2 Saison-Planer** | Kalender-DB, Dashboard, Pflanzkalender |
| **#5 Timeline** | plant_events Tabelle, Timeline-Komponente |

**Warum zuerst?**
- Datenbank-Erweiterungen, die andere Features nutzen
- Visuelle Komponenten für UI-Konsistenz

---

### Phase 2: Intelligence (Feature #1 + #3)
**Aufwand:** ~60h

| Feature | Tasks |
|---------|-------|
| **#1 Erinnerungen** | Wetter-API, Backend-Engine, Notifications |
| **#3 Mischkultur-Automat** | Optimierungs-Algorithmus, Conflict Detection |

**Warum?**
- Braucht Feature #2 (Saison-Daten)
- Komplexe Backend-Logik

---

### Phase 3: Analytics (Feature #4)
**Aufwand:** ~29h

| Feature | Tasks |
|---------|-------|
| **#4 Ertrags-Tracker** | Aggregation, Charts, Prognose |

**Warum zuletzt?**
- Braucht viele historische Daten
- Basiert auf bestehender harvests Tabelle

---

## Priorisierungs-Matrix

```
                    Aufwand
              Niedrig    Hoch
           ┌─────────┬─────────┐
     Hoch  │   #2    │   #1    │
Priorität  ├─────────┼─────────┤
     Niedrig│   #5    │   #3    │
           └─────────┴─────────┘
                    ▲
                    │
              Starte hier!
            (#2 zuerst)
```

---

## MVP (Minimum Viable Product)

Für schnellste Time-to-Market:

### MVP Features:
1. ✅ **Saison-Planer Dashboard** - "Was pflanze ich jetzt?"
2. ✅ **Einfache Pflanzen-Timeline** - Events anzeigen
3. ✅ **Statische Mischkultur-Vorschläge** - ohne KI

### MVP NICHT enthalten:
- Wetter-Integration
- Ertrags-Prognosen
- Gamification
- Community-Features

---

## Datenbank-Änderungen (Zusammenfassung)

### Neue Tabellen:
1. `planting_calendar` - Saison-Daten
2. `plant_events` - Timeline-Events
3. `care_reminders` - Erinnerungs-Konfiguration
4. `companion_feedback` - Mischkultur-Feedback
5. `harvest_stats` - Ertrags-Aggregation
6. `garden_achievements` - Gamification

### Erweiterungen:
- `plants`: care_requirements, current_phase
- `companion_plantings`: confidence_score, data_source
- `harvests`: (evtl. Erweiterungen nötig)

---

## Technische Empfehlungen

### Libraries:
- **Charts:** react-native-chart-kit
- **Animations:** react-native-reanimated
- **Calendar:** react-native-calendars
- **Maps:** (falls Garten-Map kommt)

### APIs:
- **Wetter:** OpenWeatherMap (kostenloses Tier)
- **KI:** OpenAI/Claude (für Mischkultur-Erweiterung)

---

## Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Datenqualität | Medium | High | Manual Review, Beta |
| Feature Creep | High | Medium | MVP zuerst |
| Performance | Medium | Medium | Virtualisierung, Caching |
| Batterie | Low | Low | Batch-Notifications |

---

## Nächste Schritte

1. **Decision:** MVP Scope finalisieren
2. **Design:** UI/UX finalisieren
3. **Sprint 1:** Feature #2 (Saison-Planer) starten
4. **Sprint 2:** Feature #5 (Timeline) starten
5. **Review:** Nach Sprint 2 evaluate

---

## Dokumentation

### Feature-Dokumente:
- `01-pflege-erinnerungen.md`
- `02-saison-planer.md`
- `03-mischkultur-automat.md`
- `04-ertragstracker.md`
- `05-pflanzen-timeline.md`

### Related:
- `brainstorming/plant-features-2026-03-20.md` - Brainstorming-Ergebnisse

---

*Roadmap erstellt: 2026-03-20*
*Letzte Aktualisierung: 2026-03-20*
