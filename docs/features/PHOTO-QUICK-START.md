# Photo Features Quick Start Guide

Get the photo upload and gallery features working in 10 minutes.

## Prerequisites

- Supabase project created
- React Native app running

## Step 1: Install Dependencies (2 min)

```bash
cd gartenplaner-app
npm install expo-image-picker
npm install
```

## Step 2: Create Database Table (3 min)

Open **Supabase Console** → **SQL Editor** → Paste this:

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

CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_plant_id ON photos(plant_id);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
```

Click **Run** ✅

## Step 3: Create RLS Policies (2 min)

In **SQL Editor**, paste this:

```sql
CREATE POLICY "Users can view own photos" ON photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON photos
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON photos
  FOR DELETE USING (auth.uid() = user_id);
```

Click **Run** ✅

## Step 4: Create Storage Bucket (2 min)

1. Go to **Storage** in Supabase
2. Click **Create new bucket**
3. Name: `plant-photos`
4. Privacy: **Private** (important!)
5. Click **Create bucket** ✅

## Step 5: Test in App (1 min)

1. Start app: `npm start`
2. Login to app
3. Click on any plant
4. You should see "📸 Fotos" section with "Galerie" button
5. Click "Foto hinzufügen" button
6. Take photo or select from gallery
7. Click "Hochladen"
8. Success! Photo appears in gallery

## What You Get

### PhotoUploadScreen
- Click "Kamera" → Take photo with device camera
- Click "Galerie" → Pick photo from phone
- See preview before uploading
- Click "Hochladen" to save

### PhotoGalleryScreen
- Click "Galerie" to view all photos
- Tap any photo for full-size view
- Swipe to close or click X
- Click trash icon to delete photo
- Pull down to refresh

### PlantDetailScreen
- See "📸 Fotos (3)" section
- Click "Galerie" button to view all
- Click "Foto hinzufügen" if no photos exist

## Troubleshooting

### "Permission denied" when uploading
- Check RLS policies are created
- Check phone allows camera/gallery access
- Restart app

### Photo doesn't appear
- Check Supabase → Storage → plant-photos folder
- Check Supabase → Database → photos table
- Check browser console for errors

### Can't take photo
- Grant camera permission when prompted
- On Android: Check Settings → App Permissions → Camera
- On iOS: Check Settings → Privacy → Camera

## File Reference

| File | Purpose |
|------|---------|
| `src/services/photoService.ts` | Photo API |
| `src/screens/PhotoUploadScreen.tsx` | Upload UI |
| `src/screens/PhotoGalleryScreen.tsx` | Gallery UI |
| `src/screens/PlantDetailScreen.tsx` | Integration |
| `src/navigation/PlantsStackNavigator.tsx` | Routes |

## Next: Advanced Setup

See `docs/PHOTO-SETUP.md` for:
- Custom storage policies
- Advanced RLS configurations
- Troubleshooting guide
- Performance tuning

## Getting Help

1. Check `docs/PHOTO-SETUP.md` for full documentation
2. Check browser Network tab for upload errors
3. Check Supabase Logs for database errors
4. Review test file: `src/__tests__/photoService.test.ts`

---

**That's it! Photo features are now working.** 🎉

For production, add:
- Image compression
- Thumbnail generation
- Error tracking
- Analytics
