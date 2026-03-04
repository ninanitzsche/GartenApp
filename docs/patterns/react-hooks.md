# 🎣 React Hooks Pattern

**Status:** Active
**Last Updated:** 2026-03-04
**Audience:** Developers
**Related:** [SERVICE-LAYER.md](SERVICE-LAYER.md), [AUTHENTICATION.md](AUTHENTICATION.md)

---

## 📌 Custom Hooks (Reusable)

Gartenplaner uses custom hooks to encapsulate data fetching + state management.

---

## 🏗️ Pattern: Fetch Hook

### Template

```typescript
// src/hooks/usePlants.ts
import { useState, useEffect } from 'react';
import { Plant, PlantFilters } from '../types/plant';
import { fetchPlants } from '../services/plantService';

export function usePlants(filters?: PlantFilters) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetch() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPlants(filters);
        if (mounted) setPlants(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetch();

    return () => {
      mounted = false; // Cleanup on unmount
    };
  }, [filters]); // Re-fetch when filters change

  return { plants, loading, error };
}
```

### Usage in Component

```typescript
// src/screens/PlantsScreen.tsx
export function PlantsScreen() {
  const [filters, setFilters] = useState<PlantFilters>({});
  const { plants, loading, error } = usePlants(filters);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <FlatList
      data={plants}
      renderItem={({ item }) => <PlantCard plant={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

---

## 🎯 useEffect Rules (Critical)

### Rule 1: Dependency Array
```typescript
// Runs once on mount
useEffect(() => {
  fetchData();
}, []); // Empty array = mount only

// Runs every time 'user' changes
useEffect(() => {
  if (user) fetchData();
}, [user]); // Include dependencies!

// Runs every render (AVOID)
useEffect(() => {
  fetchData();
}); // No dependency array = BAD!
```

### Rule 2: Cleanup Function
```typescript
useEffect(() => {
  let mounted = true;

  async function fetch() {
    const data = await api.call();
    if (mounted) setState(data); // Only update if still mounted
  }

  fetch();

  return () => {
    mounted = false; // Cleanup
  };
}, []);
```

### Rule 3: Don't Call Hooks in Conditions
```typescript
// WRONG: Hook inside if statement
if (user) {
  const { data } = usePlants(); // ❌ NOT ALLOWED
}

// RIGHT: Hook at top level
const { data } = usePlants();
if (user && data) {
  // use data
}
```

---

## 🔍 Common Patterns

### Pattern 1: Fetch on Load + Refetch
```typescript
export function usePlants(shouldFetch: boolean = true) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shouldFetch) return;

    // Fetch logic
    async function fetch() {
      const data = await fetchPlants();
      setPlants(data);
      setLoading(false);
    }

    fetch();
  }, [shouldFetch]);

  const refetch = async () => {
    setLoading(true);
    const data = await fetchPlants();
    setPlants(data);
    setLoading(false);
  };

  return { plants, loading, refetch };
}
```

### Pattern 2: Search with Debounce
```typescript
import { useDeferredValue } from 'react';

export function usePlantsSearch(query: string) {
  // Defer updates for 300ms
  const deferredQuery = useDeferredValue(query);
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    if (!deferredQuery) return;

    const fetch = async () => {
      const data = await fetchPlants({ searchQuery: deferredQuery });
      setPlants(data);
    };

    fetch();
  }, [deferredQuery]);

  return plants;
}

// Usage
function SearchScreen() {
  const [query, setQuery] = useState('');
  const results = usePlantsSearch(query);

  return (
    <View>
      <TextInput value={query} onChangeText={setQuery} />
      <FlatList data={results} renderItem={...} />
    </View>
  );
}
```

### Pattern 3: Mutation Hook
```typescript
export function usePlantMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: PlantFormData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createPlant(data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

// Usage
function CreatePlantForm() {
  const { create, loading, error } = usePlantMutation();

  const handleSubmit = async (formData: PlantFormData) => {
    try {
      await create(formData);
      Alert.alert('Success', 'Plant created');
    } catch {
      // Error already in hook
    }
  };

  return <Form onSubmit={handleSubmit} />;
}
```

---

## 🎣 Built-in Hooks You're Using

| Hook | Purpose | Example |
|------|---------|---------|
| **useState** | Local state | `const [count, setCount] = useState(0)` |
| **useEffect** | Side effects | Fetch data on mount |
| **useCallback** | Memoize function | Prevent unnecessary re-renders |
| **useMemo** | Memoize value | Expensive calculations |
| **useContext** | Global state | `const { user } = useAuth()` |
| **useRef** | Mutable object | Store timeout ID |

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Stale Closures
```typescript
// WRONG: data is stale
useEffect(() => {
  const timer = setTimeout(() => {
    console.log(data); // OLD value!
  }, 1000);
  return () => clearTimeout(timer);
}, []); // Missing 'data' dependency

// RIGHT: include dependency
useEffect(() => {
  const timer = setTimeout(() => {
    console.log(data); // Current value
  }, 1000);
  return () => clearTimeout(timer);
}, [data]);
```

### ❌ Mistake 2: Memory Leak
```typescript
// WRONG: No cleanup
useEffect(() => {
  const subscription = api.subscribe(handleUpdate);
  // Missing unsubscribe!
}, []);

// RIGHT: Cleanup
useEffect(() => {
  const subscription = api.subscribe(handleUpdate);
  return () => subscription.unsubscribe();
}, []);
```

### ❌ Mistake 3: Infinite Loop
```typescript
// WRONG: Creates new array every render
const items = [1, 2, 3]; // New array!
useEffect(() => {
  fetch();
}, [items]); // Re-runs every time (infinite)

// RIGHT: Memoize array
const items = useMemo(() => [1, 2, 3], []);
useEffect(() => {
  fetch();
}, [items]);
```

---

## 📊 Hook Performance

### useCallback (Prevent Re-renders)
```typescript
// Without useCallback: New function every render
const handlePress = () => { /* ... */ };

// With useCallback: Reuse if dependencies don't change
const handlePress = useCallback(() => {
  /* ... */
}, [dependency]);
```

### useMemo (Cache Expensive Computations)
```typescript
// WRONG: Re-creates every render
const filtered = plants.filter(p => p.status === 'planted');

// RIGHT: Cache if dependencies don't change
const filtered = useMemo(
  () => plants.filter(p => p.status === 'planted'),
  [plants]
);
```

---

## 🧪 Testing Hooks

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlants } from '../hooks/usePlants';

describe('usePlants', () => {
  it('should fetch data on mount', async () => {
    const { result } = renderHook(() => usePlants());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.plants).toBeDefined();
    });
  });

  it('should update when filters change', async () => {
    const { result, rerender } = renderHook(
      ({ filters }) => usePlants(filters),
      { initialProps: { filters: {} } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      rerender({ filters: { status: 'planted' } });
    });

    expect(result.current.loading).toBe(true);
  });
});
```

---

## ✅ Checklist

When writing a custom hook:
- [ ] Returns an object or array of values
- [ ] Uses only React hooks (useState, useEffect, etc.)
- [ ] Has proper dependency array
- [ ] Cleans up resources (subscriptions, timers)
- [ ] Doesn't call other hooks conditionally
- [ ] Has clear naming (`use*`)
- [ ] Is tested

---

## 🔗 Related

- [SERVICE-LAYER.md](SERVICE-LAYER.md) - Services called by hooks
- [AUTHENTICATION.md](AUTHENTICATION.md) - useAuth hook
- [TESTING.md](TESTING.md) - How to test hooks

---

**Last Updated:** 2026-03-04
**Version:** 1.0
**Reference:** [React Hooks Docs](https://react.dev/reference/react)

