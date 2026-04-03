# OpenCode Workflow Rules

**Datei wird automatisch bei jedem Task geladen**

---

## 🚨 PFLICHT WORKFLOW - Bei JEDEM Task

```
1. brainstorming Skill laden → Requirements klären
2. (optional) writing-plans Skill → Implementation plan erstellen  
3. (optional) test-driven-development Skill → Tests schreiben
4. implementieren
5. verification-before-completion → Testen
```

**Gilt für:** JEDEN Bug, JEDES Feature, JEDE Aufgabe

---

## Warum dieser Workflow?

- **brainstorming**: Klärt Requirements bevor implementiert wird → 40-50% weniger Retries
- **writing-plans**: Erstellt Plan bevor Code geschrieben wird 
- **test-driven-development**: Tests vor Code → bessere Qualität
- **verification-before-completion**: Prüft ob Fix funktioniert bevor behauptet wird dass es funktioniert

---

## Wann welche Skills laden?

| Situation | Skills die ich laden soll |
|-----------|-------------------------|
| Neues Feature | brainstorming → writing-plans → developer |
| Bugfix | systematic-debugging → test-driven-development |
| Refactoring | brainstorming → writing-plans → developer |
| Tests schreiben | test-driven-development |

---

## Retro Learnings (2026-04-03)

**Was schlecht lief:**
- Zu viele Bugs gleichzeitig (14+) ohne Priorisierung
- Immer wieder Neustarts (Cache nicht early clear)
- Kein brainstorming upfront
- Kein TDD

**Was ich lerne:**
- Max 3-5 Bugs pro Session
- TodoWrite für jeden Bug nutzen
- Klare Test-Reihenfolge definieren
- brainstorming Skill IMMER zuerst laden
