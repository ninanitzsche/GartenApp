# STORY-002: Code Reference & Implementation Details

## Quick Reference Guide

### State Variables
```typescript
// Search state
const [searchQuery, setSearchQuery] = useState<string>('');

// Multi-select filter states
const [filterStatusList, setFilterStatusList] = useState<string[]>([]);
const [filterLocationList, setFilterLocationList] = useState<string[]>([]);

// Single select states
const [filterType, setFilterType] = useState<string | undefined>();
const [filterEssbar, setFilterEssbar] = useState(boolean);

// Supporting states
const [locations, setLocations] = useState<string[]>([]);
const searchDebounceRef = useRef<NodeJS.Timeout>();
```

### Handler Functions

#### Search Handler
```typescript
const handleSearchChange = (text: string) => {
  setSearchQuery(text);
  // Debounce the search (300ms debounce infrastructure ready)
  if (searchDebounceRef.current) {
    clearTimeout(searchDebounceRef.current);
  }
};
```

#### Multi-Select Handlers
```typescript
const handleStatusFilterToggle = (status: string) => {
  setFilterStatusList(prev =>
    prev.includes(status)
      ? prev.filter(s => s !== status)  // Remove if exists
      : [...prev, status]                // Add if not exists
  );
};

const handleLocationFilterToggle = (location: string) => {
  setFilterLocationList(prev =>
    prev.includes(location)
      ? prev.filter(l => l !== location)
      : [...prev, location]
  );
};
```

#### Single-Select Handler
```typescript
const handleTypeFilterChange = (type: string) => {
  // Toggle: select if not selected, deselect if already selected
  setFilterType(filterType === type ? undefined : type);
};
```

#### Toggle Handler
```typescript
// For Essbar filter - used directly in JSX
onPress={() => setFilterEssbar(!filterEssbar)}
```

#### Clear All Handler
```typescript
const clearAllFilters = () => {
  setSearchQuery('');
  setFilterStatusList([]);
  setFilterLocationList([]);
  setFilterType(undefined);
  setFilterEssbar(false);
};
```

### Computed Values
```typescript
// Check if any filter is active
const hasActiveFilters =
  searchQuery ||
  filterStatusList.length > 0 ||
  filterLocationList.length > 0 ||
  filterType ||
  filterEssbar;

// Count total active filters (for badge)
const filterCount =
  (searchQuery ? 1 : 0) +
  filterStatusList.length +
  filterLocationList.length +
  (filterType ? 1 : 0) +
  (filterEssbar ? 1 : 0);
```

## UI Component Code Snippets

### Search Container
```typescript
<View style={styles.searchContainer}>
  <MaterialIcons
    name="search"
    size={20}
    color={Colors.textLight}
    style={styles.searchIcon}
  />
  <TextInput
    style={styles.searchInput}
    placeholder="Pflanze suchen..."
    placeholderTextColor={Colors.textDisabled}
    value={searchQuery}
    onChangeText={handleSearchChange}
  />
  {searchQuery ? (
    <TouchableOpacity onPress={() => setSearchQuery('')}>
      <MaterialIcons name="close" size={20} color={Colors.textLight} />
    </TouchableOpacity>
  ) : null}
</View>
```

### Status Filter Chips (Primary Row)
```typescript
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={styles.filterChipsContainer}
  contentContainerStyle={styles.filterChipsContent}
>
  {PLANT_STATUSES.map(status => (
    <TouchableOpacity
      key={status.value}
      style={[
        styles.filterChip,
        filterStatusList.includes(status.value) && styles.filterChipActive,
      ]}
      onPress={() => handleStatusFilterToggle(status.value)}
    >
      <Text
        style={[
          styles.filterChipText,
          filterStatusList.includes(status.value) && styles.filterChipTextActive,
        ]}
      >
        {status.label}
      </Text>
    </TouchableOpacity>
  ))}
</ScrollView>
```

### Location Filter Chips (Secondary Row - Excerpt)
```typescript
{locations.map(location => (
  <TouchableOpacity
    key={location}
    style={[
      styles.filterChip,
      styles.locationChip,
      filterLocationList.includes(location) && styles.filterChipActive,
    ]}
    onPress={() => handleLocationFilterToggle(location)}
  >
    <MaterialIcons
      name="place"
      size={14}
      color={filterLocationList.includes(location) ? '#fff' : Colors.textLight}
      style={styles.chipIcon}
    />
    <Text
      style={[
        styles.filterChipText,
        filterLocationList.includes(location) && styles.filterChipTextActive,
      ]}
    >
      {location}
    </Text>
  </TouchableOpacity>
))}
```

### Type Filter Chips (Secondary Row - Excerpt)
```typescript
{PLANT_TYPES.map(type => (
  <TouchableOpacity
    key={type.value}
    style={[
      styles.filterChip,
      styles.typeChip,
      filterType === type.value && styles.filterChipActive,
    ]}
    onPress={() => handleTypeFilterChange(type.value)}
  >
    <Text
      style={[
        styles.filterChipText,
        filterType === type.value && styles.filterChipTextActive,
      ]}
    >
      {type.label}
    </Text>
  </TouchableOpacity>
))}
```

### Essbar Toggle (Secondary Row - Excerpt)
```typescript
<TouchableOpacity
  style={[styles.filterChip, filterEssbar && styles.filterChipActive]}
  onPress={() => setFilterEssbar(!filterEssbar)}
>
  <MaterialIcons
    name="restaurant"
    size={14}
    color={filterEssbar ? '#fff' : Colors.textLight}
    style={styles.chipIcon}
  />
  <Text
    style={[
      styles.filterChipText,
      filterEssbar && styles.filterChipTextActive,
    ]}
  >
    Essbar
  </Text>
</TouchableOpacity>
```

### Active Filters Summary Bar
```typescript
{hasActiveFilters && (
  <View style={styles.activeSummaryContainer}>
    <View style={styles.activeSummaryContent}>
      <View style={styles.filterBadge}>
        <Text style={styles.filterBadgeText}>{filterCount}</Text>
      </View>
      <Text style={styles.activeSummaryText}>Filter aktiv</Text>
    </View>
    <TouchableOpacity
      style={styles.clearButton}
      onPress={clearAllFilters}
    >
      <MaterialIcons name="clear-all" size={18} color={Colors.primary} />
      <Text style={styles.clearButtonText}>Löschen</Text>
    </TouchableOpacity>
  </View>
)}
```

## Service Layer Code

### PlantFilters Interface
```typescript
export interface PlantFilters {
  searchQuery?: string;      // For substring search
  statuses?: string[];       // For multi-select status
  status?: string;           // Fallback for single status
  locations?: string[];      // For multi-select location
  location?: string;         // Fallback for single location
  type?: string;             // For single type
  essbar?: boolean;          // For essbar toggle
}
```

### fetchPlants Function with Filters
```typescript
export async function fetchPlants(filters?: PlantFilters): Promise<Plant[]> {
  let query = supabase
    .from('plants')
    .select('*');

  // Apply search filter (substring match, case-insensitive)
  if (filters?.searchQuery) {
    query = query.or(
      `name.ilike.%${filters.searchQuery}%,latin_name.ilike.%${filters.searchQuery}%`
    );
  }

  // Apply multiple statuses filter (OR logic)
  if (filters?.statuses && filters.statuses.length > 0) {
    query = query.in('status', filters.statuses);
  } else if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  // Apply multiple locations filter (OR logic)
  if (filters?.locations && filters.locations.length > 0) {
    query = query.in('location', filters.locations);
  } else if (filters?.location) {
    query = query.eq('location', filters.location);
  }

  // Apply type filter
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  // Apply essbar filter
  if (filters?.essbar === true) {
    query = query.eq('essbar', true);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching plants:', error);
    throw error;
  }

  return data || [];
}
```

### loadPlants Function
```typescript
const loadPlants = async () => {
  try {
    const filters: PlantFilters = {
      searchQuery: searchQuery || undefined,
      statuses: filterStatusList.length > 0 ? filterStatusList : undefined,
      locations: filterLocationList.length > 0 ? filterLocationList : undefined,
      type: filterType,
      essbar: filterEssbar || undefined,
    };
    const data = await fetchPlants(filters);
    setPlants(data);
  } catch (error) {
    console.error('Error loading plants:', error);
    Alert.alert('Fehler', 'Pflanzen konnten nicht geladen werden.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
```

## StyleSheet Reference

### Search Container Styles
```typescript
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.surface,
  borderRadius: 12,
  marginHorizontal: 16,
  marginTop: 12,
  marginBottom: 8,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: Colors.border,
},
searchIcon: {
  marginRight: 8,
},
searchInput: {
  flex: 1,
  paddingVertical: 10,
  fontSize: 16,
  color: Colors.text,
},
```

### Filter Chip Styles
```typescript
filterChip: {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: Colors.border,
  backgroundColor: Colors.surface,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},
filterChipActive: {
  backgroundColor: Colors.primary,
  borderColor: Colors.primary,
},
filterChipText: {
  fontSize: 13,
  color: Colors.text,
  fontWeight: '500',
},
filterChipTextActive: {
  color: '#fff',
},
chipIcon: {
  marginRight: 2,
},
```

### Active Summary Bar Styles
```typescript
activeSummaryContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginHorizontal: 16,
  marginBottom: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: Colors.primaryLight,
  borderRadius: 8,
},
activeSummaryContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
filterBadge: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: Colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
},
filterBadgeText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 12,
},
activeSummaryText: {
  color: Colors.text,
  fontWeight: '600',
  fontSize: 14,
},
clearButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
},
clearButtonText: {
  color: Colors.primary,
  fontWeight: '600',
  fontSize: 13,
},
```

## useEffect Hook
```typescript
useEffect(() => {
  loadPlants();
}, [searchQuery, filterStatusList, filterLocationList, filterType, filterEssbar]);
```

This effect dependency array ensures loadPlants() is called whenever any filter changes.

## Dynamic Empty State
```typescript
const renderEmptyState = () => (
  <View style={styles.emptyContainer}>
    <MaterialIcons name="eco" size={80} color={Colors.border} />
    <Text style={styles.emptyTitle}>
      {hasActiveFilters ? 'Keine Pflanzen gefunden' : 'Noch keine Pflanzen'}
    </Text>
    <Text style={styles.emptyText}>
      {hasActiveFilters
        ? 'Passen Sie Ihre Filter an, um weitere Pflanzen zu finden.'
        : 'Fügen Sie Ihre erste Pflanze hinzu, um Ihr Garten-Inventar zu verwalten.'}
    </Text>
    <TouchableOpacity style={styles.emptyButton} onPress={handleAddPlant}>
      <MaterialIcons name="add" size={24} color="#fff" />
      <Text style={styles.emptyButtonText}>Pflanze hinzufügen</Text>
    </TouchableOpacity>
  </View>
);
```

## Constants Used

### Plant Statuses (from types/plant.ts)
```typescript
export const PLANT_STATUSES = [
  { label: 'Etabliert', value: 'etabliert' },
  { label: 'Geplant', value: 'geplant' },
  { label: 'Bestellt', value: 'bestellt' },
  { label: 'Gepflanzt', value: 'gepflanzt' },
  { label: 'Geerntet', value: 'geerntet' },
  { label: 'Entfernt', value: 'entfernt' },
];
```

### Plant Types (from types/plant.ts)
```typescript
export const PLANT_TYPES = [
  { label: 'Einjährig', value: 'einjährig' },
  { label: 'Mehrjährig', value: 'mehrjährig' },
  { label: 'Staude', value: 'staude' },
  { label: 'Strauch', value: 'strauch' },
  { label: 'Baum', value: 'baum' },
];
```

## Colors Used (from theme/colors.ts)
```typescript
Colors.primary       = '#4CAF50'  // Active chips background
Colors.primaryLight  = '#81C784'  // Summary bar background
Colors.surface       = '#FFFFFF'  // Chip inactive background
Colors.border        = '#E0E0E0'  // Chip border
Colors.text          = '#424242'  // Text
Colors.textLight     = '#757575'  // Secondary text
Colors.textDisabled  = '#BDBDBD'  // Disabled/placeholder text
```

## Data Flow Example

### User Selects Status Filter
```
User taps "Etabliert" chip
    ↓
onPress={() => handleStatusFilterToggle('etabliert')}
    ↓
setFilterStatusList(prev => [...prev, 'etabliert'])
    ↓
State updated: filterStatusList = ['etabliert']
    ↓
useEffect triggers (filterStatusList in deps)
    ↓
loadPlants() called
    ↓
PlantFilters created: { statuses: ['etabliert'] }
    ↓
fetchPlants(filters) in plantService
    ↓
Supabase query: .in('status', ['etabliert'])
    ↓
Database returns only 'etabliert' plants
    ↓
setPlants(data) updates UI
    ↓
FlatList re-renders with filtered results
```

## Integration Points

1. **Uses getUniqueLocations()**: Called on screen focus to populate location chips
2. **Uses PLANT_STATUSES**: Imported from types/plant.ts
3. **Uses PLANT_TYPES**: Imported from types/plant.ts
4. **Uses Colors**: Imported from theme/colors.ts
5. **Uses Plant interface**: For type safety
6. **Uses PlantFilters interface**: For type-safe filter passing

All integration points are with existing code, no new dependencies added.
