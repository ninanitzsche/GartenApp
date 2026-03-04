# 🚀 New Developer Onboarding Guide

**Last Updated:** 2026-03-04
**Status:** Active
**Audience:** New Developers
**Related Files:** [README.md](README.md), [QUICK-LINKS.md](QUICK-LINKS.md), [MEMORY.md](MEMORY.md)

**Time to Complete:** 1 hour | **Time to First Task:** 1 sprint

---

## 📋 Step-by-Step Onboarding (Do in Order)

### Step 1: Project Overview (5 min)
📄 **Read:** `README.md`

**What you'll learn:**
- What Gartenplaner is
- Tech stack (React Native + Expo + Supabase)
- Project status

**Check:** You understand: "This is a gardening app for mobile + web"

---

### Step 2: Development Rules (5 min)
📄 **Read:** `CLAUDE.md`

**What you'll learn:**
- How we use Claude Code
- Cost management rules
- Which models to use for what
- Code quality standards

**Check:** You understand: "Sequential development, Haiku for code, check MEMORY first"

---

### Step 3: Quick Navigation (2 min)
📄 **Read:** `QUICK-LINKS.md`

**What you'll learn:**
- Where to find things when you need them
- How to navigate the docs

**Check:** You can answer: "Where do I find bug solutions?" → bugs-and-gotchas.md

---

### Step 4: Code Patterns (10 min)
📄 **Read:** `MEMORY.md` (auto-loaded, first 200 lines)

**What you'll learn:**
- Service Layer Pattern (copy from plantService.ts)
- Authentication flow
- Cost management
- Common patterns we reuse

**Check:** You understand: "When adding a new entity, copy the Service pattern"

---

### Step 5: Architecture Overview (15 min)
📄 **Read:** `docs/bmad/bmad-03-architecture.md`

**What you'll learn:**
- How components fit together
- Database schema
- Auth flow
- File structure

**Also helpful:** Read `docs/database/database-guide.md` for detailed schema info

---

### Step 6: Your First Task
🎯 **When:** After steps 1-5 complete

**Option A: Add a Feature**
1. Read: `docs/LEARNINGS/feature-implementation-learnings.md`
   - See how long similar features took
   - Understand the gotchas

2. Read: `MEMORY.md` (auto-loaded)
   - Check proven patterns
   - Check gotchas & solutions

3. Implement using `/dev-story` skill
   - See: `QUICK-LINKS.md` → "Build a feature"

**Option B: Fix a Bug**
1. Find bug in: `docs/LEARNINGS/bugs-and-gotchas.md`
   - (90% of bugs are already documented!)

2. Read the solution

3. Implement the fix

4. Add to bugs-and-gotchas.md if new

---

## 🗺️ Document Map

**When you're doing different things, go here:**

| I want to... | File | Time |
|--------------|------|------|
| Understand the project | README.md | 5 min |
| Know the rules | CLAUDE.md | 5 min |
| Find something quick | QUICK-LINKS.md | 2 min |
| Learn code patterns | MEMORY.md | 10 min |
| Build a new feature | docs/LEARNINGS/feature-implementation-learnings.md | 10 min |
| Fix a bug | docs/LEARNINGS/bugs-and-gotchas.md | Find solution |
| See how things work | docs/guides/ | 15-30 min |
| Run tests | docs/testing/TESTING-GUIDE.md | 5 min |
| Check cost rules | COST-GUIDELINES.md | 5 min |
| Find feature docs | docs/stories/ or docs/features/ | varies |
| See database schema | docs/database/database-guide.md | 10 min |

---

## 💡 Key Concepts to Know

### 1. Sequential Development
- We work tasks one-at-a-time, not parallel
- This saves 70% cost vs parallel agents
- **What this means:** Focus on one task, finish it, move to next

### 2. Service Layer Pattern
- All data access goes through a Service (plantService, shoppingService, etc.)
- Copy the pattern from existing services
- Makes code reusable and testable

### 3. MEMORY First
- Before asking Claude how to do something
- Check MEMORY.md for the pattern
- Saves time and money

### 4. Testing Strategy
- We test critical paths (Auth, CRUD)
- We target 70% coverage, not 100%
- TypeScript + strict mode catches most bugs

### 5. Platform Differences
- Always test on Native + Web
- Many issues are Web-specific (image handling, navigation)
- Check bugs-and-gotchas.md for Web issues

---

## ✅ Onboarding Checklist

Before your first code:

- [ ] Read README.md
- [ ] Read CLAUDE.md
- [ ] Read QUICK-LINKS.md
- [ ] Read MEMORY.md (first 200 lines)
- [ ] Skim architecture (guides/ folder)
- [ ] Claim your first task
- [ ] Read relevant learning docs for that task
- [ ] Ask questions in comments!

---

## 🚀 Your First Week

### Day 1 (Monday)
- Complete steps 1-6 above (total: ~1 hour)
- Claim a small task (2-3 points)

### Day 2-3 (Tuesday-Wednesday)
- Start implementation
- Build on native first, test on Web by end of day
- Check MEMORY.md + bugs-and-gotchas.md often

### Day 4-5 (Thursday-Friday)
- Finish implementation
- Write tests (70% coverage target)
- Create PR
- Get code review

### Sprint Review (Friday)
- Demo your feature
- Learn from feedback

---

## ❓ Common Questions

### "I don't understand how RLS policies work"
→ Read: `docs/database/database-guide.md` + `docs/LEARNINGS/bugs-and-gotchas.md` (RLS section)

### "Photo upload is failing on Web"
→ Read: `docs/LEARNINGS/bugs-and-gotchas.md` → Photo Upload/Image Handling

### "How long should this feature take?"
→ Read: `docs/LEARNINGS/feature-implementation-learnings.md` → find similar feature

### "What's the Service Layer pattern?"
→ Read: `MEMORY.md` → Proven Patterns → Service Layer Pattern

### "Can I use model X?"
→ Read: `CLAUDE.md` → Model Selection or `MEMORY.md` → Cost Management

### "I broke something on Web but Native works"
→ Search: `docs/LEARNINGS/bugs-and-gotchas.md` for the platform issue

---

## 🆘 Getting Help

1. **Check MEMORY.md first** - pattern you need is probably there
2. **Check bugs-and-gotchas.md** - bug is probably already solved
3. **Check related learning docs** - feature implementation has timing info
4. **Ask in code comments** - team will help
5. **Read error messages carefully** - often points to the issue

---

## 📊 Learning Velocity

- **Day 1:** Onboarding takes ~1 hour
- **Day 2-3:** First task is 2-3 days (slower because learning)
- **Day 4+:** Tasks get faster (you know patterns now)
- **Week 2:** Productivity = team baseline (10.8 pts/2 weeks solo)

Don't worry if slow at first - that's normal!

---

## 🎯 Success Criteria for Onboarding

By end of Week 1, you should:
- ✅ Understand the tech stack
- ✅ Know where to find documentation
- ✅ Know the Service Layer pattern
- ✅ Have submitted 1 feature
- ✅ Know how to test on Native + Web
- ✅ Know where to check for solutions (MEMORY + learning docs)

---

**Next:** Pick your first task from the sprint and read the relevant learning docs!

📚 **Everything you need to know is in the docs** - we invested in good documentation so you don't waste time guessing.

Good luck! 🌱
