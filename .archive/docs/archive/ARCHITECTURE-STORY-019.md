# STORY-019: Architecture & Technical Design

**Date**: 2026-03-03
**Component**: ShoppingDashboardScreen
**Pattern**: Feature Module with Stack Navigation

## System Architecture

### Component Hierarchy

```
App
├── NavigationContainer
│   └── TabNavigator
│       ├── HomeScreen
│       ├── PlantsStackNavigator
│       ├── TaskListScreen
│       ├── PhotoGalleryScreen
│       └── MoreMenuStackNavigator (NEW)
│           ├── MoreMenuScreen (modified)
│           └── ShoppingDashboardScreen (NEW)
```

### Data Flow Architecture

```
Supabase
Database
(shopping_items)
    ↑↓
ShoppingItemService
├── fetchShoppingItems()
├── markAsPurchased()
├── markAsNotPurchased()
└── [other CRUD operations]
    ↑↓
ShoppingDashboardScreen
├── State Management
├── Data Grouping
├── UI Rendering
└── User Actions
    ↑↓
User Interface
├── Category Headers
├── Item Cards
├── Buy Buttons
└── Clear Button
```

### Component Interaction Flow

```
┌─────────────────────────────────────────────────────────┐
│                    TabNavigator                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         MoreMenuStackNavigator                   │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  MoreMenuScreen                            │ │  │
│  │  │  ┌──────────────────────────────────────┐ │ │  │
│  │  │  │ User Profile                         │ │ │  │
│  │  │  ├──────────────────────────────────────┤ │ │  │
│  │  │  │ [Einkaufsliste] ──navigate──────────┐│ │ │  │
│  │  │  │ [Garten-Pläne]                      ││ │ │  │
│  │  │  │ [Wissensbank]                       ││ │ │  │
│  │  │  ├──────────────────────────────────────┤│ │ │  │
│  │  │  │ [Abmelden Button]                   ││ │ │  │
│  │  │  └──────────────────────────────────────┘│ │ │  │
│  │  │                                          │ │ │  │
│  │  └──────────────────────────────────────────┘ │ │  │
│  │                        ↓                       │ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │  ShoppingDashboardScreen                   │ │  │
│  │  │  ┌──────────────────────────────────────┐ │ │  │
│  │  │  │ Header: Einkaufsliste              │ │ │  │
│  │  │  ├──────────────────────────────────────┤ │ │  │
│  │  │  │ [SAATGUT] - 3 Artikel - 15,99€      │ │ │  │
│  │  │  │ ┌─────────────────────────────────┐ │ │ │  │
│  │  │  │ │ Tomato Seeds - 3,99€ [Gekauft] │ │ │ │  │
│  │  │  │ │ Cucumber Seeds - 5,99€ [Gekauft]│ │ │ │  │
│  │  │  │ │ Bean Seeds - 6,01€ [Gekauft]    │ │ │ │  │
│  │  │  │ └─────────────────────────────────┘ │ │ │  │
│  │  │  │                                     │ │ │  │
│  │  │  │ [DÜNGER] - 2 Artikel - 45,50€      │ │ │  │
│  │  │  │ ┌─────────────────────────────────┐ │ │ │  │
│  │  │  │ │ Compost 20kg - 24,99€ [Gekauft] │ │ │ │  │
│  │  │  │ │ Liquid Fert. - 20,51€ [Gekauft] │ │ │ │  │
│  │  │  │ └─────────────────────────────────┘ │ │ │  │
│  │  │  │                                     │ │ │  │
│  │  │  │ [More Categories...]               │ │ │  │
│  │  │  ├──────────────────────────────────────┤ │ │  │
│  │  │  │ FOOTER:                            │ │ │  │
│  │  │  │ Gesamt zu kaufen: 120,45€          │ │ │  │
│  │  │  │ 12 Artikel                         │ │ │  │
│  │  │  │ [Gekaufte löschen]                 │ │ │  │
│  │  │  └──────────────────────────────────────┘ │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Data Model

### ShoppingItem (from STORY-017)

```typescript
interface ShoppingItem {
  id: string;                    // Primary key
  item_name: string;             // Display name
  category?: string;             // Category value
  quantity?: string;             // Display quantity
  priority?: string;             // Priority level
  estimated_price?: number;      // Estimated cost
  actual_price?: number;         // Actual cost (set when purchased)
  purchased: boolean;            // Purchase status
  purchased_at?: string;         // Purchase timestamp
  where_to_buy?: string;         // Store/location
  link?: string;                 // Purchase link
  notes?: string;                // User notes
  user_id: string;               // Foreign key to user
  created_at?: string;           // Creation timestamp
  updated_at?: string;           // Update timestamp
}
```

### ShoppingItemsGrouped (new type for dashboard)

```typescript
interface ShoppingItemsGrouped {
  category: string;              // Category code (saatgut, dünger, etc)
  categoryLabel: string;         // Display name (Saatgut, Dünger, etc)
  data: ShoppingItem[];          // Items in this category
  totalQuantity: number;         // Item count in category
  estimatedTotal: number;        // Sum of estimated prices
}
```

### SHOPPING_CATEGORIES (constants)

```typescript
const SHOPPING_CATEGORIES = [
  { label: 'Saatgut', value: 'saatgut' },
  { label: 'Werkzeug', value: 'werkzeug' },
  { label: 'Dünger', value: 'dünger' },
  { label: 'Erde', value: 'erde' },
  { label: 'Töpfe', value: 'töpfe' },
  { label: 'Sonstiges', value: 'sonstiges' },
];
```

## State Management

### Component State

```typescript
// All items fetched from database
items: ShoppingItem[]
├── Used for: Raw data source
├── Updates: On mount and refresh
└── Size: Array of ShoppingItem objects

// Grouped and processed items
groupedItems: ShoppingItemsGrouped[]
├── Used for: Rendering organized categories
├── Updates: When items change
└── Size: Array of grouped categories (max 6)

// UI state flags
loading: boolean
├── Used for: Show/hide loading indicator
└── Updates: During fetch operations

refreshing: boolean
├── Used for: Pull-to-refresh indicator
└── Updates: During manual refresh

// Summary calculations
totalCost: number
├── Used for: Footer total display
├── Updates: When items change
└── Calculation: Sum of all category subtotals

unpurchasedCount: number
├── Used for: Item count in footer
├── Updates: When items change
└── Calculation: Length of items array
```

## State Update Flow

```
Component Mount
    ↓
useFocusEffect Hook
    ↓
loadShoppingItems()
    ├── setLoading(true)
    ├── fetchShoppingItems({ purchased: false })
    ├── setItems(data)
    └── setLoading(false)
    ↓
useEffect Hook (triggered by items change)
    ↓
groupAndCalculateItems(items)
    ├── Initialize grouped object
    ├── Iterate through SHOPPING_CATEGORIES
    ├── Populate groups with items
    ├── Calculate subtotals
    └── setGroupedItems() + setCosts()
    ↓
Component Re-renders with new data
```

## Function Architecture

### Data Fetching Layer

```typescript
loadShoppingItems()
├── Try block:
│   ├── fetchShoppingItems({ purchased: false })
│   │   └── Returns: ShoppingItem[]
│   └── setItems(data)
├── Catch block:
│   └── Alert.alert('Fehler', '...')
└── Finally block:
    └── setLoading(false)
    └── setRefreshing(false)
```

### Data Processing Layer

```typescript
groupAndCalculateItems(items)
├── Initialize grouped: { [key]: ShoppingItem[] }
├── Populate from SHOPPING_CATEGORIES
├── Fill categories with items
├── Calculate totals:
│   ├── estimatedTotal per category
│   └── total for all categories
├── Filter empty categories
└── Update state:
    ├── setGroupedItems()
    ├── setTotalCost()
    └── setUnpurchasedCount()
```

### Action Handlers

```typescript
handleBuyItem(item)
├── markAsPurchased(item.id)
│   └── Updates DB: purchased = true
├── Remove from local state
└── Re-render automatically

handleClearPurchased()
├── Alert.alert() - Get confirmation
├── fetchShoppingItems() - Get all items
├── Filter purchased items
├── Loop: markAsNotPurchased(id) for each
├── loadShoppingItems() - Refresh
└── Alert.alert() - Show success

handleRefresh()
├── setRefreshing(true)
└── loadShoppingItems()
```

### Render Functions

```typescript
renderCategoryHeader(category)
├── Input: ShoppingItemsGrouped
└── Output: Category section header
    ├── Icon (from getCategoryIcon)
    ├── Category name
    ├── Item count
    └── Subtotal in badge

renderShoppingItem(item)
├── Input: ShoppingItem
└── Output: Item card with:
    ├── Item name
    ├── Quantity (if available)
    ├── Location (if available)
    ├── Price
    └── Gekauft button

renderEmptyState()
├── No input
└── Output: Empty state UI
    ├── Shopping cart icon
    ├── "Einkaufsliste ist leer"
    └── Helpful message
```

## Service Integration Points

### ShoppingItemService Methods Used

```
┌──────────────────────┐
│ ShoppingItemService  │
├──────────────────────┤
│                      │
│ fetchShoppingItems() ──→ Load unpurchased items
│    Query: { purchased: false }
│    Returns: ShoppingItem[]
│                      │
│ markAsPurchased()    ──→ Mark single item as bought
│    Input: id, actualPrice?
│    Returns: Updated ShoppingItem
│                      │
│ markAsNotPurchased() ──→ Clear purchased status
│    Input: id
│    Returns: Updated ShoppingItem
│                      │
└──────────────────────┘
```

### Type Imports

```
ShoppingItemTypes
├── ShoppingItem (main type)
├── ShoppingItemFormData (not used here)
└── SHOPPING_CATEGORIES (constants used for grouping)
```

## Error Handling Architecture

```
AsyncOperation
├── Try Block
│   ├── Database call
│   └── State update
├── Catch Block
│   ├── Log to console: console.error()
│   └── Alert to user: Alert.alert('Fehler', 'message')
└── Finally Block
    └── Clean up state flags
```

### Error Scenarios Handled

```
1. Network Error
   └── Alert: "Einkaufsliste konnte nicht geladen werden."

2. Auth Error (User not logged in)
   └── Handled by fetchShoppingItems

3. Database Error
   └── Alert: "Artikel konnte nicht gekauft werden."
   └── Alert: "Gekaufte Artikel konnten nicht entfernt werden."

4. Empty Result Set
   └── Empty state rendered

5. API Timeout
   └── Generic error alert shown
```

## Performance Optimization

### Rendering Optimization

```
1. FlatList Usage
   ├── Virtualizes content
   ├── Only renders visible items
   └── Improves scroll performance

2. Unique Keys
   ├── Each category: unique value
   ├── Each item: unique id
   └── Prevents re-rendering issues

3. Grouped Data Structure
   ├── Pre-grouped before render
   ├── No sorting during render
   └── Faster updates

4. Lazy Filtering
   ├── Empty categories removed
   ├── No unnecessary render
   └── Cleaner UI
```

### Caching Strategy

```
Data Fetching:
├── On mount: Fetch all unpurchased
├── On focus: Refresh (useFocusEffect)
├── Manual: Pull-to-refresh
└── Action: Refresh after buy/clear

Local State:
├── Keep items in state
├── Re-group on change
├── Totals calculated once
└── No re-fetching for calculations
```

## Navigation Architecture

```
TabNavigator
│
├─ Routes defined at bottom tab level
│
└─ More tab
   │
   └─ MoreMenuStackNavigator (Stack Navigator)
      │
      ├─ MoreMenuScreen (first screen, no header icon on stack)
      │  └─ navigation.navigate('ShoppingDashboard')
      │
      └─ ShoppingDashboardScreen (second screen, with back button)
         └─ Back button auto-managed by Stack Navigator
```

### Navigation Parameters

```typescript
// Navigate to dashboard
navigation.navigate('ShoppingDashboard')
├── No parameters needed
└── Data fetched from DB on screen load

// Back navigation
← Back button (auto-provided by Stack Navigator)
└── Returns to MoreMenuScreen
```

## Styling Architecture

### CSS-in-JS Structure

```typescript
const styles = StyleSheet.create({
  // Layout Containers
  container: { flex: 1, ... }
  loadingContainer: { ... }
  listContent: { ... }
  emptyContainer: { ... }

  // Category Section
  categoryHeader: { ... }
  categoryTitleSection: { ... }
  categoryInfo: { ... }
  categoryPrice: { ... }

  // Item Cards
  shoppingItemContainer: { ... }
  shoppingItemContent: { ... }
  itemInfo: { ... }
  itemName: { ... }
  itemMeta: { ... }
  itemLocation: { ... }
  itemPrice: { ... }
  itemPriceUnset: { ... }

  // Actions
  buyButton: { ... }
  buyButtonText: { ... }
  clearButton: { ... }
  clearButtonText: { ... }

  // Footer
  summaryFooter: { ... }
  summaryContent: { ... }
  summaryLabel: { ... }
  summaryTotal: { ... }
  summaryStats: { ... }
  summaryCount: { ... }

  // Empty State
  emptyTitle: { ... }
  emptyText: { ... }

  // Loading
  loadingText: { ... }
});
```

### Color Scheme

```
Primary Colors:
├── Colors.primary (#4CAF50)
│  └── Category headers, prices, check icon
├── Colors.primaryLight (#81C784)
│  └── Accent elements
└── Colors.primaryDark (#388E3C)
   └── Hover states (if needed)

Neutral Colors:
├── Colors.surface (#FFFFFF)
│  └── Card backgrounds
├── Colors.background (#FAFAFA)
│  └── Screen background
├── Colors.text (#424242)
│  └── Primary text
├── Colors.textLight (#757575)
│  └── Secondary text
└── Colors.border / divider
   └── Separators

Status Colors:
├── Colors.error (#F44336)
│  └── Clear button
└── Colors.success (#4CAF50)
   └── Check icon (same as primary)
```

## Testing Architecture

```
Unit Tests (potential)
├── groupAndCalculateItems()
│  └── Test with various item sets
├── Cost calculation logic
│  └── Verify math accuracy
└── Icon mapping
   └── Verify all categories have icons

Integration Tests (potential)
├── Navigation flow
├── Data fetch and display
├── Purchase action end-to-end
└── Clear action end-to-end

Manual Tests (documented in QUICK-START)
├── Dashboard display
├── Category grouping
├── Purchase functionality
├── Clear functionality
└── Navigation
```

## Dependency Graph

```
ShoppingDashboardScreen
├── Dependencies:
│  ├── React (hooks, components)
│  ├── React Native (UI components)
│  ├── @react-navigation/native (useFocusEffect)
│  ├── @expo/vector-icons (MaterialIcons)
│  ├── ../theme/colors (Colors theme)
│  ├── ../types/shopping_item (ShoppingItem, SHOPPING_CATEGORIES)
│  └── ../services/shoppingService (API functions)
│
├── Dependents:
│  ├── MoreMenuStackNavigator (imports and uses)
│  └── TabNavigator (indirectly through navigator)
│
└── Data Flow:
   ├── From: Supabase (via shoppingService)
   └── To: UI rendering

MoreMenuStackNavigator
├── Dependencies:
│  ├── React
│  ├── @react-navigation/native-stack
│  ├── ../theme/colors
│  ├── MoreMenuScreen
│  └── ShoppingDashboardScreen
│
├── Dependents:
│  └── TabNavigator
│
└── Purpose: Manage navigation between More menu items

TabNavigator
├── Dependencies:
│  ├── MoreMenuStackNavigator (instead of direct MoreMenuScreen)
│  ├── Other navigators/screens
│  └── Theme colors
│
└── Dependents:
   └── App.tsx (main entry point)
```

## Security Considerations

```
1. Authentication
   └── Handled by Supabase auth
   └── User ID automatically included in queries

2. Database Access
   └── Row-level security (RLS) enforced
   └── Only user's items returned

3. Data Validation
   └── ShoppingItem type safety
   └── No user input without validation

4. Error Messages
   └── Generic messages to users
   └── Detailed logs for debugging

5. No Sensitive Data
   └── No passwords stored locally
   └── No API keys exposed
   └── No user data logged
```

## Scalability

```
Current Design Supports:
├── Up to 100 items per view (before UI lag)
├── 6 fixed categories
├── Supabase backend scaling
└── Efficient re-rendering

Scaling Considerations:
├── 500+ items: Would need pagination
├── Custom categories: Database schema change needed
├── Real-time sync: Would need Supabase realtime listeners
└── Offline support: Would need AsyncStorage caching
```

## Future Architecture Enhancements

```
Potential Module Additions:
├── SearchFilter Module
│  ├── Search input
│  └── Filter logic
├── SortModule
│  ├── Sort options
│  └── Sort state
├── BulkActions Module
│  ├── Select multiple
│  └── Batch operations
└── HistoryModule
   ├── Archive items
   └── Historical view
```

---

**Document Status**: Complete
**Last Updated**: 2026-03-03
**Architecture Version**: 1.0
