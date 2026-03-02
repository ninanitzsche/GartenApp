# Supabase Database Setup

## 📋 Overview

This directory contains all database migrations for the Gartenplaner app.

**Total Tables:** 11
- `plants` - Plant inventory
- `tasks` - Garden tasks
- `plant_tasks` - Junction table (plants ↔ tasks)
- `photos` - Photo documentation
- `photo_plants` - Junction table (photos ↔ plants)
- `shopping_items` - Shopping list
- `harvests` - Harvest tracking
- `plans` - Garden area plans
- `knowledge_articles` - Knowledge base
- `plant_companions` - Companion planting database

**Storage Buckets:** 2
- `garden-photos` - User photos
- `garden-plans` - Garden plan images

---

## 🚀 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (free account)
3. Sign up or log in
4. Click **"New Project"**
5. Fill in:
   - **Name:** `gartenplaner`
   - **Database Password:** (choose a strong password - save it!)
   - **Region:** Europe (closest to Germany)
   - **Pricing Plan:** Free
6. Click **"Create new project"**
7. Wait ~2 minutes for project to provision

### Step 2: Get Your API Credentials

1. In Supabase Dashboard, go to **Settings** (⚙️ icon in sidebar)
2. Click **"API"**
3. Copy these values:

   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

### Step 3: Update .env File

1. Open `/Users/ninanitzsche/aipm/gartenplaner-app/.env` in your editor
2. Replace the placeholder values:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
   ```

3. Save the file

### Step 4: Run Database Migrations

1. In Supabase Dashboard, click **"SQL Editor"** in sidebar
2. Click **"New query"**
3. Copy the contents of `001_initial_schema.sql` (this file)
4. Paste into SQL Editor
5. Click **"Run"** button
6. ✅ You should see: "Success. No rows returned"

7. Repeat for `002_row_level_security.sql`:
   - New query → Paste SQL → Run
   - ✅ Success!

8. Repeat for `003_storage_buckets.sql`:
   - New query → Paste SQL → Run
   - ✅ Success!

### Step 5: Verify Setup

1. In Supabase Dashboard, click **"Table Editor"**
2. You should see all 11 tables listed on the left
3. Click **"Storage"** → you should see 2 buckets: `garden-photos`, `garden-plans`

---

## ✅ Testing the Connection

1. Restart your Expo dev server:
   ```bash
   # Press Ctrl+C to stop
   npm start
   # Press 'w' for web
   ```

2. The app should now show:
   ```
   ✅ Supabase connected! (Database tables not created yet)
   ```
   OR
   ```
   ✅ Supabase fully configured!
   ```

---

## 📊 Database Schema Details

### Plants Table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key to auth.users)
- name, location, type, status
- winterhart, essbar (booleans)
- menge, pflanz_datum, ernte_datum
- pflegehinweise, tags
- created_at, updated_at
```

### Tasks Table
```sql
- id, user_id
- title, description, category
- priority (1-3), standort, due_date
- completed_at, time_spent_minutes
- is_recurring, recurrence_interval
- parent_task_id (for recurring series)
```

### Photos Table
```sql
- id, user_id
- photo_url (Supabase Storage URL)
- standort, notes, note_category
- photo_date, created_at, updated_at
```

*(See individual migration files for complete schemas)*

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data.

**Public tables (read-only):**
- `knowledge_articles` - Everyone can read
- `plant_companions` - Everyone can read

**Private tables:**
- All others require `auth.uid() = user_id`

---

## 🗂️ File Structure

```
supabase/
├── README.md (this file)
└── migrations/
    ├── 001_initial_schema.sql     # Creates all 11 tables
    ├── 002_row_level_security.sql # RLS policies
    └── 003_storage_buckets.sql    # Photo/plan storage
```

---

## 🛠️ Troubleshooting

**Error: "relation 'plants' already exists"**
- Tables already created, skip to next migration

**Error: "permission denied for table X"**
- RLS policies not applied yet, run `002_row_level_security.sql`

**Error: "bucket already exists"**
- Buckets already created, that's okay!

**App shows "Supabase not configured"**
- Check `.env` file has correct URL and key
- Restart Expo server (Ctrl+C, then `npm start`)

---

## 📝 Next Steps

After database is set up:
- ✅ STORY-INF-001 complete!
- ➡️ Continue to STORY-034: App Navigation & Layout

---

**Created:** 2026-03-02
**Sprint:** Sprint 1
**Story:** STORY-INF-001 (5 points)
