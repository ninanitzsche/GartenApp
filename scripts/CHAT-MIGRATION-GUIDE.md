# Chat Knowledge Migration Guide

## Overview

This migration imports gardening knowledge and calendar tasks from Gemini AI chat transcripts into the Gartenplaner database.

**Duration:** 2-5 minutes total

## What Gets Migrated

### 1. Calendar Tasks → `tasks` Table
- **Planting dates:** "Tomaten Vorzucht starten (15.03.2026)"
- **Maintenance tasks:** "Schneckenschutz-Wache (20.05.2026)"
- **Pruning schedules:** "Winterschnitt Beeren (15.02.2026)"
- **Mulching tasks:** "Große Mulch-Aktion (01.06.2026)"

Each task gets:
- `title`: Task name
- `description`: Full instructions
- `scheduled_date`: Planned execution date (new field!)
- `category`: Auto-detected (planting, pruning, harvesting, maintenance, etc.)
- `priority`: Auto-assigned (hoch = high, mittel = medium)
- `auto_generated: true`: Marked as system-generated

### 2. Care Guides → `knowledge_articles` Table
- Plant care tables with care instructions per plant
- Permaculture strategies ("No-Dig Methode", "Drei Schwestern", etc.)
- Companion planting tips
- Seasonal scheduling advice

Each article gets:
- `title`: Article title
- `category`: care, strategy, companions, etc.
- `content`: Full markdown content
- `is_favorited: false`: Can be favorited in app later

## Prerequisites

1. **Login first:**
   ```bash
   npm start
   # Open app and login/signup
   ```

2. **Ensure Supabase credentials are set** (in `.env`):
   ```
   EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   EXPO_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
   ```

3. **Source files present:**
   - `/Users/ninanitzsche/aipm/Gemini chatverlauf 1.md`
   - `/Users/ninanitzsche/aipm/Gemini Chatverlauf 2.md`

## Running the Migration

### Option 1: Dry Run (Test)
Validates extraction without saving to database:

```bash
npm run migrate:chat-knowledge:dry-run
```

Expected output:
```
🌿 Chat Knowledge Migration Script
==================================================

✅ Gemini Chatverlauf 1 found
✅ Gemini Chatverlauf 2 found

[1/4] Authenticating user...
✅ Authenticated as: your@email.com

[2/4] Loading and parsing chat transcripts...
✅ Parsed Gemini Chatverlauf 1: 18 tasks found
✅ Parsed Gemini Chatverlauf 2: 25 tasks found

[3/4] Migrating 43 tasks...
[1/43] Tomaten Vorzucht starten (2026-03-15)
[2/43] Kartoffeln legen (2026-04-15)
...

✅ Tasks: 43
✅ Knowledge Articles: 12
ℹ️  (DRY RUN - no data was actually saved)
```

### Option 2: Full Migration
Imports all tasks and knowledge articles:

```bash
npm run migrate:chat-knowledge
```

**Duration:** 1-3 minutes
- Parsing: 10-20 seconds
- Database inserts: 30-60 seconds per batch

### Option 3: Selective Migration

Only tasks (no knowledge articles):
```bash
npm run migrate:chat-knowledge -- --tasks-only
```

Only knowledge articles (no tasks):
```bash
npm run migrate:chat-knowledge -- --knowledge-only
```

## What Gets Extracted

### From Gemini Chatverlauf 1 (~772 lines)
**Calendar entries (18 tasks):**
1. Rückschnitt der alten Stauden & Kräuter (01.03.2026)
2. Aussaat Zwiebeln & robuste Kräuter (20.03.2026)
3. Wassermelone Vorzucht (10.04.2026)
4. Blumen & Stauden aussäen (20.04.2026)
5. Kartoffeln legen (15.04.2026)
6. Tomaten Vorzucht (15.03.2026)
7. Hauptaussaat: Mais, Bohnen, Gurken (15.05.2026)
8. Neuseeländer Spinat einweichen (10.05.2026)
9. Neuseeländer Spinat aussäen (11.05.2026)
10. Tomaten & Wassermelonen auspflanzen (16.05.2026)
11. Schneckenschutz-Wache (20.05.2026)
12. Große Mulch-Aktion (01.06.2026)
13. Ernte-Check & Lücken füllen (15.07.2026)
14. Permakultur-Jauche ansetzen (07.06.2026)
15. Saatgut für nächstes Jahr ernten (20.08.2026)
16. Garten winterfest machen (25.10.2026)
17. Brennnessel-Barriere anlegen (25.03.2026)
18. Winterschnitt Kernobst, Wein & Beerensträucher (15.02.2026)

**Knowledge articles:**
- Pflegeanleitung Tabelle (Aussaat-Tiefe, Standort, etc. pro Pflanze)

### From Gemini Chatverlauf 2 (~1,304 lines)
**Calendar entries (25+ tasks):**
- Sommerschnitt Beeren & Steinobst (25.07.2026)
- Anzucht-Timing (4 phases)
- Blumen-Vorkultur Details

**Knowledge articles:**
- Quick-Pot Belegung Tabelle
- Kartoffel-Lichtkeime Strategie
- MHD (Saatgut-Alter) Handling
- Französischer Balkon Nutzung
- Blumen-spezifische Anzucht

## After Migration

### 1. Check Database (Optional)

```sql
-- Count migrated tasks
SELECT COUNT(*) FROM tasks WHERE auto_generated = true AND user_id = 'YOUR_USER_ID';
-- Expected: ~43 tasks

-- Check scheduled dates
SELECT title, scheduled_date FROM tasks WHERE auto_generated = true
  ORDER BY scheduled_date ASC;

-- Count knowledge articles
SELECT COUNT(*) FROM knowledge_articles WHERE user_id = 'YOUR_USER_ID';
-- Expected: ~12 articles
```

### 2. Test in App

1. **npm start** - Start dev server
2. **Tasks Screen** - Should show 43 new scheduled tasks
3. **Filter by Date** - March shows "Rückschnitt", "Brennnessel-Barriere"
4. **Knowledge Tab** (if exists) - Browse new care guides
5. **Mark as Complete** - Click a task and mark complete

### 3. Edit or Delete

Tasks imported can be edited or deleted like any other task:
- Delete completed tasks after execution
- Update scheduled dates if planning changes
- Modify descriptions to match your garden

## Troubleshooting

### "Not authenticated"
```
❌ Not authenticated. Please run: npm start and login first
```
**Solution:**
1. Run `npm start`
2. Login/signup in the app
3. Return to terminal and run migration again

### "Chat files not found"
```
⚠️  Gemini Chatverlauf 1 not found: /Users/ninanitzsche/aipm/Gemini chatverlauf 1.md
```
**Solution:**
- Ensure files exist at `/Users/ninanitzsche/aipm/`
- Check filename capitalization (case-sensitive on macOS)

### "Supabase credentials not configured"
```
❌ Supabase credentials not configured
```
**Solution:**
- Add to `.env`: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Run `source .env` to load variables
- Verify with `echo $EXPO_PUBLIC_SUPABASE_URL`

### Tasks not appearing in app
- Clear app cache: `npm start --clear`
- Check AsyncStorage for seed data flag conflicts
- Verify RLS policies allow read access to your user_id

## Data Mapping Reference

| Source | Target Table | Mapping |
|--------|--------------|---------|
| Calendar Title | `tasks.title` | Direct copy |
| Calendar Date | `tasks.scheduled_date` | Parse to YYYY-MM-DD |
| Calendar Description | `tasks.description` | Full text |
| Task type (Aussaat, Schnitt, etc.) | `tasks.category` | Auto-detected |
| Importance | `tasks.priority` | Auto-assigned |
| Care sections | `knowledge_articles` | Extracted & stored |
| Plant tables | `knowledge_articles.content` | Markdown preserved |

## Files Created/Modified

```
gartenplaner-app/
├── scripts/
│   ├── migrate-chat-knowledge.js          # New migration script
│   └── CHAT-MIGRATION-GUIDE.md            # This file
├── docs/
│   └── database-schema.sql                # Modified: added scheduled_date to tasks
└── package.json                           # Modified: added npm scripts
```

## References

- Database schema: `docs/database-schema.sql`
- Task service: `src/services/taskService.ts`
- Knowledge service: `src/services/knowledgeService.ts` (if exists)
- Previous migration: `scripts/migrate-garten2026.js`
- Chat sources: `/Users/ninanitzsche/aipm/Gemini*.md`

## Next Steps

1. **Run dry-run** to validate extraction
2. **Execute full migration** to import data
3. **Test in app** - browse tasks and articles
4. **Edit as needed** - adjust dates, priorities, descriptions
5. **Mark complete** - as you execute each task

---

**Migration created:** 2026-03-05
**Status:** Ready to run
