# Test-First Development (TDD) Template
**Schreib Tests BEVOR du Code schreibst!**

---

## 🎯 TDD Process (3 Schritte)

```
1. RED:   Tests schreiben (sie fail!)
2. GREEN: Minimal Code schreiben (tests pass)
3. REFACTOR: Code verbessern (tests bleiben grün)
```

**Time:** 30 min Tests + 60 min Code + 30 min Refactor = 2h pro Feature

---

## 1️⃣ RED PHASE: Tests schreiben (30 min)

### Schritt 1: Test File erstellen
```
Feature: Photo Upload
Location: src/services/__tests__/photoService.test.ts
```

### Schritt 2: Test Skeleton schreiben
```typescript
import { uploadPhoto, deletePhoto, fetchPhotos } from '../photoService';
import { supabase } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase');

describe('photoService', () => {
  // Tests go here
});
```

### Schritt 3: Tests für JEDE Funktion
```typescript
describe('uploadPhoto', () => {
  // Happy Path Test
  it('should upload image and create photo record', async () => {
    const result = await uploadPhoto('plant-123', 'file://image.jpg', 'photo-1.jpg');
    expect(result).toBeDefined();
    expect(result).toContain('plant-123'); // Storage path
  });

  // Sad Path Test
  it('should throw error if user not authenticated', async () => {
    await expect(uploadPhoto('plant-123', 'file://image.jpg', 'photo-1.jpg'))
      .rejects.toThrow('User not authenticated');
  });

  // Edge Case Test
  it('should handle blob URIs on web', async () => {
    const result = await uploadPhoto('plant-123', 'blob:http://...', 'photo-1.jpg');
    expect(result).toBeDefined(); // Should still work!
  });

  // Integration Test
  it('should create junction table entry linking photo to plant', async () => {
    await uploadPhoto('plant-123', 'file://image.jpg', 'photo-1.jpg');
    // Verify photo_plants table was updated
    expect(mockSupabase.from).toHaveBeenCalledWith('photo_plants');
  });
});

describe('deletePhoto', () => {
  it('should delete photo and junction entry', async () => {
    await deletePhoto('photo-123', 'path/to/file.jpg');
    // Verify deletion from both tables
    expect(mockSupabase.from('photo_plants').delete).toHaveBeenCalled();
    expect(mockSupabase.from('photos').delete).toHaveBeenCalled();
  });

  it('should delete storage file', async () => {
    await deletePhoto('photo-123', 'path/to/file.jpg');
    // Verify storage deletion
    expect(mockSupabase.storage.from('plant-photos').remove).toHaveBeenCalledWith(['path/to/file.jpg']);
  });

  it('should handle cascade deletes correctly', async () => {
    // Test that junction table is deleted first
    const callOrder = [];
    // Verify photo_plants deleted before photos
  });
});

describe('fetchPhotos', () => {
  it('should fetch photos for plant via junction table', async () => {
    const result = await fetchPhotos('plant-123');
    expect(result).toBeInstanceOf(Array);
    // Verify query path: photo_plants → photos
    expect(mockSupabase.from).toHaveBeenCalledWith('photo_plants');
    expect(mockSupabase.from).toHaveBeenCalledWith('photos');
  });

  it('should return empty array if no photos', async () => {
    const result = await fetchPhotos('plant-no-photos');
    expect(result).toEqual([]);
  });

  it('should include public URLs not storage paths', async () => {
    const result = await fetchPhotos('plant-123');
    result.forEach(photo => {
      expect(photo.photo_url).toMatch(/^https/); // Public URL!
      expect(photo.photo_url).not.toContain('blob:'); // Not blob URL
    });
  });
});
```

### Schritt 4: Run Tests (sie sollten FAIL!)
```bash
npm test -- photoService.test.ts

# Output:
# ✕ uploadPhoto should upload image
# ✕ uploadPhoto should throw if not auth
# ... (10+ failing tests)
```

**Goal:** Alle Tests RED ✅

---

## 2️⃣ GREEN PHASE: Code schreiben (60 min)

### Schritt 1: Schaue auf ersten Test
```typescript
it('should upload image and create photo record', async () => {
  const result = await uploadPhoto('plant-123', 'file://image.jpg', 'photo-1.jpg');
  expect(result).toBeDefined();
  expect(result).toContain('plant-123');
});
```

### Schritt 2: Schreib MINIMAL Code zum Grün machen
```typescript
export async function uploadPhoto(
  plantId: string,
  fileUri: string,
  fileName: string
): Promise<string> {
  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Upload file
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const { data, error } = await supabase.storage
    .from('plant-photos')
    .upload(`${user.id}/${plantId}/${fileName}`, uint8Array);

  if (error) throw error;

  // Create photo record
  const { data: photoData, error: insertError } = await supabase
    .from('photos')
    .insert({ user_id: user.id, file_url: data.path, created_at: new Date().toISOString() })
    .select();

  if (insertError) throw insertError;

  // Link to plant (junction table)
  const { error: relationError } = await supabase
    .from('photo_plants')
    .insert({ photo_id: photoData[0].id, plant_id: plantId });

  if (relationError) throw relationError;

  return data.path;
}
```

### Schritt 3: Run Test
```bash
npm test -- photoService.test.ts --watch

# Jetzt sollte 1 Test GRÜN sein! ✅
```

### Schritt 4: Nächster Test, repeat
```typescript
it('should throw error if user not authenticated', async () => {
  // User Mock ist null
  mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

  await expect(uploadPhoto(...))
    .rejects.toThrow('User not authenticated');
});

// Dein Code throwt schon! TEST GRÜN! ✅
```

### Schritt 5: Alle Tests GRÜN
```bash
npm test -- photoService.test.ts

# ✓ uploadPhoto should upload image
# ✓ uploadPhoto should throw if not auth
# ✓ uploadPhoto should handle blob URIs
# ✓ uploadPhoto should create junction entry
# ✓ deletePhoto should delete photo
# ✓ deletePhoto should delete junction entry
# ✓ deletePhoto should delete storage file
# ✓ fetchPhotos should fetch via junction table
# ... (alle grün!)

# 12 tests passed ✅
```

---

## 3️⃣ REFACTOR PHASE: Code verbessern (30 min)

### Schritt 1: Code Review gegen Tests
```typescript
// Ist error handling gut genug?
// Sind functions zu lang?
// Gibt es Code-Duplikate?
// Tests still passing? RUN TESTS!
```

### Schritt 2: Extract Funktionen
```typescript
// VORHER:
async function uploadPhoto(...) {
  // 20 Zeilen Code
  // Blob-Konvertierung + Upload + DB + Junction
}

// NACHHER: Mit Helper-Functions
async function uploadPhoto(...) {
  const user = await getAuthenticatedUser();
  const uint8Array = await fileUriToUint8Array(fileUri);
  const uploadData = await uploadToStorage(user.id, plantId, fileName, uint8Array);
  const photoData = await savePhotoMetadata(user.id, uploadData.path);
  await linkPhotoToPlant(photoData[0].id, plantId);
  return uploadData.path;
}

// Helper functions: Re-usable, testable
async function fileUriToUint8Array(fileUri: string): Promise<Uint8Array> { ... }
async function uploadToStorage(...) { ... }
async function savePhotoMetadata(...) { ... }
async function linkPhotoToPlant(...) { ... }
```

### Schritt 3: Run Tests (sollten alle noch grün sein!)
```bash
npm test -- photoService.test.ts

# ✓ All 12 tests still pass! ✅
```

---

## 📋 TEMPLATE - Copy-Paste Ready

```typescript
/**
 * TEMPLATE: TDD für neue Service Function
 */

import { serviceFunction } from '../service';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase');

describe('serviceFunction', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  // HAPPY PATH: Normal success case
  describe('happy path', () => {
    it('should [do something] successfully', async () => {
      const result = await serviceFunction('input');
      expect(result).toBeDefined();
      expect(result).toEqual('expected-output');
    });
  });

  // SAD PATH: Errors
  describe('error handling', () => {
    it('should throw [specific error] if [condition]', async () => {
      await expect(serviceFunction('invalid'))
        .rejects.toThrow('Error message');
    });

    it('should handle network error', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Network failed');
      });

      await expect(serviceFunction('input'))
        .rejects.toThrow('Network failed');
    });
  });

  // EDGE CASES: Boundary conditions
  describe('edge cases', () => {
    it('should handle empty input', async () => {
      const result = await serviceFunction('');
      expect(result).toBeDefined();
    });

    it('should handle web environment (blob URIs)', async () => {
      const result = await serviceFunction('blob:http://localhost');
      expect(result).toBeDefined();
    });
  });

  // INTEGRATION: Real-world flows
  describe('integration', () => {
    it('should cascade deletes correctly', async () => {
      await serviceFunction.delete('id');
      // Verify multiple tables were updated
      expect(mockSupabase.from('table1').delete).toHaveBeenCalled();
      expect(mockSupabase.from('table2').delete).toHaveBeenCalled();
    });
  });
});
```

---

## ⏱️ TDD TIMING GUIDE

```
Per Feature:
- Tests schreiben: 30 min
- Code implementieren: 60 min
- Refactoring: 30 min
- TOTAL: 2 hours

Benefits:
- 70% weniger Debugging
- 100% Code Coverage automatisch
- 0 Production Bugs möglich
```

---

## 🚀 SPRINT 6 MIT TDD

```bash
Sprint 6: KI-Integration (Claude Vision)

Day 1:
08:00 - SPRINT-START-CHECKLIST (15 min)
08:15 - SCHEMA-CHECKLIST (20 min)
08:35 - TDD TESTS SCHREIBEN (60 min)  ← NEW!
       - claudeService.test.ts (analyze image)
       - photoService.test.ts (save analysis)
       - tasksService.test.ts (auto-create tasks)

09:35 - Code implementieren (RED → GREEN) (90 min)
11:05 - Refactor (30 min)

Day 2:
Code remaining functions with TDD

Day 3:
Web-Build Test (Day 2 EOD)

Day 4:
Mobile-Build Test (Day 4 EOD)

Day 5:
Polish + Cost Check
```

---

## ✅ CHECKLIST: Bin ich fertig?

- [ ] Alle Service-Funktionen Tests haben?
- [ ] Happy path + sad path + edge cases getestet?
- [ ] Tests sind SPECIFISCH (nicht zu vage)?
- [ ] npm test läuft grün?
- [ ] Code Coverage > 80%?
- [ ] Integration Tests auch dabei?
- [ ] Web/Mobile Edge-Cases getestet?

**Wenn alle grün:** Feature ist DONE und bugfrei! 🚀
