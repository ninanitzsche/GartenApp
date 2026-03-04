# 🧠 Gartenplaner Development Memory

**Last Updated:** 2026-03-04
**Status:** Active (Auto-Loaded Context)
**Audience:** Developers
**Related Files:** [QUICK-LINKS.md](QUICK-LINKS.md), [docs/reference/FILE-STRUCTURE.md](docs/reference/FILE-STRUCTURE.md), [docs/LEARNINGS/bugs-and-gotchas.md](docs/LEARNINGS/bugs-and-gotchas.md)

---

## 📚 Quick Navigation

### Code Patterns ✅ NOW AVAILABLE
- **[Service Layer Pattern](docs/patterns/service-layer.md)** - CRUD operations, Error handling, 70% reuse
- **[Authentication Flow](docs/patterns/authentication.md)** - Login, Session management, User scoping
- **[React Hooks](docs/patterns/react-hooks.md)** - useEffect, useCallback, Custom hooks, Debouncing
- **[Testing Patterns](docs/patterns/testing.md)** - Jest templates, 85%+ coverage targets
- **[Performance Patterns](docs/patterns/performance.md)** - FlatList, Image Compression, Memoization

### Testing & Quality
- **[Testing Guide](docs/testing/TESTING-GUIDE.md)** - Jest setup, 85%+ coverage target
- **[Testing Patterns](docs/patterns/testing.md)** - Service tests, Component tests, Mocks

### Common Issues & Solutions
- **[Bugs & Gotchas](docs/LEARNINGS/bugs-and-gotchas.md)** - 14+ solved problems
- **[RLS Issues](docs/LEARNINGS/bugs-and-gotchas.md#rls--security)** - Permission problems
- **[Web vs Native](docs/reference/WEB-NATIVE-DIFFERENCES.md)** - Platform compatibility

### Metrics & Data
- **[Feature Timing](docs/LEARNINGS/feature-implementation-learnings.md)** - How long features take
- **[Sprint Velocity](docs/reference/BMAD-STATUS.md)** - 10.8 pts/sprint baseline
- **[Cost Data](docs/config/COST-GUIDELINES.md)** - Budget & optimization

**⚠️ Budget Clarification:**
- **Phase 1 (MVP) Total Budget:** $25 for all 5 sprints
- **Per-Sprint Budget:** $10/sprint (with $5 buffer for safety)
- **Phase 1 Actual Spent:** $2.09 (92% under budget!)
- **Cost per point:** $0.04

---

## 🔄 Proven Patterns (Copy-Paste Ready)

### Service Layer Pattern ⭐ (Most Important)
**Used for:** Plant, Shopping, Photo, Seed Data services
**Code Location:** `src/services/plantService.ts`
**Reuse Rate:** 70% code reuse across all services

```typescript
// Template: Copy from plantService.ts, change entity name
export async function fetchAll(filters?: Filters) {
  try {
    let query = supabase.from('entity_name').select('*');
    if (user?.id) query = query.eq('user_id', user.id);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}
```

### FlatList with Grid ⭐ (Common Need)
**For:** 2-column photo galleries, plant lists
**Optimization:** 60 FPS scrolling, 100+ items
**See:** `docs/patterns/PERFORMANCE.md` for full implementation

### Authentication Flow ⭐ (Already Done)
**Location:** `src/contexts/AuthContext.tsx`
**Pattern:** Session persistence, logout on password change
**See:** `docs/patterns/AUTH.md` for details

---

## 📊 Current Metrics

**Baseline for estimation:**
- Average velocity: **10.8 pts/sprint** (proven across 5 sprints)
- Cost per point: **$0.04** (92% under budget)
- Test coverage target: **85%+** for services
- TypeScript: **100% strict mode**

**Feature Timing (from completed sprints):**
- Small feature (2-3 pts): ~1 day
- Medium feature (5 pts): ~2-3 days
- Large feature (8 pts): ~3-5 days
- See `docs/LEARNINGS/feature-implementation-learnings.md` for details

---

## 🚀 Before Starting Any Feature

1. **Read relevant pattern** from `docs/patterns/`
2. **Check for similar feature** in `docs/LEARNINGS/feature-implementation-learnings.md`
3. **Check database** in `docs/database/database-guide.md` (RLS policies!)
4. **Review gotchas** in `docs/LEARNINGS/bugs-and-gotchas.md`
5. **Check QUICK-LINKS.md** for quick navigation

---

## 💡 Key Learnings

### What Works
✅ Service Layer pattern (70% reuse)
✅ Testing services first (simpler than components)
✅ Debouncing for search (300ms)
✅ Image compression (70% quality)
✅ FlatList with getItemLayout (grids)

### What Doesn't Work
❌ Building without schema check first
❌ Testing components before services
❌ Image upload without compression
❌ Web-specific code without testing
❌ RLS policy bugs (test thoroughly!)

---

## 📁 File Organization

**Root (Essential Only):**
- `README.md` - Project overview
- `ONBOARDING.md` - New developer guide
- `QUICK-LINKS.md` - Fast navigation
- `MVP-RELEASE-SUMMARY.md` - Executive summary
- `MEMORY.md` - This file (index)

**Configuration (docs/config/):**
- `CLAUDE.md` - AI development setup
- `COST-GUIDELINES.md` - Budget management
- `PO-GUIDE.md` - Product owner reference

**Documentation (docs/):**
- `database/` - Schema, RLS policies
- `testing/` - Testing guides
- `patterns/` - Code patterns
- `LEARNINGS/` - Lessons learned
- `bmad/` - BMAD workflow (Phase 1-3)
- `archive/sprints/` - Sprint history

---

## 🎯 For Phase 2 Development

**Pre-Sprint Checklist:**
- [ ] Read `docs/patterns/` for relevant features
- [ ] Check `docs/LEARNINGS/feature-implementation-learnings.md` for timing
- [ ] Verify database schema in `docs/database/`
- [ ] Review `docs/LEARNINGS/bugs-and-gotchas.md` for your feature type

**During Implementation:**
- [ ] Copy patterns from `docs/patterns/` (don't reinvent)
- [ ] Test on all 3 platforms (iOS, Android, Web)
- [ ] Write tests targeting 85%+ coverage
- [ ] Update `docs/LEARNINGS/` with new patterns/gotchas

---

## 📝 When Adding New Patterns

1. Complete the feature
2. Document in `docs/patterns/{TOPIC}.md`
3. Add reference to this file (MEMORY.md)
4. Include code example (copy-paste ready)
5. Link to actual implementation file

---

## ⚡ Emergency Quick Links

**"I have a bug"** → `docs/LEARNINGS/bugs-and-gotchas.md`
**"I need a pattern"** → `docs/patterns/`
**"How long is this?"** → `docs/LEARNINGS/feature-implementation-learnings.md`
**"Where's the code?"** → `docs/reference/FILE-STRUCTURE.md`
**"What's the status?"** → `docs/reference/BMAD-STATUS.md`
**"How do I deploy?"** → `docs/config/` + `QUICK-LINKS.md`

---

**Total Lines:** 180
**Purpose:** Index only - detailed docs in linked files
**Auto-Loads:** Claude Code loads this + referenced files

---

*This is the memory index. Detailed documentation lives in linked files for clean organization and fast navigation.*
