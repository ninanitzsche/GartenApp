# Gartenplaner App - Testing

## Overview
Comprehensive Jest test suite with mocked Supabase for service and utility testing.

## Configuration

### Environment
- **Jest Environment:** Node (not jsdom)
- **Setup File:** `src/__tests__/setup.ts`
- **Test Pattern:** `**/__tests__/**/*.test.ts`

### Coverage Thresholds
```
Global:
  statements: 70%
  branches: 60%
  functions: 70%
  lines: 70%

Services:
  statements: 79%
  branches: 70%
  functions: 85%
  lines: 79%
```

## Test Structure

```
src/__tests__/
├── mocks/
│   ├── fileMock.ts         # Asset file mocks
│   ├── styleMock.ts        # CSS style mocks
│   └── supabaseMock.ts     # Supabase client mocks
├── setup.ts                # Jest setup & global mocks
├── integration/
│   └── integration.test.ts
├── authService.test.ts
├── bedService.test.ts
├── gardenService.test.ts
├── plantService.test.ts
├── shoppingService.test.ts
├── photoService.test.ts
├── seedDataService.test.ts
└── taskService.test.ts
```

## Mocks

### Supabase Mock (`supabaseMock.ts`)
Provides chainable query builder for testing:
```typescript
const mockBuilder = createMockQueryBuilder(plants);
(supabase.from as jest.Mock).mockReturnValue(mockBuilder);
// Supports: select, eq, in, ilike, or, order, insert, update, delete
```

### Module Mocks
```typescript
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../services/supabase');
```

## Test Examples

### Service Testing
```typescript
describe('plantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch plants', async () => {
    const plants = [mockPlant()];
    const mockBuilder = createMockQueryBuilder(plants);
    (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

    const result = await plantService.fetchPlants({});

    expect(result).toEqual(plants);
  });
});
```

### Filter Testing
- Multiple status filter (OR logic)
- Location filter
- Search filter (case-insensitive)
- Type filter
- Essbar (edible) filter

### Error Handling
```typescript
it('should handle errors', async () => {
  const mockBuilder = createMockQueryBuilder();
  mockBuilder._setError('Database error');
  (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

  await expect(plantService.fetchPlants({})).rejects.toThrow();
});
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Coverage Reports
Generated in `coverage/` directory:
- `lcov-report/index.html` - HTML report
- Console summary after each run

## AuthContext Testing
- Test auth state transitions
- Test signIn, signUp, signOut
- Test loading state
- Test error handling

## What to Test
- All service CRUD methods
- Filter combinations
- Error scenarios
- Edge cases (empty results, null data)
- Status progression logic (plants)
- Auth flows
