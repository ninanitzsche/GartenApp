# Feature: Mischkultur-Automat

> **Datum:** 2026-03-20  
> **Feature #:** 3 (von 5)  
> **Priorität:** 📊 Medium  
> **Status:** Brainstorming

---

## Problem Statement

**Aktuell:**
- Mischkultur-Daten existieren als **statische Datenbank**
- Keine **KI-gestützte** Optimierung
- User muss selbst **wissen**, welche Kombinationen gut sind

**Gewünscht:**
- System **schlägt proaktiv** gute Pflanzenkombinationen vor
- Berücksichtigt **mehr Faktoren** als nur "gut/schlecht"
- Automatische **Optimierung** basierend auf Erfahrung

---

## Vision

> *"Dein KI-Gartenberater, der aus jahrhundertealten Gartenweisheiten und moderner Datenanalyse die perfekte Pflanzengemeinschaft für deinen Garten zusammenstellt."*

---

## User Stories

### US 3.1: Optimale Nachbarn vorschlagen
```
Als: Gärtner
Ich möchte: System schlägt mir optimale Beetnachbarn vor
So dass: Ich nicht manuell recherchieren muss
```

### US 3.2: Konflikte vermeiden
```
Als: Gärtner
Ich möchte: Gewarnt werden BEVOR ich schlecht kombinierte Pflanzen ins Beet setze
So dass: Ich Fehler vermeide
```

### US 3.3: Garten-Matrix
```
Als: Planer
Ich möchte: Übersicht aller Beet-Pflanzungen mit Kompatibilitäts-Score
So dass: Ich ganzheitlich planen kann
```

### US 3.4: Learn from Success
```
Als: Erfahrener Gärtner
Ich möchte: Meine erfolgreichen Kombinationen speichern
So dass: Das System dazulernt
```

---

## Funktionale Anforderungen

### FR 1: Beet-Optimierungs-Algorithmus
- [ ] Input: Beet/Standort mit aktuellen Pflanzen
- [ ] Output: Vorschläge für gute/schlechte Nachbarn
- [ ] Scoring: Konfidenz-Score (basierend auf Datenquellen)

### FR 2: Conflict Detection
- [ ] Echtzeit-Check beim Hinzufügen einer Pflanze
- [ ] Warnung mit Begründung
- [ ] Alternative Vorschläge

### FR 3: Garten-Matrix View
- [ ] Visualisierung: Grid mit Pflanzen und Kompatibilität
- [ ] Farb-Codierung: 🟢 gut, 🟡 neutral, 🔴 schlecht
- [ ] Filter: Nur Konflikte anzeigen

### FR 4: Learning System
- [ ] User kann Kombination als "erfolgreich" markieren
- [ ] Gewichtung der Datenquellen anpassen
- [ ] Community-Feedback aggregieren (Future)

---

## Non-Funktionale Anforderungen

### NFR 1: Performance
- Optimierungs-Vorschlag < 500ms
- Kein API-Call für bestehende Daten

### NFR 2: Datenqualität
- Mindestens 100 Pflanzen mit Mischkultur-Info
- Quellen: Buchwissen, Community, KI-generiert

### NFR 3: Transparenz
- User sieht, warum eine Kombination gut/schlecht ist
- Quellenangabe für Empfehlungen

---

## Technische Überlegungen

### Algorithmus: Weighted Scoring

```
Score(Planta, Plantb) = 
  Σ (Quelle_Gewicht[i] * Quelle_Score[i])
  
  wobei Quellen sein können:
  - Handbuch-Wissen (Gewicht: 0.6)
  - User-Reports (Gewicht: 0.3)
  - KI-Vorhersage (Gewicht: 0.1)
```

### Optionen für KI-Erweiterung:

| Option | Ansatz | Aufwand | Genauigkeit |
|--------|--------|---------|-------------|
| A | Erweitere bestehende DB | 4h | Hoch |
| B | OpenAI/Claude API | 8h | Mittel |
| C | Lokale KI (TFLite) | 20h | Hoch |

### Empfehlung: **Option A+B** (Hybrid)
- Bestehende DB als Basis
- KI für neue/unbekannte Kombinationen
- Fallback auf "neutral" wenn keine Daten

---

## UI/UX Entwurf

### Wireframe: Mischkultur-Optimierung (Neuer Screen)

```
┌─────────────────────────────────────────┐
│ 🌿 Mischkultur-Optimierung              │
├─────────────────────────────────────────┤
│                                         │
│ 📍 Beet auswählen:                     │
│ ┌─────────────────────────────────────┐ │
│ │ 🏠 Hochbeet #2                 [▼] │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ AKTUELLE BEPFLANZUNG                │ │
│ │                                     │ │
│ │ 🍅 Tomate          🟢 Kompatibel    │ │
│ │ 🥕 Möhre           🟢 Kompatibel    │ │
│ │ 🧅 Zwiebel         🟡 Neutral       │ │
│ │                                     │ │
│ │ Kompatibilitäts-Score: 87%         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💡 VORSCHLÄGE                      │ │
│ │                                     │ │
│ │ 🟢 BASILIKUM                        │ │
│ │ Gute Nachbarn: 12 | Schlechte: 0  │ │
│ │ → Fördert Tomaten, vertreibt Schäd│ │
│ │                                     │ │
│ │ 🟢 PERSISCHER KLEE                  │ │
│ │ Gute Nachbarn: 8 | Schlechte: 1   │ │
│ │ → Stickstoff-Fixierung, Bodendeck │ │
│ │                                     │ │
│ │ 🔴 FENCHEL                          │ │
│ │ Gute Nachbarn: 1 | Schlechte: 8   │ │
│ │ → Hemmt Tomatenwachstum            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Pflanze hinzufügen]                   │
└─────────────────────────────────────────┘
```

### Wireframe: Conflict Warning

```
┌─────────────────────────────────────────┐
│ ⚠️ Pflanzung-Konflikt erkannt!         │
├─────────────────────────────────────────┤
│                                         │
│ Du möchtest Fenchel in Beet #2 setzen │
│                                         │
│ 🔴 KONFLIKT MIT:                        │
│                                         │
│ 🍅 Tomate                               │
│ • Fenchel hemmt Tomatenwachstum        │
│ • Konkurrenz um Nährstoffe             │
│                                         │
│ 📚 Quelle: Mischkultur-Handbuch        │
│                                         │
│ 💡 ALTERNATIVEN:                        │
│                                         │
│ 🟢 Möhren                              │
│   → Fördert Tomatenwachstum            │
│                                         │
│ 🟢 Salat                                │
│   → Unterdrückt Unkraut                │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [Trotzdem hinzufügen] [Alternative]│ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Wireframe: Garten-Matrix

```
┌─────────────────────────────────────────┐
│ 🧮 Garten-Matrix                        │
├─────────────────────────────────────────┤
│                                         │
│ ┌───┬────┬────┬────┬────┬────┐        │
│ │   │Tom │Möh │Zwi │Bas │Sal │        │
│ ├───┼────┼────┼────┼────┼────┤        │
│ │Tom│ -  │🟢  │🟡  │🟢  │🟡  │        │
│ ├───┼────┼────┼────┼────┼────┤        │
│ │Möh│🟢  │ -  │🟢  │🟢  │🟢  │        │
│ ├───┼────┼────┼────┼────┼────┤        │
│ │Zwi│🟡  │🟢  │ -  │🟡  │🟢  │        │
│ ├───┼────┼────┼────┼────┼────┤        │
│ │Bas│🟢  │🟢  │🟡  │ -  │🟢  │        │
│ ├───┼────┼────┼────┼────┼────┤        │
│ │Sal│🟡  │🟢  │🟢  │🟢  │ -  │        │
│ └───┴────┴────┴────┴────┴────┘        │
│                                         │
│ 🟢 Gut  🟡 Neutral  🔴 Schlecht        │
│                                         │
│ [Ganzes Bild anzeigen]                  │
└─────────────────────────────────────────┘
```

---

## Datenmodell

### Erweiterung: existing `companion_plantings` Tabelle

```sql
ALTER TABLE companion_plantings ADD COLUMN:
  confidence_score DECIMAL, -- 0.0 - 1.0
  data_source TEXT, -- 'handbook', 'community', 'ai', 'user'
  reason TEXT, -- 'nitrogen_fixation', 'pest_repellent', 'space_compatible'
  counter_evidence_count INT DEFAULT 0,
  user_id(UUID, nullable) REFERENCES auth.users, -- für User-Reports
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW();
```

### Neue Tabelle: `companion_feedback`
```sql
CREATE TABLE companion_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plant1_name TEXT NOT NULL,
  plant2_name TEXT NOT NULL,
  is_successful BOOLEAN NOT NULL,
  notes TEXT,
  location TEXT, -- 'beet_name'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Aufwandsschätzung

| Task | Aufwand | Komplexität |
|------|---------|-------------|
| DB: Kompatibilitäts-Score hinzufügen | 3h | Low |
| Service: Optimierungs-Algorithmus | 8h | High |
| Frontend: Optimierungs-Screen | 6h | Medium |
| Frontend: Conflict Warning Modal | 4h | Medium |
| Frontend: Garten-Matrix | 8h | High |
| KI: Integration für neue Kombos | 6h | Medium |
| **Gesamt** | **~35h** | |

---

## Akzeptanzkriterien

### AC 1: Vorschlag
```
GIVEN: User hat Tomate in Beet #2
WHEN: User öffnet Mischkultur-Optimierung
THEN: Basilikum wird als "sehr gut" vorgeschlagen
AND: Fenchel wird als "schlecht" markiert
```

### AC 2: Conflict Detection
```
GIVEN: User versucht Fenchel zu Beet #2 hinzuzufügen (hat Tomate)
WHEN: Hinzufügen-Button gedrückt wird
THEN: Warning Modal erscheint
AND: Alternativen werden angeboten
```

### AC 3: Matrix View
```
GIVEN: User hat 5+ Pflanzen in Datenbank
WHEN: Matrix View geöffnet wird
THEN: Alle Kombinationen als Grid angezeigt
AND: Farb-Codierung ist klar erkennbar
```

---

## Abhängigkeiten

- Existing: companionService, PlantDetailScreen Mischkultur-Sektion
- New: companion_feedback Tabelle
- Optional: KI-API für Erweiterung

---

## Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Datenqualität DB | Medium | High | KI-Erweiterung |
| Performance Matrix | Medium | Medium | Lazy Loading |
| User-Verwirrung | Low | Low | Klare Erklärungen |

---

## Synergien mit anderen Features

- **Feature #2:** Saison-Planer zeigt auch Mischkultur-Kompatibilität
- **Feature #4:** Ertrags-Daten beeinflussen Mischkultur-Score
- **Feature #5:** Timeline zeigt Entwicklung der Mischkultur

---

*Nächste Phase: Technical Design → Algorithmus-Spezifikation → Implementation*
