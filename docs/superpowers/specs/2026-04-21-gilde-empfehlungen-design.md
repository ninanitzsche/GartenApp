# Gilde Empfehlungen Design

## Problem

Im Toggle-Modus sollen empfohlene Pflanzen angezeigt werden mit不同lichen Zuständen:
1. Im Beet + empfohlen, noch nicht zugeordnet
2. Im Beet + empfohlen, schon zugeordnet
3. Im Inventar + empfohlen, nicht im Beet
4. Nicht im Inventar + empfohlen, soll neu angelegt werden

## Zustände

| Zustand | Beet | Inventar | Empf. | Label |
|---------|------|----------|-------|-------|
| 1 | ✓ | - | ✓ | "Zugeordnet" |
| 2 | ✓ | - | ✓ | "Hinzufügen" |
| 3 | ✗ | ✓ | ✓ | "Zum Beet hinzufügen" |
| 4 | ✗ | ✗ | ✓ | "Neu anlegen" |

## UX Design

### Placement
- **C:** Section oben "Empfohlene Pflanzen" + inline sortiert

### Layout
```
┌─────────────────────────────────────────┐
│ 💡 Empfohlene Pflanzen                  │
├─────────────────────────────────────────┤
│ Kürbis                                  │
│   [✓] Im Beet (Milpa)                  │
├─────────────────────────────────────────┤
│ Basilikum                               │
│   [+] Zum Beet hinzufügen              │
│   (im Inventar)                        │
├─────────────────────────────────────────┤
│ Tagetes                                 │
│   [+] Neu anlegen                       │
│   (nicht im Inventar)                  │
└─────────────────────────────────────────┘
```

## Implementation

### Component: GildeRecommendationRow
- Zeigt Pflanzennamen
- Zeigt Status basierend auf Zustand
- Buttons für Aktionen

### Data Flow
1. Gilde-Pflanzen aus `gilde?.plants` holen
2. Beet-Pflanzen aus `beetPflanzen` holen  
3. Inventar-Pflanzen aus `allePflanzen` holen
4. Differenz bilden für Empfehlungen
5. Zustand für jede Pflanze berechnen
6. Rendern mit korrekten Buttons

## Erfolgs-Kriterien

1. ✓ Alle 4 Zustände werden korrekt angezeigt
2. ✓ User kann Pflanzen zuweisen
3. ✓ User kann Pflanzen zum Beet hinzufügen
4. ✓ User kann neue Pflanzen anlegen
5. ✓ Sortierung: erst Gilde-Pflanzen, dann Empfehlungen
