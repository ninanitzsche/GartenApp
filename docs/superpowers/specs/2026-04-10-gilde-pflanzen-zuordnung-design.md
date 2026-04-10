# Gilde Pflanzen-Zuordnung Design

## Überblick

Neues UI-Pattern für die Zuordnung von Pflanzen zu einer Gilde:
1. **Neue Gilde erstellen:** Beet-Pflanzen mit Toggle zuordnen + Fallback Inventar
2. **Gilde bearbeiten:** Pflanzen-Reihenfolge ändern

## Use Cases

### UC1: Neue Gilde anlegen
- Beet auswählen (optional)
- Pflanzen aus Beet via Toggle zuordnen
- Rolle direkt eingeben
- Fallback: "Im Inventar suchen" wenn Beet leer/keine passenden

### UC2: Gilde bearbeiten (nach Speichern)
- Pflanzen-Liste mit Toggle + Rolle
- Reihenfolge ändern (↑↓ Pfeile)

## UI-Spezifikation

### Neue Gilde - Pflanzen-Sektion

```
┌─────────────────────────────────────┐
│ Pflanzen *                    [+]   │
├─────────────────────────────────────┤
│ ▼ Aus Beet: [Beet-Name    ▼]         │
├─────────────────────────────────────┤
│ [Toggle] [Pflanze 1]  [Rolle_____]│
│ [Toggle] [Pflanze 2]  [Rolle_____]│
│ [+ ] Im Inventar suchen              │
└─────────────────────────────────────┘
```

**Toggle-Button:**
- Status "nicht zugeordnet": `○ Pflanzename`
- Status "zugeordnet": `☑ Pflanzename` (grüner Hintergrund)
- Tap = Toggle zwischen zugeordnet/nicht zugeordnet

**Reihenfolge-Pfeile (nur nach Speichern):**
- `↑` / `↓` Buttons pro Pflanze

### Fallback "Im Inventar suchen"

Nur sichtbar wenn:
- Kein Beet ausgewählt ODER
- Beet keine Pflanzen hat ODER
- Alle Beet-Pflanzen bereits zugeordnet

Öffnet Modal/Liste mit allen Pflanzen aus dem Inventar.

## Datenmodell

```typescript
interface GildePlant {
  name: string;
  role: string;        // z.B. "Hauptpflanze", "Begleitpflanze", "Bodendecker"
  notes?: string;
}

// Gilde.plants ist GildePlant[]
```

## State-Management

```typescript
// GildeEditScreen
const [pflanzen, setPflanzen] = useState<GildePlant[]>([]);
const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
const [beetPflanzen, setBeetPflanzen] = useState<Plant[]>([]);
const [allePflanzen, setAllePflanzen] = useState<Plant[]>([]);

// Toggle-Funktion
const togglePflanze = (plantName: string) => {
  const exists = pflanzen.find(p => p.name === plantName);
  if (exists) {
    setPflanzen(pflanzen.filter(p => p.name !== plantName));
  } else {
    setPflanzen([...pflanzen, { name: plantName, role: '' }]);
  }
};

// Ist zugeordnet?
const isZugeordnet = (plantName: string) => pflanzen.some(p => p.name === plantName);
```

## Komponenten

### PlantToggleRow
```typescript
interface PlantToggleRowProps {
  plantName: string;
  role: string;
  isZugeordnet: boolean;
  onToggle: () => void;
  onRoleChange: (role: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showReorder?: boolean;
}
```

Verwendung:
- Im Bearbeiten-Modus: `showReorder={true}`
- Im Erstellen-Modus: `showReorder={false}`

### FallbackButton
- Label: "Im Inventar suchen"
- Öffnet PlantPickerModal mit allen Pflanzen
- Nur sichtbar wenn Fallback-Bedingung erfüllt

## API (bleibt gleich)

```typescript
//createGilde(gildeData)
//updateGilde(id, gildeData)
// Gilde: { ..., plants: GildePlant[] }
```

## Akzeptanzkriterien

- [ ] Beet auswählen → Beet-Pflanzen laden
- [ ] Toggle-Button für jede Pflanze sichtbar
- [ ] Tap auf Toggle → Pflanze zur Gilde hinzufügen/entfernen
- [ ] Rolle direkt eingeben möglich
- [ ] Fallback "Im Inventar suchen" bei leerem Beet
- [ ] Nach Speichern: Reihenfolge-Pfeile sichtbar
- [ ] Pfeile ändern Position in der Liste

## Offene Fragen

- [x] Reihenfolge beim Erstellen? → Nein, erst nach Speichern
- [x] Rolle Pflicht? → Nein, optional
- [x] Fallback wann? → Siehe oben