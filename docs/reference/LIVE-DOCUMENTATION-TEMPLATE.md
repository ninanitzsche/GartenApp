# Live Documentation - Während du codest
**Dokumentation WÄHREND entwicklung, nicht nachher!**

---

## 🎯 Idee: Doc-Skeleton vor Code

```
NORMAL:  Code schreiben → Dann dokumentieren (meist vergessen!)
BESSER:  Doc-Skeleton → Code schreiben (parallel!) → Fertig!
```

**Benefit:** Am Code-Ende ist Dokumentation schon 80% fertig!

---

## 📝 TEMPLATE: Feature Documentation

**Erstelle DIESEN File VOR dem Coding:**
```
File: src/services/__docs__/featureName.md
oder: In Code als großer Comment Block
```

### Struktur (Copy-Paste)

```markdown
# Feature: [Feature Name]

## 📖 Overview
**Purpose:** [Warum existiert diese Funktion?]
**Owner:** [Wer hat das gebaut?]
**Last Updated:** [Date]

### User Story
> As a [user], I want [action], so that [benefit]

### Acceptance Criteria
- [ ] AC1: [Spezifisch, testbar]
- [ ] AC2: [Spezifisch, testbar]
- [ ] AC3: [Spezifisch, testbar]

---

## 🏗️ Architecture

### Data Flow
```
[User Action]
    ↓
[Screen Component]
    ↓
[Service Function]
    ↓
[Supabase API]
    ↓
[Database]
    ↓
[Response]
    ↓
[UI Update]
```

### Database Schema
```
Table: [table_name]
├── id (uuid, pk)
├── user_id (uuid, fk → users)
├── [column] ([type])
└── created_at (timestamp)

Junction: [table_name]_[relation]
├── [id1] (uuid, fk)
└── [id2] (uuid, fk)
```

### RLS Policies
```
SELECT: auth.uid() = user_id
  → User kann nur eigene Daten sehen

INSERT: auth.uid() = user_id
  → Nur authentifizierte User können einfügen

DELETE: auth.uid() = user_id + cascade junction
  → User kann nur eigene löschen
```

---

## 💻 Implementation Details

### Service Functions

#### Function: `functionName()`
**What:** [Was tut die Funktion?]
**Input:**
- `param1: Type` - [Beschreibung]
- `param2: Type` - [Beschreibung]

**Output:**
- Returns: `ReturnType` - [Was wird zurückgegeben?]
- Throws: `ErrorType` - [Was wenn Fehler?]

**Example:**
```typescript
const result = await functionName('input1', 'input2');
console.log(result); // → { id: '...', created_at: '2026-03-03' }
```

**Implementation Notes:**
- [Besonderheit 1]
- [Besonderheit 2]
- [Junction-Table handling?]
- [Storage file handling?]

---

## 🚨 Gotchas & Warnings

### ⚠️ CRITICAL: [Issue Name]
**Problem:** [Was kann schiefgehen?]
**Symptom:** [Wie merkst du es?]
**Solution:** [Was musst du machen?]
**Code Example:**
```typescript
// ❌ FALSCH
await uploadPhoto(fileUri); // file:// URI on web!

// ✅ RICHTIG
const blob = await fetch(fileUri).then(r => r.blob());
const uint8Array = new Uint8Array(await blob.arrayBuffer());
await uploadPhoto(uint8Array);
```

### ⚠️ Web vs Native
- [Web difference 1]
- [Web difference 2]
- [Native difference 1]

**Testing:** [Wie testest du auf beiden?]

---

## 🧪 Testing

### Unit Tests
**Location:** `src/services/__tests__/serviceName.test.ts`

**Test Cases:**
- [ ] Happy Path: [Normal success scenario]
- [ ] Error Case: [Error scenario]
- [ ] Edge Case: [Boundary condition]
- [ ] Web Compatibility: [Web-specific case]

**Coverage Target:** >80%

### Integration Tests
**Location:** `src/services/__tests__/serviceName.integration.test.ts`

**Test Cases:**
- [ ] Junction-table cascade deletes
- [ ] Storage file cleanup
- [ ] RLS policy enforcement
- [ ] Real Supabase connection

---

## 🔄 Common Workflows

### Workflow: [Workflow Name]
**Trigger:** [Was triggert diesen Workflow?]
**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:** [Was sollte happen?]

**Example:**
```typescript
// User hochlädt Foto
const photoUrl = await uploadPhoto(plantId, fileUri);
// → Photo in DB
// → Photo in Storage
// → Photo-Plant Link in Junction
// → Öffentliche URL zurückgegeben
```

---

## 🐛 Debugging Guide

### Problem: [Error Scenario]
**Error Message:**
```
Could not find the 'plant_id' column of 'photos'
```

**Root Cause:** [Was ist die Ursache?]

**Debug Steps:**
1. [Check 1]
2. [Check 2]
3. [Solution]

**Prevention:** [Wie vermeidest du das nächste Mal?]

---

## 📚 Related Documentation

- [Link to architectural decision]
- [Link to other related feature]
- [Link to external resource]

---

## 🚀 Deployment Notes

### Prerequisites
- [ ] All tests passing
- [ ] Coverage > 80%
- [ ] Web-tested
- [ ] Mobile-tested
- [ ] MEMORY.md updated

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check performance
- [ ] Verify RLS policies work

---

## 📊 Metrics

**Lines of Code:** ~[number]
**Test Cases:** [number]
**Estimated Complexity:** Low / Medium / High
**Risk Level:** Low / Medium / High

---

## 🎓 Lessons Learned

**What went well:**
- [Learning 1]

**What was tricky:**
- [Gotcha 1]

**Next time:**
- [Improvement 1]

---

**Last Update:** [Date] by [Your Name]
**Status:** ✅ Complete / 🚧 In Progress / ❌ On Hold
```

---

## 🔄 HOW TO USE: During Coding

### Minute 0: Create Skeleton
```
Before writing ANY code:
- [ ] Create file: src/services/__docs__/feature.md
- [ ] Copy template above
- [ ] Fill in: Overview, Architecture, Data Flow
- [ ] Stop - don't write code yet!
```

### Minute 10: Start Coding
```
Now write code, BUT:
- Every function you write: update the doc!
- Every gotcha you discover: add to ⚠️ section!
- Every edge case: update Testing section!
```

### Minute 90: Last 15 Minutes
```
Code is done, but doc is ALMOST done!
- Final check: All functions documented?
- Final check: All gotchas added?
- Final check: Example code correct?
→ Dokumentation fertig, nicht nachher schreiben!
```

---

## 📋 CHECKLIST: Doc ist fertig?

- [ ] Overview & User Story definiert?
- [ ] Architecture Diagram gemacht?
- [ ] Alle Funktionen dokumentiert?
- [ ] Alle Parameters & Return Types?
- [ ] ⚠️ Gotchas identifiziert?
- [ ] Web vs Native Unterschiede dokumentiert?
- [ ] Test Cases aufgelistet?
- [ ] Debugging Guide mit Lösungen?
- [ ] Lessons Learned?

---

## 🎯 SPRINT 6 Example: KI-Integration

**BEFORE CODE:** Create skeleton

```markdown
# Feature: Claude Vision Analysis

## Overview
Purpose: Analyze uploaded photos with Claude AI to identify plants/issues
User Story: As a gardener, I want to upload a photo and get AI analysis, so that I know what's wrong with my plants

## Architecture
Photo Upload
  ↓
Claude Vision API Call (claude-vision)
  ↓
Analysis Result (JSON)
  ↓
Save to photos.ai_analysis
  ↓
Auto-create task if issue detected

## Service Functions
- [ ] analyzePhotoWithClaude(imageUri): Promise<Analysis>
- [ ] saveAnalysisToPhoto(photoId, analysis): Promise<void>
- [ ] createTaskFromAnalysis(analysis, plantId): Promise<Task>

## Gotchas
- [ ] Web: Can't send file:// URIs to API
- [ ] Rate Limiting: Claude API has limits
- [ ] Streaming: Response might be streamed

## Testing
- [ ] Mock Claude API response
- [ ] Test analysis parsing
- [ ] Test task creation
- [ ] Web compatibility
```

**DURING CODE:** Update as you go

```
09:00 - Schreib analyzePhotoWithClaude()
        → Update: Implementation Details section
        → Update: Example code

09:30 - Finde Gotcha: "Need to convert blob to base64!"
        → Update: ⚠️ Gotchas section

10:00 - Tests schreiben
        → Update: Testing section

10:30 - Debugging first error
        → Update: Debugging Guide section
```

**AFTER CODE:** Doc ist schon 95% fertig!

```
11:00 - Code fertig
        - Final doc check: 5 min
        - Done!
```

---

## 💡 BENEFIT

**Old Way:**
```
Code 100 min → Document 30 min
= 130 min, doc often incomplete
```

**New Way:**
```
Doc skeleton 10 min → Code 100 min (+ update doc)
= 110 min, doc always complete!

SAVES: 20 minutes + better documentation!
```

---

## 📚 MEMORY.md Integration

**During coding, if you discover:**
- [ ] New pattern → Add to MEMORY.md right away
- [ ] Gotcha → Add to MEMORY.md
- [ ] Best practice → Document it

**Example:**
```
WHILE CODING:
"Oh, I need blob:// URI handling again!"
→ Update MEMORY.md: "Blob Conversion Pattern"
→ Future sprints use this pattern automatically
```

---

**USE THIS TEMPLATE FOR EVERY FEATURE!**

**Expected Time:** Skeleton (10 min) + During Code (5 min updates) + Final (5 min check) = 20 min total
**Result:** Professional documentation that's always up-to-date!
