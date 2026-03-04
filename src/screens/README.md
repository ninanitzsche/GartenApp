# src/screens/ - Full-Screen Components

**Last Updated:** 2026-03-04
**Status:** Production code
**Purpose:** Main screen/page components (routes)

---

## 📱 What is a Screen?

A "screen" is a **full-screen UI component** that represents a major navigation route.

**Screens in Gartenplaner:**
- LoginScreen, RegisterScreen, ForgotPasswordScreen
- HomeScreen (dashboard)
- AddPlantScreen, EditPlantScreen, PlantDetailScreen
- AddShoppingItemScreen, EditShoppingItemScreen, ShoppingListScreen
- MoreMenuScreen (settings, profile)
- ChangePasswordScreen

---

## 🏗️ Screen Architecture

```
Screen (e.g., HomeScreen.tsx)
├── State Management
│   ├── Local state (useState) - form inputs, UI state
│   └── Custom hooks - useAuth, usePlants, useTasks
├── Data Fetching
│   ├── Call services (plantService.fetchAll)
│   └── Handle loading/error states
├── UI Layout
│   ├── Use imported components (EmptyState, LoadingSpinner)
│   └── Display data
└── Navigation
    └── Navigate to other screens (navigation.navigate)
```

---

## 📝 Screen Template

```typescript
import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { plantService } from '../services/plantService';
import { Plant } from '../types/plants';

export function PlantsListScreen({ navigation }) {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      setLoading(true);
      const data = await plantService.fetchAll();
      setPlants(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {plants.length === 0 && <EmptyState message="No plants yet" />}
      <FlatList
        data={plants}
        renderItem={({ item }) => (
          <PlantCard
            plant={item}
            onPress={() => navigation.navigate('PlantDetail', { id: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
```

---

## 🔄 Common Screen Patterns

### Pattern 1: Data Fetching + Display

```typescript
// 1. Use custom hook to fetch data
const [data, loading, error] = usePlants();

// 2. Show loading state
if (loading) return <LoadingSpinner />;

// 3. Show error state
if (error) return <ErrorMessage message={error} />;

// 4. Show empty state
if (data.length === 0) return <EmptyState />;

// 5. Display data
return <FlatList data={data} renderItem={...} />;
```

### Pattern 2: Form + Submission

```typescript
// 1. Local state for form
const [form, setForm] = useState({ name: '', description: '' });
const [saving, setSaving] = useState(false);

// 2. Handle form change
const handleChange = (field: string, value: string) => {
  setForm({ ...form, [field]: value });
};

// 3. Submit handler
const handleSubmit = async () => {
  try {
    setSaving(true);
    const result = await plantService.create(form);
    navigation.goBack(); // Return to previous screen
  } catch (err) {
    Alert.alert('Error', err.message);
  } finally {
    setSaving(false);
  }
};

// 4. Render form
return (
  <View>
    <TextInput value={form.name} onChangeText={(v) => handleChange('name', v)} />
    <Button title="Save" onPress={handleSubmit} disabled={saving} />
  </View>
);
```

### Pattern 3: Authentication Check

```typescript
// Always use useAuth to get current user
const { user, loading } = useAuth();

// Redirect if not authenticated
useEffect(() => {
  if (!loading && !user) {
    navigation.replace('Login'); // Use replace to prevent back button
  }
}, [user, loading, navigation]);

// Render only if user exists
if (!user) return null;
```

---

## 🎨 UI Components

**Available Components** (import from src/components/):
- `LoadingSpinner` - Show while loading
- `EmptyState` - Show when no data
- `ErrorMessage` - Show error state
- `PlantCard` - Display plant item
- Plus: Standard React Native components (View, FlatList, TextInput, etc.)

---

## 🧭 Navigation

**How to navigate:**
```typescript
// Navigate to another screen
navigation.navigate('ScreenName', { param: value });

// Go back to previous screen
navigation.goBack();

// Replace current screen (remove from history)
navigation.replace('ScreenName');

// Reset to home
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }]
});
```

**Access route params:**
```typescript
function DetailScreen({ route }) {
  const { id } = route.params;
  // Use id to fetch specific item
}
```

---

## 🔐 Security Checklist

- ✅ Always use `useAuth()` to check logged-in user
- ✅ Never store passwords or tokens locally
- ✅ Always include `user_id` in database queries (RLS protection)
- ✅ Validate inputs before sending to backend
- ✅ Show error messages without exposing system details

---

## 🧪 Testing Screens

**Basic screen test pattern:**
```typescript
import { render, screen, waitFor } from '@testing-library/react-native';
import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  it('shows loading spinner initially', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('displays plants when loaded', async () => {
    // Mock service
    jest.mock('../services/plantService', () => ({
      fetchAll: jest.fn().mockResolvedValue([...mockPlants])
    }));

    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('Plant 1')).toBeTruthy();
    });
  });
});
```

---

## ⚠️ Common Mistakes

❌ **Fetching in render:**
```typescript
// DON'T: This runs every render
render(<View>{plantService.fetchAll()}</View>);
```

✅ **Correct: Use useEffect:**
```typescript
useEffect(() => {
  loadPlants();
}, []); // Empty array = run once on mount
```

---

❌ **Forgetting user_id filter:**
```typescript
// DON'T: Returns other users' data (RLS fails)
const plants = await plantService.fetchAll(); // No user filter
```

✅ **Correct: Filter by user:**
```typescript
// Service always includes user_id filter
const plants = await plantService.fetchAll(); // Filtered in service
```

---

## 🚀 Development Workflow

**Adding a new screen:**

1. **Create file:** `MyNewScreen.tsx`
2. **Copy template** from this section
3. **Define component:**
   - State management (useState)
   - Data fetching (useEffect)
   - Error/loading UI
4. **Register in navigation:** `navigation/index.tsx`
5. **Add tests:** `src/__tests__/screens/MyNewScreen.test.tsx`

**Example:** Adding a "Plant Details" screen
1. Create `PlantDetailScreen.tsx`
2. Get `id` from `route.params`
3. Fetch plant data: `plantService.fetchById(id)`
4. Display plant details
5. Add edit/delete buttons with navigation

---

## 🔗 Related Files

- **Components:** `src/components/README.md` (reusable UI)
- **Services:** `src/services/README.md` (fetch data)
- **Navigation:** `src/navigation/README.md` (routing)
- **Architecture:** `docs/bmad/bmad-03-architecture.md` (full design)

---

**Purpose:** Main application screens/routes
**Owner:** Development team
**Pattern:** Service + Hook + Component

