# GSD Performance + UX Audit Report
**Branch:** `feature/ux-redesign-approach-b`
**Date:** 2026-03-20
**Auditor:** GSD Auditor Agent

---

## 1. Performance Issues

### Issues Found:

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| P1 | `zeitraumService.ts` | 122 | `Object.entries(PFLANZEN_ZEITRAUM)` - O(n) linear search on every `suggestZeitraum()` call. Plant lookup should use a Map for O(1) access | HIGH |
| P2 | `zeitraumUtils.ts` | 42-83 | `getAktuelleSaison()` - No memoization. Called repeatedly without caching results | MEDIUM |
| P3 | `TaskCard.tsx` | 18 | `(task as any).zeitraum` - Unsafe type cast. `zeitraum` exists on Task type, no need for `any` | MEDIUM |
| P4 | `zeitraumUtils.ts` | 20-25, 31-36 | String operations (`startsWith`, `endsWith`) used instead of enum-based lookup. Minor perf impact but poor pattern | LOW |
| P5 | `TabNavigator.tsx` | 8-11 | All screen components eagerly imported. No lazy loading - increases initial bundle | MEDIUM |
| P6 | `TabNavigator.tsx` | 40-42 | Icons created inline on every render - should use `useMemo` | LOW |

---

## 2. UX Issues

### Issues Found:

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| U1 | `zeitraum.ts` | 64-78 | Emojis in `ZEITRAUM_SHORT_LABELS` - Accessibility (Screen Reader) problems, platform-specific rendering | HIGH |
| U2 | `PrioritaetBadge.tsx` | 14 | `niedrig` priority uses `Colors.textLight` - Potential low contrast on light backgrounds | HIGH |
| U3 | `TaskCard.tsx` | 77 | `gap: 8` property - Not supported in React Native <0.71. Compatibility issue | MEDIUM |
| U4 | `TaskCard.tsx` | - | No loading/skeleton state - Blank screen while data loads | MEDIUM |
| U5 | `GardenStackNavigator.tsx` | 15 | `PhotoGalleryScreen` imported but not used in stack - Dead code | LOW |
| U6 | `zeitraumUtils.ts` | 61-63, 78 | Complex day-based phase calculation with magic numbers (20th of month) - Unclear UX logic | MEDIUM |

---

## 3. Architecture Concerns

### Issues Found:

| # | File | Issue | Impact |
|---|------|-------|--------|
| A1 | `task.ts` | `TaskFormData` uses `string` for `category` and `priority` instead of union types - No compile-time safety | HIGH |
| A2 | `zeitraumService.ts` | `PFLANZEN_ZEITRAUM` is hardcoded data - Should come from API/config/DB | MEDIUM |
| A3 | `zeitraumService.ts` | Functions `getJahreszeit()` and `getPhase()` in utils use string manipulation instead of proper enum mapping | MEDIUM |
| A4 | `zeitraumUtils.ts` | Static utility functions - Hard to test, cannot inject for mocking | MEDIUM |
| A5 | `zeitraumService.ts` | Service includes both `PFLANZEN_ZEITRAUM` (plant-specific) and `KATEGORIE_ZEITRAUM` (category-based) - Conceptually mixed concerns | LOW |
| A6 | `TaskCard.tsx` | Component imports from both `task.ts` and `zeitraum.ts` - Tight coupling between domain types | LOW |

---

## 4. Security Issues

### Issues Found:

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| S1 | `zeitraumService.ts` | 121-123 | `plantName.includes()` with regex-like pattern could be vulnerable to ReDoS with crafted input strings | MEDIUM |
| S2 | `task.ts` | 30-31 | `TaskFormData` has no input validation - `category` and `priority` accept any string | LOW |
| S3 | General | - | No visible sanitization for user-provided strings displayed in UI | LOW |

---

## 5. Priorisierte Verbesserungsliste

### Phase 1 (Critical - Fix ASAP)

1. **Fix `TaskCard.tsx:18`** - Remove `any` cast, use proper type assertion or extend Task type
2. **Fix `PrioritaetBadge.tsx:14`** - Ensure WCAG AA contrast for "niedrig" badge (add explicit background or change color)
3. **Replace emojis in `zeitraum.ts`** - Use vector icons instead for accessibility

### Phase 2 (High Priority)

4. **Optimize `zeitraumService.ts`** - Convert `PFLANZEN_ZEITRAUM` array to `Map<string, Zeitraum>` for O(1) lookup
5. **Add input validation to `TaskFormData`** - Use Zod or explicit union types for `category` and `priority`
6. **Implement lazy loading for screens** - Use `React.lazy()` for TabNavigator screens

### Phase 3 (Medium Priority)

7. **Memoize `getAktuelleSaison()`** - Cache result or make pure and memoize at call site
8. **Replace string operations with enum mapping** - Clean up `getJahreszeit()` and `getPhase()`
9. **Add loading skeleton to `TaskCard`** - Prevent layout shift
10. **Fix `gap` property compatibility** - Use `flexDirection` + `marginRight` pattern

### Phase 4 (Low Priority)

11. **Remove dead import** - `PhotoGalleryScreen` from `GardenStackNavigator.tsx`
12. **Extract hardcoded plant data** - Move to config/external source
13. **Add React.memo to icon components** - Minor optimization

---

## 6. Dimension Scores

| Dimension | Score | Reasoning |
|-----------|-------|-----------|
| **Performance** | **7/10** | No N+1 queries detected (service layer), minor optimization opportunities in zeitraum lookups |
| **UX** | **6/10** | Accessibility issues (emojis), compatibility concerns (gap property), missing loading states |
| **Architecture** | **7/10** | Good separation between types/utils/services, but TaskFormData lacks type safety, static utils reduce testability |
| **Security** | **8/10** | React Native/Supabase provides good protection, minor concerns around input validation |

### Overall Score: **7/10**

**Summary:** Solid implementation with clean separation of concerns. Main issues are accessibility (emojis), type safety gaps (any cast, string types), and performance optimizations for plant lookup. No critical security vulnerabilities detected.

---

*Report generated by GSD Auditor*
