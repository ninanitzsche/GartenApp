# 🧪 Testing Pattern

**Status:** Active
**Last Updated:** 2026-03-04
**Audience:** Developers
**Coverage Target:** 85%+ for services | 70%+ overall
**Related:** [docs/testing/TESTING-GUIDE.md](../testing/TESTING-GUIDE.md)

---

## 📌 What to Test

### Priority 1: Services (Test These First)
**Why:** Services are easier to test + most critical

```typescript
// src/__tests__/plantService.test.ts
import * as plantService from '../services/plantService';

describe('plantService', () => {
  it('should fetch all plants', async () => {
    const plants = await plantService.fetchPlants();
    expect(plants).toBeInstanceOf(Array);
  });

  it('should filter by search query', async () => {
    const plants = await plantService.fetchPlants({ searchQuery: 'tomato' });
    expect(plants.length).toBeGreaterThanOrEqual(0);
  });

  it('should create plant', async () => {
    const plant = await plantService.createPlant({ name: 'Test' });
    expect(plant.id).toBeDefined();
    // Cleanup
    await plantService.deletePlant(plant.id);
  });

  it('should update plant', async () => {
    const plant = await plantService.createPlant({ name: 'Original' });
    const updated = await plantService.updatePlant(plant.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
    // Cleanup
    await plantService.deletePlant(plant.id);
  });

  it('should delete plant', async () => {
    const plant = await plantService.createPlant({ name: 'ToDelete' });
    await plantService.deletePlant(plant.id);
    // Verify deleted
  });
});
```

### Priority 2: Hooks (Test Critical Paths)
```typescript
// src/__tests__/usePlants.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlants } from '../hooks/usePlants';

describe('usePlants', () => {
  it('should fetch plants on mount', async () => {
    const { result } = renderHook(() => usePlants());

    await waitFor(() => {
      expect(result.current.plants).toBeDefined();
    });
  });

  it('should handle filter', async () => {
    const { result } = renderHook(() => usePlants({ status: 'planted' }));

    await waitFor(() => {
      expect(result.current.plants).toBeDefined();
    });
  });
});
```

### Priority 3: Components (Test User Interactions)
```typescript
// src/__tests__/PlantCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PlantCard } from '../components/PlantCard';

describe('PlantCard', () => {
  it('should render plant name', () => {
    const plant = { id: '1', name: 'Tomato', type: 'vegetable' };
    render(<PlantCard plant={plant} />);

    expect(screen.getByText('Tomato')).toBeTruthy();
  });
});
```

---

## 🏗️ Jest Configuration

```javascript
// jest.config.js (already configured)
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**', // Skip types
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

---

## 📝 Service Test Template

```typescript
// Copy this template for new service tests
import * as service from '../services/myService';
import { MyEntity, MyEntityFormData } from '../types/myEntity';

describe('MyService', () => {
  const testData: MyEntityFormData = {
    name: 'Test Item',
    // Add other required fields
  };

  // Test CRUD operations in order
  let createdId: string;

  describe('CREATE', () => {
    it('should create entity', async () => {
      const result = await service.createMyEntity(testData);
      expect(result.id).toBeDefined();
      createdId = result.id;
    });

    it('should validate required fields', async () => {
      await expect(service.createMyEntity({})).rejects.toThrow();
    });
  });

  describe('READ', () => {
    it('should fetch all', async () => {
      const result = await service.fetchMyEntities();
      expect(result).toBeInstanceOf(Array);
    });

    it('should fetch with filters', async () => {
      const result = await service.fetchMyEntities({ searchQuery: 'test' });
      expect(result).toBeInstanceOf(Array);
    });

    it('should fetch single by ID', async () => {
      if (createdId) {
        const result = await service.fetchMyEntity(createdId);
        expect(result.id).toBe(createdId);
      }
    });
  });

  describe('UPDATE', () => {
    it('should update entity', async () => {
      if (createdId) {
        const updated = await service.updateMyEntity(createdId, { name: 'Updated' });
        expect(updated.name).toBe('Updated');
      }
    });
  });

  describe('DELETE', () => {
    it('should delete entity', async () => {
      if (createdId) {
        await service.deleteMyEntity(createdId);
        // Verify deleted (optional)
      }
    });
  });
});
```

---

## 🧪 Component Test Template

```typescript
// src/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeTruthy();
  });

  it('should handle user interaction', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.press(button);
    expect(screen.getByText('After Click')).toBeTruthy();
  });
});
```

---

## ⚙️ Running Tests

```bash
# Run all tests
npm test

# Run specific file
npm test plantService.test.ts

# Watch mode (re-run on change)
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 🎯 Coverage Targets

| Type | Target | Why |
|------|--------|-----|
| **Services** | 85%+ | Critical, easy to test |
| **Hooks** | 70%+ | Important, sometimes flaky |
| **Components** | 50-70% | Nice to have, UI changes often |
| **Utils** | 90%+ | Pure functions, easy to test |
| **Types** | Skip | No logic to test |

---

## ✅ Best Practices

### Do ✅
- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ One assertion per test (when possible)
- ✅ Clean up (delete test data)
- ✅ Mock external dependencies
- ✅ Test error cases

### Don't ❌
- ❌ Test implementation details
- ❌ Create interdependent tests
- ❌ Leave test data in database
- ❌ Skip error tests
- ❌ Test library code (React, Supabase)

---

## 🔄 Common Test Patterns

### Mock Supabase
```typescript
jest.mock('../services/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ id: '1', name: 'Test' }],
        error: null,
      }),
    }),
  },
}));
```

### Mock User Context
```typescript
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false,
  }),
}));
```

### Wait for Async
```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(result.current.data).toBeDefined();
});
```

---

## 📊 Coverage Command

```bash
npm run test:coverage
```

Generates report in `coverage/` folder:
- `lcov-report/index.html` - Open in browser for detailed view
- Shows line-by-line coverage

---

## 🔗 Related

- [docs/testing/TESTING-GUIDE.md](../testing/TESTING-GUIDE.md) - Full testing guide
- [docs/testing/TESTING-CHECKLIST.md](../testing/TESTING-CHECKLIST.md) - Manual testing
- [SERVICE-LAYER.md](SERVICE-LAYER.md) - What to test

---

## ✅ Pre-PR Checklist

Before submitting PR:
- [ ] New code has tests
- [ ] Coverage >= 70% (services: 85%)
- [ ] All tests passing locally
- [ ] Tests describe behavior (not implementation)
- [ ] Test data cleaned up
- [ ] No console errors/warnings

---

**Last Updated:** 2026-03-04
**Version:** 1.0
**Tool:** Jest + React Testing Library

