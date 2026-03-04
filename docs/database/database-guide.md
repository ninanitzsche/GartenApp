# Gartenplaner Database Developer Guide

**Version:** 1.0
**Date:** 2026-03-03
**Status:** Production-ready
**Audience:** Development team

---

## Table of Contents

1. [Overview](#overview)
2. [Entity-Relationship Diagram](#entity-relationship-diagram)
3. [Data Model Explanation](#data-model-explanation)
4. [Real-time Subscriptions](#real-time-subscriptions)
5. [Performance Optimization](#performance-optimization)
6. [Migration Process](#migration-process)
7. [Adding New Tables](#adding-new-tables)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Database Architecture

Gartenplaner uses **Supabase PostgreSQL** as its database backend. Key characteristics:

- **Multi-tenant**: Each user's data is isolated via Row Level Security (RLS)
- **Real-time capable**: Built-in subscriptions for live updates
- **Cloud-hosted**: Managed PostgreSQL on AWS infrastructure
- **Type-safe**: TypeScript generated types from schema

### Database Credentials

```bash
# Supabase project access:
# 1. Dashboard: https://supabase.com/dashboard
# 2. Project: gartenplaner-app
# 3. SQL Editor: Write and execute SQL directly
# 4. Auth credentials: In .env file (SUPABASE_URL, SUPABASE_ANON_KEY)
```

### Connected Services

```
┌─────────────────────────────────────────┐
│       React Native Mobile App           │
│       (src/services/*.ts)               │
└─────────────┬───────────────────────────┘
              │ Supabase Client
              │ (TypeScript SDK)
              ▼
┌─────────────────────────────────────────┐
│      Supabase Backend (Hosted)          │
│  ├─ PostgreSQL (10 tables)              │
│  ├─ Auth (Supabase Auth)                │
│  ├─ Storage (Photos, Plans)             │
│  └─ Real-time (subscriptions)           │
└─────────────────────────────────────────┘
```

---

## Entity-Relationship Diagram

### Diagram: Gartenplaner Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│ auth.users (Managed by Supabase)                                │
│ ├─ id: UUID (Primary Key)                                       │
│ ├─ email: TEXT                                                  │
│ └─ created_at: TIMESTAMPTZ                                      │
└──────┬──────────────────────────────────────────┬───────────────┘
       │                                          │
       │ 1:N (user owns many)                     │ 1:N (user owns many)
       │                                          │
       ▼                                          ▼
┌──────────────────────┐              ┌──────────────────────┐
│ plants               │              │ tasks                │
│ ├─ id: UUID          │              │ ├─ id: UUID          │
│ ├─ user_id: UUID ◄──┼──┐           │ ├─ user_id: UUID ◄──┤─┐
│ ├─ name: TEXT        │  │ FK        │ ├─ title: TEXT       │ │ FK
│ ├─ location: TEXT    │  │           │ ├─ completed: BOOL   │ │
│ ├─ status: TEXT      │  │           │ ├─ due_date: DATE    │ │
│ ├─ winterhart: BOOL  │  │           │ └─ category: TEXT    │ │
│ ├─ essbar: BOOL      │  │           └──────────────────────┘ │
│ └─ created_at: TS    │  │                    ▲                │
└──────┬───────────────┘  │                    │                │
       │                  │                    │ M:M (N:N)      │
       │ 1:N              │            ┌───────┴────────┐       │
       │ (plant has many) │            │                │       │
       │                  │            │ plant_tasks    │       │
       │                  │            │ ├─ task_id     │       │
       │                  │            │ └─ plant_id    │       │
       │                  │            └────────────────┘       │
       │                  │
       │                  └─────────────────────────────────────┘
       │
       │ 1:N (plant has many)
       ▼
┌──────────────────────┐
│ harvests             │
│ ├─ id: UUID          │
│ ├─ plant_id: UUID ◄──┼─ FK
│ ├─ user_id: UUID ◄──┐│ FK
│ ├─ quantity: DEC     ││
│ ├─ harvest_date: DT  ││
│ └─ created_at: TS    ││
└──────────────────────┘│
                        │
┌──────────────────────┐│
│ photos               ││
│ ├─ id: UUID          ││
│ ├─ user_id: UUID ◄───┘ FK
│ ├─ file_url: TEXT    │
│ ├─ date: TS          │
│ └─ created_at: TS    │
└──────┬───────────────┘
       │
       │ 1:N (photo has many)
       │ M:M (N:N)
       ▼
┌──────────────────────┐
│ photo_plants         │
│ ├─ photo_id: UUID ◄──┼─ FK
│ └─ plant_id: UUID ◄──┼─ FK
└──────────────────────┘
       │
       │ Relates to plants (via foreign key)
       │
┌──────────────────────────────────┐
│ shopping_items                   │
│ ├─ id: UUID                      │
│ ├─ user_id: UUID ◄───────────────┼─ FK
│ ├─ item_name: TEXT               │
│ ├─ category: TEXT                │
│ ├─ priority: TEXT                │
│ ├─ purchased: BOOL               │
│ └─ created_at: TS                │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ plans                            │
│ ├─ id: UUID                      │
│ ├─ user_id: UUID ◄───────────────┼─ FK
│ ├─ name: TEXT                    │
│ ├─ image_url: TEXT               │
│ └─ created_at: TS                │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ knowledge_articles               │
│ ├─ id: UUID                      │
│ ├─ user_id: UUID (nullable) ◄────┼─ FK (optional)
│ ├─ title: TEXT                   │
│ ├─ category: TEXT                │
│ └─ created_at: TS                │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ plant_companions (Reference Data)│
│ ├─ id: UUID                      │
│ ├─ plant_name: TEXT UNIQUE       │
│ ├─ good_companions: TEXT[]       │
│ └─ bad_companions: TEXT[]        │
└──────────────────────────────────┘

Legend:
UUID = Universally Unique Identifier
TEXT = String/Text
DEC = Decimal (numeric)
BOOL = Boolean (true/false)
DT = Date (YYYY-MM-DD)
TS = Timestamp (DateTime)
◄── = Foreign Key Reference
M:M = Many-to-Many relationship
FK = Foreign Key
```

### Key Relationships

**1:N (One-to-Many)**
- One user → Many plants
- One user → Many tasks
- One user → Many shopping_items
- One user → Many photos
- One user → Many harvests
- One user → Many plans
- One plant → Many harvests

**M:M (Many-to-Many)**
- Tasks ↔ Plants (via `plant_tasks`)
- Photos ↔ Plants (via `photo_plants`)

**Reference Data** (No user relationship)
- `plant_companions` - system data, publicly accessible
- `knowledge_articles` - public (NULL user_id) + personal (user_id set)

---

## Data Model Explanation

### Table Purpose and Usage

#### 1. plants
**Purpose:** Core garden inventory

**Typical Query:**
```typescript
// Get all plants for logged-in user
const { data: plants } = await supabase
  .from('plants')
  .select('*')
  .order('created_at', { ascending: false });

// Get plants in specific location
const { data: locationPlants } = await supabase
  .from('plants')
  .select('*')
  .eq('location', 'Gemüsebeet');

// Get plants that are harvestable
const { data: harvestReady } } = await supabase
  .from('plants')
  .select('*')
  .eq('status', 'gepflanzt')
  .lte('harvest_date', new Date().toISOString().split('T')[0]);
```

**Fields:**
- `status`: Track plant lifecycle (geplant → bestellt → gepflanzt → geerntet → entfernt)
- `winterhart`: Indicates cold-hardy plants (for winter planning)
- `essbar`: Marks edible plants (for harvest tracking)
- `tags`: Searchable array (e.g., ['sommerblüher', 'bienenfreundlich'])

---

#### 2. tasks
**Purpose:** Garden maintenance and planting tasks

**Typical Query:**
```typescript
// Get pending tasks
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('completed', false)
  .order('priority', { ascending: false });

// Get tasks for specific plant
const { data: plantTasks } = await supabase
  .from('plant_tasks')
  .select('*, tasks(*)');
  .eq('plant_id', plantId);

// Get recurring tasks
const { data: recurring } = await supabase
  .from('tasks')
  .select('*')
  .eq('is_recurring', true);
```

**Fields:**
- `priority`: Task urgency (niedrig, mittel, hoch, dringend)
- `completed_at`: Timestamp when completed (null if pending)
- `is_recurring`: Whether task repeats (weekly watering, monthly fertilizing)
- `recurrence_pattern`: How often (daily, weekly, monthly)

---

#### 3. photos
**Purpose:** Document garden progress with images

**Typical Query:**
```typescript
// Get recent photos
const { data: photos } = await supabase
  .from('photos')
  .select('*')
  .order('date', { ascending: false })
  .limit(20);

// Get photos by location
const { data: locationPhotos } = await supabase
  .from('photos')
  .select('*')
  .eq('location', 'Blumenbeet')
  .order('date', { ascending: false });

// Get photos with plant tags
const { data: plantPhotos } = await supabase
  .from('photo_plants')
  .select('*, photos(*), plants(*)')
  .eq('plant_id', plantId);
```

**Fields:**
- `file_url`: Cloud storage URL (from Supabase Storage)
- `thumbnail_url`: Pre-generated smaller image
- `ai_analysis`: JSONB data from plant detection AI (optional)
- `tags`: Searchable metadata array

---

#### 4. shopping_items
**Purpose:** Garden shopping list and purchase tracking

**Typical Query:**
```typescript
// Get unpurchased items
const { data: todo } = await supabase
  .from('shopping_items')
  .select('*')
  .eq('purchased', false)
  .order('priority', { ascending: false });

// Get purchase history
const { data: history } = await supabase
  .from('shopping_items')
  .select('*')
  .eq('purchased', true)
  .order('purchased_at', { ascending: false });

// Calculate total spent
const { data: purchases } = await supabase
  .from('shopping_items')
  .select('actual_price')
  .eq('purchased', true);

const total = purchases?.reduce((sum, item) => sum + (item.actual_price || 0), 0);
```

**Fields:**
- `priority`: Need level (niedrig, mittel, hoch, dringend)
- `actual_price`: Compare vs. estimated_price for budgeting
- `where_to_buy`: Track favorite stores
- `link`: Direct product links for quick ordering

---

#### 5. harvests
**Purpose:** Track yields and harvest records

**Typical Query:**
```typescript
// Get harvest records for plant
const { data: plantHarvests } = await supabase
  .from('harvests')
  .select('*, plants(*)')
  .eq('plant_id', plantId)
  .order('harvest_date', { ascending: false });

// Calculate total yield
const { data: yields } = await supabase
  .from('harvests')
  .select('quantity, unit')
  .eq('plant_id', plantId);

// Get harvests this season
const { data: thisYear } = await supabase
  .from('harvests')
  .select('*')
  .gte('harvest_date', '2026-01-01');
```

**Fields:**
- `quantity`: Amount harvested (5.5)
- `unit`: Measurement unit (kg, pieces, bunches, liters)
- `harvest_date`: When harvested (for yield tracking)

---

#### 6. plans
**Purpose:** Garden layout and planning diagrams

**Typical Query:**
```typescript
// Get all garden plans
const { data: plans } = await supabase
  .from('plans')
  .select('*');

// Get plan details with image
const { data: plan } = await supabase
  .from('plans')
  .select('*')
  .eq('id', planId)
  .single();
```

---

#### 7. knowledge_articles
**Purpose:** Gardening knowledge base

**Typical Query:**
```typescript
// Get system articles (public)
const { data: articles } = await supabase
  .from('knowledge_articles')
  .select('*')
  .eq('user_id', null);

// Get articles in category
const { data: careGuides } = await supabase
  .from('knowledge_articles')
  .select('*')
  .eq('category', 'Pflanzenpflege');

// Get user's saved articles
const { data: saved } = await supabase
  .from('knowledge_articles')
  .select('*')
  .eq('is_favorited', true);
```

**Fields:**
- `user_id` (nullable): NULL = system article, UUID = user-created
- `is_favorited`: User favorite flag
- `category`: Knowledge organization (Pflanzenpflege, Schädlinge, Aussaat, etc.)

---

#### 8. plant_companions
**Purpose:** Companion planting reference (public data)

**Typical Query:**
```typescript
// Get companion info for plant
const { data: companions } = await supabase
  .from('plant_companions')
  .select('*')
  .eq('plant_name', 'Tomate');

// All gardens use the same companion data
// No user_id filtering needed
```

**Fields:**
- `plant_name` (UNIQUE): Only one record per plant
- `good_companions`: Array of compatible plants
- `bad_companions`: Array of plants to avoid nearby

---

### Table Relationships Explained

#### plant_tasks (M:M Junction)
**Purpose:** Link tasks to specific plants

**Example:** Watering task can be applied to multiple plants
```typescript
// Create task → Apply to multiple plants
const task = await createTask({ title: 'Water plants', ... });
const plantIds = ['plant-1', 'plant-2', 'plant-3'];

for (const plantId of plantIds) {
  await supabase
    .from('plant_tasks')
    .insert({ task_id: task.id, plant_id: plantId });
}

// Later: Get all plants needing watering
const { data: plants } = await supabase
  .from('plant_tasks')
  .select('plants(*)')
  .eq('task_id', wateringTaskId);
```

---

#### photo_plants (M:M Junction)
**Purpose:** Link photos to plants shown in them

**Example:** One photo can show multiple plants
```typescript
// Photo shows 3 plants
const photo = { file_url: 's3://...', ... };
const plantIds = ['tomato-1', 'basil-1', 'pepper-1'];

// Link photo to each plant
for (const plantId of plantIds) {
  await supabase
    .from('photo_plants')
    .insert({ photo_id: photo.id, plant_id: plantId });
}

// Later: Get all photos of specific plant
const { data: photos } = await supabase
  .from('photo_plants')
  .select('photos(*)')
  .eq('plant_id', plantId);
```

---

## Real-time Subscriptions

### What is Real-time?

Supabase provides **live database subscriptions** - your app gets instant updates when other clients or the backend modify data.

### Enabling Real-time on Tables

Real-time must be explicitly enabled per table in Supabase Dashboard:

```bash
Supabase Dashboard → Database → Tables → [table name] → Realtime
```

**Enable for these tables:**
- `plants` - User updates plant status
- `tasks` - User marks task complete
- `shopping_items` - Sync across devices
- `photos` - Real-time gallery updates

**NOT needed for:**
- `knowledge_articles` - Read-only reference
- `plant_companions` - Reference data, never changes
- Junction tables - Needed but rarely updated

### Real-time Usage Example

```typescript
// services/plantService.ts

export function subscribePlants(userId: string, callback: (plants: Plant[]) => void) {
  // Subscribe to changes on plants table
  const subscription = supabase
    .channel(`plants:user_id=eq.${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',  // All events: INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'plants',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('Plant changed:', payload);
        // Refetch plants on any change
        getMyPlants().then(callback);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => subscription.unsubscribe();
}

// React component usage
export function PlantsScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    const { user } = useAuthContext();
    if (!user) return;

    // Subscribe to plant updates
    const unsubscribe = subscribePlants(user.id, setPlants);

    return unsubscribe;  // Cleanup on unmount
  }, []);

  return (
    <View>
      {plants.map(plant => (
        <PlantCard key={plant.id} plant={plant} />
      ))}
    </View>
  );
}
```

### Real-time Performance Tips

1. **Filter subscriptions** - Only listen to relevant data
```typescript
// ✅ Good: Only listen to user's plants
filter: `user_id=eq.${userId}`

// ❌ Bad: Listen to all plants
// No filter = heavy network usage
```

2. **Use debouncing** - Avoid multiple rapid updates
```typescript
const debouncedUpdate = debounce((plants) => {
  setPlants(plants);
}, 300);  // Wait 300ms for multiple changes
```

3. **Unsubscribe on unmount** - Prevent memory leaks
```typescript
useEffect(() => {
  const unsubscribe = subscribePlants(userId, setPlants);
  return unsubscribe;  // Cleanup
}, []);
```

---

## Performance Optimization

### Indexes: Speed Up Queries

**Current Indexes:**

```sql
-- plants table
CREATE INDEX idx_plants_user_id ON plants(user_id);      -- Essential for RLS
CREATE INDEX idx_plants_status ON plants(status);        -- Filter by status
CREATE INDEX idx_plants_location ON plants(location);    -- Filter by location

-- tasks table
CREATE INDEX idx_tasks_user_id ON tasks(user_id);        -- Essential for RLS
CREATE INDEX idx_tasks_completed ON tasks(completed);    -- Filter done/pending
CREATE INDEX idx_tasks_priority ON tasks(priority);      -- Sort by priority

-- photos table
CREATE INDEX idx_photos_user_id ON photos(user_id);      -- Essential for RLS
CREATE INDEX idx_photos_date ON photos(date DESC);       -- Show newest first

-- shopping_items table
CREATE INDEX idx_shopping_user_id ON shopping_items(user_id);     -- Essential
CREATE INDEX idx_shopping_purchased ON shopping_items(purchased); -- Filter status

-- harvests table
CREATE INDEX idx_harvests_user_id ON harvests(user_id);
CREATE INDEX idx_harvests_plant_id ON harvests(plant_id);
CREATE INDEX idx_harvests_date ON harvests(harvest_date DESC);

-- plans table
CREATE INDEX idx_plans_user_id ON plans(user_id);

-- knowledge_articles table
CREATE INDEX idx_knowledge_category ON knowledge_articles(category);
CREATE INDEX idx_knowledge_user_id ON knowledge_articles(user_id);

-- junction tables
CREATE INDEX idx_plant_tasks_task ON plant_tasks(task_id);
CREATE INDEX idx_plant_tasks_plant ON plant_tasks(plant_id);
CREATE INDEX idx_photo_plants_photo ON photo_plants(photo_id);
CREATE INDEX idx_photo_plants_plant ON photo_plants(plant_id);

-- plant_companions table
CREATE INDEX idx_companions_plant_name ON plant_companions(plant_name);
```

### Query Optimization Tips

#### ✅ Good Queries (Fast)

```typescript
// 1. Use indexes in WHERE clause
const { data } = await supabase
  .from('plants')
  .select('*')
  .eq('user_id', userId)      // Indexed - fast RLS filter
  .eq('status', 'gepflanzt');  // Indexed - fast additional filter

// 2. Limit results
const { data } = await supabase
  .from('plants')
  .select('*')
  .limit(50);  // Don't fetch all 1000+ rows

// 3. Select specific columns (not `*`)
const { data } = await supabase
  .from('plants')
  .select('id, name, status');  // Only need these

// 4. Use sorting with indexes
const { data } = await supabase
  .from('plants')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20);  // Pagination

// 5. Join related data efficiently
const { data } = await supabase
  .from('plant_tasks')
  .select('*, plants!inner(*), tasks!inner(*)')
  .eq('plants.user_id', userId);  // Filter joined table
```

#### ❌ Bad Queries (Slow)

```typescript
// 1. Fetch all data then filter in app
const { data: allPlants } = await supabase
  .from('plants')
  .select('*');  // ← Fetches ALL plants for all users!
const userPlants = allPlants.filter(p => p.user_id === userId);

// 2. Complex calculations in database
const { data } = await supabase
  .from('plants')
  .select('name, status, notes');
const result = data.filter(p =>
  p.notes.includes('water') || p.status === 'gepflanzt'
);

// 3. Full table scans (no WHERE clause)
const { data } = await supabase
  .from('knowledge_articles')
  .select('*')
  .limit(100);  // Might scan many rows

// 4. Unnested selections
const { data } = await supabase
  .from('plants')
  .select('*, harvests(*), photos(*)');  // Too much data
```

### Pagination Pattern

```typescript
// Load plants 20 at a time
const ITEMS_PER_PAGE = 20;
let currentPage = 0;

export async function loadPlants(page: number = 0) {
  const from = page * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data } = await supabase
    .from('plants')
    .select('*')
    .range(from, to)
    .order('created_at', { ascending: false });

  return data;
}

// Usage in screen
const [plants, setPlants] = useState<Plant[]>([]);
const [page, setPage] = useState(0);

const loadMore = async () => {
  const newPlants = await loadPlants(page + 1);
  setPlants([...plants, ...newPlants]);
  setPage(page + 1);
};
```

---

## Migration Process

### What is a Migration?

A migration is a versioned SQL file that modifies the database schema. Migrations:

- Track schema changes over time
- Allow multiple developers to sync changes
- Enable rollback if needed
- Run in sequence (001, 002, 003...)

### Current Migration Structure

```bash
supabase/migrations/
└── 001_initial_schema.sql     # Version 1: All 10 tables + RLS
```

### Adding New Migrations

#### Step 1: Create Migration File

```bash
# Format: NNN_description.sql (NNN = version number)
supabase/migrations/002_add_notes_to_tasks.sql
```

#### Step 2: Write Migration

```sql
-- supabase/migrations/002_add_notes_to_tasks.sql
-- Date: 2026-03-10
-- Description: Add detailed notes field to tasks

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;
CREATE INDEX idx_tasks_notes ON tasks USING GIN(to_tsvector('german', notes));

-- Create RLS policy for new column
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage task notes" ON tasks
  USING (auth.uid() = user_id);
```

#### Step 3: Apply Migration

```bash
# Option 1: Via Supabase Dashboard
# Dashboard → SQL Editor → Paste migration file → Run

# Option 2: Via CLI (if using Supabase CLI)
supabase db push
```

### Migration Best Practices

✅ **Do:**
- Create one migration per feature
- Include comments with date and description
- Test migration on development database first
- Always add `IF NOT EXISTS` or `IF EXISTS` clauses
- Update RLS policies if adding user-scoped columns

❌ **Don't:**
- Modify or delete old migration files
- Run destructive operations without backup
- Skip testing on dev database
- Add large data changes in migrations

### Example: Adding New Table

```sql
-- supabase/migrations/003_add_watering_schedule.sql
-- Date: 2026-03-15
-- Description: Add watering schedule table for recurring care

CREATE TABLE IF NOT EXISTS watering_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL,  -- daily, weekly, etc
  last_watered_at TIMESTAMPTZ,
  next_water_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_watering_user_id ON watering_schedule(user_id);
CREATE INDEX idx_watering_plant_id ON watering_schedule(plant_id);
CREATE INDEX idx_watering_next_date ON watering_schedule(next_water_date);

-- Enable RLS
ALTER TABLE watering_schedule ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Users can manage own watering schedules"
  ON watering_schedule FOR ALL
  USING (auth.uid() = user_id);

-- Apply trigger
CREATE TRIGGER update_watering_schedule_updated_at BEFORE UPDATE
  ON watering_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Adding New Tables

### Template: User-Scoped Table

**Use this template for tables storing user-specific data:**

```sql
-- supabase/migrations/NNN_add_new_table.sql
-- Date: YYYY-MM-DD
-- Description: What this table does

-- 1. Create table
CREATE TABLE IF NOT EXISTS new_table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Always include user_id for user-scoped data
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Your columns here
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',

  -- Always include timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_new_table_user_id ON new_table_name(user_id);
-- Add indexes for frequently filtered columns:
CREATE INDEX IF NOT EXISTS idx_new_table_status ON new_table_name(status);

-- 3. Enable RLS
ALTER TABLE new_table_name ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can manage their own data"
  ON new_table_name FOR ALL
  USING (auth.uid() = user_id);

-- 5. Apply auto-update trigger
CREATE TRIGGER update_new_table_updated_at BEFORE UPDATE
  ON new_table_name
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Template: Reference Data Table

**Use for system/public data that doesn't need RLS:**

```sql
-- 1. Create table (no user_id needed)
CREATE TABLE IF NOT EXISTS reference_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Your columns
  name TEXT NOT NULL UNIQUE,
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_reference_name ON reference_data(name);

-- 3. DON'T enable RLS (this is public data)
-- ALL USERS CAN READ THIS TABLE
```

### Checklist: Before Adding New Table

- [ ] Schema designed and approved
- [ ] User-scoped or reference data? (determines RLS)
- [ ] All user-scoped tables have `user_id + RLS`
- [ ] Foreign key constraints define `ON DELETE CASCADE`
- [ ] Indexes on frequently filtered columns
- [ ] Timestamps (`created_at`, `updated_at`)
- [ ] Trigger for auto-updating `updated_at`
- [ ] Documentation updated
- [ ] TypeScript types added (`src/types/`)
- [ ] Service methods created (`src/services/`)

---

## Troubleshooting

### Issue: "Permission Denied" on Query

**Symptom:**
```
PostgrestError: new row violates row-level security policy
```

**Causes:**
1. RLS policy too restrictive
2. `user_id` doesn't match authenticated user
3. Policy missing `WITH CHECK` clause

**Solution:**
```typescript
// Check you're setting user_id correctly
const { data: { user } } = await supabase.auth.getUser();

const { data, error } = await supabase
  .from('plants')
  .insert({
    name: 'Tomato',
    user_id: user.id,  // Must match authenticated user
    // ... other fields
  });

if (error?.message.includes('row-level security')) {
  // Check that user_id matches session
  console.log('Auth user ID:', user.id);
  console.log('Attempting to insert with user_id:', user.id);
}
```

### Issue: Extremely Slow Queries

**Symptom:** Query takes 5+ seconds

**Causes:**
1. Missing index on WHERE clause column
2. Fetching too much data
3. Unoptimized join

**Solution:**
```sql
-- Check if query has index
EXPLAIN ANALYZE
SELECT * FROM plants
WHERE user_id = 'uuid-123' AND status = 'gepflanzt';

-- If status missing index, create it:
CREATE INDEX idx_plants_status ON plants(status);

-- Or use compound index for common queries:
CREATE INDEX idx_plants_user_status ON plants(user_id, status);
```

### Issue: "Column Not Found" Error

**Symptom:**
```
PostgrestError: column "xyz" does not exist
```

**Causes:**
1. Column name mismatch
2. Using camelCase instead of snake_case
3. Column not migrated to production

**Solution:**
```typescript
// Check actual column names
const { data: plants } = await supabase
  .from('plants')
  .select('*')
  .limit(1);

console.log(Object.keys(plants[0]));  // See actual column names

// Fix query with correct names
const { data } = await supabase
  .from('plants')
  .select('id, name, status')  // Confirm these exist
  .limit(10);
```

### Issue: RLS Policy Not Working

**Symptom:** User can see other users' data

**Causes:**
1. RLS not enabled on table
2. Policy logic error
3. Overly permissive policy

**Solution:**
```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'plants';
-- Expected: rowsecurity = on

-- Check policies
SELECT * FROM pg_policies
WHERE tablename = 'plants';

-- If RLS is off, enable it:
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- If policy is wrong, drop and recreate:
DROP POLICY IF EXISTS "old_policy" ON plants;
CREATE POLICY "Users can view own plants"
  ON plants FOR SELECT
  USING (auth.uid() = user_id);
```

### Issue: Real-time Subscription Not Working

**Symptom:** Changes don't appear in app

**Causes:**
1. Real-time not enabled on table
2. Subscription not started
3. Subscription filter incorrect

**Solution:**
```typescript
// 1. Enable real-time in Dashboard: Tables → [table] → Realtime toggle

// 2. Check subscription is started
const channel = supabase
  .channel('plants-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'plants',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Change detected:', payload);
  })
  .subscribe((status) => {
    console.log('Subscription status:', status);  // Should be 'SUBSCRIBED'
  });

// 3. Verify filter is correct
// filter: `user_id=eq.${userId}` must match actual user_id
```

### Performance Debugging

```typescript
// Add timing to queries
console.time('Get plants');
const { data: plants } = await supabase
  .from('plants')
  .select('*');
console.timeEnd('Get plants');
// Output: Get plants: 250ms

// Check Supabase dashboard for slow queries
// Dashboard → Logs → Slow Queries
```

---

## Summary

### Database Architecture
- **Type:** Supabase PostgreSQL (managed)
- **Tables:** 10 (8 user-scoped + 2 reference)
- **Scale:** Single user → millions of records per user
- **RLS:** Automatic data isolation at database level

### Key Concepts

| Concept | Purpose | Example |
|---------|---------|---------|
| **RLS** | Enforce user isolation | `auth.uid() = user_id` |
| **Indexes** | Speed up queries | `idx_plants_user_id` |
| **Migrations** | Version schema changes | `001_initial_schema.sql` |
| **Real-time** | Live updates | `subscribePlants()` |
| **Triggers** | Auto-update timestamps | `update_updated_at_column()` |

### Essential Files

- `/docs/database-schema.sql` - Table definitions
- `/docs/database-rls-policies.md` - RLS documentation
- `/docs/database-guide.md` - This file
- `/src/types/*.ts` - TypeScript interfaces
- `/src/services/*.ts` - Database queries
- `/supabase/migrations/` - Schema versioning

### Getting Help

1. **Supabase Docs:** https://supabase.com/docs
2. **PostgreSQL Docs:** https://www.postgresql.org/docs/
3. **Dashboard Logs:** Check slow queries in Supabase Dashboard
4. **RLS Issues:** See database-rls-policies.md troubleshooting
5. **Performance:** Use EXPLAIN ANALYZE for query analysis

---

**Document Version:** 1.0
**Last Updated:** 2026-03-03
**Status:** Ready for Production

