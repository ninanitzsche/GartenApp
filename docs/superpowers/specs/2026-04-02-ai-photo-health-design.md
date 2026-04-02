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
- **NFR-02**: Sequenzieller KI-Flow mit Partial-Results
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
│   ├── aiIntegrationService.ts    ✓ AI Caching & Integration (ERWEITERN)
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
│  │         aiIntegrationService.ts (ERWEITERN)             │   │
│  │  • analyzePhotoWithHealth() - Orchestrator              │   │
│  │  • Sequenzieller Flow: Identification → Disease+Match   │   │
│  │  • Caching via bestehendes System                       │   │
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
2. **Komprimierung**: Bild wird auf max 1200px Breite komprimiert via `expo-image-manipulator`
3. **Sequenzieller KI-Flow**:
   - **Schritt 3a**: PlantNet Identification (Pflanzenerkennung) - MUSS zuerst laufen
   - **Schritt 3b**: Parallel nach Identification:
     - PlantNet Disease API (Krankheitserkennung)
     - Plant Matching (existierende Pflanzen) - benötigt Identification-Result
4. **Progressive Results**: Ergebnisse werden angezeigt wenn verfügbar
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

### aiIntegrationService.ts (ERWEITERN - nicht neuer Service!)

```typescript
// NEU: Gesamtanalyse mit Gesundheit
export async function analyzePhotoWithHealth(
  photoUri: string,
  existingPlants: Plant[]
): Promise<AIPhotoAnalysis> {
  // Schritt 1: Identification MUSS zuerst laufen
  let identification: PlantIdentificationResult;
  try {
    identification = await aiIdentificationWithCache(photoUri);
  } catch (error) {
    return {
      plantIdentification: null,
      diseaseAnalysis: null,
      healthStatus: 'unsicher',
      matchingPlants: [],
      bestMatch: null,
      errors: { identification: (error as Error).message },
    };
  }

  // Schritt 2: Disease + Matching parallel
  const [diseaseResult, matchingResult] = await Promise.allSettled([
    identifyDiseaseWithCache(photoUri),
    findMatchingPlants(identification.name, existingPlants),
  ]);

  return {
    plantIdentification: identification,
    diseaseAnalysis: diseaseResult.status === 'fulfilled' ? diseaseResult.value : null,
    matchingPlants: matchingResult.status === 'fulfilled' ? matchingResult.value : [],
    healthStatus: calculateHealthStatus(
      diseaseResult.status === 'fulfilled' ? diseaseResult.value : null
    ),
    errors: {
      identification: undefined,
      disease: diseaseResult.status === 'rejected' ? diseaseResult.reason : undefined,
      matching: matchingResult.status === 'rejected' ? matchingResult.reason : undefined,
    },
  };
}

// NEU: Disease mit Caching
export async function identifyDiseaseWithCache(
  imageUri: string
): Promise<PlantDiseaseData | null> {
  const imageHash = generateSimpleHash(imageUri);
  
  const cached = await getAICache<PlantDiseaseData>('pest', imageHash);
  if (cached.found && cached.data) {
    return cached.data;
  }

  const diseaseData = await identifyDisease(imageUri);
  if (diseaseData) {
    await cachePestDetection(imageUri, diseaseData);
  }
  
  return diseaseData;
}

// NEU: Pflanzen-Matching
export function findMatchingPlants(
  identifiedName: string,
  existingPlants: Plant[]
): Plant[] {
  const nameLower = identifiedName.toLowerCase();
  
  return existingPlants.filter(plant => {
    const plantName = (plant.name || '').toLowerCase();
    const latinName = (plant.latin_name || '').toLowerCase();
    
    // Fuzzy Matching: Enthält oder wird enthalten
    return plantName.includes(nameLower) || 
           nameLower.includes(plantName) ||
           latinName.includes(nameLower) ||
           nameLower.includes(latinName);
  });
}
```

### Callback-Signatur (ERWEITERT - nicht geändert!)

```typescript
// Bestehend in AIPhotoPicker.tsx
interface AIPhotoPickerProps {
  visible: boolean;
  onClose: () => void;
  onPlantIdentified: (result: PlantIdentificationResult) => void;  // ✓ bleibt
  linkedPlantId?: string;
  // NEU: Optional erweiterte Callbacks
  onAnalysisComplete?: (analysis: AIPhotoAnalysis) => void;  // NEU: Optional
}

// Consumer können beide Callbacks nutzen:
// Alte Consumer: onPlantIdentified (weiterhin kompatibel)
// Neue Consumer: onAnalysisComplete (mit vollständiger Analyse)
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
// Bestehend in cacheService.ts - KEINE neuen Funktionen nötig!
await cacheAIIdentification(imageHash, identification);  // ✓ existiert
await cachePestDetection(imageHash, diseaseData);        // ✓ existiert

// Bestehendes getAICache nutzen:
const cached = await getAICache<PlantDiseaseData>('pest', imageHash);
```

### Key-Format (bestehend)
```
ai:plant:{imageHash}     // ✓ existiert
ai:pest:{imageHash}      // ✓ existiert
ai:suggestion:{plantId}  // ✓ existiert
```

## Timeout-Handling

```typescript
// In plantDiseaseService.ts - NEU: AbortController hinzufügen
export async function identifyDisease(
  imageUri: string,
  organ: 'leaf' | 'flower' | 'fruit' | 'bark' | 'auto' = 'auto'
): Promise<PlantDiseaseData | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    // ... restliche Logik
  } finally {
    clearTimeout(timeout);
  }
}
```

## Bildkomprimierung

```typescript
// In aiIntegrationService.ts - NEU
import * as ImageManipulator from 'expo-image-manipulator';

export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],  // NUR Breite, Höhe proportional!
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
```

## API-Sicherheit

### PlantNet API Key
- **Aktuell**: Clientseitig via `EXPO_PUBLIC_PLANTNET_API_KEY`
- **Empfehlung**: Supabase Edge Function Proxy (wie ai-proxy)
- **Status**: Separate Aufgabe (nicht Teil dieses Features)

## Testing-Strategie

### Unit Tests
- `analyzePhotoWithHealth()`: Orchestrator-Logik
- `findMatchingPlants()`: Matching-Logik
- `calculateHealthStatus()`: Gesundheitsberechnung

### Integration Tests
- `AIPhotoPicker` erweitert: Step-Wechsel
- Partial-Result-Handling

### E2E Tests
- Gesamtflow: Foto → Analyse → Zuordnung → Speichern

## Performance-Optimierung

1. **Sequenzieller KI-Flow**: Identification zuerst, dann Disease + Matching parallel
2. **Bild-Komprimierung**: Max 1200px Breite, 70% JPEG-Qualität
3. **Caching**: KI-Ergebnisse via AsyncStorage (bestehend)
4. **Progressive Loading**: Ergebnisse einzeln anzeigen
5. **Timeout**: 30s für alle KI-Aufrufe via AbortController

## Implementierungsreihenfolge

1. **Phase 1**: aiIntegrationService.ts erweitern (Service Layer)
2. **Phase 2**: AIPhotoPicker.tsx erweitern (UI)
3. **Phase 3**: Integration in bestehende Screens (Callback erweitern)
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
- [ ] Bestehende Consumer bleiben kompatibel (onPlantIdentified Callback)
