# 📐 Unified Documentation Schema - Gartenplaner

**Purpose:** Define the single source of truth for documentation organization
**Created:** 2026-03-04
**Audience:** PO, All Developers, Maintainers

---

## 🎯 Core Principle

**One Navigation Path + Clear Hierarchy = No Confusion**

All documentation follows this structure. New docs MUST fit into one of these categories.

---

## 📦 Unified Structure

### LEVEL 0: ROOT (Entry Points Only)
**Purpose:** Quick access to start any journey
**Rule:** Maximum 4 files here

```
gartenplaner-app/
├── README.md                    📖 Project overview + setup (5 min read)
├── QUICK-LINKS.md              🔗 PRIMARY NAVIGATION HUB (start here!)
├── ONBOARDING.md               🚀 New developer guide (1 hour)
└── MVP-RELEASE-SUMMARY.md      📊 Executive summary (2 min read)

⚠️ NOT HERE:
- Implementation guides (go to docs/)
- Code patterns (go to docs/patterns/ or memory/)
- Task tracking (never in docs/)
```

---

### LEVEL 1: Configuration (docs/config/)
**Purpose:** Rules, guidelines, how we work
**Reader:** Developers + PO

```
docs/config/
├── CLAUDE.md                   🤖 AI development rules (cost control, models)
├── COST-GUIDELINES.md          💰 Budget management checklist
└── PO-GUIDE.md                 👑 Product owner reference
```

**When to Add File Here:**
- It's a rule or guideline
- It applies to the whole project
- It affects development process

---

### LEVEL 2: Reference (docs/reference/)
**Purpose:** Navigation + structure information
**Reader:** All developers (when needed)

```
docs/reference/
├── BMAD-STATUS.md              📋 Project phases + completion status
├── FILE-STRUCTURE.md           🗂️ Directory layout + organization
├── WEB-NATIVE-DIFFERENCES.md   🌐 Platform-specific compatibility
├── DOCUMENTATION-SCHEMA.md     📐 This file (how docs are organized)
└── [Archive old reference files]
```

**When to Add File Here:**
- It explains project structure
- It's reference material (not how-to)
- It doesn't fit other categories

---

### LEVEL 3: BMAD Workflow (docs/bmad/)
**Purpose:** Product methodology - Brainstorm → Methodology → Architecture
**Reader:** PO, Tech Lead, Sprint Planning Team

```
docs/bmad/
├── bmad-01-product-brief.md           🧠 Problem analysis + vision
├── bmad-02-prd.md                     📝 PRD (25 FRs, 7 Epics, requirements)
├── bmad-03-architecture.md            🏗️ Tech stack, database, system design
├── BMAD-02-COMPLETION-MATRIX.md       ✅ All 25 FRs status (epic view)
├── BMAD-03-ARCHITECTURE-CHECKLIST.md  🔍 Architecture verification
└── bmad-index.md                      🔗 Navigation (points to above)

⚠️ DO NOT EDIT directly during sprints
   → For updates, use /bmad:* skills
```

**When to Add File Here:**
- It documents requirements or architecture
- It's part of formal BMAD workflow
- It goes through sprint planning

---

### LEVEL 4: Technical Reference (docs/database/, docs/testing/)
**Purpose:** Deep technical documentation
**Reader:** Developers implementing features

```
docs/database/
├── DATABASE-GUIDE.md           📊 Schema + relationships + RLS explained
├── database-rls-policies.md    🔐 RLS policy definitions + how to debug
└── SCHEMA-CHECKLIST.md         ☑️ Schema validation checklist

docs/testing/
├── TESTING-GUIDE.md            🧪 How to write tests (Jest setup, patterns)
├── TESTING-CHECKLIST.md        ✅ Manual testing checklist
└── TESTING-QUICK-REFERENCE.md  ⚡ Quick lookup for common tests
```

**When to Add File Here:**
- It's technical implementation detail
- It's reference for developers
- It's repeatable, not one-time

---

### LEVEL 5: Learning & Knowledge Base (docs/LEARNINGS/)
**Purpose:** Solutions to real problems, learnings
**Reader:** Developers solving bugs or building similar features

```
docs/LEARNINGS/
├── README.md                          🔗 Index of all learnings
├── feature-implementation-learnings.md ⏱️ How long features take + complexity
├── bugs-and-gotchas.md                🐛 14+ solved problems + solutions
└── [Future: architecture learnings, performance tuning, etc.]
```

**When to Add File Here:**
- You solved a real problem → Document it
- A pattern emerged → Document it
- A gotcha happens multiple times → Document it

**When to NOT add here:**
- It's a how-to (that's docs/patterns/)
- It's general knowledge (that's docs/guides/)

---

### LEVEL 6: Code Patterns (docs/patterns/)
**Purpose:** Reusable code templates + examples
**Reader:** Developers building features
**Status:** 🔧 NEW - Being created from codebase

```
docs/patterns/
├── service-layer.md            🏭 CRUD service template (copy-paste ready)
├── authentication.md           🔐 Auth flow pattern
├── react-hooks.md              🎣 Custom hooks + useEffect patterns
├── testing.md                  🧪 Service + component test templates
├── performance.md              ⚡ FlatList, image compression, optimization
└── README.md                   🔗 Index of patterns
```

**When to Add File Here:**
- You have repeatable code structure
- Other developers need the template
- It has a clear copy-paste example

**Example:**
```markdown
# Service Layer Pattern

## When to Use
When creating a new CRUD entity (plant, task, shopping item)

## Copy-Paste Template
[code example from plantService.ts]

## How to Adapt
1. Change entity name (plant → task)
2. Update table name (plants → tasks)
3. Update types (plant → task)
```

---

### LEVEL 7: Feature Guides (docs/guides/)
**Purpose:** Quick start + tutorial for specific features
**Reader:** Developers or users learning a specific feature
**Status:** Optional - For complex features

```
docs/guides/
├── QUICK-START-PLANTS.md       🌱 Plant inventory feature guide
├── QUICK-START-SHOPPING.md     🛒 Shopping list guide
├── QUICK-START-AUTH-SCREENS.md 🔐 Auth screens guide
└── [Add as features grow]
```

**When to Add File Here:**
- A feature is complex enough to warrant a guide
- Users need help learning the feature
- It's not just code patterns (that's docs/patterns/)

---

### LEVEL 8: Sprint & Planning (docs/sprint/)
**Purpose:** Sprint-specific planning and workflows
**Reader:** Dev team during sprints

```
docs/sprint/
├── SPRINT-START-CHECKLIST.md   ✅ 15-min pre-sprint checklist
├── SPRINT-6-WORKFLOW.md        📋 Sprint 6 specific workflow
├── sprint-plan-gartenplaner-mvp-2026-03-02.md  📅 Current sprint plan
└── [Create new file for each sprint]
```

**When to Add File Here:**
- It's sprint-specific planning
- It's a checklist for sprint start/end
- It has time-limited relevance

---

### LEVEL 9: Historical Archive (docs/archive/)
**Purpose:** Keep history without cluttering active docs
**Reader:** Rarely (historical reference)

```
docs/archive/
├── README.md                   🔗 Index of archived items
├── sprints/
│   ├── SPRINT-1-SUMMARY.md
│   ├── SPRINT-2-SUMMARY.md
│   ├── SPRINT-3-SUMMARY.md
│   ├── SPRINT-4-SUMMARY.md
│   └── SPRINT-5-SUMMARY.md
└── stories/
    ├── STORY-001-COMPLETED.md
    ├── STORY-002-IMPLEMENTATION.md
    └── [All completed stories]
```

**Rule:** Move to archive once:
- Sprint is complete + next sprint started
- Story is done + moved to main codebase
- Task file is completed + decision made

---

## 🔗 LINKING STANDARDS

### Rule 1: Relative Paths Only
```markdown
✅ [Database Guide](docs/database/database-guide.md)
✅ [MEMORY](../../MEMORY.md)
❌ [Link](/Users/ninanitzsche/.../path/file.md)
```

### Rule 2: Link Format
```markdown
✅ [Description](path/to/file.md)
✅ [Description](path/to/file.md#section-anchor)
✅ [Description](./relative/path.md)
```

### Rule 3: Anchor Names
```markdown
✅ ## 🎯 My Section Title
✅ [Jump to it](#-my-section-title)

❌ ## My Section Title
❌ [Jump to it](#my-section-title)
```

### Rule 4: Cross-Reference Template
When linking between doc levels, use this pattern:

```markdown
From docs/LEARNINGS/bugs-and-gotchas.md to docs/patterns/:
[See Service Layer pattern](../patterns/service-layer.md)

From docs/config/ to docs/database/:
[Database RLS guide](../database/database-rls-policies.md)

From root ONBOARDING.md to docs/:
[Architecture](docs/bmad/bmad-03-architecture.md)
```

---

## 📋 FILE NAMING CONVENTIONS

### Names Must Be:
- **Clear:** What does the file do? (No abbreviations)
- **Consistent:** Follow existing pattern
- **Descriptive:** File name = file purpose

### Good Names:
```
✅ feature-implementation-learnings.md  (What did we learn?)
✅ bugs-and-gotchas.md                 (What are the problems?)
✅ service-layer.md                    (What pattern is this?)
✅ database-guide.md                   (What's inside?)
✅ quick-start-plants.md              (Quick start for what?)
```

### Bad Names:
```
❌ doc1.md                    (Unclear)
❌ stuff.md                   (Too vague)
❌ temp-notes.md             (Don't put temp in docs!)
❌ story-2026-03-02.md       (Use sprints/ directory instead)
```

---

## 📝 HEADER STANDARDS

Every documentation file should start with:

```markdown
# 📖 Title (Emoji + Clear Title)

**Last Updated:** 2026-03-04
**Status:** Active | Draft | Archived
**Audience:** All | Developers | PO | Team
**Related Files:** [Link](path), [Link](path)

---

## 🎯 Section 1

### Subsection

Content...
```

### Status Values:
- **Active:** Currently used, regularly updated
- **Draft:** In progress, not yet finalized
- **Deprecated:** Old, replaced by something else
- **Archived:** Historical, kept for reference

---

## 🚫 WHAT NEVER GOES IN DOCS

| Type | Why | Where Instead |
|------|-----|---|
| Task tracking | Clutters active docs | JIRA/GitHub Issues + archive after done |
| Temporary notes | Creates stale docs | Personal notes or ARCHIVED folder |
| Code snippets only | Needs context | docs/patterns/ with explanation |
| Personal learnings | Not team process | LEARNINGS/ with clear title |
| One-time setup | Maintenance burden | Merge into main docs, then delete |
| Credentials/secrets | SECURITY RISK | .env.example + securely stored |

---

## 🔄 DOCUMENTATION LIFECYCLE

### When Creating New Doc

1. **Choose Category** using schema above
2. **Name File** following conventions
3. **Add Header** with metadata
4. **Link It** from parent index or QUICK-LINKS
5. **Verify Links** all work

### When Updating Doc

1. **Update "Last Updated" date**
2. **Update "Status" if changed**
3. **Check all links still work**
4. **Verify it still belongs in category**

### When Archive a Doc

1. **Move to docs/archive/** folder
2. **Keep all content** (never delete)
3. **Update status** to "Archived"
4. **Remove dead link** from index
5. **Add note** in archive/README.md

---

## ✅ VERIFICATION CHECKLIST

Before considering doc complete, verify:

- [ ] File in correct directory level
- [ ] Header has metadata (Last Updated, Status, Audience, Related)
- [ ] File name is clear + follows conventions
- [ ] All links use relative paths
- [ ] All links are functional
- [ ] File linked from parent index
- [ ] No /Users/ninanitzsche or absolute paths
- [ ] No temporary/task notes
- [ ] No credentials or secrets
- [ ] Duplication checked (consolidate if found)

---

## 📊 CURRENT SCHEMA COMPLIANCE

As of 2026-03-04:

| Level | Folder | Status | Notes |
|-------|--------|--------|-------|
| 0 | Root | ✅ 4 files | Perfect |
| 1 | config/ | ✅ 3 files | Complete |
| 2 | reference/ | ⚠️ 4 files + orphans | Cleanup needed |
| 3 | bmad/ | ✅ 5 files | Complete |
| 4 | database/ + testing/ | ✅ 8 files | Complete |
| 5 | LEARNINGS/ | ✅ 3 files | Complete |
| 6 | patterns/ | 🔧 MISSING | Need to create |
| 7 | guides/ | ✅ 3 files | Optional |
| 8 | sprint/ | ✅ 4 files | Current + archived |
| 9 | archive/ | ⚠️ Mixed | Needs organization |

---

## 🚀 MIGRATION PATH

**From Current to Schema-Compliant (2 hours):**

1. **Create docs/patterns/** (30 min)
   - Extract service-layer.md from plantService.ts
   - Extract authentication.md from AuthContext.tsx
   - Extract testing.md from test files
   - Extract react-hooks.md from codebase
   - Extract performance.md from optimization

2. **Fix All Links** (20 min)
   - Update ONBOARDING.md paths
   - Update QUICK-LINKS.md paths
   - Update MEMORY.md pattern links
   - Fix any /Users/ninanitzsche paths

3. **Archive Task Files** (10 min)
   - Move PROJECT-CLEANUP files to archive/
   - Move reorganization task file to archive/
   - Create archive/README.md with index

4. **Consolidate Indexes** (20 min)
   - Make QUICK-LINKS.md primary navigation
   - Remove duplicate content from ONBOARDING.md
   - Link bmad-index.md from QUICK-LINKS

5. **Test Navigation** (10 min)
   - Start from QUICK-LINKS.md
   - Follow every link
   - Verify all paths work

6. **Document Verification** (30 min)
   - Run through all .md files
   - Check every link
   - Fix any remaining issues

---

## 🎯 CONCLUSION

This schema provides:
- ✅ Single navigation entry point (QUICK-LINKS.md)
- ✅ Clear hierarchy (9 levels, each with purpose)
- ✅ Consistent naming + organization
- ✅ No ambiguity about where new docs go
- ✅ Easy maintenance + archival process

**Once implemented:** New developers can navigate with confidence, maintenance burden drops, and documentation stays clean as project grows.

---

**Schema Version:** 1.0
**Approved by:** PO + Dev Team
**Implementation Start:** 2026-03-04
**Target Completion:** 2026-03-05

