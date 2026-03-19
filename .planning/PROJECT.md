# Gartenplaner App - Phase 2: AI Features

**Last Updated:** 2026-03-19
**Type:** Subsequent Milestone (Adding to existing MVP)
**Goal:** Add AI-powered plant identification and task automation

---

## Context

Gartenplaner is a permaculture garden planning app for families. Phase 1 MVP delivered:
- Plant inventory management
- Task management with seasonal suggestions
- Photo documentation
- Shopping list with budget tracking
- Garden bed planning (Sprint 7)
- Knowledge base

**Phase 2 Focus:** Add AI capabilities to reduce manual work and improve user experience.

---

## Vision

**ONE thing:** "Tell me what's in my photo and what I should do about it"

AI should make gardening **easier**, not more complex. The app should:
1. Identify plants from photos (replace manual entry)
2. Detect problems early (pests, diseases, nutrient deficiencies)
3. Generate relevant tasks automatically based on what's in the garden

---

## Phase 2 Features

### AI Plant Identification
- Upload photo → Get plant name + care tips
- Works offline-first (cache identifications)
- Links to existing plant database

### Pest/Disease Detection
- Analyze photos for common issues
- Show treatment recommendations
- Connect to knowledge base articles

### Photo-Driven Task Generation
- After photo identification, suggest relevant tasks
- Seasonal reminders based on plant types
- Harvest predictions

---

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Claude Vision API | Best-in-class plant identification | Cost: ~$0.01/image |
| Cache identifications | Reduce API calls, work offline | Local storage |
| No real-time video analysis | Battery drain, complexity | Photo upload only |

---

## Constraints

- **Budget:** $5/month for AI API
- **Platform:** iOS, Android, Web
- **Privacy:** Photos stay on user's device + Supabase storage

---

## Out of Scope

- Real-time plant scanning
- Plant health monitoring sensors
- Social features (share garden)
- Offline-first architecture (Phase 3)

---

## Requirements

### Validated (Phase 1)

- ✓ Plant CRUD with status tracking
- ✓ Task management with priorities
- ✓ Photo upload and gallery
- ✓ Shopping list with categories
- ✓ Garden bed visualization
- ✓ Knowledge base integration

### Active (Phase 2)

- [ ] AI Plant Identification (Claude Vision)
- [ ] Pest/Disease Detection
- [ ] Photo-Driven Task Suggestions
- [ ] Integration with existing plant database

### Out of Scope

- [Real-time video analysis] — Too complex, battery drain
- [Sensor integration] — Hardware, not MVP
- [Social sharing] — Not core value

---

## Tech Stack

**New additions for Phase 2:**
- Claude Vision API (plant identification)
- Image processing (sharp/expo-image-manipulator)
- Local caching (AsyncStorage for identification cache)

**Existing:**
- React Native + Expo
- Supabase (database, auth, storage)
- TypeScript

---

## Team

- Solo Developer (Nina)
- Previous velocity: 10.8 pts/sprint

---

*Last updated: 2026-03-19 after Phase 2 kickoff*
