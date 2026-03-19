# 📦 Archive - Historical Documentation

**Status:** Archive (Read-Only)
**Last Updated:** 2026-03-04
**Purpose:** Keep completed work accessible without cluttering active docs

---

## 📂 Contents

### Completed Sprints (Sprints 1-5)
**Why Archived:** MVP Phase Complete

```
sprints/
├── SPRINT-1-SUMMARY.md       ✅ Foundation + Plant Inventory
├── SPRINT-2-SUMMARY.md       ✅ Shopping List + Filtering
├── SPRINT-3-SUMMARY.md       ✅ Photo Upload + Tasks
├── SPRINT-4-SUMMARY.md       ✅ Refinements + Infrastructure
└── SPRINT-5-SUMMARY.md       ✅ Success Tracking + Web Verification
```

**Total:** 56.5 story points delivered
**Cost:** $2.09 (92% under budget)
**Status:** All Phase 1 FRs complete ✅

---

### Completed Stories & Implementation Guides
**Why Archived:** Implementation complete, reference only

```
stories/
├── STORY-001-COMPLETED.md
├── STORY-002-IMPLEMENTATION.md
├── STORY-004-COMPLETED.md
├── STORY-017-*.md
├── STORY-019-*.md
├── STORY-033-*.md
├── STORY-041-*.md
├── STORY-042-*.md
└── [All other completed stories]
```

**Total:** 13+ stories with full documentation
**Includes:** Architecture guides, test guides, implementation summaries

---

### Task Tracking & Administrative
**Why Archived:** One-time tasks, not part of ongoing development

```
├── cleanup-complete-2026-03-04.md          Task: Documentation cleanup
├── PROJECT-CLEANUP-2026-03-04.md           Task: Project cleanup checklist
├── reorganization-complete-2026-03-04.md   Task: Docs reorganization
└── [Other completed tasks]
```

---

### Audit & Quality Assurance Reports (2026-03-04)
**Why Archived:** Documentation audits completed, findings applied, reference only

```
├── audit-2026-03-04.md                           🔍 Comprehensive /aipm audit (1,568 files reviewed)
├── audit-findings-executive-summary-2026-03-04.md 📊 Executive summary of audit findings (FR count, cost, structure)
└── cleanup-complete-2026-03-04.md                ✅ Cleanup completion report (schema enforcement, pattern renames)
```

**What These Documents Did:**
- Identified 22 vs 19 FR count inconsistency (clarified)
- Found 10+ broken links (fixed)
- Verified cost data ($2.09 actual vs $1.50 reported)
- Standardized docs/patterns/ naming (CAPS → lowercase-hyphens)
- Created unified naming schema (.editorconfig)

**Status:** ✅ All findings addressed, archive maintained for reference

---

### Legacy Implementation Docs
**Why Archived:** Superseded by current docs/patterns/ and docs/guides/

```
├── sprint-*.md                  Old sprint plans
├── STORY-*-ARCHITECTURE.md      Story-specific architecture
├── STORY-*-TEST-GUIDE.md        Story-specific test guides
├── DATABASE-DOCUMENTATION-COMPLETION.md  Old DB doc task
└── [Other legacy docs]
```

---

## 🔍 How to Find What You Need

### I need to know what happened in Sprint 3
→ `archive/sprints/SPRINT-3-SUMMARY.md`

### I need to understand how a story was implemented
→ `archive/stories/STORY-XXX-*.md`

### I need historical context on a feature
→ Look in both `archive/stories/` and `archive/sprints/`

### I need to remember how something was setup
→ Check if newer version exists in `docs/guides/` or `docs/database/`

---

## 🚫 Don't Use Archive For

- ❌ Current development reference (use `docs/` instead)
- ❌ Onboarding new developers (use root `ONBOARDING.md`)
- ❌ Code patterns (use `docs/patterns/`)
- ❌ Bug solutions (use `docs/LEARNINGS/bugs-and-gotchas.md`)

---

## 📊 Archive Statistics

**Total Archived Files:** ~53+
**Sprints:** 5 complete (all documented)
**Stories:** 13+ with implementation guides
**Task Files:** 3+ (administrative)
**Audit & QA Reports:** 3 (2026-03-04 audit phase)
**Legacy Docs:** 10+

---

## 🔄 Archival Policy

A file is moved to archive when:
1. ✅ Sprint is complete + next sprint started
2. ✅ Story is delivered + in production
3. ✅ Task is done + decision made
4. ✅ Document is superseded by newer version
5. ✅ Information is historical, not current

**Rule:** Never delete, only archive. Keeps full history.

---

## 🚀 What's Active Instead

**For Development Reference:**
- → `docs/patterns/` (5 copy-paste ready patterns)
- → `docs/LEARNINGS/` (bugs-and-gotchas, feature timing)
- → `docs/database/` (current schema, RLS policies)
- → `docs/testing/` (testing guides)
- → `docs/guides/` (feature quick starts)

**For Sprint Planning:**
- → `docs/sprint/` (current sprint + checklist)

**For Architecture:**
- → `docs/bmad/` (current requirements + architecture)
- → `docs/reference/` (current status + file structure)

---

## 📝 Index by Type

### Sprint Documentation
```
Archive contains Sprint 1-5 complete documentation
Current sprint plans are in docs/sprint/
```

### Story Documentation
```
Archive contains all completed story docs
Current stories use /dev-story skill
```

### Reference Documentation
```
Archive contains old guides
Current guides are in docs/guides/ and docs/patterns/
```

### Configuration
```
Archive contains old config files
Current config is in docs/config/
```

---

## 🎓 Learning from Archive

The archive is valuable for:
- 📊 Understanding project evolution
- 📈 Tracking velocity + metrics
- 🔍 Finding past solutions
- 📚 Onboarding (show how we got here)
- 🎯 Retrospectives (comparing sprints)

---

## 🔗 Related

- **Current Sprint:** `docs/sprint/`
- **Pattern Reference:** `docs/patterns/`
- **Current Status:** `docs/reference/BMAD-STATUS.md`
- **Project Overview:** `README.md`

---

## ✅ Archive Maintenance

**Last Cleanup:** 2026-03-04
**Files Organized:** Yes (by type)
**Index Updated:** Yes (this file)
**Ready for Review:** Yes

---

**Archive Status:** ✅ Organized & Documented
**Next Action:** Reference only (no edits)

Good reference material! 🌱

