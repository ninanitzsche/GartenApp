# 🌱 Feature Implementation Learnings

**Was war schwierig bei jeder Feature in Gartenplaner**
**Datum:** 2026-03-04
**Status:** Will be updated with each sprint

---

## 🌿 Plant CRUD (STORY-001)

**What Went Well:**
- Service Layer Pattern worked perfectly
- Supabase felt natural for CRUD
- TypeScript types caught bugs early

**What Was Hard:**
- Initial RLS setup (first time setting up Supabase)
- Mapping plant data from seed data

**Time Spent:** 5 points (actual)
**Quality:** ✅ Production ready first try

---

## 🔍 Plant Search & Filter (STORY-002)

**What Went Well:**
- Debounce pattern (300ms) feels snappy
- Multi-select filter is UX-friendly
- Search works offline (data in state)

**What Was Hard:**
- Debounce timing (too fast = hammers DB, too slow = feels slow)
- Filter state management (easy to get stale)

**Time Spent:** 5 points
**Quality:** ✅ Production ready, used as reference in later sprints

---

## 📸 Photo Upload & Gallery (STORY-041)

**What Went Well:**
- expo-image-picker works great for photos
- ImageResizer (70% compression) saved storage & bandwidth
- 2-column grid on FlatList performs well

**What Was Hard:**
- Image compression: Finding right balance (quality vs size)
- Web-specific issue: blob:// URI handling
- Storage cleanup (no automatic deletion)

**Time Spent:** 5 points
**Quality:** ⚠️ Works on Native, Web needs testing

**Learning:** Always test Web version by Day 2!

---

## 🛒 Shopping List (STORY-017)

**What Went Well:**
- Simple CRUD pattern
- Dashboard visualization works well
- Cost tracking is accurate

**What Was Hard:**
- Bulk operations (mark all purchased) - RLS made it tricky
- Cost calculations - floating point precision
- Filtering purchased vs unpurchased

**Time Spent:** 5 points
**Quality:** ✅ Production ready

---

## 🔐 Authentication (STORY-033 + STORY-033b)

**What Went Well:**
- Supabase Auth is super simple
- Session persistence works automatically
- AuthContext pattern is clean

**What Was Hard:**
- Password reset email flow (Supabase config)
- Profile update (separate from Auth)
- Logout security (clearing local state)
- RLS for user-scoped data (must check auth.uid())

**Time Spent:** 5 + 5 points
**Quality:** ✅ Secure and production ready

**Learning:** Always test password reset early!

---

## ✅ Task Management (STORY-004)

**What Went Well:**
- Priority sorting works well
- Task completion flow is intuitive
- Seasonal suggestions are nice UX

**What Was Hard:**
- Dynamic task generation (complex logic)
- Recurrence (every 2 weeks, monthly, etc.)
- Notification timing

**Time Spent:** 5 points
**Quality:** ⚠️ Basic version works, advanced features incomplete

---

## 📚 Knowledge Database (Future)

**Estimated Learning:**
- Seeding 50+ articles (time consuming)
- Search in knowledge DB
- Linking plants to articles

**Estimated Time:** 3-5 points per feature

---

## 🎨 Upcoming Features

### Planting Plans (Phase 1, Future)
- Complexity: Medium
- Risk: DB schema changes
- Estimated: 5 points

### Success Tracking (Phase 1, Future)
- Complexity: Low
- Risk: Low (mostly UI)
- Estimated: 3 points

### KI Plant ID (Phase 2, Future)
- Complexity: High
- Risk: API integration, accuracy
- Estimated: 8 points

---

## 💡 Patterns That Worked

✅ Service Layer Pattern (reuse in ALL features)
✅ Supabase + RLS (security by default)
✅ TypeScript Strict Mode (fewer bugs)
✅ Custom Hooks (reusable logic)
✅ FlatList Optimization (performance)

---

**Status:** 🟢 Growing with each sprint
**Next Update:** After Sprint 6

