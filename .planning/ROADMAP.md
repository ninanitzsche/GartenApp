# Gartenplaner - Phase 2 & 5 Roadmap

**Milestone:** AI Features + UI Polish
**Requirements:** 10 new requirements (4 AI + 6 UI)
**Goal:** AI Features + Accessibility & Polish

---

## Phase 2: AI Features (Complete)

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | AI Plant ID | Upload photo → Identify plant | AI-01 | ✅ |
| 2 | Pest Detection | Detect problems from photos | AI-02 | ✅ |
| 3 | Task Suggestions | Generate tasks from photos | AI-03 | ✅ |
| 4 | Integration | Connect AI to existing data | AI-04 | ✅ |

---

## Phase 5: UI/UX Polish

| # | Phase | Goal | Requirements | Priority |
|---|-------|------|--------------|----------|
| 1 | Accessibility | Fix touch targets, ARIA | UI-01 | MUST |
| 2 | Theme | Consolidate colors, typography | UI-02 | MUST |
| 3 | Navigation | Restructure More menu | UI-03 | SHOULD |
| 4 | Mobile | SafeArea, Keyboard handling | UI-04 | SHOULD |
| 5 | Interaction | Haptics, animations | UI-05 | COULD |
| 6 | Content | Standardize text | UI-06 | COULD |

---

## Phase 1: AI Plant Identification

**Goal:** User uploads photo → Gets plant name + care tips

**Requirements:**
- AI-01: Plant identification via photo upload

**Success Criteria:**
1. User can upload photo from camera or gallery
2. System returns plant name with 80%+ accuracy
3. Identification links to existing plant database

---

## Phase 2: Pest Detection

**Goal:** Analyze photos for common plant problems

**Requirements:**
- AI-02: Pest/disease detection

**Success Criteria:**
1. System detects 5+ common issues (aphids, powdery mildew, etc.)
2. Shows treatment recommendation
3. Links to knowledge base articles

---

## Phase 3: Task Suggestions

**Goal:** Auto-generate relevant tasks from garden photos

**Requirements:**
- AI-03: Photo-driven task generation

**Success Criteria:**
1. After identification, suggest 2-3 relevant tasks
2. Tasks match plant's current needs (watering, fertilizing, harvesting)
3. User can accept/dismiss suggestions

---

## Phase 4: Integration

**Goal:** Connect AI features to existing app infrastructure

**Requirements:**
- AI-04: Integration with existing data

**Success Criteria:**
1. AI identifications cached locally
2. Works with existing plant database
3. Photo gallery shows AI analysis results

---

## Phase 5: UI/UX Polish

**Goal:** Improve accessibility, consistency, and mobile experience

### Phase 5-1: Accessibility (UI-01)
**Files to fix:**
- `src/components/TaskListItem.tsx:125-131` - Increase checkbox to 44x44px
- All screens - Add `accessibilityLabel` to touchables

**Success Criteria:**
1. All touch targets ≥ 44x44px
2. All interactive elements have labels
3. Screen reader can navigate app

### Phase 5-2: Theme Consolidation (UI-02)
**Files to fix:**
- `HomeScreen.tsx` - Replace `#F44336`, `#2196F3`
- `PlantListScreen.tsx` - Replace hardcoded status colors
- `ShoppingListScreen.tsx` - Add missing theme colors

**Success Criteria:**
1. All colors from theme
2. Typography scale defined
3. Spacing system consistent

### Phase 5-3: Navigation Polish (UI-03)
**Files to fix:**
- `TabNavigator.tsx` - Restructure More menu

**Success Criteria:**
1. "More" menu grouped logically
2. No duplicate FABs
3. Clear navigation hierarchy

### Phase 5-4: Mobile Experience (UI-04)
**Files to fix:**
- All form screens - Add KeyboardAvoidingView
- All screens - Add SafeAreaView wrapper

**Success Criteria:**
1. Keyboard doesn't obscure inputs
2. Safe areas respected
3. Text scaling works

---

## Traceability

| REQ-ID | Phase |
|--------|-------|
| AI-01 | 1 |
| AI-02 | 2 |
| AI-03 | 3 |
| AI-04 | 4 |
| UI-01 | 5.1 |
| UI-02 | 5.2 |
| UI-03 | 5.3 |
| UI-04 | 5.4 |
| UI-05 | 5.5 |
| UI-06 | 5.6 |

---

*Created: 2026-03-19*
*Updated: 2026-03-19 (Phase 5 added)*
