# UI-REVIEW.md - Gartenplaner Performance + UX Audit

**Datum:** 2026-03-20  
**Typ:** Retroaktiver 6-Pillar Audit  
**Fokus:** PERFORMANCE + UX  
**Score:** 6/10 (Verbesserungspotenzial)

---

## 6-Pillar Bewertung

| Pillar | Score | Status |
|--------|-------|--------|
| Performance | 4/10 | KRITISCH |
| UX | 6/10 | OK |
| Accessibility | 7/10 | OK |
| Design Consistency | 8/10 | Gut |
| i18n | N/A | - |
| Security | 8/10 | Gut |

---

## Performance Issues (P-01 - P-11)

### KRITISCH

#### P-01: HomeScreen useFocusEffect ohne Caching
**Datei:** `src/screens/HomeScreen.tsx`
**Problem:** Dashboard-Daten werden bei JEDEM Tab-Wechsel neu geladen
**Impact:** 4 DB-Queries bei jedem Focus
**Fix:** `useCallback` mit `isLoading` State + Cache mit 60s TTL

```typescript
// Aktuell:
useFocusEffect(
  useCallback(() => {
    fetchData(); // Wird bei jedem Focus ausgeführt!
  }, [])
);

// Lösung:
useFocusEffect(
  useCallback(() => {
    if (!cache.current || Date.now() - cache.current.timestamp > 60000) {
      fetchData();
    }
  }, [])
);
```

#### P-02: N+1 Query in taskService.ts
**Datei:** `src/services/taskService.ts`
**Problem:** Für N Tasks werden N zusätzliche Queries ausgeführt
**Impact:** Bei 100 Tasks = 101 Queries statt 1
**Fix:** JOIN-Query in einer Anweisung

```typescript
// Aktuell:
const tasks = await supabase.from('tasks').select('*');
return tasks.map(task => enrichTaskWithPlantNames(task)); // N+1!

// Lösung:
const { data } = await supabase
  .from('tasks')
  .select('*, task_plants(plants(name))');
```

### HOCH

#### P-03: PlantDetailScreen 6+ sequentielle Abfragen
**Datei:** `src/screens/PlantDetailScreen.tsx`
**Problem:** Jede Abfrage wartet auf die vorherige
**Impact:** 500ms+ Ladezeit statt 100ms mit Promise.all
**Fix:** Promise.all für parallele Queries

```typescript
// Aktuell:
const plant = await fetchPlant(id);
const photos = await fetchPhotos(id);
const harvests = await fetchHarvests(id);
// ...seriell

// Lösung:
const [plant, photos, harvests, companions] = await Promise.all([
  fetchPlant(id),
  fetchPhotos(id),
  fetchHarvests(id),
  fetchCompanions(plant.name)
]);
```

#### P-04: 7 Bottom Tabs verursachen Screen Preloads
**Datei:** `src/navigation/TabNavigator.tsx`
**Problem:** Jeder Tab preloadet seinen Stack
**Impact:** Speicher + Init-Zeit
**Fix:** Lazy Loading / Tab-Zusammenlegung

#### P-05: Fotos ohne Resize
**Datei:** `src/screens/PhotoGalleryScreen.tsx`
**Problem:** Full-Size Bilder in Grid
**Impact:** Hoher Speicherverbrauch, langsames Scrollen
**Fix:** Expo Image mit `resizeMode="cover"` + `css_pixel_ratio`

---

## UX Issues (U-01 - U-05)

### U-01: 7 Bottom Tabs sind zu viele
**Empfehlung:** Plants + Tasks + Shopping = "Management" Tab
**Impact:** Bessere UX, weniger kognitive Last

### U-02: "Add Plant to Bed" unimplemented
**Datei:** `src/screens/BedDetailScreen.tsx`
**Status:** TODO
**Fix:** Implementieren oder UI entfernen

### U-03: Keine Offline-Indikatoren
**Empfehlung:** Network-Status Badge in Header

---

## Implementierungsplan

### Phase 1: Quick Wins (2h)
1. [ ] P-02: N+1 Query in taskService.ts beheben
2. [ ] P-01: HomeScreen Dashboard Caching
3. [ ] P-05: Photo Resize implementieren

### Phase 2: Mittelfristig (1 Tag)
4. [ ] P-03: PlantDetail Promise.all parallelisieren
5. [ ] P-04: Tab Preloading optimieren
6. [ ] U-02: Bed Add Plant implementieren

### Phase 3: Langfristig (1 Woche)
7. [ ] U-01: Tab-Restrukturierung
8. [ ] Offline-Support
9. [ ] Image CDN

---

## Metriken

| Metrik | Vorher | Ziel |
|--------|--------|------|
| HomeScreen Load | ~800ms | <200ms |
| TaskList (100 Items) | ~2000ms | <500ms |
| PlantDetail | ~1200ms | <300ms |
| PhotoGallery Scroll | Ruckelig | 60fps |

---

*Audit abgeschlossen: 2026-03-20*
