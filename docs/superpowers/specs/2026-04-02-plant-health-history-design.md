# Plant Health Check History (GSD-Verlauf)

## Overview

Implementierung eines Gesundheitscheck-Verlaufs für Pflanzen. Jeder Health-Check wird mit optionalem Foto und KI-Analyse (PlantNet Disease API) gespeichert und als animierte Card im Grid-Layout angezeigt.

## Requirements

- Gesundheitszustand kann **mehrfach** abgefragt werden (Verlauf)
- Jeder Check hat ein **Foto** (manuell aufgenommen/gewählt + optional KI-Analyse)
- **Grid-Layout** mit 2 Spalten (Tablets: 3), animierte Cards
- Card-Inhalt: Thumbnail, Datum, Status-Badge (grün/gelb/rot)
- Detail-Modal beim Tippen auf eine Card
- Modernes Design im Stil der bestehenden App (Glassmorphism, Animations)

## Data Model

### Neue Tabelle: `health_checks`

```sql
CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  disease_data JSONB,          -- PlantNet Disease API Ergebnis
  health_status TEXT NOT NULL CHECK (health_status IN ('gesund', 'krank', 'unsicher')),
  notes TEXT,                   -- Optionale Nutzernotiz
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Indizes für Performance
CREATE INDEX idx_health_checks_plant_id ON health_checks(plant_id);
CREATE INDEX idx_health_checks_created_at ON health_checks(created_at DESC);

-- RLS Policies
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health checks"
  ON health_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health checks"
  ON health_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health checks"
  ON health_checks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health checks"
  ON health_checks FOR DELETE
  USING (auth.uid() = user_id);
```

### Status-Berechnung

- `gesund`: Keine Krankheit erkannt oder Score < 0.4
- `unsicher`: Top-Score zwischen 0.4 und 0.7
- `krank`: Top-Score >= 0.7

### TypeScript Types

```typescript
export interface HealthCheck {
  id: string;
  plant_id: string;
  photo_id?: string;
  photo?: Photo;
  disease_data?: PlantDiseaseData;
  health_status: 'gesund' | 'krank' | 'unsicher';
  notes?: string;
  created_at: string;
  user_id: string;
}

export interface HealthCheckFormData {
  photoUri: string;
  runAI?: boolean;
  notes?: string;
}
```

## UI Components

### 1. `HealthHistoryGrid.tsx` (Hauptkomponente)

Ersetzt die bestehende `DiseaseCheckCard` im `PlantDetailScreen`.

```
┌─────────────────────────────────┐
│ Gesundheit        + Check starten │
│ ┌───────────┐ ┌───────────┐     │
│ │    🟢     │ │    🟡     │     │
│ │   [IMG]   │ │   [IMG]   │     │
│ │  02.04    │ │  28.03    │     │
│ └───────────┘ └───────────┘     │
│ ┌───────────┐ ┌───────────┐     │
│ │    🔴     │ │    🟢     │     │
│ │   [IMG]   │ │   [IMG]   │     │
│ │  15.03    │ │  01.03    │     │
│ └───────────┘ └───────────┘     │
└─────────────────────────────────┘
```

- SectionHeader mit "Gesundheit" + Check-Zähler
- Rechts: Button "Check starten" (klein, nur bei existing plants)
- Grid: `FlatList` mit `numColumns={2}`, Cards mit aspect-ratio 1:1
- Status-Badge: Animierter Puls-Kreis oben rechts auf jeder Card
- Datum: Semi-transparentes Overlay am unteren Rand

### 2. `HealthCheckCard.tsx` (Einzelne Card)

- Thumbnail-Bild (Full-bleed, abgerundet)
- Status-Badge: Animierter Kreis (grün/gelb/rot) mit Pulse-Animation
- Datum-Overlay: "02.04.2026" unten, semi-transparent Hintergrund
- Fade-in + Scale-Animation beim Erscheinen
- `Pressable` → öffnet Detail-Modal

### 3. `HealthCheckDetailModal.tsx`

- Vollbild-Modal (slide-up animation)
- Großes Bild (Full-Width, Höhe ca. 40% des Screens)
- Krankheitsdiagnose + Confidence-Balken (falls KI-Analyse vorhanden)
- Notiz-Feld (editierbar, auto-save)
- Löschen-Button
- Schließen-Button (X oben links)

### 4. Flow: Neuen Check starten

1. Nutzer tippt auf "+ Check starten"
2. `ImagePicker` mit Action Sheet: "Foto aufnehmen" / "Aus Galerie wählen"
3. Foto wird in `photos`-Tabelle hochgeladen (via `uploadPhoto`)
4. **Optional:** PlantNet Disease API Call
5. `health_checks`-Eintrag wird erstellt
6. Grid aktualisiert mit Animation (neue Card slide-in)
7. Bei KI-Ergebnis: Alert mit Top-Diagnose

## Files to Create

| File | Purpose |
|------|---------|
| `src/types/healthCheck.ts` | HealthCheck TypeScript types |
| `src/services/healthCheckService.ts` | CRUD operations für health_checks |
| `src/components/plant/HealthHistoryGrid.tsx` | Grid-Hauptkomponente |
| `src/components/plant/HealthCheckCard.tsx` | Einzelne Card-Komponente |
| `src/components/plant/HealthCheckDetailModal.tsx` | Detail-Modal |
| `supabase/migrations/..._create_health_checks.sql` | DB Migration |

## Files to Modify

| File | Changes |
|------|---------|
| `src/screens/PlantDetailScreen.tsx` | Ersetze DiseaseCheckCard durch HealthHistoryGrid |
| `src/hooks/usePlantDetail.ts` | Füge healthChecks State + Fetch hinzu |

## Animations

- **Card Entry:** `FadeIn` + `SlideInDown` (staggered, 100ms pro Card)
- **Status Pulse:** `useSharedValue` mit `withRepeat` für kontinuierlichen Puls
- **Grid Entry:** Cards erscheinen verzögert (0-50ms pro Card)
- **Modal:** `SlideInDown` für Detail-Modal

## Error Handling

- Kein Netzwerk → Offline-Cache für bereits geladene Health-Checks
- KI-API Fehler → Foto wird trotzdem gespeichert, Status = 'unsicher'
- Upload-Fehler → Toast-Benachrichtigung, kein Eintrag erstellt

## Testing

- Unit Tests für `healthCheckService.ts`
- Component Tests für `HealthCheckCard.tsx`
- Integration Test für den Flow: Foto → Upload → Check → Grid
