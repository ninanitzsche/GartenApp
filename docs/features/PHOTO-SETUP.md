# Photo Upload & Gallery - Setup Guide

This document provides the database and storage setup required for the photo upload and gallery features implemented in Sprint 5.

## Database Setup (Supabase)

### 1. Create Photos Table

Run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_plant_id ON photos(plant_id);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
```

### 2. Enable Row Level Security (RLS)

Enable RLS on the photos table:

```sql
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
```

### 3. Create RLS Policies

```sql
-- Policy: Users can view their own photos
CREATE POLICY "Users can view own photos" ON photos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own photos
CREATE POLICY "Users can insert own photos" ON photos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own photos
CREATE POLICY "Users can update own photos" ON photos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON photos
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Storage Setup (Supabase)

### 1. Create Storage Bucket

In Supabase Console → Storage:

**Create a new bucket:**
- **Name:** `plant-photos`
- **Privacy:** Private (authenticated users only)

### 2. Create Storage Policy

In Supabase Console → Storage → Policies:

```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'plant-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own photos
CREATE POLICY "Users can view own photos" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'plant-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'plant-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## File Structure

Photos are stored in the bucket with this structure:
```
plant-photos/
├── {user_id}/
│   ├── {plant_id}/
│   │   ├── photo-{timestamp}.jpg
│   │   ├── photo-{timestamp}.jpg
│   │   └── ...
```

Example:
```
plant-photos/
├── 550e8400-e29b-41d4-a716-446655440000/
│   ├── 123e4567-e89b-12d3-a456-426614174000/
│   │   ├── photo-1709473400000.jpg
│   │   └── photo-1709473401234.jpg
```

## TypeScript Types

The Photo interface is defined in `src/types/photo.ts`:

```typescript
export interface Photo {
  id: string;
  file_url?: string;
  photo_url?: string;
  thumbnail_url?: string;
  date?: string;
  location?: string;
  notes?: string;
  plant_id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}
```

## Service Functions

Available in `src/services/photoService.ts`:

- `fetchPhotos(plantId: string)` - Get all photos for a plant
- `fetchPhoto(id: string)` - Get a single photo
- `uploadPhoto(plantId, fileUri, fileName)` - Upload and save
- `deletePhoto(photoId, photoPath?)` - Delete photo and file
- `getPublicPhotoUrl(storagePath)` - Get public URL

## Security Notes

1. **RLS Enforcement:** All queries automatically filter by `user_id` via RLS policies
2. **Storage Path:** User's own ID required in path to access storage
3. **Cascading Deletes:** Deleting a plant cascades to delete all associated photos
4. **Authentication:** All operations require user to be authenticated

## Testing

After setup, test with:

1. **Create a plant** in the app
2. **Take a photo** with PhotoUploadScreen
3. **View in gallery** with PhotoGalleryScreen
4. **Delete a photo** from the full-size modal
5. **Check Supabase Console** to verify:
   - Row added to `photos` table
   - File uploaded to `plant-photos` bucket

## Troubleshooting

### "Permission denied" error
- Check RLS policies are created
- Verify `user_id` is set correctly in INSERT
- Check Storage policies include your user ID

### Photo not appearing
- Check Supabase Console → Storage for file upload
- Check Supabase Console → Database for row insert
- Verify plant_id matches between table and storage

### Upload fails silently
- Check Network tab in browser dev tools
- Verify file size is reasonable (~5MB max)
- Check Storage bucket has enough quota

## Related Files

- `src/screens/PhotoUploadScreen.tsx` - Upload UI
- `src/screens/PhotoGalleryScreen.tsx` - Gallery UI
- `src/services/photoService.ts` - Service layer
- `src/types/photo.ts` - Type definitions
- `src/navigation/PlantsStackNavigator.tsx` - Navigation setup

## Next Steps

1. Run SQL setup scripts
2. Create Storage bucket and policies
3. Update `env.local` with Supabase project URL (if needed)
4. Test with app (install dependencies first with `npm install`)
