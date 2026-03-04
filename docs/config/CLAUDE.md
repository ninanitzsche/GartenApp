# Claude Code Configuration - Gartenplaner App

**Last Updated:** 2026-03-04
**Status:** Active
**Audience:** Developers
**Related Files:** [../COST-GUIDELINES.md](../COST-GUIDELINES.md), [../PO-GUIDE.md](../PO-GUIDE.md), [../../MEMORY.md](../../MEMORY.md)

---

## 🎯 PROJECT CONTEXT

**Current Status:** Sprint 5 Complete + Expo Web Running, Sprint 6 Ready (with new approach!)
- Completed: Sprint 1-5 (56.5 pts, all approved + Web App running)
- Planned: Sprint 6+ (KI-Integration Phase 2)
- Tech Stack: React Native, Expo, Supabase, TypeScript
- **NEW:** Web-first development approach (tested weekly!)
- **NEW:** Specialized Memory System (divide & conquer approach)

**BMAD Workflow Files (Auto-Loaded):**
- `docs/bmad/bmad-01-product-brief.md` - Problem analysis, vision, success criteria
- `docs/bmad/bmad-02-prd.md` - 25 FRs, 7 Epics, requirements (the source of truth!)
- `docs/bmad/bmad-03-architecture.md` - Tech stack, DB schema, system design
- `docs/bmad-index.md` - Navigation guide for BMAD files

**Process & Planning:**
- `docs/sprint/SPRINT-START-CHECKLIST.md` - 15-min pre-sprint checklist
- `docs/database/SCHEMA-CHECKLIST.md` - Schema validation before coding
- `docs/sprint/SPRINT-6-WORKFLOW.md` - Sprint 6 workflow guide
- `docs/sprint/sprint-plan-gartenplaner-mvp-*.md` - Current sprint plan (created after /bmad:sprint-planning)

**Reference Files:**
- `COST-GUIDELINES.md` - Cost control checklist (MANDATORY)
- `docs/reference/WEB-NATIVE-DIFFERENCES.md` - Web vs native compatibility
- `/../docs/PORTKEY-SETUP.md` - Global PORTKEY configuration (in /aipm/docs/)
- `/../docs/PORTKEY-QUICK-REFERENCE.md` - Global PORTKEY reference (in /aipm/docs/)
- `.portkey.json` - AI routing (Haiku/Sonnet/Opus)

**🧠 MEMORY SYSTEM (Auto-Loaded):**
- **MEMORY.md** - Index only (links to specialized files)
- **patterns.md** - Code patterns (Service Layer, Auth, Navigation, etc.)
- **costs.md** - Budget, Models, Sprint results
- **troubleshooting.md** - Gotchas & solutions (12 documented)
- **sprints.md** - Velocity, Capacity, Metrics
- **checklist.md** - Quality gates, Code review, Pre-sprint

---

## 💰 COST MANAGEMENT (CRITICAL)

**Mode:** Active Cost Control + Continuous Learning
**Tool:** Portkey (70-80% cost reduction via intelligent routing)

### Memory-Driven Development (Option C + Learning Mode)

**How I use the Specialized Memory System:**

1. **At Sprint Start** (Automatic)
   - Read MEMORY.md (index) automatically
   - Load specialized files based on task type:
     - patterns.md (code patterns) → all code tasks
     - costs.md (budget rules) → before every task
     - troubleshooting.md (gotchas) → when debugging
     - sprints.md (metrics) → for planning
     - checklist.md (quality gates) → before completing
   - No action needed from you

2. **During Task Execution** (Silent)
   - Use patterns from patterns.md without asking (70% reuse target)
   - Copy code templates where applicable
   - Apply proven solutions from troubleshooting.md
   - Batch similar tasks based on checklist.md
   - Check costs.md rules before starting

3. **Cost Optimization Alerts** (Proactive)
   - If I spot a potential cost saving opportunity → **I'll mention it**
   - Examples of alerts you'll see:
     ```
     💡 Pattern Found: "Service Layer template in patterns.md (line X)"
     💡 Cost Tip: "These 3 tests could be batched (save $0.15)"
     💡 Gotcha Alert: "RLS permission issue documented in troubleshooting.md"
     💡 Reuse Opportunity: "Search debounce pattern from patterns.md"
     ```

4. **Automatic Memory Updates** (After Every Sprint)
   - New patterns → patterns.md
   - New gotchas → troubleshooting.md
   - New metrics → sprints.md
   - New quality rules → checklist.md
   - Sprint cost results → costs.md
   - No manual action required

### MANDATORY Pre-Task Checklist

**Before starting ANY work, verify ALL 5 items are GREEN:**

```
✅ Sequential: Nacheinander implementieren (nicht parallel)
✅ MEMORY: Check patterns.md + costs.md before starting
✅ Specific: Klare, detaillierte Anforderungen
✅ Batch: Ähnliche Tasks zusammenfassen
✅ Monitor: Wöchentlich Cost-Report checken
```

**Memory System Auto-Loads:**
- `patterns.md` → All code tasks (70% reuse target)
- `costs.md` → Before every task (budget rules)
- `troubleshooting.md` → When debugging (known solutions)
- `sprints.md` → For planning (velocity baseline)
- `checklist.md` → Before completion (quality gates)

**Process:**
1. I will show this checklist before starting work
2. Wait for your confirmation that all 5 are green
3. Only then begin with cost-optimized approach

**Automatic Learning (No Action Required):**
- I automatically capture insights during work
- New patterns → patterns.md (post-sprint)
- New gotchas → troubleshooting.md (same sprint)
- Cost results → costs.md (after each sprint)
- New quality rules → checklist.md (discovered during review)
- Metrics → sprints.md (end of sprint)

You don't need to tell me to update memory - it happens automatically!

**Related Files:**
- `COST-GUIDELINES.md` - Full enforcement protocol
- `/../docs/PORTKEY-SETUP.md` - Setup and usage guide (in /aipm/docs/)
- `/../docs/COST-OPTIMIZATION.md` - Detailed strategy (in /aipm/docs/)
- `scripts/track-costs.sh` - Daily cost monitoring

---

## 🔄 BMAD Auto-Loading & Workflow

**BMAD Files are Automatically Loaded:**

### Sprint Start (Automatic Loading)
```
I automatically load:
✅ bmad-02-prd.md (requirements - the source of truth!)
✅ bmad-03-architecture.md (technical approach)
✅ /memory/sprints.md (velocity baseline: 10.8 pts/sprint)
✅ /memory/costs.md (budget rules)
✅ SPRINT-START-CHECKLIST.md (planning process)
```

### Task Execution (During Story Implementation)
```
I automatically reference:
✅ bmad-02-prd.md → Acceptance criteria for story
✅ bmad-03-architecture.md → Implementation patterns
✅ /memory/patterns.md → Code patterns (70% reuse!)
✅ SCHEMA-CHECKLIST.md → Before starting code
✅ sprint-plan-*.md → Current sprint stories
```

### Code Review (Before Completion)
```
I automatically verify:
✅ bmad-02-prd.md → All acceptance criteria met
✅ bmad-03-architecture.md → Follows architectural patterns
✅ /memory/checklist.md → Quality gates passed
✅ /memory/troubleshooting.md → Known issues addressed
```

---

## 🔄 Automatic Learning During Development

**How I Automatically Capture & Use Insights:**

### During Task Execution

As I work, I automatically:
1. **Detect patterns** → Documented in /memory/patterns.md after sprint
2. **Find gotchas** → Log to /memory/troubleshooting.md (same sprint)
3. **Calculate metrics** → Save to /memory/sprints.md (end of sprint)
4. **Identify cost saves** → Track in /memory/costs.md (real-time)
5. **Discover quality rules** → Add to /memory/checklist.md (post-review)

### BMAD Integration
6. **Reference requirements** → bmad-02-prd.md (never outdated - source of truth!)
7. **Follow architecture** → bmad-03-architecture.md (ensures consistency)
8. **Update sprint status** → sprint-plan-*.md (track progress)

### Example Flow (Automatic, No Prompting Needed)

**Day 1: Task Execution**
```
I'm implementing a new service...
→ Automatically check patterns.md for similar service template
→ Copy 70% from plantService.ts (patterns.md says so)
→ If I hit a RLS error: Check troubleshooting.md (automatic)
→ Notice: 300ms debounce pattern works (log for update)
```

**Day 5: Code Review**
```
I review the code...
→ Find new pattern not in patterns.md → Flag for update
→ Spot quality issue → Add to checklist.md
→ Calculate sprint cost → Update costs.md
```

**Sprint End: Auto-Update Memory**
```
Tasks completed → All learnings automatically update:
- New code patterns → patterns.md (with examples)
- New gotchas found → troubleshooting.md (with solutions)
- Sprint metrics → sprints.md (velocity, cost)
- New quality rules → checklist.md
- Cost results → costs.md (for next sprint reference)
```

**Result:** No manual memory updates needed. Everything is automatic!

---

## 🎓 Cost Learning & Optimization Alerts

**I will proactively alert you when I spot:**

### 1. Batching Opportunities
```
💡 Reuse Opportunity: "These 3 password-related tasks
   could be batched into 1 Haiku call (save $0.15)"
```

### 2. Pattern Matches in MEMORY.md
```
💡 Pattern Found: "Search debouncing pattern already
   documented in MEMORY.md line 89 - copying from there"
```

### 3. Model Selection Improvements
```
💡 Model Tip: "This task is perfect for Haiku (cost $0.50)
   not Sonnet - switching routing"
```

### 4. Avoided AI Calls via MEMORY
```
💡 Saved Cost: "Used Service Layer template from MEMORY.md
   instead of asking AI - saved $0.30"
```

### 5. Sprint Cost Projections
```
💡 Budget Alert: "Current trajectory: $0.23 after Task 2
   of 4. On pace for $0.35 total (well under $10 budget)"
```

### 6. New Patterns Worth Documenting
```
💡 Memory Update Candidate: "This password reset pattern
   is cleaner than the old one - worth updating MEMORY.md
   after sprint completes"
```

### 7. Cost-Saving Insights
```
💡 Cost Win: "By batching these 3 unit tests instead of
   separate calls, we'll save ~$0.60 this sprint"
```

---

## 🔄 Code Optimization Strategy (Option C: Smart Hybrid)

**What I WILL Do:**
- ✅ Aggressively reuse existing patterns (70% code reuse target)
- ✅ Fix obvious bugs I encounter (even if not in task)
- ✅ Remove dead code when I see it
- ✅ Improve related code in same file while working on it
- ✅ Suggest optimizations for code I'm touching

**What I WON'T Do (Without Explicit Request):**
- ❌ Major refactoring of unrelated code
- ❌ Over-engineering for hypothetical futures
- ❌ Add features/configurability beyond task scope
- ❌ Cleanup code that isn't part of current task
- ❌ Add docstrings/comments to code I didn't change

**Examples of Option C in Action:**

```
Scenario 1: Fixing bug in authService.ts
WILL: Fix bug + remove console.logs in same file
WON'T: Refactor entire auth flow

Scenario 2: Implementing new shopping feature
WILL: Copy shoppingService pattern + improve similar code
WON'T: Refactor all services to new pattern

Scenario 3: Writing unit test
WILL: Use existing mock setup, improve test utils
WON'T: Rewrite all tests from scratch

Scenario 4: Adding new screen
WILL: Pattern-match to LoginScreen, reuse navigation
WON'T: Rebuild navigation system
```

**When You'll See Smart Hybrid Actions:**

```
During Task 1:
"💡 Code Opportunity: Found unused import in
   authService.ts while fixing bug - removing it"

"💡 Optimization: Noticed similar pattern in
   ChangePasswordScreen - applying debounce here too"

"💡 Bug Fix: Found console.log in same file -
   removing as part of cleanup"
```

**If You Want Bigger Changes:**

Just ask explicitly:
```
"STORY-XXX + Refactor auth services"
"Sprint 5 + Code quality improvements"
"Please optimize database queries"
```

Then I'll do aggressive refactoring with your approval.

---

## 🚀 DEVELOPMENT APPROACH - SPRINT 6+ (Schema-First!)

### NEW: Schema-First Development
**CRITICAL CHANGE:** Always validate schema BEFORE coding!

```
❌ OLD: Code → Test → Find Schema Error → Fix
✅ NEW: Schema Check (5 min) → Code → Test
```

### NEW Sprint Start Process (15 min)

**BEFORE starting code, complete in this order:**

1. **SPRINT-START-CHECKLIST.md** (15 min)
   - [ ] Feature definition (3 min)
   - [ ] Schema planning (5 min)
   - [ ] Web-compat check (4 min)
   - [ ] Code reuse (3 min)

2. **SCHEMA-CHECKLIST.md** (20 min)
   - [ ] Supabase schema verified
   - [ ] RLS-policies planned
   - [ ] Service functions sketched
   - [ ] Web-compat gotchas identified

3. **Web Prototype** (30 min)
   - [ ] 1 screen mockup
   - [ ] Test on Web (npm start)
   - [ ] Identify issues early

**TOTAL PRE-SPRINT:** 65 min
**SAVINGS:** Prevents 3-4 hours debugging!

### Model Selection (Portkey Routing)

| Task Type | Model | Use When | Cost |
|-----------|-------|----------|------|
| Feature Code (`/dev-story`) | Haiku 🟢 | Routine implementation | $0.30-0.50 |
| Code Review | Sonnet 🟡 | Quality checks | $1-2 |
| Architecture (`/sprint-planning`) | Opus 🔴 | Strategic only (rare!) | $3-5 |
| Documentation | Haiku 🟢 | Guides, summaries | $0.25-0.50 |
| Testing | Haiku 🟢 | Unit tests | $0.30-0.50 |
| Schema Planning | Haiku 🟢 | Before sprint | $0.10-0.15 |

### Task Execution Rules

**ALWAYS follow these rules (no exceptions):**

1. **Sequential Execution**
   - No parallel agents
   - Tasks execute one-at-a-time
   - Estimated savings: 80%

2. **Schema-First (NEW!)**
   - Use SCHEMA-CHECKLIST.md BEFORE coding
   - Verify Supabase tables & columns
   - Plan RLS-policies
   - Estimated savings: 70% of schema bugs!

3. **MEMORY.md Reuse**
   - Check `/Users/ninanitzsche/.claude/projects/-Users-ninanitzsche-aipm/memory/MEMORY.md` first
   - Copy proven patterns before asking AI
   - Estimated savings: 50%

4. **Web-Testing Early (NEW!)**
   - Day 2 EOD: npm start → Web build test
   - Day 4 EOD: Core feature on Web
   - Day 6 EOD: Full platform test
   - Estimated savings: 80% of web bugs!

5. **Batch Similar Tasks**
   - Group 3 unit tests into 1 request (not 3 separate calls)
   - Combine related documentation files
   - Estimated savings: 30%

6. **Daily Cost Monitoring**
   - Run: `./scripts/cost-check.sh daily`
   - Budget: $0.50-1.00 per feature (vs $0.50-1.50 before)
   - Alert if spending exceeds daily budget

---

## 📋 BEFORE STARTING WORK

**Every Sprint, I will show you:**

```
🚨 COST-OPTIMIZATION CHECKPOINT 🚨

Before proceeding, verify:

✅ Sequential: Working one task at a time
✅ MEMORY.md: Checked for reusable patterns
✅ Specific: Requirements are clear and detailed
✅ Batch: Similar tasks grouped together
✅ Monitor: Cost tracking script ready

Are all 5 items GREEN?

YES → I'll start work (cost-optimized)
NO → I'll wait for you to confirm completion

Current Status: ⏳ WAITING FOR YOUR CONFIRMATION
```

**I will NOT begin work until you confirm all 5 items are green.**

---

## 🛠️ TECHNOLOGY STACK

- **Frontend:** React Native + Expo
- **Backend:** Supabase (Auth, Database, RLS)
- **Language:** TypeScript (strict mode)
- **Testing:** Jest (Phase 1: services only)
- **Navigation:** React Navigation (Tab + Stack)
- **State:** React Context + useCallback/useEffect

---

## 🌐 WEB VS NATIVE - CRITICAL DIFFERENCES

**NEW: See `docs/reference/WEB-NATIVE-DIFFERENCES.md` for full reference!**

### Quick Checklist (per feature):
- [ ] **Bilder/Files:** Braucht blob:// Konvertierung + getPublicUrl()
- [ ] **Kamera:** Braucht Platform.OS fallback (expo-image-picker)
- [ ] **Location:** Braucht navigator.geolocation fallback
- [ ] **Alert.alert():** Ersetze mit window.confirm() auf Web
- [ ] **useFocusEffect:** Fallback useEffect hinzufügen
- [ ] **Neue Packages:** Check Expo 55 Kompatibilität

### Common Issues:
```
❌ file:// URIs funktionieren nicht auf Web
   ✅ Konvertiere zu blob:// oder nutze public URLs

❌ Alert.alert() funktioniert nicht auf Web
   ✅ Nutze showConfirm() Wrapper mit window.confirm()

❌ useFocusEffect triggert nicht immer auf Web
   ✅ Immer Fallback useEffect schreiben

❌ Image von Storage-Pfad kann nicht angezeigt werden
   ✅ Nutze getPublicUrl() um öffentliche URL zu generieren
```

---

## 📁 PROJECT STRUCTURE

```
gartenplaner-app/
├── src/
│   ├── screens/          (11 screens)
│   ├── services/         (plantService, shoppingService, photoService, etc)
│   ├── context/          (AuthContext, PlantContext)
│   ├── navigation/       (TabNavigator, StoreNavigator)
│   └── types/            (TypeScript interfaces)
├── docs/
│   ├── SPRINT-START-CHECKLIST.md     ← NEW: Use every sprint!
│   ├── SCHEMA-CHECKLIST.md           ← NEW: Before coding!
│   ├── WEB-NATIVE-DIFFERENCES.md     ← NEW: Reference guide!
│   └── (other documentation)
├── scripts/              (seed-garden.ts, cost-check.sh)
├── COST-GUIDELINES.md    (Cost control rules)
├── CLAUDE.md             (THIS FILE)
└── .portkey.json         (AI routing config)
```

---

## 📢 When You'll See Cost Alerts

**Sprint Start:**
```
"I've loaded MEMORY.md with [X] proven patterns.
Found [Y] cost optimization opportunities for this sprint."
```

**During Task Execution:**
```
"💡 Cost Tip: [Specific savings opportunity]"
(appears naturally as I work, not interrupting)
```

**Mid-Sprint (if cost tracking shows patterns):**
```
"📊 Cost Checkpoint: Currently at $[X].
[Suggestion for next task batching/optimization]"
```

**Sprint End:**
```
"✅ Sprint Complete: $[total] spent (vs $10 budget)
Updated MEMORY.md with [new patterns/learnings]"
```

---

## ✅ CODE QUALITY STANDARDS

**Must be met for all commits:**

- [ ] TypeScript strict mode (no `any` types)
- [ ] No console.log (use error boundaries)
- [ ] All async functions have try-catch
- [ ] Components have proper error handling
- [ ] New patterns added to MEMORY.md
- [ ] Unit tests for new services (80%+ coverage)
- [ ] No regressions in existing features

---

## 🎯 SPRINT 6 GOALS (Planned)

**Scope:** TBD (based on KI-Integration Phase 2)
**Budget:** $10.00 (target: $0.50-1.00 with optimization)
**Baseline:** 10.8 pts/sprint (5-sprint average)

**Reference - Sprint 5 Results:**
- Delivered: 10 points
- Cost: $0.33 (97% under budget!)
- Quality: 85%+ test coverage
- Status: ✅ Production ready

**New Approach for Sprint 6:**
- Use specialized memory files automatically
- Check patterns.md first (70% reuse target)
- Apply costs.md rules before each task
- Capture learnings in new structure

---

## 📊 COST BUDGETS

| Period | Budget | Warning | Hard Limit |
|--------|--------|---------|-----------|
| Daily | $3.00 | $2.40 | $4.00 |
| Weekly | $15.00 | $12.00 | $18.00 |
| Sprint | $10.00 | $8.00 | $12.00 |
| Monthly | $40.00 | $32.00 | $50.00 |

**If exceeded:** Stop work and request approval before continuing.

---

## 🔧 ENVIRONMENT SETUP

**Required Files:**
```bash
# Cost optimization
✅ .portkey.json (routing config)
✅ .env.portkey.example (template - committed)
✅ .env.portkey (YOUR API KEY - DO NOT COMMIT)

# Monitoring
✅ scripts/track-costs.sh (cost tracking)

# Documentation
✅ /../docs/PORTKEY-SETUP.md (setup guide - in /aipm/docs/)
✅ /../docs/COST-OPTIMIZATION.md (strategy - in /aipm/docs/)
✅ /../docs/PORTKEY-QUICK-REFERENCE.md (cheat sheet - in /aipm/docs/)
✅ COST-GUIDELINES.md (this checklist)
```

**Setup:**
```bash
# Copy environment template
cp .env.portkey.example .env.portkey

# Add your API key from https://app.portkey.ai
# PORTKEY_API_KEY=pk_live_xxxxxxxxxxxxx

# Verify .gitignore has .env.portkey
grep ".env.portkey" .gitignore
```

---

## 📝 MEMORY MANAGEMENT (Specialized System)

**Cross-Sprint Learning - Divide & Conquer Approach:**

**Location:** `/Users/ninanitzsche/.claude/projects/-Users-ninanitzsche-aipm/memory/`
- `MEMORY.md` - Index (130 lines, all loaded)
- `patterns.md` - Code patterns (350 lines, loaded on code tasks)
- `costs.md` - Budget & sprint results (200 lines, loaded always)
- `troubleshooting.md` - Gotchas & solutions (300 lines, loaded on debug)
- `sprints.md` - Velocity & metrics (280 lines, loaded on planning)
- `checklist.md` - Quality gates (320 lines, loaded on review)

**Auto-Loading Rules:**
1. **Sprint Start:** Load MEMORY.md + costs.md + sprints.md
2. **Code Task:** Auto-load patterns.md + checklist.md
3. **Debugging:** Auto-load troubleshooting.md
4. **End of Sprint:** Update all files with new learnings

**What to Document:**
- ✅ patterns.md: Proven code patterns (70% reuse target)
- ✅ costs.md: Budget results, model choices
- ✅ troubleshooting.md: Known gotchas with solutions
- ✅ sprints.md: Velocity, capacity, metrics
- ✅ checklist.md: New quality rules discovered
- ❌ Session-specific context (temporary state)

---

## 🎓 TEAM CONVENTIONS

**This is a solo developer project.**

**Code Style:**
- PascalCase for components (ProfileScreen.tsx)
- camelCase for functions (loadPlants)
- UPPER_SNAKE_CASE for constants (ESTABLISHED_PLANTS)
- Descriptive variable names (no single letters except i,j,k in loops)

**Commit Messages:**
- Format: `{type}({area}): {description}`
- Types: feat, fix, docs, refactor, test, perf, chore
- Area: screen name, service name, or feature
- Example: `feat(auth): Add profile screen with logout`

**Documentation:**
- Components: JSDoc comments for complex logic
- Services: Document async functions with return types
- PRs: Reference sprint plan and story IDs

---

## 🚀 SPRINT WORKFLOW

**Week 1:** Feature Implementation
1. Kickoff with checklist verification
2. Implement core features (sequential)
3. Daily cost checks
4. Mid-sprint check-in (Day 5)

**Week 2:** Testing & Refinement
1. Write unit tests
2. Code review
3. Bug fixes
4. Documentation update

**End of Sprint:**
1. Final cost report (auto → costs.md)
2. Update memory files automatically:
   - New patterns → patterns.md (with examples)
   - New gotchas → troubleshooting.md (with solutions)
   - New metrics → sprints.md (velocity, capacity)
   - New quality rules → checklist.md
   - MEMORY.md index stays concise
3. Plan next sprint (load from sprints.md automatically)

---

## 📞 ESCALATION

**Cost exceeds warning threshold:**
→ Alert immediately, suggest scope reduction

**Cost exceeds hard limit:**
→ STOP work, request approval to continue

**Unclear requirements:**
→ Ask for clarification before starting

**Blocked on dependency:**
→ Notify immediately, don't proceed with workarounds

---

## 🎯 SUCCESS CRITERIA FOR SPRINT 6+

✅ **Delivery:**
- All stories implemented and approved
- 100% acceptance criteria met
- No regressions in existing features

✅ **Cost:**
- Stay under $10 budget
- Target: $0.50-1.00 (aggressive optimization)
- All 5 cost rules followed
- Cost report generated

✅ **Quality:**
- TypeScript strict mode clean
- 85%+ test coverage for services
- New patterns documented in patterns.md
- New gotchas documented in troubleshooting.md
- Metrics updated in sprints.md

✅ **Memory System:**
- Automatic insights captured (no manual updates needed)
- patterns.md updated with new patterns
- costs.md updated with sprint results
- troubleshooting.md updated with new gotchas
- sprints.md updated with metrics
- checklist.md updated with new quality rules

✅ **Process:**
- All pre-task checklists completed
- Daily cost monitoring conducted
- Memory system working automatically

---

## 📚 REFERENCE DOCUMENTS

**Essential Reading (before Sprint 6):**
- [ ] `docs/sprint-plan-gartenplaner-mvp-*.md` - Current sprint scope and details
- [ ] `COST-GUIDELINES.md` - Cost control checklist
- [ ] `/../docs/PORTKEY-QUICK-REFERENCE.md` - Quick model selection guide (in /aipm/docs/)

**Reference (use as needed):**
- `/../docs/COST-OPTIMIZATION.md` - Detailed strategy (in /aipm/docs/)
- `/../docs/PORTKEY-SETUP.md` - Complete setup guide (in /aipm/docs/)
- `/memory/MEMORY.md` - Reusable patterns from previous sprints (auto-loaded)
- `/memory/patterns.md` - Code patterns (auto-loaded)

---

## ✨ FINAL NOTE

**This project has proven:**
- 70% code reuse with Service Layer Pattern
- 100% delivery rate (all sprints completed on time)
- Excellent team velocity (10.8 pts/sprint average, sustainable)
- 97% cost savings in Sprint 5 ($0.33 vs $10 budget)

**With Specialized Memory System + Portkey + Cost Guidelines:**
- Automatic insight capture (no manual memory updates!)
- 80% cost reduction via Haiku + batching + sequential
- Maintain 85%+ test coverage + high quality
- Sustainable development pace

**New Memory System Benefits:**
- ✅ Automatic pattern reuse (70% target)
- ✅ Auto-captured gotchas (troubleshooting.md)
- ✅ Auto-tracked metrics (sprints.md)
- ✅ Auto-updated costs (costs.md)
- ✅ Auto-documented quality rules (checklist.md)
- **Zero manual memory management needed!**

**Your commitment to cost control + organized memory will enable:**
- More features per month
- Better dev experience (no budget stress, no memory burden)
- Long-term project sustainability

---

**Status:** ✅ Ready for Sprint 6 (with improved Memory System)

**Next Step:** I'll automatically load specialized memory files for every task. No action needed!

---

*CLAUDE.md v2.0*
*Cost-Aware Development Configuration*
*Gartenplaner Mobile App*
