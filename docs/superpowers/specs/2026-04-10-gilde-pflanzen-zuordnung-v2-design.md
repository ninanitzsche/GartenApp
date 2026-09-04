# Gilde Pflanzen-Zuordnung V2 Design

## Überblick

Erweiterung der Toggle-UI für Gilde-Pflanzenzuordnung mit:
1. Inventory-Connection (Verlinkung zu Pflanze)
2. Visuelle Unterscheidung (Ausgewählt vs Nicht)
3. Neue Pflanze hinzufügen
4. Companion-Planting-Vorschläge

## UI-Spezifikation

### Toggle-Modus UI

```
┌─────────────────────────────────────┐
│ Beet: [Mein Beet    ▼]              │
├─────────────────────────────────────┤
│ [Toggle] [Tomate] 📎 [↑↓]           │
│          Rolle: [________]            │
├─────────────────────────────────────┤
│ [Toggle] [Basilikum] 📎 [↑↓]        │
│          Rolle: [________]           │
├─────────────────────────────────────┤
│ [Toggle] [Neue Pflanze] → [+ ]        │
├─────────────────────────────────────┤
│ [~] Nachbarn vorschlagen             │
├─────────────────────────────────────┤
│ [+ ] Im Inventar suchen              │
└─────────────────────────────────────┘
```

### Visuelle Unterschiede

**Ausgewählt (zugeordnet):**
- Hintergrund: dunkelgrün (#2D4739 +20%)
- Checkbox: ✅ (gefüllt)
- Schrift: fett

**Nicht ausgewählt:**
- Hintergrund: weiß
- Checkbox: ☐ (leer)
- Schrift: normal

**Im Inventar (existierende Pflanze):**
- 📎 Icon neben Namen
- Klickbar → Pflanze-Detailseite

**Nicht im Inventar:**
- Kein Icon
- Grauer Text

### Neue Pflanze hinzufügen

Button "+ Neue Pflanze":
- Öffnet Pflanze-Erstellen-Screen (oder Modal)
- Nach Erstellen → automatisch ausgewählt
- Pflanze ist jetzt im Inventar

### Companion-Planting

Button "Nachbarn vorschlagen":
- Zeigt Pflanzen, die gut zusammenpassen
- Basierend auf bereits ausgewählte Pflanzen
- Beispiel: Tomate ausgewählt → Basilikum vorschlagen

### Fallback "Im Inventar suchen"

- Öffnet Pflanze-Auswhal
- Alle Pflanzen aus Inventar
- Filter/Suchfunktion

## Datenmodell

```typescript
interface GildePlant {
  name: string;
  role: string;
  notes?: string;
}

// Aus Plant-Typ:
interface Plant {
  id: string;
  name: string;
  // ... andere Felder
  isInInventory: boolean; // oder via API prüfen
}
```

## Komponenten-Änderungen

### PlantToggleRow erweitert
```typescript
interface PlantToggleRowProps {
  plantName: string;
  role: string;
  isZugeordnet: boolean;
  isInInventory: boolean; // NEU
  onToggle: () => void;
  onRoleChange: (role: string) => void;
  onNavigateToPlant?: () => void; // NEU
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showReorder?: boolean;
}
```

## Akzeptanzkriterien

- [ ] Beet auswählen → Beet-Pflanzen laden
- [ ] Toggle-Button für jede Pflanze sichtbar
- [ ] Tap → Pflanze zur Gilde hinzufügen/entfernen
- [ ] Ausgewählt = dunkelgrüner Hintergrund
- [ ] Nicht ausgewählt = weiß/hell
- [ ] 📎 Icon bei Pflanzen im Inventar
- [ ] Tap auf 📎 → öffnet Pflanze-Detailseite
- [ ] "+ Neue Pflanze" → Pflanze erstellen → im Inventar
- [ ] "Nachbarn vorschlagen" → Companion-Vorschläge
- [ ] Fallback "Im Inventar suchen"

## Offene Fragen

- [x] Companion-Automatisch oder Button? → Button
- [x] Neue Pflanze Modal oder Screen? → Screen
- [x] Tap auf 📎 → Detail oder Edit? → Detail