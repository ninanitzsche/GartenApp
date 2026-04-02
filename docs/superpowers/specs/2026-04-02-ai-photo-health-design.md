# Design Spec: KI-Foto-Analyse mit Gesundheitsbewertung

## Übersicht

Einheitliches Bottom Sheet Modal für KI-gestützte Foto-Analyse mit automatischer Pflanzenerkennung, Gesundheitsbewertung und Pflanzenzuordnung. Verfügbar von überall in der App.

## Anforderungen

### Funktionale Anforderungen
- **FR-01**: Foto aufnehmen oder aus Galerie wählen
- **FR-02**: Automatische Pflanzenerkennung via PlantNet API
- **FR-03**: Automatische Gesundheitsbewertung via PlantNet Disease API + OpenZen
- **FR-04**: Matching mit existierenden Pflanzen im Garten
- **FR-05**: Automatischer Vorschlag bei hoher Konfidenz (>80%)
- **FR-06**: Fallback auf Dropdown bei Ablehnung oder niedriger Konfidenz
- **FR-07**: Möglichkeit neue Pflanze zu erstellen
- **FR-08**: Gesundheitsstatus wird mit dem Foto verknüpft

### Nicht-funktionale Anforderungen
- **NFR-01**: Ladeanimation während KI-Analyse (max 30s Timeout)
- **NFR-02**: Parallele KI-Aufrufe für Performance
- **NFR-03**: Offline-Fähigkeit mit Retry-Logik
- **NFR-04**: Wiederverwendbar von überall in der App

## Architektur

### Komponentendiagramm

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AIPhotoModal (Bottom Sheet)                │   │
│  │  Step 1: Camera/Gallery → Step 2: Loading → Step 3:    │   │
│  │  Results → Step 4: Assignment                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              aiPhotoOrchestrator.ts                     │   │
│  │  • Koordiniert parallele KI-Aufrufe                     │   │
│  │  • State Management für den gesamten Flow               │   │
│  │  • Error Handling & Retry Logic                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ PlantNet    │    │ PlantNet    │    │ OpenZen     │         │
│  │ Identify    │    │ Disease     │    │ (LLM)       │         │
│  │ (Pflanze)   │    │ (Krankheit) │    │ (Analyse)   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                    │                    │             │
│         └────────────────────┼────────────────────┘             │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Ergebnis-Objekt                            │   │
│  │  {                                                      │   │
│  │    plantIdentification: { name, confidence, ... },      │   │
│  │    diseaseAnalysis: { status, diseases: [...] },        │   │
│  │    healthStatus: 'gesund' | 'krank' | 'unsicher',       │   │
│  │    matchingPlants: Plant[],                             │   │
│  │    bestMatch: Plant | null                              │   │
│  │  }                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Datenfluss

1. **Foto-Aufnahme**: Nutzer macht Foto oder wählt aus Galerie
2. **Komprimierung**: Bild wird auf 1200x1200 komprimiert
3. **Parallele KI-Aufrufe**:
   - PlantNet Identification API (Pflanzenerkennung)
   - PlantNet Disease API (Krankheitserkennung)
   - OpenZen/LLM (zusätzliche Analyse)
4. **Matching**: Vergleich mit existierenden Pflanzen
5. **Ergebnis-Zusammenführung**: Einheitliches Analyse-Objekt
6. **Zuordnung**: Nutzer bestätigt oder wählt aus

## UI-Komponenten

### AIPhotoModal (Bottom Sheet)

**Step 1: Foto aufnehmen**
- Kamera-Button (öffnet expo-image-picker Camera)
- Galerie-Button (öffnet expo-image-picker Library)
- Foto-Vorschau nach Auswahl
- "Weiter"-Button

**Step 2: KI analysiert**
- Ladeanimation (Lottie oder Animated)
- Progress-Bar
- Status-Texte:
  - "Pflanze wird identifiziert..."
  - "Gesundheit wird analysiert..."
  - "Passende Pflanzen werden gesucht..."

**Step 3: Ergebnis anzeigen**
- Pflanzenname + wissenschaftlicher Name
- Konfidenz-Badge (Farbcodiert: grün >80%, gelb 50-80%, rot <50%)
- Gesundheitsstatus mit Icon (✅/⚠️/❌)
- Liste der passenden Pflanzen im Garten
- "Zuordnen" und "Neue Pflanze erstellen" Buttons

**Step 4: Zuordnung**
- Bestätigung bei automatischem Vorschlag
- Dropdown bei manueller Auswahl
- "Neue Pflanze erstellen" Option
- Speichern-Button

### Trigger-Punkte

```typescript
// HomeScreen.tsx
<AIFabButton onPress={() => showModal()} />

// PlantListScreen.tsx
<IconButton icon="camera" onPress={() => showModal()} />

// PlantDetailScreen.tsx
<Button onPress={() => showModal({ preselectedPlant: plant })} />

// GardenOverviewScreen.tsx
<QuickAction icon="camera" onPress={() => showModal()} />
```

## Service Layer

### aiPhotoOrchestrator.ts

```typescript
interface AIPhotoAnalysis {
  plantIdentification: {
    name: string;
    scientificName: string;
    confidence: number;
    family: string;
    commonNames: string[];
  };
  diseaseAnalysis: {
    status: 'gesund' | 'krank' | 'unsicher';
    diseases: Array<{
      name: string;
      label: string;
      score: number;
      description: string;
    }>;
    remainingRequests: number;
  };
  healthStatus: 'gesund' | 'krank' | 'unsicher';
  matchingPlants: Plant[];
  bestMatch: Plant | null;
  analysisId?: string;
}

async function analyzePhoto(
  photoUri: string,
  existingPlants: Plant[]
): Promise<AIPhotoAnalysis>

function findMatchingPlants(
  identifiedName: string,
  existingPlants: Plant[]
): Plant[]
```

### useAIPhotoUpload.ts (Hook)

```typescript
interface UseAIPhotoUpload {
  state: AIPhotoState;
  showModal: (options?: { preselectedPlant?: Plant }) => void;
  hideModal: () => void;
  takePhoto: () => Promise<void>;
  selectFromGallery: () => Promise<void>;
  analyzePhoto: () => Promise<void>;
  selectPlant: (plantId: string) => void;
  createNewPlant: () => void;
  saveAssignment: () => Promise<void>;
  isAnalyzing: boolean;
  error: string | null;
}
```

## Error Handling

### Step 1 (Foto)
- **Kamera nicht verfügbar**: "Kamera-Berechtigung fehlt. Bitte in den Einstellungen erlauben."
- **Bild zu groß**: Automatische Komprimierung auf 1200x1200
- **Kein Netzwerk**: "Offline-Modus. Analyse wird bei Netzwerkverbindung fortgesetzt."

### Step 2 (KI-Analyse)
- **PlantNet API Fehler**: Fallback auf OpenZen nur
- **Disease API Fehler**: "Gesundheitsanalyse nicht verfügbar"
- **Timeout (30s)**: Retry mit Progress-Anzeige
- **Rate Limit**: "Tageslimit erreicht. Bitte morgen erneut versuchen."

### Step 3 (Ergebnis)
- **Keine Pflanze erkannt**: "Keine Pflanze erkannt. Bitte manuell zuordnen oder neue erstellen."
- **Niedrige Konfidenz (<50%)**: "Bitte überprüfen: Möglicherweise [Pflanzenname]"
- **Keine Matching Plants**: Direkt zu "Neue Pflanze erstellen"

### Step 4 (Zuordnung)
- **Upload fehlgeschlagen**: Retry-Button
- **Datenbank-Fehler**: "Lokal gespeichert. Wird bei nächster Verbindung synchronisiert."

## Datenbank-Änderungen

### Bestehende Tabellen (keine Änderungen nötig)
- `photos` - wird bereits verwendet
- `photo_plants` - Junction-Tabelle existiert
- `health_checks` - wird bereits verwendet
- `plants` - wird bereits verwendet

### Neue Tabelle (optional, für Caching)
```sql
-- ai_photo_cache: Caching von KI-Analysen
CREATE TABLE ai_photo_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_hash TEXT NOT NULL UNIQUE,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

## Testing-Strategie

### Unit Tests
- `aiPhotoOrchestrator.ts`: Alle KI-Orchestrierung
- `findMatchingPlants()`: Matching-Logik
- `calculateHealthStatus()`: Gesundheitsberechnung

### Integration Tests
- `useAIPhotoUpload` Hook: State-Transitions
- `AIPhotoModal`: Step-Wechsel

### E2E Tests
- Gesamtflow: Foto → Analyse → Zuordnung → Speichern

## Performance-Optimierung

1. **Parallele KI-Aufrufe**: Alle 3 APIs gleichzeitig aufrufen
2. **Bild-Komprimierung**: 1200x1200, 70% JPEG-Qualität
3. **Caching**: KI-Ergebnisse für identische Bilder cachen
4. **Progressive Loading**: Ergebnisse einzeln anzeigen wenn verfügbar

## Abhängigkeiten

### Bestehende Services
- `photoService.ts` - Foto-Upload
- `healthCheckService.ts` - Gesundheitschecks
- `plantDiseaseService.ts` - PlantNet Disease API
- `aiService.ts` - PlantNet Identification API
- `plantService.ts` - Pflanzen-Datenbank

### Externe APIs
- PlantNet API (Pflanzenerkennung)
- PlantNet Disease API (Krankheitserkennung)
- OpenZen API via Supabase Edge Function (LLM-Analyse)

### NPM-Pakete
- `expo-image-picker` - Kamera/Galerie
- `expo-image-manipulator` - Bildkomprimierung
- `react-native-bottom-sheet` - Bottom Sheet Modal
- `lottie-react-native` - Animationen (optional)

## Implementierungsreihenfolge

1. **Phase 1**: aiPhotoOrchestrator.ts (Service Layer)
2. **Phase 2**: useAIPhotoUpload.ts (Hook)
3. **Phase 3**: AIPhotoModal.tsx (UI Komponenten)
4. **Phase 4**: Integration in bestehende Screens
5. **Phase 5**: Error Handling & Polish

## Akzeptanzkriterien

- [ ] Foto kann von überall aufgenommen werden
- [ ] KI erkennt Pflanze mit >70% Konfidenz
- [ ] Gesundheitsstatus wird automatisch bewertet
- [ ] Passende Pflanzen im Garten werden angezeigt
- [ ] Automatischer Vorschlag bei >80% Konfidenz
- [ ] Dropdown bei Ablehnung oder niedriger Konfidenz
- [ ] Neue Pflanze kann erstellt werden
- [ ] Gesundheitsstatus wird mit Foto verknüpft
- [ ] Ladeanimation während KI-Analyse
- [ ] Error-Handling für alle Fehlerfälle
- [ ] Offline-Modus mit Retry
