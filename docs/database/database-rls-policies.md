# Row Level Security (RLS) Policies Documentation

**Version:** 1.0
**Date:** 2026-03-03
**Status:** Production-ready

---

## Overview: What is RLS and Why We Use It

### Purpose

Row Level Security (RLS) is a PostgreSQL security feature that controls access to rows at the database level. In Gartenplaner, RLS ensures:

- **Data Isolation**: Users only see/modify their own data
- **Security First**: Policies enforced by the database, not just the app
- **Compliance**: Automatic enforcement prevents accidental data exposure
- **Multi-tenancy**: Each user's garden is completely isolated

### Security Model

**Principle**: Users can only access data where `user_id = auth.uid()`

Every authenticated request includes an `auth.uid()` context provided by Supabase Auth. The database uses this to filter rows automatically.

**Example:**
- User A with ID `uuid-123` can only see plants where `plants.user_id = 'uuid-123'`
- Even if User B tries to query plants by ID directly, the RLS policy blocks the result
- The database returns no rows, preventing unauthorized access

---

## RLS Policies by Table

### 1. plants

**Table Type:** User-scoped (requires RLS)

**Purpose:** Each user can only manage their own plant collection

**RLS Policies:**

```sql
-- SELECT: Users can view their own plants
CREATE POLICY "Users can view own plants"
  ON plants FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert plants for themselves
CREATE POLICY "Users can insert own plants"
  ON plants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only edit their own plants
CREATE POLICY "Users can update own plants"
  ON plants FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own plants
CREATE POLICY "Users can delete own plants"
  ON plants FOR DELETE
  USING (auth.uid() = user_id);
```

**Access Control Logic:**

| Action | Allowed | Condition |
|--------|---------|-----------|
| View own plants | ✅ YES | `user_id` matches authenticated user |
| View other's plants | ❌ NO | RLS policy blocks query result |
| Add to own garden | ✅ YES | Can insert with own `user_id` |
| Edit own plants | ✅ YES | Can update their records |
| Delete own plants | ✅ YES | Can delete their records |

**Real-world Example:**
```typescript
// GET user's plants
const { data: plants } = await supabase
  .from('plants')
  .select('*')
  .eq('user_id', session.user.id);
// RLS: Automatically filtered to only plants where user_id = session.user.id

// Try to get another user's plants (won't work)
const { data: hackedData } = await supabase
  .from('plants')
  .select('*')
  .eq('user_id', 'different-user-id');
// RLS: Returns empty result, access denied
```

---

### 2. tasks

**Table Type:** User-scoped (requires RLS)

**Purpose:** Each user manages their own garden maintenance tasks

**RLS Policies:**

```sql
-- Users can manage their own tasks (all operations)
CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);
```

**Access Control Logic:**

| Action | Allowed | Condition |
|--------|---------|-----------|
| View own tasks | ✅ YES | `user_id` matches authenticated user |
| View other's tasks | ❌ NO | RLS blocks access |
| Create task | ✅ YES | Must set own `user_id` |
| Update task | ✅ YES | Only own tasks |
| Delete task | ✅ YES | Only own tasks |

**Why Single Policy?**
The `FOR ALL` clause with `USING` applies to SELECT, INSERT, UPDATE, and DELETE in one policy. The `WITH CHECK` is implied from `USING`.

---

### 3. plant_tasks (Junction Table)

**Table Type:** User-scoped (indirect)

**Purpose:** Link tasks to plants

**RLS Policies:**

```sql
-- Users can manage plant-task relationships for their own plants
CREATE POLICY "Users can manage their own plant-task links"
  ON plant_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = plant_tasks.plant_id
      AND plants.user_id = auth.uid()
    )
  );
```

**Access Control Logic:**

- Users can only link tasks to their own plants
- If a user tries to link a task to someone else's plant, RLS blocks it
- The subquery checks that the plant belongs to the authenticated user

**Example:**
```typescript
// User can link their task to their plant
await supabase
  .from('plant_tasks')
  .insert({ task_id: myTaskId, plant_id: myPlantId });
// ✅ Allowed: plant_id belongs to user

// User cannot link to another user's plant
await supabase
  .from('plant_tasks')
  .insert({ task_id: myTaskId, plant_id: otherUserPlantId });
// ❌ Blocked: RLS detects plant doesn't belong to user
```

---

### 4. photos

**Table Type:** User-scoped (requires RLS)

**Purpose:** Each user manages their own garden photos

**RLS Policies:**

```sql
-- Users can manage their own photos (all operations)
CREATE POLICY "Users can manage own photos"
  ON photos FOR ALL
  USING (auth.uid() = user_id);
```

**Access Control Logic:**

| Action | Allowed | Condition |
|--------|---------|-----------|
| View own photos | ✅ YES | `user_id` matches authenticated user |
| View other's photos | ❌ NO | RLS blocks access |
| Upload photo | ✅ YES | Must set own `user_id` |
| Update metadata | ✅ YES | Only own photos |
| Delete photo | ✅ YES | Only own photos |

---

### 5. photo_plants (Junction Table)

**Table Type:** User-scoped (indirect)

**Purpose:** Link photos to plants

**RLS Policies:**

```sql
-- Users can manage photo-plant relationships for their own photos
CREATE POLICY "Users can manage their own photo-plant links"
  ON photo_plants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = photo_plants.photo_id
      AND photos.user_id = auth.uid()
    )
  );
```

**Access Control Logic:**

- Users can only link photos to their own plants
- The subquery verifies the photo belongs to the authenticated user
- Protects against cross-user data linking

---

### 6. shopping_items

**Table Type:** User-scoped (requires RLS)

**Purpose:** Each user manages their shopping list

**RLS Policies:**

```sql
-- Users can manage their own shopping items (all operations)
CREATE POLICY "Users can manage own shopping items"
  ON shopping_items FOR ALL
  USING (auth.uid() = user_id);
```

**Access Control Logic:**

| Action | Allowed | Condition |
|--------|---------|-----------|
| View own list | ✅ YES | `user_id` matches authenticated user |
| View other's list | ❌ NO | RLS blocks access |
| Add item | ✅ YES | Must set own `user_id` |
| Update item | ✅ YES | Only own items |
| Delete item | ✅ YES | Only own items |

**Example Workflow:**
```typescript
// Get own shopping list
const { data: items } = await supabase
  .from('shopping_items')
  .select('*')
  .eq('purchased', false);
// RLS: Automatically includes only user's items

// Mark item as purchased
await supabase
  .from('shopping_items')
  .update({ purchased: true, purchased_at: new Date() })
  .eq('id', itemId);
// ✅ Works if item belongs to user
// ❌ Fails if item belongs to another user
```

---

### 7. harvests

**Table Type:** User-scoped (requires RLS)

**Purpose:** Track yield and harvest records

**RLS Policies:**

```sql
-- Users can manage their own harvests (all operations)
CREATE POLICY "Users can manage own harvests"
  ON harvests FOR ALL
  USING (auth.uid() = user_id);
```

**Access Control Logic:**

| Action | Allowed | Condition |
|--------|---------|-----------|
| View harvests | ✅ YES | `user_id` matches authenticated user |
| Record harvest | ✅ YES | Must set own `user_id` |
| Update record | ✅ YES | Only own records |
| Delete record | ✅ YES | Only own records |

---

### 8. plans

**Table Type:** User-scoped (requires RLS)

**Purpose:** Store garden layout plans and area planning

**RLS Policies:**

```sql
-- Users can manage their own plans (all operations)
CREATE POLICY "Users can manage own plans"
  ON plans FOR ALL
  USING (auth.uid() = user_id);
```

**Access Control Logic:**

| Action | Allowed | Condition |
|--------|---------|-----------|
| View plans | ✅ YES | `user_id` matches authenticated user |
| Create plan | ✅ YES | Must set own `user_id` |
| Update plan | ✅ YES | Only own plans |
| Delete plan | ✅ YES | Only own plans |

---

### 9. knowledge_articles

**Table Type:** Mixed (public system + user-created)

**Purpose:** Gardening knowledge base with optional user contributions

**RLS Policies:**

```sql
-- Anyone can view public and personal articles
CREATE POLICY "Users can view own and system articles"
  ON knowledge_articles FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Users can only manage articles they created
CREATE POLICY "Users can manage own articles"
  ON knowledge_articles FOR INSERT, UPDATE, DELETE
  USING (auth.uid() = user_id);
```

**Access Control Logic:**

| Action | Allowed | Condition |
|--------|---------|-----------|
| View system articles | ✅ YES | `user_id IS NULL` (no owner) |
| View own articles | ✅ YES | `user_id` matches authenticated user |
| View other's articles | ❌ NO | RLS blocks access |
| Create article | ✅ YES | Must set own `user_id` |
| Edit article | ✅ YES | Only own articles |
| Delete article | ✅ YES | Only own articles |

**Example:**
```typescript
// Get all readable articles
const { data: articles } = await supabase
  .from('knowledge_articles')
  .select('*');
// Returns: system articles (user_id IS NULL) + own articles

// Create personal article
await supabase
  .from('knowledge_articles')
  .insert({
    title: 'My Tomato Tips',
    content: '...',
    user_id: session.user.id
  });
// ✅ Works
```

---

### 10. plant_companions

**Table Type:** Reference data (public, system-managed)

**Purpose:** Companion planting reference data

**No RLS Policy** (public data)

**Why No RLS?**
- This table contains reference data (not user data)
- All users should see the same companion planting information
- No security concerns - it's educational data
- Faster queries without RLS overhead

**Access Control:**
```typescript
// All users can read companion data
const { data: companions } = await supabase
  .from('plant_companions')
  .select('*')
  .eq('plant_name', 'Tomate');
// ✅ Any user can see companions for any plant
```

---

## RLS Security Implementation Details

### How RLS Queries Work

**Step 1: User authenticates**
```typescript
const session = await supabase.auth.getSession();
// session.user.id = 'uuid-123' (from auth context)
```

**Step 2: User queries data**
```typescript
const { data } = await supabase
  .from('plants')
  .select('*');
```

**Step 3: Database applies RLS**
```sql
-- Database internally executes:
SELECT * FROM plants
WHERE user_id = 'uuid-123'  -- RLS automatically adds this
```

**Result:** User only sees their own plants

### Key Security Properties

1. **Cannot be bypassed by SQL injection**
   - RLS policies are enforced at the database level
   - Even direct SQL cannot bypass RLS

2. **Transparent to application**
   - App doesn't need to manually filter results
   - Database always enforces policies

3. **Fail-safe**
   - If RLS is misconfigured, it defaults to denying access
   - No data leaks from policy mistakes

4. **Performance**
   - Indexes support RLS filtering efficiently
   - Example: `idx_plants_user_id` makes RLS fast

---

## Testing RLS Policies

### Verify Policies Are Enforced

```typescript
// Test 1: User can access own data
const session = await supabase.auth.getSession();
const { data: ownPlants } = await supabase
  .from('plants')
  .select('*');
// Expected: Returns user's plants only

// Test 2: RLS prevents cross-user access
const { data: otherUserPlants } = await supabase
  .from('plants')
  .select('*')
  .eq('user_id', 'different-uuid');
// Expected: Returns empty array (RLS blocked)

// Test 3: Junction tables enforce RLS
const { data: links } = await supabase
  .from('plant_tasks')
  .select('*');
// Expected: Can only link own plants and tasks
```

### Monitor RLS in Production

```sql
-- View all RLS policies in Supabase
SELECT * FROM pg_policies
WHERE tablename IN (
  'plants', 'tasks', 'photos', 'shopping_items',
  'harvests', 'plans', 'knowledge_articles',
  'plant_tasks', 'photo_plants'
);

-- Verify policies are enforced
SELECT schemaname, tablename, rowsecurity
FROM pg_class
WHERE relname = 'plants';
-- Expected: rowsecurity = on
```

---

## Troubleshooting RLS Issues

### Issue: "Permission Denied" Error

**Symptom:** Query returns error instead of results

**Causes:**
1. RLS policy is too restrictive
2. `WITH CHECK` clause is missing
3. User doesn't have correct `user_id`

**Solution:**
```sql
-- Check if RLS is enabled
SELECT * FROM pg_tables
WHERE tablename = 'plants'
AND schemaname = 'public';

-- Verify policy conditions
SELECT * FROM pg_policies
WHERE tablename = 'plants';
```

### Issue: "User can see other users' data"

**Symptom:** RLS policies aren't working

**Causes:**
1. RLS not enabled on table
2. Overly permissive policy (e.g., `FOR ALL USING (true)`)
3. Policy uses wrong column

**Solution:**
```sql
-- Re-enable RLS
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Check policies use correct condition
SELECT polname, poldef FROM pg_policies
WHERE tablename = 'plants';
-- Expected: poldef contains 'auth.uid() = user_id'
```

### Issue: "Cannot modify table"

**Symptom:** INSERT/UPDATE/DELETE fails

**Causes:**
1. Missing INSERT or UPDATE policy
2. `WITH CHECK` condition rejects insertion
3. User doesn't have required `user_id`

**Solution:**
```typescript
// Ensure user_id is set correctly
const result = await supabase
  .from('plants')
  .insert({
    name: 'Tomato',
    user_id: session.user.id,  // Must match authenticated user
    // ... other fields
  });

// Check if insert succeeded
if (result.error) {
  console.error('Insert failed:', result.error.message);
  // Check RLS policy WITH CHECK condition
}
```

---

## Best Practices for RLS

### Do

✅ **Use `auth.uid()` in all user-scoped policies**
```sql
USING (auth.uid() = user_id)  -- Correct
```

✅ **Enable RLS on all user-scoped tables**
```sql
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
```

✅ **Use indexes on `user_id` for performance**
```sql
CREATE INDEX idx_plants_user_id ON plants(user_id);
```

✅ **Test RLS with multiple users**
```typescript
// Sign in as User A, verify they can only see their data
// Sign in as User B, verify they can't see User A's data
```

### Don't

❌ **Don't use static user IDs in policies**
```sql
USING (user_id = 'specific-uuid')  -- Wrong, breaks for other users
```

❌ **Don't skip `WITH CHECK` on INSERT policies**
```sql
CREATE POLICY "Allow inserts"
  ON plants FOR INSERT
  -- Missing: WITH CHECK (auth.uid() = user_id)
```

❌ **Don't disable RLS to "fix" problems**
```sql
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;  -- Wrong approach
-- Fix the policy instead
```

❌ **Don't forget to test RLS**
- Test with multiple user accounts
- Verify cross-user access is blocked
- Test boundary conditions

---

## RLS and Application Code

### Service Layer Pattern

**Recommended approach:**
```typescript
// services/plantService.ts
export const getMyPlants = async () => {
  // RLS automatically filters by auth.uid()
  const { data, error } = await supabase
    .from('plants')
    .select('*');

  if (error) throw error;
  return data;  // Already filtered by RLS
};

export const createPlant = async (plantData: PlantFormData) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('plants')
    .insert([{ ...plantData, user_id: user.id }]);

  if (error) throw error;
  return data;
};
```

**Why this works:**
1. `getMyPlants` doesn't explicitly filter by `user_id` (RLS does it)
2. `createPlant` includes `user_id` from authenticated session
3. RLS policies enforce access control automatically

---

## Summary: RLS Security Model

| Aspect | Implementation |
|--------|-----------------|
| **Data Isolation** | `user_id = auth.uid()` on all user tables |
| **Query Filtering** | Automatic RLS enforcement by PostgreSQL |
| **Insert Protection** | `WITH CHECK (auth.uid() = user_id)` |
| **Update Protection** | `USING (auth.uid() = user_id)` |
| **Delete Protection** | `USING (auth.uid() = user_id)` |
| **Reference Data** | No RLS needed (public tables) |
| **Performance** | Indexes on `user_id` for fast filtering |
| **Failure Mode** | Secure-by-default (denies access on error) |

---

## Next Steps

1. Verify all RLS policies are enabled in Supabase Dashboard
2. Run test queries with multiple user accounts
3. Monitor query performance with RLS policies active
4. Update application code to use the service layer pattern
5. Document any custom RLS policies in your deployment

---

**For questions or issues with RLS policies, consult:**
- Supabase Documentation: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

