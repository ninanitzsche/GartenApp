# Gartenplaner App - Code Conventions

## TypeScript

### Type Definitions
```typescript
// Types in src/types/ directory
export interface Plant {
  id: string;
  name: string;
  // ...
}

// Form data types for create/update
export interface PlantFormData {
  name: string;
  // ...
}

// Constants exported from type files
export const PLANT_STATUSES = [
  { label: 'Geplant', value: 'geplant' },
  // ...
];
```

### Strict Mode
- TypeScript strict mode enabled (`tsconfig.json`)
- No implicit any
- Strict null checks

## React/React Native

### Component Structure
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import Colors from '../theme/colors';

interface Props {
  title: string;
}

export default function MyComponent({ title }: Props) {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
```

### Custom Hooks
- Use `useAuth()` hook for auth context access
- Components throw error if context not available

### Navigation Types
```typescript
// src/types/navigation.ts
export type TabParamList = {
  Home: undefined;
  Plants: undefined;
  // ...
};
```

## Styling

### Colors (`src/theme/colors.ts`)
- Use Colors constants, not hardcoded colors
- Permaculture-inspired palette (greens, browns, accents)

### StyleSheet
- Use `StyleSheet.create()` for static styles
- Prefer inline styles for dynamic values

## Services

### Pattern
```typescript
// All services follow this pattern
export async function fetchItems(filters?: ItemFilters): Promise<Item[]> {
  let query = supabase.from('items').select('*');
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
  
  return data || [];
}
```

### Error Handling
- Log errors with console.error
- Throw errors for callers to handle
- Return null for "not found" scenarios

## Testing

### Test Structure
```typescript
describe('serviceName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something', async () => {
      // Arrange
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      
      // Act
      const result = await service.method(params);
      
      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

### Mock Pattern
- Mock Supabase client in `__tests__/mocks/supabaseMock.ts`
- Use `jest.mock()` for module-level mocking
- Clear mocks in `beforeEach`

## Git Conventions

### Commit Messages
- Feature: `feat: add garden bed map view`
- Fix: `fix: correct plant status flow`
- Test: `test: add plantService tests`
- Docs: `docs: update README`

### Branch Naming
- `feature/garden-map`
- `fix/plant-status`
- `sprint-7/garden-feature`

## File Organization

1. Imports (external, then internal)
2. Types/interfaces
3. Constants
4. Component/function definition
5. Exports

### Import Order
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { Plant } from '../types/plant';
import { plantService } from '../services/plantService';
```
