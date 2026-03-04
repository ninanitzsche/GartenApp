# 🏭 Service Layer Pattern

**Status:** Active
**Last Updated:** 2026-03-04
**Audience:** Developers
**Related:** [MEMORY.md](../../MEMORY.md), [docs/reference/FILE-STRUCTURE.md](../reference/FILE-STRUCTURE.md)

---

## 📌 When to Use This Pattern

Use the Service Layer pattern when:
- Creating a new CRUD entity (plants, tasks, shopping items, photos, etc.)
- You need to interact with Supabase database
- You want consistent error handling + filtering

**Code Reuse Rate:** 70% (template can be reused across all services)

---

## 🎯 Template Structure

```typescript
// src/services/[entity]Service.ts
import { supabase } from './supabase';
import { [Entity], [EntityFormData] } from '../types/[entity]';

export interface [EntityFilters] {
  searchQuery?: string;
  status?: string;
  // Add custom filters here
}

// 1. READ all (with optional filters)
export async function fetch[Entities](filters?: [EntityFilters]): Promise<[Entity][]> {
  try {
    let query = supabase
      .from('[entity_table]')
      .select('*');

    // Apply filters (example: search)
    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching [entities]:', error);
    throw error;
  }
}

// 2. CREATE
export async function create[Entity](data: [EntityFormData]): Promise<[Entity]> {
  try {
    const { data: result, error } = await supabase
      .from('[entity_table]')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating [entity]:', error);
    throw error;
  }
}

// 3. UPDATE
export async function update[Entity](id: string, data: Partial<[Entity]>): Promise<[Entity]> {
  try {
    const { data: result, error } = await supabase
      .from('[entity_table]')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error updating [entity]:', error);
    throw error;
  }
}

// 4. DELETE
export async function delete[Entity](id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('[entity_table]')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting [entity]:', error);
    throw error;
  }
}
```

---

## ✅ How to Implement (Step-by-Step)

### Step 1: Copy Existing Service
```bash
cp src/services/plantService.ts src/services/[myEntity]Service.ts
```

### Step 2: Update Names
Replace all:
- `Plant` → `[MyEntity]`
- `plant` → `[myEntity]`
- `plants` → `[myEntities]`
- `plants` (table) → `[my_entities]` (SQL table)

### Step 3: Create TypeScript Types
```typescript
// src/types/[myEntity].ts
export interface MyEntity {
  id: string;
  user_id: string;
  name: string;
  // Add other fields
  created_at: string;
  updated_at: string;
}

export type MyEntityFormData = Omit<MyEntity, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
```

### Step 4: Add Filters (Optional)
```typescript
export interface MyEntityFilters {
  searchQuery?: string;
  status?: string;
  // Add custom filters
}
```

### Step 5: Test Service
```typescript
// src/__tests__/[myEntity]Service.test.ts
import * as service from '../services/[myEntity]Service';

describe('[MyEntity]Service', () => {
  it('should fetch all', async () => {
    const data = await service.fetch[MyEntities]();
    expect(data).toBeDefined();
  });

  // Add more tests
});
```

---

## 🔍 Real Examples in Codebase

### Example 1: Plant Service (Basic CRUD)
**File:** `src/services/plantService.ts`
- ✅ Fetch with filters (search, status, location)
- ✅ Create plant
- ✅ Update plant
- ✅ Delete plant

### Example 2: Shopping Service (With Cost Tracking)
**File:** `src/services/shoppingService.ts`
- ✅ Same CRUD structure
- ✅ Added cost aggregation function
- ✅ Status filtering (purchased/unpurchased)

### Example 3: Photo Service (With File Upload)
**File:** `src/services/photoService.ts`
- ✅ Same CRUD + special functions
- ✅ Upload to Supabase Storage
- ✅ Image compression before upload
- ✅ Metadata handling

---

## ⚙️ Standard Features (Always Include)

### 1. Error Handling
```typescript
try {
  // Database operation
} catch (error) {
  console.error('Error:', error);
  throw error; // Re-throw so component can handle
}
```

### 2. Type Safety
```typescript
// Always return typed data
export async function fetchX(filters?: XFilters): Promise<X[]> {
  // ...
}
```

### 3. Optional Filtering
```typescript
// Support optional filters with AND/OR logic
if (filters?.searchQuery) {
  query = query.or(`name.ilike.%${filters.searchQuery}%`);
}
```

### 4. Single Table Per Service
**Rule:** One service = one database table (for clarity)

---

## 🧪 Testing Pattern

```typescript
// Template: Copy this for new service tests
describe('[Entity]Service', () => {
  // Test CRUD operations
  it('should fetch all [entities]', async () => {
    const data = await fetch[Entities]();
    expect(data).toBeInstanceOf(Array);
  });

  it('should fetch with filters', async () => {
    const data = await fetch[Entities]({ searchQuery: 'test' });
    expect(data).toBeDefined();
  });

  it('should create [entity]', async () => {
    const item = await create[Entity]({ name: 'Test' });
    expect(item.id).toBeDefined();
  });

  it('should update [entity]', async () => {
    const updated = await update[Entity](id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
  });

  it('should delete [entity]', async () => {
    await delete[Entity](id);
    // Verify deletion
  });
});
```

**Coverage Target:** 85%+ for services

---

## 🚀 Best Practices

### Do ✅
- [ ] Use services for ALL database operations (never direct queries in components)
- [ ] Throw errors (let components handle)
- [ ] Use TypeScript strict mode
- [ ] Add JSDoc comments for public functions
- [ ] Test CRUD operations
- [ ] Handle optional filters gracefully

### Don't ❌
- ❌ Database queries in React components
- ❌ Catch errors and silently fail (log + throw)
- ❌ Mix business logic with database code
- ❌ Create multiple services for same table
- ❌ Forget error handling

---

## 📊 Performance Optimization

### For Large Lists:
```typescript
// Use pagination
.range(offset, offset + limit)

// Or limit results
.limit(100)
```

### For Searches:
```typescript
// Debounce search in component
// Use ilike for case-insensitive search
```

### For Updates:
```typescript
// Use select() + .single() to get updated row
.update(data)
.select()
.single()
```

---

## 🔗 Related Patterns

- [Authentication Flow](AUTHENTICATION.md) - For user-scoped data
- [React Hooks](REACT-HOOKS.md) - How to call services in components
- [Testing](TESTING.md) - How to test services

---

## 💡 Common Mistakes

### ❌ Mistake 1: Not scoping to user_id
```typescript
// WRONG: Returns all data for all users!
let query = supabase.from('plants').select('*');

// RIGHT: Filter by current user
let query = supabase.from('plants').select('*').eq('user_id', user.id);
```

### ❌ Mistake 2: Not throwing errors
```typescript
// WRONG: Silent failure
const { data, error } = await query;
return data || []; // Hides error!

// RIGHT: Throw so component can handle
if (error) throw error;
return data;
```

### ❌ Mistake 3: Over-generalizing
```typescript
// WRONG: One mega service for everything
export async function fetchData(type: string, filters: any): Promise<any[]>

// RIGHT: Separate services by entity
export async function fetchPlants(): Promise<Plant[]>
export async function fetchTasks(): Promise<Task[]>
```

---

## ✅ Verification Checklist

Before submitting PR:
- [ ] Service follows template structure
- [ ] All CRUD functions implemented
- [ ] Error handling present
- [ ] TypeScript strict mode
- [ ] 85%+ test coverage
- [ ] No database queries in components
- [ ] Filters properly scoped (AND/OR logic)
- [ ] RLS compatible (user_id filtering)

---

**Last Updated:** 2026-03-04
**Version:** 1.0
**Used by:** plantService, shoppingService, photoService, taskService, seedDataService

