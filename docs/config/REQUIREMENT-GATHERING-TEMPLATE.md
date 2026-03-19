# Requirement Gathering Template - Pre-Sprint (AUTOMATIC)

**Purpose:** Make requirements SUPER specific BEFORE coding = saves $0.40-1.50 per sprint!
**Timing:** Run this at sprint start (15 minutes)
**Owner:** You (gathering) + Claude (validation + implementation)
**Impact:** 40-50% cost reduction via fewer retries

---

## 📋 QUICK CHECKLIST (15 min total)

For each task/story, answer these questions:

### [ ] 1. WHAT is being built? (2 min)
```
Task: _____________________________
Feature Name: _____________________________
1-sentence description: _____________________________

Example:
Task: STORY-055
Feature: Photo Upload with Compression
Description: User can upload garden photos compressed to 1200x1200 @ 70% quality
```

### [ ] 2. WHERE will it go? (2 min)
```
File Path(s): _____________________________
Existing file? YES / NO

If YES:
- File: src/screens/PlantListScreen.tsx
- Start line: 42
- End line: 67
- Change type: Modify / Add new section / Replace

If NEW:
- Directory: src/components/
- Filename: PhotoUploader.tsx
- Dependencies: photoService, useAuth hook
```

### [ ] 3. ACCEPTANCE CRITERIA (3 min)
```
AC1: _____________________________
     File: _____ Line: _____
     How to verify: _____

AC2: _____________________________
     File: _____ Line: _____
     How to verify: _____

AC3: _____________________________
     File: _____ Line: _____
     How to verify: _____

Example:
AC1: Image compressed to 1200x1200 @ 70% quality
     File: src/services/photoService.ts
     How to verify: Open DevTools, check image dimensions + file size

AC2: Photo linked to plant via photo_plants junction table
     File: docs/database/database-schema.sql
     How to verify: SELECT * FROM photo_plants WHERE photo_id = X

AC3: Delete removes file from storage + DB entries
     File: src/services/photoService.ts, deletePhoto()
     How to verify: Delete in app, file missing from storage + DB
```

### [ ] 4. DESIGN/SCHEMA CHANGES? (3 min)
```
New tables? YES / NO
New columns? YES / NO
RLS changes? YES / NO

If YES - describe:
_____________________________

Example:
- New table: photo_plants (junction table)
  Fields: photo_id (FK), plant_id (FK), created_at

- New column: plants.photo_count (denormalized, for UI speed)

- RLS: SELECT on photo_plants only where plant owner = auth.uid()
```

### [ ] 5. DEPENDENCIES (2 min)
```
Blocks other tasks? YES / NO
Blocked by other tasks? YES / NO
External dependencies? YES / NO

If YES:
- Task: STORY-047 (RLS policy setup) MUST be done first
- External: Supabase Storage bucket (existing)
```

### [ ] 6. SIMILAR PATTERNS? (2 min)
```
Similar to existing code? YES / NO

If YES:
- Pattern found: photoService.ts
- Can reuse: 70% (same service layer)
- Copy from: src/services/plantService.ts (line 1-50)

Cost saved: $0.20 (pattern reuse)
```

### [ ] 7. EDGE CASES? (1 min)
```
Web compatibility? YES / NO
Error handling needed? YES / NO
Validation needed? YES / NO

If YES - specify:
- Web: Image picker fallback (Platform.OS check)
- Errors: Handle storage failure, DB constraint errors
- Validation: File size < 5MB, format = JPG/PNG only
```

---

## 📝 COMPLETE EXAMPLE (Filled Out)

```markdown
# STORY-055: Photo Upload with Compression

## 1. WHAT
Task: STORY-055
Feature: Photo Upload with Compression
Description: User can upload garden photos compressed to 1200x1200 @ 70% quality and link them to plants

## 2. WHERE
New File: src/components/PhotoUploadModal.tsx
Existing File: src/screens/PlantDetailScreen.tsx (add button at line 42)
Dependency File: src/services/photoService.ts (new functions)

## 3. ACCEPTANCE CRITERIA

AC1: Image compressed to 1200x1200 @ 70% quality
     File: src/services/photoService.ts, compressImage() function
     How to verify: npm test photoService.test.ts, compression tests

AC2: Photo linked to plant via photo_plants junction table
     File: docs/database/database-schema.sql
     How to verify: Query DB after upload, verify photo_plants entry created

AC3: Delete removes file from storage + DB entries
     File: src/services/photoService.ts, deletePhoto() function
     How to verify: Delete photo in app, check storage bucket + DB

## 4. SCHEMA CHANGES

New table:
- Name: photo_plants (junction table)
- Fields:
  - id (UUID, PK)
  - photo_id (UUID, FK → photos.id)
  - plant_id (UUID, FK → plants.id)
  - created_at (timestamp)
- Indexes: (photo_id, plant_id)

RLS Policies:
- SELECT: user owns the plant (plants.user_id = auth.uid())
- INSERT: user owns the plant
- DELETE: user owns the plant

## 5. DEPENDENCIES

Blocks: STORY-056 (Gallery view of photos)
Blocked by: None (independent)

## 6. SIMILAR PATTERNS

plantService.ts uses Service Layer (CRUD, error handling, RLS)
→ Copy 80% of structure for photoService.ts
→ Cost saved: $0.30 (no need to explain pattern)

## 7. EDGE CASES

Web compatibility:
- Camera not available on web
- Use expo-image-picker with Platform.OS fallback
- See docs/reference/WEB-NATIVE-DIFFERENCES.md

Error handling:
- Storage quota exceeded → Show toast "Storage full"
- DB constraint → Show toast "Photo already linked"
- Network error → Show toast "Connection failed, retry"

Validation:
- File size: < 5MB (show error if larger)
- Format: JPG/PNG only (reject if different)
- Dimensions: Input can be any size (resize in compression)
```

---

## ✅ HOW CLAUDE USES THIS (Automatic)

### At Sprint Start:
```
I automatically:
1. Check if requirement template is filled (detailed requirements)
2. Validate clarity (are file paths specific? Line numbers exact?)
3. Identify cost savings ("Pattern reuse found: $0.30 saved")
4. Spot potential issues ("Web compat check: Platform.OS needed")
5. Suggest batching ("AC1-AC3 tests can be batched in 1 call")

Alert: "Requirements validated ✅. Estimated cost: $0.15-0.25 (down from $0.60 without this)"
```

### During Task Execution:
```
I reference this template:
- Follow file paths exactly (no guessing)
- Test against AC1/AC2/AC3 (no scope creep)
- Check "Similar patterns" (reuse suggestion)
- Remember edge cases (proactive error handling)
- Verify schema changes before coding (schema-first!)

Cost impact: First-try implementations, zero clarification retries!
```

### End of Task:
```
Verify:
- All AC1-AC3 passed?
- Edge cases handled?
- Pattern reuse applied?
- Schema changes in DB?

Update: Add any new patterns discovered to MEMORY.md
```

---

## 🎯 TEMPLATE USAGE EXAMPLES

### Example 1: Vague vs Specific

**BEFORE (Vague - causes retries):**
```
Task: "Add search to plants list"
Impact: What search? Where? How? → Clarification needed → +$0.30
```

**AFTER (Specific - no retries):**
```
AC1: Add search input to PlantListScreen (src/screens/PlantListScreen.tsx, line 42)
AC2: Filter plants by name (case-insensitive)
AC3: Debounce 300ms (performance)
     File: src/screens/PlantListScreen.tsx line 42
     Verify: Use pattern from MEMORY.md (search debounce documented)
Impact: Clear → First try correct → $0.00 clarification cost
```

---

### Example 2: Hidden Costs (Now Visible)

**Without template:**
```
❌ "Add photo upload"
   → Forgot: Web compat needed!
   → Forgot: RLS policy changes!
   → Forgot: Error handling!
   → Result: Retry + changes → +$0.40
```

**With template:**
```
✅ "Add photo upload"
   AC1: Storage file
   AC2: DB link
   AC3: Delete cleanup

   Edge cases checked:
   ✓ Web: Image picker fallback
   ✓ Errors: Storage full, DB constraint
   ✓ Validation: File size < 5MB

   Result: All planned upfront → First try → $0.00 extra
```

---

## 📊 COST IMPACT MATH (Token-Based)

### Scenario: 4-task sprint

**WITHOUT Template (Vague requirements):**
```
Task 1: 5,000 tokens (clear)
Task 2: 6,500 tokens (vague → retry needed)
Task 3: 4,000 tokens (clear)
Task 4: 8,000 tokens (vague → major retry)
Total: 23,500 tokens (≈ €1.41)
```

**WITH Template (15 min gathering):**
```
Pre-sprint: 15 min template gathering (0 tokens)

Task 1: 2,500 tokens (clear from template)
Task 2: 2,500 tokens (clarified by template, no retry)
Task 3: 1,600 tokens (clear from template)
Task 4: 1,300 tokens (clearly specified, pattern reuse found)
Total: 8,000 tokens (≈ €0.48)

Savings: 23,500 - 8,000 = 15,500 tokens (66% fewer!) = €0.93
```

---

## 🚀 SPRINT 6 PROCESS (Automatic)

### Step 1: Gather Requirements (15 min) ← YOU DO THIS
```
Before sprint starts, fill out template for each story
Make sure AC1-AC2-AC3 are specific + linked to files
```

### Step 2: Claude Validates (Automatic) ← I DO THIS
```
"✅ Requirements validated
- All AC linked to files ✓
- No vague descriptions ✓
- Edge cases identified ✓
- Pattern reuse found: $0.40 savings ✓

Estimated cost: $0.08-0.15 (vs $0.60 without clarity)"
```

### Step 3: Implement (Automatic) ← I DO THIS
```
Follow the template exactly:
- File paths from "WHERE" section
- Test against "ACCEPTANCE CRITERIA"
- Apply patterns from "SIMILAR PATTERNS"
- Handle cases from "EDGE CASES"
```

### Step 4: Verify (Automatic) ← I DO THIS
```
Before marking complete:
- All AC1-AC2-AC3 pass? ✓
- Edge cases handled? ✓
- New patterns documented? ✓
```

---

## 📋 COPY-PASTE TEMPLATE (For Each Task)

```markdown
# STORY-XXX: [Feature Name]

## 1. WHAT
Task: STORY-XXX
Feature: _____________________________
Description: _____________________________

## 2. WHERE
File(s): _____________________________
Change type: Modify / Add / Replace

## 3. ACCEPTANCE CRITERIA
AC1: _____________________________
     File: _____ Line: _____

AC2: _____________________________
     File: _____ Line: _____

AC3: _____________________________
     File: _____ Line: _____

## 4. SCHEMA CHANGES
Tables: YES / NO
Columns: YES / NO
RLS: YES / NO

## 5. DEPENDENCIES
Blocks: _____________________________
Blocked by: _____________________________

## 6. SIMILAR PATTERNS
Reusable pattern: YES / NO
Cost saved: $_____

## 7. EDGE CASES
Web compat: _____________________________
Errors: _____________________________
Validation: _____________________________
```

---

## ✨ BENEFITS

✅ **40-50% cost reduction** (fewer retries)
✅ **Clearer acceptance criteria** (no scope creep)
✅ **Faster implementation** (no clarifications mid-task)
✅ **Better edge case coverage** (planned upfront)
✅ **Pattern reuse identified** (save $0.20-0.40 per task)
✅ **Schema safety** (catch DB issues before coding)
✅ **Web compatibility** (remember platform differences)

---

## 🔄 WHEN TO USE

- ✅ **Every sprint** (before starting work)
- ✅ **For each story/task** (15 min per task)
- ✅ **Before coding** (not after!)
- ✅ **Shared with Claude** (I read and validate)

---

**This template is THE biggest cost-saving lever.**
**15 minutes of prep = $0.40-1.50 saved per sprint!**

---

*Requirement Gathering Template v1.0*
*Used automatically at sprint start*
*Part of cost optimization system*
