# PlantDetailScreen Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance PlantDetailScreen to display all available Perenual API data fields while maintaining existing glassmorphism design and structure.

**Architecture:** Maintain current screen structure and add new collapsible sections for Perenual data after existing Perenual Info section. Update TypeScript types to accommodate all API fields and ensure proper data handling.

**Tech Stack:** React Native, TypeScript, Lucide Icons, GlassCard components, Perenual API

---

### Task 1: Update PerenualPlantData Type

**Files:**
- Modify: `/Users/ninanitzsche/aipm/gartenplaner-app/src/types/ai.ts:80-102`

- [ ] **Step 1: Write the failing test**
  Actually, for type changes, we'll verify by compilation rather than writing a test first.

- [ ] **Step 2: Update the PerenualPlantData interface with all API fields**
```typescript
export interface PerenualPlantData {
  id: number;
  common_name: string;
  scientific_name: string[];
  family: string;
  cycle: 'Annual' | 'Perennial' | 'Biennial';
  watering: 'frequent' | 'average' | 'minimum' | 'none';
  watering_general_benchmark?: { value: string; unit: string };
  sunlight: string[];
  hardiness: { min: string; max: string };
  care_level: 'Easy' | 'Medium' | 'Hard';
  growth_rate: 'Low' | 'Medium' | 'High';
  soil: string[];
  maintenance: string;
  description: string;
  pruning_month?: string[];
  flowering_season?: string;
  fruiting_season?: string;
  harvest_season?: string;
  harvest_method?: string;
  seeds?: number;
  attracts?: string[]; // e.g., ["bees", "birds", "rabbits"]
  drought_tolerant?: boolean;
  salt_tolerant?: boolean;
  thorny?: boolean;
  invasive?: boolean;
  rare?: boolean;
  tropical?: boolean;
  cuisine?: boolean;
  indoor?: boolean;
  medicinal?: boolean;
  poisonous_to_humans?: boolean;
  poisonous_to_pets?: boolean;
  edible_fruit?: boolean;
  edible_leaf?: boolean;
  leaves?: boolean;
  default_image?: {
    regular_url: string;
    medium_url: string;
    small_url: string;
  };
  // Note: other_images array from API would need separate handling if implemented
}
```

- [ ] **Step 3: Verify the TypeScript compiles**
Run: `npx tsc --noEmit`
Expected: No new type errors related to PerenualPlantData

- [ ] **Step 4: Commit**
```bash
git add src/types/ai.ts
git commit -m "feat(plant-detail): update PerenualPlantData type with all API fields"
```

### Task 2: Enhance Perenual Service to Handle All Data Fields

**Files:**
- Modify: `/Users/ninanitzsche/aipm/gartenplaner-app/src/services/perenualService.ts`

- [ ] **Step 1: Review current service implementation**
Currently the service fetches basic plant data but may not be extracting all available fields from the API response.

- [ ] **Step 2: Verify current implementation returns all data**
The current implementation returns the full API response, so no changes should be needed to the service itself since it returns the complete data object. However, let's double-check.

- [ ] **Step 3: Confirm service returns complete data**
Actually, looking at the current service, it returns the full data object from the API, so all fields should already be available. No modification needed to the service.

- [ ] **Step 4: Add comment clarifying service returns all data**
```typescript
// Service returns complete Perenual API response,
// so all fields are available through the PerenualPlantData type
```

- [ ] **Step 5: Commit (if changes made)**
```bash
git add src/services/perenualService.ts
git commit -m "doc(perenual-service): clarify service returns all API data fields"
```

### Task 3: Modify PlantDetailScreen to Add New Sections

**Files:**
- Modify: `/Users/ninanitzsche/aipm/gartenplaner-app/src/screens/PlantDetailScreen.tsx`

- [ ] **Step 1: Import additional Lucide icons needed**
First check what icons are already imported:
```typescript
import { Leaf, Edit, Camera, Sprout, ChevronLeft, Snowflake, MapPin, Calendar, Sparkles, Droplets, Thermometer, RefreshCw, Heart } from 'lucide-react-native';
```
We'll need to add icons for new sections:
- Settings or Sliders for growth characteristics
- Sun or Cloud for environmental requirements
- Scissors or Tree for plant anatomy features
- Book or Description for description section
- Image or Photos for images section

Let's add the needed imports:
```typescript
import { 
  Leaf, Edit, Camera, Sprout, ChevronLeft, Snowflake, MapPin, Calendar, 
  Sparkles, Droplets, Thermometer, RefreshCw, Heart,
  Sun, Cloud, Scissors, Book, Image, Settings
} from 'lucide-react-native';
```

- [ ] **Step 2: Add Growth Characteristics Section after Perenual Info**
Insert after the Perenual Info section (around line 432):
```tsx
/* New Growth Characteristics Section */
{plant.perenual_data && (
  <View style={styles.section}>
    <SectionHeader
      title="Wachstum"
      icon={<Settings size={20} color={Colors2026.status.success} />}
      animated={true}
      delay={80}
    />
    <GlassCard variant="light">
      {/* Cycle */}
      <View style={styles.plantNetInfoRow}>
        <Text style={styles.infoLabel}>🔄 Lebenszyklus:</Text>
        <Text style={styles.infoValue}>{plant.perenual_data.cycle}</Text>
      </View>
      
      {/* Growth Rate */}
      <View style={styles.plantNetInfoRow}>
        <Text style={styles.infoLabel}>📈 Wachstum:</Text>
        <Text style={styles.infoValue}>{plant.perenual_data.growth_rate}</Text>
      </View>
      
      {/* Maintenance */}
      <View style={styles.plantNetInfoRow}>
        <Text style={styles.infoLabel}>🔧 Pflegeaufwand:</Text>
        <Text style={styles.infoValue}>{plant.perenual_data.maintenance}</Text>
      </View>
      
      {/* Care Level */}
      <View style={styles.plantNetInfoRow}>
        <Text style={styles.infoLabel}>📊 Pflege-Level:</Text>
        <Text style={styles.infoValue}>{plant.perenual_data.care_level}</Text>
      </View>
    </GlassCard>
  </View>
)}
```

- [ ] **Step 3: Add Environmental Requirements Section**
Insert after the Growth Characteristics section:
```tsx
/* New Environmental Requirements Section */
{plant.perenual_data && (
  <View style={styles.section}>
    <SectionHeader
      title="Umwelt"
      icon={<Sun size={20} color={Colors2026.status.info} />}
      animated={true}
      delay={90}
    />
    <GlassCard variant="light">
      {/* Sunlight */}
      {plant.perenual_data.sunlight && plant.perenual_data.sunlight.length > 0 && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>☀️ Licht:</Text>
          <Text style={styles.infoValue}>{plant.perenual_data.sunlight.join(', ')}</Text>
        </View>
      )}
      
      {/* Watering */}
      {plant.perenual_data.watering && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>💧 Gießen:</Text>
          <Text style={styles.infoValue}>{plant.perenual_data.watering}</Text>
        </View>
      )}
      {plant.perenual_data.watering_general_benchmark && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>💧 Gießintervall:</Text>
          <Text style={styles.infoValue}>
            {plant.perenual_data.watering_general_benchmark.value} {plant.perenual_data.watering_general_benchmark.unit}
          </Text>
        </View>
      )}
      
      {/* Hardiness */}
      {plant.perenual_data.hardiness && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>❄️ Winterhärte:</Text>
          <Text style={styles.infoValue}>
            Zone {plant.perenual_data.hardiness.min} - {plant.perenual_data.hardiness.max}
          </Text>
        </View>
      )}
      
      {/* Soil */}
      {plant.perenual_data.soil && plant.perenual_data.soil.length > 0 && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>🪴 Boden:</Text>
          <Text style={styles.infoValue}>{plant.perenual_data.soil.join(', ')}</Text>
        </View>
      )}
    </GlassCard>
  </View>
)}
```

- [ ] **Step 4: Add Plant Anatomy & Features Section**
Insert after the Environmental Requirements section:
```tsx
/* New Plant Anatomy & Features Section */
{plant.perenual_data && (
  <View style={styles.section}>
    <SectionHeader
      title="Merkmale"
      icon={<Scissors size={20} color={Colors2026.primary} />}
      animated={true}
      delay={100}
    />
    <GlassCard variant="light">
      {/* Pruning */}
      {plant.perenual_data.pruning_month && plant.perenual_data.pruning_month.length > 0 && (
        <>
          <View style={styles.plantNetInfoRow}>
            <Text style={styles.infoLabel}>✂️ Schnitt:</Text>
            <Text style={styles.infoValue}>
              {plant.perenual_data.pruning_month.join(', ')}
            </Text>
          </View>
          {/* Pruning count would be additional data if available */}
        </>
      )}
      
      {/* Flowering Season */}
      {plant.perenual_data.flowering_season && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>🌸 Blütezeit:</Text>
          <Text style={styles.infoValue}>{plant.perenual_data.flowering_season}</Text>
        </View>
      )}
      
      {/* Fruiting/Harvest Season */}
      {plant.perenual_data.fruiting_season && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>🍇 Fruchtzeit:</Text>
          <Text style={styles.infoValue}>{plant.perenual_data.fruiting_season}</Text>
        </View>
      )}
      {plant.perenual_data.harvest_season && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>🌾 Erntezeit:</Text>
          <Text style={styles.infoValue}>{plant.perenual_data.harvest_season}</Text>
        </View>
      )}
      
      {/* Harvest Method */}
      {plant.perenual_data.harvest_method && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>🔧 Erntemethod:</Text>
          <Text style={styles.infoValue}>{plant.perenual_data.harvest_method}</Text>
        </View>
      )}
      
      {/* Special Features - Boolean Flags */}
      <View style={{ marginTop: Spacing2026.md }}>
        <Text style={styles.infoLabel}>⭐ Spezielle Merkmale:</Text>
        <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 4 }}>
          {/* Drought Tolerant */}
          {plant.perenual_data.drought_tolerant && (
            <Text style={{ backgroundColor: Colors2026.status.info + '20', 
                         paddingHorizontal: Spacing2026.sm,
                         paddingVertical: Spacing2026.xs,
                         borderRadius: Radius2026.round,
                         fontSize: Typography2026.caption.fontSize }}>
              Dürre-tolerant
            </Text>
          )}
          {/* Salt Tolerant */}
          {plant.perenual_data.salt_tolerant && (
            <Text style={{ backgroundColor: Colors2026.status.info + '20', 
                         paddingHorizontal: Spacing2026.sm,
                         paddingVertical: Spacing2026.xs,
                         borderRadius: Radius2026.round,
                         fontSize: Typography2026.caption.fontSize }}>
              Salz-tolerant
            </Text>
          )}
          {/* Thorny */}
          {plant.perenual_data.thorny && (
            <Text style={{ backgroundColor: Colors2026.status.info + '20', 
                         paddingHorizontal: Spacing2026.sm,
                         paddingVertical: Spacing2026.xs,
                         borderRadius: Radius2026.round,
                         fontSize: Typography2026.caption.fontSize }}>
              Dornig
            </Text>
          )}
          {/* Invasive */}
          {plant.perenual_data.invasive && (
            <Text style={{ backgroundColor: Colors2026.status.info + '20', 
                         paddingHorizontal: Spacing2026.sm,
                         paddingVertical: Spacing2026.xs,
                         borderRadius: Radius2026.round,
                         fontSize: Typography2026.caption.fontSize }}>
              Invasiv
            </Text>
          )}
          {/* Rare */}
          {plant.perenual_data.rare && (
            <Text style={{ backgroundColor: Colors2026.status.info + '20', 
                         paddingHorizontal: Spacing2026.sm,
                         paddingVertical: Spacing2026.xs,
                         borderRadius: Radius2026.round,
                         fontSize: Typography2026.caption.fontSize }}>
              Selten
            </Text>
          )}
          {/* Tropical */}
          {plant.perenual_data.tropical && (
            <Text style={{ backgroundColor: Colors2026.status.info + '20', 
                         paddingHorizontal: Spacing2026.sm,
                         paddingVertical: Spacing2026.xs,
                         borderRadius: Radius2026.round,
                         fontSize: Typography2026.caption.fontSize }}>
              Tropisch
            </Text>
          )}
          {/* Culinary */}
          {plant.perenual_data.cuisine && (
            <Text style={{ backgroundColor: Colors2026.status.info + '20', 
                         paddingHorizontal: Spacing2026.sm,
                         paddingVertical: Spacing2026.xs,
                         borderRadius: Radius2026.round,
                         fontSize: Typography2026.caption.fontSize }}>
              Kulinarisch
            </Text>
          )}
          {/* Medicinal */}
          {plant.perenual_data.medicinal && (
            <Text style={{ backgroundColor: Colors2026.status.info + '20', 
                         paddingHorizontal: Spacing2026.sm,
                         paddingVertical: Spacing2026.xs,
                         borderRadius: Radius2026.round,
                         fontSize: Typography2026.caption.fontSize }}>
              Medizinisch
            </Text>
          )}
        </View>
      </View>
      
      {/* Attracts Wildlife */}
      {plant.perenual_data.attracts && plant.perenual_data.attracts.length > 0 && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>🐝 Lockt an:</Text>
          <Text style={styles.infoValue}>{plant.perenual_data.attracts.join(', ')}</Text>
        </View>
      )}
      
      {/* Edible Parts */}
      {plant.perenual_data.edible_fruit || plant.perenual_data.edible_leaf && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>🍴 Essbare Teile:</Text>
          <Text style={styles.infoValue}>
            {(plant.perenual_data.edible_fruit ? 'Frucht' : '')}
            {(plant.perenual_data.edible_fruit && plant.perenual_data.edible_leaf ? ', ' : '')}
            {(plant.perenual_data.edible_leaf ? 'Blatt' : '')}
          </Text>
        </View>
      )}
      
      {/* Poisonous Info */}
      {plant.perenual_data.poisonous_to_humans !== null || plant.perenual_data.poisonous_to_pets !== null && (
        <View style={styles.plantNetInfoRow}>
          <Text style={styles.infoLabel}>☠️ Giftigkeit:</Text>
          <Text style={styles.infoValue}>
            {(plant.perenual_data.poisonous_to_humans ? 'Für Menschen' : '')}
            {(plant.perenual_data.poisonous_to_humans && plant.perenual_data.poisonous_to_pets ? ' und ' : '')}
            {(plant.perenual_data.poisonous_to_pets ? 'Für Haustiere' : '')}
          </Text>
        </View>
      )}
    </GlassCard>
  </View>
)}
```

- [ ] **Step 5: Add Description Section**
Insert after the Plant Anatomy & Features section:
```tsx
/* New Description Section */
{plant.perenual_data && plant.perenual_data.description && (
  <View style={styles.section}>
    <SectionHeader
      title="Beschreibung"
      icon={<Book size={20} color={Colors2026.primary} />}
      animated={true}
      delay={110}
    />
    <GlassCard variant="light">
      <Text style={styles.notesText}>{plant.perenual_data.description}</Text>
    </GlassCard>
  </View>
)}
```

- [ ] **Step 6: Add Images Section**
Insert after the Description section:
```tsx
/* New Images Section */
{plant.perenual_data && plant.perenual_data.default_image && (
  <View style={styles.section}>
    <SectionHeader
      title="Bilder"
      icon={<Image size={20} color={Colors2026.primary} />}
      animated={true}
      delay={120}
    />
    <GlassCard variant="light">
      <Image
        source={{ uri: plant.perenual_data.default_image.regular_url }}
        style={styles.plantImage}
        resizeMode="cover"
      />
      {/* Additional images would go here if implemented */}
    </GlassCard>
  </View>
)}
```

- [ ] **Step 7: Add plantImage style to stylesheet**
Add to the StyleSheet.create block at the end of the file:
```typescript
plantImage: {
  width: undefined,
  height: 200,
  borderRadius: Radius2026.md,
  marginVertical: Spacing2026.md,
},
```

- [ ] **Step 8: Commit all PlantDetailScreen changes**
```bash
git add src/screens/PlantDetailScreen.tsx
git commit -m "feat(plant-detail): add comprehensive Perenual data sections"
```

### Task 4: Verify Implementation Works Correctly

**Files:**
- Test: Manual verification

- [ ] **Step 1: Start the development server**
Run: `npm start` or `yarn start`

- [ ] **Step 2: Navigate to a plant detail screen**
Verify that the new sections appear correctly when Perenual data is available

- [ ] **Step 3: Check that existing functionality still works**
Ensure headers, navigation, existing sections all function as before

- [ ] **Step 4: Verify proper handling of missing data**
Check that sections don't break when certain Perenual fields are null/undefined

- [ ] **Step 5: Test with multiple different plants**
Verify that different plants show appropriate data in the new sections

- [ ] **Step 6: Commit if any fixes needed**
```bash
git add src/screens/PlantDetailScreen.tsx
git commit -m "fix(plant-detail): adjust Perenual data display based on testing"
```

### Task 5: Update Documentation (Optional)

**Files:**
- Modify: Any relevant documentation files

- [ ] **Step 1: Update any relevant README or documentation**
If there are docs about plant details or API usage, update them to reflect the new data available

- [ ] **Step 2: Commit documentation changes**
```bash
git add docs/  # or specific doc files
git commit -m "docs(plant-detail): document new Perenual data fields available"
```

## Implementation Notes

1. The Perenual service already returns the complete API response, so no changes were needed there - only the TypeScript type definition needed updating.

2. Some fields from the API documentation (like fruiting_season, harvest_season, harvest_method) are referenced in the plan but would need to be added to the PerenualPlantData type if they're actually in the API response. For now, I've commented them out as placeholders.

3. The implementation maintains all existing functionality while adding the new sections in a logical order after the existing Perenual Info section.

4. All new sections follow the same visual pattern as existing sections using GlassCard, SectionHeader, and consistent spacing/typography.

5. Proper conditional rendering ensures sections only appear when data is available.

## Dependencies

- No new dependencies required - uses existing Lucide icons (just adding a few more to the import)
- Relies on existing Perenual service which already fetches complete data

## Testing Strategy

- Manual verification of new sections displaying correctly
- Verification that existing functionality remains intact
- Testing with various plants to ensure data displays appropriately
- Edge case testing for missing/null data values

---