# Visual Polish: POC zu Premium App - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all screens to a consistent Glassmorphism design system and add visual personality through illustrations, animations, and polished navigation.

**Architecture:** Phased approach — Phase 1 consolidates the design system across all screens, Phase 2 adds illustrations and seasonal visuals, Phase 3 adds animations, Phase 4 polishes navigation. Each phase is independently testable.

**Tech Stack:** React Native (Expo 55), react-native-reanimated 4, expo-blur, lucide-react-native, react-native-svg

---

## Phase 1: Design System Consolidation

### Task 1: Extend designSystemV2 with new shadows and seasonal helpers

**Files:**
- Modify: `src/theme/designSystemV2.ts`

- [ ] **Step 1: Add new shadow presets and seasonal gradient helper**

```typescript
// Add to Shadows2026:
glow: {
  shadowColor: '#2D9D4F',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 6,
},
card: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 2,
},

// Add helper function:
export const getSeasonalGradient = (zeitraum: string): string[] => {
  if (zeitraum.includes('fruehjahr')) return LightColors.gradients.spring;
  if (zeitraum.includes('sommer')) return LightColors.gradients.summer;
  if (zeitraum.includes('herbst')) return LightColors.gradients.autumn;
  if (zeitraum.includes('winter')) return LightColors.gradients.winter;
  return LightColors.gradients.spring;
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add src/theme/designSystemV2.ts
git commit -m "feat: extend design system with glow shadows and seasonal gradient helper"
```

---

### Task 2: Migrate MoreMenuScreen to Glassmorphism

**Files:**
- Rewrite: `src/screens/MoreMenuScreen.tsx`

- [ ] **Step 1: Rewrite MoreMenuScreen with Glassmorphism**

Replace the full file content. Key changes:
- `import Colors from '../theme/colors'` → `import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2'`
- `MaterialIcons` → lucide equivalents (User, ShoppingCart, Leaf, BookOpen, LogOut, ChevronRight, Settings)
- `TouchableOpacity` → `Pressable` with animated scale feedback
- Add `BlurView` glass header at top
- Menu sections use GlassCard or surface cards with 2026 shadows
- Spacing/Radius from design system

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/screens/MoreMenuScreen.tsx
git commit -m "feat: migrate MoreMenuScreen to glassmorphism design"
```

---

### Task 3: Migrate GardenOverviewScreen to Glassmorphism

**Files:**
- Rewrite: `src/screens/GardenOverviewScreen.tsx`
- Modify: `src/components/BedCard.tsx`
- Modify: `src/components/GardenStatsCard.tsx`
- Modify: `src/components/MetricCard.tsx` (if exists) or inline

- [ ] **Step 1: Rewrite GardenOverviewScreen**

Key changes:
- `import Colors` → `import { Colors2026, ... } from '../theme/designSystemV2'`
- Add `BlurView` glass header
- Stats section uses GlassCard
- Section titles use Typography2026
- Remove `import { MaterialIcons }` → use lucide icons (Camera, Settings, Plus, Map)

- [ ] **Step 2: Rewrite BedCard**

Key changes:
- `Colors` → `Colors2026`
- Card style: borderRadius `Radius2026.lg`, shadow `Shadows2026.md`
- Color dot gets animated scale on mount
- Lucide icons: Layers, Sprout, ChevronRight

- [ ] **Step 3: Rewrite GardenStatsCard**

Key changes:
- `Colors` → `Colors2026`
- Title uses `Typography2026.title`
- Cards use GlassCard variant="tint"

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/screens/GardenOverviewScreen.tsx src/components/BedCard.tsx src/components/GardenStatsCard.tsx
git commit -m "feat: migrate GardenOverviewScreen, BedCard, GardenStatsCard to glassmorphism"
```

---

### Task 4: Migrate TaskCard to Glassmorphism

**Files:**
- Rewrite: `src/components/TaskCard.tsx`

- [ ] **Step 1: Rewrite TaskCard**

Key changes:
- `Colors` → `Colors2026`
- `TouchableOpacity` → animated Pressable with scale feedback
- Card style: borderRadius `Radius2026.lg`, shadow `Shadows2026.md`, backgroundColor `Colors2026.surface`
- `MaterialIcons` for checkbox → lucide (Circle, CheckCircle2)
- Priority badge uses `Colors2026.priority`

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/TaskCard.tsx
git commit -m "feat: migrate TaskCard to glassmorphism design"
```

---

### Task 5: Migrate OnboardingScreen to Glassmorphism

**Files:**
- Rewrite: `src/screens/OnboardingScreen.tsx`

- [ ] **Step 1: Rewrite OnboardingScreen**

Key changes:
- `Colors` → `Colors2026`
- `TouchableOpacity` → `AnimatedButton` from ui components
- `MaterialIcons` → lucide (Leaf, Download, Info)
- Background: seasonal gradient
- GlassCard for info box
- Add FadeInUp staggered animations via reanimated

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/screens/OnboardingScreen.tsx
git commit -m "feat: migrate OnboardingScreen to glassmorphism design"
```

---

### Task 6: Migrate TaskTimelineScreen to designSystemV2

**Files:**
- Modify: `src/screens/TaskTimelineScreen.tsx`

- [ ] **Step 1: Replace hardcoded colors**

Key changes:
- Replace `'#FAFAFA'` → `Colors2026.bg`
- Replace `'#4CAF50'` → `Colors2026.primary`
- Replace `'#D32F2F'` → `Colors2026.status.error`
- Add import for `Colors2026` from designSystemV2

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/screens/TaskTimelineScreen.tsx
git commit -m "fix: migrate TaskTimelineScreen to designSystemV2 colors"
```

---

### Task 7: Merge old EmptyState into ui/EmptyState and migrate callers

**Files:**
- Modify: `src/components/ui/EmptyState.tsx` (add backward-compatible `message` prop alias)
- Delete: `src/components/EmptyState.tsx` (old version)
- Modify: all files importing from `../components/EmptyState` → `../components/ui/EmptyState`

- [ ] **Step 1: Find all importers of the old EmptyState**

Run: `grep -r "from '../components/EmptyState'" src/ --include="*.tsx"`
Expected: List of files using old import (e.g., `GardenOverviewScreen.tsx`, `BedDetailScreen.tsx`, etc.)

- [ ] **Step 2: Update EmptyState.tsx props to accept both `subtitle` and `message`**

The new `ui/EmptyState.tsx` uses `subtitle`, the old one uses `message`. Add `message?: string` as an alias that maps to `subtitle`:

```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  message?: string; // backward compat alias for subtitle
  action?: React.ReactNode;
  animated?: boolean;
  testID?: string;
}
```

In the component body: `const displaySubtitle = subtitle || message;`

- [ ] **Step 3: Update all importers to use ui/EmptyState**

For each file found in Step 1:
- Change `import EmptyState from '../components/EmptyState'` → `import EmptyState from '../components/ui/EmptyState'`
- Change `icon="some-material-icon"` → `icon={<MaterialIcons name="some-material-icon" size={40} color={Colors2026.primary} />}`
- Change `message="..."` → `subtitle="..."`
- Change `action={{ label: "...", onPress: ... }}` → `action={<AnimatedButton title="..." onPress={...} variant="primary" />}`

- [ ] **Step 4: Delete old EmptyState**

```bash
rm src/components/EmptyState.tsx
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: merge old EmptyState into ui/EmptyState and migrate all callers"
```

---

### Task 8: Deprecate old colors.ts

**Files:**
- Modify: `src/theme/colors.ts`

- [ ] **Step 1: Add deprecation notice to colors.ts**

Add at top of file:
```typescript
/**
 * @deprecated Use designSystemV2.ts instead. This file is kept for migration reference only.
 */
```

- [ ] **Step 2: Verify no new imports of colors.ts exist in migrated files**

Run: `grep -r "from '../theme/colors'" src/screens/ src/components/ --include="*.tsx" | grep -v node_modules`
Expected: Only files not yet migrated appear (or none if all migrated)

- [ ] **Step 3: Commit**

```bash
git add src/theme/colors.ts
git commit -m "chore: deprecate old colors.ts in favor of designSystemV2"
```

---

## Phase 2: Visual Personality

### Task 9: Create SVG illustration components

**Files:**
- Create: `src/components/illustrations/EmptyPlantsIllustration.tsx`
- Create: `src/components/illustrations/EmptyTasksIllustration.tsx`
- Create: `src/components/illustrations/EmptyHarvestIllustration.tsx`
- Create: `src/components/illustrations/EmptyPhotosIllustration.tsx`

- [ ] **Step 1: Create EmptyPlantsIllustration**

Uses `react-native-svg` (already in dependencies). Component renders a 120x120 SVG with:
- A small rounded pot (ellipse bottom, rectangle body)
- Two curved stems growing from the pot
- 3 small leaf shapes (ellipses rotated 45deg) on the stems
- One water droplet shape falling from above
- Colors: primary green for leaves, brown for pot, blue for droplet
- Props: `size?: number` (default 120), `color?: string` (default `Colors2026.primary`)

- [ ] **Step 2: Create EmptyTasksIllustration**

Component renders a 120x120 SVG with:
- Horizontal ground line
- A simple tree trunk (rectangle) with circular canopy (3 overlapping circles)
- A bench shape (two rectangles: seat + backrest) under the tree
- One or two small birds (simple V-shapes) in the canopy
- Colors: brown trunk, green canopy, warm wood tone for bench

- [ ] **Step 3: Create EmptyHarvestIllustration**

Component renders a 120x120 SVG with:
- A woven basket shape (rounded trapezoid with horizontal lines for weave pattern)
- 3 simple fruit shapes peeking out: circle (tomato), elongated oval (zucchini), small circle (cherry)
- Colors: warm brown basket, red/green/orange for fruits

- [ ] **Step 4: Create EmptyPhotosIllustration**

Component renders a 120x120 SVG with:
- A camera body (rounded rectangle) with a circular lens in the center
- 3-4 small flower shapes around the camera (circle + small circle center, with tiny leaf)
- One flower on top of the camera
- Colors: muted gray camera body, colorful flowers (pink, yellow, purple)

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/illustrations/
git commit -m "feat: add custom SVG illustration components for empty states"
```

---

### Task 10: Update EmptyState components to use illustrations

**Files:**
- Modify: `src/components/ui/EmptyState.tsx` (if icon prop can accept illustrations)
- Update callers in screens that use EmptyState with new illustrations

- [ ] **Step 1: Wire up illustrations in screens that show empty states**

Mapping:
| Screen | Illustration | File |
|--------|-------------|------|
| `PlantListScreen.tsx` (Tab 0, empty plants) | `EmptyPlantsIllustration` | `src/screens/PlantListScreen.tsx:233` |
| `HomeScreen.tsx` (empty dashboard) | `EmptyTasksIllustration` | `src/screens/HomeScreen.tsx:413` |
| `HarvestLogScreen.tsx` (empty harvests) | `EmptyHarvestIllustration` | `src/screens/HarvestLogScreen.tsx` |
| `PhotoGalleryScreen.tsx` (empty photos) | `EmptyPhotosIllustration` | `src/screens/PhotoGalleryScreen.tsx` |

In each screen: import the illustration, pass it as the `icon` prop to `EmptyState`. The `icon` prop accepts `ReactNode` so this works directly.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/screens/PlantListScreen.tsx src/screens/HomeScreen.tsx src/screens/HarvestLogScreen.tsx src/screens/PhotoGalleryScreen.tsx
git commit -m "feat: use custom illustrations in empty states"
```

---

### Task 11: Add seasonal backgrounds to splash and headers

**Files:**
- Modify: `app.json` (splash config)
- Modify: `src/screens/HomeScreen.tsx` (header gradient)
- Modify: `src/screens/LoginScreen.tsx` (background gradient)

- [ ] **Step 1: Update app.json splash background**

Change `splash.backgroundColor` to a seasonal green: `"#E8F5E9"` (spring light green)

- [ ] **Step 2: Add seasonal gradient to HomeScreen header**

Replace the static `backgroundColor: 'rgba(255,255,255,0.85)'` in glassHeader with a seasonal tint. Use `getAktuelleSaison()` from `src/utils/zeitraumUtils.tsx` (already exists in codebase) to determine season, then apply `getJahreszeit()` to get the season key, and use `Colors2026.seasonal[key].bg` as a tinted background.

- [ ] **Step 3: Add seasonal gradient to LoginScreen**

The `backgroundGradient` already uses `Colors2026.seasonal.spring.bg` — make it dynamic. Import `getAktuelleSaison` and `getJahreszeit` from `src/utils/zeitraumUtils.tsx`, then use `Colors2026.seasonal[season].bg` instead of hardcoded spring.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add app.json src/screens/HomeScreen.tsx src/screens/LoginScreen.tsx
git commit -m "feat: add seasonal gradient backgrounds to splash and headers"
```

---

### Task 12: Create reduced-motion animation helper

**Files:**
- Create: `src/utils/accessibility.ts`

- [ ] **Step 1: Create useReduceMotion hook and conditional animation helpers**

```typescript
import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
import { FadeIn, FadeInUp } from 'react-native-reanimated';

export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);
  return reduceMotion;
}

// Returns undefined (no animation) if reduce motion is enabled
export function safeFadeIn(reduceMotion: boolean, delay = 0) {
  return reduceMotion ? undefined : FadeIn.delay(delay).duration(300);
}
export function safeFadeInUp(reduceMotion: boolean, delay = 0) {
  return reduceMotion ? undefined : FadeInUp.delay(delay).duration(300);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/accessibility.ts
git commit -m "feat: add reduce-motion accessibility helpers for animations"
```

---

### Task 13: Enhance OnboardingScreen with animation and progress dots

**Files:**
- Modify: `src/screens/OnboardingScreen.tsx`

- [ ] **Step 1: Add staggered FadeInUp animations**

Import `useReduceMotion` and `safeFadeInUp` from `src/utils/accessibility.ts`.
Wrap UI elements in `Animated.View` with conditional staggered entry:
1. Icon (delay 0ms)
2. Title (delay 100ms)
3. Description (delay 200ms)
4. Info Box (delay 300ms)
5. Buttons (delay 400ms)

If reduceMotion is true, skip all animations (render plain Views).

- [ ] **Step 2: Add progress dots at the bottom**

Add a row of 3 dots at the bottom of the OnboardingScreen content. First dot is filled (active), others are outlined. Style: 8px circles, active = `Colors2026.primary`, inactive = `Colors2026.border`, gap 8px.

- [ ] **Step 3: Commit**

```bash
git add src/screens/OnboardingScreen.tsx
git commit -m "feat: add staggered entry animation and progress dots to onboarding"
```

---

## Phase 3: Animations & Micro-Interactions

### Task 14: Add staggered list entry to PlantListScreen

**Files:**
- Modify: `src/screens/PlantListScreen.tsx`

- [ ] **Step 1: Wrap plant cards in Animated.View with staggered FadeIn**

Import `useReduceMotion` and `safeFadeInUp` from `src/utils/accessibility.ts`.
In `renderPlantItem`, wrap the returned `Pressable` conditionally:
```tsx
{reduceMotion ? (
  <Pressable ...>
) : (
  <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
    <Pressable ...>
  </Animated.View>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/PlantListScreen.tsx
git commit -m "feat: add staggered list entry animation to plant list"
```

---

### Task 15: Add staggered list entry to TaskCard lists

**Files:**
- Modify: `src/components/TaskCard.tsx`

- [ ] **Step 1: Add FadeInUp animation to TaskCard**

Import `useReduceMotion` and `safeFadeInUp` from `src/utils/accessibility.ts`.
Wrap the card container in `Animated.View` with conditional `FadeInUp` entering animation (skip if reduceMotion).

- [ ] **Step 2: Commit**

```bash
git add src/components/TaskCard.tsx
git commit -m "feat: add staggered entry animation to task cards"
```

---

### Task 16: Add check animation to task completion

**Files:**
- Modify: `src/components/TaskCard.tsx`

- [ ] **Step 1: Add scale-bounce animation on checkbox toggle**

Import `useReduceMotion`. When task is toggled, animate the checkbox icon (skip if reduceMotion):
- Scale from 1 → 1.3 → 1 (bounce)
- Color transition from muted → success color
- Use `withSequence(withSpring(1.3), withSpring(1))`

- [ ] **Step 2: Commit**

```bash
git add src/components/TaskCard.tsx
git commit -m "feat: add bounce animation on task completion toggle"
```

---

### Task 17: Add tab switch transitions

**Files:**
- Modify: `src/screens/PlantListScreen.tsx` (has tab selector)

- [ ] **Step 1: Add Fade transition between tab content**

Import `useReduceMotion`. In `renderTabContent`, wrap each case return in conditional `Animated.View` with `FadeIn.duration(200)` (skip if reduceMotion).

- [ ] **Step 2: Commit**

```bash
git add src/screens/PlantListScreen.tsx
git commit -m "feat: add fade transition on tab switch"
```

---

## Phase 4: Navigation Polish

### Task 18: Create GlassTabBar component

**Files:**
- Create: `src/components/ui/GlassTabBar.tsx`

- [ ] **Step 1: Create GlassTabBar component**

A custom tab bar component that:
- Uses `BlurView` as background (intensity 80)
- Semi-transparent tint color
- Has a subtle top border (glass edge)
- Active tab indicator: a small dot or glow under the active icon (NOT a sliding underline — that's out of scope)
- Uses lucide icons
- Receives `state`, `descriptors`, `navigation` from React Navigation

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/GlassTabBar.tsx
git commit -m "feat: create GlassTabBar component with blur and animated indicator"
```

---

### Task 19: Integrate GlassTabBar into TabNavigator

**Files:**
- Modify: `src/navigation/TabNavigator.tsx`

- [ ] **Step 1: Replace default tab bar with GlassTabBar**

```tsx
<Tab.Navigator
  tabBar={(props) => <GlassTabBar {...props} />}
  screenOptions={{ headerShown: false }}
>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/navigation/TabNavigator.tsx
git commit -m "feat: integrate GlassTabBar into TabNavigator"
```

---

### Task 20: Verify full build compiles

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: All tests pass (or only pre-existing failures)

- [ ] **Step 3: Final commit if needed**

```bash
git add -A
git commit -m "chore: visual polish complete — glassmorphism across all screens"
```

---

## Out of Scope (Intentional Trimming)

The following items from the spec are **not included** in this plan — they were cut for scope to keep this plan focused on the highest-impact changes:

- **Pull-to-Refresh with seasonal icon** — nice-to-have, low impact vs. effort
- **Scroll-Parallax on detail screens** — complex Animated.ScrollView work, deferrable
- **Card-Press-Effects on all cards** — already implemented in GlassCard/AnimatedButton; extending to every card is polish-on-polish
- **Screen-Transitions (Shared Element)** — too complex for now, needs `react-native-shared-element` which has compatibility issues with Expo 55
- **GlassTabBar sliding underline** — the blur + indicator is sufficient; sliding animation can be added later

These can be picked up in a future phase if the user wants more polish.
