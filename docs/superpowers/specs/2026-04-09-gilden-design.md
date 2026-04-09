# Gilden-Feature Design

## Overview

Gilden sind Pflanzinseln - vordefinierte Kombinationen von Pflanzen, die zusammenpassen und synergyeffekte nutzen. Ein Beet kann mehrere Gilden haben (z.B. Milpa + Kräuter).

## Data Model

```typescript
interface GildePlant {
  name: string;
  role: string;      // "Bodenschutz", "Stickstofffixierung", "Bestäubungsmagnet"
  notes?: string;    // "Im Mulch-Sandwich", "Am A-Frame-Gerüst"
}

interface Gilde {
  id: string;
  number?: number;   // 1, 2, 3... (optional)
  name: string;      // "Milpa", "Vertikal-Nasch-Gilde"
  concept: string;   // "Maximale Ernte auf kleinster Fläche"
  plants: GildePlant[];
  standort?: string; // "Hauptbeet Süd-Ost"
  tips?: string[];
  is_system: boolean; // true = vordefiniert, false = benutzerdefiniert
  created_at?: string;
}

interface BeetGilde {
  bed_id: string;
  gilde_id: string;
}
```

## Database Schema (Supabase)

```sql
CREATE TABLE IF NOT EXISTS gilden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INT,
  name TEXT NOT NULL,
  concept TEXT,
  plants JSONB NOT NULL, -- GildePlant[]
  standort TEXT,
  tips TEXT[],
  is_system BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beet_gilden (
  bed_id UUID REFERENCES beds(id) ON DELETE CASCADE,
  gilde_id UUID REFERENCES gilden(id) ON DELETE CASCADE,
  PRIMARY KEY (bed_id, gilde_id)
);
```

## Predefined Gilden

### Gilde 1: Milpa (Die Drei Schwestern)
- **Concept:** Traditionelle Synergie
- **Pflanzen:**
  - Mais (role: "Rankgerüst")
  - Feuerbohnen (role: "Stickstofffixierung")
  - Kürbis/Hokkaido (role: "Lebender Mulch")
  - Kapuzinerkresse (role: "Blattlaus-Abwehr")

### Gilde 2: Vertikal-Nasch-Gilde
- **Concept:** Maximale Ernte auf kleinster Fläche
- **Pflanzen:**
  - Wassermelone Sugar Baby (role: "A-Frame-Gerüst")
  - Pak Choi (role: "Halbschatten unterm Gerüst")
  - Pflücksalat (role: "Halbschatten")
  - Lauchzwiebeln (role: "Schwellschutz durch Geruch")
  - Basilikum (role: "Aroma und Gesundheit")

### Gilde 3: Kartoffel-Gilde (No-Dig)
- **Concept:** Bodenaufbau ohne Umgraben
- **Pflanzen:**
  - Kartoffeln (role: "Im Mulch-Sandwich")
  - Dicke Bohnen (role: "Stickstoffversorgung")
  - Tagetes (role: "Gegen Nematoden")
  - Meerrettich & Knoblauch (role: "Pilzschutz")
  - Rote Rüben (role: "Lückenfüller")

### Gilde 4: Fruchtgemüse-Insel
- **Concept:** Kombination aus Starkzehrern und Sonnenanbetern
- **Pflanzen:**
  - Zucchini (role: "Bodenschutz")
  - Gurken (role: "Vertikal am A-Frame")
  - Paprika (role: "Südkante")
  - Borretsch (role: "Bestäubungsmagnet")
  - Physalis (role: "Solitärstellung")

### Gilde 5: Physalis & Süßkartoffel-Mix
- **Concept:** Wärme-liebende Spezialkulturen
- **Pflanzen:**
  - Süßkartoffel (role: "Dichter Blätterteppich")
  - Physalis (role: "Buschartiger Wuchs")
  - Zinnien & Kornblumen (role: "Insektenweide")

## Features

### P1 - Must Have
1. **Gilde-Datenbank** - CRUD für Gilden
2. **Gilde zu Beet zuordnen** - Many-to-Many Beziehung
3. **Gilden im Beet-Detail anzeigen** - Welche Gilden sind aktiv?
4. **Vordefinierte Gilden laden** - Seed-Script für System-Gilden

### P2 - Should Have
5. **Gilden-Vorschläge** - Passt Gilde X zu meinen Pflanzen?
6. **Gilden-Bewertung** - Wie gut ist die Beet-Belegung?
7. **Standort-Tracking** - "Hauptbeet Süd-Ost" etc.

### P3 - Nice to Have
8. **Eigene Gilden erstellen** - Benutzerdefinierte Gilden
9. **Gilden filtern/suchen** - Nach Pflanzen, Konzept

## UI Components

### GildeCard
- Zeigt Name, Konzept, Pflanzen-Anzahl
- Farbcodierung nach System/Benutzer

### GildeSelector (Dropdown)
- Suche nach Gilde
- Vorschläge basierend auf Beet-Pflanzen

### GildeDetailSheet
- Alle Pflanzen mit Rollen
- Tips anzeigen
- Standort

## API Endpoints

```
GET    /api/gilden           - Alle Gilden (system + user)
POST   /api/gilden           - Neue Gilde erstellen
GET    /api/gilden/:id       - Einzelne Gilde
PUT    /api/gilden/:id       - Gilde aktualisieren
DELETE /api/gilden/:id       - Gilde löschen

GET    /api/beets/:id/gilden - Gilden für Beet
POST   /api/beets/:id/gilden - Gilde zu Beet hinzufügen
DELETE /api/beets/:id/gilden/:gildeId - Gilde von Beet entfernen
```

## Architecture

```
src/
├── types/
│   └── gilde.ts            # Gilde, GildePlant interfaces
├── services/
│   └── gildeService.ts     # API calls
├── hooks/
│   └── useGilden.ts        # React hook
├── components/
│   ├── GildeCard.tsx       # Card component
│   ├── GildeSelector.tsx   # Dropdown/Search
│   └── GildeDetailSheet.tsx # Bottom sheet
└── screens/
    ├── GildeListScreen.tsx # Alle Gilden
    ├── GildeDetailScreen.tsx
    └── GildeEditScreen.tsx
```

## Seed Data

System-Gilden werden beim App-Start geladen:
- Milpa, Vertikal-Nasch-Gilde, Kartoffel-Gilde, Fruchtgemüse-Insel, Physalis-Mix

## Open Questions

- [ ] Wie werden Pflanzen zugeordnet? Automatisch oder manuell?
- [ ] Gilden-Vorschläge: Algorithmus oder Regel-basiert?
