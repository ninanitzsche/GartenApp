# Design Spec: KI-Foto-Analyse mit Gesundheitsbewertung

## Übersicht

Erweiterung der bestehenden `AIPhotoPicker.tsx` Komponente um automatische Gesundheitsbewertung, Pflanzen-Matching und Zuordnungs-Flow. Verfügbar von überall in der App.

## Anforderungen

### Funktionale Anforderungen
- **FR-01**: Foto aufnehmen oder aus Galerie wählen (✓ existiert)
- **FR-02**: Automatische Pflanzenerkennung via PlantNet API (✓ existiert)
- **FR-03**: Automatische Gesundheitsbewertung via PlantNet Disease API
- **FR-04**: Matching mit existierenden Pflanzen im Garten
- **FR-05**: Automatischer Vorschlag bei hoher Konfidenz (>80%)
- **FR-06**: Fallback auf Dropdown bei Ablehnung oder niedriger Konfidenz
- **FR-07**: Möglichkeit neue Pflanze zu erstellen
- **FR-08**: Gesundheitsstatus wird mit dem Foto verknüpft

### Nicht-funktionale Anforderungen
- **NFR-01**: Ladeanimation während KI-Analyse (max 30s Timeout)
- **NFR-02**: Parallele KI-Aufrufe via `Promise.allSettled` (Partial-Results)
- **NFR-03**: Offline-Fähigkeit mit Retry-Logik
- **NFR-04**: Wiederverwendbar von überall in der App

## Bestehende Komponenten (werden erweitert)

```
src/
├── components/
│   └── AIPhotoPicker.tsx          ← ERWEITERN (bereits existent)
├── services/
│   ├── aiService.ts               ✓ PlantNet Identification
│   ├── plantDiseaseService.ts     ✓ PlantNet Disease API
│   ├── healthCheckService.ts      ✓ Health Check CRUD
│   ├── cacheService.ts            ✓ AsyncStorage Caching
│   └── plantService.ts            ✓ Pflanzen-Datenbank
```

## Architektur

### Komponentendiagramm

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AIPhotoPicker.tsx (erweitert)              │   │
│  │  Step 1: Camera/Gallery → Step 2: Loading → Step 3:    │   │
│  │  Results + Health → Step 4: Assignment                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              aiPhotoOrchestrator.ts (NEU)               │   │
│  │  • Koordiniert parallele KI-Aufrufe (allSettled)        │   │
│  │  • Partial-Result-Handling                              │   │
│  │  • Error Handling & Retry Logic                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ PlantNet    │    │ PlantNet    │    │ plantService │         │
│  │ Identify    │    │ Disease     │    │ (Matching)   │         │
│  │ (Pflanze)   │    │ (Krankheit) │    │              │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                    │                    │             │
│         └────────────────────┼────────────────────┘             │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Ergebnis-Objekt                            │   │
│  │  {                                                      │   │
│  │    plantIdentification: PlantIdentificationResult,      │   │
│  │    diseaseAnalysis: PlantDiseaseData | null,            │   │
│  │    healthStatus: 'gesund' | 'krank' | 'unsicher',       │   │
│  │    matchingPlants: Plant[],                             │   │
│  │    bestMatch: Plant | null                              │   │
│  │  }                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Datenfluss

1. **Foto-Aufnahme**: Nutzer macht Foto oder wählt aus Galerie (✓ existiert)
2. **Komprimierung**: Bild wird auf 1200x1200 komprimiert
3. **Parallele KI-Aufrufe** (`Promise.allSettled`):
   - PlantNet Identification API (Pflanzenerkennung)
   - PlantNet Disease API (Krankheitserkennung)
   - Plant Matching (existierende Pflanzen)
4. **Partial-Results**: Ergebnisse werden einzeln angezeigt wenn verfügbar
5. **Zuordnung**: Nutzer bestätigt oder wählt aus

## UI-Änderungen an AIPhotoPicker.tsx

### Step 1: Foto aufnehmen (✓ existiert)
- Keine Änderungen nötig

### Step 2: KI analysiert (NEU)
- Ladeanimation mit Progress
- Status-Texte:
  - "Pflanze wird identifiziert..." (PlantNet)
  - "Gesundheit wird analysiert..." (Disease API)
  - "Passende Pflanzen werden gesucht..." (Matching)

### Step 3: Ergebnis + Gesundheit (ERWEITERT)
- **Bestehend**: Pflanzenname, wissenschaftlicher Name, Konfidenz
- **NEU**: Gesundheitsstatus mit Icon (✅/⚠️/❌)
- **NEU**: Krankheiten-Liste (falls vorhanden)
- **NEU**: Liste der passenden Pflanzen im Garten

### Step 4: Zuordnung (NEU)
- Bestätigung bei automatischem Vorschlag
- Dropdown bei manueller Auswahl
- "Neue Pflanze erstellen" Option

### Trigger-Punkte (unverändert)
```typescript
// HomeScreen.tsx - FAB Button
<AIFabButton onPress={() => setAIPickerVisible(true)} />

// PlantListScreen.tsx - Toolbar Icon
<IconButton icon="camera" onPress={() => setAIPickerVisible(true)} />

// PlantDetailScreen.tsx - Erweiterter Flow
<AIPhotoPicker
  visible={aiPickerVisible}
  onClose={() => setAIPickerVisible(false)}
  onPlantIdentified={handlePlantIdentified}
  linkedPlantId={plant.id}  // NEU: für Matching
/>
```

## Service Layer

### aiPhotoOrchestrator.ts (NEU)

```typescript
interface AIPhotoAnalysis {
  plantIdentification: PlantIdentificationResult | null;
  diseaseAnalysis: PlantDiseaseData | null;
  healthStatus: 'gesund' | 'krank' | 'unsicher';
  matchingPlants: Plant[];
  bestMatch: Plant | null;
  errors: {
    identification?: string;
    disease?: string;
    matching?: string;
  };
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

### Promise.allSettled für Partial-Results

```typescript
const results = await Promise.allSettled([
  identifyPlant(photoUri),
  identifyDisease(photoUri),
  findMatchingPlants(identifiedName, existingPlants),
]);

// Partial-Result-Handling
const analysis: AIPhotoAnalysis = {
  plantIdentification: results[0].status === 'fulfilled' ? results[0].value : null,
  diseaseAnalysis: results[1].status === 'fulfilled' ? results[1].value : null,
  matchingPlants: results[2].status === 'fulfilled' ? results[2].value : [],
  healthStatus: calculateHealthStatus(
    results[1].status === 'fulfilled' ? results[1].value : null
  ),
  errors: {
    identification: results[0].status === 'rejected' ? results[0].reason : undefined,
    disease: results[1].status === 'rejected' ? results[1].reason : undefined,
    matching: results[2].status === 'rejected' ? results[2].reason : undefined,
  },
};
```

## Error Handling

### Step 1 (Foto) - ✓ existiert bereits
- Kamera nicht verfügbar → Berechtigungs-Dialog
- Bild zu groß → Automatische Komprimierung

### Step 2 (KI-Analyse)
- **PlantNet API Fehler**: Fallback auf manuelle Zuordnung
- **Disease API Fehler**: "Gesundheitsanalyse nicht verfügbar" (graceful degradation)
- **Timeout (30s)**: Retry mit Progress-Anzeige
- **Rate Limit**: "Tageslimit erreicht. Bitte morgen erneut versuchen."

### Step 3 (Ergebnis)
- **Keine Pflanze erkannt**: "Keine Pflanze erkannt. Bitte manuell zuordnen."
- **Niedrige Konfidenz (<50%)**: "Bitte überprüfen: Möglicherweise [Pflanzenname]"
- **Keine Matching Plants**: Direkt zu "Neue Pflanze erstellen"

### Step 4 (Zuordnung)
- **Upload fehlgeschlagen**: Retry-Button
- **Datenbank-Fehler**: "Lokal gespeichert. Wird bei nächster Verbindung synchronisiert."

## Caching-Strategie

### AsyncStorage (bestehend, beibehalten)
```typescript
// Bestehend in cacheService.ts
await cacheIdentification(imageHash, identification);
await cacheDisease(imageHash, diseaseData);  // NEU
```

### Key-Format
```
ai:identification:{imageHash}
ai:disease:{imageHash}
```

## API-Sicherheit

### PlantNet API Key
- **Aktuell**: Clientseitig via `EXPO_PUBLIC_PLANTNET_API_KEY`
- **Empfehlung**: Supabase Edge Function Proxy (wie ai-proxy)
- **Status**: Muss separat implementiert werden (nicht Teil dieses Features)

## Testing-Strategie

### Unit Tests
- `aiPhotoOrchestrator.ts`: Alle KI-Orchestrierung
- `findMatchingPlants()`: Matching-Logik
- `calculateHealthStatus()`: Gesundheitsberechnung

### Integration Tests
- `AIPhotoPicker` erweitert: Step-Wechsel
- Partial-Result-Handling

### E2E Tests
- Gesamtflow: Foto → Analyse → Zuordnung → Speichern

## Performance-Optimierung

1. **Parallele KI-Aufrufe**: `Promise.allSettled` für Partial-Results
2. **Bild-Komprimierung**: 1200x1200, 70% JPEG-Qualität
3. **Caching**: KI-Ergebnisse via AsyncStorage
4. **Progressive Loading**: Ergebnisse einzeln anzeigen

## Implementierungsreihenfolge

1. **Phase 1**: aiPhotoOrchestrator.ts (Service Layer)
2. **Phase 2**: AIPhotoPicker.tsx erweitern (UI)
3. **Phase 3**: Integration in bestehende Screens
4. **Phase 4**: Error Handling & Polish

## Akzeptanzkriterien

- [ ] Foto kann von überall aufgenommen werden (✓ existiert)
- [ ] KI erkennt Pflanze mit >70% Konfidenz
- [ ] Gesundheitsstatus wird automatisch bewertet
- [ ] Passende Pflanzen im Garten werden angezeigt
- [ ] Automatischer Vorschlag bei >80% Konfidenz
- [ ] Dropdown bei Ablehnung oder niedriger Konfidenz
- [ ] Neue Pflanze kann erstellt werden
- [ ] Gesundheitsstatus wird mit Foto verknüpft
- [ ] Ladeanimation während KI-Analyse
- [ ] Error-Handling für alle Fehlerfälle (graceful degradation)
- [ ] Offline-Modus mit Retry
