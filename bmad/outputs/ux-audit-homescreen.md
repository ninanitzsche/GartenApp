# UX Audit Report: Gartenplaner HomeScreen

**Date:** 2026-03-20  
**Auditor:** BMAD UX Audit  
**Files Reviewed:**
- `src/screens/HomeScreen.tsx`
- `src/components/TaskCard.tsx`
- `src/components/LearningCard.tsx`
- `src/components/PrioritaetBadge.tsx`
- `src/components/MetricCard.tsx`
- `src/components/ProgressBar.tsx`
- `src/theme/colors.ts`

---

## Summary Scores

| Category | Score | Grade |
|----------|-------|-------|
| **Visual Design** | 7/10 | Good |
| **Accessibility (WCAG 2.1 AA)** | 4/10 | Needs Work |
| **User Experience** | 7/10 | Good |
| **Component Quality** | 6/10 | Acceptable |
| **Overall** | **6/10** | **Acceptable** |

---

## 1. Visual Design (7/10)

### 1.1 Color Consistency ✅
**Score: 8/10**

Colors are consistently used from the design system:
- Primary green (`#4CAF50`) used for main actions
- Status colors properly mapped (`src/screens/HomeScreen.tsx:174-186`)
- Priority colors defined (`src/theme/colors.ts:47-49`)

**Issue:** Hardcoded color in `HomeScreen.tsx:247`:
```tsx
color="#F44336" // Should use Colors.error
```

### 1.2 Typography Hierarchy ✅
**Score: 7/10**

| Element | Size | Weight | Status |
|---------|------|--------|--------|
| Page Title | 28px | Bold | ✅ |
| Section Title | 16px | SemiBold | ✅ |
| Card Title | 14px | Medium | ✅ |
| Body Text | 12-13px | Regular | ✅ |
| Labels | 10-12px | SemiBold | ✅ |

**Minor Issue:** Font size jumps from 28px to 16px could use intermediate 20-22px for subsection headers.

### 1.3 Spacing (8px Grid) ✅
**Score: 7/10**

Spacing generally follows 8px grid:
- Section margins: 24px ✅
- Card padding: 12px ✅
- Content padding: 16px ✅
- Gaps: 8px, 12px ✅

**Minor Issue:** Inconsistent gap usage - `flexDirection: 'row'` with `gap` property but some areas use `marginRight` instead.

---

## 2. Accessibility (WCAG 2.1 AA) (4/10) - CRITICAL

### 2.1 Color Contrast ⚠️

| Foreground | Background | Ratio | WCAG AA | Status |
|------------|------------|-------|---------|--------|
| `#424242` (text) | `#FAFAFA` (bg) | 10.5:1 | 4.5:1 ✅ | Pass |
| `#757575` (textLight) | `#FAFAFA` (bg) | 4.1:1 | 4.5:1 ❌ | **Fail** |
| `#4CAF50` (primary) | `#FFFFFF` (card) | 3.2:1 | 3.0:1 ✅ | Pass |
| `#FFFFFF` (badge) | `#D32F2F` (priorityHigh) | 4.6:1 | 3.0:1 ✅ | Pass |
| `#FFFFFF` (badge) | `#F57C00` (priorityMedium) | 2.9:1 | 3.0:1 ❌ | **Fail** |

**Critical Issue:** `textLight` (#757575) on `background` (#FAFAFA) fails WCAG AA.

**References:**
- `src/theme/colors.ts:25` - textLight definition
- Multiple usages throughout components

### 2.2 Touch Targets ❌
**Score: 2/10 - CRITICAL**

| Component | Size | Min Required | Status |
|-----------|------|---------------|--------|
| Checkbox (TaskCard) | 24×24px | 44×44px | ❌ **Fail** |
| Dismiss Button (LearningCard) | ~22×22px | 44×44px | ❌ **Fail** |
| Rating Buttons | ~26×18px | 44×44px | ❌ **Fail** |
| Priority Badge | 24×18px | 44×44px | ❌ **Fail** |

**References:**
- `src/components/TaskCard.tsx:88-94`
- `src/components/LearningCard.tsx:25-27, 39-52`

### 2.3 Keyboard Navigation ⚠️
**Score: 5/10**

- TouchableOpacity used for interactive elements ✅
- No `accessibilityRole` specified on many elements ❌
- No `accessibilityState` for checked/unchecked states ❌

**References:**
- `src/components/TaskCard.tsx:50-57` - Missing accessibilityRole='checkbox'

### 2.4 Screen Reader Support ❌
**Score: 3/10**

**Missing ARIA:**
- Checkbox state not announced (`src/components/TaskCard.tsx:52-56`)
- Rating buttons lack labels (`src/components/LearningCard.tsx:39-52`)
- Section titles not marked as headings
- Status bars lack descriptions (`src/screens/HomeScreen.tsx:386-406`)

**Only one accessibilityLabel exists:**
- `src/screens/HomeScreen.tsx:444` - Empty state

---

## 3. User Experience (7/10)

### 3.1 Information Hierarchy ✅
**Score: 8/10**

Content prioritization:
1. ✅ Header with context
2. ✅ Harvest summary (when data exists)
3. ✅ Task completion metrics
4. ✅ Prioritized tasks grouped by Zeitraum
5. ✅ Learning tips by season
6. ✅ Plant status distribution
7. ✅ Recent activity
8. ✅ Empty state fallback

**Matches wireframe design** from `docs/superpowers/wireframes/approach-b-wireframes.md`.

### 3.2 Logical Groupings ✅
**Score: 7/10**

- Tasks grouped by Zeitraum ✅
- Current season visually distinguished with "Aktiv" badge ✅
- Metrics in grid layout ✅
- Activity items are scannable ✅

**Issue:** Status distribution bars (`src/screens/HomeScreen.tsx:541-560`) are hard to compare - bars don't align vertically.

### 3.3 Content Prioritization ⚠️
**Score: 6/10**

The "Nächste Aufgaben" section is placed after metrics, but according to the wireframe, tasks should be the primary focus.

---

## 4. Component Quality (6/10)

### 4.1 State Handling ✅
**Score: 7/10**

| State | Handled? | Implementation |
|-------|----------|-----------------|
| Loading | ✅ | ActivityIndicator, SkeletonCard |
| Empty | ✅ | Empty state with guidance |
| Error | ⚠️ | Console.error only, no UI feedback |
| Refresh | ✅ | Pull-to-refresh implemented |

**Reference:** `src/screens/HomeScreen.tsx:217-223`

### 4.2 User Feedback ⚠️
**Score: 5/10**

**Missing Feedback:**
- No success toast after task completion
- No error message UI when data fetch fails
- No loading state for individual actions (rating, dismissing)

**Reference:** `src/screens/HomeScreen.tsx:147-154`

### 4.3 Discoverability ✅
**Score: 7/10**

- Interactive elements are visually distinct (checkbox, buttons)
- Icons provide affordance
- Empty state provides clear call-to-action guidance

---

## Critical Issues (Score < 7)

### 🔴 P0: Touch Targets Too Small
**Severity:** Critical  
**Impact:** WCAG 2.1 AA non-compliance

**Affected Components:**
- `src/components/TaskCard.tsx:88-94` - Checkbox (24×24px)
- `src/components/LearningCard.tsx:25,39-52` - Dismiss & Rating buttons

**Fix:**
```tsx
// TaskCard.tsx - Increase checkbox touch area
checkbox: {
  width: 44,
  height: 44,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 8,
},

// LearningCard.tsx - Increase button touch targets
ratingButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  padding: 10, // Was: 4
  minWidth: 44,
  minHeight: 44,
},
```

### 🔴 P0: Color Contrast Failures
**Severity:** Critical  
**Impact:** WCAG 2.1 AA non-compliance

| Issue | Current | Recommended |
|-------|---------|-------------|
| textLight on background | #757575 on #FAFAFA (4.1:1) | #616161 or darker |
| priorityMedium badge | #FFFFFF on #F57C00 (2.9:1) | Use darker text or lighter bg |

**Fix in `src/theme/colors.ts`:**
```ts
textLight: '#616161', // Was: #757575 - Now passes 4.5:1
```

### 🟠 P1: Missing ARIA Labels
**Severity:** High  
**Impact:** Screen reader users cannot understand interface

**Affected Areas:**
- TaskCard checkbox needs `accessibilityLabel`
- Rating buttons need `accessibilityLabel`
- Status bars need `accessibilityLabel`

**Fix:**
```tsx
// TaskCard.tsx
<TouchableOpacity 
  style={styles.checkbox} 
  onPress={onToggle}
  accessibilityRole="checkbox"
  accessibilityState={{ checked: isCompleted }}
  accessibilityLabel={isCompleted ? 'Aufgabe erledigt' : 'Aufgabe nicht erledigt'}
>
```

### 🟠 P1: No User Feedback for Actions
**Severity:** High  
**Impact:** Poor UX - users don't know if actions succeeded

**References:**
- `src/screens/HomeScreen.tsx:147-154` - handleToggleTask
- `src/screens/HomeScreen.tsx:156-163` - handleRateLearning

**Fix:** Add visual feedback (toast, animation) or at minimum haptic feedback.

### 🟡 P2: Status Distribution Bars Hard to Read
**Severity:** Medium  
**Impact:** Users cannot easily compare plant status counts

**Reference:** `src/screens/HomeScreen.tsx:541-560`

**Fix:** Use consistent bar heights with count labels aligned.

---

## Recommended Fixes Summary

| Priority | Issue | Estimated Effort |
|----------|-------|-------------------|
| P0 | Increase touch targets to 44×44px | 30 min |
| P0 | Fix color contrast for textLight | 5 min |
| P1 | Add ARIA labels for screen readers | 1 hour |
| P1 | Add success/error feedback for actions | 1 hour |
| P2 | Improve status distribution readability | 30 min |
| P2 | Use Colors.error instead of hardcoded color | 5 min |
| P3 | Add intermediate typography size | 15 min |

---

## Positive Aspects

1. **Clean component architecture** - Well-separated concerns
2. **Consistent styling** - Uses shared theme
3. **Good empty state** - Clear guidance for new users
4. **Skeleton loading** - Better perceived performance
5. **Logical data grouping** - Zeitraum organization matches wireframe
6. **Pull-to-refresh** - Native mobile pattern

---

## Files Requiring Changes

| File | Changes Needed |
|------|----------------|
| `src/theme/colors.ts` | Fix textLight contrast |
| `src/components/TaskCard.tsx` | Touch targets, ARIA |
| `src/components/LearningCard.tsx` | Touch targets, ARIA |
| `src/screens/HomeScreen.tsx` | Use Colors.error, add feedback |
| `src/components/ProgressBar.tsx` | ARIA labels for bars |

---

*Audit completed: 2026-03-20*
