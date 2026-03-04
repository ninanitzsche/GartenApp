# Sprint 4 Plan: Gartenplaner

**Date:** 2026-03-03
**Sprint:** Sprint 4 (2026-04-14 bis 2026-04-28)
**Scrum Master:** ninanitzsche
**Status:** PLANNED

---

## Executive Summary

Sprint 4 focuses on **quality, completeness, and foundation strengthening** based on learnings from Sprint 1-3. All items are CRITICAL or HIGH priority from the Sprint 3 Recommendations document.

**Key Focus Areas:**
1. Complete missing authentication features (STORY-033b)
2. Document database schema & RLS (STORY-INF-001b)
3. Establish testing strategy & begin Phase 1 (2 pts)
4. Minor bug fixes & optimizations (0.5 pts)

**Metrics:**
- Total Stories: 4
- Total Points: 10.5 (target: 12)
- Team Capacity: 12 points/sprint
- Utilization: 87.5% (good buffer)

---

## Sprint 4 Goal

**"Complete missing auth features, establish testing foundation, and strengthen technical documentation"**

Deliver:
- ✅ Full authentication flow (forgot password, profile, password reset)
- ✅ Database schema documentation
- ✅ Unit testing foundation for services
- ✅ Search optimization

---

## Story Inventory

### STORY-033b: Complete Authentication Features

**Epic:** Core / Authentication
**Priority:** 🔴 CRITICAL
**Points:** 5
**Dependencies:** STORY-033 (completed in Sprint 2)

**User Story:**
As a user
I want to complete my account management and password recovery
So that I can manage my account and recover lost passwords

**Acceptance Criteria:**

1. **Profile Screen** (1.5 points)
   - [ ] Display current user email
   - [ ] Show account created date
   - [ ] "Manage Account" section
   - [ ] Navigation: MoreMenuScreen → Profile
   - [ ] Back button returns to More menu

2. **Change Password** (1.5 points)
   - [ ] Password change form with fields: Current password, New password, Confirm new password
   - [ ] Validation: Current password verified via re-authentication
   - [ ] New password must be ≥8 characters
   - [ ] Confirmation matches validation
   - [ ] Success message: "Passwort erfolgreich geändert"
   - [ ] Error handling for wrong current password
   - [ ] Logout user after password change (security)

3. **Forgot Password Flow** (2 points)
   - [ ] "Passwort vergessen?" link on LoginScreen
   - [ ] ForgotPasswordScreen with email input
   - [ ] Send reset email via Supabase: `supabase.auth.resetPasswordForEmail(email)`
   - [ ] Success message: "Prüfen Sie Ihre E-Mail für Passwort-Reset-Link"
   - [ ] Link in email opens password reset flow
   - [ ] Reset password screen accepts new password
   - [ ] Clear error messages for invalid emails

**Technical Notes:**
- Use Supabase Auth methods:
  - `supabase.auth.updateUser({ password: newPassword })`
  - `supabase.auth.resetPasswordForEmail(email)`
- Create new screens:
  - `ProfileScreen.tsx`
  - `ChangePasswordScreen.tsx`
  - `ForgotPasswordScreen.tsx`
- Update AuthContext with logout handler
- Update MoreMenuScreen navigation

**Testing:**
- 10+ test cases covering all flows
- Error scenarios (wrong password, invalid email)
- Edge cases (password same as old, etc.)

**Estimate:** 5 points
**Time Budget:** ~12 hours

---

### STORY-INF-001b: Database Schema Documentation

**Epic:** Infrastructure / Documentation
**Priority:** 🔴 CRITICAL
**Points:** 2
**Dependencies:** STORY-INF-001 (completed in Sprint 1)

**User Story:**
As a developer
I want database schema documented with SQL definitions and RLS policies
So that future developers understand the data structure and security model

**Acceptance Criteria:**

1. **Create `/docs/database-schema.sql`**
   - [ ] All 11 tables defined in SQL format
   - [ ] Column definitions with types and constraints
   - [ ] Primary keys and foreign keys
   - [ ] Indexes (user_id, created_at, status)
   - [ ] ON DELETE CASCADE constraints where appropriate
   - [ ] Default values and NOT NULL constraints

2. **Create `/docs/database-rls-policies.md`**
   - [ ] Document RLS policies for each table
   - [ ] Show RLS policy for each table type:
     - User-scoped tables (plants, tasks, shopping_items)
     - Reference tables (if any)
   - [ ] Example policies with SQL
   - [ ] Security model explanation
   - [ ] Access control logic (auth.uid() == user_id)

3. **Create `/docs/database-guide.md`**
   - [ ] Overview of data model
   - [ ] Entity-relationship diagram (ASCII or Mermaid)
   - [ ] Data flow explanation
   - [ ] Realtime configuration (which tables have it)
   - [ ] Performance considerations (indexes)
   - [ ] Migration process documentation

**Technical Notes:**
- Extract schema from Supabase dashboard SQL Editor
- Document using SQL comments for clarity
- Include RLS policy examples
- Reference Supabase documentation where relevant

**Testing:**
- Verify SQL syntax is correct
- Verify all tables are documented
- Verify RLS policies make sense

**Estimate:** 2 points
**Time Budget:** ~4-5 hours

---

### TESTING-P1: Unit Testing Foundation (Phase 1)

**Epic:** Quality / Testing
**Priority:** 🟠 HIGH
**Points:** 2

**User Story:**
As a developer
I want to establish unit testing foundation
So that code quality is verifiable and regressions are caught early

**Acceptance Criteria:**

1. **Set up Testing Infrastructure**
   - [ ] Jest configuration for React Native
   - [ ] `package.json` test scripts configured
   - [ ] Test directory structure: `src/__tests__/`
   - [ ] Mock Supabase client for tests
   - [ ] Test utilities/helpers created

2. **Write Unit Tests for Services** (High Priority)
   - [ ] `plantService.test.ts` - 8+ test cases
     - fetchPlants with filters
     - createPlant with validation
     - updatePlant
     - deletePlant
   - [ ] `shoppingService.test.ts` - 8+ test cases
     - CRUD operations
     - Filter logic
     - Sorting
   - [ ] `seedDataService.test.ts` - 4+ test cases
     - Import status tracking
     - Idempotency

3. **Test Coverage Metrics**
   - [ ] services/ folder: ≥80% line coverage
   - [ ] All exported functions have tests
   - [ ] Happy paths and error paths tested
   - [ ] Coverage report generated

4. **Documentation**
   - [ ] Test running guide: `npm test`
   - [ ] How to write new tests (template provided)
   - [ ] Test patterns documented

**Technical Notes:**
- Use Jest as test runner (industry standard for React)
- Mock Supabase with jest.mock()
- Test async functions with `async/await`
- Test error cases and edge cases
- Aim for 20+ test cases total in Phase 1

**Time Budget:** ~5-6 hours

**Example Test Structure:**
```typescript
describe('plantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPlants', () => {
    it('should fetch all plants for current user', async () => {
      // Test code
    });

    it('should apply search filter', async () => {
      // Test code
    });

    it('should handle errors gracefully', async () => {
      // Test code
    });
  });
});
```

**Estimate:** 2 points

---

### STORY-002b: Search Debouncing Optimization

**Epic:** Performance / Quality
**Priority:** 🟡 MEDIUM
**Points:** 1 (rounded from 0.5)

**User Story:**
As a user
I want search queries to be debounced
So that the app doesn't make excessive database calls while typing

**Acceptance Criteria:**

1. **Implement Search Debouncing**
   - [ ] PlantListScreen search debounced (300ms)
   - [ ] Uses same pattern as ShoppingListScreen (proven)
   - [ ] Reference: `shoppingService.ts` lines 47-60 (debounce pattern)
   - [ ] No database calls while typing rapidly
   - [ ] Results update smoothly after user stops typing

2. **Testing**
   - [ ] Debounce works with fast typing
   - [ ] Database calls are reduced
   - [ ] No broken search functionality
   - [ ] Empty search still works

**Technical Notes:**
- Copy debounce pattern from ShoppingListScreen
- Use useRef for debounce timeout tracking
- Apply to PlantListScreen search input (line 82-88)

**Time Budget:** ~1-2 hours

**Estimate:** 1 point

---

## Sprint 4 Allocation

**Sprint 4: 2026-04-14 to 2026-04-28 (2 weeks)**

| Story | Points | Priority | Time | Status |
|-------|--------|----------|------|--------|
| STORY-033b | 5 | CRITICAL | 12h | Not Started |
| STORY-INF-001b | 2 | CRITICAL | 5h | Not Started |
| TESTING-P1 | 2 | HIGH | 6h | Not Started |
| STORY-002b | 1 | MEDIUM | 2h | Not Started |
| **TOTAL** | **10** | - | **25h** | - |

**Capacity:** 12 points
**Utilization:** 83% (good safety margin)
**Buffer:** 2 points (for unknowns/bugs)

---

## Sprint 4 Goals

**Primary Goal:** "Complete authentication features, establish documentation, and build testing foundation"

**Weekly Breakdown:**

**Week 1 (April 14-18):**
- Complete STORY-033b (auth features)
  - Profile screen
  - Change password
  - Forgot password flow
- Start STORY-INF-001b (database docs)

**Week 2 (April 21-28):**
- Finish STORY-INF-001b (RLS policies, database guide)
- TESTING-P1 (unit test foundation)
- STORY-002b (search debounce)
- Buffer time for issues/refinement

---

## Quality Metrics & Definition of Done

**Sprint 4 stories must meet:**
- [ ] All Acceptance Criteria passed
- [ ] Code reviewed
- [ ] Unit tests written (≥80% coverage for TESTING-P1)
- [ ] Integration tested
- [ ] No regressions in existing features
- [ ] Documentation updated
- [ ] Error handling comprehensive
- [ ] TypeScript with no errors
- [ ] Accessibility verified
- [ ] Demo-ready

---

## Risks & Mitigations

**Risk 1: Auth password reset email not working**
- Mitigation: Test Supabase email config before Sprint 4 starts
- Mitigation: Check spam folder in test emails

**Risk 2: Testing setup takes longer than expected**
- Mitigation: Use Jest, well-documented config
- Mitigation: Start with service tests (simpler than component tests)

**Risk 3: Database documentation missing details**
- Mitigation: Export schema directly from Supabase
- Mitigation: Cross-reference with architecture doc

**Risk 4: Dependency issues or breaking changes**
- Mitigation: None identified, but monitor build

---

## Sprint 4 Success Criteria

Sprint 4 is successful if:

✅ **STORY-033b:**
- User can change password
- User can recover forgotten password
- Profile screen shows account info
- All error cases handled

✅ **STORY-INF-001b:**
- Database schema documented in SQL
- RLS policies explained
- Developer guide created
- Ready for onboarding new devs

✅ **TESTING-P1:**
- Jest configured and working
- 20+ unit tests for services written
- 80%+ coverage for service code
- Test guide documented

✅ **STORY-002b:**
- Search no longer makes excessive calls
- Debounce working (300ms)
- No regression in search functionality

---

## Handoff to Development

**Next Steps:**
1. Review Sprint 4 Plan (this document)
2. Update sprint-status.yaml with Sprint 4 details
3. Run `/dev-story STORY-033b` to start implementation
4. Follow sprint schedule (Week 1: Auth, Week 2: Docs + Testing)

**Track Progress:**
- Daily standup on priorities
- Mid-sprint check-in (Day 5) to assess progress
- Adjust if blockers discovered

---

## Notes & Dependencies

**External Dependencies:**
- Supabase email configuration (should already be working)
- npm test should run without issues

**Internal Dependencies:**
- STORY-033 must remain completed (not regress)
- STORY-INF-001 must be completed

**Technology:**
- TypeScript strict mode
- React Native + Expo
- Supabase Auth (already integrated)
- Jest testing framework

---

## Success Tracking

**Sprint 4 velocity goal:** 10 points
**Expected completion:** April 28, 2026

**Quality gates:**
- 0 critical issues
- 100% AC pass rate
- 80%+ test coverage for new code
- No regressions

---

**Sprint Plan Status:** ✅ READY FOR DEVELOPMENT
**Created:** 2026-03-03
**Last Updated:** 2026-03-03
