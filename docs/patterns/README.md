# 🎯 Code Patterns - Copy-Paste Ready Templates

**Status:** Active
**Last Updated:** 2026-03-04
**Audience:** Developers
**Purpose:** Reusable, proven patterns from Gartenplaner codebase

---

## 📚 Pattern Index

| Pattern | Purpose | File | Reuse |
|---------|---------|------|-------|
| **Service Layer** | CRUD operations + database queries | [service-layer.md](service-layer.md) | 70% |
| **Authentication** | User login/logout + session management | [authentication.md](authentication.md) | 90% |
| **React Hooks** | Custom hooks + useEffect patterns | [react-hooks.md](react-hooks.md) | 80% |
| **Testing** | Jest test templates + coverage goals | [testing.md](testing.md) | 85% |
| **Performance** | FlatList, compression, memoization | [performance.md](performance.md) | 95% |

---

## 🚀 Quick Start

### I need to build a new CRUD feature
1. **Copy:** [SERVICE-LAYER.md](SERVICE-LAYER.md)
2. **Adapt:** Change entity name
3. **Test:** Use template from [TESTING.md](TESTING.md)

### I need to add authentication to a screen
1. **Copy:** [AUTHENTICATION.md](AUTHENTICATION.md)
2. **Follow:** useAuth() hook pattern
3. **Verify:** RLS policies match

### I need to optimize a slow list
1. **Read:** [PERFORMANCE.md](PERFORMANCE.md)
2. **Implement:** FlatList with getItemLayout
3. **Test:** Measure with Profiler

### I need a custom hook for fetching data
1. **Copy:** Pattern from [REACT-HOOKS.md](REACT-HOOKS.md)
2. **Adapt:** Change service + types
3. **Test:** Use hook testing template

### I need to test a new service
1. **Copy:** Template from [TESTING.md](TESTING.md)
2. **Implement:** CRUD test cases
3. **Target:** 85%+ coverage

---

## 🔗 Cross-References

```
Service Layer ────→ Authentication (user scoping)
       ↓ ↑
    React Hooks ────→ Testing
       ↓ ↑
  Performance ◄─────┘
```

- **Service Layer** is used by **React Hooks**
- **Authentication** provides user context for **Service Layer**
- **Performance** optimizes **React Hooks** rendering
- **Testing** validates all patterns

---

## 💡 Real Examples in Codebase

Each pattern document includes real examples from the codebase:

### Service Layer
- ✅ `src/services/plantService.ts` - Full CRUD example
- ✅ `src/services/shoppingService.ts` - With filtering
- ✅ `src/services/photoService.ts` - With file upload

### Authentication
- ✅ `src/contexts/AuthContext.tsx` - Provider + hooks
- ✅ `src/services/authService.ts` - Auth operations
- ✅ `src/screens/LoginScreen.tsx` - Login example

### React Hooks
- ✅ `src/hooks/usePlants.ts` - Data fetching hook
- ✅ `src/hooks/useSearch.ts` - Search with debounce
- ✅ `src/hooks/useMutation.ts` - Create/update hook

### Testing
- ✅ `src/__tests__/plantService.test.ts` - Service tests
- ✅ `src/__tests__/AuthContext.test.tsx` - Hook tests
- ✅ `jest.config.js` - Jest configuration

### Performance
- ✅ `src/screens/PlantsScreen.tsx` - FlatList example
- ✅ `src/services/photoService.ts` - Image compression
- ✅ Components - React.memo examples

---

## ✅ When to Create a New Pattern

Add a new pattern when:
1. ✅ It's used in 2+ places in the codebase
2. ✅ Other developers ask "how do we do X?"
3. ✅ It's proven to work + is maintainable
4. ✅ It has a clear copy-paste template

Don't create patterns for:
- ❌ One-time utilities
- ❌ Framework code (React, Supabase)
- ❌ Unproven experimental code

---

## 📖 How to Use a Pattern

### Step 1: Read the Pattern
```
1. Overview (what is it for?)
2. Template (copy this)
3. How to implement (step-by-step)
4. Real examples (see actual code)
5. Best practices (do's and don'ts)
```

### Step 2: Copy Template
- Copy the code block from "## 🏗️ Template Structure"
- Change names to your entity
- Fill in the details

### Step 3: Test
- Use test template from [TESTING.md](TESTING.md)
- Target 85%+ for services, 70%+ for components
- Verify on all 3 platforms (iOS, Android, Web)

### Step 4: Reference in Code
```typescript
// In your implementation, add comment pointing to pattern
/**
 * Service layer pattern (see docs/patterns/SERVICE-LAYER.md)
 * Handles all plant database operations
 */
```

---

## 🧠 Learning Path

### Day 1: Foundation
1. [SERVICE-LAYER.md](SERVICE-LAYER.md) - Learn CRUD pattern
2. [TESTING.md](TESTING.md) - Learn how to test it

### Day 2: Advanced
3. [AUTHENTICATION.md](AUTHENTICATION.md) - User scoping
4. [REACT-HOOKS.md](REACT-HOOKS.md) - Data fetching

### Day 3: Optimization
5. [PERFORMANCE.md](PERFORMANCE.md) - Speed it up

---

## 🔄 Pattern Evolution

Patterns evolve as we learn:

```
Sprint 1: Pattern created (basic CRUD)
    ↓
Sprint 2: Pattern refined (error handling)
    ↓
Sprint 3: Pattern optimized (performance)
    ↓
Sprint 4: Pattern documented (this file)
    ↓
Sprint 5+: Pattern evolved (new use cases)
```

When you find a better way to do something:
1. Update the pattern documentation
2. Update code to match
3. Note the change in this file

---

## 📊 Pattern Coverage

| Phase | Status | Examples |
|-------|--------|----------|
| **MVP (Phase 1)** | ✅ Complete | 19 features, 70% reuse |
| **AI Integration (Phase 2)** | 🔧 Ready | Vision API, auto-ID patterns |
| **Scale (Phase 3)** | 📋 Planned | Multi-garden, teams |

---

## 🤝 Contributing a Pattern

If you discover a useful pattern:

1. **Document It**
   - Create `docs/patterns/YOUR-PATTERN.md`
   - Follow template structure above
   - Include real code examples

2. **Link It**
   - Add to this README
   - Cross-reference related patterns
   - Update MEMORY.md

3. **Verify It**
   - Used in 2+ places
   - Tested + working
   - Clear documentation

4. **Share It**
   - Add to PR description
   - Mention in team discussion
   - Update code comments

---

## 🎯 Success Criteria

A good pattern has:
- ✅ Clear title ("X Pattern")
- ✅ Use case ("When to use")
- ✅ Template ("Copy-paste ready")
- ✅ Step-by-step implementation
- ✅ Real code examples
- ✅ Best practices (do's/don'ts)
- ✅ Links to related patterns
- ✅ Testing template

---

## 📚 Related Documentation

- [MEMORY.md](../../MEMORY.md) - Points to this patterns folder
- [QUICK-LINKS.md](../../QUICK-LINKS.md) - Navigation guide
- [docs/LEARNINGS/](../LEARNINGS/) - Lessons learned + gotchas
- [docs/testing/TESTING-GUIDE.md](../testing/TESTING-GUIDE.md) - How to test patterns

---

## 🚀 Next Steps

1. **Read a pattern** that matches your task
2. **Copy the template**
3. **Follow the steps**
4. **Test thoroughly**
5. **Ask questions** in code comments if stuck

---

**Pattern Library Version:** 1.0
**Last Updated:** 2026-03-04
**Maintained by:** Development Team

Good luck! 🌱

