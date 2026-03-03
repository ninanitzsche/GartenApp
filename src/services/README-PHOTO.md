# Photo Service & Screens

This directory contains the complete photo upload and gallery implementation for the Gartenplaner app.

## Overview

Users can now:
- 📷 Take photos with device camera
- 🖼️ Select photos from gallery
- ⬆️ Upload to Supabase Storage
- 👁️ View in a beautiful grid gallery
- 🗑️ Delete photos with confirmation
- 🔄 Refresh gallery to see new photos

## Files

### Services
- **photoService.ts** - Core CRUD operations for photos
  - `fetchPhotos(plantId)` - Get all photos for a plant
  - `fetchPhoto(id)` - Get single photo
  - `uploadPhoto(plantId, fileUri, fileName)` - Upload and save
  - `deletePhoto(photoId, photoPath)` - Delete photo and file
  - `getPublicPhotoUrl(storagePath)` - Get public URL

### Screens
- **PhotoUploadScreen.tsx** - Upload interface
  - Camera button to take photos
  - Gallery button to select from library
  - Image preview before upload
  - Loading state and error handling

- **PhotoGalleryScreen.tsx** - Gallery interface
  - 2-column grid layout
  - Full-size modal viewer
  - Delete with confirmation
  - Pull-to-refresh
  - Empty state with action button

### Tests
- **photoService.test.ts** - Unit tests (12+ cases)
  - Tests all CRUD operations
  - Error handling
  - Mock Supabase

## Quick Start

### 1. Install Dependencies
```bash
npm install expo-image-picker
```

### 2. Setup Database
See `/docs/PHOTO-SETUP.md` for:
- SQL to create photos table
- RLS policy setup
- Storage bucket creation

### 3. Use in Your Code
```typescript
import { fetchPhotos, uploadPhoto } from '../services/photoService';

// Get all photos for a plant
const photos = await fetchPhotos(plantId);

// Upload a photo
const path = await uploadPhoto(plantId, fileUri, fileName);

// Delete a photo
await deletePhoto(photoId, photoPath);
```

### 4. Navigate to Screens
```typescript
// View gallery
navigation.navigate('PhotoGallery', { plantId });

// Upload photo
navigation.navigate('PhotoUpload', { plantId });
```

## Database Schema

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_plant_id ON photos(plant_id);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
```

## RLS Policies

All policies are user-scoped:

```sql
-- Users can only see their own photos
CREATE POLICY "Users can view own photos" ON photos
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own photos
CREATE POLICY "Users can insert own photos" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own photos
CREATE POLICY "Users can delete own photos" ON photos
  FOR DELETE USING (auth.uid() = user_id);
```

## Storage Structure

Photos are stored in the `plant-photos` bucket:

```
plant-photos/
├── {user_id}/
│   ├── {plant_id}/
│   │   ├── photo-1709473400000.jpg
│   │   ├── photo-1709473401234.jpg
│   │   └── ...
```

## Features

✅ Camera and gallery access
✅ Image preview before upload
✅ Upload progress indicator
✅ Error handling with user-friendly messages
✅ Full-size photo viewer
✅ Delete confirmation
✅ Pull-to-refresh
✅ Empty state messages
✅ Responsive grid layout
✅ Type-safe navigation
✅ RLS security
✅ User authentication checks

## Testing

Run unit tests:
```bash
npm test -- photoService.test.ts
```

Manual testing checklist in `/docs/STORY-041-CHECKLIST.md`

## Documentation

- **docs/PHOTO-QUICK-START.md** - 5-minute setup
- **docs/PHOTO-SETUP.md** - Detailed database setup
- **docs/STORY-041-IMPLEMENTATION.md** - Full implementation details
- **docs/STORY-041-CHECKLIST.md** - Acceptance criteria

## Integration with PlantDetailScreen

The PlantDetailScreen automatically shows:
- Photo count badge (📸 3 Fotos)
- Gallery button to view all photos
- Horizontal scroll of recent photos
- "Foto hinzufügen" button when empty

## Permissions

iOS:
- Privacy - Camera Usage Description
- Privacy - Photo Library Usage Description

Android:
- android.permission.CAMERA
- android.permission.READ_EXTERNAL_STORAGE

Both handled by expo-image-picker automatically.

## Performance

- FlatList optimized for 2-column grid
- Images compressed at 80% JPEG quality
- Lazy loading of photos
- Proper memory management

## Future Enhancements

- [ ] Thumbnail generation
- [ ] Image compression optimization
- [ ] Batch upload
- [ ] Photo rotation
- [ ] Offline caching
- [ ] Share functionality
- [ ] Photo filters

## Troubleshooting

### Permission denied error
1. Check RLS policies are created
2. Verify user authentication
3. Check phone permissions
4. Restart app

### Photos not uploading
1. Check network connection
2. Verify Storage bucket exists
3. Check browser console for errors
4. Review Supabase logs

### Gallery not loading
1. Check photos table has data
2. Verify RLS policies
3. Check plantId is correct
4. Pull-to-refresh to reload

## Support

See `/docs/PHOTO-SETUP.md` for comprehensive setup instructions and troubleshooting.

---

**Status:** ✅ Production Ready
**Last Updated:** 2026-03-03
**Sprint:** 5
**Story:** STORY-041
