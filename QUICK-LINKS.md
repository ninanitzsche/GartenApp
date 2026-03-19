# 🔗 Quick Links - Find What You Need Fast

**Last Updated:** 2026-03-04
**Status:** Active
**Audience:** All
**Related Files:** [README.md](README.md), [MEMORY.md](MEMORY.md), [docs/reference/FILE-STRUCTURE.md](docs/reference/FILE-STRUCTURE.md)

**Navigation Guide for Gartenplaner Team**

**For Product Owners:** → [PO-GUIDE.md](docs/config/PO-GUIDE.md) (BMAD-based guide)
**For Developers:** → Start below
**For Developers Setup:** → `docs/config/CLAUDE.md` (AI development config)

---

## 🚀 "I want to BUILD something"

### Add a New Feature
1. **First:** `docs/LEARNINGS/feature-implementation-learnings.md`
   - See how long similar features took
   - Understand the complexity

2. **Then:** `MEMORY.md` (auto-loaded, check patterns)
   - Check Service Layer pattern
   - Check authentication flow
   - Check proven patterns

3. **Finally:** Use `/dev-story` skill to implement
   - Pass clear requirements
   - Reference patterns from MEMORY

**Time:** 3-5 points typical, 1-2 days to complete

---

### Build a New Service (CRUD Entity)
1. **Copy from:** `src/services/plantService.ts` or `src/services/shoppingService.ts`
2. **Adapt:** Change entity name, database table, error handling
3. **Pattern:** Service Layer (fetch, create, update, delete)

**Reference:** `MEMORY.md` → Proven Patterns → Service Layer Pattern

---

### Set Up Authentication for New Screen
1. **Example:** `src/screens/LoginScreen.tsx`
2. **Context:** `src/contexts/AuthContext.tsx`
3. **Service:** `src/services/authService.ts`

**Pattern:** `MEMORY.md` → Proven Patterns → Authentication Flow

---

### Handle Image/Photo Upload
1. **Common Issues:** `docs/LEARNINGS/bugs-and-gotchas.md` → Photo Upload/Image Handling
2. **Platform Differences:** Check Web vs Native section
3. **Compression:** Use 70% quality with expo-image-manipulator

**Time:** First time = 5 pts, repeat = 2 pts

---

## 🐛 "I have a BUG"

### First: Check if Already Solved
→ `docs/LEARNINGS/bugs-and-gotchas.md`

**Search for:**
- Your error message
- Component/feature name
- Platform (Web, iOS, Android)
- Technology (RLS, Image, Navigation, etc.)

(90% chance the solution is already there!)

---

### Bug Categories in bugs-and-gotchas.md

| Category | When |
|----------|------|
| **Expo Web Issues** | App works on Native, breaks on Web |
| **RLS & Security** | Database queries return wrong data |
| **Platform Issues** | Works on iOS, breaks on Android or Web |
| **Image/Media** | Photo upload, compression, storage |
| **State Management** | Context updates causing re-renders |
| **Testing** | Tests pass locally, fail in CI |

---

### If Bug is New
1. Fix it
2. Add to `docs/LEARNINGS/bugs-and-gotchas.md`
3. Share with team (show us the solution!)

---

## 📚 "I want to UNDERSTAND something"

### 🚀 **Project Status (Sprint 1-5 Complete!)**
→ `MVP-RELEASE-SUMMARY.md` (Executive summary - what shipped)
→ `docs/reference/BMAD-STATUS.md` (2 min overview - all phases)
→ `docs/bmad/BMAD-02-COMPLETION-MATRIX.md` (all 25 FRs status)
→ `docs/bmad/BMAD-03-ARCHITECTURE-CHECKLIST.md` (architecture verified)
→ `.archive/docs/archive/` (Sprint 1-5 summaries with real data)

### Project Overview
→ `README.md` (5 min)

### Tech Stack & Architecture
→ `docs/bmad/bmad-03-architecture.md` (detailed architecture - 20 min)
→ `docs/bmad/BMAD-03-ARCHITECTURE-CHECKLIST.md` (verification checklist)
→ `docs/database/database-guide.md` (database schema - 10 min)

---

### How Features Are Built
→ `docs/LEARNINGS/feature-implementation-learnings.md` (10 min)

**Topics:**
- Plant CRUD (basic feature)
- Photo Upload (complex, Web issues)
- Shopping List (cost tracking)
- Authentication (session management)

---

### How Code is Organized
→ `docs/reference/FILE-STRUCTURE.md` (5 min)

**Shows:**
- Root files (essentials only)
- Doc categories
- File naming conventions

---

### Database Schema
→ `docs/database/database-guide.md` (15 min)

**Topics:**
- Tables and relationships
- RLS policies
- How to debug RLS

---

### Code Patterns We Use
→ `MEMORY.md` first 200 lines (10 min)

**Topics:**
- Service Layer Pattern
- Authentication flow
- React hooks
- Testing

---

## 💰 "Cost & Efficiency"

### Cost Management Rules
→ `docs/config/CLAUDE.md` (5 min)

**Topics:**
- Sequential vs parallel development
- Model selection (Haiku vs Sonnet)
- Batching tasks

---

### Cost Guidelines & Budget
→ `docs/config/COST-GUIDELINES.md` (5 min)

**Topics:**
- Budget per sprint
- When to alert
- Cost tracking

---

### Actual Cost Data
→ Project memory: Cost tracking (contact dev lead for latest data)

**Topics:**
- Sprint 1-5 real costs
- Model costs (Haiku, Sonnet, Opus)
- Batching ROI
- Sequential vs parallel

---

## ✅ "TESTING & QA"

### Testing Guide
→ `docs/testing/TESTING-GUIDE.md`

**Topics:**
- How to write tests
- What to test (critical paths)
- Coverage targets (70%)
- Platform testing (Web + Native)

---

### What to Test
→ `docs/LEARNINGS/feature-implementation-learnings.md` → Quality section

**Also:** `MEMORY.md` → Testing Reference

---

## 🌐 "WEB-SPECIFIC ISSUES"

### Expo Web Gotchas
→ `docs/LEARNINGS/bugs-and-gotchas.md` → Expo Web Spezifische Issues

**Topics:**
- Asset paths
- Babel/JSX errors
- Package version conflicts
- Route params
- Image handling

---

### Testing on Web
→ `docs/testing/TESTING-GUIDE.md` (if exists)

**Or:** `../BMAD-LEARNINGS/development-process-learnings.md` → Weekly Build Checkpoints

**Key Rule:** Test on Web by Day 2 of every sprint!

---

## 📱 "MOBILE SPECIFIC"

### iOS Issues
→ `docs/LEARNINGS/bugs-and-gotchas.md` → React Native Platform Issues

---

### Android Issues
→ `docs/LEARNINGS/bugs-and-gotchas.md` → React Native Platform Issues

---

### Navigation (Type-Safe)
→ `src/screens/` (check existing screens for pattern)

Also: `docs/LEARNINGS/bugs-and-gotchas.md` → Route Params Type Safety

---

## 🎯 "I need to ESTIMATE"

### How Long Does a Feature Take?
→ `docs/LEARNINGS/feature-implementation-learnings.md`

**Pattern:**
- CRUD features: 5 points (1-2 days)
- Complex features: 5-8 points (2-3 days)
- Simple features: 2-3 points (1 day)
- Refactors: 3-5 points

---

### Velocity Baseline
→ `MEMORY.md` → Sprint Metrics

**Current:** 10.8 points per 2-week sprint (solo)

---

### Cost per Feature
→ `../BMAD-LEARNINGS/cost-optimization-learnings.md` (real sprint costs)
→ `COST-GUIDELINES.md` (cost management rules)

**Typical (from Sprint 5 data):**
- Small feature (2-3 pts): $0.05-0.15
- Medium feature (5 pts): $0.15-0.30
- Large feature (8 pts): $0.30-0.50
- **94% savings** vs budget through Haiku + batching

---

## 🔧 "I need to SETUP/CONFIGURE"

### Project Setup
→ `README.md` (includes setup steps)

---

### Development Environment
→ `docs/guides/` (look for QUICK-START files)

---

### Database Setup
→ `docs/database/database-guide.md`

---

### Testing Setup
→ `docs/testing/TESTING-GUIDE.md`

---

## 📖 "I want to READ about PROCESS"

### Development Process & Velocity
→ `MEMORY.md` → Sprint Metrics

---

### Sprints (Historical)
→ `.archive/docs/archive/`

**Recent sprints:**
- SPRINT-5-SUMMARY.md

---

### BMAD Method (Planning)
→ `/Users/ninanitzsche/aipm/BMAD-LEARNINGS/bmad-method-learnings.md`

---

### Documentation Structure
→ `/Users/ninanitzsche/aipm/BMAD-LEARNINGS/documentation-structure-learnings.md`

---

## 🆘 "QUICK TROUBLESHOOTING"

### "Something works on Native but not Web"
→ `docs/LEARNINGS/bugs-and-gotchas.md` → Expo Web Issues + Platform Issues

---

### "RLS policy is broken"
→ `docs/LEARNINGS/bugs-and-gotchas.md` → RLS & Security Issues

---

### "Image upload fails"
→ `docs/LEARNINGS/bugs-and-gotchas.md` → Photo Upload/Image Handling

---

### "Tests are failing"
→ `docs/testing/TESTING-GUIDE.md` or bugs-and-gotchas.md → Testing Issues

---

### "Don't know which model to use"
→ `docs/config/CLAUDE.md` → Model Selection or MEMORY.md → Cost Management

---

### "Need a code pattern"
→ `MEMORY.md` → Proven Patterns

---

### "Don't know where files go"
→ `docs/reference/FILE-STRUCTURE.md`

---

## 🚨 "EMERGENCY / STUCK"

1. **Check MEMORY.md** - pattern is probably there
2. **Check bugs-and-gotchas.md** - problem is probably solved
3. **Check relevant learning doc** - for your feature type
4. **Search error in git history** - maybe fixed before
5. **Ask in comments** - team will help

**Don't:**
- ❌ Spend >1 hour stuck without asking
- ❌ Start from scratch if pattern exists
- ❌ Work parallel to others (sequential = cheaper)
- ❌ Forget to test on Web before submitting PR

---

## 🎓 "READING ORDER by SITUATION"

### You're a Brand New Developer:
1. ONBOARDING.md (this guide)
2. README.md
3. CLAUDE.md
4. QUICK-LINKS.md (you're here!)
5. MEMORY.md
6. architecture/guides docs
7. Pick first task

### You're Building a Feature:
1. `docs/LEARNINGS/feature-implementation-learnings.md` (timing)
2. `MEMORY.md` (patterns)
3. `docs/LEARNINGS/bugs-and-gotchas.md` (gotchas for your feature)
4. Implement with `/dev-story`

### You Have a Bug:
1. `docs/LEARNINGS/bugs-and-gotchas.md` (search for issue)
2. If found → solution is there
3. If not → add it when you solve it

### You're Onboarding Another Dev:
1. Send them ONBOARDING.md
2. Send them QUICK-LINKS.md (this file)
3. They read 6 files in 1 hour
4. They start their first task

---

## 📍 File Locations Summary

| What | Where |
|------|-------|
| Quick navigation | QUICK-LINKS.md (you are here) |
| For new devs | ONBOARDING.md |
| Project overview | README.md |
| Rules & process | CLAUDE.md |
| Code patterns | MEMORY.md |
| Architecture | docs/bmad/bmad-03-architecture.md |
| Feature timing | docs/LEARNINGS/feature-implementation-learnings.md |
| Bug solutions | docs/LEARNINGS/bugs-and-gotchas.md |
| Database | docs/database/database-guide.md |
| Testing | docs/testing/TESTING-GUIDE.md |
| File structure | docs/reference/FILE-STRUCTURE.md |
| Cost rules | docs/config/COST-GUIDELINES.md |
| Cost data | ../BMAD-LEARNINGS/cost-optimization-learnings.md |
| Old sprints | .archive/docs/archive/ |

---

**Pro Tip:** Bookmark this page! You'll use it constantly.

**Most Common Path:** Bug → bugs-and-gotchas.md (90% of the time it's there!)

Good luck! 🌱
