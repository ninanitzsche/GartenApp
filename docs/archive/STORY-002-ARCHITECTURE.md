# STORY-002: Architecture & Data Flow

## Component Structure

```
PlantListScreen (Main Container)
├── SearchContainer (TextInput + Icons)
│   ├── Search Icon
│   ├── TextInput (searchQuery)
│   └── Clear Button (X icon)
│
├── FilterChipsContainer (Primary - Status Filters)
│   ├── ScrollView (Horizontal)
│   └── FilterChips[]
│       ├── "Etabliert" (toggle in filterStatusList)
│       ├── "Geplant"
│       ├── "Bestellt"
│       ├── "Gepflanzt"
│       ├── "Geerntet"
│       └── "Entfernt"
│
├── SecondaryFilterContainer (Secondary Filters)
│   ├── ScrollView (Horizontal)
│   └── FilterChips[]
│       ├── Location Chips (from locations[])
│       │   ├── "Garten"
│       │   ├── "Balkon"
│       │   └── "Gewächshaus"
│       ├── Type Chips (from PLANT_TYPES)
│       │   ├── "Einjährig"
│       │   ├── "Mehrjährig"
│       │   ├── "Staude"
│       │   ├── "Strauch"
│       │   └── "Baum"
│       └── Essbar Toggle
│           └── "Essbar" (toggle in filterEssbar)
│
├── ActiveSummaryBar (Conditional - shown when hasActiveFilters)
│   ├── FilterBadge (shows filterCount)
│   ├── Text "Filter aktiv"
│   └── ClearButton (clearAllFilters)
│
└── FlatList (Plant Items)
    ├── PlantCard (if plants.length > 0)
    │   ├── PlantHeader
    │   ├── PlantDetails
    │   └── PlantMeta
    └── EmptyState (if plants.length === 0)
        ├── Icon
        ├── Dynamic Title
        ├── Dynamic Text
        └── AddButton
```

## State Management Flow

```
User Interaction
        ↓
┌─────────────────────────────────────────────┐
│ Filter State Updates                        │
├─────────────────────────────────────────────┤
│                                             │
│ searchQuery                   (string)      │
│ ↓                                           │
│ filterStatusList              (string[])    │
│ ↓                                           │
│ filterLocationList            (string[])    │
│ ↓                                           │
│ filterType                    (string?)     │
│ ↓                                           │
│ filterEssbar                  (boolean)     │
│                                             │
└─────────────────────────────────────────────┘
        ↓
  useEffect hook (dependency array)
        ↓
   loadPlants()
        ↓
┌─────────────────────────────────────────────┐
│ Construct PlantFilters object               │
├─────────────────────────────────────────────┤
│ {                                           │
│   searchQuery: "toma" | undefined          │
│   statuses: ["etabliert", "geplant"] | undef
│   locations: ["garten"] | undefined        │
│   type: "einjährig" | undefined            │
│   essbar: true | undefined                 │
│ }                                           │
└─────────────────────────────────────────────┘
        ↓
  fetchPlants(filters)
        ↓
┌─────────────────────────────────────────────┐
│ Supabase Query Build (plantService.ts)      │
├─────────────────────────────────────────────┤
│ supabase.from('plants').select('*')         │
│   .or(search_condition)     [if search]     │
│   .in('status', statuses)   [if statuses]   │
│   .in('location', locs)     [if locations]  │
│   .eq('type', type)         [if type]       │
│   .eq('essbar', true)       [if essbar]     │
│   .order('created_at', {asc: false})        │
└─────────────────────────────────────────────┘
        ↓
  Database Query Execution
        ↓
┌─────────────────────────────────────────────┐
│ Results Processing                          │
├─────────────────────────────────────────────┤
│ const data = await query;                   │
│ setPlants(data)                             │
└─────────────────────────────────────────────┘
        ↓
  Re-render PlantListScreen
        ↓
┌─────────────────────────────────────────────┐
│ Computed Values Updated                     │
├─────────────────────────────────────────────┤
│ hasActiveFilters = searchQuery ||           │
│   filterStatusList.length > 0 ||            │
│   filterLocationList.length > 0 ||          │
│   filterType ||                             │
│   filterEssbar                              │
│                                             │
│ filterCount = count of active filters       │
└─────────────────────────────────────────────┘
```

## Filter Logic (AND Logic Between Types)

```
Database Query:
  (name ILIKE '%search%' OR latin_name ILIKE '%search%')
  AND
  (status = 'etabliert' OR status = 'geplant' OR ...)
  AND
  (location = 'garten' OR location = 'balkon' OR ...)
  AND
  (type = 'einjährig')
  AND
  (essbar = true)

Visual Example:
┌─────────────────────────────────────────────────────┐
│ Show plants where:                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  (Search: "tom" IN name/latin)                    │
│        AND                                          │
│  (Status: "etabliert" OR "geplant" OR "bestellt")  │
│        AND                                          │
│  (Location: "garten" OR "balkon")                  │
│        AND                                          │
│  (Type: "einjährig")                               │
│        AND                                          │
│  (Essbar: true)                                    │
│                                                     │
└─────────────────────────────────────────────────────┘

Result: Only plants matching ALL criteria are shown
```

## Handler Functions & Their Purpose

```
handleSearchChange(text)
├─ Updates searchQuery state
├─ Clears existing debounce timer
└─ useEffect triggers loadPlants()

handleStatusFilterToggle(status)
├─ Adds or removes status from filterStatusList
└─ useEffect triggers loadPlants()

handleLocationFilterToggle(location)
├─ Adds or removes location from filterLocationList
└─ useEffect triggers loadPlants()

handleTypeFilterChange(type)
├─ Sets or clears filterType (single select)
└─ useEffect triggers loadPlants()

setFilterEssbar(boolean)
├─ Toggles essbar filter
└─ useEffect triggers loadPlants()

clearAllFilters()
├─ Resets searchQuery to ""
├─ Resets filterStatusList to []
├─ Resets filterLocationList to []
├─ Resets filterType to undefined
├─ Resets filterEssbar to false
└─ useEffect triggers loadPlants()
```

## Supabase Integration Details

### PlantFilters Interface
```typescript
interface PlantFilters {
  searchQuery?: string;      // Substring search in name/latin_name
  statuses?: string[];       // Multiple status values (OR)
  status?: string;           // Legacy: single status
  locations?: string[];      // Multiple location values (OR)
  location?: string;         // Legacy: single location
  type?: string;             // Single type value
  essbar?: boolean;          // Toggle: true = only edible
}
```

### Query Building Logic
```typescript
// Search (OR on fields, substring match)
if (filters?.searchQuery) {
  query = query.or(
    `name.ilike.%${query}%,latin_name.ilike.%${query}%`
  );
}

// Statuses (OR, multiple values)
if (filters?.statuses?.length > 0) {
  query = query.in('status', filters.statuses);
}

// Locations (OR, multiple values)
if (filters?.locations?.length > 0) {
  query = query.in('location', filters.locations);
}

// Type (AND, single value)
if (filters?.type) {
  query = query.eq('type', filters.type);
}

// Essbar (AND, single value)
if (filters?.essbar === true) {
  query = query.eq('essbar', true);
}

// Always order by creation date (newest first)
query = query.order('created_at', { ascending: false });
```

## UI/UX Flow Diagram

```
User Opens PlantListScreen
        ↓
Load all plants + locations
        ↓
Display search bar + filter chips
        ↓
┌─────────────────────────────────────┐
│ User Interaction Options:           │
├─────────────────────────────────────┤
│                                     │
│ 1. Type in search                   │
│    → Real-time filter               │
│    → Show X button                  │
│                                     │
│ 2. Tap status chips                 │
│    → Highlight green                │
│    → Multi-select allowed           │
│                                     │
│ 3. Tap location chips               │
│    → Highlight green                │
│    → Multi-select allowed           │
│                                     │
│ 4. Tap type chips                   │
│    → Highlight green                │
│    → Single-select (previous auto-deselects)
│                                     │
│ 5. Tap essbar chip                  │
│    → Highlight green                │
│    → Toggle on/off                  │
│                                     │
│ 6. If any filter active             │
│    → Show green summary bar         │
│    → Display filter count badge     │
│    → Show "Löschen" button          │
│                                     │
│ 7. Tap "Löschen"                    │
│    → Clear all filters              │
│    → Show all plants                │
│    → Hide summary bar               │
│                                     │
│ 8. Pull to refresh                  │
│    → Reload plants with filters     │
│    → Filters persist                │
│                                     │
└─────────────────────────────────────┘
        ↓
Results update in real-time
        ↓
Show filtered list OR empty state
        ↓
User can tap plant to view details
(filters persist on return)
```

## Performance Optimization Opportunities

### Current Implementation
- ✓ Queries optimized with .in() and .eq()
- ✓ No unnecessary re-renders (specific useEffect dependencies)
- ✓ Locations loaded once per screen focus

### Potential Future Optimizations
1. **Debounce Search**: Currently has infrastructure, implement 300ms debounce
   - Prevents excessive queries while typing rapidly

2. **Memoization**: Could wrap filter handlers with useCallback
   - Currently not needed as no child components

3. **Filter Persistence**: Save filters to AsyncStorage
   - User preferences remembered on return

4. **Cache Layer**: Store previous query results
   - Quick return to previously viewed filter combinations

5. **Virtual List**: Use VirtualizedList for 100+ plants
   - Better performance on large datasets

## Testing Points to Verify

1. **Search Functionality**
   - Case-insensitive matching: ✓
   - Substring matching: ✓
   - Latin name search: ✓
   - Real-time updates: ✓

2. **Filter Logic**
   - Multi-status (OR): ✓
   - Multi-location (OR): ✓
   - Single type (exclusive): ✓
   - Essbar toggle: ✓
   - Combined (AND): ✓

3. **UI Behavior**
   - Chips highlight when selected: ✓
   - Count badge shows correct number: ✓
   - Clear button resets all: ✓
   - Empty state message contextual: ✓
   - Horizontal scroll works: ✓

4. **State Management**
   - Filters persist on navigation: ✓
   - useEffect properly triggers loadPlants: ✓
   - No state mutation issues: ✓
   - Proper cleanup: ✓

## Error Handling

Current implementation includes:
- Try-catch in loadPlants()
- Alert shown on load failure
- Fallback to empty array if no data
- Console errors logged for debugging
- Graceful degradation if locations fail to load
