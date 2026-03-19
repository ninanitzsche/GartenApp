# Gartenplaner Phase 2 - Requirements

**Last Updated:** 2026-03-19
**Milestone:** AI Features

---

## v2 Requirements (Phase 2)

### AI-01: Plant Identification
- [ ] User can upload photo from camera
- [ ] User can upload photo from gallery
- [ ] System identifies plant using Claude Vision API
- [ ] System returns plant name with confidence score
- [ ] Identification links to existing plant database

### AI-02: Pest/Disease Detection
- [ ] System analyzes photo for common issues
- [ ] System detects 5+ common problems (aphids, powdery mildew, etc.)
- [ ] System shows treatment recommendation
- [ ] System links to knowledge base articles

### AI-03: Photo-Driven Task Suggestions
- [ ] After identification, system suggests relevant tasks
- [ ] Tasks match plant's current needs
- [ ] User can accept suggested task
- [ ] User can dismiss suggested task

### AI-04: AI Integration
- [ ] Identifications cached locally (AsyncStorage)
- [ ] Cache reduces API calls for known plants
- [ ] AI results stored with photo metadata
- [ ] Works with existing photo gallery

---

## v3 Requirements (Phase 5 - UI/UX Polish)

### UI-01: Accessibility Improvements
**Priority:** MUST
- [ ] Add `accessibilityLabel` to all interactive elements
- [ ] Increase touch targets to minimum 44x44px
- [ ] Add ARIA roles where semantic HTML insufficient
- [ ] Visible focus indicators

### UI-02: Theme Consolidation
**Priority:** MUST
- [ ] Extract all hardcoded colors to `src/theme/colors.ts`
- [ ] Create typography scale
- [ ] Define spacing system (8px base)
- [ ] Add semantic color aliases

### UI-03: Navigation Polish
**Priority:** SHOULD
- [ ] Restructure "More" tab into submenus
- [ ] Remove duplicate FABs where confusing
- [ ] Add global search capability

### UI-04: Mobile Experience
**Priority:** SHOULD
- [ ] Add SafeAreaView handling
- [ ] Add KeyboardAvoidingView to forms
- [ ] Handle text scaling (accessibility font sizes)

### UI-05: Interaction Polish
**Priority:** COULD
- [ ] Add haptic feedback on key actions
- [ ] Animate sort/filter panels
- [ ] Add loading states to list item actions

### UI-06: Content Consistency
**Priority:** COULD
- [ ] Standardize capitalization (Title Case)
- [ ] Improve error messages
- [ ] Add unit indicators

---

## Out of Scope (Phase 2)

| Feature | Reason |
|---------|--------|
| Real-time video analysis | Too complex, battery drain |
| Sensor integration | Hardware, not MVP scope |
| Social sharing | Not core value proposition |

## Out of Scope (Phase 5)

| Feature | Reason |
|---------|--------|
| Responsive design for tablet | Not MVP priority |
| Dark mode | Nice-to-have |
| Full redesign | Current design is functional |

---

## Traceability

| REQ-ID | Phase |
|--------|-------|
| AI-01 | 1 |
| AI-02 | 2 |
| AI-03 | 3 |
| AI-04 | 4 |
| UI-01 | 5 |
| UI-02 | 5 |
| UI-03 | 5 |
| UI-04 | 5 |
| UI-05 | 5 |
| UI-06 | 5 |

---

*Created: 2026-03-19*
*Updated: 2026-03-19 (Phase 5 added)*
