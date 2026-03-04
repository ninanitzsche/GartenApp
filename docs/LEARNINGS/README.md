# 🌱 Gartenplaner Project Learnings

**Projekt-spezifische Erkenntnisse aus der Gartenplaner-Entwicklung**
**Status:** Aktiv (wird mit jedem Sprint erweitert)
**Zielgruppe:** Gartenplaner-Entwicklung, ähnliche Mobile Apps

---

## 🎯 Zweck

Dieser Ordner sammelt **Projekt-spezifische Learnings** - Erkenntnisse, die speziell für Gartenplaner & ähnliche React Native Apps relevant sind.

Im Gegensatz zu globalen BMAD-Learnings (in `/aipm/BMAD-LEARNINGS/`) konzentrieren sich diese auf:

- **Feature-Implementierung:** Was war schwierig, wie wurde es gelöst
- **Bugs & Gotchas:** Was ging schief, warum
- **Architecture Decisions:** Was funktioniert gut in React Native + Supabase
- **Development Workflow:** Was beschleunigt/verlangsamt Entwicklung

---

## 📖 Inhaltsverzeichnis

### 1. 🌱 **Feature Implementation Learnings**
📄 `feature-implementation-learnings.md`
- Plant CRUD: Was war knifflig
- Photo Upload/Gallery: Web vs Native Probleme
- Auth Flow: Session Management
- Shopping List: Cost-Tracking Logik
- Task Management: Priorisierung & Aufgaben-Logik

### 2. 🐛 **Bugs, Gotchas & Solutions**
📄 `bugs-and-gotchas.md`
- RLS-Policies: Häufige Fehler
- Image Upload: Compression & Storage
- Navigation: Type-Safe Routing Problems
- State Management: Context Limits
- Platform Differences: iOS/Android/Web

### 3. 🏗️ **Architecture & Tech Stack Learnings**
📄 `architecture-learnings.md`
- React Native + Expo: Pro/Contra
- Supabase: What Works Well
- TypeScript Strict Mode: Trade-offs
- Service Layer Pattern: Reusability
- Testing Strategy: Jest + Integration Tests

### 4. 🚀 **Development Process & Velocity**
📄 `development-process-learnings.md`
- Velocity: Actual Points/Sprint
- What speeds up development
- What slows it down
- Testing ROI
- Code Review: Cost vs Benefit

### 5. 🌐 **Web vs Native Development**
📄 `web-native-differences-learnings.md`
- Expo Web: Gotchas & Solutions
- Platform-specific code: Best Practices
- Image handling: Different approaches
- Testing on multiple platforms
- Deployment differences

---

## 📚 Verwandte Globale Learnings

**Check /aipm/BMAD-LEARNINGS/ für:**
- BMAD Method-Learnings (reusable für nächste Projekte)
- Cost Optimization (Budget-Strategien)
- Documentation Structure (wie organisiert man Docs)
- Claude Code Workflow (best practices)

---

## 🎓 Wie du diese Learnings findest

### "Ich habe ein Problem mit Photos..."
→ Check: `feature-implementation-learnings.md` → "Photo Upload" Sektion

### "Photo Upload funktioniert auf Native, aber nicht Web"
→ Check: `web-native-differences-learnings.md`

### "RLS-Policy wirft weird Error"
→ Check: `bugs-and-gotchas.md` → "RLS-Policies"

### "Wie schnell sollte ein Sprint sein?"
→ Check: `development-process-learnings.md` → Velocity Sektion

---

## 🚀 Contributing to These Learnings

### Nach jedem Sprint:

1. **What went well?**
   - Update relevant file with positive learnings
   - Beispiel: "Plant Search with Debounce" → 15% faster than expected

2. **What went badly?**
   - Add to `bugs-and-gotchas.md` with solution
   - Beispiel: "RLS Query returned wrong data because..." → "Fix: Always include user_id in where clause"

3. **New patterns discovered?**
   - Add to `architecture-learnings.md`
   - Beispiel: "Service Layer + Custom Hooks pattern works better than..."

4. **Performance insights?**
   - Add to `development-process-learnings.md`
   - Beispiel: "FlatList optimization saved 40% rendering time"

---

## 📊 Sprint Learning Process

1. **During Sprint:** Notiere dich schnell, wenn du was Lernen (in einem Draft)
2. **End-of-Sprint:** Review Learnings und update relevante Files
3. **Pre-Next-Sprint:** Lies relevant sections wieder (auffrischen)
4. **New Feature:** Checke ob ähnliche Feature schon documented

---

## 💡 Example Learning Entry

**Gut geschrieben:**
```
### Plant Photo Upload Web Issue

**Problem:** Photo upload works on iOS Simulator and Android Emulator,
but fails on Expo Web with "blob:// URI not supported"

**Root Cause:** Expo Web uses different image handling than Native.
File URIs (file://) work on Native, but Web needs blob:// URIs.

**Solution:**
1. In photoService.ts, detect platform:
   ```typescript
   const uri = Platform.OS === 'web' ? imageData.base64 : imageData.uri;
   ```
2. Use base64 upload for Web, URI for Native

**Cost:** 30 min debugging, 15 min fix
**Learning:** Always test Web early! Would have saved 2 hours if done Day 2.
```

---

## 📈 Learning Metrics

Track diese Metriken über Sprints:
- Bugs pro Feature: Tracking wo Problems häufig
- Velocity impact: Welche Learnings erhöhen Geschwindigkeit
- Quality metrics: Wie verbessern sich Tests
- Platform issues: Wie viele Web vs Native Problems

---

## 🎯 Langfristiger Nutzen

Diese Learnings:
- ✅ Speed up neue Features (lookup statt neu erfinden)
- ✅ Reduce bugs (known gotchas avoided)
- ✅ Improve quality (proven patterns reused)
- ✅ Make onboarding easier (new devs read this)
- ✅ Drive better estimates (based on actual data)

---

**Status:** 🟢 Ready for Contributions
**Zuletzt aktualisiert:** 2026-03-04
**Nächste Aktualisierung:** Nach Sprint 6

