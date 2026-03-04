# src/components/ - Reusable UI Components

**Last Updated:** 2026-03-04
**Status:** Production code
**Purpose:** Small, reusable UI components used across screens

---

## 🎯 What's a Component?

A **component** is a reusable piece of UI:

**Characteristics:**
- Takes props as input
- Renders UI
- No navigation logic
- No screen-level state
- Can be used in multiple screens

**vs Screen:**
- Screen = Full page (handles navigation, state, data)
- Component = Small piece (displays data, handles local interactions)

---

## 🏗️ Component Architecture

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plant } from '../types/plants';

export type PlantCardProps = {
  plant: Plant;
  onPress?: () => void;
  isLoading?: boolean;
};

export function PlantCard({ plant, onPress, isLoading }: PlantCardProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={isLoading}>
      <View>
        <Text>{plant.name}</Text>
        <Text>{plant.status}</Text>
      </View>
    </TouchableOpacity>
  );
}
```

---

## 📚 Common Component Types

### State Display Components
**Purpose:** Show data without interaction

```typescript
// EmptyState - Show when no data exists
function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon || '📭'}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

// LoadingSpinner - Show while loading
function LoadingSpinner({ message, size }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#4CAF50" />
      {message && <Text>{message}</Text>}
    </View>
  );
}

// ErrorMessage - Show error state
function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.error}>❌ {message}</Text>
      {onRetry && <Button title="Retry" onPress={onRetry} />}
    </View>
  );
}
```

### Data Display Components
**Purpose:** Display data in formatted way

```typescript
// PlantCard - Display plant summary
function PlantCard({ plant, onPress }: PlantCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <Text style={styles.title}>{plant.name}</Text>
        <Text style={styles.subtitle}>{plant.status}</Text>
      </View>
    </TouchableOpacity>
  );
}
```

### Input Components
**Purpose:** Handle user input

```typescript
// TextInput with validation
function ValidatedInput({
  label,
  value,
  onChangeText,
  error
}: ValidatedInputProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, error && styles.inputError]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
```

---

## ✅ Component Best Practices

### 1. Props Interface
```typescript
// ✅ GOOD: Clear prop types
export type MyComponentProps = {
  data: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function MyComponent({ data, onPress, disabled }: MyComponentProps) {
  // ...
}

// ❌ BAD: Unclear props
export function MyComponent(props: any) {
  // ...
}
```

### 2. Memoization for Performance
```typescript
// ✅ GOOD: Memoize to prevent re-renders
const PlantCard = React.memo(function PlantCard({ plant, onPress }: PlantCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{plant.name}</Text>
    </TouchableOpacity>
  );
});

// ✅ Also good: Use useCallback for callbacks
const handlePress = useCallback(() => {
  onPress?.();
}, [onPress]);
```

### 3. Composition Over Props
```typescript
// ✅ GOOD: Use children for flexibility
type ListProps = {
  data: any[];
  renderItem: (item: any) => React.ReactNode;
  loading?: boolean;
  empty?: React.ReactNode;
};

function List({ data, renderItem, loading, empty }: ListProps) {
  if (loading) return <LoadingSpinner />;
  if (data.length === 0) return empty || <EmptyState />;
  return <FlatList data={data} renderItem={renderItem} />;
}

// ✅ Usage: Flexible
<List
  data={plants}
  renderItem={(plant) => <PlantCard plant={plant} />}
  empty={<Text>No plants. Create one!</Text>}
/>
```

### 4. Style Consistency
```typescript
// ✅ GOOD: Use theme/design system
import { colors, spacing, typography } from '../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
});

// ❌ BAD: Hardcoded colors/sizes
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    padding: 16,
  },
});
```

---

## 🧪 Testing Components

```typescript
// src/__tests__/components/PlantCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react-native';
import { PlantCard } from '../../components/PlantCard';

describe('PlantCard', () => {
  const mockPlant = {
    id: '1',
    name: 'Tomato',
    status: 'growing',
    user_id: '123',
    created_at: '2026-03-04T12:00:00Z',
    updated_at: '2026-03-04T12:00:00Z',
  };

  it('renders plant name', () => {
    render(<PlantCard plant={mockPlant} />);
    expect(screen.getByText('Tomato')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<PlantCard plant={mockPlant} onPress={onPress} />);

    fireEvent.press(screen.getByText('Tomato'));
    expect(onPress).toHaveBeenCalled();
  });

  it('disables when isLoading is true', () => {
    const { getByTestId } = render(
      <PlantCard plant={mockPlant} isLoading={true} />
    );

    expect(getByTestId('plant-card').props.disabled).toBe(true);
  });
});
```

---

## 📁 Component Categories

### Display Components
- `EmptyState.tsx` - No data message
- `LoadingSpinner.tsx` - Loading indicator
- `ErrorMessage.tsx` - Error display
- `Badge.tsx` - Status labels
- `Card.tsx` - Generic card wrapper

### Entity Components
- `PlantCard.tsx` - Plant display
- `TaskItem.tsx` - Task display
- `ShoppingItem.tsx` - Shopping item display

### Input Components
- `TextInputField.tsx` - Text input with validation
- `DatePicker.tsx` - Date selection
- `Checkbox.tsx` - Checkbox input

### Layout Components
- `Header.tsx` - Screen header
- `Footer.tsx` - Screen footer
- `Divider.tsx` - Visual separator

---

## 🚀 Creating a New Component

**Step-by-step: Create PlantCard**

1. **Create file:** `src/components/PlantCard.tsx`

2. **Define props interface:**
   ```typescript
   export type PlantCardProps = {
     plant: Plant;
     onPress?: () => void;
     isLoading?: boolean;
   };
   ```

3. **Implement component:**
   ```typescript
   export function PlantCard({ plant, onPress, isLoading }: PlantCardProps) {
     return (
       <TouchableOpacity onPress={onPress} disabled={isLoading}>
         <View style={styles.card}>
           <Text>{plant.name}</Text>
         </View>
       </TouchableOpacity>
     );
   }
   ```

4. **Add styles:**
   ```typescript
   const styles = StyleSheet.create({
     card: {
       backgroundColor: colors.background,
       padding: spacing.md,
       borderRadius: 8,
     },
   });
   ```

5. **Create tests:** `src/__tests__/components/PlantCard.test.tsx`

6. **Use in screens:**
   ```typescript
   <PlantCard plant={plant} onPress={() => navigation.navigate('Detail', { id: plant.id })} />
   ```

---

## 🎨 Design System Integration

**Use theme for consistency:**

```typescript
import { colors, spacing, typography } from '../theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md, // 16px
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.sizes.lg, // 18px
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
});
```

---

## ⚠️ Common Mistakes

❌ **Component with side effects:**
```typescript
// DON'T: Fetch in component
function PlantList() {
  const [plants, setPlants] = useState([]);

  // This fetches every time component renders!
  plantService.fetchAll().then(setPlants);

  return <FlatList data={plants} ... />;
}
```

✅ **Side effects in screens:**
```typescript
// DO: Fetch in screen with useEffect
function PlantsScreen() {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    plantService.fetchAll().then(setPlants);
  }, []); // Run once

  return <PlantList plants={plants} />;
}

// Component just displays
function PlantList({ plants }: PlantListProps) {
  return <FlatList data={plants} ... />;
}
```

---

❌ **Component with navigation:**
```typescript
// DON'T: Navigation in component
function PlantCard({ plant }: PlantCardProps) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Detail')}>
      <Text>{plant.name}</Text>
    </TouchableOpacity>
  );
}
```

✅ **Pass navigation as callback:**
```typescript
// DO: Let parent handle navigation
function PlantCard({ plant, onPress }: PlantCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{plant.name}</Text>
    </TouchableOpacity>
  );
}

// Screen handles navigation
<PlantCard plant={plant} onPress={() => navigation.navigate('Detail')} />
```

---

## 🔗 Related Files

- **Screens:** `src/screens/` - Use components here
- **Theme:** `src/theme/` - Design system (colors, spacing)
- **Tests:** `src/__tests__/components/` - Component tests
- **Types:** `src/types/` - Define component prop types

---

## 📊 Component Metrics

- **Reusability:** Used in 2+ screens
- **Props:** 2-5 props (keep simple)
- **Lines:** 50-200 lines (keep focused)
- **Tests:** 80%+ coverage target

---

**Purpose:** Reusable, focused UI components
**Owner:** Development team
**Pattern:** Props-based, stateless (mostly)

