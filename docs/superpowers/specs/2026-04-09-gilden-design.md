# Gilden-Feature Design

## Overview

Gilden sind Pflanzinseln - vordefinierte Kombinationen von Pflanzen, die zusammenpassen und Synergieeffekte nutzen. Ein Beet kann mehrere Gilden haben (z.B. Milpa + Kräuter). Gilden werden bewertet um die Umsetzung des Pflanzplans zu tracken.

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
  user_id?: string;
  created_at?: string;
}

interface GildeRating {
  id: string;
  gilde_id: string;
  bed_id: string;
  rating: number;        // 1-5 Sterne
  comment?: string;       // Freitext-Kommentar
  created_at: string;
  updated_at: string;
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

CREATE TABLE IF NOT EXISTS gilde_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gilde_id UUID REFERENCES gilden(id) ON DELETE CASCADE,
  bed_id UUID REFERENCES beds(id) ON DELETE CASCADE,
  score INT CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gilde_id, bed_id)
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
3. **Gilden im Beet-Detail anzeigen** - Pflanzplan für Beet
4. **Vordefinierte Gilden laden** - Seed-Script für System-Gilden
5. **Eigene Gilden erstellen** - Benutzerdefinierte Gilden (CRUD)
6. **Gilden-Bewertung** - Score (1-5) + Kommentar für jede Beet-Gilde

### P2 - Should Have
7. **Gilden-Vorschläge** - Passt Gilde X zu meinen Pflanzen im Beet?
8. **Standort-Tracking** - "Hauptbeet Süd-Ost" etc.

### P3 - Nice to Have
9. **Gilden filtern/suchen** - Nach Pflanzen, Konzept

## UI Components

### GildeCard
- Zeigt Name, Konzept, Pflanzen-Anzahl
- Farbcodierung nach System/Benutzer
- Zeigt Bewertung (Sterne) wenn vorhanden

### GildeSelector (Dropdown)
- Suche nach Gilde
- Vorschläge basierend auf Beet-Pflanzen

### GildeDetailSheet
- Alle Pflanzen mit Rollen
- Tips anzeigen
- Standort

### GildeRating
- 1-5 Sterne zum Bewerten
- Freitext-Kommentar
- Zeigt letzte Bewertung mit Datum

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
│   └── gilde.ts            # Gilde, GildePlant, GildeRating interfaces
├── services/
│   └── gildeService.ts     # API calls (CRUD + ratings)
├── hooks/
│   └── useGilden.ts       # React hook
├── components/
│   ├── gilde/
│   │   ├── GildeCard.tsx       # Card component
│   │   ├── GildeSelector.tsx    # Dropdown/Search
│   │   ├── GildeDetailSheet.tsx  # Bottom sheet
│   │   └── GildeRating.tsx       # Star rating component
│   └── StarRating.tsx      # Reusable star rating
└── screens/
    ├── GildeListScreen.tsx  # Alle Gilden
    ├── GildeDetailScreen.tsx
    └── GildeEditScreen.tsx  # Gilde erstellen/bearbeiten
```

## Implementation Status

### Completed ✅
- Gilde type + GildeRating type
- System-Gilden seed data (5 predefined)
- gildeService.ts with CRUD + ratings + suggestions
- useGilde hook
- GildeCard component (with onRemove)
- GildeSelector component (with suggestions)
- GildeRating component (1-5 stars + comment)
- GildeEditScreen (create/edit/delete user gilden)
- GildeListScreen (list all gilden)
- GildeDetailSheet component (detailed view with plants, roles, tips)
- SQL migration with gilde_ratings table
- getSuggestedGilden() for matching gilden to bed plants
- Navigation integration (GardenStackNavigator)
- Tests for GildeCard, GildeSelector, GildeRating, gildeService

### In Progress 🚧
- None

### TODO
- None - Feature complete!

## Seed Data

System-Gilden werden beim App-Start geladen:
- Milpa, Vertikal-Nasch-Gilde, Kartoffel-Gilde, Fruchtgemüse-Insel, Physalis-Mix

## Open Questions

- [x] Wie werden Pflanzen zugeordnet? Manuell per Drag & Drop oder Selector
- [x] Gilden-Vorschläge: Regel-basiert (Match-Score basierend auf Pflanzen-Overlap)
