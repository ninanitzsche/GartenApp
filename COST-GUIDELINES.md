# Cost Management Guidelines - Gartenplaner App

**Status:** Active Cost Control Mode
**Purpose:** Enforce low-cost practices before starting any sprint/task
**Created:** 2026-03-03

---

## ⚙️ Mandatory Pre-Task Checklist

Before **ANY** `/dev-story`, `/sprint-planning`, or multi-task work, verify:

### ✅ Checklist Items (ALL must be green)

- [ ] **Sequential**: Plan to work on tasks one-at-a-time (not parallel agents)
- [ ] **MEMORY.md**: Check memory for reusable patterns (avoid re-asking)
- [ ] **Specific**: Task requirements are clear and detailed (no vague prompts)
- [ ] **Batch**: Similar tasks grouped together (combine tests, docs, etc.)
- [ ] **Monitor**: Cost tracking enabled and dashboard bookmarked

---

## 📋 Detailed Pre-Task Protocol

### 1. Sequential Check ✅

**Before starting:**
```
Q: Are there multiple tasks to complete this session?
  ✅ YES → Will do them sequentially, one at a time
  ✅ NO → Single task, no parallelization needed

Q: Are you planning to use parallel agents?
  ❌ NO (This violates cost guidelines)
  ✅ YES → Only if absolutely unavoidable + pre-approved
```

**Action:** Commit to sequential task execution

---

### 2. MEMORY.md Check ✅

**Before starting:**
```
Q: Does this project have memory/MEMORY.md?
  ✅ YES → Read it for patterns and gotchas
  ✅ NO → This is first sprint, will create after

Q: Have I checked MEMORY.md for similar implementations?
  ✅ YES → Found pattern at [location], will reuse
  ✅ MAYBE → Don't see it, will ask Claude to check

Q: Did I update MEMORY.md with learnings from last sprint?
  ✅ YES → Fresh patterns documented
  ⚠️ TODO → Will do after this sprint
```

**Action:** Read memory, identify reusable patterns, skip AI calls where possible

---

### 3. Specific Requirements Check ✅

**Before starting each task:**
```
Q: Are requirements clear and specific?
  ✅ YES → Has component names, file locations, acceptance criteria
  ❌ VAGUE → "Create a screen" (needs expansion)

Examples of SPECIFIC:
- "Create ProfileScreen.tsx with name/email/logout, 50 lines"
- "Add RLS policy to plants table: auth.uid() == user_id"
- "Write 3 unit tests for plantService.fetchPlants()"

Examples of VAGUE:
- "Create authentication"
- "Fix bugs"
- "Improve code quality"
```

**Action:** Expand vague requirements before asking AI

---

### 4. Batch Tasks Check ✅

**Before starting documentation/testing:**
```
Q: Can similar tasks be batched?
  ✅ YES (example):
     - 3 unit tests → Batch as one /dev-story request
     - 3 doc files → Batch as one /dev-story request
     - Savings: 50-60%

  ❌ NO → Tasks are unrelated, sequential is better

Q: What's the batch strategy for this sprint?
  ✅ Example:
     - Task 1: Profile + Password screens (batch)
     - Task 2: All unit tests (batch)
     - Task 3: All documentation (batch)
```

**Action:** Group similar work together

---

### 5. Cost Monitoring Check ✅

**Before starting:**
```
Q: Is cost tracking script ready?
  ✅ YES → scripts/track-costs.sh exists and tested

Q: Will you check costs daily during sprint?
  ✅ YES → Commitment to run: ./scripts/track-costs.sh daily

Q: Dashboard bookmarked?
  ✅ YES → Can quickly check: https://app.portkey.ai/dashboard

Q: Budget set?
  ✅ YES → $10 for Sprint 4 (with $5 buffer)
```

**Action:** Enable monitoring and commit to weekly review

---

## 🎯 Pre-Sprint Kickoff Template

**Use this format before starting any sprint:**

```markdown
## Sprint 4 Pre-Task Checklist

**Date:** 2026-03-03
**Tasks:** STORY-033b, STORY-INF-001b, TESTING-P1

### ✅ Checklist Status

✅ Sequential
- [ ] Will execute STORY-033b → STORY-INF-001b → TESTING-P1 (one after another)
- [ ] No parallel agents planned
- [ ] Estimated time: 3 separate /dev-story calls

✅ MEMORY.md
- [ ] Read memory at: /Users/ninanitzsche/.claude/projects/-Users-ninanitzsche-aipm/memory/MEMORY.md
- [ ] Found patterns: Search debouncing (300ms), Service Layer pattern
- [ ] Reuse strategy: Copy from PlantListScreen.tsx and shoppingService.ts

✅ Specific
- [ ] STORY-033b requirements: Clear (ProfileScreen, ChangePassword, ForgotPassword)
- [ ] STORY-INF-001b requirements: Clear (SQL schema + RLS docs + DB guide)
- [ ] TESTING-P1 requirements: Clear (Jest setup + 20+ tests + 80% coverage)

✅ Batch
- [ ] Group 1: ProfileScreen + ChangePasswordScreen + ForgotPasswordScreen (one task)
- [ ] Group 2: All 3 documentation files (one task)
- [ ] Group 3: Jest setup + all unit tests (one task)
- [ ] Estimated batches: 4 /dev-story calls

✅ Monitor
- [ ] ./scripts/track-costs.sh ready ✓
- [ ] Budget: $10 with $5 buffer
- [ ] Daily check commitment: YES
- [ ] Dashboard bookmarked: https://app.portkey.ai/dashboard

### Summary
✅ **ALL ITEMS GREEN** - Ready to start Sprint 4

**Expected Cost:** $4-6 (vs $20+ without optimization)
**Estimated Time:** 8-10 hours
**Start Date:** Ready when you say go!
```

---

## 🚦 Decision Tree: Should I Start This Task?

```
START
  ↓
Is the checklist 100% complete?
  ❌ NO → Complete checklist first
  ✅ YES → Continue
  ↓
Are all 5 items GREEN?
  ❌ NO → Fix items one by one
  ✅ YES → Continue
  ↓
Am I ready to commit to sequential execution?
  ❌ NO → Wait until ready
  ✅ YES → Continue
  ↓
→ START WORK (cost-optimized mode active)
```

---

## 📊 Expected Cost by Status

| Checklist Status | Sprint Cost | Reason |
|------------------|------------|--------|
| ✅ All Green | $4-6 | Optimized routing + sequential + memory reuse |
| ⚠️ 80% Complete | $8-10 | Might miss some optimizations |
| ❌ < 50% Complete | $15-25 | Likely parallel + expensive models + retries |

---

## 🔄 Weekly Review Protocol

**Every Friday (Sprint Review):**

```bash
# 1. Check cost dashboard
./scripts/track-costs.sh weekly

# 2. Review checklist compliance
# - Did we stay sequential? ✅
# - Did we use MEMORY.md? ✅
# - Were prompts specific? ✅
# - Did we batch well? ✅
# - Did we monitor costs? ✅

# 3. Update MEMORY.md with learnings
cat >> memory/MEMORY.md <<EOF
## Sprint 4 Learnings

### Patterns Used
- Search debouncing from memory (saved $0.30)
- Service layer pattern (saved $1.50 code reuse)

### What Worked
- Batching all tests (saved $0.50)
- Specific prompts (no retries needed)

### Next Time
- [Improvements for Sprint 5]
EOF

# 4. Celebrate savings! 🎉
echo "Sprint 4 Total Cost: $4.55 (Target: < $10)"
```

---

## ✅ Enforcement Rules

**Before I start ANY work**, you will see this message:

```
🚨 COST-OPTIMIZATION CHECKPOINT 🚨

Before proceeding, verify:

✅ Sequential: Working one task at a time (not parallel)
✅ MEMORY.md: Checked for reusable patterns
✅ Specific: Requirements are clear and detailed
✅ Batch: Similar tasks grouped together
✅ Monitor: Cost tracking script ready

Are all 5 items GREEN?

YES → I'll start work (cost-optimized)
NO → I'll wait for you to confirm completion

Current Status: [Green/Yellow/Red]
```

---

## 🎯 Golden Rules (Permanent)

1. **No parallel agents** (sequential only)
2. **Memory first** (avoid re-asking for patterns)
3. **Specific prompts** (clear requirements → fewer retries)
4. **Batch wisely** (group similar tasks)
5. **Monitor always** (daily cost check)

---

## 📞 Escalation Path

If something threatens cost control:

1. **Yellow Flag** (costs approaching limit)
   - Alert user immediately
   - Suggest scope reduction
   - Check if model selection is correct

2. **Red Flag** (budget exceeded)
   - STOP work
   - Request user approval to continue
   - Review what went wrong
   - Adjust strategy for remaining sprint

---

## 📝 Template for Each Sprint Start

Copy and paste this into your sprint kickoff:

```
# Sprint [N] Cost-Optimization Checklist

## Pre-Task Verification

✅ Sequential: [YES/NO] - Will work sequentially
✅ MEMORY.md: [YES/NO] - Checked patterns at [location]
✅ Specific: [YES/NO] - Requirements documented
✅ Batch: [YES/NO] - Batching strategy: [description]
✅ Monitor: [YES/NO] - Cost script ready, budget=$[amount]

## Ready to Begin?

[ ] All 5 items confirmed
[ ] Team agrees on approach
[ ] MEMORY.md updated from last sprint

**START WORK?** [YES/NO]
```

---

## 🔍 Audit Trail

Every sprint, this summary will be created:

```
## Sprint 4 Cost Audit

Date: 2026-03-03 to 2026-03-17
Checklist Compliance: 100% ✅

### By Metric
- Sequential Execution: 100% (4 tasks, all sequential)
- MEMORY.md Reuse: 75% (3 patterns used, 1 new)
- Prompt Specificity: 95% (only 1 retry across sprint)
- Task Batching: 85% (3 batches, could have done 1 more)
- Cost Monitoring: 100% (checked daily)

### Financial Result
- Budget: $10.00
- Spent: $4.55
- Savings: $5.45 (54%)
- ROI: 120% (spent less than half)

### Compliance: ✅ EXCELLENT
```

---

**This document is now your Cost Control Framework.**

Before starting Sprint 4, show me the completed checklist and I'll verify all 5 items are green before beginning any work.

---

*Cost Management Guidelines v1.0*
*Gartenplaner Mobile App*
*Enforcement: Active*
