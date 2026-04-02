# Plant Health Check Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add health check button to PlantDetailScreen - allows users to upload a photo and identify plant diseases using PlantNet Diseases API.

**Architecture:** New service for PlantNet diseases API, integrated button on PlantDetailScreen, results stored in plant record.

**Tech Stack:** React Native, Expo ImagePicker, PlantNet Diseases API, Supabase

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/types/ai.ts` | Add PlantDiseaseData type |
| `src/services/plantDiseaseService.ts` | NEW - PlantNet diseases API client |
| `src/types/plant.ts` | Add disease_data field to Plant type |
| `src/screens/PlantDetailScreen.tsx` | Add health check button + display results |
| `supabase/migrations/` | Add disease_data column to plants table |

---

## Task 1: Add Disease Types

**Files:**
- Modify: `src/types/ai.ts`

- [ ] **Step 1: Add PlantDiseaseData interface**

Add to end of file:

```typescript
export interface PlantDiseaseData {
  results: Array<{
    name: string;
    label: string;
    score: number;
    description: string;
    images?: Array<{
      organ: string;
      url: { o: string; m: string; s: string };
      author: string;
      license: string;
    }>;
  }>;
  remainingRequests: number;
  identifiedAt: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/ai.ts
git commit -m "types: add PlantDiseaseData interface"
```

---

## Task 2: Plant Disease Service

**Files:**
- Create: `src/services/plantDiseaseService.ts`

- [ ] **Step 1: Create disease service**

```typescript
import { PlantDiseaseData } from '../types/ai';

const PLANTNET_BASE_URL = 'https://my-api.plantnet.org/v2';

export async function identifyDisease(
  imageUri: string,
  organ: 'leaf' | 'flower' | 'fruit' | 'bark' | 'auto' = 'auto'
): Promise<PlantDiseaseData | null> {
  const apiKey = process.env.EXPO_PUBLIC_PLANTNET_API_KEY;
  
  if (!apiKey) {
    console.warn('PlantNet API key not configured');
    return null;
  }

  try {
    const formData = new FormData();
    
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('images', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
    
    formData.append('organs', organ);
    formData.append('nb-results', '3');
    
    const response = await fetch(
      `${PLANTNET_BASE_URL}/diseases/identify?api-key=${apiKey}&lang=de`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      console.error('PlantNet disease API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    return {
      results: data.results || [],
      remainingRequests: data.remainingIdentificationRequests || 0,
      identifiedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Disease identification error:', error);
    return null;
  }
}

export async function getDiseaseList(): Promise<Array<{ label: string; name: string }>> {
  const apiKey = process.env.EXPO_PUBLIC_PLANTNET_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `${PLANTNET_BASE_URL}/diseases?api-key=${apiKey}&prefix=1R`
    );
    return await response.json();
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/plantDiseaseService.ts
git commit -m "feat: add PlantNet diseases API service"
```

---

## Task 3: Database Schema

**Files:**
- Create: `supabase/migrations/202603271600_plant_disease_data.sql`

- [ ] **Step 1: Create migration**

```sql
-- Add disease_data column to plants table
ALTER TABLE plants ADD COLUMN IF NOT EXISTS disease_data JSONB;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMPTZ;
```

- [ ] **Step 2: Push migration**

```bash
npx supabase db push
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "db: add disease_data column to plants"
```

---

## Task 4: Update Plant Type

**Files:**
- Modify: `src/types/plant.ts`

- [ ] **Step 1: Add disease fields to Plant type**

```typescript
export interface Plant {
  // ... existing fields
  disease_data?: any;
  last_health_check?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/plant.ts
git commit -m "types: add disease_data to Plant"
```

---

## Task 5: PlantDetailScreen - Add Health Check

**Files:**
- Modify: `src/screens/PlantDetailScreen.tsx`

- [ ] **Step 1: Add imports**

```typescript
import * as ImagePicker from 'expo-image-picker';
import { identifyDisease } from '../services/plantDiseaseService';
```

- [ ] **Step 2: Add state**

```typescript
const [checkingHealth, setCheckingHealth] = useState(false);
```

- [ ] **Step 3: Add health check handler**

```typescript
const handleHealthCheck = async () => {
  if (!plant) return;
  
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Bitte erlaube Fotzugriff.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return;

  setCheckingHealth(true);
  try {
    const diseaseData = await identifyDisease(result.assets[0].uri);
    
    if (diseaseData) {
      await supabase
        .from('plants')
        .update({
          disease_data: diseaseData,
          last_health_check: new Date().toISOString(),
        })
        .eq('id', plant.id);
      
      await fetchPlantDetails();
      
      const topResult = diseaseData.results[0];
      if (topResult) {
        Alert.alert(
          'Gesundheitscheck',
          `Top-Verdacht: ${topResult.label}\nConfidence: ${Math.round(topResult.score * 100)}%`
        );
      } else {
        Alert.alert('Ergebnis', 'Keine Krankheiten identifiziert.');
      }
    }
  } catch (error) {
    Alert.alert('Fehler', 'Gesundheitscheck fehlgeschlagen.');
  } finally {
    setCheckingHealth(false);
  }
};
```

- [ ] **Step 4: Add health check button (only for existing plants)**

Add after the refresh button in the header (line ~151):

```tsx
{plant.status !== 'geplant' && plant.status !== 'bestellt' && (
  <Pressable 
    onPress={handleHealthCheck} 
    style={[styles.editButton, checkingHealth && styles.disabledButton]}
    disabled={checkingHealth}
  >
    {checkingHealth ? (
      <ActivityIndicator size={16} color={Colors2026.primary} />
    ) : (
      <Heart size={20} color={Colors2026.status.success} />
    )}
  </Pressable>
)}
```

- [ ] **Step 5: Import Heart icon**

```typescript
import { Leaf, Edit, Camera, Sprout, ChevronLeft, Snowflake, MapPin, Calendar, Sparkles, Droplets, Thermometer, RefreshCw, Heart } from 'lucide-react-native';
```

- [ ] **Step 6: Add disease results display section**

Add after the AI badge section (around line 400):

```tsx
{plant.disease_data && (
  <View style={styles.section}>
    <SectionHeader
      title="Gesundheitscheck"
      subtitle={new Date(plant.disease_data.identifiedAt).toLocaleDateString('de-DE')}
      icon={<Heart size={20} color={Colors2026.status.success} />}
      animated={true}
      delay={150}
    />
    <GlassCard variant="light">
      {plant.disease_data.results?.slice(0, 3).map((disease: any, index: number) => (
        <View key={index} style={styles.diseaseRow}>
          <View style={styles.diseaseInfo}>
            <Text style={styles.diseaseLabel}>{disease.label}</Text>
            <Text style={styles.diseaseScore}>
              {Math.round(disease.score * 100)}% {disease.description && `- ${disease.description}`}
            </Text>
          </View>
        </View>
      ))}
      {plant.disease_data.results?.length === 0 && (
        <Text style={styles.infoValue}>Keine Krankheiten identifiziert</Text>
      )}
    </GlassCard>
  </View>
)}
```

- [ ] **Step 7: Add styles**

Add to styles:

```typescript
diseaseRow: {
  paddingVertical: Spacing2026.sm,
  borderBottomWidth: 1,
  borderBottomColor: Colors2026.border,
},
diseaseInfo: {
  flex: 1,
},
diseaseLabel: {
  fontSize: Typography2026.body.fontSize,
  fontWeight: '600',
  color: Colors2026.text,
},
diseaseScore: {
  fontSize: Typography2026.small.fontSize,
  color: Colors2026.textMuted,
  marginTop: 2,
},
```

- [ ] **Step 8: Commit**

```bash
git add src/screens/PlantDetailScreen.tsx
git commit -m "feat: add health check button to PlantDetailScreen"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Add PlantDiseaseData type |
| 2 | Create plantDiseaseService |
| 3 | Database migration |
| 4 | Update Plant type |
| 5 | PlantDetailScreen integration |

---

**Plan complete.** Which execution approach?

1. **Subagent-Driven (recommended)** - I dispatch fresh subagent per task
2. **Inline Execution** - Execute tasks in this session

