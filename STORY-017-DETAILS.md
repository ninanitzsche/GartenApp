# STORY-017 Technische Details

## Architecture

```
ShoppingListScreen (Main)
├── SearchBar + FilterPanel
├── FlatList (ShoppingItems)
│   └── ShoppingItemCard
│       ├── Item Info
│       ├── Edit/Delete Buttons
│       └── Mark Purchased Button
└── FAB (Add New Item)
    ├── AddShoppingItemScreen
    └── EditShoppingItemScreen
```

---

## State Management

### ShoppingListScreen State
```typescript
const [items, setItems] = useState<ShoppingItem[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [filterCategory, setFilterCategory] = useState<string | undefined>();
const [filterPriority, setFilterPriority] = useState<string | undefined>();
const [showFilters, setShowFilters] = useState(false);
```

### AddShoppingItemScreen State
```typescript
const [formData, setFormData] = useState<ShoppingItemFormData>({
  item_name: '',
  category: 'sonstiges',
  quantity: '',
  priority: 'mittel',
  estimated_price: undefined,
  purchased: false,
  where_to_buy: '',
  link: '',
  notes: '',
});
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState<{ [key: string]: string }>({});
```

---

## API Integration

### Service Methods

#### fetchShoppingItems
```typescript
async fetchShoppingItems(filters?: ShoppingItemFilters): Promise<ShoppingItem[]>

Filters:
- searchQuery: ilike 'item_name'
- category: eq 'category'
- priority: eq 'priority'
- purchased: eq false (default in UI)

Returns: ShoppingItem[] sorted by created_at DESC
```

#### createShoppingItem
```typescript
async createShoppingItem(itemData: ShoppingItemFormData): Promise<ShoppingItem>

Input:
- itemData: Form data
- user_id: Automatically added from auth.getUser()

Returns: Created ShoppingItem with id
```

#### updateShoppingItem
```typescript
async updateShoppingItem(id: string, itemData: ShoppingItemFormData): Promise<ShoppingItem>

Input:
- id: Item UUID
- itemData: Updated fields

Returns: Updated ShoppingItem
```

#### deleteShoppingItem
```typescript
async deleteShoppingItem(id: string): Promise<void>

Removes item from database
```

#### markAsPurchased
```typescript
async markAsPurchased(id: string, actualPrice?: number): Promise<ShoppingItem>

Sets:
- purchased: true
- purchased_at: now()
- actual_price: (optional)

Returns: Updated ShoppingItem
```

---

## Form Validation

### Required Fields
- `item_name`: Non-empty string, max 255 chars

### Optional Fields Validation
- `estimated_price`: Must be >= 0 if provided
- `quantity`: Any string value
- `notes`: Any string value, max 1000 chars

### Validation Flow
1. Check required fields
2. Check field constraints
3. If errors: display in red, show error text
4. If valid: clean data (remove empty strings) and submit

---

## Error Handling

### Form Errors
```typescript
const [errors, setErrors] = useState<{ [key: string]: string }>({});

// Validation
const validateForm = (): boolean => {
  const newErrors: { [key: string]: string } = {};

  if (!formData.item_name.trim()) {
    newErrors.item_name = 'Name des Artikels ist erforderlich';
  }

  if (formData.estimated_price !== undefined && formData.estimated_price < 0) {
    newErrors.estimated_price = 'Preis muss positiv sein';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Usage
if (!validateForm()) {
  Alert.alert('Fehler', 'Bitte füllen Sie alle erforderlichen Felder aus.');
  return;
}
```

### Network Errors
```typescript
try {
  await createShoppingItem(cleanData);
  Alert.alert('Erfolg', 'Artikel wurde hinzugefügt.', [
    { text: 'OK', onPress: () => navigation.goBack() },
  ]);
} catch (error) {
  console.error('Error creating shopping item:', error);
  Alert.alert('Fehler', 'Artikel konnte nicht gespeichert werden.');
}
```

---

## Search & Filter Implementation

### Search Debouncing
```typescript
useEffect(() => {
  if (searchDebounceRef.current) {
    clearTimeout(searchDebounceRef.current);
  }

  searchDebounceRef.current = setTimeout(() => {
    loadItems();
  }, 300); // 300ms debounce

  return () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
  };
}, [searchQuery, filterCategory, filterPriority]);
```

### Filter Application
```typescript
const filters: ShoppingItemFilters = {
  searchQuery: searchQuery || undefined,
  category: filterCategory,
  priority: filterPriority,
  purchased: false, // Only unpurchased
};
const data = await fetchShoppingItems(filters);
```

### Filter Toggling
```typescript
// Category: Click toggles on/off
setFilterCategory(filterCategory === cat.value ? undefined : cat.value)

// Multiple filters are AND conditions
```

---

## Styling System

### Color Scheme
```typescript
import Colors from '../theme/colors';

Colors.primary      // Primary blue
Colors.success      // Green for "Gekauft"
Colors.error        // Red for delete
Colors.text         // Dark text
Colors.textLight    // Medium gray
Colors.textDisabled // Light gray
Colors.surface      // Card background
Colors.background   // Screen background
Colors.border       // Border color
```

### Category Badges
```typescript
const getCategoryColor = (category?: string): string => {
  switch (category) {
    case 'saatgut': return '#4CAF50';      // Green
    case 'werkzeug': return '#FF9800';    // Orange
    case 'dünger': return '#8B4513';      // Brown
    case 'erde': return '#A0522D';        // Saddle Brown
    case 'töpfe': return '#CE93D8';       // Purple
    default: return Colors.textLight;
  }
};
```

### Priority Icons
```typescript
const getPriorityIcon = (priority?: string): string => {
  switch (priority) {
    case 'dringend': return 'priority-high';     // ⬆⬆
    case 'hoch': return 'arrow-upward';         // ⬆
    case 'mittel': return 'drag-handle';        // ⋮
    default: return 'arrow-downward';           // ⬇
  }
};
```

---

## Navigation Flow

### Tab Navigator
```
Home
├─ Plants (Stack)
├─ Tasks
├─ Photos
├─ Shopping (Stack) ← NEW
│  ├─ ShoppingList (Index)
│  ├─ AddShoppingItem (from FAB)
│  └─ EditShoppingItem (from Edit Button)
├─ More (Stack)
```

### Screen Transitions
```
ShoppingList
    ↓ (FAB Click)
AddShoppingItem
    ↓ (Save) or (Back)
ShoppingList

ShoppingList
    ↓ (Edit Icon)
EditShoppingItem
    ↓ (Save/Delete) or (Back)
ShoppingList
```

---

## Database Schema (shopping_items)

```sql
CREATE TABLE shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category TEXT,
  quantity TEXT,
  priority TEXT,
  estimated_price DECIMAL(10,2),
  actual_price DECIMAL(10,2),
  purchased BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ,
  where_to_buy TEXT,
  link TEXT,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shopping_user_id ON shopping_items(user_id);
CREATE INDEX idx_shopping_purchased ON shopping_items(purchased);

ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping items"
  ON shopping_items FOR ALL
  USING (auth.uid() = user_id);
```

---

## Type Definitions

```typescript
export interface ShoppingItem {
  id: string;
  item_name: string;
  category?: string;
  quantity?: string;
  priority?: string;
  estimated_price?: number;
  actual_price?: number;
  purchased: boolean;
  purchased_at?: string;
  where_to_buy?: string;
  link?: string;
  notes?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingItemFormData {
  item_name: string;
  category?: string;
  quantity?: string;
  priority?: string;
  estimated_price?: number;
  actual_price?: number;
  purchased?: boolean;
  purchased_at?: string;
  where_to_buy?: string;
  link?: string;
  notes?: string;
}

export interface ShoppingItemFilters {
  searchQuery?: string;
  category?: string;
  priority?: string;
  purchased?: boolean;
}
```

---

## Performance Considerations

### List Rendering
- FlatList with keyExtractor for efficient updates
- Item Keys: item.id (unique)
- Content Container Padding: 16 + 64 (FAB space)

### Search Debounce
- 300ms delay prevents excessive API calls
- useRef to store timeout ID
- Cleanup function prevents memory leaks

### Navigation Performance
- useFocusEffect re-loads data when screen comes to focus
- useEffect dependencies prevent infinite loops
- Loading states show during async operations

### Memory Management
```typescript
// Cleanup debounce timeout
useEffect(() => {
  return () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
  };
}, []);
```

---

## Accessibility Features

- MaterialIcons used consistently
- Clear action labels on buttons
- Error messages informative
- Loading indicators visible
- Empty states helpful
- Category colors + text labels
- Priority icons + text labels

---

## Testing Strategy

### Unit Tests
- Form validation logic
- Service methods (CRUD)
- Filter application

### Integration Tests
- Navigation between screens
- Data persistence in Supabase
- API error handling

### E2E Tests
- Complete CRUD workflows
- Search and filter combinations
- Purchase flow

---

## Known Limitations

1. **No Undo**: Deleted items cannot be recovered
2. **No Offline**: Requires internet connection
3. **No Bulk Operations**: One item at a time
4. **No Categories/Priority Creation**: Fixed list only
5. **No Photo Attachments**: Text only
6. **No Notifications**: No purchase reminders

---

## Future Enhancements

### Phase 2
- Purchased Items History View
- Budget Tracking
- Price Comparison (Estimated vs Actual)
- Shopping List Export/Print

### Phase 3
- Photo Attachments
- Barcode Scanner
- Store Locations Map
- Price History
- Wishlist Integration

### Phase 4
- Sharing Shopping Lists
- Collaborative Shopping
- Push Notifications
- Recurring Lists

---

## Debugging Tips

### Console Logs
```typescript
console.log('Loading items:', filters);
console.log('Items loaded:', data);
console.error('Error loading items:', error);
```

### Supabase Dashboard
- Check shopping_items table
- Verify RLS policies
- Monitor user_id ownership
- Check created_at timestamps

### React DevTools
- Inspect component state
- Check props passed to children
- Monitor re-renders

### Network Tab
- Check API calls to Supabase
- Monitor request/response times
- Check error responses

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-03 | Initial implementation |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-03
**Author:** Claude Code
