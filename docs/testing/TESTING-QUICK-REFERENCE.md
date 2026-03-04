# Testing Quick Reference

## Quick Commands

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Single file
npm test -- plantService.test.ts

# Pattern match
npm test -- --testNamePattern="fetch"
```

---

## Test Template (Copy-Paste)

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as service from '../services/service';
import { supabase } from '../services/supabase';
import { createMockQueryBuilder, mockData } from './mocks/supabaseMock';

jest.mock('../services/supabase');

describe('serviceName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('functionName', () => {
    it('should do something', async () => {
      const mockBuilder = createMockQueryBuilder([mockData()]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await service.functionName();

      expect(result).toEqual(expected);
    });

    it('should handle errors', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Error');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(service.functionName()).rejects.toThrow();
    });
  });
});
```

---

## Common Assertions

```typescript
// Equality
expect(result).toBe(value);           // ===
expect(result).toEqual(value);        // deep equal
expect(result).toStrictEqual(value);  // strict deep equal

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();
expect(result).toBeNull();
expect(result).toBeUndefined();

// Numbers
expect(result).toBeGreaterThan(5);
expect(result).toBeLessThan(10);
expect(result).toBeCloseTo(3.14, 2);

// Strings
expect(result).toMatch(/pattern/);
expect(result).toContain('substring');

// Arrays
expect(result).toHaveLength(3);
expect(result).toContain(item);
expect(result).toEqual(expect.arrayContaining([1, 2]));

// Objects
expect(result).toHaveProperty('name');
expect(result).toHaveProperty('name', 'John');

// Promises
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow('message');

// Mocks
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(3);
```

---

## Mocking Quick Guide

### Mock Supabase Query
```typescript
const mockBuilder = createMockQueryBuilder(data);
(supabase.from as jest.Mock).mockReturnValue(mockBuilder);
```

### Chain Methods
```typescript
mockBuilder
  .select()
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

### Set Error
```typescript
mockBuilder._setError('Database error');
```

### Get/Set Data
```typescript
mockBuilder._setData(newData);
const data = mockBuilder._getData();
```

### Mock User
```typescript
(supabase.auth.getUser as jest.Mock).mockResolvedValue({
  data: { user: mockUser({ id: 'user-123' }) }
});
```

### Mock No User
```typescript
(supabase.auth.getUser as jest.Mock).mockResolvedValue({
  data: { user: null }
});
```

---

## Mock Data Helpers

```typescript
mockPlant(options)           // Create mock plant
mockShoppingItem(options)    // Create mock shopping item
mockUser(options)            // Create mock user
createMockQueryBuilder(data) // Create mock query builder
```

---

## Test Organization

```typescript
describe('serviceName', () => {           // Service
  describe('functionName', () => {        // Function
    it('should ...', () => {});           // Test case
    it('should ...', () => {});           // Test case
  });

  describe('anotherFunction', () => {
    it('should ...', () => {});
  });
});
```

---

## Coverage Check

```bash
npm run test:coverage
```

**Thresholds:**
- Services: ≥79% statements, ≥85% functions
- Global: ≥70% statements

View report in terminal or:
- Open: `coverage/lcov-report/index.html`

---

## Debugging

```typescript
// Log values
console.log(result);

// Inspect mock calls
const calls = (mockFn as jest.Mock).mock.calls;
console.log(calls);

// Temporary skip
it.skip('test name', () => {});

// Run only this test
it.only('test name', () => {});
```

---

## Error Patterns

```typescript
// Database error
mockBuilder._setError('Database error');
await expect(fn()).rejects.toThrow();

// Auth error
(supabase.auth.getUser as jest.Mock).mockResolvedValue({
  data: { user: null }
});

// Validation error
const result = await service.fn();
expect(result.error).toBeDefined();

// Empty result
const mockBuilder = createMockQueryBuilder([]);
```

---

## Coverage Report Symbols

| Symbol | Meaning |
|--------|---------|
| ✓ | Covered (executed) |
| × | Not covered |
| I | Partial coverage |
| E | Exception branch |

---

**For full guide:** See [TESTING-GUIDE.md](./TESTING-GUIDE.md)
