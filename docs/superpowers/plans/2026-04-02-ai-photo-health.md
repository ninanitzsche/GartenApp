# KI-Foto-Analyse mit Gesundheitsbewertung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Erweitere die bestehende AIPhotoPicker-Komponente um automatische Gesundheitsbewertung, Pflanzen-Matching und Zuordnungs-Flow

**Architecture:** Sequenzieller KI-Flow (PlantNet → Disease+Matching parallel) mit bestehendem aiIntegrationService als Orchestrator, erweiterte AIPhotoPicker UI mit 4 Steps

**Tech Stack:** React Native, Expo, Supabase, PlantNet API, AsyncStorage

---

## File Structure

### Dateien die erstellt werden:
- `src/components/AIPhotoStep2.tsx` - Loading-Animation Step
- `src/components/AIPhotoStep3.tsx` - Ergebnis + Gesundheit Step
- `src/components/AIPhotoStep4.tsx` - Zuordnung Step
- `src/__tests__/aiIntegrationService.test.ts` - Tests für Orchestrator
- `src/__tests__/AIPhotoPicker.test.tsx` - Tests für UI

### Dateien die modifiziert werden:
- `src/services/aiIntegrationService.ts` - analyzePhotoWithHealth(), identifyDiseaseWithCache(), findMatchingPlants()
- `src/components/AIPhotoPicker.tsx` - Erweitern um Steps 2-4
- `src/types/ai.ts` - AIPhotoAnalysis Interface (✓ bereits hinzugefügt)
- `src/services/cacheService.ts` - cacheDisease() (✓ bereits hinzugefügt)
- `src/services/aiService.ts` - AbortController (✓ bereits hinzugefügt)
- `src/services/plantDiseaseService.ts` - AbortController (✓ bereits hinzugefügt)

### Bestehende Services (verifiziert):
- `src/services/photoService.ts` - uploadPhoto(), enrichPhotoWithUrl()
- `src/services/healthCheckService.ts` - createHealthCheck(), fetchHealthChecks()
- `src/services/plantService.ts` - createPlant(), fetchPlants(), searchPlants()
- `src/components/TaskSuggestionModal.tsx` - Bestehender Task-Suggestion-Flow

---

## Task 1: AIPhotoAnalysis Interface definieren

**Files:**
- Modify: `src/types/ai.ts:247-260`

Das Interface wurde bereits in der Spec-Phase hinzugefügt. Verifiziere die korrekte Definition:

```typescript
// Bereits in ai.ts vorhanden:
export interface AIPhotoAnalysis {
  plantIdentification: PlantIdentificationResult | null;
  diseaseAnalysis: PlantDiseaseData | null;
  healthStatus: 'gesund' | 'krank' | 'unsicher';
  matchingPlants: Plant[];  // Plant type aus types/plant.ts
  bestMatch: Plant | null;
  errors?: {
    identification?: string;
    disease?: string;
    matching?: string;
  };
}
```

- [ ] **Step 1: Verifiziere Interface in ai.ts**
  - Prüfe ob AIPhotoAnalysis existiert
  - Prüfe ob alle Felder korrekt definiert sind

- [ ] **Step 2: Importiere Plant Typ**
  - Ändere `any[]` zu `Plant[]` für matchingPlants
  - Ändere `any | null` zu `Plant | null` für bestMatch
  - Füge Import für Plant hinzu: `import { Plant } from './plant';`

- [ ] **Step 3: Commit**
```bash
git add src/types/ai.ts
git commit -m "fix: update AIPhotoAnalysis to use Plant type"
```

---

## Task 2: Bildkomprimierung implementieren

**Files:**
- Modify: `src/services/aiIntegrationService.ts`
- Create: `src/__tests__/aiIntegrationService.test.ts`

- [ ] **Step 1: Schreibe Tests für compressImage()**

```typescript
// src/__tests__/aiIntegrationService.test.ts
import { compressImage } from '../services/aiIntegrationService';

describe('compressImage', () => {
  it('should compress image to max 1200px width', async () => {
    const result = await compressImage('file://test-image.jpg');
    expect(result).toBeDefined();
    expect(result).toMatch(/^file:\/\//);
  });

  it('should handle invalid URI gracefully', async () => {
    await expect(compressImage('invalid-uri')).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Führe Tests aus - erwarte FAIL**
```bash
npm run test -- src/__tests__/aiIntegrationService.test.ts
```

- [ ] **Step 3: Implementiere compressImage()**

```typescript
// src/services/aiIntegrationService.ts
import * as ImageManipulator from 'expo-image-manipulator';

export async function compressImage(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],  // NUR Breite, Höhe proportional!
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error: any) {
    console.error('Image compression error:', error);
    throw new Error(`Bildkomprimierung fehlgeschlagen: ${error.message}`);
  }
}
```

- [ ] **Step 4: Führe Tests aus - erwarte PASS**
```bash
npm run test -- src/__tests__/aiIntegrationService.test.ts
```

- [ ] **Step 5: Commit**
```bash
git add src/services/aiIntegrationService.ts src/__tests__/aiIntegrationService.test.ts
git commit -m "feat: add image compression with expo-image-manipulator"
```

---

## Task 11: aiIntegrationService erweitern - Orchestrator

**Files:**
- Modify: `src/services/aiIntegrationService.ts`
- Create: `src/__tests__/aiIntegrationService.test.ts`

- [ ] **Step 1: Schreibe Tests für analyzePhotoWithHealth()**

```typescript
// src/__tests__/aiIntegrationService.test.ts
import { analyzePhotoWithHealth, findMatchingPlants } from '../services/aiIntegrationService';
import { Plant } from '../types/plant';

describe('analyzePhotoWithHealth', () => {
  it('should return analysis with identification, disease, and matching', async () => {
    // Mock dependencies
    const mockPlants: Plant[] = [
      { id: '1', name: 'Erdbeere', latin_name: 'Fragaria', status: 'etabliert', user_id: 'u1' },
    ];
    
    const result = await analyzePhotoWithHealth('test-uri', mockPlants);
    
    expect(result).toHaveProperty('plantIdentification');
    expect(result).toHaveProperty('diseaseAnalysis');
    expect(result).toHaveProperty('healthStatus');
    expect(result).toHaveProperty('matchingPlants');
  });

  it('should handle identification error gracefully', async () => {
    const result = await analyzePhotoWithHealth('invalid-uri', []);
    expect(result.errors?.identification).toBeDefined();
    expect(result.plantIdentification).toBeNull();
  });
});

describe('findMatchingPlants', () => {
  const plants: Plant[] = [
    { id: '1', name: 'Erdbeere', latin_name: 'Fragaria', status: 'etabliert', user_id: 'u1' },
    { id: '2', name: 'Tomate', latin_name: 'Solanum', status: 'geplant', user_id: 'u1' },
    { id: '3', name: 'Erdbeere Mieze', latin_name: 'Fragaria', status: 'etabliert', user_id: 'u1' },
  ];

  it('should find exact name match', () => {
    const result = findMatchingPlants('Erdbeere', plants);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Erdbeere');
  });

  it('should find partial match', () => {
    const result = findMatchingPlants('Tomate', plants);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Tomate');
  });

  it('should find latin name match', () => {
    const result = findMatchingPlants('Fragaria', plants);
    expect(result).toHaveLength(2);
  });

  it('should return empty array for no match', () => {
    const result = findMatchingPlants('Gurke', plants);
    expect(result).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Führe Tests aus - erwarte FAIL**
```bash
npm run test -- src/__tests__/aiIntegrationService.test.ts
```

- [ ] **Step 3: Implementiere findMatchingPlants()**

```typescript
// src/services/aiIntegrationService.ts
import { Plant } from '../types/plant';
import { AIPhotoAnalysis } from '../types/ai';
import { identifyDisease } from './plantDiseaseService';

export function findMatchingPlants(
  identifiedName: string,
  existingPlants: Plant[]
): Plant[] {
  if (!identifiedName || existingPlants.length === 0) return [];
  
  const nameLower = identifiedName.toLowerCase().trim();
  
  return existingPlants.filter(plant => {
    const plantName = (plant.name || '').toLowerCase();
    const latinName = (plant.latin_name || '').toLowerCase();
    
    // Exakter Match
    if (plantName === nameLower || latinName === nameLower) return true;
    
    // Enthält Match
    if (plantName.includes(nameLower) || nameLower.includes(plantName)) return true;
    if (latinName.includes(nameLower) || nameLower.includes(latinName)) return true;
    
    return false;
  });
}
```

- [ ] **Step 4: Implementiere identifyDiseaseWithCache()**

```typescript
// src/services/aiIntegrationService.ts
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
    await cacheDisease(imageUri, diseaseData);
  }
  
  return diseaseData;
}
```

- [ ] **Step 5: Implementiere analyzePhotoWithHealth()**

```typescript
// src/services/aiIntegrationService.ts
export async function analyzePhotoWithHealth(
  photoUri: string,
  existingPlants: Plant[]
): Promise<AIPhotoAnalysis> {
  // Schritt 1: Identification MUSS zuerst laufen
  // Bei Fehler: Early Return (wie in Spec definiert)
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
      errors: {
        identification: (error as Error).message,
      },
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
    bestMatch: matchingResult.status === 'fulfilled' && matchingResult.value.length > 0 
      ? matchingResult.value[0] 
      : null,
    healthStatus: calculateHealthStatus(
      diseaseResult.status === 'fulfilled' ? diseaseResult.value : undefined
    ),
    errors: {
      identification: undefined,
      disease: diseaseResult.status === 'rejected' ? diseaseResult.reason : undefined,
      matching: matchingResult.status === 'rejected' ? matchingResult.reason : undefined,
    },
  };
}

function calculateHealthStatus(
  diseaseData?: PlantDiseaseData
): 'gesund' | 'krank' | 'unsicher' {
  if (!diseaseData || !diseaseData.results || diseaseData.results.length === 0) {
    return 'gesund';
  }
  const topScore = diseaseData.results[0]?.score || 0;
  if (topScore >= 0.7) return 'krank';
  if (topScore >= 0.4) return 'unsicher';
  return 'gesund';
}
```

- [ ] **Step 6: Führe Tests aus - erwarte PASS**
```bash
npm run test -- src/__tests__/aiIntegrationService.test.ts
```

- [ ] **Step 7: Commit**
```bash
git add src/services/aiIntegrationService.ts src/__tests__/aiIntegrationService.test.ts
git commit -m "feat: add analyzePhotoWithHealth orchestrator with matching and caching"
```

---

## Task 11: AIPhotoPicker Step 2 - Loading Animation

**Files:**
- Create: `src/components/AIPhotoStep2.tsx`
- Modify: `src/components/AIPhotoPicker.tsx`

- [ ] **Step 1: Erstelle AIPhotoStep2 Komponente**

```typescript
// src/components/AIPhotoStep2.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../theme/designSystemV2';

interface AIPhotoStep2Props {
  identificationStatus: 'pending' | 'loading' | 'done' | 'error';
  diseaseStatus: 'pending' | 'loading' | 'done' | 'error';
  matchingStatus: 'pending' | 'loading' | 'done' | 'error';
}

export default function AIPhotoStep2({
  identificationStatus,
  diseaseStatus,
  matchingStatus,
}: AIPhotoStep2Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <MaterialIcons name="check-circle" size={20} color={Colors2026.status.success} />;
      case 'error':
        return <MaterialIcons name="error" size={20} color={Colors2026.status.error} />;
      case 'loading':
        return <ActivityIndicator size="small" color={Colors2026.primary} />;
      default:
        return <MaterialIcons name="radio-button-unchecked" size={20} color={Colors2026.textSecondary} />;
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors2026.primary} />
      <Text style={styles.title}>KI analysiert...</Text>
      
      <View style={styles.statusList}>
        <View style={styles.statusItem}>
          {getStatusIcon(identificationStatus)}
          <Text style={styles.statusText}>Pflanze wird identifiziert...</Text>
        </View>
        <View style={styles.statusItem}>
          {getStatusIcon(diseaseStatus)}
          <Text style={styles.statusText}>Gesundheit wird analysiert...</Text>
        </View>
        <View style={styles.statusItem}>
          {getStatusIcon(matchingStatus)}
          <Text style={styles.statusText}>Passende Pflanzen werden gesucht...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors2026.text,
    marginTop: 16,
    marginBottom: 24,
  },
  statusList: {
    width: '100%',
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors2026.text,
  },
});
```

- [ ] **Step 2: Integriere Step 2 in AIPhotoPicker**

```typescript
// In AIPhotoPicker.tsx - import hinzufügen
import AIPhotoStep2 from './AIPhotoStep2';

// State für Step-Tracking
const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
const [analysisStatus, setAnalysisStatus] = useState({
  identification: 'pending' as 'pending' | 'loading' | 'done' | 'error',
  disease: 'pending' as 'pending' | 'loading' | 'done' | 'error',
  matching: 'pending' as 'pending' | 'loading' | 'done' | 'error',
});
```

- [ ] **Step 3: Commit**
```bash
git add src/components/AIPhotoStep2.tsx src/components/AIPhotoPicker.tsx
git commit -m "feat: add AIPhotoStep2 loading animation component"
```

---

## Task 11: AIPhotoPicker Step 3 - Ergebnis + Gesundheit

**Files:**
- Create: `src/components/AIPhotoStep3.tsx`
- Modify: `src/components/AIPhotoPicker.tsx`

- [ ] **Step 1: Erstelle AIPhotoStep3 Komponente**

```typescript
// src/components/AIPhotoStep3.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../theme/designSystemV2';
import { AIPhotoAnalysis } from '../types/ai';
import { Plant } from '../types/plant';

interface AIPhotoStep3Props {
  analysis: AIPhotoAnalysis;
  onSelectPlant: (plant: Plant) => void;
  onCreateNew: () => void;
  onRetry: () => void;
}

export default function AIPhotoStep3({
  analysis,
  onSelectPlant,
  onCreateNew,
  onRetry,
}: AIPhotoStep3Props) {
  const { plantIdentification, healthStatus, matchingPlants, errors } = analysis;

  const getHealthIcon = () => {
    switch (healthStatus) {
      case 'gesund':
        return { icon: 'check-circle' as const, color: Colors2026.status.success, text: 'Gesund' };
      case 'krank':
        return { icon: 'warning' as const, color: Colors2026.status.error, text: 'Krankheit erkannt' };
      case 'unsicher':
        return { icon: 'help' as const, color: Colors2026.status.warning, text: 'Unsicher' };
    }
  };

  const health = getHealthIcon();

  if (!plantIdentification) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="error-outline" size={64} color={Colors2026.status.error} />
        <Text style={styles.errorTitle}>Keine Pflanze erkannt</Text>
        <Text style={styles.errorText}>{errors?.identification || 'Unbekannter Fehler'}</Text>
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Nochmal versuchen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Pflanzen-Info */}
      <View style={styles.card}>
        <Text style={styles.plantName}>{plantIdentification.name}</Text>
        <Text style={styles.scientificName}>{plantIdentification.scientificName}</Text>
        <Text style={styles.confidence}>
          Konfidenz: {Math.round(plantIdentification.confidence * 100)}%
        </Text>
      </View>

      {/* Gesundheitsstatus */}
      <View style={styles.card}>
        <View style={styles.healthHeader}>
          <MaterialIcons name={health.icon} size={24} color={health.color} />
          <Text style={[styles.healthText, { color: health.color }]}>{health.text}</Text>
        </View>
      </View>

      {/* Matching Plants */}
      {matchingPlants.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Gefundene Pflanzen im Garten:</Text>
          {matchingPlants.map((plant) => (
            <TouchableOpacity
              key={plant.id}
              style={styles.plantItem}
              onPress={() => onSelectPlant(plant)}
            >
              <MaterialIcons name="local-florist" size={20} color={Colors2026.primary} />
              <Text style={styles.plantItemText}>{plant.name}</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors2026.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={onCreateNew}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Neue Pflanze erstellen</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: Colors2026.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  plantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors2026.text,
  },
  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors2026.textSecondary,
    marginTop: 4,
  },
  confidence: {
    fontSize: 14,
    color: Colors2026.textSecondary,
    marginTop: 8,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 12,
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  plantItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors2026.text,
  },
  actions: {
    marginTop: 8,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: Colors2026.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors2026.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors2026.status.error,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors2026.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Integriere Step 3 in AIPhotoPicker**

```typescript
// In AIPhotoPicker.tsx - import hinzufügen
import AIPhotoStep3 from './AIPhotoStep3';

// State für Analyse-Ergebnis
const [analysis, setAnalysis] = useState<AIPhotoAnalysis | null>(null);
```

- [ ] **Step 3: Commit**
```bash
git add src/components/AIPhotoStep3.tsx src/components/AIPhotoPicker.tsx
git commit -m "feat: add AIPhotoStep3 results and health display component"
```

---

## Task 11: AIPhotoPicker Step 4 - Zuordnung

**Files:**
- Create: `src/components/AIPhotoStep4.tsx`
- Modify: `src/components/AIPhotoPicker.tsx`

- [ ] **Step 1: Erstelle AIPhotoStep4 Komponente**

```typescript
// src/components/AIPhotoStep4.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../theme/designSystemV2';
import { Plant } from '../types/plant';

interface AIPhotoStep4Props {
  bestMatch: Plant | null;
  matchingPlants: Plant[];
  onConfirm: (plantId: string) => void;
  onSelectDifferent: (plantId: string) => void;
  onCreateNew: (name: string) => void;
  onBack: () => void;
}

export default function AIPhotoStep4({
  bestMatch,
  matchingPlants,
  onConfirm,
  onSelectDifferent,
  onCreateNew,
  onBack,
}: AIPhotoStep4Props) {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(
    bestMatch?.id || null
  );
  const [newPlantName, setNewPlantName] = useState('');
  const [showNewPlantForm, setShowNewPlantForm] = useState(false);

  const handleConfirm = () => {
    if (selectedPlantId) {
      onConfirm(selectedPlantId);
    }
  };

  const handleCreateNew = () => {
    if (!newPlantName.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Namen ein.');
      return;
    }
    onCreateNew(newPlantName.trim());
  };

  if (bestMatch && !showNewPlantForm) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Zuordnung bestätigen</Text>
        
        <View style={styles.matchCard}>
          <MaterialIcons name="local-florist" size={32} color={Colors2026.primary} />
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>{bestMatch.name}</Text>
            <Text style={styles.matchLocation}>
              {bestMatch.location || 'Kein Standort'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleConfirm}>
            <MaterialIcons name="check" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Ja, zuordnen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowNewPlantForm(true)}
          >
            <MaterialIcons name="add" size={20} color={Colors2026.text} />
            <Text style={styles.secondaryButtonText}>Neue Pflanze erstellen</Text>
          </TouchableOpacity>

          {matchingPlants.length > 1 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {/* Show dropdown */}}
            >
              <MaterialIcons name="swap-vert" size={20} color={Colors2026.text} />
              <Text style={styles.secondaryButtonText}>Andere Pflanze wählen</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Zurück</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Neue Pflanze erstellen</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Pflanzenname eingeben..."
        value={newPlantName}
        onChangeText={setNewPlantName}
        autoFocus
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, !newPlantName.trim() && styles.disabledButton]}
          onPress={handleCreateNew}
          disabled={!newPlantName.trim()}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Erstellen & Zuordnen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowNewPlantForm(false)}
        >
          <Text style={styles.backButtonText}>Zurück</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors2026.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors2026.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors2026.text,
  },
  matchLocation: {
    fontSize: 14,
    color: Colors2026.textSecondary,
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors2026.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors2026.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  secondaryButtonText: {
    color: Colors2026.text,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors2026.textSecondary,
    fontSize: 14,
  },
  input: {
    backgroundColor: Colors2026.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors2026.text,
    borderWidth: 1,
    borderColor: Colors2026.border,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
```

- [ ] **Step 2: Integriere Step 4 in AIPhotoPicker**

```typescript
// In AIPhotoPicker.tsx - import hinzufügen
import AIPhotoStep4 from './AIPhotoStep4';
```

- [ ] **Step 3: Commit**
```bash
git add src/components/AIPhotoStep4.tsx src/components/AIPhotoPicker.tsx
git commit -m "feat: add AIPhotoStep4 plant assignment component"
```

---

## Task 11: AIPhotoPicker Integration - Gesamtflow

**Files:**
- Modify: `src/components/AIPhotoPicker.tsx`

**Hinweis**: Der bestehende TaskSuggestion-Flow (TaskSuggestionModal + getAllSuggestions) wird beibehalten. Nach erfolgreicher Zuordnung kann optional das TaskSuggestionModal angezeigt werden.

- [ ] **Step 1: Erstelle Gesamtflow in AIPhotoPicker**

```typescript
// src/components/AIPhotoPicker.tsx - Imports
import { analyzePhotoWithHealth } from '../services/aiIntegrationService';
import { fetchPlants, createPlant } from '../services/plantService';
import { uploadPhoto } from '../services/photoService';
import { createHealthCheck } from '../services/healthCheckService';
import { Plant } from '../types/plant';

// Props Interface erweitern
interface AIPhotoPickerProps {
  visible: boolean;
  onClose: () => void;
  onPlantIdentified: (result: PlantIdentificationResult) => void;
  onAnalysisComplete?: (analysis: AIPhotoAnalysis) => void;  // NEU: Optional
  linkedPlantId?: string;
}

// Handle Identify - erweitert
const handleIdentify = async () => {
  if (!selectedImage) return;

  setCurrentStep(2);
  setIsLoading(true);
  setError(null);

  try {
    // Lade existierende Pflanzen
    const existingPlants = await fetchPlants();

    // Führe KI-Analyse durch
    const analysisResult = await analyzePhotoWithHealth(selectedImage, existingPlants);
    setAnalysis(analysisResult);

    // Cache Identification
    if (analysisResult.plantIdentification) {
      await cacheIdentification(selectedImage, analysisResult.plantIdentification);
    }

    // Auto-Suggestion bei hoher Konfidenz (>80%)
    if (analysisResult.bestMatch && analysisResult.plantIdentification?.confidence >= 0.8) {
      // Direkt zu Step 4 mit Vorselektion
      setSelectedPlantId(analysisResult.bestMatch.id);
      setCurrentStep(4);
    } else {
      setCurrentStep(3);
    }
  } catch (err: any) {
    console.error('Analysis error:', err);
    setError(err.message || 'Fehler bei der Analyse');
    setCurrentStep(1);
  } finally {
    setIsLoading(false);
  }
};

// Handle Plant Selection
const handleSelectPlant = (plant: Plant) => {
  setSelectedPlantId(plant.id);
  setCurrentStep(4);
};

// Handle Confirm Assignment
const handleConfirmAssignment = async (plantId: string) => {
  try {
    setIsLoading(true);

    // 1. Upload Photo
    const fileName = `ai-photo-${Date.now()}.jpg`;
    await uploadPhoto(plantId, selectedImage!, fileName);

    // 2. Create Health Check
    if (analysis?.diseaseAnalysis) {
      await createHealthCheck(plantId, {
        photoUri: selectedImage!,
        runAI: false, // Bereits analysiert
        notes: `KI-Analyse: ${analysis.healthStatus}`,
      });
    }

    // 3. Callback
    if (onPlantIdentified && analysis?.plantIdentification) {
      onPlantIdentified(analysis.plantIdentification);
    }

    if (onAnalysisComplete) {
      onAnalysisComplete(analysis!);
    }

    // 4. Optional: Task-Vorschläge anzeigen (bestehender Flow)
    if (analysis?.plantIdentification) {
      const suggestions = getAllSuggestions({
        plantFamily: analysis.plantIdentification.family,
        plantName: analysis.plantIdentification.name,
        linkedPlantId: plantId,
      });
      if (suggestions.length > 0) {
        setSuggestions(suggestions);
        setShowSuggestions(true);
        return; // Modal wird geschlossen nach Suggestions
      }
    }

    handleClose();
    Alert.alert('Erfolg', 'Foto wurde zugeordnet!');
  } catch (err: any) {
    Alert.alert('Fehler', err.message);
  } finally {
    setIsLoading(false);
  }
};

// Handle Create New Plant
const handleCreateNewPlant = async (name: string) => {
  try {
    setIsLoading(true);

    // 1. Create Plant
    const newPlant = await createPlant({
      name,
      status: 'geplant',
      identification_source: analysis?.plantIdentification ? 'ai' : 'manual',
    });

    // 2. Assign Photo + Health
    await handleConfirmAssignment(newPlant.id);
  } catch (err: any) {
    Alert.alert('Fehler', err.message);
  } finally {
    setIsLoading(false);
  }
};
```

- [ ] **Step 2: Erstelle Step-Rendering**

```typescript
// In AIPhotoPicker.tsx - renderContent erweitern
const renderContent = () => {
  switch (currentStep) {
    case 1:
      // Bestehender Step 1 (Foto aufnehmen)
      return renderStep1();
    
    case 2:
      // Loading Animation
      return (
        <AIPhotoStep2
          identificationStatus={analysisStatus.identification}
          diseaseStatus={analysisStatus.disease}
          matchingStatus={analysisStatus.matching}
        />
      );
    
    case 3:
      // Ergebnis + Gesundheit
      if (!analysis) return null;
      return (
        <AIPhotoStep3
          analysis={analysis}
          onSelectPlant={handleSelectPlant}
          onCreateNew={() => setCurrentStep(4)}
          onRetry={() => setCurrentStep(1)}
        />
      );
    
    case 4:
      // Zuordnung
      return (
        <AIPhotoStep4
          bestMatch={analysis?.bestMatch || null}
          matchingPlants={analysis?.matchingPlants || []}
          onConfirm={handleConfirmAssignment}
          onSelectDifferent={handleSelectPlant}
          onCreateNew={handleCreateNewPlant}
          onBack={() => setCurrentStep(3)}
        />
      );
  }
};
```

- [ ] **Step 3: Commit**
```bash
git add src/components/AIPhotoPicker.tsx
git commit -m "feat: integrate full AI photo analysis flow with 4 steps"
```

---

## Task 11: Tests für AIPhotoPicker

**Files:**
- Create: `src/__tests__/AIPhotoPicker.test.tsx`

- [ ] **Step 1: Schreibe Integration Tests**

```typescript
// src/__tests__/AIPhotoPicker.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AIPhotoPicker from '../components/AIPhotoPicker';

describe('AIPhotoPicker', () => {
  const mockOnClose = jest.fn();
  const mockOnPlantIdentified = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Step 1 initially', () => {
    const { getByText } = render(
      <AIPhotoPicker
        visible={true}
        onClose={mockOnClose}
        onPlantIdentified={mockOnPlantIdentified}
      />
    );
    expect(getByText('Kamera')).toBeTruthy();
    expect(getByText('Galerie')).toBeTruthy();
  });

  it('should transition to Step 2 on identify', async () => {
    const { getByText } = render(
      <AIPhotoPicker
        visible={true}
        onClose={mockOnClose}
        onPlantIdentified={mockOnPlantIdentified}
      />
    );

    // Mock image selection
    fireEvent.press(getByText('Galerie'));

    await waitFor(() => {
      expect(getByText('KI analysiert...')).toBeTruthy();
    });
  });

  it('should show results in Step 3', async () => {
    // Full flow test
  });
});
```

- [ ] **Step 2: Führe Tests aus**
```bash
npm run test -- src/__tests__/AIPhotoPicker.test.tsx
```

- [ ] **Step 3: Commit**
```bash
git add src/__tests__/AIPhotoPicker.test.tsx
git commit -m "test: add AIPhotoPicker integration tests"
```

---

## Task 11: Integration in Screens

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/screens/PlantListScreen.tsx`
- Modify: `src/screens/PlantDetailScreen.tsx`

- [ ] **Step 1: Füge AIPhotoPicker zu HomeScreen hinzu**

```typescript
// HomeScreen.tsx
import AIPhotoPicker from '../components/AIPhotoPicker';

// State
const [aiPickerVisible, setAIPickerVisible] = useState(false);

// FAB Button
<IconButton
  icon="camera"
  onPress={() => setAIPickerVisible(true)}
/>

// Modal
<AIPhotoPicker
  visible={aiPickerVisible}
  onClose={() => setAIPickerVisible(false)}
  onPlantIdentified={(result) => {
    // Navigation zu neuer Pflanze oder Update
  }}
/>
```

- [ ] **Step 2: Füge AIPhotoPicker zu PlantListScreen hinzu**

```typescript
// PlantListScreen.tsx - Toolbar
<IconButton
  icon="camera"
  onPress={() => setAIPickerVisible(true)}
/>
```

- [ ] **Step 3: Erweitere PlantDetailScreen**

```typescript
// PlantDetailScreen.tsx
<AIPhotoPicker
  visible={aiPickerVisible}
  onClose={() => setAIPickerVisible(false)}
  onPlantIdentified={handlePhotoIdentified}
  linkedPlantId={plant.id}  // Pre-select this plant
/>
```

- [ ] **Step 4: Commit**
```bash
git add src/screens/HomeScreen.tsx src/screens/PlantListScreen.tsx src/screens/PlantDetailScreen.tsx
git commit -m "feat: integrate AIPhotoPicker in Home, PlantList, and PlantDetail screens"
```

---

## Task 11: Error Handling & Polish

**Files:**
- Modify: `src/components/AIPhotoPicker.tsx`
- Modify: `src/components/AIPhotoStep2.tsx`
- Modify: `src/components/AIPhotoStep3.tsx`

- [ ] **Step 1: Füge Error-States hinzu**

```typescript
// In AIPhotoStep3.tsx - Error-Handling
if (errors?.identification) {
  return (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={64} color={Colors2026.status.error} />
      <Text style={styles.errorTitle}>Identifikation fehlgeschlagen</Text>
      <Text style={styles.errorText}>{errors.identification}</Text>
      <TouchableOpacity onPress={onRetry}>
        <Text style={styles.retryText}>Nochmal versuchen</Text>
      </TouchableOpacity>
    </View>
  );
}

if (errors?.disease) {
  // Graceful degradation - zeige Pflanze ohne Gesundheit
}
```

- [ ] **Step 2: Füge Timeout-Handling hinzu**

```typescript
// In AIPhotoPicker.tsx
const ANALYSIS_TIMEOUT = 30000; // 30s

useEffect(() => {
  if (currentStep === 2) {
    const timeout = setTimeout(() => {
      setError('Analyse hat zu lange gedauert. Bitte erneut versuchen.');
      setCurrentStep(1);
    }, ANALYSIS_TIMEOUT);

    return () => clearTimeout(timeout);
  }
}, [currentStep]);
```

- [ ] **Step 3: Füge Loading-States hinzu**

```typescript
// Disable buttons during loading
<TouchableOpacity
  style={[styles.button, isLoading && styles.disabledButton]}
  disabled={isLoading}
>
```

- [ ] **Step 4: Commit**
```bash
git add src/components/AIPhotoPicker.tsx src/components/AIPhotoStep3.tsx
git commit -m "feat: add error handling, timeout, and loading states to AI photo flow"
```

---

## Task 11: Finale Tests & Cleanup

- [ ] **Step 1: Führe alle Tests aus**
```bash
npm run test
```

- [ ] **Step 2: Führe Linter aus**
```bash
npm run lint
```

- [ ] **Step 3: Behebe alle Fehler**

- [ ] **Step 4: Finale Commits**

- [ ] **Step 5: Update README/Docs**
