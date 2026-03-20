# App-Struktur Uebersicht - Gartenplaner

**Datum:** 2026-03-20  
**Typ:** Performance/UX Audit Scan  
**App:** Expo/React Native Gartenplaner App

---

## 1. Screen-Liste

### 1.1 Tab-basierte Screens (Bottom Navigation)

| Screen | Navigator | Pfad | Beschreibung |
|--------|-----------|------|--------------|
| HomeScreen | TabNavigator | `/` | Dashboard mit Metriken, Erntuebersicht, Aufgaben-Status |
| PlantListScreen | PlantsStack | `/plants` | Pflanzenliste mit Suche/Filter |
| TaskListScreen | TaskStack | `/tasks` | Aufgabenliste mit Sortierung |
| PhotoGalleryScreen | Tab | `/photos` | Fotogalerie mit Pagination |
| ShoppingListScreen | ShoppingStack | `/shopping` | Einkaufsliste |
| GardenOverviewScreen | GardenStack | `/garden` | Gartenkarte mit Beeten |
| MoreMenuScreen | MoreMenuStack | `/more` | Einstellungen-Profil-Wissen |

### 1.2 Stack Screens (Detail- und Form-Screens)

#### Plants Stack
- `PlantDetailScreen` - Pflanzendetails mit Fotos, Ernten, Mischkultur
- `AddPlantScreen` - Neue Pflanze erstellen (Modal)
- `EditPlantScreen` - Pflanze bearbeiten
- `PhotoUploadScreen` - Foto hochladen

#### Tasks Stack
- `AddTaskScreen` - Neue Aufgabe erstellen
- `TaskDetailScreen` - Aufgabendetails
- `TaskTimelineScreen` - Aufgaben-Zeitachse

#### Shopping Stack
- `AddShoppingItemScreen` - Artikel hinzufuegen
- `EditShoppingItemScreen` - Artikel bearbeiten
- `ShoppingDashboardScreen` - Einkaufs-Dashboard

#### Garden Stack
- `GardenSettingsScreen` - Garteneinstellungen
- `GardenPhotoGalleryScreen` - Gartenfotos
- `BedDetailScreen` - Beetdetails
- `AddBedScreen` - Beet erstellen (Modal)
- `EditBedScreen` - Beet bearbeiten

#### Knowledge Stack
- `KnowledgeBaseScreen` - Wissensdatenbank
- `KnowledgeDetailScreen` - Artikel-Details
- `ArticleDetailScreen` - Artikelansicht

#### Harvest Stack
- `HarvestLogScreen` - Ernte-Log
- `AddHarvestScreen` - Ernte hinzufuegen

#### Profile/Auth Stack
- `ProfileScreen` - Profil
- `LoginScreen` - Anmeldung
- `RegisterScreen` - Registrierung
- `AuthScreen` - Auth Wrapper
- `ForgotPasswordScreen` - Passwort vergessen
- `ChangePasswordScreen` - Passwort aendern
- `OnboardingScreen` - Onboarding

---

## 2. Komponenten-Uebersicht

### 2.1 List-Komponenten (Performance-Kritisch)

| Komponente | Datei | Listentyp | Optimierungen |
|------------|-------|-----------|---------------|
| FlatList | PlantListScreen.tsx | Pflanzen | Debounce Search (300ms), Filter-Chips, Refresh |
| FlatList | TaskListScreen.tsx | Aufgaben | useCallback fuer renderItem, Refresh |
| FlatList | ShoppingListScreen.tsx | Einkauf | Debounce Search (300ms), Filter-Panel |
| FlatList | PhotoGalleryScreen.tsx | Fotos | **Pagination (50er Batches)**, getItemLayout, removeClippedSubviews, maxToRenderPerBatch=10 |
| FlatList | BedDetailScreen.tsx | Beet-Pflanzen | scrollEnabled=false (nested) |

### 2.2 Bild-Komponenten

| Komponente | Datei | Problem |
|------------|-------|---------|
| Image | PhotoGalleryScreen.tsx | Grid-Galerie ohne explizite Resize-Grössen |
| Image | PlantDetailScreen.tsx | Thumbnails (120x120) in ScrollView |
| Image | AIPhotoPicker.tsx | Vorschau (250x250) |

### 2.3 UI-Komponenten

| Komponente | Datei | Typ |
|------------|-------|-----|
| BedMapView | BedMapView.tsx | Interaktive Gartenkarte |
| BedCard | BedCard.tsx | Beet-Listeitem |
| TaskListItem | TaskListItem.tsx | Aufgaben-Listeitem |
| TaskSuggestionModal | TaskSuggestionModal.tsx | KI-Aufgabenvorschlaege |
| AIPhotoPicker | AIPhotoPicker.tsx | Kamera/Galerie + KI-Erkennung |
| PhotoFilterModal | PhotoFilterModal.tsx | Foto-Filter |
| EmptyState | EmptyState.tsx | Leere-Zustand-Anzeige |
| MetricCard | MetricCard.tsx | Dashboard-Metriken |
| ProgressBar | ProgressBar.tsx | Fortschrittsbalken |
| GardenStatsCard | GardenStatsCard.tsx | Garten-Statistiken |
| TasksGroupedByTimeWindow | TasksGroupedByTimeWindow.tsx | Zeitgruppierte Aufgaben |
| TaskTimelineView | TaskTimelineView.tsx | Zeitachsen-Ansicht |

---

## 3. Navigation-Struktur

```
NavigationContainer
  └── TabNavigator (Bottom Tabs - 7 Tabs!)
      ├── Home (Dashboard)
      ├── Plants (Stack Navigator)
      │   ├── PlantList
      │   ├── PlantDetail
      │   ├── AddPlant (Modal)
      │   ├── EditPlant
      │   ├── PhotoGallery
      │   └── PhotoUpload (Modal)
      ├── Tasks (Stack Navigator)
      │   ├── TaskList
      │   ├── AddTask
      │   └── TaskDetail
      ├── Photos (Screen)
      ├── Shopping (Stack Navigator)
      │   ├── ShoppingList
      │   ├── AddShoppingItem
      │   └── EditShoppingItem
      ├── GardenOverview (Stack Navigator)
      │   ├── GardenOverview
      │   ├── GardenSettings
      │   ├── GardenPhotoGallery
      │   ├── BedDetail
      │   ├── AddBed (Modal)
      │   └── EditBed
      └── More (Stack Navigator)
          ├── MoreMenu
          ├── Profile
          ├── KnowledgeBase
          ├── KnowledgeDetail
          ├── ArticleDetail
          ├── HarvestLog
          ├── AddHarvest
          └── ChangePassword
```

---

## 4. Services und Datenbankabfragen

### 4.1 Services-Uebersicht

| Service | Datei | Hauptaufgaben |
|---------|-------|--------------|
| supabase | supabase.ts | Supabase Client |
| plantService | plantService.ts | Pflanzen CRUD, Filter |
| taskService | taskService.ts | Aufgaben CRUD, Sorting, Enrichment |
| photoService | photoService.ts | Fotos CRUD, Upload, Pagination |
| shoppingService | shoppingService.ts | Einkaufsliste CRUD |
| harvestService | harvestService.ts | Ernten CRUD |
| gardenService | gardenService.ts | Garten CRUD |
| bedService | bedService.ts | Beet CRUD |
| companionService | companionService.ts | Mischkultur-Daten |
| knowledgeService | knowledgeService.ts | Wissensdatenbank |
| dashboardService | dashboardService.ts | Aggregierte Dashboard-Daten |
| authService | authService.ts | Authentifizierung |
| aiService | aiService.ts | KI-Pflanzenerkennung |
| aiMetadataService | aiMetadataService.ts | KI-Metadaten |
| aiIntegrationService | aiIntegrationService.ts | AI-Integration |
| cacheService | cacheService.ts | Caching |
| taskSuggestionService | taskSuggestionService.ts | KI-Aufgabenvorschlaege |
| seedDataService | seedDataService.ts | Demo-Daten |

### 4.2 Kritische Datenbankabfragen

#### Dashboard (HomeScreen)
```typescript
// dashboardService.ts - 4 parallele Abfragen bei jedem Focus
Promise.all([
  getHarvestMetrics(),        // SELECT harvests + plants(name)
  getTaskMetrics(),           // fetchTasks() + Berechnung
  getPlantStatusDistribution(), // SELECT plants(status)
  getRecentActivity(5)        // harvests + tasks JOIN
])
```
**Problem:** Wird bei jedem Screen-Focus neu geladen (useFocusEffect ohne Memoization)

#### PlantDetailScreen
```typescript
// Mehrere sequentielle Abfragen:
fetchPlant(plantId)
  → SELECT photos via photo_plants junction
  → getHarvestsByPlant(plantId)
  → getTotalHarvestByPlant(plantId)
  → getCompanionsByPlantName(plantData.name)
  → getIdentificationsForPlant(plantId)
```
**Problem:** 6+ separate Datenbankabfragen bei jedem Besuch

#### TaskService - N+1 Problem
```typescript
// fetchTasks() in taskService.ts
// fuer JEDE Aufgabe wird enrichTaskWithPlantNames() aufgerufen
const tasks = (data || []) as Task[];
return await Promise.all(tasks.map(enrichTaskWithPlantNames));
// → fuer N Aufgaben: N额外的 JOIN-Queries
```

#### GardenOverviewScreen
```typescript
// fetchBeds() + dann alle bed_plants laden
const { data: allBedPlants } = await supabase
  .from('bed_plants')
  .select('bed_id');
// O(n) filter auf Client fuer Pflanzenzaehlung
```

---

## 5. Performance-Flaschenhaelse

### 5.1 CRITISCH

| ID | Ort | Problem | Impact |
|----|-----|---------|--------|
| P-01 | HomeScreen | useFocusEffect laedt Dashboard bei JEDEM Tab-Wechsel | Hoch - wiederholte DB-Abfragen |
| P-02 | taskService.ts | N+1 Query: fetchTasks fetcht alle Tasks, dann fuer jede Task eine separate getTaskPlants() Query | Kritisch bei vielen Aufgaben |
| P-03 | PlantDetailScreen | 6+ sequentielle Abfragen bei jedem Oeffnen | Hoch |
| P-04 | TabNavigator | 7 Bottom Tabs - viele Screen-Preloads | Speicher/Init |

### 5.2 HOCH

| ID | Ort | Problem | Impact |
|----|-----|---------|--------|
| P-05 | PhotoGalleryScreen | Photos ohne explizite Dimensionen/Resize | Speicher bei grossen Bildern |
| P-06 | PlantListScreen | Filter werden bei jedem Tastendruck mit 300ms Debounce gesendet | Mittel |
| P-07 | ShoppingListScreen | Gleiche Filterlogik wie PlantList | Mittel |
| P-08 | BedMapView | Festes 300px Height, absolute Positionierung | Layout-Berechnungen |

### 5.3 MITTEL

| ID | Ort | Problem | Impact |
|----|-----|---------|--------|
| P-09 | AIPhotoPicker | Bild wird vor KI-Erkennung komplett geladen | Netzwerk |
| P-10 | GardenOverviewScreen | autoCreateBedsFromLocations() mit try-catch-silent-fail | Logik-Flow |
| P-11 | AuthContext | Kein Loading-State fuer Session-Check | UX-Flash |

---

## 6. UX-Flow Analyse

### 6.1 Benutzerflows

```
Flow 1: Pflanze hinzufuegen (KI)
Start → Plants Tab → FAB "+" → AddPlant (Modal)
                             ↓
                        AIPhotoPicker
                             ↓
                    KI-Erkennung → Aufgabenvorschlaege
                             ↓
                        Pflanze speichern

Flow 2: Aufgabe erstellen
Start → Tasks Tab → FAB "+" → AddTask
                             ↓
                    Pflanze verknuepfen
                             ↓
                    Aufgabe speichern

Flow 3: Ernte dokumentieren
Start → Plants → PlantDetail → Ernte dokumentieren
                                      ↓
                              AddHarvest Screen

Flow 4: Beet verwalten
Start → Garden Tab → Beet auswaehlen
                             ↓
                    BedDetail → Pflanze hinzufuegen (TODO)
```

### 6.2 Navigationstiefe

| Pfad | Tiefe | Bewertung |
|------|-------|-----------|
| Home → Task → TaskDetail | 2 | OK |
| Home → Plants → PlantDetail → Galerie | 3 | Grenzwertig |
| Home → Garden → BedDetail | 3 | OK |
| Home → More → Knowledge → Article | 4 | **Zu tief** |

### 6.3 UX-Probleme

| ID | Problem | Empfehlung |
|----|---------|------------|
| U-01 | 7 Bottom Tabs sind zu viele | Aehnliche Tabs zusammenfassen (Plants/Tasks/Shopping) |
| U-02 | Modal-Forms (AddPlant) blockieren nicht-modal Screens nicht | Korrekt implementiert |
| U-03 | Keine Breadcrumbs fuer verschachtelte Flows | Navigation-Helper hinzufuegen |
| U-04 | Garden "Add Plant" ist unimplemented (TODO) | Funktionalitaet implementieren |
| U-05 | Keine Offline-Indikatoren | Network-Status anzeigen |

---

## 7. Memoization-Status

### 7.1 Screens mit useCallback/useMemo

| Screen | useCallback | useMemo | useFocusEffect |
|--------|-------------|---------|----------------|
| HomeScreen | Ja | Nein | Ja (ohne Deps-Memo) |
| PlantListScreen | Ja | Nein | Ja |
| TaskListScreen | Ja | Nein | Nein (nur useEffect) |
| ShoppingListScreen | Nein | Nein | Ja |
| PhotoGalleryScreen | Ja | Ja | Nein |
| GardenOverviewScreen | Nein | Nein | Ja |
| PlantDetailScreen | Ja | Ja | Ja |

### 7.2 Fehlende Optimierungen

- **HomeScreen:** getDashboardData() wird bei jedem Focus ausgefuehrt
- **PlantDetailScreen:** Mehrere useCallback vorhanden, aber Datenfetch nicht gememoized
- **ShoppingListScreen:** Keine Callback-Optimierung fuer renderItem

---

## 8. Caching-Status

| Service | Cache | Implementierung |
|---------|-------|-----------------|
| aiService | Ja | cacheService.getCachedIdentification() |
| photoService | Partial | URL-Enrichment, aber keine Request-Caches |
| plantService | Nein | Kein Client-Cache |
| taskService | Nein | Kein Client-Cache |
| dashboardService | Nein | Kein Cache |

---

## 9. Empfehlungen (Priorisiert)

### Quick Wins (1-2 Tage)

1. **N+1 Query beheben** - Task Enrichment in einem JOIN statt N Queries
2. **Dashboard Caching** - getDashboardData() mit kurzem TTL Cache
3. **Photo Resize** - Expo Image mit resize-Modes explizit setzen
4. **HomeScreen useFocusEffect Dependencies** - Memoized callback

### Medium (1 Woche)

5. **Tab-Zusammenlegung** - Plants/Tasks/Shopping in einem Tab "Management"
6. **PhotoGallery FlatList Optimization** - Vollstaendige Virtualisierung
7. **PlantDetail Abfragen parallelisieren** - Promise.all statt sequentiell

### Langfristig (2+ Wochen)

8. **Offline-Support** - AsyncStorage/Supabase Offline
9. **GraphQL-Ueberlegung** -Fuer komplexe Data-JOINs
10. **Image CDN** - Cloudinary/Imgix fuer Foto-Resizing

---

## 10. Dateistruktur-Uebersicht

```
src/
├── components/          (14 Komponenten)
│   ├── AIPhotoPicker.tsx
│   ├── BedCard.tsx
│   ├── BedMapView.tsx
│   ├── EmptyState.tsx
│   ├── GardenStatsCard.tsx
│   ├── MetricCard.tsx
│   ├── PhotoFilterModal.tsx
│   ├── ProgressBar.tsx
│   ├── TaskListItem.tsx
│   ├── TaskSuggestionModal.tsx
│   ├── TasksGroupedByTimeWindow.tsx
│   └── TaskTimelineView.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
├── navigation/          (7 Navigatoren)
│   ├── GardenStackNavigator.tsx
│   ├── MoreMenuStackNavigator.tsx
│   ├── PlantsStackNavigator.tsx
│   ├── ShoppingStackNavigator.tsx
│   ├── TabNavigator.tsx
│   ├── TaskStackNavigator.tsx
│   └── (weitere)
├── screens/             (38 Screens!)
│   ├── HomeScreen.tsx
│   ├── PlantListScreen.tsx
│   ├── PlantDetailScreen.tsx
│   ├── AddPlantScreen.tsx
│   ├── EditPlantScreen.tsx
│   ├── TaskListScreen.tsx
│   ├── TaskDetailScreen.tsx
│   ├── AddTaskScreen.tsx
│   ├── PhotoGalleryScreen.tsx
│   ├── ShoppingListScreen.tsx
│   ├── GardenOverviewScreen.tsx
│   ├── BedDetailScreen.tsx
│   ├── (und viele weitere...)
├── services/           (18 Services)
│   ├── supabase.ts
│   ├── plantService.ts
│   ├── taskService.ts
│   ├── photoService.ts
│   ├── dashboardService.ts
│   ├── aiService.ts
│   ├── cacheService.ts
│   └── (und mehr...)
├── theme/
│   └── colors.ts
├── types/              (Typ-Definitionen)
│   ├── navigation.ts
│   ├── plant.ts
│   ├── task.ts
│   ├── photo.ts
│   └── (und mehr...)
└── utils/
```

---

*Report generiert: 2026-03-20*
*Gesamtdateien: ~100+ TypeScript/TSX Dateien*
