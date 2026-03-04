# src/hooks/ - Custom React Hooks

**Last Updated:** 2026-03-04
**Status:** Production code
**Purpose:** Reusable logic hooks that encapsulate stateful behavior

---

## 🎯 What is a Custom Hook?

A **custom hook** is a JavaScript function that:
- Uses other hooks (useState, useEffect, useContext, etc.)
- Contains reusable stateful logic
- Can be used in multiple components
- Starts with `use` prefix (e.g., `useAuth`, `usePlants`)

**Pattern:**
```
Component → Custom Hook → Built-in Hook (useState, useEffect, etc.)
```

---

## 🏗️ Hook Anatomy

```typescript
// src/hooks/useFetch.ts

import { useState, useEffect } from 'react';

type UseFetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const result = await fetchFn();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false; // Cleanup
    };
  }, dependencies);

  return { data, loading, error };
}
```

---

## 📚 Common Hook Patterns

### 1. Data Fetching Hook

```typescript
// src/hooks/usePlants.ts

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { plantService } from '../services/plantService';
import { Plant } from '../types/plants';

export function usePlants() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlants = async () => {
    try {
      setLoading(true);
      const data = await plantService.fetchAll();
      setPlants(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addPlant = async (plant: Omit<Plant, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newPlant = await plantService.create(plant);
      setPlants([...plants, newPlant]);
      return newPlant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plant');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      loadPlants();
    }
  }, [user?.id]);

  return {
    plants,
    loading,
    error,
    loadPlants,
    addPlant,
  };
}
```

**Usage in component:**
```typescript
function PlantsScreen() {
  const { plants, loading, error, loadPlants } = usePlants();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadPlants} />;

  return <FlatList data={plants} renderItem={...} />;
}
```

### 2. Form Hook

```typescript
// src/hooks/useForm.ts

import { useState, useCallback } from 'react';

type FormState<T> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
};

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void> | void
) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    dirty: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      dirty: true,
    }));
  }, []);

  const handleBlur = useCallback((field: keyof T) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [field]: true },
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(state.values);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [state.values, onSubmit]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    dirty: state.dirty,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
```

**Usage in component:**
```typescript
function AddPlantScreen() {
  const form = useForm(
    { name: '', description: '' },
    async (values) => {
      await plantService.create(values);
    }
  );

  return (
    <View>
      <TextInput
        value={form.values.name}
        onChangeText={(v) => form.handleChange('name', v)}
      />
      <Button title="Save" onPress={form.handleSubmit} disabled={form.isSubmitting} />
    </View>
  );
}
```

### 3. Debounced Value Hook

```typescript
// src/hooks/useDebouncedValue.ts

import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}
```

**Usage: Optimize search input:**
```typescript
function SearchPlants() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // This effect only runs when user stops typing for 300ms
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchPlants(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <TextInput
      value={searchTerm}
      onChangeText={setSearchTerm}
      placeholder="Search plants..."
    />
  );
}
```

---

## ✅ Hook Best Practices

### 1. Return Consistent Shape
```typescript
// ✅ GOOD: Always returns same shape
export function useMyHook() {
  return {
    data: null,
    loading: true,
    error: null,
  };
}

// ❌ BAD: Different returns based on conditions
export function useMyHook() {
  if (someCondition) return { data: null };
  return { data: null, loading: true };
}
```

### 2. Extract Complex Logic
```typescript
// ✅ GOOD: Component is simple, logic in hook
function Component() {
  const { data, loading, error } = useComplexLogic();
  return <Text>{data}</Text>;
}

// ❌ BAD: Complex logic in component
function Component() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // ... 20 lines of complex logic
}
```

### 3. Document Dependencies
```typescript
// ✅ GOOD: Clear what triggers re-runs
useEffect(() => {
  loadData(userId);
}, [userId]); // Dependency: userId

// ❌ BAD: Missing or wrong dependencies
useEffect(() => {
  loadData(userId);
}, []); // ❌ WRONG: userId missing, stale data!
```

---

## 🧪 Testing Hooks

```typescript
// src/__tests__/hooks/usePlants.test.ts

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePlants } from '../../hooks/usePlants';

// Mock service
jest.mock('../../services/plantService', () => ({
  fetchAll: jest.fn(),
}));

describe('usePlants', () => {
  it('fetches plants on mount', async () => {
    const { result } = renderHook(() => usePlants());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('adds plant to list', async () => {
    const { result } = renderHook(() => usePlants());

    const newPlant = { name: 'Tomato', ... };

    await act(async () => {
      await result.current.addPlant(newPlant);
    });

    expect(result.current.plants).toContainEqual(
      expect.objectContaining({ name: 'Tomato' })
    );
  });
});
```

---

## 📋 Hook Naming Convention

**Hooks always start with `use`:**

- `useAuth` - Authentication state
- `usePlants` - Plants data
- `useForm` - Form state
- `useFetch` - Generic fetch
- `useDebounce` - Debounce value
- `useMemo` - Memoized value
- `useCallback` - Memoized callback

---

## 🚀 Creating a New Hook

**Example: Create useSearchPlants**

1. **Create file:** `src/hooks/useSearchPlants.ts`

2. **Implement hook:**
   ```typescript
   export function useSearchPlants(query: string) {
     const [results, setResults] = useState<Plant[]>([]);
     const [loading, setLoading] = useState(false);
     const debouncedQuery = useDebouncedValue(query, 300);

     useEffect(() => {
       if (debouncedQuery) {
         search();
       } else {
         setResults([]);
       }
     }, [debouncedQuery]);

     const search = async () => {
       setLoading(true);
       const data = await plantService.search(debouncedQuery);
       setResults(data);
       setLoading(false);
     };

     return { results, loading };
   }
   ```

3. **Create tests:** `src/__tests__/hooks/useSearchPlants.test.ts`

4. **Use in component:**
   ```typescript
   const { results, loading } = useSearchPlants(searchTerm);
   ```

---

## 🔗 Related Files

- **Contexts:** `src/contexts/` - Often use hooks to provide context
- **Services:** `src/services/` - Hooks call services
- **Tests:** `src/__tests__/hooks/` - Test hooks in isolation
- **Components:** `src/components/` - Use hooks in components

---

## 📊 Hook Metrics

- **Reusability:** Used in 2+ components
- **Lines:** 30-100 lines (keep focused)
- **Dependencies:** Explicit and minimal
- **Side effects:** Only in useEffect
- **Tests:** 80%+ coverage target

---

## ⚠️ Common Mistakes

❌ **Hooks without clear name:**
```typescript
// DON'T
export function myLogic() { }

// DO
export function useMyLogic() { }
```

---

❌ **Missing dependency array:**
```typescript
// DON'T: Runs every render
useEffect(() => {
  loadData();
}); // No dependency array!

// DO
useEffect(() => {
  loadData();
}, [userId]); // Run when userId changes
```

---

**Purpose:** Reusable stateful logic
**Owner:** Development team
**Pattern:** Custom hooks for common behaviors

