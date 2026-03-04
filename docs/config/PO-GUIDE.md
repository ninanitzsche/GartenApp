# 📋 PO Quick Start Guide - BMAD Method

**Last Updated:** 2026-03-04
**Status:** Active
**Audience:** PO, Stakeholders, Architects
**Related Files:** [CLAUDE.md](CLAUDE.md), [COST-GUIDELINES.md](COST-GUIDELINES.md), [../../README.md](../../README.md)

---

## 🚀 Quick Start

**NEW!** Willst du wissen was schon fertig ist? → `BMAD-STATUS.md`
- ✅ Alle 5 Sprints komplett (56.5 pts delivered)
- ✅ Alle 19 Phase 1 FRs delivered
- ✅ 6 Phase 2-3 FRs planned
- ✅ Alle 3 BMAD Phasen done
- ✅ Metriken & Learnings dokumentiert
- Ready for Phase 2 planning

---

## 🎯 Purpose

This guide helps Product Owners understand:
- Where project requirements live
- Where to find epics and stories
- How to create new requirements
- How to plan sprints
- How to track progress and metrics

**Success Criteria:**
- ✅ PO knows where epics are
- ✅ PO knows where stories are
- ✅ PO knows how to create new stories
- ✅ PO can estimate features based on velocity data
- ✅ PO understands cost and timeline implications

---

## 📊 BMAD Document Map (for POs)

### Phase 1: Product Analysis
📄 **File:** `docs/bmad/bmad-01-product-brief.md`

**What it contains:**
- Problem statement (Why do we build this?)
- Vision (What success looks like)
- Target user (Who is it for?)
- Success criteria (How do we measure success?)

**When to use it:**
- Onboarding new stakeholder
- Reminding team of core problems
- Evaluating new feature requests against vision

**Key Questions Answered:**
- "What problem does Gartenplaner solve?" → bmad-01
- "How do we measure success?" → bmad-01
- "Who are we building this for?" → bmad-01

---

### Phase 2: Requirements Definition
📄 **File:** `docs/bmad/bmad-02-prd.md` ⭐ **MOST IMPORTANT FOR PO**

**What it contains:**
- 7 Epics (EPIC-001 to EPIC-007)
- 25 Functional Requirements (FR-001 to FR-025)
- 9 Non-Functional Requirements
- Acceptance criteria for each requirement
- Epic breakdowns

**When to use it:**
- Creating new requirements
- Planning sprints (derive stories from epics)
- Evaluating scope changes
- Answering "What should we build?"

**Structure:**
```
EPIC-001: Plant Inventory Management
├── FR-001: User can add new plant
├── FR-002: User can search plants
├── FR-003: User can track plant status
└── FR-004: User can view plant details

EPIC-002: Shopping List
├── FR-011: User can add shopping item
├── FR-012: User can track costs
└── FR-013: User can mark item as purchased

...and 5 more epics
```

**How to Use:**
1. Open `docs/bmad/bmad-02-prd.md`
2. Find relevant epic for your feature
3. Check functional requirements under that epic
4. These become user stories in sprint planning

**Key Questions Answered:**
- "What requirements does Gartenplaner have?" → bmad-02
- "Which epic does my feature belong to?" → bmad-02
- "What acceptance criteria must be met?" → bmad-02

---

### Phase 3: System Architecture
📄 **File:** `docs/bmad/bmad-03-architecture.md`

**What it contains:**
- Technology stack decisions
- Database schema
- System components
- Integration points
- Deployment strategy

**When to use it:**
- Understanding technical constraints
- Evaluating new features (feasibility)
- Planning technical infrastructure work
- Understanding limitations

**Key Questions Answered:**
- "Can we build this with our tech stack?" → bmad-03
- "What's the database structure?" → bmad-03
- "How does authentication work?" → bmad-03

---

## 📝 Stories & Implementation Reference

### Story Register
📄 **File:** `docs/stories/STORY-REGISTER.md`

**What it contains:**
- List of all 11 completed stories (Sprint 1-5)
- Story ID, title, epic mapping
- Status and completion date
- Link to story documentation

**When to use it:**
- Finding a specific story
- Understanding what's been built
- Estimating similar new stories
- Historical reference

**Structure:**
```
STORY-001: Plant CRUD (✅ Complete)
├── Epic: EPIC-001 (Plant Inventory)
├── Points: 5
├── Completed: Sprint 1
└── Docs: docs/stories/STORY-001-SUMMARY.md

STORY-002: Plant Search & Filter (✅ Complete)
├── Epic: EPIC-001
├── Points: 5
├── Completed: Sprint 2
└── Docs: docs/stories/STORY-002-SUMMARY.md

... and 9 more stories
```

**How to Use:**
1. Go to `docs/stories/STORY-REGISTER.md`
2. Find the story you're interested in
3. Click link to story documentation
4. Read implementation details & lessons learned

---

## 🚀 Sprint Planning & Execution

### Current Sprint Plan
📄 **File:** `docs/sprint/sprint-plan-gartenplaner-mvp-*.md`

**What it contains:**
- Current sprint number (Sprint 6)
- Sprint duration
- Allocated stories
- Sprint goal
- Capacity and velocity
- Risk assessment

**When to use it:**
- Understanding what's being built this sprint
- Adjusting scope mid-sprint
- Tracking progress
- Planning next sprint

**Structure:**
```
Sprint 6: Plant Intelligence Features
├── Duration: 2 weeks (Mar 4 - Mar 17)
├── Capacity: 10.8 points (team baseline)
├── Stories: STORY-042 (3 pts), STORY-043 (5 pts), STORY-044 (3 pts)
├── Goal: "Deliver basic plant intelligence features"
└── Risks: New AI integration, third-party API dependency
```

**How to Use:**
1. Check current sprint plan before planning meeting
2. Understand what's in scope for this sprint
3. Plan next sprint based on capacity
4. Track progress against committed stories

---

### Sprint Start Checklist
📄 **File:** `docs/sprint/SPRINT-START-CHECKLIST.md`

**What it contains:**
- 15-minute pre-sprint checklist
- Requirements validation
- Schema planning
- Web compatibility check
- Code reuse analysis

**When to use it:**
- Before starting new sprint
- Ensuring team is aligned on scope
- Preventing scope creep

---

## 📈 Metrics & Estimation Reference

### Feature Implementation Learnings
📄 **File:** `docs/LEARNINGS/feature-implementation-learnings.md`

**What it contains:**
- How long each feature type takes
- Complexity estimates
- Known gotchas per feature
- Quality metrics
- Proven patterns

**When to use it:**
- Estimating new features
- Planning timeline
- Identifying risks
- Setting realistic expectations

**Example:**
```
Plant CRUD Feature
├── Points: 5
├── Duration: 1-2 days
├── Complexity: Medium
├── Gotchas: RLS policy setup, database indexing
└── Quality: Production ready on first try

Photo Upload Feature
├── Points: 5
├── Duration: 1-2 days
├── Complexity: High (platform differences)
├── Gotchas: Web blob URI handling, compression
├── Quality: Works on native, needs web testing
└── Learning: Test on web by Day 2!
```

**How to Use:**
1. Planning new feature?
2. Find similar feature in learnings
3. Use that as baseline for estimation
4. Adjust for differences
5. Account for identified gotchas

---

### Development Process & Cost
📄 **File:** `docs/LEARNINGS/development-process-learnings.md`

**What it contains:**
- Velocity baseline (10.8 pts/2 weeks)
- Sprint 6+ optimizations
- Cost data and optimization strategies
- Testing ROI
- Development workflow efficiency

**When to use it:**
- Budget planning
- Timeline estimation
- Understanding cost implications
- Sprint capacity planning

**Key Metrics:**
```
Velocity (Solo Developer):
- Average: 10.8 points per 2-week sprint
- Range: 10-12 points per sprint
- Cost: $0.30-0.50 per point

Sprint 6+ Optimizations:
- Schema-First Approach: $0.35/sprint savings
- Weekly Build Checkpoints: $0.20/sprint savings
- Strategic Testing: $1.00/sprint savings
- Total Expected: 20-25% cost reduction
```

**How to Use:**
1. Planning budget? Use cost per point
2. Planning timeline? Use velocity baseline
3. Planning Sprint 6+? Account for optimizations

---

### Bugs & Gotchas Reference
📄 **File:** `docs/LEARNINGS/bugs-and-gotchas.md`

**What it contains:**
- 14+ common issues and solutions
- Platform-specific gotchas (Web vs Native)
- RLS security issues
- Image/media handling
- State management issues
- Testing challenges

**When to use it:**
- Planning feature (identify potential issues)
- Reviewing new features (ensure gotchas are addressed)
- Setting testing strategy
- Understanding why some features take longer

**Example:**
```
Photo Upload Issue:
├── Problem: Works on Native, fails on Web
├── Root Cause: Blob URI handling differences
├── Solution: Platform-specific image handling
├── Cost: 3-4h first time, 30min on repeat
└── Prevention: Test Web by Day 2 always
```

---

## 🎓 How to Create New Requirements

### Option 1: Add to Existing Epic
**When:** Feature fits within existing epic

1. Open `docs/bmad/bmad-02-prd.md`
2. Find relevant epic (EPIC-001 through EPIC-007)
3. Add new requirement (FR-026, FR-027, etc.)
4. Define acceptance criteria
5. Link to epic
6. Save

---

### Option 2: Create New Story from Existing Epic
**When:** Requirement is clear, ready to implement

**Use the skill:** `/bmad:create-story`

```bash
/bmad:create-story STORY-045
```

This will:
1. Prompt for story details
2. Link to existing epic
3. Define user story format
4. Set acceptance criteria
5. Estimate points
6. Create story documentation in `docs/stories/`

---

### Option 3: Create New Epic + Requirements
**When:** New feature area beyond existing epics

**For simple decision:** Follow existing pattern
1. Copy EPIC structure from bmad-02-prd.md
2. Create EPIC-008 (next number)
3. Add 2-4 functional requirements
4. Define success criteria
5. Update documentation

**For complex decision:** Use `/bmad:solutioning-gate-check`

```bash
/bmad:solutioning-gate-check "New Plant Breeding Feature"
```

This will:
1. Analyze strategic implications
2. Check against product vision
3. Identify risks and dependencies
4. Recommend approach (new epic? New requirement? Skip?)
5. Document decision rationale

---

## 🔄 Sprint Planning Workflow (for POs)

### Before Sprint Planning (1 day before)
1. ✅ Review current backlog in bmad-02-prd.md
2. ✅ Check velocity baseline (10.8 pts / 2 weeks)
3. ✅ Check feature timings in docs/LEARNINGS/
4. ✅ Identify must-have stories for next sprint
5. ✅ Review risks in previous sprint

### During Sprint Planning (Meeting)
1. **Capacity Check:** 10.8 points available
2. **Story Selection:** Choose top-priority stories
3. **Estimation Review:** Check against learnings
4. **Risk Identification:** Flag known gotchas
5. **Goal Definition:** Define sprint goal
6. **Approval:** Get buy-in from team

### Create Sprint Plan
**Use the skill:** `/bmad:sprint-planning "Sprint 6"`

This will:
1. Load current requirements from bmad-02-prd.md
2. Break selected epics into stories
3. Estimate story points
4. Allocate to sprints
5. Calculate capacity
6. Identify risks
7. Create `docs/sprint/sprint-plan-*.md`

### After Sprint Planning
1. ✅ Review created sprint plan
2. ✅ Communicate sprint goal to team
3. ✅ Ensure all acceptance criteria are clear
4. ✅ Update docs/bmad-index.md if needed
5. ✅ Schedule daily standups

---

## 📊 Tracking & Status

### What's Complete?
→ `docs/stories/STORY-REGISTER.md`
- All 11 stories from Sprint 1-5
- Status: ✅ Complete
- Documentation: Links to each story

---

### What's In Progress?
→ `docs/sprint/sprint-plan-gartenplaner-mvp-*.md`
- Current sprint stories
- Progress per story
- Blockers or risks
- Expected completion date

---

### What's Coming?
→ Plan next sprint using workflow above

---

## 💡 Key Questions & Answers

### "Where are all my epics?"
→ `docs/bmad/bmad-02-prd.md`
7 epics documented with all requirements

---

### "How many stories have we completed?"
→ `docs/stories/STORY-REGISTER.md`
11 stories completed across Sprint 1-5

---

### "How long will Feature X take?"
→ `docs/LEARNINGS/feature-implementation-learnings.md`
Find similar feature, use that as baseline

---

### "What's the budget for Sprint 6?"
→ `docs/LEARNINGS/development-process-learnings.md`
Multiply story points × $0.03-0.05 per point
Expected: $0.50-1.00 for 10-point sprint

---

### "What's our velocity?"
→ 10.8 points per 2-week sprint (baseline)
See: `docs/LEARNINGS/development-process-learnings.md`

---

### "Can we add this feature?"
→ Check against:
1. Product vision in `docs/bmad/bmad-01-product-brief.md`
2. Requirements scope in `docs/bmad/bmad-02-prd.md`
3. Technical constraints in `docs/bmad/bmad-03-architecture.md`
4. Velocity capacity in `docs/LEARNINGS/development-process-learnings.md`

---

### "How do I estimate new features?"
→ Step-by-step:
1. Open `docs/LEARNINGS/feature-implementation-learnings.md`
2. Find similar feature
3. Use that time as baseline
4. Check for gotchas
5. Adjust for differences
6. Add buffer for unknowns

---

## 🚀 Quick Navigation (for POs)

| I want to... | Go to... | Time |
|---|---|---|
| See all epics | docs/bmad/bmad-02-prd.md | 15 min |
| See all stories | docs/stories/STORY-REGISTER.md | 10 min |
| See current sprint | docs/sprint/sprint-plan-*.md | 5 min |
| Estimate new feature | docs/LEARNINGS/feature-implementation-learnings.md | 10 min |
| Create new story | /bmad:create-story {ID} | 15 min |
| Plan new sprint | /bmad:sprint-planning {name} | 30 min |
| Evaluate big decision | /bmad:solutioning-gate-check {title} | 20 min |
| Check budget | docs/LEARNINGS/development-process-learnings.md | 5 min |
| Find similar story | docs/stories/STORY-REGISTER.md | 5 min |
| Understand constraints | docs/bmad/bmad-03-architecture.md | 15 min |

---

## 🎯 BMAD Workflow Skills (for POs)

### Skill 1: Create Story
```bash
/bmad:create-story STORY-045
```
**What it does:**
- Prompts for story details
- Links to existing epic
- Defines user story
- Sets acceptance criteria
- Estimates points
- Creates documentation

**When to use:** Ready to implement a requirement

---

### Skill 2: Sprint Planning
```bash
/bmad:sprint-planning "Sprint 7"
```
**What it does:**
- Load requirements from PRD
- Break epics into stories
- Estimate story points
- Allocate to sprints
- Calculate capacity
- Identify risks

**When to use:** Planning new sprint (every 2 weeks)

---

### Skill 3: Solutioning Gate Check
```bash
/bmad:solutioning-gate-check "New Feature Name"
```
**What it does:**
- Analyze strategic implications
- Check against product vision
- Identify risks
- Recommend approach
- Document decision

**When to use:** Complex feature or strategic decision

---

### Skill 4: Architecture (Reference)
```bash
/bmad:architecture
```
**What it does:**
- Review system design
- Check technical constraints
- Evaluate feasibility

**When to use:** Understanding technical implications

---

## 📚 Related Documentation

**For Developers:**
- `/ONBOARDING.md` - Developer onboarding
- `/QUICK-LINKS.md` - Fast navigation

**For Everyone:**
- `/README.md` - Project overview
- `/FILE-STRUCTURE.md` - Complete file structure
- `/CLAUDE.md` - Development configuration

**For Stakeholder:**
- `docs/bmad/bmad-01-product-brief.md` - Vision & success criteria

---

## ✅ Success Criteria for PO

After reading this guide, you should:

- ✅ Know where all epics are documented
- ✅ Know where all stories are documented
- ✅ Understand how to create new stories
- ✅ Know how to plan sprints
- ✅ Understand velocity and capacity
- ✅ Be able to estimate new features
- ✅ Understand BMAD workflow for your role
- ✅ Know all key metrics and constraints

---

## 🎓 Reading Order for New PO

1. **Start here:** `/README.md` (5 min)
2. **Then read:** `docs/bmad/bmad-01-product-brief.md` (10 min)
3. **Then read:** `docs/bmad/bmad-02-prd.md` - At least structure (15 min)
4. **Keep handy:** `docs/LEARNINGS/feature-implementation-learnings.md` (reference)
5. **Learn workflow:** This file (PO-GUIDE.md) (20 min)
6. **First task:** Create STORY-045 using `/bmad:create-story`

**Total Onboarding Time:** 1 hour

---

## 🆘 Getting Help

**"Where is X?"**
→ Check `docs/FILE-STRUCTURE.md` or `/QUICK-LINKS.md`

**"How do I create Y?"**
→ Check relevant skill section above

**"Can we estimate Z?"**
→ Check `docs/LEARNINGS/feature-implementation-learnings.md`

**"Is feature feasible?"**
→ Use `/bmad:solutioning-gate-check` skill

---

**Status:** ✅ Ready for use
**Last Updated:** 2026-03-04
**Version:** 1.0 (BMAD Method v6)

---

*This guide is designed for Product Owners to navigate the Gartenplaner project using BMAD methodology.*
