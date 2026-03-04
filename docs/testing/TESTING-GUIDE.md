# Jest Testing Guide - Gartenplaner App

## Overview

This document describes the testing infrastructure and patterns for the Gartenplaner app. All service-level functionality is covered with comprehensive unit tests.

**Current Status:**
- ✅ 120+ unit tests
- ✅ 79%+ coverage for services folder
- ✅ 100% function coverage for all tested services
- ✅ All happy paths and error paths tested

---

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- plantService.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should fetch"
```

---

## Test Structure

### Directory Layout
```
src/
├── __tests__/
│   ├── mocks/
│   │   ├── supabaseMock.ts       # Supabase client mock
│   │   ├── fileMock.ts           # Asset mock
│   │   └── styleMock.ts          # CSS mock
│   ├── utils/
│   │   └── testHelpers.ts        # Test utilities
│   ├── setup.ts                  # Jest setup file
│   ├── plantService.test.ts      # Plant service tests (40+ tests)
│   ├── shoppingService.test.ts   # Shopping service tests (40+ tests)
│   ├── seedDataService.test.ts   # Seed data service tests (30+ tests)
│   └── AuthContext.test.tsx      # Auth context tests (6 tests)
├── services/
│   ├── plantService.ts
│   ├── shoppingService.ts
│   └── seedDataService.ts
└── ...
```

### Configuration Files
- `jest.config.js` - Jest configuration
- `.babelrc` - Babel configuration for TypeScript transpilation
- `src/__tests__/setup.ts` - Test environment setup

---

## Test Coverage Report

### Services Coverage
| Service | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| plantService.ts | 83.6% | 84.09% | 100% | 83.6% |
| shoppingService.ts | 92% | 92.85% | 100% | 92% |
| seedDataService.ts | 96.29% | 76.92% | 100% | 96.22% |
| **Overall Services** | **79.25%** | **71.55%** | **88.46%** | **79.14%** |

### Coverage Thresholds
- Global minimum: 70% statements, 60% branches, 70% functions
- Services minimum: 79% statements, 70% branches, 85% functions
- All current coverage exceeds thresholds ✅

---

## Writing New Tests

### Test Template

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as myService from '../services/myService';
import { supabase } from '../services/supabase';
import { createMockQueryBuilder, mockUser } from './mocks/supabaseMock';

// Mock the supabase module
jest.mock('../services/supabase');

describe('myService', () => {
  const mockUserData = mockUser();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('function name', () => {
    it('should do something expected', async () => {
      // Arrange
      const mockBuilder = createMockQueryBuilder(testData);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      // Act
      const result = await myService.myFunction();

      // Assert
      expect(result).toEqual(expectedValue);
    });

    it('should handle errors', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Error message');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(myService.myFunction()).rejects.toThrow();
    });
  });
});
```

---

## Common Testing Patterns

### 1. Mocking Supabase

```typescript
// Basic mock setup
const mockBuilder = createMockQueryBuilder([mockPlant()]);
(supabase.from as jest.Mock).mockReturnValue(mockBuilder);

// With error
const mockBuilder = createMockQueryBuilder();
mockBuilder._setError('Database error');
(supabase.from as jest.Mock).mockReturnValue(mockBuilder);

// With specific data
const mockBuilder = createMockQueryBuilder([
  mockPlant({ id: '1', name: 'Tomato' }),
  mockPlant({ id: '2', name: 'Carrot' }),
]);
```

### 2. Testing Async Functions

```typescript
it('should fetch data', async () => {
  const mockBuilder = createMockQueryBuilder(data);
  (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

  // await is required for async functions
  const result = await myService.fetchData();

  expect(result).toBeDefined();
});
```

### 3. Testing Error Paths

```typescript
it('should handle errors', async () => {
  const mockBuilder = createMockQueryBuilder();
  mockBuilder._setError('Network error');
  (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

  // Use rejects.toThrow() for rejected promises
  await expect(myService.fetchData()).rejects.toThrow('Network error');
});

it('should return error result', async () => {
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: null }
  });

  const result = await myService.importData();

  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

### 4. Testing with Filters

```typescript
it('should apply filters', async () => {
  const plants = [mockPlant({ status: 'gepflanzt' })];
  const mockBuilder = createMockQueryBuilder(plants);
  (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

  const result = await plantService.fetchPlants({
    status: 'gepflanzt',
    location: 'Greenhouse',
    searchQuery: 'Tomato',
  });

  // Verify correct filter methods were called
  expect(mockBuilder.eq).toHaveBeenCalledWith('status', 'gepflanzt');
  expect(mockBuilder.ilike).toHaveBeenCalled();
});
```

### 5. Testing User Authentication

```typescript
it('should create item for authenticated user', async () => {
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: mockUser({ id: 'user-123' }) }
  });

  const mockBuilder = createMockQueryBuilder([mockItem()]);
  (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

  const result = await myService.createItem(itemData);

  expect(result.user_id).toBe('user-123');
});

it('should reject unauthenticated request', async () => {
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: null }
  });

  await expect(myService.createItem(itemData)).rejects.toThrow(
    'User must be logged in'
  );
});
```

---

## Available Mock Functions

### createMockQueryBuilder(data)
Creates a mock Supabase query builder with chainable methods.

**Methods:**
- `select(columns)` - Select specific columns
- `eq(column, value)` - Filter by equality
- `in(column, values)` - Filter by array inclusion
- `ilike(column, pattern)` - Case-insensitive pattern match
- `or(query)` - OR logic for multiple conditions
- `order(column, options)` - Sort results
- `not(column, operator, value)` - NOT conditions
- `single()` - Return single result (promises)
- `insert(records)` - Insert records
- `update(values)` - Update records
- `delete()` - Delete records
- `upsert(records, options)` - Upsert records

**Utilities:**
- `_setError(message)` - Set error state
- `_clearError()` - Clear error
- `_setData(data)` - Set data
- `_getData()` - Get current data

### mockPlant(overrides)
Creates a mock plant object with default values.

```typescript
mockPlant({
  id: 'custom-id',
  name: 'Tomato',
  status: 'gepflanzt',
  location: 'Greenhouse',
})
```

### mockShoppingItem(overrides)
Creates a mock shopping item with default values.

```typescript
mockShoppingItem({
  item_name: 'Tomato Seeds',
  category: 'saatgut',
  priority: 'hoch',
})
```

### mockUser(overrides)
Creates a mock user object.

```typescript
mockUser({
  id: 'user-123',
  email: 'test@example.com',
})
```

---

## Test Coverage Guidelines

### What to Test (✅ Covered)
- ✅ Happy path (normal operation)
- ✅ Error cases (database errors, network errors)
- ✅ Edge cases (empty arrays, null values)
- ✅ Filtering and sorting logic
- ✅ Authentication requirements
- ✅ Data transformations
- ✅ Async operations
- ✅ State management

### Coverage Metrics
- **Statements:** Every line of code executed
- **Branches:** Every if/else path tested
- **Functions:** Every exported function has at least one test
- **Lines:** Every line numbered in coverage report

### Achieving High Coverage
1. Test happy paths first
2. Add error case tests
3. Test edge cases (empty, null, single item)
4. Test filter combinations
5. Test all code branches

---

## Debugging Tests

### View detailed test output
```bash
npm test -- --verbose
```

### Run specific test file with debugging
```bash
node --inspect-brk node_modules/.bin/jest --runInBand plantService.test.ts
```

### Check mock call details
```typescript
// View all calls to a mock
expect(supabase.from).toHaveBeenCalled();
expect(supabase.from).toHaveBeenCalledWith('plants');
expect(supabase.from).toHaveBeenCalledTimes(3);

// View call arguments
const calls = (supabase.from as jest.Mock).mock.calls;
console.log(calls[0]); // First call arguments
```

### Temporary test skip/focus
```typescript
// Skip a test
it.skip('should do something', () => {});

// Run only this test
it.only('should do something', () => {});
```

---

## Common Issues and Solutions

### Issue: "Cannot find module '@supabase/supabase-js'"
**Solution:** Jest mocks this automatically in setup.ts

### Issue: "Timeout waiting for async operation"
**Solution:** Increase timeout in jest.config.js or individual test:
```typescript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Issue: "Expected error but received resolved value"
**Solution:** Make sure to use `.rejects.toThrow()` for rejected promises:
```typescript
await expect(myFunction()).rejects.toThrow();
```

### Issue: Mock data not persisting across operations
**Solution:** Use `_setData()` after modifications:
```typescript
const mockBuilder = createMockQueryBuilder([mockPlant()]);
// ... perform operations ...
mockBuilder._setData(updatedData);
```

---

## Best Practices

✅ **DO:**
- Write descriptive test names
- Test one thing per test
- Use beforeEach to reset mocks
- Mock external dependencies
- Test error paths
- Group related tests with describe()
- Use meaningful assertions

❌ **DON'T:**
- Test implementation details (test behavior)
- Create interdependent tests
- Use vague test names
- Skip error case tests
- Mock too much (mock only external APIs)
- Test the testing library itself

---

## Continuous Integration

Tests run automatically on:
- Every git commit (via pre-commit hooks)
- Pull requests
- Before deployment

**Coverage requirements:**
- Services: ≥79% statements, ≥85% functions
- Global: ≥70% statements
- Failure blocks merge/deployment

---

## Performance

Current performance metrics:
- **Total test time:** ~0.7s for all 120 tests
- **Slowest test:** <10ms average
- **Coverage report generation:** ~1s

Tests run in parallel by default using Jest's worker pool.

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Project Architecture](./ARCHITECTURE.md)

---

## Maintenance

### Adding new tests
1. Create `serviceName.test.ts` in `src/__tests__/`
2. Import test utilities from `./mocks/supabaseMock.ts`
3. Follow test template above
4. Run `npm run test:coverage` to verify coverage
5. Commit tests with feature implementation

### Updating tests
- Update tests when service APIs change
- Keep test descriptions in sync with test code
- Maintain coverage above thresholds
- Review coverage report regularly

### Removing tests
- Only remove tests when feature is removed
- Don't remove passing tests to hide failures
- Consider test value before removal

---

**Last Updated:** March 3, 2026
**Maintained By:** Development Team
**Test Framework:** Jest 29.7.0
**Coverage Tool:** Istanbul (built-in to Jest)
