# Superpowers: Subagent-Driven Development

**Role:** Execute implementation plans using parallel subagents for maximum efficiency

## Overview

Superpowers is a project-specific workflow that:
1. Reads implementation plans with checkbox syntax (`- [ ]`)
2. Identifies uncompleted tasks
3. Executes tasks in parallel using subagents
4. Updates plan status automatically
5. Commits with plan reference

## Workflow

### Step 1: Identify Current Phase

Read the plan file and identify which phase/tasks are unchecked:
```
grep -n "\- \[ \]" docs/superpowers/plans/*.md
```

### Step 2: Determine Parallelization

Tasks that can run in parallel:
- Different files (no shared dependencies)
- Independent components
- Separate features

Tasks that must run sequentially:
- Tasks that modify the same file
- Tasks with dependencies

### Step 3: Launch Parallel Subagents

For each independent task, launch a subagent:

```
Task: Execute Task N from plan
Context: Read plan at line XX
Objective: Implement the task as described
Output: Files created/modified, commit message

Deliverables:
1. Create/modify files as specified
2. Run build verification (npx expo export --platform ios)
3. Commit with descriptive message referencing task number
4. Update todo list
```

### Step 4: Sequential Tasks

For dependent tasks:
1. Wait for dependencies to complete
2. Read the file that was modified
3. Extend/modify as required
4. Verify build
5. Commit

### Step 5: Update Plan Status

After each task completion:
1. Read the plan file
2. Find the unchecked task: `- [ ]`
3. Update to checked: `- [x]`
4. Add completion note with commit hash

## Task Execution Pattern

### Independent Tasks (Parallel)

| Task | Agent | Files | Status |
|------|-------|-------|--------|
| Task N | Agent 1 | src/components/X.tsx | Running |
| Task M | Agent 2 | src/components/Y.tsx | Running |

### Dependent Tasks (Sequential)

| Task | Depends On | Status |
|------|------------|--------|
| Task X | Task A, B | Waiting |
| Task Y | Task X | Waiting |

## Quality Checks

After each task:
1. Build verification: `npx expo export --platform ios`
2. TypeScript check: `npx tsc --noEmit`
3. Update plan document

## Example

```
User: Execute Phase 5 using Superpowers

1. Read plan → Tasks 13-14 unchecked
2. Tasks are independent (different files)
3. Launch 2 parallel agents:
   - Agent 1: Task 13 (SegmentedControl)
   - Agent 2: Task 14 (PlantListScreen integration)
4. Both complete → Verify build
5. Update plan with checkmarks
```

## Integration with GSD

Superpowers can use GSD subagents when available:
- `/gsd-plan-phase` → Create detailed task breakdown
- `/gsd-execute` → Execute with GSD protocols
- `/gsd-verify` → Validate implementation

When GSD is not available, use `general` agent type for subagent execution.

## Notes

- Always verify build after each task
- Commit frequently with task references
- Update plan status after each completion
- Report progress to user after each phase
