# STORY-048: Dark Mode Support

**Points:** 5
**Sprint:** 7
**Priority:** P0 - Kritisch
**Status:** Ready

---

## User Story

Als Gartenplaner-User möchte ich zwischen Light und Dark Mode wechseln,
damit ich die App auch bei Dunkelheit angenehm nutzen kann.

---

## Akzeptanzkriterien

- [ ] Toggle in Einstellungen
- [ ] System-Setting erkennen (auto)
- [ ] Alle UI-Komponenten unterstützen beide Modi
- [ ] Glassmorphism passt sich an
- [ ] Saisonale Farben bleiben erhalten
- [ ] Tests für beide Modi

---

## Design

### Farben Dark Mode
```typescript
dark: {
  bg: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  glass: {
    light: 'rgba(30,30,30,0.72)',
    medium: 'rgba(30,30,30,0.85)',
  },
}
```

---

# STORY-049: Task Suche & Filter

**Points:** 3
**Sprint:** 7
**Priority:** P0 - Kritisch
**Status:** Ready

---

## User Story

Als Gartenplaner-User möchte ich Tasks suchen und filtern,
damit ich schneller finde was ich suche.

---

## Akzeptanzkriterien

- [ ] Searchbar oben im TaskListScreen
- [ ] Filter nach Kategorie
- [ ] Filter nach Priorität
- [ ] Filter nach Zeitraum
- [ ] Debounced Suche (300ms)
- [ ] Empty State für keine Ergebnisse

---

# STORY-050: Push-Benachrichtigungen

**Points:** 5
**Sprint:** 7
**Priority:** P0 - Kritisch
**Status:** Ready

---

## User Story

Als Gartenplaner-User möchte ich Benachrichtigungen für Tasks,
damit ich wichtige Aufgaben nicht vergesse.

---

## Akzeptanzkriterien

- [ ] Permission anfragen
- [ ] Benachrichtigung bei Task-Fälligkeit
- [ ] Benachrichtigung bei Erntezeit
- [ ] Benachrichtigung bei Saison-Wechsel
- [ ] Settings für Benachrichtigungen
- [ ] Quiet Hours

---

# STORY-051: Offline-Caching

**Points:** 5
**Sprint:** 7
**Priority:** P0 - Kritisch
**Status:** Ready

---

## User Story

Als Gartenplaner-User möchte ich die App offline nutzen,
damit ich auch ohne Internet arbeiten kann.

---

## Akzeptanzkriterien

- [ ] SQLite Local Cache
- [ ] Sync-Queue für Änderungen
- [ ] Offline-Indikator
- [ ] Conflict Resolution
- [ ] Last-Seen Timestamp
- [ ] Background Sync

---

# STORY-052: KI-Pflanzenempfehlungen

**Points:** 8
**Sprint:** 8
**Priority:** P1 - Wichtig
**Status:** Ready

---

## User Story

Als Gartenplaner-User möchte ich KI-gestützte Pflanzenvorschläge,
damit ich bessere Ernten erziele.

---

## Akzeptanzkriterien

- [ ] Wetter-API Integration
- [ ] Standort-basierte Empfehlungen
- [ ] Saison-basierte Empfehlungen
- [ ] Companion Planting Vorschläge
- [ ] Confidence Score
- [ ] Ablehnung/Benachrichtigung

---

# STORY-053: Ernte-Statistiken

**Points:** 3
**Sprint:** 8
**Priority:** P1 - Wichtig
**Status:** Ready

---

## User Story

Als Gartenplaner-User möchte ich Charts und Statistiken zu meinen Ernten,
damit ich meine Gartenerfolge besser nachvollziehen kann.

---

## Akzeptanzkriterien

- [ ] Balken-Diagramm nach Monat
- [ ] Pie-Chart nach Pflanze
- [ ] Liniendiagramm über Zeit
- [ ] Export als Bild
- [ ] Filter nach Zeitraum

---

# STORY-054: Swipe-to-Delete

**Points:** 2
**Sprint:** 8
**Priority:** P1 - Wichtig
**Status:** Ready

---

## User Story

Als Gartenplaner-User möchte ich Tasks und Pflanzen durch Swipen löschen,
damit die Bedienung intuitiver wird.

---

## Akzeptanzkriterien

- [ ] Swipe Left → Delete (mit Confirmation)
- [ ] Swipe Right → Complete (Tasks)
- [ ] Animation mit Farbe
- [ ] Undo-Möglichkeit
- [ ] Accessibility-Label

---

# STORY-055: Export-Funktion

**Points:** 3
**Sprint:** 8
**Priority:** P1 - Wichtig
**Status:** Ready

---

## User Story

Als Gartenplaner-User möchte ich meine Daten exportieren,
damit ich sie backuppen oder teilen kann.

---

## Akzeptanzkriterien

- [ ] CSV Export
- [ ] PDF Export (schön formatiert)
- [ ] Share Sheet
- [ ] Filter für Export
- [ ] Alle Daten oder Auswahl
