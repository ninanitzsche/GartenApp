# 🌱 Gartenplaner Project Learnings

**Projekt-spezifische Erkenntnisse aus der Gartenplaner-Entwicklung**
**Status:** Aktiv (wird mit jedem Sprint erweitert)
**Zielgruppe:** Gartenplaner-Entwicklung, ähnliche Mobile Apps

---

## 📖 Inhaltsverzeichnis

### 1. 🌱 Feature Implementation Learnings
📄 `feature-implementation-learnings.md`
- Plant CRUD: Was war knifflig
- Photo Upload/Gallery: Web vs Native Probleme
- Auth Flow: Session Management
- Shopping List: Cost-Tracking Logik
- Task Management: Priorisierung & Aufgaben-Logik

### 2. 🐛 Bugs, Gotchas & Solutions
📄 `bugs-and-gotchas.md`
- RLS-Policies: Häufige Fehler
- Image Upload: Compression & Storage
- Navigation: Type-Safe Routing Problems
- State Management: Context Limits
- Platform Differences: iOS/Android/Web

---

## 🎓 Wie du diese Learnings findest

| Problem | Check |
|---------|-------|
| Photo Upload Issues | `feature-implementation-learnings.md` → "Photo Upload" |
| RLS Policy Errors | `bugs-and-gotchas.md` → "RLS-Policies" |
| Web vs Native | `bugs-and-gotchas.md` → "Platform Differences" |
| Auth Problems | `feature-implementation-learnings.md` → "Auth Flow" |

---

## 💡 Example Learning Entry

**Gut geschrieben:**
```
### Plant Photo Upload Web Issue

**Problem:** Photo upload works on iOS, but fails on Web with "blob:// URI not supported"

**Root Cause:** Expo Web uses different image handling than Native.

**Solution:**
```typescript
const uri = Platform.OS === 'web' ? imageData.base64 : imageData.uri;
```

**Cost:** 30 min debugging, 15 min fix
```

---

## 📈 Learning Metrics

Track diese Metriken über Sprints:
- Bugs pro Feature
- Velocity impact
- Platform issues (Web vs Native)

---

**Zuletzt aktualisiert:** 2026-03-19
