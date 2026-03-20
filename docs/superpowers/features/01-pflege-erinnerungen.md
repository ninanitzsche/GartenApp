# Feature: Intelligente Pflege-Erinnerungen

> **Datum:** 2026-03-20  
> **Feature #:** 1 (von 5)  
> **Priorität:** 🔥 High  
> **Status:** Brainstorming

---

## Problem Statement

**Aktuell:**
- Erinnerungen sind **statisch** (z.B. "Jeden Dienstag gießen")
- **Keine Berücksichtigung** von: Wetter, Pflanzenwachstum, Saison
- User bekommt irrelevante Erinnerungen → "Alarm-Müdigkeit"

**Gewünscht:**
- Erinnerungen die **kontextabhängig** sind
- Nur wichtige Erinnerungen, zur richtigen Zeit
- KI-gestützte Vorhersagen

---

## Vision

> *"Deine Pflanzen flüstern dir zu, was sie brauchen - basierend auf Wetter, Wachstum und Erfahrung."*

---

## User Stories

### US 1.1: Wetter-basierte Erinnerung
```
Als: Gärtner
Ich möchte: Erinnerungen erhalten, die das aktuelle Wetter berücksichtigen
So dass: Ich z.B. bei Hitze nicht abends gieße, sondern morgens
```

### US 1.2: Wachstums-phase Erinnerung
```
Als: Gärtner
Ich möchte: Automatische Erinnerungen für nächste Pflegeschritte
So dass: Ich nicht vergesse, Tomaten auszugeizen
```

### US 1.3: Intelligente Priorisierung
```
Als: Gärtner
Ich möchte: Die wichtigsten Aufgaben zuerst sehen
So dass: Ich meine begrenzte Zeit optimal nutze
```

### US 1.4: Erinnerung lernen lassen
```
Als: Gärtner
Ich möchte: Dass das System aus vergangenen Erinnerungen lernt
So dass: Irrelevante Erinnerungen automatisch ausgeblendet werden
```

---

## Funktionale Anforderungen

### FR 1: Wetter-Integration
- [ ] Wetter-API Anbindung (OpenWeatherMap o.ä.)
- [ ] Erinnerungszeit an Temperatur anpassen
- [ ] Vorhersage für kommende Tage berücksichtigen

### FR 2: Pflanzen-spezifische Logik
- [ ] Pflegeschritte pro Pflanzenart definierbar
- [ ] Wachstumsphase-Erkennung (Aussaat → Keimung → Wachstum → Ernte)
- [ ] Pflanzenspezifische "To-Do's"

### FR 3: Intelligentes Scheduling
- [ ] Zeitpunkt-Berechnung basierend auf:
  - Pflanzenart
  - Aktuellem Wetter
  - Letzter Pflegeaction
  - Jahreszeit
- [ ] Snooze-Option: "Morgen erinnern"
- [ ] Skip-Option: "Diese Woche nicht"

### FR 4: Feedback-Loop
- [ ] User kann Erinnerung bewerten (hilfreich/nicht hilfreich)
- [ ] System lernt aus Feedback
- [ ] Dashboard: "Erinnerungs-Effektivität"

---

## Non-Funktionale Anforderungen

### NFR 1: Performance
- Erinnerungs-Berechnung < 2 Sekunden
- Push-Notification < 1 Sekunde nach Trigger

### NFR 2: Battery
- Kein konstanter Background-Prozess
- Batch-Notification um 6:00 Uhr morgens

### NFR 3: Privacy
- Wetterdaten anonym
- Keine unnötigen Standort-Daten

---

## Technische Überlegungen

### Option A: Client-seitig (React Native)
```
Vorteile:
- Einfacher zu implementieren
- Kein Backend nötig
- Offline-fähig

Nachteile:
- Batterie-intensiv
- Weniger intelligent
```

### Option B: Backend-seitig (Supabase Edge Functions)
```
Vorteile:
- Zentrale Logik
- Kann外部 APIs kombinieren
- Intelligenter

Nachteile:
- Mehr Komplexität
- Hosting-Kosten
```

### Empfehlung: **Option B** (Hybrid)
- Einfache Erinnerungen (Zeit-basiert): Client
- Komplexe Erinnerungen (Wetter, KI): Backend

---

## UI/UX Entwurf

### Wireframe: Erinnerungs-Karte

```
┌─────────────────────────────────────────┐
│ 🌡️ Gieß-Erinnerung                     │
│                                         │
│ Deine Tomaten haben Durst!             │
│                                         │
│ 📍 Hochbeet #2                          │
│ 💧 Letztes Gießen: Gestern             │
│ 🌡️ Heute: 32°C, niedrige Luftfeucht    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💡 Tipp: Morgen früh gießen         │ │
│ │    vermeidet Verdunstung             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [✓ Gießen ✅]  [⏰ Später]  [🚫 Skip]  │
└─────────────────────────────────────────┘
```

### Wireframe: Erinnerungs-Liste (HomeScreen)

```
┌─────────────────────────────────────────┐
│ 🌱 Deine Pflege heute                   │
│    3 Erinnerungen                       │
├─────────────────────────────────────────┤
│                                         │
│ ⭐ 🔴 Tomaten gießen                   │
│    Hochbeet #2 | Dringend: Heute       │
│                                         │
│ ⭐ 🟡 Chilis düngen                    │
│    Gewächshaus | Morgen                 │
│                                         │
│ ⭐ 🟢 Unkraut jäten                    │
│    Gemüsebeet | Diese Woche             │
│                                         │
└─────────────────────────────────────────┘
```

---

## Datenmodell-Erweiterung

### Neue Tabelle: `care_reminders`
```sql
CREATE TABLE care_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plant_id UUID REFERENCES plants(id),
  reminder_type TEXT NOT NULL, -- 'water', 'fertilize', 'prune', 'harvest'
  trigger_conditions JSONB, -- { weather: 'hot', temp_above: 25 }
  notification_time TIME,
  notification_day TEXT[], -- ['mon', 'tue']
  is_active BOOLEAN DEFAULT true,
  feedback_score INT, -- 1-5
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Erweiterung: `plants` Tabelle
```sql
ALTER TABLE plants ADD COLUMN:
  care_requirements JSONB, -- { watering_frequency: 'daily', sunlight: 'full' }
  current_phase TEXT, -- 'seedling', 'vegetative', 'flowering', 'fruiting'
  last_watered TIMESTAMPTZ,
  last_fertilized TIMESTAMPTZ
```

---

## Aufwandsschätzung

| Task | Aufwand | Komplexität |
|------|---------|-------------|
| Wetter-API Integration | 4h | Medium |
| Backend: Erinnerungs-Engine | 8h | High |
| Frontend: Erinnerungs-UI | 6h | Medium |
| Notification-System | 4h | Medium |
| Feedback-Loop | 3h | Low |
| **Gesamt** | **~25h** | |

---

## Akzeptanzkriterien

### AC 1: Wetter-Erinnerung
```
GIVEN: Es ist über 30°C
WHEN: Erinnerung für "Gießen" erstellt wird
THEN: Empfehlung ist "Morgens vor 8 Uhr" nicht "Abends"
```

### AC 2: Pflanzen-Phase
```
GIVEN: Pflanze ist in "Blüte-Phase"
WHEN: Erinnerung für "Düngen" erstellt wird
THEN: Erinnerung enthält "Blüten-Fördernd"
```

### AC 3: Feedback-Integration
```
GIVEN: User hat Erinnerung 3x als "nicht hilfreich" markiert
WHEN: Nächste ähnliche Erinnerung erstellt wird
THEN: Erinnerung wird mit niedrigerer Priorität angezeigt
```

---

## Abhängigkeiten

- Wetter-API (OpenWeatherMap oder kostenlose Alternative)
- Notification-Permission (Expo Notifications)
- Existing: plantService, taskService

---

## Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Wetter-API Kosten | Medium | Medium | Kostenloses Tier nutzen |
| Battery drain | Low | High | Batch-Notifications |
| User-Acceptance | Medium | High | Beta-Testing |

---

*Nächste Phase: Technical Design → User Stories finalisieren → Implementation*
