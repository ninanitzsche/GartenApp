# Sprint 5 Plan: Gartenplaner

**Date:** 2026-03-03
**Sprint:** Sprint 5 (2026-04-28 bis 2026-05-12)
**Scrum Master:** ninanitzsche
**Status:** PLANNED

---

## Executive Summary

Sprint 5 focuses on **improving type safety, enabling photo uploads, and expanding testing coverage**. Based on Sprint 3 Recommendations, these are high-priority enhancements that improve developer experience and unlock photo management features.

**Key Focus Areas:**
1. Type-safe navigation with RootStackParamList (STORY-040)
2. Photo upload & gallery management (STORY-041)
3. Integration testing Phase 2 (TESTING-P2)
4. Minor optimizations (0.5 pts)

**Metrics:**
- Total Stories: 4
- Total Points: 11.5 (target: 12)
- Team Capacity: 12 points/sprint
- Utilization: 96% (excellent)

---

## Sprint 5 Goal

**"Improve type safety, enable photo uploads, and expand test coverage to 85%"**

Deliver:
- ✅ Type-safe navigation throughout app
- ✅ Photo upload from camera/gallery
- ✅ Photo gallery view per plant
- ✅ Integration tests for critical flows
- ✅ 85%+ test coverage

---

## Story Inventory

### STORY-040: Type-Safe Navigation Refactor

**Epic:** Architecture / Quality
**Priority:** 🟠 HIGH
**Points:** 3
**Dependencies:** None

**User Story:**
As a developer
I want type-safe navigation throughout the app
So that I catch navigation errors at compile time, not runtime

**Acceptance Criteria:**

1. **Create Navigation Types** (1 pt)
   - [ ] `src/types/navigation.ts` with RootStackParamList
   - [ ] Define all screen names and param types
   - [ ] Export types for use in all screens
   - [ ] Example:
   ```typescript
   export type RootStackParamList = {
     Home: undefined;
     PlantDetail: { id: string };
     Login: undefined;
     Register: undefined;
     Profile: undefined;
     ChangePassword: undefined;
     ForgotPassword: undefined;
     PhotoGallery: { plantId: string };
   };
   ```

2. **Update Navigators** (1 pt)
   - [ ] Update all Stack/Tab navigators with types
   - [ ] Use `createNativeStackNavigator<RootStackParamList>()`
   - [ ] All screens properly typed
   - [ ] Navigation params validated at compile time

3. **Update All Screens** (1 pt)
   - [ ] All screens use proper navigation types
   - [ ] Remove `any` type from navigation props
   - [ ] Update `navigation.navigate()` calls with correct types
   - [ ] IDE now provides autocomplete for navigation

**Technical Notes:**
- Reference: React Navigation docs for type safety
- All screens need: `type Props = NativeStackScreenProps<RootStackParamList, 'ScreenName'>;`
- Impact: Zero runtime changes, pure type safety improvement
- No console.log statements in navigators

**Testing:**
- TypeScript strict mode: No errors
- All navigation params validated
- IDE autocomplete working

**Estimate:** 3 points
**Time Budget:** ~6-7 hours

---

### STORY-041: Photo Upload & Gallery Implementation

**Epic:** Features / Photo Management
**Priority:** 🟠 HIGH
**Points:** 5
**Dependencies:** STORY-040 (type-safe navigation)

**User Story:**
As a user
I want to take/upload photos of my plants and view them in a gallery
So that I can document my garden and share progress

**Acceptance Criteria:**

1. **Photo Upload Screen** (2 pts)
   - [ ] New PhotoUploadScreen component
   - [ ] Button to open camera (expo-camera)
   - [ ] Button to pick from gallery (expo-media-library)
   - [ ] Preview before upload
   - [ ] Upload to Supabase Storage
   - [ ] Save metadata to photos table (user_id, plant_id, photo_url)
   - [ ] Success message after upload
   - [ ] Error handling for permissions/failures

2. **Photo Gallery Screen** (2 pts)
   - [ ] New PhotoGalleryScreen for plant detail
   - [ ] Display all photos for a plant
   - [ ] Grid layout (2-3 columns)
   - [ ] Tap to view full-size
   - [ ] Swipe through gallery
   - [ ] Delete photo with confirmation
   - [ ] Upload date shown
   - [ ] Empty state when no photos

3. **Integration** (1 pt)
   - [ ] PlantDetailScreen → View Gallery button
   - [ ] PhotoGalleryScreen → Upload Photo button
   - [ ] Navigation properly typed (use STORY-040 types)
   - [ ] Pull-to-refresh gallery
   - [ ] Real-time updates when new photos added

**Technical Notes:**
- Use Supabase Storage for photo hosting
- Reference: `src/services/photoService.ts` (create new service)
- Photo table: id, user_id, plant_id, photo_url, created_at
- Service layer pattern: fetchPhotos, uploadPhoto, deletePhoto
- RLS policy: User can only see/delete their own photos

**Testing:**
- 10+ test cases for photo service
- Mock file uploads
- Test permission handling
- Edge cases: file too large, unsupported format

**Estimate:** 5 points
**Time Budget:** ~10-12 hours

---

### TESTING-P2: Integration Testing Phase 2

**Epic:** Quality / Testing
**Priority:** 🟠 HIGH
**Points:** 2
**Dependencies:** TESTING-P1 (from Sprint 4)

**User Story:**
As a developer
I want integration tests for critical user flows
So that regressions are caught at the workflow level, not just unit level

**Acceptance Criteria:**

1. **Authentication Flow Test** (0.5 pts)
   - [ ] Test sign up → sign in → access user data
   - [ ] Test forgot password flow
   - [ ] Test password change → logout
   - [ ] 5+ test cases

2. **Plant Management Flow Test** (0.5 pts)
   - [ ] Create plant → add to list → edit → delete
   - [ ] Search and filter plants
   - [ ] Integration with navigation
   - [ ] 5+ test cases

3. **Photo Management Flow Test** (0.5 pts)
   - [ ] Upload photo → gallery view → delete
   - [ ] Multiple photos per plant
   - [ ] Real-time updates
   - [ ] 5+ test cases

4. **Shopping Flow Test** (0.5 pts)
   - [ ] Create item → dashboard → mark purchased
   - [ ] Clear purchased items
   - [ ] Cost calculations
   - [ ] 5+ test cases

**Technical Notes:**
- Use Jest with Supabase mock from Sprint 4
- Test files: `src/__tests__/integration/`
- Follow existing test patterns
- Integration tests test multiple services together

**Testing:**
- 20+ integration test cases total
- All critical flows covered
- Test both success and error paths

**Estimate:** 2 points
**Time Budget:** ~4-5 hours

---

### STORY-042: Performance & Polish

**Epic:** Quality / Performance
**Priority:** 🟡 MEDIUM
**Points:** 1.5

**User Story:**
As a user
I want the app to perform smoothly and feel polished
So that I enjoy using the app

**Acceptance Criteria:**

1. **Performance Optimization** (0.5 pts)
   - [ ] Profile screens (render optimization)
   - [ ] Photo gallery (lazy loading)
   - [ ] List virtualization where needed

2. **Polish & UX** (0.5 pts)
   - [ ] Consistent empty states across app
   - [ ] Loading spinners for async operations
   - [ ] Smooth transitions and animations
   - [ ] Accessibility review

3. **Documentation** (0.5 pts)
   - [ ] Update MEMORY.md with new patterns
   - [ ] PhotoUploadScreen pattern documented
   - [ ] Navigation types documented

**Estimate:** 1.5 points
**Time Budget:** ~3 hours

---

## Sprint 5 Allocation

**Sprint 5: 2026-04-28 to 2026-05-12 (2 weeks)**

| Story | Points | Priority | Time | Status |
|-------|--------|----------|------|--------|
| STORY-040 | 3 | HIGH | 7h | Not Started |
| STORY-041 | 5 | HIGH | 12h | Not Started |
| TESTING-P2 | 2 | HIGH | 5h | Not Started |
| STORY-042 | 1.5 | MEDIUM | 3h | Not Started |
| **TOTAL** | **11.5** | - | **27h** | - |

**Capacity:** 12 points
**Utilization:** 96% (excellent)
**Buffer:** 0.5 points (for unknowns/minor bugs)

---

## Sprint 5 Goals

**Primary Goal:** "Add type-safe navigation and photo upload features with integration tests"

**Weekly Breakdown:**

**Week 1 (April 28 - May 2):**
- Complete STORY-040 (type-safe navigation)
- Start STORY-041 (photo upload screen)

**Week 2 (May 5-12):**
- Finish STORY-041 (photo gallery)
- TESTING-P2 (integration tests)
- STORY-042 (performance & polish)
- Final code review

---

## Quality Metrics & Definition of Done

**Sprint 5 stories must meet:**
- [ ] All Acceptance Criteria passed
- [ ] Code reviewed
- [ ] Unit tests written (≥85% coverage target)
- [ ] Integration tests written
- [ ] No regressions in existing features
- [ ] TypeScript strict mode clean
- [ ] Error handling comprehensive
- [ ] Demo-ready
- [ ] MEMORY.md updated with new patterns

---

## Risks & Mitigations

**Risk 1: Photo upload permissions on iOS/Android**
- Mitigation: Use expo-image-picker (handles permissions)
- Mitigation: Test on both platforms early

**Risk 2: Supabase Storage limits**
- Mitigation: Test with various file sizes
- Mitigation: Add file size validation

**Risk 3: Type safety refactor breaks navigation**
- Mitigation: Test all navigation paths thoroughly
- Mitigation: Gradual rollout (one navigator at a time)

**Risk 4: Photo gallery performance with many images**
- Mitigation: Implement lazy loading
- Mitigation: Paginate photo fetches

---

## Sprint 5 Success Criteria

Sprint 5 is successful if:

✅ **STORY-040:**
- Navigation is fully type-safe (no `any` types)
- IDE provides autocomplete for all navigation
- Zero TypeScript errors

✅ **STORY-041:**
- Photo upload works from camera and gallery
- Photos display in gallery view
- Photos are user-scoped via RLS
- Delete photos with confirmation

✅ **TESTING-P2:**
- 20+ integration tests written
- All critical flows covered
- Tests passing consistently

✅ **STORY-042:**
- App feels smooth and polished
- Empty states consistent
- MEMORY.md updated

✅ **Overall:**
- 85%+ test coverage achieved
- Zero critical bugs
- All AC met
- Ready for next features

---

## Handoff to Development

**Next Steps:**
1. Review Sprint 5 Plan (this document)
2. Update sprint-status.yaml with Sprint 5 details
3. Run `/dev-story STORY-040` to start implementation
4. Follow sprint schedule (Week 1: Nav types + Photo upload start)

**Track Progress:**
- Daily standup on priorities
- Mid-sprint check-in (Day 5) to assess progress
- Adjust if blockers discovered

---

## Notes & Dependencies

**External Dependencies:**
- expo-camera (camera integration)
- expo-media-library (gallery access)
- expo-image-picker (file selection)
- Supabase Storage (photo hosting)

**Internal Dependencies:**
- STORY-040 must be done before full photo integration
- TESTING-P1 must remain passing (no regressions)
- All previous sprints' AC must remain met

**Technology:**
- TypeScript strict mode
- React Native + Expo
- Supabase (Auth + Storage + Database)
- Jest testing framework

---

## Success Tracking

**Sprint 5 velocity goal:** 11.5 points
**Expected completion:** May 12, 2026

**Quality gates:**
- 0 critical issues
- 100% AC pass rate
- 85%+ test coverage
- No regressions

---

**Sprint Plan Status:** ✅ READY FOR DEVELOPMENT
**Created:** 2026-03-03
**Last Updated:** 2026-03-03
