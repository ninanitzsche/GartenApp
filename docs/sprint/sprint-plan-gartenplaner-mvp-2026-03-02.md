# Sprint Plan: gartenplaner

**Date:** 2026-03-02
**Scrum Master:** ninanitzsche
**Project Level:** 2
**Total Stories:** 34
**Total Points:** 146 points
**Planned Sprints:** 11 sprints (Phase 1 MVP)

---

## Executive Summary

This sprint plan breaks down the Gartenplaner mobile app into 34 implementable user stories across 11 sprints for the Phase 1 MVP. The plan prioritizes rapid delivery of core functionality (plant inventory, task management, photo documentation) with a realistic timeline for solo development alongside family responsibilities.

**Key Metrics:**
- **Total Stories:** 34 stories
- **Phase 1 MVP:** 27 stories, 112 points
- **Phase 2 (KI Features):** 4 stories, 26 points
- **Phase 3 (Advanced):** 1 story, 8 points
- **Phase 4 (Optional):** 2 stories, 0 points (deferred)
- **Team Capacity:** 10-12 points per sprint
- **Sprint Length:** 2 weeks
- **Target MVP Completion:** Ende Juli 2026 (~5 months)

---

## Story Inventory

### Infrastructure Stories

---

### STORY-000: Development Environment Setup

**Epic:** Infrastructure
**Priority:** Must Have
**Points:** 3
**Status:** ✅ COMPLETED

**User Story:**
As a developer
I want to set up the React Native + Expo development environment
So that I can begin building the Gartenplaner app

**Acceptance Criteria:**
- [x] React Native + Expo project initialized with TypeScript
- [x] Folder structure created (components/, screens/, services/, types/, utils/)
- [x] Supabase client configured and connected
- [x] Environment variables configured (.env for API keys)
- [x] Basic app runs on iOS Simulator and Android Emulator
- [x] Git repository initialized with .gitignore
- [x] README with setup instructions

**Technical Notes:**
- Use Expo SDK 50+
- Install dependencies: @supabase/supabase-js, react-navigation, expo-camera, expo-image-picker
- Configure TypeScript for type safety
- Use Expo's managed workflow for simplicity

**Dependencies:**
- None (first story)

---

### STORY-INF-001: Database Schema & RLS Setup

**Epic:** Infrastructure
**Priority:** Must Have
**Points:** 5
**Status:** ✅ COMPLETED (Functionally complete, docs needed)

**User Story:**
As a developer
I want to create all database tables in Supabase with Row Level Security
So that user data is properly stored and secured

**Acceptance Criteria:**
- [x] All 11 tables created in Supabase: plants, tasks, photos, shopping_items, harvests, plans, knowledge_articles, plant_companions, plant_tasks (junction), photo_plants (junction), users (auth.users)
- [⚠️] SQL schemas match architecture document exactly (Functional but undocumented)
- [x] Row Level Security (RLS) policies enabled on all tables
- [x] RLS policies: Users can only access their own data (user_id filter)
- [⚠️] Indexes created for performance (user_id, created_at, status) (Assumed but unverified)
- [x] Foreign key constraints configured (ON DELETE CASCADE where appropriate)
- [x] Test data inserted manually to verify schema (App can add/fetch plants)

**Technical Notes:**
- Use Supabase SQL Editor for schema creation
- RLS pattern: `CREATE POLICY "Users manage own data" ON plants FOR ALL USING (auth.uid() = user_id);`
- Enable realtime for tables that need it (tasks, photos)
- Document schema in migration files for version control

**Dependencies:**
- STORY-000 (Supabase connection)

---

### EPIC-001: Pflanzen-Inventar-Management

---

### STORY-001: Pflanzen CRUD-Funktionen

**Epic:** EPIC-001 (Pflanzen-Inventar-Management)
**Priority:** Must Have
**Points:** 5
**Status:** ✅ COMPLETED

**User Story:**
As a gardener
I want to create, view, edit, and delete plants in my inventory
So that I can manage my garden plant database

**Acceptance Criteria:**
- [x] "Add Plant" screen with form: Name (required), Location (dropdown), Type (mehrjährig/einjährig), Status (dropdown), Winterhart (checkbox), Essbar (checkbox), Menge, Pflanz-Datum, Ernte-Datum, Pflegehinweise (textarea), Tags
- [x] Plant list screen shows all plants (scrollable list)
- [x] Each plant shows: Name, Location, Status badge, essbar icon
- [x] Tap plant → navigate to plant detail screen
- [x] Edit plant button → opens form pre-filled with data
- [x] Delete plant button with confirmation dialog
- [x] Changes sync to Supabase database
- [x] Loading states and error handling

**Technical Notes:**
- Components: PlantList.tsx, PlantForm.tsx, PlantListItem.tsx
- Use React Hook Form for form validation
- Supabase: INSERT, SELECT, UPDATE, DELETE on plants table
- Status options: geplant, bestellt, gepflanzt, etabliert
- Location options: Hauptbeet, Pergola, Gewächshaus, Hochbeet, Zaunseite

**Dependencies:**
- STORY-INF-001 (plants table exists)
- STORY-033 (authentication for user_id)

---

### STORY-002: Pflanzen filtern und suchen

**Epic:** EPIC-001 (Pflanzen-Inventar-Management)
**Priority:** Must Have
**Points:** 3

**User Story:**
As a gardener
I want to filter and search my plant inventory
So that I can quickly find specific plants

**Acceptance Criteria:**
- [ ] Search bar at top of plant list (filter by name, substring match, case-insensitive)
- [ ] Filter chips: Location (multi-select), Status (multi-select), Type (mehrjährig/einjährig), Essbar (toggle)
- [ ] Multiple filters can be combined (AND logic)
- [ ] Filter count badge shows number of active filters
- [ ] "Clear Filters" button resets all
- [ ] Filtered results update in real-time as user types/selects
- [ ] Empty state message when no results

**Technical Notes:**
- Use Supabase query filters: `.ilike()`, `.eq()`, `.in()`
- Optimize with indexes on name, location, status
- Debounce search input (300ms) to reduce API calls
- Store filter state in URL params (optional, for deep linking)

**Dependencies:**
- STORY-001 (plant list exists)

---

### STORY-003: Garten-Daten vorausfüllen

**Epic:** EPIC-001 (Pflanzen-Inventar-Management)
**Priority:** Must Have
**Points:** 3

**User Story:**
As Nina
I want my existing garden data (established and planned plants) pre-loaded
So that I don't have to manually enter 50+ plants

**Acceptance Criteria:**
- [ ] Seed data script created with 7 established plants: Weinreben, Schnittlauch, Erdbeeren, Günsel, Federnelke, Sonnenhut, Vogelmiere
- [ ] Seed data script includes 50+ planned/bestellt plants from Garten2026/Pflanzen_Inventar_und_Pflege.md
- [ ] All plants have correct: name, location, type, status, winterhart, essbar, dates
- [ ] Script can be run once during setup (idempotent - checks if data exists)
- [ ] Data visible immediately in plant list after setup
- [ ] Documentation in README for running seed script

**Technical Notes:**
- Create JSON file with plant data: `data/garden-seed-data.json`
- Script: `scripts/seed-garden.ts` → reads JSON → bulk INSERT to Supabase
- Use Supabase `.upsert()` for idempotency
- Extract data from existing Garten2026/*.md files (manual process, document findings)

**Dependencies:**
- STORY-001 (CRUD functions for plants)
- Garten2026/Pflanzen_Inventar_und_Pflege.md file

---

### STORY-004: Pflanzen-Detail-Ansicht

**Epic:** EPIC-001 (Pflanzen-Inventar-Management)
**Priority:** Must Have
**Points:** 2
**Status:** ✅ COMPLETED

**User Story:**
As a gardener
I want to see all details about a specific plant
So that I can view its full information, photos, and related tasks

**Acceptance Criteria:**
- [x] Plant detail screen shows all fields: Name, Location, Type, Status, Winterhart badge, Essbar badge, Menge, Pflanz-Datum, Ernte-Datum, Pflegehinweise, Tags
- [x] "Related Photos" section (empty for now, populated in STORY-011)
- [x] "Related Tasks" section (empty for now, populated in STORY-005)
- [x] "Edit" button → navigates to edit form
- [x] "Delete" button with confirmation
- [x] Back button to return to list

**Technical Notes:**
- Component: PlantDetailScreen.tsx
- Supabase: SELECT with joins for photos and tasks (LEFT JOIN)
- Use React Navigation params to pass plant ID
- Skeleton loader while fetching data

**Dependencies:**
- STORY-001 (plant data exists)

---

### EPIC-002: Dynamische Aufgaben & Priorisierung

---

### STORY-005: Aufgaben erstellen und verwalten

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a gardener
I want to create, edit, and delete tasks for garden work
So that I can track what needs to be done

**Acceptance Criteria:**
- [ ] "Add Task" screen with form: Titel (required), Beschreibung, Kategorie (dropdown: Aussaat/Pflanzen/Gartenarbeiten/Beobachten/Ernten), Priorität (niedrig/mittel/hoch), Pflanze-Verknüpfung (multi-select from plant list), Standort
- [ ] Task list screen shows all tasks (sorted by priority, then created_at)
- [ ] Each task shows: Title, Category badge, Priority indicator (color-coded), associated plant names
- [ ] Tap task → navigate to task detail screen
- [ ] Edit task button → opens form pre-filled
- [ ] Delete task with confirmation
- [ ] Changes sync to Supabase

**Technical Notes:**
- Components: TaskList.tsx, TaskForm.tsx, TaskListItem.tsx
- Tables: tasks, plant_tasks (junction for many-to-many)
- Priority colors: niedrig=gray, mittel=yellow, hoch=red
- Multi-select plants: use react-native-multiple-select or custom component

**Dependencies:**
- STORY-INF-001 (tasks table)
- STORY-001 (plants for linking)

---

### STORY-006: Aufgaben abhaken mit Zeitstempel

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** Must Have
**Points:** 2

**User Story:**
As a gardener
I want to mark tasks as complete and track when they were done
So that I can see my progress and task history

**Acceptance Criteria:**
- [ ] Checkbox on each task in task list
- [ ] Tap checkbox → task marked complete, completed_at timestamp saved
- [ ] Completed tasks shown with strikethrough text and green checkmark
- [ ] "Show Completed" toggle to hide/show completed tasks (default: hidden)
- [ ] Undo button on completed task (mark incomplete again)
- [ ] Task detail screen shows completion date/time if completed
- [ ] Completion history: list of all completed tasks with dates

**Technical Notes:**
- Update tasks table: completed_at TIMESTAMPTZ (NULL if incomplete)
- Supabase: UPDATE tasks SET completed_at = NOW() WHERE id = ?
- Filter query: .is('completed_at', null) for active tasks
- Use optimistic updates for instant UI feedback

**Dependencies:**
- STORY-005 (tasks exist)

---

### STORY-007: Saisonale Aufgaben-Vorschläge

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** Should Have
**Points:** 5

**User Story:**
As a gardener
I want to receive seasonal task suggestions based on the current month and my plants
So that I know what needs to be done at the right time

**Acceptance Criteria:**
- [ ] System suggests 3-5 tasks per month based on season (e.g., März: "Tomaten aussäen", "Beete vorbereiten")
- [ ] Suggestions reference plants in inventory (e.g., "Tomaten" only suggested if tomatoes in inventory)
- [ ] Suggestions shown in "Suggested Tasks" section on home screen
- [ ] Each suggestion has "Accept" button → creates task automatically
- [ ] Each suggestion has "Dismiss" button → hides suggestion
- [ ] Dismissed suggestions don't reappear
- [ ] New suggestions appear at start of each month

**Technical Notes:**
- Create seasonal_suggestions table or JSON file with task templates
- Structure: { month: number, plant_type: string, task_title: string, task_description: string, category: string }
- Algorithm: Match current month + user's plant types → generate suggestions
- Store dismissed suggestions in user_dismissed_suggestions table
- Run suggestion generation on app open (check if month changed)

**Dependencies:**
- STORY-001 (plant inventory)
- STORY-005 (task creation)

---

### STORY-008: Wiederholende Aufgaben

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** Should Have
**Points:** 3

**User Story:**
As a gardener
I want to create recurring tasks (weekly, monthly, yearly)
So that I don't have to manually recreate routine tasks

**Acceptance Criteria:**
- [ ] Task form has "Recurring" toggle
- [ ] If recurring enabled: Interval dropdown (wöchentlich, monatlich, jährlich)
- [ ] When recurring task completed → new instance auto-created with next due date
- [ ] Recurring tasks show "↻" icon
- [ ] Recurring task detail shows: "Next occurrence: [date]"
- [ ] Option to "Complete all future occurrences" (stops recurrence)
- [ ] Delete recurring task → confirmation "Delete this instance or all future?"

**Technical Notes:**
- Add to tasks table: is_recurring BOOLEAN, recurrence_interval TEXT, parent_task_id UUID (for tracking series)
- On task completion: if is_recurring → INSERT new task with next due date
- Calculate next date: weekly (+7 days), monthly (+1 month), yearly (+1 year)
- Use cron job or app-open trigger to check for missed recurrences

**Dependencies:**
- STORY-005 (tasks exist)
- STORY-006 (completion logic)

---

### STORY-009: Aufgaben-Priorisierungs-Algorithmus

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** Must Have
**Points:** 3

**User Story:**
As a gardener
I want tasks automatically sorted by priority and urgency
So that I know what to work on first

**Acceptance Criteria:**
- [ ] Tasks sorted by: 1) Priorität (hoch → mittel → niedrig), 2) Due date (soonest first), 3) Created date (oldest first)
- [ ] High-priority tasks with due dates show "⚠️ Due soon" badge
- [ ] Overdue tasks (past due date) show "🚨 Overdue" badge in red
- [ ] Task list re-sorts automatically when priority or due date changes
- [ ] "Sort by" dropdown: Priority (default), Due Date, Category, Created Date
- [ ] Sort preference saved to user settings

**Technical Notes:**
- Supabase query: .order('priority', { ascending: false }).order('due_date', { ascending: true }).order('created_at', { ascending: true })
- Priority mapping: hoch=3, mittel=2, niedrig=1 (store as integer)
- Calculate "due soon" = due_date within 3 days
- Calculate "overdue" = due_date < today AND not completed

**Dependencies:**
- STORY-005 (tasks exist)

---

### STORY-010: Foto-gesteuerte Aufgaben-Generierung (Phase 2)

**Epic:** EPIC-002 (Dynamische Aufgaben & Priorisierung)
**Priority:** Could Have (Phase 2)
**Points:** 5

**User Story:**
As a gardener
I want the app to automatically create tasks based on problems detected in photos
So that I'm alerted to issues requiring action

**Acceptance Criteria:**
- [ ] When photo uploaded with problem detected (STORY-015), system generates task suggestion
- [ ] Task title: "[Problem] an [Pflanze] bekämpfen" (e.g., "Blattläuse an Tomate bekämpfen")
- [ ] Task description: Auto-filled with problem details and action recommendation
- [ ] Task priority: Auto-set based on severity (pest = hoch, nutrient deficiency = mittel)
- [ ] Task linked to photo and plant automatically
- [ ] User can accept, edit, or dismiss suggestion
- [ ] Auto-generated tasks marked with "🤖 AI" badge

**Technical Notes:**
- Triggered after STORY-015 (problem detection) returns results
- Parse Claude API response for problem type and severity
- Generate task from template: `{ title, description, priority, category: "Gartenarbeiten", plant_ids: [...] }`
- Store as draft task (not saved until user confirms)

**Dependencies:**
- STORY-015 (photo problem detection with Claude API)
- STORY-005 (task creation)

---

### EPIC-003: Foto-Dokumentation & KI-Erkennung

---

### STORY-011: Foto-Upload mit Metadaten

**Epic:** EPIC-003 (Foto-Dokumentation & KI-Erkennung)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a gardener
I want to upload photos from camera or gallery and add context
So that I can document my garden over time

**Acceptance Criteria:**
- [ ] "Add Photo" button on home screen and plant detail screen
- [ ] Choose source: "Take Photo" (opens camera) or "Choose from Gallery"
- [ ] Photo preview after capture/selection
- [ ] Metadata form: Standort (dropdown), Pflanzen (multi-select), Notizen (textarea)
- [ ] Date/time auto-filled (editable)
- [ ] Image compression before upload (max 2000px width, 80% quality, <2MB)
- [ ] Upload progress bar
- [ ] Photo saved to Supabase Storage + metadata to photos table
- [ ] Success message, then navigate to photo detail

**Technical Notes:**
- Use expo-camera for camera access
- Use expo-image-picker for gallery selection
- Use expo-image-manipulator for compression
- Supabase Storage bucket: "garden-photos" (public read, authenticated write)
- Upload: supabase.storage.from('garden-photos').upload(path, file)
- Store URL in photos table: photo_url TEXT

**Dependencies:**
- STORY-016 (Supabase Storage configured)
- STORY-001 (plants for linking)

---

### STORY-012: Manuelle Foto-Notizen

**Epic:** EPIC-003 (Foto-Dokumentation & KI-Erkennung)
**Priority:** Must Have
**Points:** 2

**User Story:**
As a gardener
I want to add detailed notes to photos for identification and knowledge building
So that I can learn to identify plants and problems over time

**Acceptance Criteria:**
- [ ] Photo detail screen shows notes field (large textarea)
- [ ] Notes can be edited at any time (auto-save on blur)
- [ ] Note categories: Problem, Identifikation, Fortschritt (chips/tags)
- [ ] Category selected via radio buttons or chips
- [ ] Notes searchable from photo gallery (text search)
- [ ] Notes shown in photo thumbnail preview (first 50 chars)

**Technical Notes:**
- Update photos table: notes TEXT, note_category TEXT
- Auto-save: debounce 1s after user stops typing
- Search: Supabase `.textSearch()` or `.ilike()` on notes field
- Index notes column for search performance

**Dependencies:**
- STORY-011 (photos exist)

---

### STORY-013: Foto-Galerie mit Filter

**Epic:** EPIC-003 (Foto-Dokumentation & KI-Erkennung)
**Priority:** Should Have
**Points:** 3

**User Story:**
As a gardener
I want to browse my photos chronologically and filter by context
So that I can find specific photos and see garden progress

**Acceptance Criteria:**
- [ ] Photo gallery screen shows all photos in grid (2-3 columns)
- [ ] Photos sorted chronologically (newest first)
- [ ] Filter by: Standort, Pflanze, Monat/Jahr, Note category
- [ ] Multiple filters combinable
- [ ] "Timeline View" toggle: Shows photos with date headers
- [ ] Tap photo → opens photo detail screen
- [ ] Infinite scroll/pagination for large galleries (50 photos per page)

**Technical Notes:**
- Component: PhotoGallery.tsx
- Use FlatList with numColumns={2} for grid
- Supabase query with filters: `.eq()`, `.gte()` (for date ranges)
- Optimize with pagination: .range(0, 49) initially, load more on scroll
- Cache photo URLs for offline viewing (expo-file-system)

**Dependencies:**
- STORY-011 (photos exist)

---

### STORY-014: KI-Pflanzen-Identifikation (Phase 2)

**Epic:** EPIC-003 (Foto-Dokumentation & KI-Erkennung)
**Priority:** Could Have (Phase 2)
**Points:** 8

**User Story:**
As a gardener
I want the app to automatically identify plants in photos
So that I can learn plant names and add them to my inventory

**Acceptance Criteria:**
- [ ] After photo upload, "Identify Plant" button triggers AI analysis
- [ ] Claude Vision API analyzes photo and returns: Plant name (common + scientific), Confidence score (%)
- [ ] Result shown as suggestion card: "This looks like [Name] ([Scientific]) - Confidence: 85%"
- [ ] "Add to Inventory" button → pre-fills plant form with identified name
- [ ] "Not this plant" button → allows user to provide correct name (feedback loop)
- [ ] Identification history saved: photo_id, identified_plant, confidence, user_confirmed BOOLEAN
- [ ] Loading state during API call (~2-5 seconds)

**Technical Notes:**
- Integration with Claude Vision API (already configured in environment)
- API call: POST to Anthropic API with base64-encoded image
- Prompt: "Identify the plant in this image. Return: common name, scientific name, confidence percentage. Format: JSON."
- Parse JSON response: { common_name, scientific_name, confidence }
- Store in plant_identifications table for tracking accuracy
- Rate limiting: max 10 identifications per day (cost control)

**Dependencies:**
- STORY-011 (photo upload)
- Claude API credentials (already configured)

---

### STORY-015: Schädlings-/Problem-Erkennung (Phase 2)

**Epic:** EPIC-003 (Foto-Dokumentation & KI-Erkennung)
**Priority:** Could Have (Phase 2)
**Points:** 8

**User Story:**
As a gardener
I want the app to detect pests and problems in photos and suggest solutions
So that I can act quickly to protect my plants

**Acceptance Criteria:**
- [ ] After photo upload, automatic problem detection runs (or manual "Scan for Problems" button)
- [ ] Claude Vision API analyzes for: Pests (Blattläuse, Schnecken, etc.), Diseases (Pilze, Mehltau, etc.), Nutrient deficiency (gelbe Blätter, etc.)
- [ ] If problem detected: Warning notification "⚠️ Problem erkannt: [Problem]"
- [ ] Problem detail card shows: Problem name, Severity (niedrig/mittel/hoch), Action recommendation, Affected plant (if linked)
- [ ] "Create Task" button → auto-generates task (STORY-010)
- [ ] "False alarm" button → dismisses warning
- [ ] Problem detection history saved for learning

**Technical Notes:**
- Same Claude Vision API as STORY-014
- Prompt: "Analyze this plant photo for: pests, diseases, nutrient deficiencies. Return: problem_type, problem_name, severity (low/medium/high), action_recommendation. Format: JSON. If no problem, return: { problem_detected: false }"
- Parse response and show UI accordingly
- Severity affects auto-task priority: hoch → high priority task
- Store in photo_problems table: photo_id, problem_type, severity, recommendation, dismissed BOOLEAN

**Dependencies:**
- STORY-011 (photo upload)
- STORY-014 (Claude Vision API integration)

---

### STORY-016: Foto-Cloud-Storage-Integration

**Epic:** EPIC-003 (Foto-Dokumentation & KI-Erkennung)
**Priority:** Must Have
**Points:** 3

**User Story:**
As a developer
I want to configure Supabase Storage for photo uploads
So that photos are securely stored and accessible

**Acceptance Criteria:**
- [ ] Supabase Storage bucket "garden-photos" created
- [ ] Bucket configured: Public read (for photo URLs), Authenticated write
- [ ] RLS policies: Users can upload to their own folder (user_id/*)
- [ ] File size limit: 5MB per photo
- [ ] Allowed file types: image/jpeg, image/png, image/heic
- [ ] CDN configured for fast photo delivery
- [ ] Test upload/download/delete via Supabase client

**Technical Notes:**
- Create bucket via Supabase Dashboard → Storage
- RLS policy: `bucket_id = 'garden-photos' AND (storage.foldername(name))[1] = auth.uid()`
- File path structure: `{user_id}/{timestamp}-{random}.jpg`
- Use Supabase CDN URL for photos: `https://[project].supabase.co/storage/v1/object/public/garden-photos/...`
- Compression handled client-side (STORY-011) before upload

**Dependencies:**
- STORY-INF-001 (Supabase configured)

---

### EPIC-004: Einkaufsliste & Ressourcen

---

### STORY-017: Einkaufsartikel verwalten

**Epic:** EPIC-004 (Einkaufsliste & Ressourcen)
**Priority:** Must Have
**Points:** 3

**User Story:**
As a gardener
I want to create and manage a shopping list for garden supplies
So that I don't forget what to buy

**Acceptance Criteria:**
- [ ] "Shopping List" screen with list of items
- [ ] "Add Item" form: Artikel-Name (required), Kategorie (Saatgut/Pflanzen/Zubehör/Werkzeug/Dünger), Menge, Priorität (dringend/optional), Geschätzter Preis (€), Wo kaufen (text), Link (URL, optional), Notizen
- [ ] Shopping list shows: Name, Category badge, Priority (color-coded), Price
- [ ] Edit/delete items
- [ ] Items sorted by: Priority (dringend first), then category

**Technical Notes:**
- Table: shopping_items
- Components: ShoppingList.tsx, ShoppingItemForm.tsx
- Priority colors: dringend=red, optional=gray
- Link field: open in browser when tapped (Linking.openURL)

**Dependencies:**
- STORY-INF-001 (shopping_items table)

---

### STORY-018: Einkaufsliste abhaken und Kosten-Tracking

**Epic:** EPIC-004 (Einkaufsliste & Ressourcen)
**Priority:** Must Have
**Points:** 3

**User Story:**
As a gardener
I want to mark items as purchased and track actual costs
So that I can manage my garden budget

**Acceptance Criteria:**
- [ ] Checkbox on each shopping item
- [ ] When checked: "Mark Purchased" dialog opens → enter Actual Price (€), Purchase Date (auto-filled, editable)
- [ ] Purchased items move to "Purchased" section (collapsed by default)
- [ ] Summary at top: Total Dringend (estimated), Total Optional (estimated), Total Spent (actual)
- [ ] "Budget Overview" shows: Estimated vs. Actual for dringend and optional
- [ ] Difference shown: Over budget (red) or Under budget (green)

**Technical Notes:**
- Update shopping_items table: purchased_at TIMESTAMPTZ, actual_price DECIMAL
- Calculate totals: SUM(estimated_price) WHERE priority='dringend' AND purchased_at IS NULL
- Use Supabase `.eq()` filters for purchased/unpurchased
- Show cost difference: (actual_price - estimated_price) per item

**Dependencies:**
- STORY-017 (shopping items exist)

---

### STORY-019: Einkaufsliste-Dashboard

**Epic:** EPIC-004 (Einkaufsliste & Ressourcen)
**Priority:** Must Have
**Points:** 2

**User Story:**
As a gardener
I want a quick overview of my shopping list status
So that I can see what's urgent and budget status at a glance

**Acceptance Criteria:**
- [ ] Dashboard widget on home screen: "Shopping List"
- [ ] Shows: Count of dringend items, Total estimated cost (dringend), Total spent this month
- [ ] "View List" button → navigate to full shopping list
- [ ] Red badge if dringend items > 0

**Technical Notes:**
- Component: ShoppingListWidget.tsx (on HomeScreen)
- Query: COUNT(*) WHERE priority='dringend' AND purchased_at IS NULL
- Monthly spending: SUM(actual_price) WHERE purchased_at >= start_of_month
- Update in real-time when items added/purchased

**Dependencies:**
- STORY-017 (shopping list exists)

---

### EPIC-005: Pflanzpläne & Visualisierung

---

### STORY-020: Gartenbereiche anzeigen

**Epic:** EPIC-005 (Pflanzpläne & Visualisierung)
**Priority:** Should Have
**Points:** 5

**User Story:**
As a gardener
I want to view plans for my 5 garden areas
So that I can see where plants are located and plan planting

**Acceptance Criteria:**
- [ ] "Garden Plans" screen with 5 areas: Hauptbeet, Pergola, Gewächshaus, Hochbeet, Zaunseite
- [ ] Tap area → opens area detail screen
- [ ] Area detail shows: Area name, Description (size, main features), Plant list (plants assigned to this location from inventory), Plan image/visualization (placeholder for now, added in STORY-021)
- [ ] Plant list shows: Plant name, Type, Status
- [ ] Tap plant → navigate to plant detail (STORY-004)

**Technical Notes:**
- Component: GardenPlansScreen.tsx, AreaDetailScreen.tsx
- No new tables needed - query plants table by location
- 5 areas hardcoded: enum Location { Hauptbeet, Pergola, Gewächshaus, Hochbeet, Zaunseite }
- Area descriptions: stored in JSON or hardcoded (e.g., "Hauptbeet: 20m², Hauptanbaufläche für Gemüse")

**Dependencies:**
- STORY-001 (plants with location field)

---

### STORY-021: Pflanzplan-Visualisierungen erstellen

**Epic:** EPIC-005 (Pflanzpläne & Visualisierung)
**Priority:** Should Have
**Points:** 3

**User Story:**
As Nina
I want to upload or create visual plans for each garden area
So that I can see spatial layout of plants

**Acceptance Criteria:**
- [ ] Area detail screen has "Edit Plan" button
- [ ] Upload plan image (photo or drawing) for area
- [ ] Image displayed full-width, zoomable/pinch-to-zoom
- [ ] Option to replace or delete plan image
- [ ] Plan images stored in Supabase Storage

**Technical Notes:**
- Table: plans (id, area, plan_image_url, description, created_at, user_id)
- Upload to Supabase Storage bucket "garden-plans"
- Use react-native-image-zoom-viewer for zoom functionality
- Support JPG, PNG formats
- Nina will create plans manually (draw on paper → photo, or use drawing app)

**Dependencies:**
- STORY-020 (area views exist)
- STORY-016 (Supabase Storage pattern established)

---

### STORY-022: Plan-Details interaktiv (Optional)

**Epic:** EPIC-005 (Pflanzpläne & Visualisierung)
**Priority:** Could Have (Phase 4 - Deferred)
**Points:** 5

**User Story:**
As a gardener
I want to click on plants in the plan image to see details
So that I can interact with the visual plan

**Acceptance Criteria:**
- [ ] Plan image has clickable hotspots (tap plant → show detail)
- [ ] Hotspot editor: Nina can mark plant positions on plan image
- [ ] Hotspot linked to plant in inventory
- [ ] Tap hotspot → popup with plant name, status, quick actions (view detail, add task)

**Technical Notes:**
- Requires: Image mapping library or custom implementation
- Store hotspot coordinates: plan_hotspots table (plan_id, plant_id, x_percent, y_percent, radius)
- Use absolute positioning overlays on image
- Complex feature - defer to Phase 4

**Dependencies:**
- STORY-021 (plan images exist)
- Deferred - not in Phase 1 MVP

---

### EPIC-006: Wissens-Datenbank & Permakultur-Infos

---

### STORY-023: Wissens-Artikel anzeigen

**Epic:** EPIC-006 (Wissens-Datenbank & Permakultur-Infos)
**Priority:** Should Have
**Points:** 3

**User Story:**
As a gardener
I want to read knowledge articles about permaculture and plant care
So that I can learn best practices

**Acceptance Criteria:**
- [ ] "Knowledge Base" screen with article categories: Pflegetipps, Mischkultur, Identifikation, Permakultur
- [ ] Tap category → shows list of articles in that category
- [ ] Article list shows: Title, Short description, Read time
- [ ] Tap article → opens article detail (full markdown content)
- [ ] Search bar to find articles by keyword
- [ ] Favorite button to bookmark articles
- [ ] "My Favorites" tab shows bookmarked articles

**Technical Notes:**
- Table: knowledge_articles (id, title, category, content (markdown), short_description, read_time_minutes, created_at)
- Use react-native-markdown-display to render markdown content
- Search: .textSearch() on title and content
- Favorites: user_favorites table (user_id, article_id)

**Dependencies:**
- STORY-026 (pre-populated articles)

---

### STORY-024: Mischkultur-Datenbank

**Epic:** EPIC-006 (Wissens-Datenbank & Permakultur-Infos)
**Priority:** Should Have
**Points:** 5

**User Story:**
As a gardener
I want to see which plants grow well together and which don't
So that I can plan companion planting

**Acceptance Criteria:**
- [ ] Plant detail screen shows "Companion Plants" section
- [ ] Good companions shown with ✅ (green): "Tomaten, Basilikum, Karotten"
- [ ] Bad companions shown with ❌ (red): "Kartoffeln, Fenchel"
- [ ] Tap companion plant name → navigate to that plant's detail (if in inventory)
- [ ] "Why?" info icon → shows brief explanation (e.g., "Basilikum hält Blattläuse fern")
- [ ] Warnings when planting: If user adds plant to location with bad companion nearby, show warning dialog

**Technical Notes:**
- Table: plant_companions (plant_name, companion_name, relationship (good/bad), reason)
- Pre-populate with common companion planting data (research & enter manually)
- Query: .eq('plant_name', selectedPlant.name)
- Warning logic: Check plants at same location for bad companions before saving

**Dependencies:**
- STORY-001 (plants exist)
- Companion planting data (research & manual entry)

---

### STORY-025: Wissensbank aus Foto-Notizen aufbauen

**Epic:** EPIC-006 (Wissens-Datenbank & Permakultur-Infos)
**Priority:** Should Have
**Points:** 5

**User Story:**
As Nina
I want my manual photo notes to be organized into a searchable knowledge base
So that I can reference my own learnings over time

**Acceptance Criteria:**
- [ ] "My Notes" section in Knowledge Base (separate from pre-written articles)
- [ ] Shows all photo notes categorized by: Plant identifications, Problems/solutions, Progress observations
- [ ] Notes aggregated by plant: "Günsel" shows all notes from photos tagged with Günsel
- [ ] Notes searchable (full-text search)
- [ ] "Add to Knowledge Base" button on photo note → promotes note to formal article (editable)
- [ ] Promoted notes appear in Knowledge Base as user-created articles

**Technical Notes:**
- Query photos table: SELECT notes, note_category, plant_id, created_at WHERE notes IS NOT NULL
- Group by plant_id or note_category for organization
- User-created articles: knowledge_articles table with is_user_created BOOLEAN flag
- Search: .textSearch() across both pre-written and user-created articles

**Dependencies:**
- STORY-012 (photo notes)
- STORY-023 (knowledge base structure)

---

### STORY-026: Vorausgefüllte Wissensinhalte

**Epic:** EPIC-006 (Wissens-Datenbank & Permakultur-Infos)
**Priority:** Should Have
**Points:** 3

**User Story:**
As Nina
I want the knowledge base pre-populated with useful permaculture articles
So that I have immediate value without creating content

**Acceptance Criteria:**
- [ ] 10-15 pre-written articles covering: Permakultur basics, Common permaculture plants (Ground covers, Pioneers), Composting, Mulching, Water management, Seasonal calendar, Pest management (organic), Soil health
- [ ] Each article: 300-500 words, markdown formatted, category assigned
- [ ] Articles written in German
- [ ] Seed script to insert articles into knowledge_articles table

**Technical Notes:**
- Create markdown files in `data/knowledge-articles/` directory
- Script: `scripts/seed-knowledge.ts` reads markdown → INSERT to knowledge_articles
- Use ChatGPT/Claude to generate initial article drafts (review and edit)
- Articles should reference Nina's specific context (German climate, permaculture focus)

**Dependencies:**
- STORY-023 (knowledge_articles table and UI)

---

### EPIC-007: Success-Tracking & Metriken

---

### STORY-027: Time-Tracking für Aufgaben

**Epic:** EPIC-007 (Success-Tracking & Metriken)
**Priority:** Must Have
**Points:** 5

**User Story:**
As a gardener
I want to track how much time I spend on garden tasks, especially weeding
So that I can measure progress toward my <1h/month weeding goal

**Acceptance Criteria:**
- [ ] Task detail screen has "Start Timer" button
- [ ] Timer runs in foreground (shows elapsed time MM:SS)
- [ ] "Stop Timer" button saves elapsed time to task
- [ ] Alternative: "Log Time Manually" → enter hours/minutes
- [ ] Completed task shows: Time spent (e.g., "45 min")
- [ ] Monthly overview screen: Total time by category (Unkraut-Jäten highlighted)
- [ ] Weeding time chart: Shows time per month (target line at 1h)
- [ ] Warning notification if weeding time > 1h in current month

**Technical Notes:**
- Update tasks table: time_spent_minutes INTEGER
- Timer: Use React state + setInterval, persist to AsyncStorage on app background
- Monthly query: SUM(time_spent_minutes) WHERE category='Gartenarbeiten' AND title LIKE '%Unkraut%' AND completed_at BETWEEN start_of_month AND end_of_month
- Chart: Use victory-native or react-native-chart-kit
- Notification: Check weeding time daily, push notification if > 60 min

**Dependencies:**
- STORY-005 (tasks exist)
- STORY-006 (task completion)

---

### STORY-028: Pflanzen-Status-Tracking

**Epic:** EPIC-007 (Success-Tracking & Metriken)
**Priority:** Must Have
**Points:** 2

**User Story:**
As Nina
I want to track plant status progression (planned → ordered → planted → established)
So that I can see how many plants I've successfully established

**Acceptance Criteria:**
- [ ] Plant form has Status dropdown: geplant, bestellt, gepflanzt, etabliert
- [ ] Dashboard shows counts: "Geplant: 15, Bestellt: 10, Gepflanzt: 20, Etabliert: 7"
- [ ] Progress bar: "7/50 plants established" (goal: 50+)
- [ ] Celebration animation when goal reached (confetti or badge)
- [ ] Status change history: Log when plant status changes (audit trail)

**Technical Notes:**
- Status already in plants table (from STORY-001)
- Query: COUNT(*) GROUP BY status
- Progress calculation: (COUNT(status='etabliert') / 50) * 100
- Celebration: use react-native-confetti-cannon when >= 50 established
- History: plant_status_history table (plant_id, old_status, new_status, changed_at)

**Dependencies:**
- STORY-001 (plants with status)

---

### STORY-029: Ernte-Logging

**Epic:** EPIC-007 (Success-Tracking & Metriken)
**Priority:** Should Have
**Points:** 3

**User Story:**
As a gardener
I want to log my harvests to track garden productivity
So that I can see how much food my garden produces

**Acceptance Criteria:**
- [ ] "Log Harvest" button (from plant detail or dedicated harvest screen)
- [ ] Harvest form: Pflanze (select from inventory), Menge (number), Einheit (kg/Stück/Bund), Datum (auto-filled, editable), Notizen
- [ ] Harvest list shows all harvests chronologically
- [ ] Per-plant harvest summary: "Tomaten: 12kg (Saison 2026)"
- [ ] Per-season total: "2026: 45kg Gemüse, 120 Stück Obst"
- [ ] Chart: Harvest over time (monthly totals)

**Technical Notes:**
- Table: harvests (id, plant_id, amount, unit, harvest_date, notes, user_id)
- Query totals: SUM(amount) WHERE plant_id=? AND harvest_date BETWEEN year_start AND year_end
- Units: enum (kg, Stück, Bund, Liter)
- Chart: Group by month, show total weight

**Dependencies:**
- STORY-001 (plants)

---

### STORY-030: Success-Dashboard

**Epic:** EPIC-007 (Success-Tracking & Metriken)
**Priority:** Should Have
**Points:** 5

**User Story:**
As Nina
I want a dashboard showing all my garden success metrics
So that I can see at a glance if I'm achieving my goals

**Acceptance Criteria:**
- [ ] Dashboard screen (or home screen widget) with 4 key metrics cards:
  1. **Weeding Time** (this month): "45 min / 60 min goal" - progress bar (green if under, red if over)
  2. **Ground Cover** (Phase 3 feature - placeholder for now): "75% / 80% goal"
  3. **Established Plants**: "42 / 50 goal" - progress bar
  4. **Harvest This Season**: "35kg + 80 Stück"
- [ ] Each card color-coded: Green = on track, Yellow = close to goal, Red = over/under goal
- [ ] Trends: Shows arrow ↑↓ compared to last month
- [ ] Motivational messages: "Great job! You're 15 min under your weeding goal!" or "7 more plants to establish!"
- [ ] Tap card → navigate to detailed view (weeding history, plant list, harvest log)

**Technical Notes:**
- Component: SuccessDashboard.tsx (prominent on HomeScreen)
- Aggregate data from: tasks (weeding time), plants (established count), harvests (totals)
- Trends: Compare current month to previous month (calculate delta)
- Motivational text: Conditional based on metric status
- Use progress circles or bars: react-native-progress

**Dependencies:**
- STORY-027 (weeding time tracking)
- STORY-028 (plant status)
- STORY-029 (harvest logging)

---

### STORY-031: Bodendecker-Analyse per Foto (Phase 3)

**Epic:** EPIC-007 (Success-Tracking & Metriken)
**Priority:** Could Have (Phase 3)
**Points:** 8

**User Story:**
As Nina
I want to analyze photos of my beds to calculate ground cover percentage
So that I can track progress toward 80% ground cover goal

**Acceptance Criteria:**
- [ ] "Analyze Ground Cover" button on area detail screen
- [ ] Upload photo of bed from above
- [ ] Claude Vision API analyzes and returns % of green ground cover vs. bare soil
- [ ] Result shown: "Ground Cover: 78% (Target: 80%)"
- [ ] Historical chart: Ground cover % over time (monthly snapshots)
- [ ] Warning if < 80%: "Increase ground cover to reduce weeding"
- [ ] Comparison mode: Show before/after photos side-by-side with % change

**Technical Notes:**
- Claude Vision API prompt: "Analyze this garden bed photo. Calculate percentage of green plant coverage (ground cover) vs. bare soil. Return: ground_cover_percent (number). Format: JSON."
- Store: ground_cover_analyses table (area, photo_url, coverage_percent, analysis_date)
- Chart: Show trend line over months
- Complex image analysis - Phase 3 priority

**Dependencies:**
- STORY-014 (Claude Vision API integration)
- Phase 3 - deferred

---

### STORY-032: Metriken-Verlauf Charts

**Epic:** EPIC-007 (Success-Tracking & Metriken)
**Priority:** Should Have
**Points:** 3

**User Story:**
As Nina
I want to see historical trends for all success metrics
So that I can visualize garden improvement over time

**Acceptance Criteria:**
- [ ] "Trends" screen accessible from Success Dashboard
- [ ] 4 charts:
  1. Weeding time per month (line chart)
  2. Established plants over time (line chart)
  3. Harvest per month (bar chart)
  4. Ground cover % over time (line chart, Phase 3)
- [ ] Time range selector: 3 months, 6 months, 1 year, All time
- [ ] Charts show goal lines (e.g., 1h weeding, 80% ground cover)
- [ ] Export charts as image (share feature)

**Technical Notes:**
- Use victory-native or react-native-chart-kit
- Query time-series data: GROUP BY month, SUM/AVG aggregates
- Charts should be responsive (mobile-friendly)
- Export: react-native-view-shot to capture chart as image

**Dependencies:**
- STORY-027, STORY-028, STORY-029 (data sources)
- STORY-030 (dashboard structure)

---

### Core Features (Authentication & Navigation)

---

### STORY-033: User Authentication

**Epic:** Core
**Priority:** Must Have
**Points:** 5
**Status:** ✅ COMPLETED (Core features, 3 features deferred to STORY-033b)

**User Story:**
As a user
I want to create an account and log in securely
So that my garden data is private and accessible only to me

**Acceptance Criteria:**
- [x] Sign-up screen: Email, Password (min 8 chars), Confirm Password
- [x] Email validation (format check)
- [x] Sign-up creates account via Supabase Auth
- [x] Login screen: Email, Password
- [ ] "Forgot Password" link → sends reset email (⚠️ Deferred to STORY-033b)
- [ ] Password reset flow: Email link → reset password screen (⚠️ Deferred to STORY-033b)
- [ ] Profile screen: Shows email, "Change Password" button, "Logout" button (⚠️ Deferred to STORY-033b)
- [x] Auth state persisted (user stays logged in on app restart)
- [x] Auth errors shown clearly (wrong password, email exists, etc.)

**Technical Notes:**
- Use Supabase Auth: supabase.auth.signUp(), signInWithPassword(), resetPasswordForEmail()
- Store session in SecureStore (expo-secure-store)
- Auth context: React Context API for global auth state
- Navigation: Stack navigator with auth flow (Login/Signup) vs. app flow (Home/etc.)
- RLS depends on auth.uid() → critical for data security

**Dependencies:**
- STORY-000 (Supabase client configured)

---

### STORY-034: App Navigation & Layout

**Epic:** Core
**Priority:** Must Have
**Points:** 5
**Status:** ✅ COMPLETED

**User Story:**
As a user
I want intuitive navigation between app sections
So that I can easily access all features

**Acceptance Criteria:**
- [x] Bottom tab navigation with 5 tabs:
  1. Home (Dashboard with success metrics)
  2. Plants (Inventory list)
  3. Tasks (Task list)
  4. Photos (Gallery)
  5. More (Shopping list, Garden plans, Knowledge base, Profile)
- [x] Each tab has icon and label
- [x] Active tab highlighted
- [x] Stack navigation within each tab (e.g., Plants → Plant Detail → Edit Plant)
- [x] Back button on all non-root screens
- [x] Header shows screen title
- [x] "Add" floating action button (FAB) on relevant screens (Plants, Tasks, Photos)

**Technical Notes:**
- Use @react-navigation/bottom-tabs and @react-navigation/native-stack
- Tab icons: @expo/vector-icons (MaterialIcons or Ionicons)
- FAB: react-native-paper or custom styled TouchableOpacity
- Navigation structure:
  ```
  TabNavigator:
    - HomeStack: HomeScreen
    - PlantsStack: PlantListScreen → PlantDetailScreen → PlantFormScreen
    - TasksStack: TaskListScreen → TaskDetailScreen → TaskFormScreen
    - PhotosStack: PhotoGalleryScreen → PhotoDetailScreen
    - MoreStack: MoreMenuScreen → (various screens)
  ```

**Dependencies:**
- STORY-000 (React Native project setup)

---

## Sprint Allocation

### Sprint 1 (Weeks 1-2) - **Foundation** - 11 points

**Goal:** Set up development environment, database, and core app structure

**Stories:**
- STORY-000: Development Environment Setup (3 pts)
- STORY-INF-001: Database Schema & RLS Setup (5 pts)
- STORY-034: App Navigation & Layout (3 pts)

**Deliverable:** Working React Native + Expo app with Supabase connected, all tables created, basic navigation

**Risks:** None significant (setup phase)

---

### Sprint 2 (Weeks 3-4) - **Authentication & Inventory Core** - 12 points

**Goal:** User authentication and basic plant management

**Stories:**
- STORY-033: User Authentication (5 pts)
- STORY-001: Pflanzen CRUD-Funktionen (5 pts)
- STORY-004: Pflanzen-Detail-Ansicht (2 pts)

**Deliverable:** Users can sign up/login, create/edit/delete plants, view plant details

**Risks:** None significant

---

### Sprint 3 (Weeks 5-6) - **Inventory Complete** - 11 points

**Goal:** Complete plant inventory with search and pre-loaded data

**Stories:**
- STORY-002: Pflanzen filtern und suchen (3 pts)
- STORY-003: Garten-Daten vorausfüllen (3 pts)
- STORY-017: Einkaufsartikel verwalten (3 pts)
- STORY-019: Einkaufsliste-Dashboard (2 pts)

**Deliverable:** Full plant inventory with 50+ plants, search/filter, shopping list started

**Risks:** Data extraction from Garten2026 files (manual process)

---

### Sprint 4 (Weeks 7-8) - **Tasks Core** - 13 points

**Goal:** Task management foundation

**Stories:**
- STORY-005: Aufgaben erstellen und verwalten (5 pts)
- STORY-006: Aufgaben abhaken mit Zeitstempel (2 pts)
- STORY-009: Aufgaben-Priorisierungs-Algorithmus (3 pts)
- STORY-018: Einkaufsliste abhaken und Kosten (3 pts)

**Deliverable:** Full task CRUD, completion tracking, priority sorting, shopping list complete

**Risks:** Slightly over capacity (13 vs 12) - acceptable buffer

---

### Sprint 5 (Weeks 9-10) - **Photos Foundation** - 10 points

**Goal:** Photo upload and documentation

**Stories:**
- STORY-016: Foto-Cloud-Storage-Integration (3 pts)
- STORY-011: Foto-Upload mit Metadaten (5 pts)
- STORY-012: Manuelle Foto-Notizen (2 pts)

**Deliverable:** Photo upload with compression, Supabase Storage, manual notes

**Risks:** Camera/gallery permissions on different Android devices

---

### Sprint 6 (Weeks 11-12) - **Photos & Tasks Enhancement** - 11 points

**Goal:** Photo gallery and seasonal task suggestions

**Stories:**
- STORY-013: Foto-Galerie mit Filter (3 pts)
- STORY-007: Saisonale Aufgaben-Vorschläge (5 pts)
- STORY-008: Wiederholende Aufgaben (3 pts)

**Deliverable:** Photo gallery with filters, seasonal suggestions, recurring tasks

**Risks:** Seasonal task algorithm complexity (may need refinement)

---

### Sprint 7 (Weeks 13-14) - **Success Tracking Core** - 10 points

**Goal:** Time tracking and status monitoring

**Stories:**
- STORY-027: Time-Tracking für Aufgaben (5 pts)
- STORY-028: Pflanzen-Status-Tracking (2 pts)
- STORY-029: Ernte-Logging (3 pts)

**Deliverable:** Time tracking (weeding goal!), plant status workflow, harvest logging

**Risks:** Timer background behavior on Android (test thoroughly)

---

### Sprint 8 (Weeks 15-16) - **Knowledge Base** - 11 points

**Goal:** Permaculture knowledge and companion planting

**Stories:**
- STORY-023: Wissens-Artikel anzeigen (3 pts)
- STORY-024: Mischkultur-Datenbank (5 pts)
- STORY-026: Vorausgefüllte Wissensinhalte (3 pts)

**Deliverable:** Knowledge base with articles, companion planting warnings, pre-populated content

**Risks:** Content creation time (10-15 articles + companion data) - can reuse ChatGPT/Claude

---

### Sprint 9 (Weeks 17-18) - **Garden Plans & Success Dashboard** - 10 points

**Goal:** Garden visualization and success metrics dashboard

**Stories:**
- STORY-020: Gartenbereiche anzeigen (5 pts)
- STORY-030: Success-Dashboard (5 pts)

**Deliverable:** 5 garden areas with plant lists, success dashboard with 4 key metrics

**Risks:** None significant

---

### Sprint 10 (Weeks 19-20) - **Polish & Refinement** - 11 points

**Goal:** Complete remaining features and refine UX

**Stories:**
- STORY-021: Pflanzplan-Visualisierungen erstellen (3 pts)
- STORY-025: Wissensbank aus Foto-Notizen (5 pts)
- STORY-032: Metriken-Verlauf Charts (3 pts)

**Deliverable:** Garden plan uploads, knowledge from notes, metrics charts

**Risks:** None significant

---

### Sprint 11 (Weeks 21-22) - **Buffer & Testing**

**Goal:** Bug fixes, performance optimization, user testing

**Activities:**
- Fix bugs from previous sprints
- Performance optimization (photo loading, query optimization)
- User testing with partner
- UI/UX polish
- Documentation (README, deployment guide)
- Prepare for Phase 2 (KI features)

**Deliverable:** Stable Phase 1 MVP ready for daily use

---

## Phase 2: KI Features (Sprints 12-14, ~6 weeks)

**Stories:**
- STORY-014: KI-Pflanzen-Identifikation (8 pts)
- STORY-015: Schädlings-/Problem-Erkennung (8 pts)
- STORY-010: Foto-gesteuerte Aufgaben-Generierung (5 pts)

**Total:** 21 points (~2 sprints)

**Timeline:** +6 weeks (August-September 2026)

---

## Phase 3: Advanced Features (Sprint 15, ~2 weeks)

**Stories:**
- STORY-031: Bodendecker-Analyse per Foto (8 pts)

**Total:** 8 points (1 sprint)

**Timeline:** +2 weeks (September 2026)

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Points | Sprints |
|---------|-----------|---------|--------------|---------|
| Infrastructure | Setup | STORY-000, STORY-INF-001 | 8 | Sprint 1 |
| EPIC-001 | Pflanzen-Inventar-Management | STORY-001, 002, 003, 004 | 13 | Sprint 2-3 |
| EPIC-002 | Dynamische Aufgaben & Priorisierung | STORY-005, 006, 007, 008, 009 | 18 | Sprint 4, 6 |
| EPIC-002 (Phase 2) | Foto-gesteuerte Aufgaben | STORY-010 | 5 | Sprint 12 |
| EPIC-003 | Foto-Dokumentation & KI-Erkennung | STORY-011, 012, 013, 016 | 13 | Sprint 5-6 |
| EPIC-003 (Phase 2) | KI-Erkennung | STORY-014, 015 | 16 | Sprint 12-13 |
| EPIC-004 | Einkaufsliste & Ressourcen | STORY-017, 018, 019 | 8 | Sprint 3-4 |
| EPIC-005 | Pflanzpläne & Visualisierung | STORY-020, 021 | 8 | Sprint 9-10 |
| EPIC-005 (Deferred) | Interaktive Pläne | STORY-022 | 5 | Phase 4 |
| EPIC-006 | Wissens-Datenbank | STORY-023, 024, 025, 026 | 16 | Sprint 8, 10 |
| EPIC-007 | Success-Tracking & Metriken | STORY-027, 028, 029, 030, 032 | 18 | Sprint 7, 9-10 |
| EPIC-007 (Phase 3) | Bodendecker-Analyse | STORY-031 | 8 | Sprint 15 |
| Core | Auth & Navigation | STORY-033, 034 | 10 | Sprint 1-2 |

**Total Stories:** 34
**Total Points:** 146

---

## Functional Requirements Coverage

| FR ID | FR Name | Story | Sprint |
|-------|---------|-------|--------|
| FR-001 | Pflanzen anlegen/verwalten | STORY-001 | 2 |
| FR-002 | Pflanzen filtern/suchen | STORY-002 | 3 |
| FR-003 | Garten vorausfüllen | STORY-003 | 3 |
| FR-004 | Aufgaben erstellen | STORY-005 | 4 |
| FR-005 | Aufgaben abhaken | STORY-006 | 4 |
| FR-006 | Saisonale Aufgaben-Vorschläge | STORY-007 | 6 |
| FR-007 | Foto-gesteuerte Aufgaben (Phase 2) | STORY-010 | 12 |
| FR-008 | Wiederholende Aufgaben | STORY-008 | 6 |
| FR-009 | Pflanzpläne anzeigen | STORY-020 | 9 |
| FR-010 | Plan-Details (Optional) | STORY-022 | Phase 4 |
| FR-011 | Einkaufsartikel verwalten | STORY-017 | 3 |
| FR-012 | Einkaufsliste abhaken/Kosten | STORY-018 | 4 |
| FR-013 | Foto-Upload | STORY-011 | 5 |
| FR-014 | Manuelle Foto-Notizen | STORY-012 | 5 |
| FR-015 | KI-Pflanzen-ID (Phase 2) | STORY-014 | 12 |
| FR-016 | Schädlings-Erkennung (Phase 2) | STORY-015 | 13 |
| FR-017 | Foto-Galerie/Filter | STORY-013 | 6 |
| FR-018 | Wissens-Artikel | STORY-023 | 8 |
| FR-019 | Mischkultur-Infos | STORY-024 | 8 |
| FR-020 | Wissensbank aufbauen | STORY-025 | 10 |
| FR-021 | Time-Tracking | STORY-027 | 7 |
| FR-022 | Pflanzen-Status-Tracking | STORY-028 | 7 |
| FR-023 | Bodendecker-Analyse (Phase 3) | STORY-031 | 15 |
| FR-024 | Ernte-Logging | STORY-029 | 7 |
| FR-025 | Success-Dashboard | STORY-030 | 9 |

**Coverage:** 25/25 FRs mapped ✓

---

## Risks and Mitigation

### High Priority Risks

**RISK-001: Limited Development Time (2 kids, side project)**
- **Impact:** HIGH
- **Probability:** MEDIUM
- **Mitigation:**
  - Realistic sprint capacity (10-12 points vs. typical 20-30)
  - 2-week sprints for flexibility
  - Buffer sprint (Sprint 11) for unknowns
  - Prioritize Must Have features first
  - Defer Phase 2/3 if needed

**RISK-002: Claude API Costs (Phase 2)**
- **Impact:** MEDIUM
- **Probability:** LOW (Phase 2 deferred)
- **Mitigation:**
  - Rate limit: max 10 identifications/day
  - Cache results to avoid re-analysis
  - Monitor usage via Portkey dashboard
  - Budget: €10-20/month estimated for moderate use

**RISK-003: Data Migration from Garten2026 Files**
- **Impact:** MEDIUM (STORY-003)
- **Probability:** MEDIUM
- **Mitigation:**
  - Manual extraction acceptable (one-time task)
  - Document data format for future reference
  - Can add plants manually if extraction complex

### Medium Priority Risks

**RISK-004: Mobile Photo Upload Performance on Slow Network**
- **Impact:** MEDIUM
- **Probability:** MEDIUM
- **Mitigation:**
  - Client-side compression (STORY-011)
  - Progress indicator for user feedback
  - Retry logic for failed uploads
  - Queue uploads for background sync

**RISK-005: Seasonal Task Suggestion Algorithm Accuracy**
- **Impact:** LOW
- **Probability:** MEDIUM
- **Mitigation:**
  - Start simple (hardcoded month-based suggestions)
  - Iterate based on user feedback
  - Allow manual task creation as fallback

### Low Priority Risks

**RISK-006: Cross-Platform Differences (iOS vs Android)**
- **Impact:** LOW
- **Probability:** LOW
- **Mitigation:**
  - Primary target: Android (both users)
  - Test on Android devices regularly
  - Expo handles most platform differences

**RISK-007: Knowledge Base Content Creation Time**
- **Impact:** LOW
- **Probability:** MEDIUM
- **Mitigation:**
  - Use AI (ChatGPT/Claude) to generate initial drafts
  - 10-15 articles sufficient for MVP
  - User-created articles from photo notes (STORY-025)

---

## Dependencies

### External Dependencies

**Claude API (Anthropic)**
- **For:** STORY-014, STORY-015, STORY-031 (Phase 2-3)
- **Status:** Already configured (Portkey API)
- **Risk:** LOW (API stable, fallback to Plant.id if needed)

**Supabase (Backend & Database)**
- **For:** All data storage, authentication, file storage
- **Status:** To be configured in Sprint 1
- **Risk:** LOW (mature platform, generous free tier)

**Expo Application Services (EAS)**
- **For:** Build and deployment (iOS/Android)
- **Status:** To be configured post-MVP
- **Risk:** LOW (standard Expo workflow)

### Internal Dependencies (Story Order)

**Critical Path:**
1. STORY-000 → STORY-INF-001 (foundation)
2. STORY-033 (auth) → All data stories (RLS depends on user_id)
3. STORY-001 (plants) → STORY-003, 005, 011, 020, 024, 028 (plant linking)
4. STORY-016 (storage) → STORY-011 (photo upload)
5. STORY-011 (photos) → STORY-012, 013, 014, 015 (photo features)
6. STORY-027, 028, 029 (tracking) → STORY-030, 032 (dashboard/charts)

**Flexible Order:**
- Shopping list stories (EPIC-004) independent
- Knowledge base stories (EPIC-006) independent
- Garden plans (EPIC-005) independent after plants exist

---

## Definition of Done

For a story to be considered **complete**, all criteria must be met:

- [x] **Code Implemented:** All acceptance criteria coded and functional
- [x] **Manual Testing:** Tested on at least one Android device or emulator
- [x] **Code Quality:** No obvious bugs, follows TypeScript best practices
- [x] **Data Persisted:** Changes sync to Supabase correctly
- [x] **Error Handling:** Loading states, error messages, validation working
- [x] **UI/UX:** Follows mobile-first design principles (NFR-005)
- [x] **RLS Verified:** Users can only access their own data (security check)
- [x] **Committed:** Code committed to Git with clear commit message
- [x] **Documentation:** Complex logic has code comments, README updated if needed

**Optional (Nice-to-Have):**
- [ ] Unit tests for business logic (defer to Phase 2+)
- [ ] Accessibility (screen readers, large text) - future enhancement

---

## Next Steps

### Immediate: Begin Sprint 1

**Sprint 1 starts:** Week of 2026-03-03 (tomorrow!)

**First tasks:**
1. **STORY-000:** Initialize React Native + Expo project
   - Run `npx create-expo-app gartenplaner-app --template typescript`
   - Install dependencies: Supabase client, React Navigation, etc.
   - Configure folder structure

2. **STORY-INF-001:** Set up Supabase project
   - Create Supabase account (if not exists)
   - Create new project: "gartenplaner"
   - Run SQL scripts to create all 11 tables
   - Configure RLS policies

3. **STORY-034:** Build navigation structure
   - Set up React Navigation with bottom tabs
   - Create placeholder screens
   - Test navigation flow

**Sprint 1 Deliverable:** By week of 2026-03-17, you'll have a working app skeleton with database ready for features.

---

### Sprint Cadence

**Sprint length:** 2 weeks

**Sprint schedule:**
- **Planning:** Monday of Week 1 (review stories, break down tasks)
- **Daily work:** Evenings/weekends (10-15h total per week)
- **Mid-sprint check:** Friday of Week 1 (assess progress)
- **Sprint review:** Friday of Week 2 (demo to partner, gather feedback)
- **Sprint retrospective:** Friday of Week 2 (what went well, what to improve)

**Recommended workflow:**
1. Start each sprint by reading all stories planned for that sprint
2. Break stories into small tasks (1-2 hour chunks)
3. Work on one story at a time (finish before starting next)
4. Commit frequently (after each task)
5. Test on real device regularly (not just emulator)
6. Get partner feedback mid-sprint (adjust as needed)

---

### How to Use This Sprint Plan

**For development:**
- Use this document as your roadmap
- Focus on current sprint's stories only (don't get ahead)
- Check "Acceptance Criteria" to know when story is done
- Follow "Technical Notes" for implementation guidance

**For tracking progress:**
- Mark stories complete when Definition of Done met
- Update `.bmad/sprint-status.yaml` after each sprint (tool will help)
- Celebrate sprint completions! 🎉

**For adjustments:**
- If story takes longer than estimated: Move remaining stories to next sprint
- If capacity changes: Adjust points per sprint, re-allocate stories
- If priorities change: Re-order backlog (discuss in retrospective)

---

## Appendix: Story Estimation Reference

**1 point (1-2 hours):**
- Configuration change
- Simple text/UI update
- Add basic validation

**2 points (2-4 hours):**
- Simple CRUD screen (minimal logic)
- Basic component with state
- Database query with filters

**3 points (4-8 hours):**
- Complex component (multiple states, forms)
- Business logic with edge cases
- Integration between 2-3 components

**5 points (1-2 days, 8-16 hours):**
- Full feature (frontend + backend)
- Complex business logic
- Multiple screens/components
- External API integration (simple)

**8 points (2-3 days, 16-24 hours):**
- Very complex feature
- AI integration with prompt engineering
- Performance optimization required
- High uncertainty or R&D needed

---

**This sprint plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**

**Ready to build your Gartenplaner app! 🌱**

Let's turn your garden chaos into organized, joyful productivity. Start with Sprint 1, and by Ende Juli 2026, you'll have a fully functional app helping you achieve your permaculture goals.

**Good luck, and happy coding!** 🚀
