# Gilde Pflanzen-Zuordnung UX Design

## Problem

Bei der Zuordnung von Pflanzen zu einer Gilde fehlt Unterstützung:
- Role muss manuell eingetippt werden
- Keine Vorschläge für passende Begleitpflanzen
- Keine Markierung guter Kombinationen bei der Pflanzauswahl

## Gilde-Kontext

Die Gilde hat einen Kontext, der bei Vorschlägen hilft:
- **Gilde-Name**: z.B. "Milpa", "Tomaten-Gilde"
- **Konzept**: z.B. "Traditionelle Synergie", "Maximale Ernte"
- **Bekannte Pflanzen**: aus der Gilde selbst

KI nutzt diesen Kontext für bessere Empfehlungen.

## UX-Verbesserungen

### 1. Role-Dropdown (Priority: HIGHEST)

Statt freitext-Input, zeigen wir ein Dropdown mit Vorschlägen:

```
Optionen für Rolle:
- Rankgerüst
- Stickstofffixierung
- Lebender Mulch
- Bestäubungsmagnet
- Pilzschutz
- Blattlaus-Abwehr
- Lückenfüller
- Halbschatten
- Aroma
- Bodenschutz
```

**KI-Wartung**: Neue Rollen können über KI generiert werden basierend auf Pflanze + Gilde-Kontext.

### 2. Smart Suggestions (Priority: HIGH)

Zeigt Empfehlungen basierend auf:
- Gilde-Kontext (welche Pflanzen passen zum Konzept)
- Bereits zugeordnete Pflanzen ( Companion-Daten)
- Beet-Pflanzen (was im Beet schon wächst)

```
💡 Passend für "Tomaten-Gilde":
┌──────────────────────────────────────┐
│ ● Basilikum      → + Bestäubung      │
│ ● Knoblauch     → + Pilzschutz      │
│ ● Karotten     → + Platznutzung   │
└──────────────────────────────────────┘
```

**KI-Generierung**: Vorschläge basieren auf `plant-knowledge-map.ts` + Gilde-Kontext.

### 3. Bulk-Aktionen (Priority: MEDIUM)

```
┌──────────────────────────────────────┐
│ [Alle auswählen] [Alle abwählen]    │
└──────────────────────────────────────┘
```

### 4. Toptip bei Pflanzauswahl (Priority: HIGH)

Bei "Weitere Pflanze hinzufügen" werden passende Pflanzen hervorgehoben:

```
┌──────────────────────────────────────┐
│  Pflanzen suchen...                   │
├──────────────────────────────────────┤
│  ★ Tomate (empfohlen)               │
│  ★ Basilikum (passt zu Tomate)       │
│    Karotte                          │
│    Salat                           │
└──────────────────────────────────────┘
```

**★ = Toptip** = Top 2-3 Empfehlungen basierend auf Gilde-Kontext.

### Pflanzen-Status & Verknüpfung

Pflanzen können unterschiedliche Status haben:

| Status | Beschreibung | Aktion |
|--------|-------------|-------|
| Im Beet, keine Gilde | Zeigt Beet-Namen | Gilde zuweisen |
| Keinem Beet zugeordnet | Im Inventar | Beet zuweisen oder bleibt "nur Gilde" |
| Inspiration (neu) | Noch nicht im System | "Vorschlag/Planung" anlegen |

**Bei Pflanzendetails zeigen:**
- Zu welcher Gilde gehört die Pflanze?
- Welche Rollen hat sie in welchen Gilden?

```
Pflanze: Tomate
  Beet: Hochbeet 1
  Gilden: Milpa (Rankgerüst), Tomaten-Gilde (Hauptpflanze)
```

**"Vorschlag/Planung" anlegen:**
- Wenn Pflanze noch nicht existiert, kann sie als Inspiration erstellt werden
- Status: "geplant" oder "vorschlag"
- Noch nicht im Inventar, nur in der Gilde sichtbar

## KI-Integration

### Wo KI hilft:

1. **Rollen generieren**: Wenn Dropdown nicht passt, generiert KI passende Rolle basierend auf Pflanze + Gilde-Kontext
2. **Vorschläge generieren**: Wenn Standard-Companions nicht reichen, KI nach fragen
3. **Vorschläge priorisieren**: KI sortiert nach Relevanz für Gilde-Kontext
4. **Neue Kombinationen entdecken**: KI kann unbekannte Synergien vorschlagen

### KI-Prompt (Beispiel):

```
Für Gilde "{gildeName}" mit Konzept "{konzept}" 
und Pflanzen {已有Pflanzen},
empfehle {pflanzeName} als:
- Gute Nachbarn (basierend auf plant-knowledge-map)
- Rolle (z.B. "Stickstofffixierung", "Bestäubungsmagnet")
- Warum es passt (kurze Begründung)
```

### Datenfluß

```
Pflanze ausgewählt
    ↓
Gilde-Kontext erfassen
    ↓
KI fragen (optional)
    ↓
PLANT_KNOWLEDGE_MAP checken
    ↓
companions: { good: [...] } → als ★ anzeigen
    ↓
Bei Klick → Pflanze zur Gilde hinzufügen
```

## Implementation

### Phase 1: Role-Dropdown

- Neue Konstante `PLANT_ROLES` in shared config
- `PlantToggleRow` bekommt Role-Dropdown statt TextInput
- Fallback: Freitext wenn "Sonstige"
- KI kann neue Rollen vorschlagen

### Phase 2: Smart Suggestions

- `getCompanionSuggestions(plantName)` aus `plant-knowledge-map.ts`
- KI erweitert Vorschläge basierend auf Gilde-Kontext
- Zeigt "Passende Pflanzen" Section unter jeder Hauptpflanze
- Klick → fügt Pflanze zur Gilde hinzu

### Phase 3: Bulk-Aktionen

- Checkbox "Alle auswählen" in der Pflanzensection
- Toggle-Button für Select all / Deselect all

### Phase 4: Toptip-Markierung

- `plant-knowledge-map.ts` referenzieren
- Bei Pflanzensuche: "gute Nachbarn" mit ★ markieren
- Tooltip: "Passt gut mit [Pflanze X]"

## Komponenten

1. **PlantRolePicker** (NEW)
   - Dropdown mit PLANT_ROLES
   - Freitext-Fallback

2. **CompanionSuggestion** (NEW)
   - Zeigt passende Pflanzen als Chips
   - OnClick → hinzufügen

3. **PlantSearchWithToptip** (NEW)
   - Erweitert bestehende Pflanzensuche
   - Markiert gute Nachbarn mit ★

4. **BulkActionBar** (NEW)
   - Alle auswählen/abwählen Buttons

## Wireframes

### PlantToggleRow mit Role-Dropdown

```
┌──────���──────────────────────────────────────────┐
│ [●] Tomate                    [↑] [↓] [🗑]   │
│        └─ Role: [Rankgerüst ▼]                  │
├─────────────────────────────────────────────────┤
│ [●] Basilikum                  [↑] [↓] [🗑]   │
│        └─ Role: [Begleitung ▼]                  │
└─────────────────────────────────────────────────┘
```

### Companion Suggestions

```
┌─────────────────────────────────────────────────┐
│ 💡 Passend für Tomate:                           │
│ ┌──────────────┐ ┌──────────────┐          │
│ │ ● Basilikum  │ │ ● Knoblauch  │          │
│ │ + Bestäubung │ │ + Pilzschutz │          │
│ └──────────────┘ └──────────────┘          │
└─────────────────────────────────────────────────┘
```

## Erfolgs-Kriterien

1. ✓ Role-Dropdown zeigt常用的 Rollen
2. ✓ Bei Auswahl werden gute Nachbarn vorgeschlagen
3. ✓ Bulk-Aktionen funktionieren
4. ★ Markierung in der Pflanzensuche sichtbar