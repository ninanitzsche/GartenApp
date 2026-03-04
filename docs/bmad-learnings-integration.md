# 🔗 BMAD-LEARNINGS Integration Guide

**Purpose:** Document how to access and use the cross-project learning system
**Location:** `/Users/ninanitzsche/aipm/BMAD-LEARNINGS/`
**Scope:** Learnings applicable across all projects
**Updated:** March 4, 2026

---

## 📍 What is BMAD-LEARNINGS?

BMAD-LEARNINGS is a **cross-project knowledge base** containing learnings, patterns, and best practices discovered across all AIPM projects. It's separate from the gartenplaner-app project documentation because:

- ✅ **Reusable** across multiple projects (Gartenplaner + future projects)
- ✅ **Persistent** - learnings don't get archived when projects complete
- ✅ **Centralized** - single source of truth for process wisdom
- ✅ **Evolving** - gets better as more projects use BMAD

---

## 📂 BMAD-LEARNINGS Structure

```
/Users/ninanitzsche/aipm/BMAD-LEARNINGS/
├── README.md                              ← Start here
├── bmad-method-learnings.md               ← BMAD process improvements
├── cost-optimization-learnings.md         ← Cost tracking & budgets
├── development-process-learnings.md       ← Sprint workflows, velocity
├── documentation-structure-learnings.md   ← How to organize docs
├── INTEGRATION-GUIDE.md                   ← Deprecated (use this file)
└── archive/                               ← Old/historical learnings
    ├── BMAD_Lernprozess_2026-03-02.md.archive
    ├── SPRINT-6-IMPROVEMENTS.md.archive
    └── FOLDER_STRUCTURE.md.archive
```

---

## 🎓 Key Learning Documents

### 1. cost-optimization-learnings.md 🔥
**Most Important for Gartenplaner**

**Contains:**
- Real Sprint 1-5 cost data
- Haiku vs Sonnet vs Opus comparison
- Batching strategies with ROI
- Sequential vs parallel analysis
- Budget tracking methodology

**Use When:**
- Planning budget for next sprint
- Optimizing costs for features
- Selecting AI models
- Analyzing cost/benefit of tools

**Example Findings:**
- Sprint 5: $0.33 actual vs $5.20 budget = **94% savings**
- Sequential development: 80% cheaper than parallel
- Haiku model: 70% cost reduction vs Sonnet

---

### 2. development-process-learnings.md
**How We Work**

**Contains:**
- Sprint cadence proven effective
- Daily standup format
- Code review process
- Testing strategy (85%+ coverage target)
- Velocity baseline (10.8 pts/sprint)

**Use When:**
- Starting new sprint
- Onboarding new team member
- Questioning process decisions
- Planning timeline estimates

---

### 3. bmad-method-learnings.md
**BMAD Workflow Improvements**

**Contains:**
- Phases 1-4 (Brainstorm → Methodology → Architecture → Development)
- What worked well in each phase
- Recommended adjustments for next project
- Timing estimates per phase

**Use When:**
- Planning Phase 3+ of Gartenplaner
- Starting new BMAD project
- Understanding why we chose this method

---

### 4. documentation-structure-learnings.md
**How to Organize Docs**

**Contains:**
- File naming conventions proven effective
- Directory structure recommendations
- What to document (and what not to)
- Cross-referencing best practices
- Version control for docs

**Use When:**
- Creating new project docs
- Reorganizing documentation
- Deciding where to put a file
- Setting up new developer guide

---

## 🔗 How Gartenplaner Uses BMAD-LEARNINGS

### Direct References
```
gartenplaner-app/
├── CLAUDE.md
│   → References cost-optimization-learnings.md for model selection
│   → References development-process-learnings.md for workflow
│
├── QUICK-LINKS.md
│   → Links to ../BMAD-LEARNINGS/cost-optimization-learnings.md
│   → Shows real cost data for feature estimation
│
├── MEMORY.md (auto-loaded)
│   → Captures patterns from BMAD-LEARNINGS
│   → Imports cost rules into decision-making
│
└── /docs/archive/sprints/SPRINT-*-SUMMARY.md
    → Records actual costs achieved
    → Feeds back into cost-optimization-learnings.md
```

### Feedback Loop
```
BMAD-LEARNINGS (Knowledge Base)
        ↑
        │ (Feeds into)
        │
Sprint Execution (Gartenplaner)
        │
        ↓ (Records findings)
        │
Sprint Summaries (SPRINT-*.md)
        │
        ↓ (Updates)
        │
BMAD-LEARNINGS (Improved Knowledge Base)
```

---

## 💡 How to Use Each Document

### For Cost Management
```
1. Read: QUICK-LINKS.md → Cost section
2. Reference: ../BMAD-LEARNINGS/cost-optimization-learnings.md
3. Check: Real Sprint 1-5 costs in that file
4. Apply: Budget rules from CLAUDE.md COST MANAGEMENT section
5. Track: Record actual costs in sprint summaries
6. Update: Feed results back to BMAD-LEARNINGS after sprint
```

### For Process Questions
```
1. Question: "How long should this feature take?"
2. Reference: BMAD-LEARNINGS/development-process-learnings.md
3. Check: "How long did similar features take in past sprints?"
4. Estimate: Use baseline + complexity multiplier
5. Example: "5-point feature = 2-3 days based on Sprint data"
```

### For New Developer Onboarding
```
1. Read: gartenplaner-app/ONBOARDING.md (15 min)
2. Check: gartenplaner-app/QUICK-LINKS.md (10 min)
3. Reference: BMAD-LEARNINGS/development-process-learnings.md (10 min)
4. Understand: Why we use this process + what's proven
5. Ready: Developer can start work with full context
```

---

## 📊 Real Data from BMAD-LEARNINGS

### Cost Performance (All Sprints)
From `cost-optimization-learnings.md`:

| Sprint | Budget | Actual | Savings |
|--------|--------|--------|---------|
| Sprint 1 | $5.00 | $0.65 | 87% |
| Sprint 2 | $5.00 | $0.58 | 88% |
| Sprint 3 | $5.00 | $0.41 | 92% |
| Sprint 4 | $5.00 | $0.38 | 92% |
| Sprint 5 | $5.00 | $0.33 | 94% |
| **AVERAGE** | **$25.00** | **$2.35** | **91%** |

**Insight:** Cost optimization improving each sprint (learning curve paying off)

### Velocity Baseline (All Sprints)
From `development-process-learnings.md`:

| Sprint | Points | Velocity | Status |
|--------|--------|----------|--------|
| Sprint 1 | 12 pts | Baseline | Established |
| Sprint 2 | 13 pts | +8% | Pattern reuse helping |
| Sprint 3 | 9 pts | -15% | Photos complex |
| Sprint 4 | 10 pts | Recovering | Learning from S3 |
| Sprint 5 | 10 pts | Stable | Sustainable |
| **Average** | **10.8 pts** | Stable | Ready for Phase 2 |

**Insight:** 10.8 pts/sprint is sustainable, can plan Phase 2 with this baseline

---

## 🚀 How Phase 2 Will Use BMAD-LEARNINGS

When starting AI integration in Sprint 6:

1. **Cost Planning:**
   - Check: "What was our cost/feature in past sprints?" → cost-optimization-learnings.md
   - Plan: "Claude Vision API will cost ~$0.01-0.05/image"
   - Budget: "100 test images = $1-5, fits in sprint budget"

2. **Process Planning:**
   - Check: "How did we handle complex features?" → development-process-learnings.md
   - Apply: "KI integration is complex, estimate 8 pts like photo handling"
   - Schedule: "2-3 days for KI task implementation"

3. **Architecture Planning:**
   - Check: "How did we structure services?" → documentation-structure-learnings.md
   - Apply: "Create claudeService.ts following plantService.ts pattern"
   - Pattern: "70% reuse from existing service layer"

---

## 📝 How to Update BMAD-LEARNINGS

**After Each Sprint:**

1. **Review what you learned:**
   - What cost did this sprint actually cost?
   - How was the velocity compared to baseline?
   - What new processes did we try?
   - What patterns worked well?

2. **Find relevant file in BMAD-LEARNINGS:**
   - Cost data → cost-optimization-learnings.md
   - Process insights → development-process-learnings.md
   - Architecture patterns → documentation-structure-learnings.md

3. **Add entry with sprint number:**
   ```markdown
   ### Sprint 5 Results
   - Actual Cost: $0.33 (vs $5.00 budget = 94% savings)
   - Velocity: 10 pts
   - Key Learnings:
     - Haiku model optimization effective
     - Batching 3 unit tests = 30% cost reduction
   ```

4. **Keep history (never delete):**
   - BMAD-LEARNINGS grows more valuable over time
   - Old entries become reference data
   - Archive old sections if file gets too large

---

## 🔄 Relationship to Project-Specific Docs

### BMAD-LEARNINGS (Cross-Project)
```
Scope: All AIPM projects
Lifetime: Permanent
Examples: Gartenplaner, future projects
Type: Process learnings, cost data, proven patterns
Location: /Users/ninanitzsche/aipm/BMAD-LEARNINGS/
```

### Gartenplaner Docs (Project-Specific)
```
Scope: Gartenplaner app only
Lifetime: Project lifetime
Type: Feature docs, architecture, requirements
Location: /Users/ninanitzsche/aipm/gartenplaner-app/
Includes:
  - docs/bmad/ → BMAD workflow for THIS project
  - docs/LEARNINGS/ → Gartenplaner-specific learnings
  - docs/archive/sprints/ → Sprint histories
  - MEMORY.md → Reusable code patterns
```

### Example Division
```
"Service Layer Pattern"
  → BMAD-LEARNINGS/development-process-learnings.md (general approach)
  → gartenplaner-app/MEMORY.md (implementation examples)
  → gartenplaner-app/docs/LEARNINGS/feature-implementation-learnings.md (timing data)
```

---

## 📌 Key Paths to Remember

**Access BMAD-LEARNINGS:**
```bash
cd /Users/ninanitzsche/aipm/BMAD-LEARNINGS/

# View available learning documents
ls -la

# Read cost data
cat cost-optimization-learnings.md

# Read process learnings
cat development-process-learnings.md
```

**From Gartenplaner context:**
```bash
# Go up one level to /aipm/
cd ../

# Access learning docs
cat BMAD-LEARNINGS/cost-optimization-learnings.md
```

**Relative path from gartenplaner-app:**
```
../BMAD-LEARNINGS/cost-optimization-learnings.md
```

---

## ✅ Integration Checklist

- [x] BMAD-LEARNINGS exists and has 6+ core documents
- [x] Cost data from Sprints 1-5 recorded
- [x] Process learnings captured
- [x] Gartenplaner CLAUDE.md references BMAD-LEARNINGS
- [x] QUICK-LINKS.md points to cost-optimization-learnings.md
- [x] Sprint summaries feed data back to BMAD-LEARNINGS
- [x] New developers can find and access BMAD-LEARNINGS
- [x] Phase 2 planning will use BMAD-LEARNINGS

---

## 🎓 Summary

**BMAD-LEARNINGS is:**
- ✅ Cross-project knowledge base
- ✅ Real cost + velocity data
- ✅ Proven patterns and processes
- ✅ Foundation for next projects
- ✅ Continuously improving

**For Gartenplaner MVP:**
- ✅ Used for cost optimization (91% average savings)
- ✅ Used for velocity planning (10.8 pts baseline)
- ✅ Used for process decisions (development-process-learnings.md)
- ✅ Fed back with Sprint results

**For Phase 2 & Beyond:**
- ✅ Reference for KI integration costs
- ✅ Baseline for feature estimation
- ✅ Template for process improvements
- ✅ Foundation for new projects

---

**Last Updated:** March 4, 2026
**Next Review:** End of Sprint 6 (Phase 2 completion)
**Owner:** Nina (Solo Developer) + Team

