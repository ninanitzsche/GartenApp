# 🔄 BMAD Checklist Maintenance Process

**Wie BMAD Checklisten immer aktuell bleiben**
**Datum:** 2026-03-04
**Prozess:** Automatische Aktualisierung nach jedem Sprint

---

## 🎯 Purpose

Dieses Dokument beschreibt, wie die BMAD Checklisten (`docs/bmad/bmad-01`, `bmad-02`, `bmad-03`) **automatisch nach jedem Sprint** aktualisiert werden, damit POs immer einen aktuellen Status haben.

**Warum wichtig?**
- ✅ PO sieht auf einen Blick was implementiert ist
- ✅ Aktualisierung ist nicht manuell, sondern automatisch
- ✅ Keine veralteten Infos in BMAD Docs
- ✅ Sprint-Ende ist automatisch auch "BMAD Update Ende"

---

## 📊 BMAD Checklistenstruktur

### bmad-01-product-brief.md
**Checklisten:**
- Success Metrics (4 messbare Kriterien)
- Qualitative Success Criteria (4 qualitative)
- Assumptions (7 annahmen)
- Constraints (7 constraints)
- Out of Scope (6 nicht-ziele)

**Was wird abgehakt?**
- Success Metrics die erreicht werden
- Constraints die überwunden wurden
- Assumptions die verifiziert wurden

---

### bmad-02-prd.md
**Checklisten:**
- 25 Functional Requirements (FR-001 bis FR-025)
- 9 Non-Functional Requirements
- Epic definitions

**Was wird abgehakt?**
- [ ] → [x] wenn Feature implementiert + tested
- [ ] bleibt [ ] wenn in Phase 2/3 oder noch nicht gemacht

**Story Mapping (wie wir tracken):**
```
FR-001 → STORY-001 (Sprint 1) ✅
FR-002 → STORY-002 (Sprint 2) ✅
FR-003 → STORY-003 (Sprint 1) ✅
FR-004 → STORY-004 (Sprint 3) ✅
... etc
```

---

### bmad-03-architecture.md
**Checklisten:**
- Technology Stack decisions (React Native, Expo, Supabase, etc)
- Database Schema (all 9 tables)
- Security implementation (RLS policies)
- Deployment strategy
- Component architecture

**Was wird abgehakt?**
- Technology choices (✅ implementiert & tested)
- Database tables (✅ schema created + RLS verified)
- Security (✅ RLS policies live)

---

## 🔄 Automatischer Update-Prozess

### WANN wird aktualisiert?
**Nach jedem Sprint-Ende** (zusammen mit Sprint-Zusammenfassung)

**Wer macht es?**
Wird als Teil des "Sprint Ende Zeremonie" gemacht - **automatisch vor dem nächsten Sprint Start**

---

### WIE wird aktualisiert?

#### Step 1: Sammeln der Informationen
**Quellen:**
- Sprint-Plan: `docs/sprint/sprint-plan-*.md`
- Story-Register: `docs/stories/STORY-REGISTER.md`
- Sprint-Learnings: `docs/LEARNINGS/`

**Was ist zu tun:**
- Welche Stories wurden abgeschlossen?
- Welche FRs sind damit implementiert?
- Welche Annahmen wurden verifiziert?
- Welche Constraints wurden überwunden?

---

#### Step 2: bmad-01 updaten

**Für jede Success Metric:**
```
- [ ] Unkraut-Jäten: < 1h/Monat
```

Wenn im Sprint gelöst:
```
- [x] Unkraut-Jäten: < 1h/Monat (✅ Sprint 5 - Time-Tracking implementiert)
```

**Für Assumptions:**
```
- [ ] Familie nutzt App regelmäßig
```

Wenn verifiziert:
```
- [x] Familie nutzt App regelmäßig (✅ Sprint 1-5 - aktive Nutzung)
```

**Für Constraints:**
```
- [ ] Smartphone im Garten verfügbar
```

Wenn überwunden:
```
- [x] Smartphone im Garten verfügbar (✅ Sprint 1 - WLAN-Reichweite verifiziert)
```

---

#### Step 3: bmad-02 updaten

**Für jede FR:**

**VOR (offen):**
```markdown
### FR-001: Pflanzen anlegen und verwalten

**Priority:** Must Have

**Acceptance Criteria:**
- [ ] Pflanze kann angelegt werden mit allen Feldern
- [ ] Pflanze kann bearbeitet werden
- [ ] Pflanze kann gelöscht werden
- [ ] Pflanzen-Liste zeigt alle Pflanzen an
- [ ] Pflanze kann mit Fotos verknüpft werden
```

**NACH (erledigt in Sprint X):**
```markdown
### FR-001: Pflanzen anlegen und verwalten ✅

**Priority:** Must Have

**Story:** STORY-001 (Sprint 1)

**Acceptance Criteria:**
- [x] Pflanze kann angelegt werden mit allen Feldern
- [x] Pflanze kann bearbeitet werden
- [x] Pflanze kann gelöscht werden
- [x] Pflanzen-Liste zeigt alle Pflanzen an
- [x] Pflanze kann mit Fotos verknüpft werden

**Status:** ✅ Complete (Sprint 1)
```

**Logik:**
1. Find which story implemented this FR (from STORY-REGISTER)
2. Check which sprint (from STORY-REGISTER)
3. Mark all acceptance criteria as [x]
4. Add status line at end with Sprint number

---

#### Step 4: bmad-03 updaten

**VOR (Plan):**
```markdown
### Database Schema

#### users table
- [ ] User ID (primary key)
- [ ] Email (unique)
- [ ] Profile data
- [ ] Created date
- [ ] Updated date
```

**NACH (implementiert):**
```markdown
### Database Schema ✅

#### users table ✅
- [x] User ID (primary key)
- [x] Email (unique)
- [x] Profile data
- [x] Created date
- [x] Updated date

**Status:** ✅ Implemented (Sprint 1), RLS Verified ✅
```

---

### Step 5: Automation - Make it a Checklist

**Erstelle einen Sprint-Ende Checklist:**

In `docs/sprint/SPRINT-END-CHECKLIST.md`:

```markdown
# Sprint Ende Checklist

When sprint is complete:

## 1. Write Sprint Summary
- [ ] Write sprint-{N}-summary.md
- [ ] Document delivered stories
- [ ] Document cost spent
- [ ] Document metrics

## 2. Update BMAD Checklists ⭐ THIS IS AUTOMATIC
- [ ] Read sprint-{N}-summary.md (what was delivered)
- [ ] For each story: find corresponding FR in bmad-02-prd.md
- [ ] Mark FR's acceptance criteria as [x]
- [ ] Update FR status to "✅ Complete (Sprint N)"
- [ ] If assumptions verified: check in bmad-01
- [ ] If constraints solved: check in bmad-01
- [ ] If architecture decision confirmed: check in bmad-03

## 3. Update Sprint Status
- [ ] Update .bmad/sprint-status.yaml
- [ ] Set sprint velocity
- [ ] Set sprint cost

## 4. Commit
- [ ] git add docs/bmad/
- [ ] git add docs/sprint/
- [ ] git commit -m "Sprint {N}: BMAD checklists updated + Sprint summary"
```

---

## 📋 Mapping: Stories → FRs

**Dieses Mapping macht die Automation einfach:**

| Story | FR | Epic | Sprint | Status |
|-------|----|----|--------|--------|
| STORY-001 | FR-001, FR-003 | EPIC-001 | Sprint 1 | ✅ |
| STORY-002 | FR-002 | EPIC-001 | Sprint 2 | ✅ |
| STORY-003 | FR-003 | EPIC-006 | Sprint 1 | ✅ |
| STORY-004 | FR-004, FR-005, FR-006, FR-008 | EPIC-002 | Sprint 3 | ✅ |
| STORY-017 | FR-011, FR-012 | EPIC-004 | Sprint 2 | ✅ |
| STORY-040 | FR-021, FR-024, FR-025 | EPIC-005 | Sprint 5 | ✅ |
| STORY-041 | FR-013, FR-014, FR-017 | EPIC-003 | Sprint 3 | ✅ |

**Mit diesem Mapping kann jemand (oder ein Script) automatisch:**
1. Sprint-Summary lesen
2. Stories finden die completed sind
3. Entsprechende FRs in bmad-02 finden
4. Acceptance Criteria [x] machen
5. Commit machen

---

## 🤖 Full Automation (Future)

Zukünftig könnte ein Script:

```bash
#!/bin/bash
# update-bmad-checklists.sh

SPRINT=$1  # Sprint 6
SPRINT_SUMMARY="docs/sprint/sprint-${SPRINT}-summary.md"

# Parse which stories were completed
STORIES=$(grep "STORY-" $SPRINT_SUMMARY | awk '{print $2}')

# For each story, find FRs and check them
for story in $STORIES; do
  FRs=$(grep -A2 "Story: $story" docs/bmad/bmad-02-prd.md | grep FR)

  for fr in $FRs; do
    # Find FR section in bmad-02-prd.md
    # Replace [ ] with [x] for all acceptance criteria
    # Add status line at end
  done
done

# Update bmad-03 for implemented architecture decisions
# ...

git add docs/bmad/
git commit -m "Sprint ${SPRINT}: BMAD checklists updated"
```

**Aber Für jetzt:** Manuell als Teil von Sprint-Ende Prozess

---

## ✅ Anwendungsbeispiel: Nach Sprint 5

**Sprint 5 abgeschlossen mit:**
- STORY-040: Success Tracking (5 pts) ✅
- STORY-041: Photo Upload (5 pts) ✅
- Integration Tests ✅
- Performance Optimization ✅

**Update bmad-02-prd.md:**

```markdown
### FR-021: Time-Tracking für Aufgaben ✅

**Story:** STORY-040 (Sprint 5)

**Acceptance Criteria:**
- [x] Aufgaben haben optionale Zeit-Einträge
- [x] Zeit wird in Sekunden gemessen
- [x] Zeiterfassung kann manuell angepasst werden
- [x] Unkraut-Jäten Zeit wird besonders tracked

**Status:** ✅ Complete (Sprint 5)
```

**Update bmad-01-product-brief.md:**

```markdown
### Success Metrics

- [x] **Unkraut-Jäten: < 1h/Monat** (Sprint 5 - Time-Tracking implementiert)
- [x] **Bodendecker-Abdeckung: 80%+ der Beete** (Visuell verifiziert, Photo-Dokumentation möglich)
- [x] **Alle geplanten Pflanzen erfolgreich etabliert** (50+ Pflanzen im System)
- [x] **Erntemenge dokumentiert** (Harvest-Logging implementiert Sprint 5)
```

---

## 🎯 Key Rules

**Regel 1: Nur abhaken wenn WIRKLICH done**
- Code implementiert ✅
- Tested ✅
- Deployed ✅
- Dann: abhaken

**Regel 2: Status line muss Sprint# haben**
```
**Status:** ✅ Complete (Sprint 5)
```
Damit sieht man wann es erledigt wurde

**Regel 3: Dependencies checken**
```
FR-007 depends on FR-004, FR-013, FR-016
```
Wenn FR-007 erledigt werden soll, müssen dependencies auch abgehakt sein

**Regel 4: Phase 2/3 FRs bleiben [ ]**
```
### FR-007: Foto-gesteuerte Aufgaben-Generierung (Phase 2)
**Priority:** Could Have (Phase 2)
- [ ] Foto-Analyse erkennt Probleme
- [ ] Aufgabe wird automatisch generiert
...
**Status:** ⏳ Phase 2 - Ready for Sprint 6+
```

---

## 📚 Zusammengefasst

| Phase | Action | When |
|-------|--------|------|
| **Sprint aktiv** | Stories werden gemacht | Daily |
| **Sprint-Ende** | Sprint summary geschrieben | Friday EOD |
| **Sprint-Ende+1** | BMAD Checklisten aktualisiert | Saturday/Monday |
| **Sprint-Ende+2** | Nächster Sprint startet | Monday Morning |

---

## 💡 Benefits

✅ PO öffnet bmad-02-prd.md und sieht sofort was fertig ist
✅ Keine separaten Status-Reports nötig (BMAD IS the status)
✅ Story-zu-FR Mapping ist dokumentiert
✅ Historisch: Sprint 1-5 sind dokumentiert (wann welche FR done wurde)
✅ Automation ready (Script könnte es autom machen)

---

**Status:** 🟢 Process Ready
**Next:** Apply to Sprint 1-5 data (update bmad-01, 02, 03 now!)

---

*Document created: 2026-03-04*
*For: Automatic BMAD Checklist Maintenance*
