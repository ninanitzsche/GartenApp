# Quick Start Guide: Plant CRUD Features

## For Developers

### Project Structure
```
src/
├── types/
│   └── plant.ts              # Plant type definitions
├── services/
│   └── plantService.ts       # Database operations
├── screens/
│   ├── PlantListScreen.tsx   # List view
│   ├── PlantDetailScreen.tsx # Detail view
│   ├── AddPlantScreen.tsx    # Create form
│   └── EditPlantScreen.tsx   # Update/Delete form
└── navigation/
    ├── PlantsStackNavigator.tsx # Plant navigation stack
    └── TabNavigator.tsx          # Main tabs (updated)
```

### Key Components

#### Plant Service
```typescript
import { fetchPlants, createPlant, updatePlant, deletePlant } from '../services/plantService';

// Get all plants for current user
const plants = await fetchPlants();

// Create a new plant
const newPlant = await createPlant({
  name: 'Tomate',
  status: 'geplant',
  essbar: true,
  // ... other fields
});

// Update a plant
const updated = await updatePlant(plantId, { status: 'gepflanzt' });

// Delete a plant
await deletePlant(plantId);
```

#### Navigation
```typescript
// From PlantList to PlantDetail
navigation.navigate('PlantDetail', { plantId: 'uuid-here' });

// From PlantDetail to EditPlant
navigation.navigate('EditPlant', { plantId: 'uuid-here' });

// From anywhere to AddPlant
navigation.navigate('AddPlant');
```

### Database Schema
```sql
plants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  latin_name TEXT,
  location TEXT,
  type TEXT,
  status TEXT NOT NULL,
  winterhart BOOLEAN,
  essbar BOOLEAN,
  quantity INTEGER,
  planted_date DATE,
  harvest_date DATE,
  notes TEXT,
  tags TEXT[],
  user_id UUID NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Status Types
- `etabliert` - Established (green)
- `geplant` - Planned (blue)
- `bestellt` - Ordered (yellow)
- `gepflanzt` - Planted (light green)
- `geerntet` - Harvested (brown)
- `entfernt` - Removed (gray)

### Plant Types
- `einjährig` - Annual
- `mehrjährig` - Perennial
- `staude` - Perennial herb
- `strauch` - Shrub
- `baum` - Tree

---

## For Users

### Adding a Plant
1. Tap the **+** button (green circle at bottom right)
2. Fill in:
   - **Name*** (required) - e.g., "Tomate"
   - Latin name (optional) - e.g., "Solanum lycopersicum"
   - Location (optional) - e.g., "Gewächshaus"
   - Type - tap one: Einjährig, Mehrjährig, etc.
   - **Status*** (required) - tap one: Geplant, Gepflanzt, etc.
   - Quantity - number of plants
   - Winterhart - toggle ON if winter-hardy
   - Essbar - toggle ON if edible
   - Notes - any additional information
3. Tap **Speichern** (Save)

### Viewing Plant Details
1. From plant list, tap any plant card
2. See all information organized by sections
3. Scroll to view photos, tags, notes

### Editing a Plant
1. Open plant details (tap on plant card)
2. Tap **Bearbeiten** (Edit) button at bottom
3. Modify any fields
4. Tap **Speichern** (Save)

### Deleting a Plant
1. Open plant details
2. Tap **Bearbeiten** (Edit)
3. Scroll down and tap **Löschen** (Delete)
4. Confirm deletion

### Refreshing the List
- Pull down on the plant list to refresh from database

---

## Common Tasks

### Filter by Status (Future Enhancement)
Currently shows all plants. Filtering will be added in a future update.

### Search Plants (Future Enhancement)
Currently shows all plants. Search will be added in a future update.

### Import Seed Data
Use the seed data utility:
```typescript
import { insertSeedData } from '../utils/seedData';
await insertSeedData();
```

---

## Troubleshooting

### Plants not loading
- Check internet connection
- Verify Supabase credentials in `.env`
- Check browser console for errors

### Can't add plant
- Ensure Name and Status are filled (required fields)
- Check Supabase connection

### Changes not saving
- Check internet connection
- Verify RLS policies are enabled
- Check user is authenticated

### See other users' plants
- This should never happen (RLS enforced)
- If it does, contact admin immediately

---

## Color Theme

Primary colors used:
- **Primary Green**: #4CAF50
- **Background**: #FAFAFA
- **Surface**: #FFFFFF
- **Text**: #424242
- **Success**: #4CAF50
- **Warning**: #FFC107
- **Error**: #F44336
- **Info**: #2196F3

---

## Support

For issues or questions:
1. Check this guide
2. Review IMPLEMENTATION-SUMMARY-STORY-001.md
3. Check STORY-001-COMPLETED.md for acceptance criteria
4. Review code comments in source files

---

Last updated: March 2, 2026
