# Bilder für Alle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bilder (Cover + Galerie) für Gilden, Pflanzen und Beete ermöglichen

**Architecture:** Neue Services nach Vorlage photoBedService, wiederverwendbare UI-Komponenten

**Tech Stack:** React Native, Supabase Storage, expo-image-picker

---

### Task 1: Datenbank Migration

**Files:**
- Create: `supabase/migrations/20260410_add_bilder_support.sql`

- [ ] **Step 1: SQL Migration erstellen**

```sql
-- Gilden Cover-Foto
ALTER TABLE gilden ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Pflanzen Cover-Foto
ALTER TABLE plants ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Junction Tabelle photo_gilden
CREATE TABLE IF NOT EXISTS photo_gilden (
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  gilde_id UUID REFERENCES gilden(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, gilde_id)
);

-- Junction Tabelle photo_plants
CREATE TABLE IF NOT EXISTS photo_plants (
  photo_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, plant_id)
);
```

- [ ] **Step 2: Migration ausführen**

```bash
psql $DATABASE_URL -f supabase/migrations/20260410_add_bilder_support.sql
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260410_add_bilder_support.sql
git commit -m "feat: add photo junction tables for gilden and Pflanzen"
```

---

### Task 2: Types erweitern

**Files:**
- Modify: `src/types/gilde.ts`
- Modify: `src/types/photo.ts`

- [ ] **Step 1: Gilde Type erweitern**

```typescript
// src/types/gilde.ts - add cover_photo_url
interface Gilde {
  id: string;
  cover_photo_url?: string;
  // ... existing
}
```

- [ ] **Step 2: Photo Types erweitern**

```typescript
// src/types/photo.ts - add junction types
interface PhotoGilde {
  photo_id: string;
  gilde_id: string;
}

interface PhotoPlant {
  photo_id: string;
  plant_id: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/gilde.ts src/types/photo.ts
git commit -m "feat: add cover_photo_url and junction types"
```

---

### Task 3: PhotoGildeService

**Files:**
- Create: `src/services/photoGildeService.ts`
- Test: `src/services/__tests__/photoGildeService.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/services/__tests__/photoGildeService.test.ts
import { fetchPhotosForGilde, setGildeCoverPhoto } from '../photoGildeService';

jest.mock('../supabase');
jest.mock('../photoService');

describe('photoGildeService', () => {
  describe('fetchPhotosForGilde', () => {
    it('should fetch photos for gilde', async () => {
      const mockPhotos = [{ id: 'p1', photo_url: 'url1' }];
      // mock implementation
      const result = await fetchPhotosForGilde('gilde-1');
      expect(result).toEqual(mockPhotos);
    });
  });
});
```

- [ ] **Step 2: Run test - expect FAIL**

```bash
npm test src/services/__tests__/photoGildeService.test.ts
# Expected: FAIL - module not found
```

- [ ] **Step 3: Implement service**

```typescript
// src/services/photoGildeService.ts
import { supabase } from './supabase';
import { Photo } from '../types/photo';

function enrichPhotoWithUrl(photo: any): Photo {
  if (!photo.file_url) return { ...photo, photo_url: undefined };
  const { data } = supabase.storage.from('plant-photos').getPublicUrl(photo.file_url);
  return { ...photo, photo_url: data.publicUrl };
}

export async function fetchPhotosForGilde(gildeId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photo_gilden')
    .select('photo_id')
    .eq('gilde_id', gildeId);
  if (error) throw error;
  if (!data?.length) return [];
  const photoIds = data.map(p => p.photo_id);
  const { data: photos } = await supabase.from('photos').select('*').in('id', photoIds);
  return (photos || []).map(enrichPhotoWithUrl);
}

export async function linkPhotoToGilde(photoId: string, gildeId: string): Promise<void> {
  const { error } = await supabase.from('photo_gilden').insert({ photo_id: photoId, gilde_id: gildeId });
  if (error) throw error;
}

export async function unlinkPhotoFromGilde(photoId: string, gildeId: string): Promise<void> {
  const { error } = await supabase.from('photo_gilden').delete().eq('photo_id', photoId).eq('gilde_id', gildeId);
  if (error) throw error;
}

export async function setGildeCoverPhoto(gildeId: string, photoUrl: string): Promise<void> {
  const { error } = await supabase.from('gilden').update({ cover_photo_url: photoUrl }).eq('id', gildeId);
  if (error) throw error;
}

// uploadPhotoForGilde - similar to photoBedService
export async function uploadPhotoForGilde(gildeId: string, imageUri: string): Promise<string> {
  // Same pattern as uploadPhotoForBed
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const isBlobUrl = imageUri.startsWith('blob:');
  const fileExt = isBlobUrl ? 'jpg' : imageUri.split('.').pop()?.split('?')[0] || 'jpg';
  const fileName = `${user.id}/gilde/${gildeId}/${Date.now()}.${fileExt}`;
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const { data, error } = await supabase.storage.from('plant-photos').upload(fileName, new Uint8Array(arrayBuffer), { contentType: blob.type });
  if (error) throw error;
  const { data: photoData } = await supabase.from('photos').insert({ user_id: user.id, file_url: data.path }).select();
  const photoId = photoData[0].id;
  await linkPhotoToGilde(photoId, gildeId);
  return data.path;
}
```

- [ ] **Step 4: Run test - expect PASS**

```bash
npm test src/services/__tests__/photoGildeService.test.ts
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add src/services/photoGildeService.ts src/services/__tests__/photoGildeService.test.ts
git commit -m "feat: add photoGildeService"
```

---

### Task 4: PhotoPlantService

**Files:**
- Create: `src/services/photoPlantService.ts`
- Test: `src/services/__tests__/photoPlantService.test.ts`

- [ ] **Step 1: Write failing test** (similar to Task 3)

```typescript
// src/services/__tests__/photoPlantService.test.ts
import { fetchPhotosForPlant, setPlantCoverPhoto } from '../photoPlantService';

jest.mock('../supabase');
jest.mock('../photoService');

describe('photoPlantService', () => {
  it('should fetch photos for plant', async () => {
    const result = await fetchPhotosForPlant('plant-1');
    expect(Array.isArray(result)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test - expect FAIL**

- [ ] **Step 3: Implement service**

```typescript
// src/services/photoPlantService.ts
// Same structure as photoGildeService, but with plant_id
import { supabase } from './supabase';
import { Photo } from '../types/photo';

function enrichPhotoWithUrl(photo: any): Photo {
  if (!photo.file_url) return { ...photo, photo_url: undefined };
  const { data } = supabase.storage.from('plant-photos').getPublicUrl(photo.file_url);
  return { ...photo, photo_url: data.publicUrl };
}

export async function fetchPhotosForPlant(plantId: string): Promise<Photo[]> {
  const { data } = await supabase.from('photo_plants').select('photo_id').eq('plant_id', plantId);
  if (!data?.length) return [];
  const photoIds = data.map(p => p.photo_id);
  const { data: photos } = await supabase.from('photos').select('*').in('id', photoIds);
  return (photos || []).map(enrichPhotoWithUrl);
}

export async function linkPhotoToPlant(photoId: string, plantId: string): Promise<void> {
  const { error } = await supabase.from('photo_plants').insert({ photo_id: photoId, plant_id: plantId });
  if (error) throw error;
}

export async function unlinkPhotoFromPlant(photoId: string, plantId: string): Promise<void> {
  const { error } = await supabase.from('photo_plants').delete().eq('photo_id', photoId).eq('plant_id', plantId);
  if (error) throw error;
}

export async function setPlantCoverPhoto(plantId: string, photoUrl: string): Promise<void> {
  const { error } = await supabase.from('plants').update({ cover_photo_url: photoUrl }).eq('id', plantId);
  if (error) throw error;
}

export async function uploadPhotoForPlant(plantId: string, imageUri: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const isBlobUrl = imageUri.startsWith('blob:');
  const fileExt = isBlobUrl ? 'jpg' : imageUri.split('.').pop()?.split('?')[0] || 'jpg';
  const fileName = `${user.id}/plant/${plantId}/${Date.now()}.${fileExt}`;
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const { data, error } = await supabase.storage.from('plant-photos').upload(fileName, new Uint8Array(arrayBuffer), { contentType: blob.type });
  if (error) throw error;
  const { data: photoData } = await supabase.from('photos').insert({ user_id: user.id, file_url: data.path }).select();
  const photoId = photoData[0].id;
  await linkPhotoToPlant(photoId, plantId);
  return data.path;
}
```

- [ ] **Step 4: Run test - expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/services/photoPlantService.ts src/services/__tests__/photoPlantService.test.ts
git commit -m "feat: add photoPlantService"
```

---

### Task 5: CoverImagePicker Komponente

**Files:**
- Create: `src/components/ui/CoverImagePicker.tsx`
- Test: `src/components/ui/__tests__/CoverImagePicker.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/ui/__tests__/CoverImagePicker.test.tsx
import { render } from '@testing-library/react-native';
import CoverImagePicker from '../CoverImagePicker';

test('shows placeholder when no image', () => {
  render(<CoverImagePicker imageUrl={null} onChangeImage={() => {}} />);
  // expect placeholder shown
});
```

- [ ] **Step 2: Run test - expect FAIL**

- [ ] **Step 3: Implement component**

```tsx
// src/components/ui/CoverImagePicker.tsx
import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors2026, Radius2026 } from '../../theme/designSystemV2';

interface Props {
  imageUrl?: string | null;
  onChangeImage: (url: string | null) => void;
  placeholder?: string;
}

export default function CoverImagePicker({ imageUrl, onChangeImage, placeholder = 'Bild auswählen' }: Props) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onChangeImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onChangeImage(result.assets[0].uri);
    }
  };

  const removeImage = () => onChangeImage(null);

  if (imageUrl) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Ändern</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.removeButton]} onPress={removeImage}>
            <Text style={styles.removeButtonText}>Entfernen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.placeholder}>
      <MaterialIcons name="add-a-photo" size={48} color={Colors2026.textMuted} />
      <TouchableOpacity onPress={pickImage}>
        <Text style={styles.placeholderText}>{placeholder}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={takePhoto}>
        <Text style={styles.cameraText}>Foto aufnehmen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  image: { width: '100%', height: 200, borderRadius: Radius2026.md },
  actions: { flexDirection: 'row', gap: 8 },
  button: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: Colors2026.primary, borderRadius: Radius2026.sm },
  buttonText: { color: '#fff' },
  removeButton: { backgroundColor: Colors2026.status.error },
  removeButtonText: { color: '#fff' },
  placeholder: { alignItems: 'center', padding: 24, backgroundColor: Colors2026.surface, borderRadius: Radius2026.md, gap: 8 },
  placeholderText: { color: Colors2026.primary },
  cameraText: { color: Colors2026.textSecondary },
});
```

- [ ] **Step 4: Run test - expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/CoverImagePicker.tsx src/components/ui/__tests__/CoverImagePicker.test.tsx
git commit -m "feat: add CoverImagePicker component"
```

---

### Task 6: PhotoGallery Komponente

**Files:**
- Create: `src/components/ui/PhotoGallery.tsx`
- Test: `src/components/ui/__tests__/PhotoGallery.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { render } from '@testing-library/react-native';
import PhotoGallery from '../PhotoGallery';

test('renders photos', () => {
  render(<PhotoGallery photos={[{ id: '1', photo_url: 'url' }]} onAddPhoto={() => {}} />);
});
```

- [ ] **Step 2: Run test - expect FAIL**

- [ ] **Step 3: Implement component**

```tsx
// src/components/ui/PhotoGallery.tsx
import React from 'react';
import { View, Image, TouchableOpacity, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Photo } from '../../types/photo';
import { Colors2026, Radius2026 } from '../../theme/designSystemV2';

interface Props {
  photos: Photo[];
  onAddPhoto: () => void;
  onRemovePhoto?: (photoId: string) => void;
}

const { width } = Dimensions.get('window');
const COLUMNS = 3;
const SPACING = 4;
const ITEM_SIZE = (width - 32 - (COLUMNS - 1) * SPACING) / COLUMNS;

export default function PhotoGallery({ photos, onAddPhoto, onRemovePhoto }: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        numColumns={COLUMNS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.photo_url ? <Image source={{ uri: item.photo_url }} style={styles.image} /> : null}
            {onRemovePhoto && (
              <TouchableOpacity style={styles.removeBtn} onPress={() => onRemovePhoto(item.id)}>
                <MaterialIcons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn} onPress={onAddPhoto}>
            <MaterialIcons name="add" size={24} color={Colors2026.primary} />
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  item: { width: ITEM_SIZE, height: ITEM_SIZE, margin: SPACING / 2 },
  image: { width: '100%', height: '100%', borderRadius: Radius2026.sm },
  removeBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 },
  addBtn: { width: ITEM_SIZE, height: ITEM_SIZE, margin: SPACING / 2, backgroundColor: Colors2026.surface, justifyContent: 'center', alignItems: 'center', borderRadius: Radius2026.sm, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors2026.border },
});
```

- [ ] **Step 4: Run test - expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/PhotoGallery.tsx src/components/ui/__tests__/PhotoGallery.test.tsx
git commit -m "feat: add PhotoGallery component"
```

---

### Task 7: GildeEditScreen erweitern

**Files:**
- Modify: `src/screens/GildeEditScreen.tsx`

- [ ] **Step 1: Imports hinzufügen**

```typescript
import CoverImagePicker from '../components/ui/CoverImagePicker';
import PhotoGallery from '../components/ui/PhotoGallery';
import { fetchPhotosForGilde, setGildeCoverPhoto, uploadPhotoForGilde, unlinkPhotoFromGilde } from '../services/photoGildeService';
```

- [ ] **Step 2: State erweitern**

```typescript
const [coverPhoto, setCoverPhoto] = useState<string | null>(gilde?.cover_photo_url || null);
const [photos, setPhotos] = useState<Photo[]>([]);
const [savingPhoto, setSavingPhoto] = useState(false);
```

- [ ] **Step 3: Fotos laden (useEffect)**

```typescript
useEffect(() => {
  if (gildeId) {
    loadPhotos();
  }
}, [gildeId]);

const loadPhotos = async () => {
  if (!gildeId) return;
  const gildePhotos = await fetchPhotosForGilde(gildeId);
  setPhotos(gildePhotos);
};
```

- [ ] **Step 4: UI hinzufügen**

```tsx
{/* Cover Section */}
<GlassCard style={styles.card}>
  <Text style={styles.label}>Titelbild</Text>
  <CoverImagePicker
    imageUrl={coverPhoto}
    onChangeImage={async (uri) => {
      if (!gildeId) return;
      setSavingPhoto(true);
      try {
        if (uri) {
          await uploadPhotoForGilde(gildeId, uri);
          const url = await setGildeCoverPhoto(gildeId, uri);
          setCoverPhoto(uri);
        }
      } finally {
        setSavingPhoto(false);
      }
    }}
  />
</GlassCard>

{/* Galerie Section */}
<GlassCard style={styles.card}>
  <Text style={styles.label}>Galerie</Text>
  <PhotoGallery
    photos={photos}
    onAddPhoto={async () => {
      if (!gildeId) return;
      const result = await uploadPhotoForGilde(gildeId, newImageUri);
      setPhotos([...photos, result]);
    }}
    onRemovePhoto={async (photoId) => {
      await unlinkPhotoFromGilde(photoId, gildeId);
      setPhotos(photos.filter(p => p.id !== photoId));
    }}
  />
</GlassCard>
```

- [ ] **Step 5: Commit**

```bash
git add src/screens/GildeEditScreen.tsx
git commit -m "feat: add image support to GildeEditScreen"
```

---

### Task 8: PlantEditScreen erweitern

**Files:**
- Modify: `src/screens/PlantEditScreen.tsx`

- [ ] **Step 1-5: Same pattern as GildeEditScreen**

```typescript
import CoverImagePicker from '../components/ui/CoverImagePicker';
import PhotoGallery from '../components/ui/PhotoGallery';
import { fetchPhotosForPlant, setPlantCoverPhoto, uploadPhotoForPlant, unlinkPhotoFromPlant } from '../services/photoPlantService';
```

- [ ] **Step 6: Commit**

```bash
git add src/screens/PlantEditScreen.tsx
git commit -m "feat: add image support to PlantEditScreen"
```

---

### Task 9: BeetEditScreen Gallery hinzufügen

**Files:**
- Modify: `src/screens/EditBedScreen.tsx`

- [ ] **Step 1: Same pattern - Galerie hinzufügen**

```typescript
import PhotoGallery from '../components/ui/PhotoGallery';
import { fetchPhotosForBed, uploadPhotoForBed } from '../services/photoBedService';
// (Cover bereits vorhanden - nur Galerie hinzufügen)
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/EditBedScreen.tsx
git commit -m "feat: add gallery to BeetEditScreen"
```

---

### Task 10: Integration Tests

**Files:**
- Create: `src/__tests__/integration/bilder-integration.test.ts`

- [ ] **Step 1: Integration tests**

```typescript
describe('Bilder Integration', () => {
  it('roundtrip: upload, set cover, fetch photos', async () => {
    // 1. Upload photo for gilde
    const path = await uploadPhotoForGilde(gildeId, 'file://...');
    expect(path).toBeDefined();
    
    // 2. Set as cover
    await setGildeCoverPhoto(gildeId, path);
    const gilde = await fetchGildeById(gildeId);
    expect(gilde.cover_photo_url).toBeDefined();
    
    // 3. Fetch gallery
    const photos = await fetchPhotosForGilde(gildeId);
    expect(photos.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add src/__tests__/integration/bilder-integration.test.ts
git commit -m "test: add image integration tests"
```

---

## Plan complete

**Saved to:** `docs/superpowers/plans/2026-04-10-bilder-fuer-alle-implementation.md`

**Two execution options:**

1. **Subagent-Driven (recommended)** - Fresh subagent per task, review between tasks
2. **Inline Execution** - Execute tasks in this session with checkpoints

**Which approach?**