# PlantDetailScreen Enhancement Design

## Overview
Enhance the PlantDetailScreen to include all available data fields from the Perenual API while maintaining the existing glassmorphism design and structure.

## Current Structure
The existing PlantDetailScreen includes:
- Glass header with navigation controls
- Status & Quick Info section
- Details section (type, planted date, edible, winterhard)
- PlantNet Info section (common names, family, genus, etc.)
- Perenual Info section (watering, sunlight, care level, etc.)
- Permapeople Info section (permaculture data)
- Health Check section (disease identification)
- Photos section
- Notes section
- Harvests section

## Proposed Enhancement
Maintain the existing structure and add new sections for comprehensive Perenual data after the existing Perenual Info section.

### New Sections to Add

#### 1. Growth Characteristics Section
- Cycle (Annual/Perennial/Biennial)
- Growth Rate (Low/Medium/High)
- Maintenance level
- Care Level (Easy/Medium/Hard)

#### 2. Environmental Requirements Section
- Sunlight requirements (array)
- Watering frequency + general benchmark (value and unit)
- Hardiness zone (min/max)
- Soil preferences (array)

#### 3. Plant Anatomy & Features Section
- Pruning months & frequency (array with amount/interval)
- Flowering season
- Fruiting season & harvest season
- Harvest method
- Special features (boolean flags for):
  * Drought tolerant
  * Salt tolerant
  * Thorny
  * Invasive
  * Rare
  * Tropical
  * Culinary
  * Medicinal
- Attracts wildlife (array: bees, birds, rabbits, etc.)
- Edible parts (fruit, leaf)
- Poisonous to humans/pets (boolean)

#### 4. Description Section
- Full plant description from Perenual API

#### 5. Images Section
- Default image (regular, medium, small URLs)
- Other available images array

## Design Implementation Details

### Component Structure
```tsx
{/* Existing sections remain unchanged */}

/* New Growth Characteristics Section */
{plant.perenual_data && (
  <View style={styles.section}>
    <SectionHeader
      title="Wachstum"
      icon={<Sparkles size={20} color={Colors2026.status.success} />}
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

/* New Environmental Requirements Section */
{plant.perenual_data && (
  <View style={styles.section}>
    <SectionHeader
      title="Umwelt"
      icon={<Droplets size={20} color={Colors2026.status.info} />}
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

/* New Plant Anatomy & Features Section */
{plant.perenual_data && (
  <View style={styles.section}>
    <SectionHeader
      title="Merkmale"
      icon={<Leaf size={20} color={Colors2026.primary} />}
      animated={true}
      delay={100}
    />
    <GlassCard variant="light">
      {/* Pruning */}
      {plant.perenual_data.pruning_month && plant.perenual_data.pruning_month.length > 0 && (
        <>
          <View style={styles.plantNetInfoRow}>
            <Text style={styles.infoLabel>✂️ Schnitt:</Text>
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
      {/*
        Note: These fields would need to be added to PerenualPlantData type
        based on API documentation showing fruiting_season and harvest_season
      */}
      
      {/* Harvest Method */}
      {/*
        Note: harvest_method field would need to be added to type
      */}
      
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

/* New Description Section */
{plant.perenual_data && plant.perenual_data.description && (
  <View style={styles.section}>
    <SectionHeader
      title="Beschreibung"
      icon={<Droplets size={20} color={Colors2026.primary} />}
      animated={true}
      delay={110}
    />
    <GlassCard variant="light">
      <Text style={styles.notesText}>{plant.perenual_data.description}</Text>
    </GlassCard>
  </View>
)}

/* New Images Section */
{plant.perenual_data && plant.perenual_data.default_image && (
  <View style={styles.section}>
    <SectionHeader
      title="Bilder"
      icon={<Camera size={20} color={Colors2026.primary} />}
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

### Types Update Required
Update the `PerenualPlantData` interface in `/src/types/ai.ts` to include all fields from the API:
```typescript
export interface PerenualPlantData {
  // Existing fields...
  id: number;
  common_name: string;
  scientific_name: string[];
  // ... existing fields
  
  // New fields to add based on API documentation:
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
  // Other images array would be handled separately if needed
}
```

### Styling Additions
Add to `/src/theme/designSystemV2.ts` or create specific styles in the component:
```typescript
// Add to existing styles
plantImage: {
  width: undefined,
  height: 200,
  borderRadius: Radius2026.md,
  marginVertical: Spacing2026.md,
},
```

### Loading and Error States
- Maintain existing loading states from `fetchPlantDetails()`
- Add proper error handling for Perenual data fetching
- Show placeholder content when data is not available
- Consider adding a "Data incomplete" badge when some fields are missing

## Implementation Plan
1. Update `PerenualPlantData` type with all API fields
2. Enhance `perenualService.ts` to handle all data fields properly
3. Modify `PlantDetailScreen.tsx` to include new sections
4. Add appropriate icons from Lucide for new sections
5. Ensure proper loading/error states
6. Test with various plants to verify data display

## Benefits
- Provides comprehensive plant care information in one view
- Maintains existing user experience and design patterns
- Leverages glassmorphism design from STORY-046
- Makes the app more valuable for garden planning decisions
- Follows the scrollable single-page organization preference

## Open Questions
1. Should we implement pagination or lazy loading for very long plant details?
2. How should we handle plants where Perenual data is partially available?
3. Should we add a "Show all data" toggle for advanced users?
4. Should we cache Perenual data locally to reduce API calls?

## Approval
This design has been reviewed and approved for implementation.