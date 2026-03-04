# 🎯 BMAD Workflow Index - Gartenplaner

**Status:** MVP Planning Active
**Last Updated:** 2026-03-04
**Workflow Phase:** Sprint Planning (Phase 4)

---

## 📚 BMAD Methodology Phases

BMAD = **B**rainstorm → **M**ethodology → **A**rchitecture → **D**evelopment

### Phase 1: Product Analysis ✅ DONE
**File:** `bmad/bmad-01-product-brief.md`
**What:** Executive summary, problem statement, success criteria
**Status:** Complete (2026-03-02)

---

### Phase 2: Requirements ✅ DONE
**File:** `bmad/bmad-02-prd.md`
**What:** 25 Functional Requirements, 9 Non-Functional Requirements, 7 Epics
**Status:** Complete (2026-03-02)
**Key Info:**
- 7 Epics (EPIC-001 to EPIC-007)
- 25 Functional Requirements (FR-001 to FR-025)
- 9 Non-Functional Requirements
- 26-39 estimated stories
- MVP = Phase 1 = Must Have + Should Have

---

### Phase 3: System Architecture ✅ DONE
**File:** `bmad/bmad-03-architecture.md`
**What:** Tech stack decisions, data models, system components, deployment strategy
**Status:** Complete (2026-03-02)
**Key Info:**
- Frontend: React Native + Expo
- Backend: Supabase (PostgreSQL, Auth, Storage)
- AI: Claude API (Phase 2)
- Deployment: Expo EAS

---

### Phase 4: Sprint Planning 🔄 IN PROGRESS
**File:** `sprint-plan-gartenplaner-mvp-{date}.md` (to be created)
**What:** Break epics into stories, estimate points, allocate to sprints
**Status:** Next step after MVP planning
**Expected Output:**
- 26-39 stories broken down from 7 epics
- Story points estimated
- Sprint 6 allocation
- Implementation roadmap

---

## 🔍 How to Use These Files

### For Claude/AI Development:

```bash
# Phase 1: Understand problem
Read: bmad/bmad-01-product-brief.md

# Phase 2: Understand requirements
Read: bmad/bmad-02-prd.md
→ All 25 FRs
→ All 7 Epics
→ Success criteria

# Phase 3: Understand architecture
Read: bmad/bmad-03-architecture.md
→ Tech stack
→ Database schema
→ API design
→ Component structure

# Phase 4: Plan implementation (next)
Create: sprint/sprint-plan-*.md
→ Break epics into stories
→ Estimate points
→ Allocate to sprints
```

### For Developers/Builders:

1. **Planning Sprint:**
   - Read bmad-02-prd.md (what to build)
   - Read bmad-03-architecture.md (how to build)
   - Read sprint-plan-*.md (implementation order)

2. **Building Feature:**
   - Check sprint-plan-*.md for story
   - Implement per acceptance criteria (from prd)
   - Follow architecture patterns (from architecture)

3. **Quality Check:**
   - Verify all acceptance criteria met (prd)
   - Follow architectural patterns (architecture)
   - Update sprint status

---

## 📊 Quick Reference

### Product Goals (from Product Brief)
```
1. Wartungsaufwand minimieren
2. Unkraut-Jäten < 1h/Monat
3. Konkurrenzfreies Wachstum
4. Permakultur-System etablieren
```

### Success Metrics (from Product Brief)
```
✅ Unkraut-Jäten: < 1h/Monat
✅ Bodendecker: 80%+ Abdeckung
✅ Pflanzen: 50+ etabliert
✅ Ernte: dokumentiert
```

### MVP Scope (from PRD)
```
Phase 1 (MVP):
- Pflanzen-Inventar
- Dynamische Aufgaben
- Foto-Dokumentation (manuell)
- Einkaufsliste
- Pflanzpläne
- Wissens-DB
- Success-Tracking

Phase 2 (KI):
- Auto Pflanzen-ID
- Auto Schädlings-Erkennung
- Auto Task-Generierung

Phase 3 (Advanced):
- Bodendecker-Analyse
```

### Tech Stack (from Architecture)
```
Frontend: React Native + Expo
Backend: Supabase
Database: PostgreSQL (Supabase)
Storage: Supabase Storage (Photos)
Auth: Supabase Auth
AI (Phase 2): Claude API
Deployment: Expo EAS
```

---

## 🎯 Next Steps

### Immediate (Sprint 6 MVP Planning):
1. ✅ Review bmad-02-prd.md (all requirements)
2. ✅ Review bmad-03-architecture.md (technical approach)
3. ⏳ Run `/bmad:sprint-planning` to create sprint-plan-*.md
4. ⏳ Break 7 epics into 26-39 stories
5. ⏳ Estimate story points
6. ⏳ Allocate to Sprint 6 (11 pt capacity)
7. ⏳ Begin implementation

### During Development:
- Reference sprint-plan-*.md for current sprint
- Reference bmad-02-prd.md for acceptance criteria
- Reference bmad-03-architecture.md for implementation patterns
- Update sprint status as you complete stories

---

## 🔗 Related Files

### BMAD Status Dashboards (NEW!)
- ✅ `BMAD-01-product-brief.md` - **Updated with Sprint 1-5 Status**
- ✅ `BMAD-02-COMPLETION-MATRIX.md` - **NEW: All 25 FRs status dashboard**
- ✅ `BMAD-03-ARCHITECTURE-CHECKLIST.md` - **NEW: Architecture verification**

### Project Documentation
- `BMAD-STATUS.md` - Complete project status overview (all phases)
- `MVP-RELEASE-SUMMARY.md` - MVP completion summary + shipped features
- `PO-GUIDE.md` - Product Owner quick start guide
- `CLAUDE.md` - Claude Code configuration (how to use BMAD files)
- `ONBOARDING.md` - New developer guide
- `QUICK-LINKS.md` - Fast navigation
- `FILE-STRUCTURE.md` - Documentation structure overview
- `MEMORY.md` - Cross-sprint learnings (auto-loaded from ~/.claude/projects/...)
- `docs/stories/STORY-REGISTER.md` - All completed stories (Sprint 1-5)

### Workflow Templates
- `docs/sprint/SPRINT-START-CHECKLIST.md` - Pre-sprint checklist
- `docs/database/SCHEMA-CHECKLIST.md` - Before-coding validation
- `docs/sprint/SPRINT-6-WORKFLOW.md` - Sprint 6 workflow guide

### Code Reference
- `/memory/patterns.md` - Code patterns (70% reuse!)
- `/docs/database-guide.md` - Database schema reference
- `docs/testing/TESTING-GUIDE.md` - Testing patterns

---

## 💡 Key Insights

### From Product Brief:
- **Problem:** Gartenarbeit overwhelming, can't prioritize, miss problems, can't ID plants
- **Solution:** Intelligent app that helps prioritize & learns from photos
- **Target:** <1h/month weeding, 80%+ groundcover, 50+ established plants

### From PRD:
- **7 Epics** = 7 feature areas
- **25 Functional Requirements** = specific behaviors
- **9 Non-Functional Requirements** = quality attributes
- **26-39 Stories** = implementable units of work

### From Architecture:
- **React Native + Expo** = cross-platform, fast development
- **Supabase** = BaaS, reduces backend complexity
- **Phased approach** = MVP first, KI later

---

## 🚀 Using with Claude Code

**Automatic Loading:**
```
When starting Sprint 6 work:
- Claude auto-loads: bmad-02-prd.md (requirements)
- Claude auto-loads: bmad-03-architecture.md (patterns)
- Claude auto-loads: sprint-plan-*.md (current sprint)

When implementing story:
- Reference: sprint-plan-*.md (what to build)
- Reference: bmad-02-prd.md (acceptance criteria)
- Reference: bmad-03-architecture.md (how to build)
- Copy patterns from: /memory/patterns.md
```

**Manual Access:**
```bash
# Read any BMAD file
cat docs/bmad-01-product-brief.md
cat docs/bmad-02-prd.md
cat docs/bmad-03-architecture.md

# Search for specific requirement
grep "FR-021" docs/bmad/bmad-02-prd.md  # Find Time-Tracking requirement
grep "EPIC-007" docs/bmad/bmad-02-prd.md  # Find Success-Tracking epic
```

---

**Status:** Ready for Sprint 6 Planning! 🎯
**Next Action:** Run `/bmad:sprint-planning` to create sprint-plan-gartenplaner-mvp-2026-03-04.md
