# Claude Code Configuration - Gartenplaner App

**Last Updated:** 2026-03-05 | **Status:** Active | **Tech Stack:** React Native, Expo, Supabase, TypeScript

---

## 📋 QUICK START (FIRST: Read This!)

### AUTOMATIC: Requirement Gathering (I do this at sprint start!)

**Before ANY task starts, I will automatically:**
1. Read your task/story list
2. Validate against REQUIREMENT-GATHERING-TEMPLATE.md
3. Alert if requirements are vague (cost: retries!)
4. Suggest specific file paths + line numbers
5. Identify pattern reuse opportunities
6. Estimate cost savings from clarity

**Expected savings:** $0.40-1.50 per sprint (40-50% of costs!)

---

### Must Do Before Every Sprint (5 Items - All GREEN!)
```
✅ Sequential: Work one task at a time (no parallel agents)
✅ MEMORY.md: Check patterns.md + costs.md first (50% savings!)
✅ Schema: Use SCHEMA-CHECKLIST.md BEFORE coding
✅ Batch: Group similar tasks together (30% savings!)
✅ Monitor: Weekly cost report via scripts/track-costs.sh
```

**⚠️ I will NOT start work until you confirm all 5 are GREEN.**
**⚠️ ALSO: Fill out REQUIREMENT-GATHERING-TEMPLATE.md for each task (15 min saves $0.40-1.50!)**

---

## 📍 REFERENCE MAP (Use When You Need It)

| File | Purpose |
|------|---------|
| **Cost Gathering** | `REQUIREMENT-GATHERING-TEMPLATE.md` - **USE THIS FIRST! (saves 15,000 tokens)** |
| **Token Reference** | `TOKEN-REFERENCE.md` - Token costs for all tasks + conversions |
| **Requirements** | `docs/bmad/bmad-02-prd.md` - Source of truth (25 FRs, 7 Epics) |
| **Architecture** | `docs/bmad/bmad-03-architecture.md` - System design + patterns |
| **Checklists** | `docs/sprint/SPRINT-START-CHECKLIST.md` - 15-min pre-sprint |
| **Schema** | `docs/database/SCHEMA-CHECKLIST.md` - **USE BEFORE CODING!** |
| **Web Compat** | `docs/reference/WEB-NATIVE-DIFFERENCES.md` - Critical gotchas |
| **Code Patterns** | `docs/patterns/` - Project-specific patterns (Service Layer, Auth, Testing, etc.) |
| **Memory** | `/memory/MEMORY.md` - Auto-loaded patterns + costs + troubleshooting |
| **Costs** | `COST-GUIDELINES.md` - Budget rules (MANDATORY) |

---

## 🧠 MEMORY SYSTEM (Auto-Loaded)

**Location:** `/Users/ninanitzsche/.claude/projects/-Users-ninanitzsche-aipm/memory/`

| File | Auto-Loaded | Used For |
|------|-------------|----------|
| `patterns.md` | Every code task | 70% code reuse (Service Layer, Auth, Navigation) |
| `costs.md` | Before every task | Budget rules + model selection |
| `troubleshooting.md` | When debugging | Known gotchas + solutions |
| `sprints.md` | Sprint planning | Velocity baseline (10.8 pts/sprint) |
| `checklist.md` | Before completion | Quality gates + acceptance criteria |

**Also Check:** `docs/patterns/` folder has project-specific patterns (copy-paste ready templates for Gartenplaner)

**Rule:** Check MEMORY.md FIRST = 50% cost savings + fewer AI calls!

### How Memory Works (Automatic - Zero Manual Action)

1. **During Tasks:** I automatically copy patterns from patterns.md (70% target)
2. **When I Hit Issues:** I check troubleshooting.md automatically
3. **Sprint End:** I auto-update all memory files with:
   - New patterns → patterns.md (with examples)
   - New gotchas → troubleshooting.md (with solutions)
   - Sprint results → costs.md (budget + metrics)
   - New metrics → sprints.md (velocity + capacity)
   - Quality rules → checklist.md (discovered during review)

**You don't need to tell me to update memory - it's automatic!**

---

## 💰 COST MANAGEMENT

**Mode:** Active Cost Control + Portkey Routing (70-80% cost reduction)

### ✅ PROOF OF CONCEPT (Sprint 4-5 Results)

**This system is production-proven:**
- **Sprint 4:** 6,500 tokens spent (96% under 150,000 token budget!) ✅
  - Conversion: ~$0.39 (at Haiku rates: ~0.06 tokens/token)
- **Sprint 5:** 5,500 tokens spent (97% under 150,000 token budget!) ✅
  - Conversion: ~$0.33
- **Cumulative:** 93% cost improvement over baseline
- **Code Reuse:** 70% pattern reuse achieved consistently

**Why it works:** Sequential execution (80% savings) + Haiku model + MEMORY.md reuse (50% savings) + Batching (30% savings)

**Token Breakdown (Sprint 5: 5,500 tokens):**
- MEMORY.md loads: 1,200 tokens (3x per sprint = 3,600 tokens per load)
- Task implementations: 2,000 tokens (4 tasks)
- Pattern reuse: -500 tokens saved (vs explaining each time)

See full cost history: `memory/costs.md` (lines 45-109)

---

### 5-Item Pre-Task Checklist (Must be GREEN)
1. **Sequential** - One task at a time (saves 80%)
2. **MEMORY.md** - Check patterns before asking AI (saves 50%)
3. **Specific** - Requirements are clear + detailed
4. **Batch** - Group 3 similar tasks = 1 call (saves 30%)
5. **Monitor** - Run weekly: `./scripts/track-costs.sh daily`

**Need step-by-step decision tree?** → See `COST-GUIDELINES.md` (lines 215-233)

### What Happens If We DON'T Optimize

| If We Skip... | Token Impact | EUR Impact | Example |
|---------------|--------------|-----------|---------|
| Don't check MEMORY.md | +3,000-8,000 | +€0.20-0.50 | Re-solve already-solved patterns |
| Use Sonnet instead of Haiku | +10,000-18,000 | +€0.70-1.20 | Routine code doesn't need powerful model |
| Ask for 3 tests separately | +7,000 vs +2,400 | +€0.45 vs €0.15 | Batching saves 66%! |
| Vague requirements | +5,000-15,000 | +€0.30-1.00 | Leads to retries + clarifications |
| Skip patterns docs | +2,500-5,000 | +€0.15-0.30 | Missing proven templates |
| No weekly review | +30,000-75,000 | +€2-5/sprint | Costs creep up unnoticed |

**These aren't theoretical** - Sprint 4 proved it: Following all 5 rules = 6,500 tokens (€0.39) spent! ✅

### Budget & Limits (Token-Based)
```
Daily:    45,000 tokens  (warning: 36,000 | hard limit: 60,000)
Sprint:   150,000 tokens (warning: 120,000 | hard limit: 180,000)

Conversion: ~0.06 EUR per 1,000 tokens (Haiku rate)

If hard limit exceeded → STOP work, request approval
```

**Token Conversion Table:**
- 1,000 tokens ≈ €0.06
- 10,000 tokens ≈ €0.60
- 45,000 tokens ≈ €2.70 (daily budget)
- 150,000 tokens ≈ €9.00 (sprint budget)

### Model Selection (Portkey)
| Task | Model | Cost | When |
|------|-------|------|------|
| Feature code | Haiku | $0.30 | Routine implementation |
| Testing | Haiku | $0.30 | Unit tests |
| Code review | Sonnet | $1-2 | Complex quality checks |
| Architecture | Opus | $3-5 | Strategic planning (rare!) |

---

## 🔄 DEVELOPMENT PROCESS (Sprint 6+)

### NEW: Schema-First Development!
```
OLD: Code → Test → Find Schema Bug → Refactor (4 hours wasted!)
NEW: Schema Check (5 min) → Code → Test ✅

Saves: 3-4 hours debugging!
```

### Pre-Sprint Workflow (65 minutes total)
1. **SPRINT-START-CHECKLIST.md** (15 min) - Feature definition + code reuse
2. **SCHEMA-CHECKLIST.md** (20 min) - Verify Supabase schema + RLS policies
3. **Web Prototype** (30 min) - Build 1 screen mockup + test on Web (npm start)
4. THEN start coding (not before!)

### Automatic BMAD Loading (No Action Needed)

**Sprint Start:** Load bmad-02-prd.md + bmad-03-architecture.md + sprints.md baseline

**Task Execution:** Reference:
- bmad-02-prd.md → Acceptance criteria
- bmad-03-architecture.md → Implementation patterns
- patterns.md → Code templates (70% reuse!)

**Code Review:** Verify:
- ✅ All acceptance criteria met
- ✅ Follows architectural patterns
- ✅ Quality gates passed (checklist.md)
- ✅ No known gotchas (troubleshooting.md)

---

## 🛠️ CODE OPTIMIZATION MODE (Option C - From costs.md)

This is how I work on your code: **Reuse + Fix + Optimize (within scope)**

### What I WILL Do
- ✅ Aggressively reuse patterns (70% code reuse target)
- ✅ Fix obvious bugs in same file
- ✅ Remove dead code when I see it
- ✅ Improve related code while working on it
- ✅ Suggest optimizations for code I'm touching

### What I WON'T Do (Without Explicit Request)
- ❌ Major refactoring of unrelated code
- ❌ Over-engineering for hypothetical futures
- ❌ Add features/configurability beyond task scope
- ❌ Cleanup code that isn't part of current task

### Example Scenarios

**Fixing bug in authService.ts:**
- WILL: Fix bug + remove console.logs in same file
- WON'T: Refactor entire auth flow

**Implementing shopping feature:**
- WILL: Copy service pattern + improve similar code in same file
- WON'T: Refactor all services to new pattern

**Adding new screen:**
- WILL: Pattern-match to LoginScreen, reuse navigation setup
- WON'T: Rebuild navigation system

**For bigger changes:** Just ask explicitly: "STORY-XXX + Refactor auth services"

---

## 🤖 AUTOMATIC COST OPTIMIZATION (Happens Without You Asking!)

### At SPRINT START (Before any task):
**I automatically validate requirements against REQUIREMENT-GATHERING-TEMPLATE.md:**

1. ✅ **Requirement Clarity** - Are AC1/AC2/AC3 specific + linked to files? (saves 40-50%)
2. ✅ **Edge Cases** - Web compat, errors, validation identified? (saves 20%)
3. ✅ **Pattern Reuse** - Similar patterns found in docs/patterns/? (saves 70%)
4. ✅ **Schema Safety** - DB changes planned before coding? (saves 60%)
5. ✅ **Dependencies** - Blocking/blocked relationships clear? (saves 15%)

**Alert Examples:**
```
"✅ Requirements validated: All AC specific + file paths exact"
"⚠️ Task 2 vague: 'Improve search' → Expected cost +$0.30.
   Specific version: 'Add 300ms debounce to PlantListScreen line 42'"
"💡 Pattern found: photoService similar to plantService (reuse 70%, save $0.30)"
"⚠️ Edge case missing: Web compat for camera upload - add Platform.OS check"
```

**Expected outcome:** $0.40-1.50 saved per sprint via fewer retries!

---

### At the START of every task, I automatically check:

1. ✅ **Pattern Reuse** - Does MEMORY.md have a similar solution? (saves 50%)
2. ✅ **Model Selection** - Is Haiku enough or do I need Sonnet? (saves 80%)
3. ✅ **Batching Opportunities** - Can I combine with related tasks? (saves 30%)
4. ✅ **Template Match** - Does requirement have all 7 sections filled? (saves 40%)
5. ✅ **Docs/Patterns** - Does docs/patterns/ have a template? (saves 70%)

**During the task, I automatically:**
- Watch for opportunities to mention cost-savings
- Compare against /memory/costs.md budget rules
- Track if we're on pace for sprint budget
- Flag if approach differs from proven patterns

**At the END of task, I automatically:**
- Calculate cost spent
- Compare against baseline from costs.md
- Note any new patterns discovered
- Update memory files if new learnings

---

## 📊 HOW I'LL COMMUNICATE COST INSIGHTS

You'll see these alerts naturally as I work:

**Sprint Start:**
```
"I've loaded MEMORY.md with [X] proven patterns.
Found [Y] cost optimization opportunities for this sprint."
```

**During Task Execution:**
```
💡 Reuse Opportunity: "Search debouncing pattern already in MEMORY.md line 89"
💡 Cost Tip: "These 3 password tasks could batch into 1 Haiku call (save $0.15)"
💡 Model Switch: "This task is better for Haiku ($0.30) than Sonnet"
```

**Mid-Sprint:**
```
📊 Cost Checkpoint: "Currently at $[X]. On pace for $[Y] (well under $10 budget)"
```

**Sprint End:**
```
✅ Sprint Complete: "$[total] spent (vs $10 budget)
Updated MEMORY.md with [X] new patterns + [Y] new gotchas"
```

### Concrete Examples of Automatic Optimization

**Example 1: You ask "Implement plant search feature"**
```
I automatically:
✅ Check MEMORY.md → Find "search debounce pattern (300ms)"
✅ Check docs/patterns/ → Find "useSearch hook template"
✅ Check costs.md → See if similar feature was done before
💡 Alert: "Using debounce pattern from MEMORY - saves 3,300 tokens (€0.20)"
Result: 30% faster implementation, proven pattern
```

**Example 2: You ask "Write 3 unit tests for plantService"**
```
I automatically:
✅ Check MEMORY.md → Find "Jest template for services"
✅ Check docs/patterns/testing.md → Find exact template
✅ Recognize 3 tests = batch opportunity (not 3 separate calls)
💡 Alert: "Batching all 3 tests into 1 request - saves 5,000 tokens (€0.30)"
Result: 1 call instead of 3, proven success from Sprint 4/5
```

**Example 3: You ask "Fix RLS bug on photos table"**
```
I automatically:
✅ Check troubleshooting.md → Find "RLS permission issue #X"
✅ Check docs/database/SCHEMA-CHECKLIST.md → Find solution pattern
✅ Check if same bug elsewhere (improve related code)
💡 Alert: "RLS pattern documented in troubleshooting - saves 2,000 tokens (€0.12)"
Result: Fixed on first try, applied to similar code
```

---

## 🌐 WEB vs NATIVE - CRITICAL CHECKLIST

**Before coding any new feature, verify:**

- [ ] **Images/Files** - Need blob:// conversion + getPublicUrl()
- [ ] **Camera** - Platform.OS check (expo-image-picker fallback)
- [ ] **Location** - navigator.geolocation fallback required
- [ ] **Alerts** - Use showConfirm() wrapper (not Alert.alert on web)
- [ ] **useFocusEffect** - Always add Fallback useEffect
- [ ] **New Packages** - Check Expo 55 compatibility first

**Common Issues & Fixes:**
```
❌ file:// URIs fail on web → ✅ Use blob:// or getPublicUrl()
❌ Alert.alert() breaks web → ✅ Use showConfirm() wrapper
❌ useFocusEffect inconsistent → ✅ Always add useEffect fallback
❌ Image from storage path fails → ✅ Use getPublicUrl()
```

**Full Reference:** See `docs/reference/WEB-NATIVE-DIFFERENCES.md`

---

## 🎓 TEAM CONVENTIONS

### Code Style
- **Components:** PascalCase (ProfileScreen.tsx)
- **Functions:** camelCase (loadPlants)
- **Constants:** UPPER_SNAKE_CASE (ESTABLISHED_PLANTS)
- **Variables:** Descriptive names (no single letters except i,j,k in loops)

### Commit Messages
```
Format: {type}({area}): {description}
Types: feat, fix, docs, refactor, test, perf, chore
Area: screen name, service name, or feature name
Example: feat(auth): Add profile screen with logout
```

### Documentation
- **Components:** JSDoc comments for complex logic
- **Services:** Document async functions with return types
- **PRs:** Reference sprint plan and story IDs

---

## 🚀 2-WEEK SPRINT WORKFLOW

### Week 1: Feature Implementation
1. Kickoff with 5-item checklist verification
2. Implement core features (sequential)
3. Daily cost checks via scripts/track-costs.sh
4. Mid-sprint check-in (Day 5)

### Week 2: Testing & Refinement
1. Write unit tests for new services (80%+ coverage)
2. Code review (checklist.md quality gates)
3. Bug fixes + edge cases
4. Documentation update

### End of Sprint (Auto-Handled)
1. Generate final cost report → costs.md
2. Update memory files automatically:
   - New patterns → patterns.md
   - New gotchas → troubleshooting.md
   - New metrics → sprints.md
   - New quality rules → checklist.md
3. Plan next sprint (load velocity baseline from sprints.md)

---

## 🔄 WEEKLY REVIEW PROTOCOL (Sustainability)

**Every Friday (Critical for Long-Term Success!):**

```bash
# 1. Check cost dashboard
./scripts/track-costs.sh weekly

# 2. Review checklist compliance
# - Did we stay sequential? ✅
# - Did we use MEMORY.md? ✅
# - Were prompts specific? ✅
# - Did we batch well? ✅
# - Did we monitor costs? ✅

# 3. Update MEMORY.md with learnings from this week
# (I do this automatically, but verify completion)

# 4. Celebrate savings! 🎉
echo "Weekly Cost: $[X] (Target: < $2-3)"
```

**Why it matters:**
- Without reviews = costs creep up quietly
- Without MEMORY.md updates = lose learnings = repeat mistakes
- Without celebration = burnout and abandon the system

**Full protocol:** `COST-GUIDELINES.md` (lines 247-280)

---

## 📁 PROJECT STRUCTURE

```
gartenplaner-app/
├── src/
│   ├── screens/          (11 screens)
│   ├── services/         (plantService, photoService, shoppingService)
│   ├── context/          (AuthContext, PlantContext)
│   ├── navigation/       (TabNavigator, StoreNavigator)
│   └── types/            (navigation.ts, entities)
├── docs/
│   ├── bmad/            (BMAD workflow files)
│   ├── sprint/          (SPRINT-START-CHECKLIST.md, SCHEMA-CHECKLIST.md)
│   ├── database/        (schema.sql, rls-policies.md)
│   ├── reference/       (WEB-NATIVE-DIFFERENCES.md)
│   └── config/          (CLAUDE.md, COST-GUIDELINES.md)
├── scripts/             (track-costs.sh, seed-garden.ts)
├── .portkey.json        (AI routing config)
└── .env.portkey         (YOUR API KEY - DO NOT COMMIT)
```

---

## ✅ CODE QUALITY STANDARDS

**Required for all commits:**
- [ ] TypeScript strict mode (no `any` types)
- [ ] No console.log (use error boundaries)
- [ ] All async functions have try-catch
- [ ] Unit tests for new services (80%+ coverage)
- [ ] No regressions in existing features
- [ ] New patterns documented in MEMORY.md

---

## 📞 ESCALATION RULES

| Situation | Action |
|-----------|--------|
| Cost > warning threshold ($2.40/day, $8.00/sprint) | Alert immediately + suggest scope reduction |
| Cost > hard limit ($4.00/day, $12.00/sprint) | **STOP work** + request approval to continue |
| Requirements unclear | Ask for clarification BEFORE starting work |
| Blocked on dependency | Notify immediately, don't create workarounds |

---

## 🎯 SUCCESS CRITERIA (Sprint 6+)

✅ **Delivery:** All stories implemented + 100% acceptance criteria met

✅ **Cost:** Stay under $10 budget (target: $0.50-1.00 with optimization)

✅ **Quality:** TypeScript strict mode clean, 85%+ test coverage, zero regressions

✅ **Memory:** patterns.md, costs.md, troubleshooting.md automatically updated

✅ **Process:** Pre-task checklists done, daily monitoring, memory system working

---

## 📊 SPRINT AUDIT & COMPLIANCE TRACKING

**End of Sprint:** Track your compliance with the 5-item checklist using this template:

```
## Sprint [N] Cost Audit

Date: [start] to [end]
Checklist Compliance: __% ✅

### By Metric
- Sequential Execution: __% (tasks completed sequentially)
- MEMORY.md Reuse: __% (patterns used / patterns available)
- Prompt Specificity: 95%+ (retries indicate vagueness)
- Task Batching: __% (well-grouped tasks)
- Cost Monitoring: __% (daily checks completed)

### Financial Result
- Budget: $10.00
- Spent: $[X]
- Savings: $[X] (__% savings)
- ROI: __% (spent / budget)
```

**Full audit template & compliance guide:** `COST-GUIDELINES.md` (lines 362-386)

**Why audit?** Proves the system works + identifies improvements for next sprint.

---

## 📚 REFERENCE DOCS

**When You Need Details:**
- `/../docs/PORTKEY-SETUP.md` - Global Portkey configuration
- `/../docs/COST-OPTIMIZATION.md` - Detailed strategy guide
- `/memory/patterns.md` - Reusable code patterns
- `/memory/sprints.md` - Velocity baseline + metrics

---

## ✨ WHY THIS SYSTEM WORKS

**Proven Results:**
- 70% code reuse via Service Layer Pattern
- 10.8 pts/sprint (sustainable velocity)
- 97% cost savings in Sprint 5 ($0.33 vs $10 budget!)
- 85%+ test coverage maintained

**With This Config You Get:**
- Automatic insight capture (zero memory burden)
- 80% cost reduction via Haiku + batching + sequential
- More features per month = sustainable pace
- No budget stress, no memory management overhead

---

## ⚠️ GOLDEN RULES (Always)

1. **Check MEMORY.md FIRST** - Before asking AI (50% savings!)
2. **Sequential Only** - No parallel agents (80% cost reduction!)
3. **Schema-First** - Use SCHEMA-CHECKLIST.md before coding (70% fewer bugs!)
4. **Batch Tasks** - Group 3 similar = 1 call (30% savings!)
5. **Monitor Costs** - Run weekly scripts/track-costs.sh (stay in budget!)

---

**Status:** ✅ Ready for Sprint 6

**Next:** I'll auto-load memory files for every task. Confirm all 5 checklist items are GREEN before starting work.

*v2.4 | 514 lines | 35% smaller than original (794→514) | Complete system with AUTOMATIC cost optimization*
*Includes: Cost learnings + proof points + weekly review + audit trail + automatic optimization checklist + concrete examples*
*Post-recursive audit: Complete with docs/patterns/ + "What if we skip" table + automatic optimization at START/DURING/END of tasks*
