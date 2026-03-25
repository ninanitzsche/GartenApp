# STORY-043: HomeScreen UI Redesign

**Points:** 3
**Sprint:** 6
**Status:** In Progress
**Branch:** feature/ui-redesign-2026

---

## User Story

Als Gartenplaner-User möchte ich ein modernes, elegantes Dashboard,
damit ich schnelle Übersicht über Tasks, Ernten und Tipps habe.

---

## Akzeptanzkriterien

- [ ] Glassmorphism Header mit Blur-Background
- [ ] Saisonaler Farb-Tint (Frühling = grün, Sommer = orange, etc.)
- [ ] Task-Cards: Glass Cards mit Slide-In Animation
- [ ] Learnings: Bold Cards mit Stagger-Animation
- [ ] Metrics: Animated Progress mit Lucide Icons
- [ ] Empty State: Beautiful Empty State mit Fade-Up Animation
- [ ] Pull-to-Refresh: Bounce Animation
- [ ] 60fps Performance

---

## Design Referenz

- GlassCard: `src/components/ui/GlassCard.tsx`
- AnimatedButton: `src/components/ui/AnimatedButton.tsx`
- SectionHeader: `src/components/ui/SectionHeader.tsx`
- EmptyState: `src/components/ui/EmptyState.tsx`
- StatusBadge: `src/components/ui/StatusBadge.tsx`

---

## TDD Ansatz

### Tests zuerst schreiben:
1. HomeScreen rendert ohne Fehler
2. Glass Header wird angezeigt
3. Tasks Section wird angezeigt wenn Tasks existieren
4. Empty State wird angezeigt wenn keine Daten
5. Seasonal Colors werden korrekt angewendet
6. Pull-to-Refresh funktioniert

### Implementation:
1. Glass Header mit Saisonalem Tint
2. Task Cards mit GlassCard
3. Learnings mit GlassCard + Stagger
4. Empty State mit Fade-Up Animation
5. Metrics mit Lucide Icons

---

## Files zu ändern

```
src/screens/HomeScreen.tsx    # Haupt-Screen Redesign
src/__tests__/HomeScreen.test.tsx  # Tests
```

---

## Definition of Done

- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] Tests bestehen (TDD)
- [ ] Keine visuellen Regressionen
- [ ] Code Review durchgeführt
- [ ] Dokumentation aktualisiert
