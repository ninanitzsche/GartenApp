# Token Reference Guide - Cost Estimation

**Date:** 2026-03-05 | **Model:** Haiku (Default) | **Rate:** 1,000 tokens = €0.06

---

## 📊 TOKEN CONVERSION TABLE

| Item | Tokens | EUR | Example |
|------|--------|-----|---------|
| **1,000 tokens** | 1,000 | €0.06 | Small response |
| **5,000 tokens** | 5,000 | €0.30 | Medium task (implement feature) |
| **10,000 tokens** | 10,000 | €0.60 | Large task (complex feature) |
| **45,000 tokens** | 45,000 | €2.70 | Daily budget |
| **150,000 tokens** | 150,000 | €9.00 | Sprint budget |

---

## 🎯 TYPICAL TOKEN COSTS BY TASK

### Code Implementation Tasks

| Task | Tokens | EUR | Notes |
|------|--------|-----|-------|
| **Implement new service (CRUD)** | 3,000-5,000 | €0.18-0.30 | With pattern reuse |
| **Implement new screen** | 4,000-7,000 | €0.24-0.42 | With pattern matching |
| **Add feature to existing screen** | 2,000-4,000 | €0.12-0.24 | Minimal changes |
| **Fix bug** | 1,500-3,000 | €0.09-0.18 | Depends on complexity |
| **Refactor/improve code** | 2,500-5,000 | €0.15-0.30 | Within same file |
| **Add RLS policy** | 1,200-2,000 | €0.07-0.12 | Schema understanding |
| **Database schema change** | 2,000-3,500 | €0.12-0.21 | Planning + SQL |

### Testing Tasks

| Task | Tokens | EUR | Notes |
|------|--------|-----|-------|
| **Write 1 unit test** | 1,200-2,000 | €0.07-0.12 | With template |
| **Write 3 unit tests (batched)** | 2,400-3,500 | €0.14-0.21 | Not 3x separate! |
| **Write 5-10 unit tests** | 4,000-6,000 | €0.24-0.36 | Test suite |
| **Integration test** | 2,500-4,000 | €0.15-0.24 | Multi-part flow |
| **End-to-end test** | 3,500-5,500 | €0.21-0.33 | Full user flow |

### Documentation Tasks

| Task | Tokens | EUR | Notes |
|------|--------|-----|-------|
| **Write 1 small doc** | 1,500-2,500 | €0.09-0.15 | < 300 lines |
| **Write feature doc** | 2,500-4,000 | €0.15-0.24 | With examples |
| **Update existing doc** | 800-1,500 | €0.05-0.09 | Modifications |
| **Create checklist** | 1,200-2,000 | €0.07-0.12 | Like REQUIREMENT template |

### Analysis & Planning Tasks

| Task | Tokens | EUR | Notes |
|------|--------|-----|-------|
| **Code review (small)** | 2,000-3,500 | €0.12-0.21 | < 200 lines |
| **Code review (large)** | 4,000-6,000 | €0.24-0.36 | 200+ lines |
| **Architecture planning** | 5,000-8,000 | €0.30-0.48 | Complex decisions |
| **Debugging session** | 3,000-6,000 | €0.18-0.36 | Error diagnosis |
| **Performance analysis** | 4,000-7,000 | €0.24-0.42 | Optimization |

---

## 💡 COST OPTIMIZATION IMPACT

### Pattern Reuse Savings

| Situation | Without Reuse | With Reuse | Tokens Saved |
|-----------|---------------|-----------|--------------|
| New CRUD service | 6,000 | 3,000 | **3,000** (€0.18) |
| New screen | 7,500 | 4,000 | **3,500** (€0.21) |
| Unit tests (3) | 6,000 | 2,400 | **3,600** (€0.22) |
| RLS policy | 3,000 | 1,200 | **1,800** (€0.11) |
| Bug fix | 4,500 | 1,500 | **3,000** (€0.18) |
| **Per sprint impact** | **~27,000** | **~12,000** | **~15,000 saved!** |

**Sprint 5 Example:**
```
Without optimization: 27,000 tokens (€1.62)
With optimization: 5,500 tokens (€0.33)
Saved: 21,500 tokens (€1.29) = 80% reduction!
```

---

## ⚠️ EXPENSIVE MISTAKES (High Token Cost)

| Mistake | Tokens | EUR | Prevention |
|---------|--------|-----|-----------|
| **Vision analysis (50 screenshots)** | 45,000 | €2.70 | Use sample 5 + Bash |
| **Sonnet for routine code** | +8,000 | +€0.48 | Use Haiku default |
| **3 separate calls for 3 tests** | +3,600 | +€0.22 | Batch requests |
| **Retry due to vague requirements** | +5,000 | +€0.30 | Use requirement template |
| **Parallel agents** | +25,000 | +€1.50 | Sequential only |
| **Re-explaining same pattern 3x** | +4,500 | +€0.27 | Check MEMORY.md first |

---

## 🎯 DAILY/WEEKLY BUDGETS (Tokens)

| Period | Budget Tokens | Budget EUR | Daily Pace |
|--------|---------------|-----------|-----------|
| **Daily** | 45,000 | €2.70 | ~7-10 typical tasks |
| **Weekly** | 225,000 | €13.50 | ~30-50 typical tasks |
| **Sprint (2 weeks)** | 150,000* | €9.00 | Sequential approach |
| **Monthly** | 300,000 | €18.00 | 2 sprints |

*Note: Sprint budget is 150,000 tokens with sequential execution. Running 2 sprints in parallel would use ~300,000 tokens.*

---

## 📊 SPRINT PLANNING BY TOKENS

### Small Sprint (4 tasks)
```
Budget: 150,000 tokens
Expected usage per task: 2,000-4,000 tokens
Total: 8,000-16,000 tokens
Remaining buffer: 134,000-142,000 tokens
Savings: 89-95% under budget
```

### Medium Sprint (6 tasks)
```
Budget: 150,000 tokens
Expected usage per task: 1,500-3,000 tokens
Total: 9,000-18,000 tokens
Remaining buffer: 132,000-141,000 tokens
Savings: 88-94% under budget
```

### Large Sprint (8 tasks)
```
Budget: 150,000 tokens
Expected usage per task: 1,200-2,500 tokens
Total: 9,600-20,000 tokens
Remaining buffer: 130,000-140,400 tokens
Savings: 87-93% under budget
```

---

## 🔄 HOW TOKEN COSTS ADD UP

### Example: Photo Upload Feature (STORY-055)

```
Pre-sprint:
  - Requirement gathering: 0 tokens (YOUR time, not AI)

Implementation:
  - Validate requirements: 1,200 tokens
  - Design service: 2,000 tokens
  - Implement service: 3,500 tokens
  - Write tests: 2,400 tokens
  - Fix RLS policy: 1,200 tokens
  - Total: 10,300 tokens (€0.62)

With pattern reuse:
  - Copy from plantService: -1,500 tokens
  - Use Jest template: -800 tokens
  - Use RLS docs: -300 tokens
  - Total cost: 7,700 tokens (€0.46)

Savings: 2,600 tokens (€0.16) = 25% cheaper!
```

---

## 💾 TOKEN LIMITS & ALERTS

### Automatic Alerts I'll Give

```
✅ Green: < 50,000 tokens used (< €3.00)
⚠️  Yellow: 50,000-100,000 tokens (€3.00-6.00)
🔴 Red: > 100,000 tokens (> €6.00)

If RED during sprint:
"⚠️ Alert: Sprint token usage at [X] tokens.
   Recommend reducing scope or optimizing approach."
```

---

## 🎓 COST TRACKING COMMANDS

```bash
# Track daily cost
./scripts/track-costs.sh daily

# Track weekly
./scripts/track-costs.sh weekly

# Track sprint total
./scripts/track-costs.sh sprint
```

Each command shows:
- Tokens used
- EUR equivalent
- Budget remaining
- Pace vs target

---

## 📈 HISTORICAL TOKEN COSTS

**Sprint 4:** 6,500 tokens (€0.39)
**Sprint 5:** 5,500 tokens (€0.33)
**Sprint 6 (projected):** 1,300-2,300 tokens (€0.08-0.15)

**Trend:** ↓ Decreasing (better optimization each sprint!)

---

## ✨ TOKEN BUDGET SUMMARY

- **Daily:** 45,000 tokens = €2.70
- **Weekly:** 225,000 tokens = €13.50
- **Sprint:** 150,000 tokens = €9.00
- **Monthly:** 300,000 tokens = €18.00

**Conversion:** 1,000 tokens = €0.06 (Haiku rate)

**Target:** Use < 10,000 tokens per sprint via requirement gathering + pattern reuse!

---

*Token Reference Guide v1.0*
*Accurate as of 2026-03-05*
*Haiku model rates*
