# src/services/ - API & Business Logic Layer

**Last Updated:** 2026-03-04
**Status:** Production code (70% reusable pattern)
**Purpose:** Centralized data access and API calls

---

## 🎯 What is the Service Layer?

The **Service Layer** is where all API calls and business logic live.

**Benefits:**
- Centralized error handling
- Easy to test (mock once, reuse everywhere)
- Consistent patterns across all entities
- 70% code reuse (copy pattern, change names)

**Pattern:**
```
Screen → Hook → Service → Supabase API → Database
```

---

## 📋 Service Pattern (HIGHLY REUSABLE)

**Standard CRUD operations:**

```typescript
// src/services/newEntityService.ts

import { supabase } from '../lib/supabase';
import { NewEntity } from '../types/newEntity';

// FETCH ALL (with optional filters)
export async function fetchAll(filters?: Filters) {
  try {
    let query = supabase.from('new_entities').select('*');

    // Always filter by user_id for user-scoped data
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    // Add other filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as NewEntity[];
  } catch (error) {
    console.error('Error fetching entities:', error.message);
    throw error;
  }
}

// FETCH BY ID
export async function fetchById(id: string) {
  try {
    const { data, error } = await supabase
      .from('new_entities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as NewEntity;
  } catch (error) {
    console.error('Error fetching entity:', error.message);
    throw error;
  }
}

// CREATE
export async function create(entity: Omit<NewEntity, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('new_entities')
      .insert([entity])
      .select()
      .single();

    if (error) throw error;
    return data as NewEntity;
  } catch (error) {
    console.error('Error creating entity:', error.message);
    throw error;
  }
}

// UPDATE
export async function update(id: string, updates: Partial<NewEntity>) {
  try {
    const { data, error } = await supabase
      .from('new_entities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as NewEntity;
  } catch (error) {
    console.error('Error updating entity:', error.message);
    throw error;
  }
}

// DELETE
export async function remove(id: string) {
  try {
    const { error } = await supabase
      .from('new_entities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting entity:', error.message);
    throw error;
  }
}
```

---

## 📂 Current Services

### authService.ts
**Purpose:** User authentication and session management

**Functions:**
- `signUp(email, password)` - Register new user
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `resetPassword(email)` - Send reset link
- `updatePassword(newPassword)` - Change password
- `getCurrentUser()` - Get logged-in user

**Key:** Never expose password, always use Supabase auth functions

---

### plantService.ts
**Purpose:** Plant inventory CRUD (70% pattern reuse)

**Functions:**
- `fetchAll(filters)` - Get all plants
- `fetchById(id)` - Get one plant
- `create(plant)` - Add plant
- `update(id, updates)` - Modify plant
- `remove(id)` - Delete plant

**Usage Example:**
```typescript
const plants = await plantService.fetchAll();
const plant = await plantService.create({ name: 'Tomato', ... });
await plantService.update(id, { status: 'harvested' });
```

---

### shoppingService.ts
**Purpose:** Shopping list CRUD (copy of plantService pattern)

**Functions:**
- `fetchAll()` - Get shopping items
- `create(item)` - Add item
- `update(id, updates)` - Update item
- `remove(id)` - Delete item

---

### photoService.ts
**Purpose:** Photo upload and management

**Functions:**
- `uploadPhoto(bucket, file, path)` - Upload to Supabase Storage
- `deletePhoto(bucket, path)` - Delete from storage
- `getPhotoUrl(bucket, path)` - Get public URL

**Key:** Handle compression on upload (70% quality to save bandwidth)

---

### seedDataService.ts
**Purpose:** Initialize database with starter data

**Functions:**
- `seedPlants(plants)` - Populate plants table
- `seedCompanions(companionData)` - Setup companion planting

**Usage:** Run once on app install to populate database

---

### supabase.ts
**Purpose:** Supabase client initialization

**Exports:**
- `supabase` - Main client instance
- `useAuth()` - Get current user (from AuthContext)

---

## 🔐 Security Requirements

**Every service function must:**

1. **Include user_id filter** (Row Level Security)
   ```typescript
   query.eq('user_id', userId); // RLS protection
   ```

2. **Handle errors consistently**
   ```typescript
   try { ... } catch (error) {
     console.error('Context: ', error.message);
     throw error; // Let caller handle
   }
   ```

3. **Never expose passwords**
   ```typescript
   // DON'T return: { ...user, password: '...' }
   // Only return: { id, email, name, ... }
   ```

4. **Validate inputs**
   ```typescript
   if (!name || name.trim().length === 0) {
     throw new Error('Name is required');
   }
   ```

---

## 🧪 Testing Services

**Mock Supabase in tests:**

```typescript
// src/__tests__/services/plantService.test.ts

import * as plantService from '../../services/plantService';

describe('plantService', () => {
  // Mock Supabase
  jest.mock('../../lib/supabase', () => ({
    supabase: {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: '1', name: 'Plant 1', ... }],
          error: null
        })
      })
    }
  }));

  it('fetches all plants', async () => {
    const plants = await plantService.fetchAll();
    expect(plants).toHaveLength(1);
    expect(plants[0].name).toBe('Plant 1');
  });

  it('handles errors', async () => {
    // Mock error response
    const mockError = new Error('Connection failed');

    expect(plantService.fetchAll()).rejects.toThrow('Connection failed');
  });
});
```

**Test coverage target:** 85%+ for services

---

## ⚠️ Common Mistakes

❌ **Forgetting user_id filter:**
```typescript
// DON'T: Anyone can read other users' data
const plants = await supabase.from('plants').select('*');
```

✅ **Always filter by user:**
```typescript
// DO: Only current user's data
const plants = await supabase
  .from('plants')
  .select('*')
  .eq('user_id', userId);
```

---

❌ **Not handling errors:**
```typescript
// DON'T: Silently fails
const data = await supabase.from('plants').select('*');
return data.data; // Crashes if error
```

✅ **Always check for errors:**
```typescript
// DO: Handle both cases
const { data, error } = await supabase.from('plants').select('*');
if (error) throw error;
return data;
```

---

## 🚀 Adding a New Service

**Step-by-step example: Create `tasksService.ts`**

1. **Copy template:**
   ```bash
   cp plantService.ts tasksService.ts
   ```

2. **Replace names:**
   - `plant_services` → `tasks`
   - `Plant` → `Task`
   - `newEntity` → `task`

3. **Add specific functions** (if needed)
   ```typescript
   // Example: Tasks might have priority-based filtering
   export async function fetchByPriority(priority: 'high' | 'medium' | 'low') {
     const { data, error } = await supabase
       .from('tasks')
       .select('*')
       .eq('priority', priority)
       .order('created_at', { ascending: false });
     if (error) throw error;
     return data;
   }
   ```

4. **Create tests:** `src/__tests__/services/tasksService.test.ts`

5. **Export from index:** `src/services/index.ts` (if using)

---

## 📊 Service Metrics

**Code Reuse:**
- Service Layer pattern: 70% reuse across entities
- Copy plantService → adapt names → done

**Performance:**
- Database queries optimized with filters
- No N+1 queries (use .select() properly)
- Pagination for large lists (if needed)

**Error Handling:**
- All errors caught and re-thrown
- Console logs for debugging
- User-friendly error messages in screens

---

## 🔗 Related Files

- **Types:** `src/types/` - Define data structures
- **Screens:** `src/screens/` - Use services here
- **Tests:** `src/__tests__/services/` - Test all services
- **Database:** `docs/database/database-guide.md` - Schema info
- **RLS:** `docs/database/database-rls-policies.md` - Security rules

---

## 💡 Key Principles

1. **Single Responsibility** - One service = one entity
2. **Consistent Patterns** - CRUD follows same structure
3. **Error Handling** - All errors bubble up with context
4. **Security First** - Always filter by user_id
5. **Testable** - Mock Supabase, test in isolation

---

**Purpose:** Centralized API and business logic
**Pattern:** 70% reusable CRUD template
**Owner:** Development team
**Updated:** As new entities are added

