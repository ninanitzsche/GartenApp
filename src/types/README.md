# src/types/ - TypeScript Type Definitions

**Last Updated:** 2026-03-04
**Status:** Production code (100% strict mode)
**Purpose:** Centralized type definitions for database entities and API responses

---

## 🎯 What Goes Here?

Type definitions for:
- **Database entities** - Plant, Task, ShoppingItem, etc.
- **API responses** - Shape of data from Supabase
- **Component props** - Custom component interfaces
- **Utility types** - Reusable type helpers

---

## 📝 Type Definition Patterns

### Entity Types (Database Tables)

```typescript
// src/types/plants.ts

// Main entity type
export type Plant = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'seedling' | 'growing' | 'harvested' | 'archived';
  planted_date: string; // ISO date
  created_at: string;
  updated_at: string;
};

// For creating (omit id and timestamps)
export type CreatePlantInput = Omit<Plant, 'id' | 'created_at' | 'updated_at'>;

// For updating (all fields optional)
export type UpdatePlantInput = Partial<Omit<Plant, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// With related data (if querying with joins)
export type PlantWithCompanions = Plant & {
  companions: Plant[];
  tasks: Task[];
  photos: Photo[];
};
```

### API Response Types

```typescript
// src/types/api.ts

// Generic API response
export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
};

export type ApiError = {
  message: string;
  code: string;
  details?: Record<string, string>;
};
```

### Component Prop Types

```typescript
// src/types/components.ts

import { ViewProps } from 'react-native';
import { Plant } from './plants';

export type PlantCardProps = ViewProps & {
  plant: Plant;
  onPress?: () => void;
  onLongPress?: () => void;
  isLoading?: boolean;
};

export type LoadingSpinnerProps = {
  message?: string;
  size?: 'small' | 'large';
};
```

---

## 📂 Current Type Files

### auth.ts
**Types for authentication**

```typescript
export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};
```

### plants.ts
**Plant entity types**

```typescript
export type Plant = {
  id: string;
  user_id: string;
  name: string;
  // ... other fields
};
```

### tasks.ts, shopping.ts, etc.
**Other domain entity types**

---

## ✅ TypeScript Best Practices

### 1. Use `type` for Objects, `interface` for Classes
```typescript
// ✅ Good: type for data shapes
type Plant = { id: string; name: string };

// ✅ Also acceptable: interface with `readonly`
interface Plant {
  readonly id: string;
  readonly name: string;
}

// ❌ Avoid: mixing unnecessarily
```

### 2. Be Specific (No `any`)
```typescript
// ❌ DON'T
function updatePlant(id: any, updates: any): any { }

// ✅ DO
function updatePlant(id: string, updates: UpdatePlantInput): Promise<Plant> { }
```

### 3. Union Types for Status
```typescript
// ✅ GOOD: Limited options
type PlantStatus = 'seedling' | 'growing' | 'harvested' | 'archived';

// ❌ BAD: Too permissive
type PlantStatus = string;
```

### 4. Omit & Pick for Related Types
```typescript
// Create input type (omit auto-generated fields)
type CreatePlant = Omit<Plant, 'id' | 'created_at' | 'updated_at'>;

// Update input type (all fields optional)
type UpdatePlant = Partial<CreatePlant>;

// Partial response (only some fields)
type PlantPreview = Pick<Plant, 'id' | 'name' | 'status'>;
```

### 5. Readonly for Immutable Data
```typescript
// ✅ GOOD: Makes intent clear that this shouldn't be modified
type Plant = {
  readonly id: string;
  readonly name: string;
  readonly created_at: Date;
};
```

---

## 🔐 Database Type Alignment

**Always match database schema:**

Database schema:
```sql
CREATE TABLE plants (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('seedling', 'growing', 'harvested', 'archived')),
  planted_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

TypeScript type:
```typescript
export type Plant = {
  id: string; // UUID in DB → string in TS
  user_id: string;
  name: string;
  status: 'seedling' | 'growing' | 'harvested' | 'archived';
  planted_date: string | null; // DATE in DB → ISO string
  created_at: string;
  updated_at: string;
};
```

---

## 💡 Common Type Patterns

### Optional Fields
```typescript
type Plant = {
  id: string;
  name: string;
  description?: string; // Optional
  notes: string | null; // Can be null (from DB)
};
```

### Nested Types
```typescript
type PlantWithRelations = {
  plant: Plant;
  companions: Plant[];
  tasks: Task[];
};
```

### Union Types
```typescript
type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

// Usage:
if (result.success) {
  console.log(result.data); // TypeScript knows it's T
} else {
  console.log(result.error); // TypeScript knows it's string
}
```

---

## 🧪 Testing with Types

**Type checking in tests:**

```typescript
import { Plant } from '../types/plants';

describe('Plant type', () => {
  it('has required fields', () => {
    const plant: Plant = {
      id: '1',
      user_id: '123',
      name: 'Tomato',
      status: 'growing',
      planted_date: '2026-03-04',
      created_at: '2026-03-04T12:00:00Z',
      updated_at: '2026-03-04T12:00:00Z',
    };

    expect(plant.name).toBe('Tomato');
  });

  // Type checker prevents this:
  // const badPlant: Plant = { name: 'Tomato' }; // ❌ Error: missing required fields
});
```

---

## 🚀 Adding New Types

**When adding a new entity:**

1. **Create file:** `src/types/newEntity.ts`
2. **Define base type:**
   ```typescript
   export type NewEntity = {
     id: string;
     user_id: string;
     // ... other fields
     created_at: string;
     updated_at: string;
   };
   ```

3. **Define variants:**
   ```typescript
   export type CreateNewEntityInput = Omit<NewEntity, 'id' | 'created_at' | 'updated_at'>;
   export type UpdateNewEntityInput = Partial<CreateNewEntityInput>;
   ```

4. **Export from index (optional):**
   ```typescript
   // src/types/index.ts
   export * from './newEntity';
   ```

5. **Use in services:**
   ```typescript
   import { NewEntity, CreateNewEntityInput } from '../types/newEntity';

   export async function create(entity: CreateNewEntityInput): Promise<NewEntity> {
     // ...
   }
   ```

---

## 📊 Type Coverage

**Target:** 100% of function parameters and returns have explicit types

```typescript
// ❌ Missing types
function fetchPlants() { }
const plant = { name: 'Tomato' };

// ✅ Complete types
function fetchPlants(): Promise<Plant[]> { }
const plant: Plant = { ... };
```

---

## 🔗 Related Files

- **Services:** `src/services/` - Import and use these types
- **Screens:** `src/screens/` - Type component props and state
- **Components:** `src/components/` - Define component prop types
- **Database:** `docs/database/database-guide.md` - Source of entity structure

---

## ⚠️ Common Mistakes

❌ **Using `any`:**
```typescript
// DON'T
function processPlant(plant: any) { }
```

✅ **Use proper types:**
```typescript
// DO
function processPlant(plant: Plant) { }
```

---

❌ **Misaligned with database:**
```typescript
// Database has status = 'active' | 'inactive'
// TS type has status: 'on' | 'off' ❌ Mismatch
```

✅ **Match database exactly:**
```typescript
type Status = 'active' | 'inactive'; // Matches database
```

---

**Purpose:** Centralized type definitions
**Coverage:** 100% of database entities and API responses
**Owner:** Development team

