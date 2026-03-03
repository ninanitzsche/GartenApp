# Claude Code Configuration - Gartenplaner App

**Last Updated:** 2026-03-03
**Project:** Gartenplaner Mobile App
**Team:** Solo Developer
**Framework:** React Native + Expo

---

## 🎯 PROJECT CONTEXT

**Current Status:** Sprint 4 Ready
- Completed: Sprint 1-3 (34 pts, all approved)
- Planned: Sprint 4 (10 pts)
- Tech Stack: React Native, Expo, Supabase, TypeScript

**Key Files:**
- `/docs/Sprint-4-Plan.md` - Current sprint details
- `/COST-GUIDELINES.md` - Cost control checklist (MANDATORY before work)
- `.portkey.json` - AI routing configuration (Haiku/Sonnet/Opus)

---

## 💰 COST MANAGEMENT (CRITICAL)

**Mode:** Active Cost Control
**Tool:** Portkey (70-80% cost reduction via intelligent routing)

### MANDATORY Pre-Task Checklist

**Before starting ANY work, verify ALL 5 items are GREEN:**

```
✅ Sequential: Nacheinander implementieren (nicht parallel)
✅ MEMORY.md: Patterns dokumentieren & reuse
✅ Specific: Klare, detaillierte Anforderungen
✅ Batch: Ähnliche Tasks zusammenfassen
✅ Monitor: Wöchentlich Cost-Report checken
```

**Process:**
1. I will show this checklist before starting work
2. Wait for your confirmation that all 5 are green
3. Only then begin with cost-optimized approach

**Related Files:**
- `COST-GUIDELINES.md` - Full enforcement protocol
- `docs/PORTKEY-SETUP.md` - Setup and usage guide
- `docs/COST-OPTIMIZATION.md` - Detailed strategy
- `scripts/track-costs.sh` - Daily cost monitoring

---

## 🚀 DEVELOPMENT APPROACH

### Model Selection (Portkey Routing)

| Task Type | Model | Use When | Cost |
|-----------|-------|----------|------|
| Feature Code (`/dev-story`) | Haiku 🟢 | Routine implementation | $0.30-0.50 |
| Code Review | Sonnet 🟡 | Quality checks | $1-2 |
| Architecture (`/sprint-planning`) | Opus 🔴 | Strategic only | $3-5 |
| Documentation | Haiku 🟢 | Guides, summaries | $0.25-0.50 |
| Testing | Haiku 🟢 | Unit tests | $0.30-0.50 |

### Task Execution Rules

**ALWAYS follow these rules (no exceptions):**

1. **Sequential Execution**
   - No parallel agents
   - Tasks execute one-at-a-time
   - Estimated savings: 80%

2. **MEMORY.md Reuse**
   - Check `/Users/ninanitzsche/.claude/projects/-Users-ninanitzsche-aipm/memory/MEMORY.md` first
   - Copy proven patterns before asking AI
   - Estimated savings: 50%

3. **Specific Prompts**
   - Include: Component names, file locations, acceptance criteria
   - Avoid: Vague requests like "create a screen"
   - Estimated savings: 40%

4. **Batch Similar Tasks**
   - Group 3 unit tests into 1 request (not 3 separate calls)
   - Combine related documentation files
   - Estimated savings: 30%

5. **Daily Cost Monitoring**
   - Run: `./scripts/track-costs.sh daily`
   - Budget: $10 for Sprint 4 (with $5 buffer)
   - Alert if spending exceeds $3/day

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

## 📁 PROJECT STRUCTURE

```
gartenplaner-app/
├── src/
│   ├── screens/          (11 screens)
│   ├── services/         (plantService, shoppingService, seedService)
│   ├── context/          (AuthContext, PlantContext)
│   ├── navigation/       (TabNavigator, StoreNavigator)
│   └── types/            (TypeScript interfaces)
├── docs/                 (documentation)
├── scripts/              (seed-garden.ts, track-costs.sh)
├── COST-GUIDELINES.md    (THIS CHECKLIST)
├── CLAUDE.md             (THIS FILE)
└── .portkey.json         (AI routing config)
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

## 🎯 SPRINT 4 GOALS

**Scope:** 4 stories, 10 pts, $4-6 budget

| Story | Points | Goal | Estimated Cost |
|-------|--------|------|-----------------|
| STORY-033b | 5 | Complete auth features | $1.50 |
| STORY-INF-001b | 2 | Database documentation | $0.75 |
| TESTING-P1 | 2 | Unit testing foundation | $0.80 |
| Code Review | - | Final quality check | $1.50 |
| **TOTAL** | **10** | **Delivery ready** | **$4.55** |

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
✅ docs/PORTKEY-SETUP.md (setup guide)
✅ docs/COST-OPTIMIZATION.md (strategy)
✅ docs/PORTKEY-QUICK-REFERENCE.md (cheat sheet)
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

## 📝 MEMORY MANAGEMENT

**Cross-Sprint Learning:**
- Location: `/Users/ninanitzsche/.claude/projects/-Users-ninanitzsche-aipm/memory/MEMORY.md`
- Updated: After every sprint
- Used: Before starting new work

**What to Document:**
- ✅ Proven patterns (search debouncing, service layer, etc.)
- ✅ Gotchas and solutions (RLS bugs, TypeScript tricks)
- ✅ Proven code locations (where to copy from)
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
1. Final cost report
2. Update MEMORY.md with learnings
3. Plan next sprint

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

## 🎯 SUCCESS CRITERIA FOR SPRINT 4

✅ **Delivery:**
- All 4 stories implemented and approved
- 100% acceptance criteria met
- No regressions in existing features

✅ **Cost:**
- Stay under $6 (target: $4.55)
- All 5 cost rules followed
- Cost report generated

✅ **Quality:**
- TypeScript strict mode clean
- 80%+ test coverage for services
- MEMORY.md updated with learnings

✅ **Process:**
- All pre-task checklists completed
- Daily cost monitoring conducted
- Weekly reports reviewed

---

## 📚 REFERENCE DOCUMENTS

**Essential Reading (before Sprint 4):**
- [ ] `docs/Sprint-4-Plan.md` - Sprint scope and details
- [ ] `COST-GUIDELINES.md` - Cost control checklist
- [ ] `docs/PORTKEY-QUICK-REFERENCE.md` - Quick model selection guide

**Reference (use as needed):**
- `docs/COST-OPTIMIZATION.md` - Detailed strategy
- `docs/PORTKEY-SETUP.md` - Complete setup guide
- `memory/MEMORY.md` - Reusable patterns from previous sprints
- `memory/sprint-3-memory.md` - Sprint 3 specific patterns

---

## ✨ FINAL NOTE

**This project has proven:**
- 70% code reuse with Service Layer Pattern
- 100% delivery rate (all sprints completed on time)
- Excellent team velocity (11.3 pts/sprint average)

**With Portkey + Cost Guidelines:**
- Expected 75-80% cost savings
- Maintain high quality and velocity
- Sustainable development pace

**Your commitment to cost control will enable:**
- More features per month
- Better dev experience (no budget stress)
- Long-term project sustainability

---

**Status:** ✅ Ready for Sprint 4

**Next Step:** Show me the completed Pre-Task Checklist and I'll verify all 5 items are green before beginning.

---

*CLAUDE.md v2.0*
*Cost-Aware Development Configuration*
*Gartenplaner Mobile App*
