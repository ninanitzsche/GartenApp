# Superpowers Code Review: `feature/ux-redesign-approach-b`

**Review Datum:** 2026-03-20
**Reviewer:** Superpowers Review
**Branch:** feature/ux-redesign-approach-b

---

## 1. Stärken

### Clean Code
- **Kleine, fokussierte Komponenten:** `PrioritaetBadge.tsx` (48 Z.) und `TaskCard.tsx` (88 Z.) sind mustergültig - single responsibility, keine Magie
- **Gute TypeScript-Typisierung:** Enums für `Zeitraum`, `ZeitraumPhase`, `Jahreszeit` sind sauber definiert
- **Separation of Concerns:** Utils sind von Types getrennt, Service abstrahiert Logik
- **Klare Benennung:** Deutsche Labels (`ZEITRAUM_LABELS`, `getZeitraumShortLabel`) sind konsistent und lesbar

### Architektur
- **Durchdachtes Phasen-System:** Unterteilung in Früh/Mitte/Spät ermöglicht granulare Planung
- **Service-Layer:** `zeitraumService.ts` kapselt Business-Logik (Suggestion, Phase-Relevanz)
- **Performance-Optimierung:** Dashboard-Caching in HomeScreen (60s TTL)

### Navigation
- **Reduzierung von 7 auf 4 Tabs:** Klare UX-Verbesserung, Photos konsistent im Garden-Stack

---

## 2. Verbesserungsvorschläge

### TDD (Critical Gap)
**Problem:** Keine Tests für neue Funktionalität

| Datei | Empfehlung |
|-------|------------|
| `zeitraumUtils.ts` | Tests für `getAktuelleSaison()`, `getJahreszeit()`, `getPhase()`, `isRelevantForCurrentPhase()` |
| `zeitraumService.ts` | Tests für `suggestZeitraum()`, `getNextPhase()` |
| `TaskCard.tsx` | Snapshot/Unit-Test für Rendering |
| `PrioritaetBadge.tsx` | Test für alle 3 Prioritäts-Stufen |

**Empfehlung:** Vor Merge mindestens Unit-Tests für Utils-Funktionen erstellen.

### YAGNI
1. **`KATEGORIE_ZEITRAUM` in zeitraumService.ts:84-92** - Definiert aber nie verwendet (nur als Kommentar-Reference)
2. **`getNextPhase()` in zeitraumService.ts:152-200** - Komplexe Funktion ohne erkennbare Verwendung im Code
3. **EMojis in Labels** (`ZEITRAUM_SHORT_LABELS`) - Könnten als separate Icon-Property ausgelagert werden

### DRY
1. **Zeitraum-Mapping-Duplikation:**
   - `zeitraumUtils.ts:95-108` definiert Mapping, das aus Enum-Namen ableitbar ist
   - Alternative: Dynamische Konstruktion aus `Jahreszeit` + `ZeitraumPhase`
   
2. **Filter-Duplikation in HomeScreen:271-323:**
   ```typescript
   // Wiederholt sich 3x für 'hoch', 'mittel', 'niedrig'
   prioritizedTasks.filter(t => t.priority === 'hoch').length > 0
   ```
   - Extract zu: `groupTasksByPriority(tasks): Record<Priority, Task[]>`

3. **Status-Lookup-Maps in HomeScreen:138-163:**
   - `getStatusColor()` und `getStatusLabel()` könnten ein kombiniertes Record sein

### Clean Code
1. **`(task as any).zeitraum` in TaskCard.tsx:18** - Unsafe cast, sollte getypt sein
2. **HomeScreen:580 Zeilen** - Wächst, sollte in Sub-Komponenten extrahiert werden:
   - `HarvestSection.tsx`
   - `TaskSection.tsx` (mit `TaskCard` Integration)
   - `StatusSection.tsx`
   - `ActivitySection.tsx`

3. **Magic Numbers:**
   - `sortZeitraeume()`: `order[a] || 99` - magische Zahl 99

---

## 3. Scoring

| Kategorie | Score | Begründung |
|-----------|-------|------------|
| **TDD** | 3/10 | Keine Tests für neue Commits. Bestehende Test-Suite existiert, aber wird nicht erweitert. |
| **YAGNI** | 7/10 | Grundfunktionalität fokussiert, aber ungenutzter Code (`KATEGORIE_ZEITRAUM`, `getNextPhase`) |
| **DRY** | 6/10 | Kleinere Duplikate bei Mappings und Filtern, aber akzeptabel |
| **Clean Code** | 8/10 | Gute Komponenten, Utils sauber. Unsafe cast und wachsender Screen als Schwächen |

**Gesamt: 6/10**

---

## 4. Empfehlung

### `needs fixes`

**Begründung:**
1. **TDD-Mangel ist kritisch** für neue Business-Logik (`zeitraumService.ts`, `zeitraumUtils.ts`)
2. **Unsafe Cast** (`as any`) sollte vor Merge behoben werden
3. **Ungenutzter Code** sollte entfernt werden (YAGNI)

**Blocking Issues:**
- Keine Tests für `zeitraumService` und `zeitraumUtils`

**Empfohlene Action Items:**
- [ ] Tests für `zeitraumUtils` hinzufügen
- [ ] `KATEGORIE_ZEITRAUM` entfernen oder verwenden
- [ ] `(task as any)` → Typed extraction
- [ ] Optional: HomeScreen in Sub-Komponenten refaktorieren
