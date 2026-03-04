# Garten2026 Migration Guide

## Overview

This migration script bulk-imports plant data and photos from the Garten2026 documentation into the Gartenplaner Supabase database.

**Duration:** ~50 minutes total (2h data prep + 45min script dev + 3min execution)

## Prerequisites

1. **Environment Setup**
   ```bash
   # Ensure Supabase credentials are set
   export EXPO_PUBLIC_SUPABASE_URL="your_url"
   export EXPO_PUBLIC_SUPABASE_ANON_KEY="your_key"
   ```

2. **User Authentication**
   - Start the app first: `npm start`
   - Login to establish a user session
   - The migration script uses your authenticated session

3. **Install Dependencies**
   ```bash
   cd gartenplaner-app
   npm install  # Installs sharp for image compression
   ```

## Step 1: Prepare Migration Data (2 hours)

### Create `scripts/data/garten2026-migration.json`

This file contains:
- **60+ plants** from `Garten2026/Pflanzen_Inventar_und_Pflege.md` and `Pflanzplan_2026.md`
- **22 photos** with plant-linking information

### JSON Structure

```json
{
  "plants": [
    {
      "name": "Kartoffel - Innovator",
      "latin_name": "Solanum tuberosum",
      "location": "Hauptbeet",
      "type": "einjährig",
      "status": "bestellt",
      "winterhart": false,
      "essbar": true,
      "quantity": 10,
      "planted_date": "2026-04-15",
      "harvest_date": "2026-09-15",
      "notes": "Reihe 1 Nord, mittelfrüh-spät, Pflanztiefe 10cm",
      "tags": ["gemüse", "kartoffeln"]
    }
  ],
  "photos": [
    {
      "filename": "hauptbeet_2024.jpg",
      "location": "Hauptbeet",
      "date": "2024-03-01",
      "notes": "Hauptbeet Übersicht 2024",
      "linked_plants": [
        "Kartoffel - Innovator",
        "Kartoffel - Laura",
        "Mais"
      ]
    }
  ]
}
```

### Data Collection Tips

**Plants (30 minutes):**
- Extract from: `Garten2026/Pflanzen_Inventar_und_Pflege.md`
- Extract from: `Garten2026/Pflanzplan_2026.md`
- Keep sorted by status: etabliert → bestellt → geplant
- Set `status` field correctly:
  - `"etabliert"` = already in garden (7 plants)
  - `"bestellt"` = ordered (50+ plants)
  - `"geplant"` = planned (remaining plants)

**Photos (90 minutes):**
1. Go through each photo in `Garten2026/` and `Garten2026/Februar2026/`
2. For each photo, identify which plants are visible
3. Add those plant names to the `linked_plants` array
4. Use exact plant names from your plants array

## Step 2: Run Migration

### Option 1: Dry Run (Test)

Validates your migration data without making changes:

```bash
npm run migrate:garten2026:dry-run
```

Expected output:
```
🌱 Garten2026 Migration Script
==================================================
ℹ️  DRY RUN MODE - No changes will be made

[1/5] Loading migration data...
✅ Loaded 60 plants, 22 photos

[2/5] Authenticating user...
✅ Authenticated as: user@example.com

[3/5] Migrating plants...
[1/60] Weinreben
   → Would create: Weinreben at Pergola
[2/60] Schnittlauch
...
```

### Option 2: Full Migration

Imports all plants and photos:

```bash
npm run migrate:garten2026
```

**Duration:** 20-35 minutes
- Plants: 5-10 min (60 plants)
- Photo compression: 5-10 min (60 MB → ~15 MB)
- Photo uploads: 10-15 min (22 photos)

### Option 3: Selective Migration

Only plants:
```bash
node scripts/migrate-garten2026.js --plants-only
```

Only photos:
```bash
node scripts/migrate-garten2026.js --photos-only
```

## Step 3: Verify Results

### Check Database (Supabase Dashboard)

```sql
-- Verify plants imported
SELECT status, COUNT(*) FROM plants GROUP BY status;
-- Expected: etabliert=7, bestellt=50+, geplant=...

-- Verify photo count
SELECT COUNT(*) FROM photos;
-- Expected: 22

-- Verify photo-plant links
SELECT p.name, COUNT(pp.photo_id) as photo_count
FROM plants p
LEFT JOIN photo_plants pp ON p.id = pp.plant_id
GROUP BY p.name
HAVING COUNT(pp.photo_id) > 0
ORDER BY photo_count DESC;
```

### Test in App

1. **npm start** - Start the dev server
2. **Plants Tab** - Should show 60+ plants
3. **Filter by Status** - "Etabliert" shows 7, "Bestellt" shows 50+
4. **Open a plant** - Check if photos are linked
5. **Gallery View** - Verify 22 photos uploaded

## Error Recovery

### Rollback (Delete All Migrated Data)

⚠️ **WARNING:** This deletes all imported data!

```sql
-- DELETE FROM plants WHERE user_id = 'YOUR_USER_ID';
-- DELETE FROM photos WHERE user_id = 'YOUR_USER_ID';
-- DELETE FROM photo_plants WHERE plant_id IN (SELECT id FROM plants WHERE user_id = 'YOUR_USER_ID');
```

### Partial Retry

Re-run migration for specific parts:

```bash
# Re-upload photos only
node scripts/migrate-garten2026.js --photos-only

# Re-import plants
node scripts/migrate-garten2026.js --plants-only
```

## Performance Notes

- **Image Compression:** Sharp reduces 60 MB → ~22 MB (67% reduction)
- **Batch Uploads:** Photos uploaded sequentially for reliability
- **Upsert Logic:** Plants updated if they already exist (idempotent)
- **RLS Protected:** All data isolated by user_id

## Troubleshooting

### "Migration data not found"
- Create `scripts/data/garten2026-migration.json`
- Run `npm install` to ensure script dependencies are installed

### "Not authenticated"
- Run `npm start` first and login to the app
- Your session is required for Supabase authentication

### Photos not uploading
- Check file permissions in `Garten2026/` directories
- Verify Supabase storage bucket permissions
- Check available disk space

### Partial upload succeeded
- Re-run with `--photos-only` to retry failed photos
- Check Supabase dashboard for upload errors

## Files Created

```
gartenplaner-app/
├── scripts/
│   ├── migrate-garten2026.js          # Main migration script
│   ├── MIGRATION-GUIDE.md             # This file
│   └── data/
│       └── garten2026-migration.json  # Migration data (you fill this in)
└── package.json                       # Updated with npm scripts + sharp
```

## Next Steps

1. **Prepare migration data** (garten2026-migration.json)
2. **Run dry-run** to validate
3. **Execute migration**
4. **Verify in app**
5. **Backup data** (optional)

## References

- Garten2026 source: `/Users/ninanitzsche/aipm/Garten2026/`
- Plant schema: `src/utils/seedData.ts`
- Photo service: `src/services/photoService.ts`
- Database docs: `docs/database-schema.sql`
