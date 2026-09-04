# Gilde Vorlagen & Match Design

## Problem Statement

Gilden (Pflanzengemeinschaften) sollen:
1. Einfach aus Vorlagen erstellt werden können
2. Basierend auf Beet-Pflanzen vorgeschlagen werden (Match-Score)
3. Ad-hoc erstellte Gilden als Vorlage für andere Beete dienen

## User Flows

### Flow 1: "+ Neu" Button (Hybrid)

```
┌─────────────────────────────────────────────────┐
│  Neue Gilde erstellen                    [X]   │
├─────────────────────────────────────────────────┤
│  Passende Vorlagen für dein Beet:               │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [Match: 75%]                            │   │
│  │ Milpa (Die Drei Schwestern)             │   │
│  │ Mais • Feuerbohnen • Kürbis • Kapuzin.  │   │
│  │ [Auswählen]  [Vorschau]                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [Match: 60%]                            │   │
│  │ Kartoffel-Gilde (No-Dig)                 │   │
│  │ Kartoffeln • Bohnen • Tagetes • Knobl.   │   │
│  │ [Auswählen]  [Vorschau]                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ──────── Alle Vorlagen ────────              │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Vertikal-Nasch-Gilde                    │   │
│  │ [Auswählen]  [Vorschau]                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Fruchtgemüse-Insel                       │   │
│  │ [Auswählen]  [Vorschau]                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ──────── Eigene Gilden ────────               │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Meine Tomaten-Gilde                      │   │
│  │ [Auswählen]  [Vorschau]                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ──────── Ohne Vorlage ──���─────                │
│                                                 │
│  + Leere Gilde erstellen                      │
└─────────────────────────────────────────────────┘
```

### Flow 2: Rückwärts (Pflanzen → Gilde)

```
┌─────────────────────────────────────────────────┐
│  Gilde finden                          [X]       │
├─────────────────────────────────────────────────┤
│  Wähle Pflanzen aus deinem Inventar:              │
│  ───────────────────────────────────────────   │
│  [Tomate] [x]  [Basilikum] [x]  [Karotte] [ ]   │
│  [Paprika] [ ]  [Gurke] [x]                      │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [Suchen]                                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Gefundene Gilden:                             │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [Match: 80%]                            │   │
│  │ Tomaten-Gilde                           │   │
│  │ Tomate • Basilikum • Karotte           │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Datenquellen

### Vorlagen

1. **System-Gilden** - `src/data/system-gilden.ts`
   - 5 vordefinierte Gilden (Milpa, Vertikal-Nasch, etc.)
   
2. **Eigene Gilden** - Supabase `gilden` Tabelle
   - Alle User-Gilden (`is_system: false`)
   - Werden automatisch zu Vorlagen

### Match-Berechnung

**Einfacher Match (MVP):**
```
Match-Score = (Pflanzen im Beet die auch in der Gilde sind) / (Gesamt-Pflanzen der Gilde) * 100

Beispiel:
Beet: [Tomate, Basilikum, Karotte, Gurke]
Gilde: [Tomate, Basilikum, Karotte, Knoblauch]
→ Match: 3/4 = 75%
```

**Erweitert (später):**
- Aus `plant-knowledge-map.ts` → Companion-Daten (`good`/`avoid`)
- Synergie-Score = gute Nachbarn (grün) - schlechte Nachbarn (rot)

## Technische Umsetzung

### Neue Files/Komponenten

1. `src/services/gildeMatchService.ts`
   - `calculateMatchScore(bedPlants: string[], gilde: Gilde): number`
   - `findMatchingGilden(plantNames: string[]): GildeMatch[]`
   - `getSuggestedGilden(bedId: string): GildeMatch[]`

2. `src/components/gilde/GildeMatchCard.tsx`
   - Zeigt Gilde + Match-Score
   - Varianten: kompakt (nur Score + Name), detailliert (mit Pflanzen)

3. `src/screens/GildeTemplateScreen.tsx` (NEU)
   - Zeigt Vorlagen mit Match-Scores
   - "Auswählen" → kopiert Gilde in Editor
   - "Leere Gilde" → leeres Formular

### Bestehende Erweiterungen

- `GildeEditScreen.tsx`:
  - Wenn `bedId` übergeben → Beet-Pflanzen für Match-Berechnung laden
  - Match-Score als Badge anzeigen

- `BedDetailScreen.tsx`:
  - "+ Neu" Button → `GildeTemplateScreen` mit `bedId`

### Datenmodell

```typescript
interface GildeMatch {
  gilde: Gilde;
  matchScore: number;
  matchingPlants: string[];   // Pflanzen die im Beet UND in der Gilde sind
  missingPlants: string[];   // Pflanzen die in der Gilde sind aber nicht im Beet
}
```

## User Stories

### MVP

- **US-001**: Als Gärtner will ich eine Gilde aus einer Vorlage erstellen, damit ich nicht bei Null anfangen muss
   
- **US-002**: Als Gärtner will ich sehen wie gut eine Gilde zu meinem Beet passt, damit ich die richtige Wahl treffe

- **US-003**: Als Gärtner will ich meine eigene Gilde als Vorlage speichern, damit ich sie für andere Beete wiederverwenden kann

### Could Have (später)

- **US-004**: Als Gärtner will ich Pflanzen auswählen und passende Gilden finden, damit ich Inspiration bekomme

- **US-005**: Als Gärtner will ich erfahren warum eine Gilde nicht passt (schlechte Nachbarn), damit ich informierte Entscheidungen treffe

## Priorisierung (MoSCoW)

### Must Have
- System-Gilden als Vorlagen anzeigen
- Eigene Gilden als Vorlagen anzeigen
- Match-Score berechnen und anzeigen
- Vorlage auswählen → kopieren in Editor
- Ad-hoc Gilde erstellen (leeres Formular)

### Should Have
- Match-Score mit Farbcodierung (Grün > Gelb > Rot)
- "Meine Gilden" Section

### Could Have
- Rückwärts-Suche (Pflanzen → Gilde)
- Companion-basierte Match-Erklärung
- Synergie-Score

### Won't Have (für MVP)
- KI-basierte Gilde-Vorschläge
- Automatische Gilde-Generierung aus Foto

## Wireframe Details

### GildeMatchCard - Kompakt

```
┌─────────────────────────────────────────┐
│ [75%]          ●                        │
│                            Gilde Name   │
│              Tomate • Basilikum         │
└─────────────────────────────────────────┘
```

### GildeMatchCard - Detailliert

```
┌─────────────────────────────────────────┐
│ [75%] Match                    ■■■■■■  │
│                            Gilde Name │
│ Konzept: kurze Beschreibung             │
├───────────────────────────────────────┤
│ ✓ Im Beet: Tomate, Basilikum           │
│ ✗ Fehlt: Knoblauch, Karotte         │
│ ○ Neutral: Petersilie                 │
├───────────────────────────────────────┤
│                         [Auswählen] │
└─────────────────────────────────────────┘
```

## Erfolgs-Kriterien

1. ✓ User kann "+ Neu" klicken und sieht Vorlagen
2. ✓ User sieht Match-Score für jede Vorlage
3. ✓ User kann Vorlage auswählen und bearbeiten
4. ✓ User kann leere Gilde erstellen
5. ✓ Eigenе Gilden erscheinen als Vorlagen
6. ✓ Match-Score ist für User verständlich

## Offene Fragen

1. ✓ Soll Match-Score auch im Beet-Detail angezeigt werden? → **JA**
2. ✓ Unendlicher Scroll
3. ✓ Filter (System / Eigen / Alle)

## Abhängigkeiten

- `src/data/system-gilden.ts` - existiert
- `src/types/gilde.ts` - existiert
- `src/services/gildeService.ts` - existiert
- `plant-knowledge-map.ts` - existiert (für später)

## Geschätzter Aufwand

- GildeMatchService: 2h
- GildeTemplateScreen: 4h
- GildeMatchCard: 2h
- Integration: 2h

**Total MVP: ~10h**