# src/utils/ - Helper Functions

**Last Updated:** 2026-03-04
**Status:** Production code
**Purpose:** Reusable utility functions and helpers

---

## 🎯 What Goes Here?

Utility files contain **pure functions** with no side effects:
- Date/time formatting
- String manipulation and validation
- Number formatting and calculations
- Array operations
- Validation helpers
- Format converters

---

## 📋 Utility Function Patterns

### Date Utilities

```typescript
// src/utils/dateUtils.ts

import { format, parse, isValid, differenceInDays } from 'date-fns';

// Format date for display
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy'); // "Jan 15, 2026"
}

// Format date for input field
export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd'); // "2026-01-15"
}

// Calculate days until date
export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return differenceInDays(d, new Date());
}

// Parse ISO date string
export function parseISODate(isoString: string): Date | null {
  const date = parse(isoString, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date());
  return isValid(date) ? date : null;
}
```

### Validation Utilities

```typescript
// src/utils/validation.ts

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

export function isEmpty(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0;
}

export function isPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}
```

### String Utilities

```typescript
// src/utils/stringUtils.ts

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}
```

### Array Utilities

```typescript
// src/utils/arrayUtils.ts

export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(array: T[], key: (item: T) => any, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = key(a);
    const bVal = key(b);
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
```

### Number Utilities

```typescript
// src/utils/numberUtils.ts

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatPercent(value: number, decimals: number = 0): string {
  return (value * 100).toFixed(decimals) + '%';
}

export function roundTo(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

---

## 🧪 Testing Utilities

```typescript
// src/utils/__tests__/stringUtils.test.ts

import { capitalize, truncate, pluralize } from '../stringUtils';

describe('stringUtils', () => {
  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('pluralize', () => {
    it('returns singular for count 1', () => {
      expect(pluralize(1, 'plant', 'plants')).toBe('plant');
    });

    it('returns plural for count > 1', () => {
      expect(pluralize(5, 'plant', 'plants')).toBe('plants');
    });
  });
});
```

---

## ✅ Best Practices

### 1. Keep Functions Pure
```typescript
// ✅ GOOD: Pure function (same input = same output)
function addNumbers(a: number, b: number): number {
  return a + b;
}

// ❌ BAD: Not pure (depends on external state)
let count = 0;
function incrementCount() {
  count++; // Side effect!
}
```

### 2. Single Responsibility
```typescript
// ✅ GOOD: One job
function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

// ❌ BAD: Multiple jobs
function processUser(user: any) {
  // Format date
  // Validate email
  // Make API call
  // Update state
}
```

### 3. Type Your Parameters and Returns
```typescript
// ❌ DON'T
function sum(a, b) {
  return a + b;
}

// ✅ DO
function sum(a: number, b: number): number {
  return a + b;
}
```

### 4. Use Descriptive Names
```typescript
// ❌ Unclear
function x(arr: Plant[]): Plant[] {
  return arr.filter((p) => p.status === 'harvested');
}

// ✅ Clear
function getHarvestedPlants(plants: Plant[]): Plant[] {
  return plants.filter((plant) => plant.status === 'harvested');
}
```

---

## 📁 Common Utility Files

### dateUtils.ts
- Format dates for display
- Parse date strings
- Calculate date differences
- Check date validity

### stringUtils.ts
- Capitalize, truncate, slugify
- String validation
- String transformation

### numberUtils.ts
- Format currency
- Calculate percentages
- Round numbers
- Clamp values

### validation.ts
- Email validation
- Password strength
- Field requirements
- Type checking

### arrayUtils.ts
- Remove duplicates
- Group by key
- Sort arrays
- Chunk arrays

### objectUtils.ts
- Deep copy
- Merge objects
- Pick properties
- Omit properties

---

## 🚀 Adding New Utilities

**When adding a new utility function:**

1. **Create file:** `src/utils/newUtilName.ts`
2. **Write pure functions:**
   ```typescript
   export function myUtility(input: InputType): OutputType {
     // Pure logic, no side effects
     return result;
   }
   ```

3. **Add tests:** `src/__tests__/utils/newUtilName.test.ts`
4. **Document usage:** Comment with examples
5. **Export if needed:** Add to barrel export if creating utils/index.ts

---

## 📚 Commonly Used External Libraries

**Already available in project:**
- `date-fns` - Date/time utilities
- `lodash` - Array/object utilities (if installed)
- Standard JavaScript: Array methods, String methods, Math

---

## 🔗 Related Files

- **Tests:** `src/__tests__/utils/` - Test all utilities
- **Components:** `src/components/` - Use utilities here
- **Services:** `src/services/` - Use utilities here
- **Screens:** `src/screens/` - Use utilities here

---

## 💡 Principles

1. **Pure Functions** - Same input = same output, no side effects
2. **Reusable** - Used across multiple files
3. **Testable** - Easy to test in isolation
4. **Documented** - Clear purpose and usage
5. **Typed** - Full TypeScript coverage

---

**Purpose:** Reusable helper functions
**Owner:** Development team
**Testing:** Unit tests for all utilities

