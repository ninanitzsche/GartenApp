# Plant Health Check History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a health check history system for plants with photo-linked cards in a grid layout, supporting multiple checks over time.

**Architecture:** New `health_checks` table stores each check with optional photo reference. Components follow existing patterns (GlassCard, SectionHeader, Glassmorphism). Photos use existing `photos` + `photo_plants` infrastructure. Grid uses FlatList with numColumns=2.

**Tech Stack:** React Native, Expo, Supabase, TypeScript, lucide-react-native, expo-image-picker

---

## File Structure

| File | Responsibility |
|------|----------------|
| `supabase/migrations/20260402_create_health_checks.sql` | DB schema: health_checks table, RLS, indices |
| `src/types/healthCheck.ts` | TypeScript types for HealthCheck |
| `src/services/healthCheckService.ts` | CRUD: create, fetch, update, delete health checks |
| `src/components/plant/HealthCheckCard.tsx` | Single card component (thumbnail, badge, date) |
| `src/components/plant/HealthHistoryGrid.tsx` | Grid container with FlatList |
| `src/components/plant/HealthCheckDetailModal.tsx` | Full detail modal with edit notes |
| `src/hooks/usePlantDetail.ts` | Add healthChecks state + fetch |
| `src/screens/PlantDetailScreen.tsx` | Replace DiseaseCheckCard with HealthHistoryGrid |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260402_create_health_checks.sql`

- [ ] **Step 1: Write migration SQL**

```sql
-- Health checks table for plant disease tracking history
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  disease_data JSONB,
  health_status TEXT NOT NULL CHECK (health_status IN ('gesund', 'krank', 'unsicher')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_health_checks_plant_id ON health_checks(plant_id);
CREATE INDEX idx_health_checks_created_at ON health_checks(created_at DESC);
CREATE INDEX idx_health_checks_user_id ON health_checks(user_id);

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

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260402_create_health_checks.sql
git commit -m "feat: add health_checks table migration for plant health history"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/healthCheck.ts`

- [ ] **Step 1: Create type definitions**

```typescript
import { Photo } from './photo';
import { PlantDiseaseData } from './ai';

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

export function calculateHealthStatus(
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

- [ ] **Step 2: Commit**

```bash
git add src/types/healthCheck.ts
git commit -m "feat: add HealthCheck TypeScript types"
```

---

## Task 3: Health Check Service

**Files:**
- Create: `src/services/healthCheckService.ts`
- Reference: `src/services/photoService.ts` (follow uploadPhoto pattern)

- [ ] **Step 1: Create service with CRUD operations**

```typescript
import { supabase } from './supabase';
import { HealthCheck, HealthCheckFormData, calculateHealthStatus } from '../types/healthCheck';
import { uploadPhoto } from './photoService';
import { enrichPhotoWithUrl } from './photoService';
import { identifyDisease } from './plantDiseaseService';
import { Photo } from '../types/photo';

export async function fetchHealthChecks(plantId: string): Promise<HealthCheck[]> {
  const { data, error } = await supabase
    .from('health_checks')
    .select('*, photos(*)')
    .eq('plant_id', plantId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((hc: any) => ({
    ...hc,
    photo: hc.photos ? enrichPhotoWithUrl(hc.photos) : undefined,
  }));
}

export async function createHealthCheck(
  plantId: string,
  formData: HealthCheckFormData
): Promise<HealthCheck> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) throw new Error('User not authenticated');

  const fileName = `health-check-${Date.now()}.jpg`;
  const photoPath = await uploadPhoto(plantId, formData.photoUri, fileName);

  const { data: photos } = await supabase
    .from('photos')
    .select('id')
    .eq('file_url', photoPath)
    .single();

  let diseaseData = null;
  if (formData.runAI) {
    diseaseData = await identifyDisease(formData.photoUri);
  }

  const healthStatus = calculateHealthStatus(diseaseData || undefined);

  const { data, error } = await supabase
    .from('health_checks')
    .insert({
      plant_id: plantId,
      photo_id: photos?.id,
      disease_data: diseaseData,
      health_status: healthStatus,
      notes: formData.notes,
      user_id: user.id,
    })
    .select('*, photos(*)')
    .single();

  if (error) throw error;

  return {
    ...data,
    photo: data.photos ? enrichPhotoWithUrl(data.photos) : undefined,
  };
}

export async function updateHealthCheckNotes(
  healthCheckId: string,
  notes: string
): Promise<void> {
  const { error } = await supabase
    .from('health_checks')
    .update({ notes })
    .eq('id', healthCheckId);

  if (error) throw error;
}

export async function deleteHealthCheck(healthCheckId: string): Promise<void> {
  const { error } = await supabase
    .from('health_checks')
    .delete()
    .eq('id', healthCheckId);

  if (error) throw error;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/healthCheckService.ts
git commit -m "feat: add healthCheckService with CRUD operations"
```

---

## Task 4: HealthCheckCard Component

**Files:**
- Create: `src/components/plant/HealthCheckCard.tsx`
- Reference: `src/theme/designSystemV2.ts` (colors, spacing, radius)
- Reference: `src/components/plant/DiseaseCheckCard.tsx` (existing patterns)

- [ ] **Step 1: Create HealthCheckCard component**

```typescript
import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { HealthCheck } from '../../types/healthCheck';

interface Props {
  healthCheck: HealthCheck;
  index: number;
  onPress: (hc: HealthCheck) => void;
}

const STATUS_COLORS: Record<string, string> = {
  gesund: Colors2026.status.success,
  krank: Colors2026.status.error,
  unsicher: Colors2026.status.warning,
};

export default function HealthCheckCard({ healthCheck, index, onPress }: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.ease }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.6,
    transform: [{ scale: 0.8 + pulse.value * 0.2 }],
  }));

  const date = new Date(healthCheck.created_at).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const photoUrl = healthCheck.photo?.photo_url;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(400)}
      style={styles.cardWrapper}
    >
      <Pressable onPress={() => onPress(healthCheck)} style={styles.card}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}

        <Animated.View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[healthCheck.health_status] },
            pulseStyle,
          ]}
        />

        <View style={styles.dateOverlay}>
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    margin: Spacing2026.xs,
  },
  card: {
    aspectRatio: 1,
    borderRadius: Radius2026.lg,
    overflow: 'hidden',
    backgroundColor: Colors2026.glass.tint,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: Colors2026.bg,
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing2026.sm,
    right: Spacing2026.sm,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dateText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/plant/HealthCheckCard.tsx
git commit -m "feat: add HealthCheckCard with animated status badge"
```

---

## Task 5: HealthHistoryGrid Component

**Files:**
- Create: `src/components/plant/HealthHistoryGrid.tsx`
- Reference: `src/components/ui/SectionHeader.tsx`
- Reference: `src/components/ui/GlassCard.tsx`

- [ ] **Step 1: Create HealthHistoryGrid component**

```typescript
import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Heart, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import SectionHeader from '../ui/SectionHeader';
import HealthCheckCard from './HealthCheckCard';
import HealthCheckDetailModal from './HealthCheckDetailModal';
import { HealthCheck } from '../../types/healthCheck';
import { createHealthCheck } from '../../services/healthCheckService';

interface Props {
  plantId: string;
  healthChecks: HealthCheck[];
  onRefresh: () => void;
  delay?: number;
  isExistingPlant: boolean;
}

export default function HealthHistoryGrid({
  plantId,
  healthChecks,
  onRefresh,
  delay = 150,
  isExistingPlant,
}: Props) {
  const [selectedCheck, setSelectedCheck] = useState<HealthCheck | null>(null);
  const [checking, setChecking] = useState(false);

  const handleNewCheck = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung', 'Bitte erlaube Fotozugriff.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setChecking(true);
    try {
      await createHealthCheck(plantId, {
        photoUri: result.assets[0].uri,
        runAI: true,
      });
      onRefresh();
    } catch (error) {
      Alert.alert('Fehler', 'Health-Check konnte nicht erstellt werden.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Gesundheit"
        subtitle={healthChecks.length > 0 ? `${healthChecks.length} Checks` : undefined}
        icon={<Heart size={20} color={Colors2026.primary} />}
        animated={true}
        delay={delay}
      />

      {isExistingPlant && (
        <Pressable onPress={handleNewCheck} style={styles.addButton} disabled={checking}>
          {checking ? (
            <ActivityIndicator size="small" color={Colors2026.primary} />
          ) : (
            <>
              <Plus size={16} color={Colors2026.primary} />
              <Text style={styles.addButtonText}>Check starten</Text>
            </>
          )}
        </Pressable>
      )}

      {healthChecks.length > 0 ? (
        <FlatList
          data={healthChecks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <HealthCheckCard
              healthCheck={item}
              index={index}
              onPress={setSelectedCheck}
            />
          )}
          contentContainerStyle={styles.grid}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Noch keine Gesundheitschecks</Text>
        </View>
      )}

      {selectedCheck && (
        <HealthCheckDetailModal
          healthCheck={selectedCheck}
          onClose={() => setSelectedCheck(null)}
          onUpdate={onRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.primary + '12',
    borderWidth: 1,
    borderColor: Colors2026.primary + '30',
    marginBottom: Spacing2026.md,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  grid: {
    gap: Spacing2026.xs,
  },
  empty: {
    paddingVertical: Spacing2026.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors2026.textMuted,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/plant/HealthHistoryGrid.tsx
git commit -m "feat: add HealthHistoryGrid with 2-column layout"
```

---

## Task 6: HealthCheckDetailModal

**Files:**
- Create: `src/components/plant/HealthCheckDetailModal.tsx`
- Reference: `src/components/ui/GlassCard.tsx`

- [ ] **Step 1: Create Detail Modal component**

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { X, Trash2 } from 'lucide-react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { HealthCheck } from '../../types/healthCheck';
import { updateHealthCheckNotes, deleteHealthCheck } from '../../services/healthCheckService';

interface Props {
  healthCheck: HealthCheck;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  gesund: 'Gesund',
  krank: 'Krank',
  unsicher: 'Unsicher',
};

const STATUS_COLORS: Record<string, string> = {
  gesund: Colors2026.status.success,
  krank: Colors2026.status.error,
  unsicher: Colors2026.status.warning,
};

export default function HealthCheckDetailModal({ healthCheck, onClose, onUpdate }: Props) {
  const [notes, setNotes] = useState(healthCheck.notes || '');
  const [saving, setSaving] = useState(false);

  const photoUrl = healthCheck.photo?.photo_url;
  const topDisease = healthCheck.disease_data?.results?.[0];

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await updateHealthCheckNotes(healthCheck.id, notes);
    } catch (e) {
      Alert.alert('Fehler', 'Notizen konnten nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Löschen', 'Health-Check wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHealthCheck(healthCheck.id);
            onUpdate();
            onClose();
          } catch (e) {
            Alert.alert('Fehler', 'Löschen fehlgeschlagen.');
          }
        },
      },
    ]);
  };

  const date = new Date(healthCheck.created_at).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View entering={SlideInDown.duration(300)} exiting={SlideOutDown.duration(200)} style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {photoUrl && (
              <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
            )}

            <View style={styles.content}>
              <View style={styles.headerRow}>
                <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[healthCheck.health_status] + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[healthCheck.health_status] }]} />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[healthCheck.health_status] }]}>
                    {STATUS_LABELS[healthCheck.health_status]}
                  </Text>
                </View>
                <Text style={styles.date}>{date}</Text>
              </View>

              {topDisease && (
                <View style={styles.diseaseSection}>
                  <Text style={styles.diseaseLabel}>Top-Diagnose</Text>
                  <Text style={styles.diseaseName}>{topDisease.label}</Text>
                  <View style={styles.confidenceBar}>
                    <View
                      style={[
                        styles.confidenceFill,
                        {
                          width: `${Math.round(topDisease.score * 100)}%`,
                          backgroundColor: STATUS_COLORS[healthCheck.health_status],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.confidenceText}>
                    {Math.round(topDisease.score * 100)}% Confidence
                  </Text>
                </View>
              )}

              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notizen</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  onBlur={handleSaveNotes}
                  placeholder="Notiz hinzufügen..."
                  placeholderTextColor={Colors2026.textMuted}
                  multiline
                  style={styles.notesInput}
                />
              </View>

              <View style={styles.actions}>
                <Pressable onPress={handleDelete} style={styles.deleteButton}>
                  <Trash2 size={16} color={Colors2026.status.error} />
                  <Text style={styles.deleteText}>Löschen</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={20} color={Colors2026.text} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors2026.bg,
    borderTopLeftRadius: Radius2026.xl,
    borderTopRightRadius: Radius2026.xl,
    maxHeight: '90%',
  },
  image: {
    width: '100%',
    height: 280,
    borderTopLeftRadius: Radius2026.xl,
    borderTopRightRadius: Radius2026.xl,
  },
  content: {
    padding: Spacing2026.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing2026.lg,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius2026.round,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    color: Colors2026.textMuted,
  },
  diseaseSection: {
    marginBottom: Spacing2026.lg,
    padding: Spacing2026.md,
    backgroundColor: Colors2026.glass.light,
    borderRadius: Radius2026.md,
  },
  diseaseLabel: {
    fontSize: 11,
    color: Colors2026.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 8,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: Colors2026.bg,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 11,
    color: Colors2026.textMuted,
  },
  notesSection: {
    marginBottom: Spacing2026.lg,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 80,
    padding: Spacing2026.md,
    backgroundColor: Colors2026.glass.light,
    borderRadius: Radius2026.md,
    color: Colors2026.text,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  actions: {
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.status.error + '10',
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors2026.status.error,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/plant/HealthCheckDetailModal.tsx
git commit -m "feat: add HealthCheckDetailModal with notes editing"
```

---

## Task 7: Update usePlantDetail Hook

**Files:**
- Modify: `src/hooks/usePlantDetail.ts`

- [ ] **Step 1: Add healthChecks state and fetch**

Add import at top:
```typescript
import { fetchHealthChecks } from '../services/healthCheckService';
import { HealthCheck } from '../types/healthCheck';
```

Add to interface:
```typescript
healthChecks: HealthCheck[];
```

Add state:
```typescript
const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
```

Add to Promise.all in refetch:
```typescript
fetchHealthChecks(plantId).catch(() => []),
```

Add setHealthChecks after fetch:
```typescript
setHealthChecks(healthChecksData);
```

Add to return object:
```typescript
healthChecks,
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/usePlantDetail.ts
git commit -m "feat: add healthChecks to usePlantDetail hook"
```

---

## Task 8: Update PlantDetailScreen

**Files:**
- Modify: `src/screens/PlantDetailScreen.tsx`

- [ ] **Step 1: Replace DiseaseCheckCard with HealthHistoryGrid**

Replace import:
```typescript
// Remove:
import DiseaseCheckCard from '../components/plant/DiseaseCheckCard';

// Add:
import HealthHistoryGrid from '../components/plant/HealthHistoryGrid';
```

Destructure healthChecks from hook:
```typescript
const { plant, photos, harvestTotals, tasks, healthChecks, loading, refreshing, handleRefresh, refetch } = usePlantDetail(plantId);
```

Replace the DiseaseCheckCard section (around line 263-288) with:
```typescript
{/* Gesundheitshistorie */}
<HealthHistoryGrid
  plantId={plant.id}
  healthChecks={healthChecks}
  onRefresh={refetch}
  delay={150}
  isExistingPlant={isExistingPlant}
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/PlantDetailScreen.tsx src/hooks/usePlantDetail.ts
git commit -m "feat: integrate HealthHistoryGrid into PlantDetailScreen"
```

---

## Verification

- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Run tests: `npm test`
- [ ] Manual test: Open PlantDetailScreen → verify grid shows health checks
- [ ] Manual test: Tap "+ Check starten" → select photo → verify card appears
- [ ] Manual test: Tap card → verify detail modal opens with notes editing
