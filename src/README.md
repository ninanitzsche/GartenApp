# src/ - Source Code Organization

**Last Updated:** 2026-03-04
**Status:** Production code (Sprints 1-5 complete)
**Purpose:** Main application code directory

---

## 📁 Directory Structure

```
src/
├── screens/           # Full-screen components (routes)
├── components/        # Reusable UI components
├── services/          # API/Business logic layer
├── contexts/          # React Context for state management
├── hooks/             # Custom React hooks
├── navigation/        # Navigation configuration & setup
├── types/             # TypeScript type definitions
├── utils/             # Helper functions
├── theme/             # Design system (colors, spacing, etc.)
└── __tests__/         # Unit tests
```

---

## 🚀 Architecture Pattern

**Data Flow:**
```
Screen (React Component)
  ↓
  Uses: Custom Hook (useAuth, usePlants, etc.)
  ↓
  Hook calls: Service (plantService, authService, etc.)
  ↓
  Service calls: Supabase API
  ↓
  Data returns through hook → updates component state → re-render
```

**State Management:**
```
AuthContext (global auth state) → used by all screens
  ↓
Local state (useState) → component-specific data
  ↓
Services → read/write to backend
```

---

## 📋 Directory Guide

### screens/
**What:** Full-screen UI components

**Pattern:**
- One screen = one major route/navigation state
- Screens manage their own state (plants list, form inputs, etc.)
- Call services to fetch/update data
- Use navigation to move between screens

**Examples:** HomeScreen.tsx, LoginScreen.tsx, AddPlantScreen.tsx

**See:** `screens/README.md`

---

### components/
**What:** Reusable UI components (not full screens)

**Pattern:**
- Small, focused components
- Accept props for data and callbacks
- No navigation logic
- Can be used across multiple screens

**Examples:** EmptyState.tsx, LoadingSpinner.tsx, PlantCard.tsx

**See:** `components/README.md`

---

### services/
**What:** API calls and business logic

**Pattern:** (Service Layer - HIGHLY REUSABLE)
```typescript
// Export functions: fetchAll, fetchById, create, update, delete
export async function fetchAll(filters?: Filters) {
  const { data, error } = await supabase.from('table').select('*');
  if (error) throw error;
  return data;
}

// Consistent error handling across all services
// Always include user_id for security (RLS)
```

**70% code reuse:** New entity CRUD = copy plantService pattern

**Files:** plantService.ts, shoppingService.ts, authService.ts, etc.

**See:** `services/README.md`

---

### contexts/
**What:** React Context for global state

**Pattern:**
- AuthContext: User login/logout, session management
- Create context → Provider → export custom hook

**Example:** `AuthContext.tsx` provides `useAuth()` hook

**See:** `contexts/README.md`

---

### hooks/
**What:** Custom React hooks (if used)

**Pattern:**
- Encapsulate component logic
- Can use other hooks (useState, useEffect, useContext)
- Reusable across components

**Examples:** usePlants (fetch + manage plant list), useForms (form state)

**See:** `hooks/README.md`

---

### navigation/
**What:** React Navigation configuration

**Pattern:**
- Root navigation setup
- Route definitions
- Screen registration

**See:** `navigation/README.md`

---

### types/
**What:** TypeScript type definitions

**Pattern:**
- Database types (Plant, Task, etc.)
- API response types
- Component prop types

**Examples:** `types/plants.ts`, `types/auth.ts`

**See:** `types/README.md`

---

### utils/
**What:** Helper functions

**Pattern:**
- Pure functions (no side effects)
- Reusable across services/components
- Examples: date formatting, string validation, calculations

**See:** `utils/README.md`

---

### theme/
**What:** Design system configuration

**Pattern:**
- Colors, spacing, typography
- Shared across all components
- Centralized for consistency

**See:** `theme/README.md`

---

## 🔧 Development Workflow

### Building a New Feature

```
1. Create Screen (src/screens/NewFeatureScreen.tsx)
   - Design UI layout
   - Define local state (useState)

2. Create Service (src/services/newEntityService.ts)
   - Copy from plantService pattern
   - Implement fetchAll, create, update, delete
   - Add error handling

3. Create Custom Hook (optional) (src/hooks/useNewEntity.ts)
   - Call service functions
   - Manage loading/error state
   - Return data to component

4. Use in Screen
   - Import hook
   - Call hook to fetch data
   - Display in UI

5. Create Tests (src/__tests__/services/newEntityService.test.ts)
   - Test service functions
   - Mock Supabase responses
   - Target: 85%+ coverage
```

---

## ✅ Code Standards

### TypeScript
- **Strict mode:** Enabled (100% type coverage)
- **No `any` types** (use `unknown` if needed, then narrow)
- **Named exports** (not default exports)

### Naming
- **Components:** PascalCase (HomeScreen.tsx)
- **Functions:** camelCase (fetchPlants)
- **Constants:** SCREAMING_CASE (MAX_ITEMS)
- **Types:** PascalCase (Plant, Task)
- **Interfaces:** I + PascalCase (IPlant) - optional, use types

### Code Style
- **Indentation:** 2 spaces
- **Line length:** 100 characters max
- **Imports:** Grouped (React, libraries, local)
- **Comments:** For "why", not "what" (code is self-documenting)

---

## 🧪 Testing

**Target:** 85%+ coverage for services

**Test location:** `src/__tests__/`

**Test pattern:**
```typescript
// Service tests: Mock Supabase
const mockSupabase = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({ data: [...], error: null })
  })
};

// Test: expect(result).toEqual(expectedData)
```

**See:** `docs/testing/TESTING-GUIDE.md`

---

## 🔗 Related Documentation

- **Patterns:** `MEMORY.md` → Proven Patterns (70% reuse guide)
- **Gotchas:** `docs/LEARNINGS/bugs-and-gotchas.md` (solutions to common problems)
- **Database:** `docs/database/database-guide.md` (schema, RLS policies)
- **Architecture:** `docs/bmad/bmad-03-architecture.md` (system design)

---

## 📊 Key Metrics

- **Code Reuse:** Service Layer pattern = 70% across services
- **Test Coverage:** Target 85%+ for services, 50%+ for components
- **Performance:** FlatList for 100+ items, debounce for search (300ms)
- **Bundle Size:** Keep under 5MB (Expo target)

---

## 🚨 Common Gotchas

**RLS Policy Returns Wrong Data:**
- Always include `user_id` filter in queries
- See: `docs/LEARNINGS/bugs-and-gotchas.md` → RLS Issues

**Image Upload Fails on Web:**
- Use expo-image-manipulator with 70% quality
- See: `docs/LEARNINGS/bugs-and-gotchas.md` → Photo Upload

**Component Re-Renders Too Much:**
- Use `useCallback` for event handlers
- Memoize heavy computations with `useMemo`
- See: `MEMORY.md` → React Hooks pattern

---

## 🎯 For New Developers

1. **Start:** Read this file (5 min)
2. **Then:** Pick a directory (screens, services, etc.)
3. **Read:** That directory's README.md
4. **Copy:** Existing code as template
5. **Reference:** `MEMORY.md` for patterns

**Example:** Adding plant CRUD feature
1. Copy `src/services/plantService.ts` pattern
2. Copy `src/screens/AddPlantScreen.tsx` pattern
3. Follow same error handling + TypeScript style
4. Add tests to `src/__tests__/`

---

**Purpose:** Source code organization and development guide
**Owner:** Development team
**Updated:** After each major feature or refactor

