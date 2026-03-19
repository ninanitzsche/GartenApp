# Phase 1: AI Plant Identification - Plan

**Phase:** 1
**Created:** 2026-03-19
**Status:** Ready for execution

---

## Goal

User uploads a photo → System identifies plant using Claude Vision API → Returns plant name, confidence score, links to existing plant database.

---

## Requirements

- AI-01: Plant identification via photo upload

---

## Wave 1 (Core Infrastructure)

### Plan 1.1: Claude API Integration

**Description:** Set up Claude Vision API integration for plant identification.

**Files Modified:**
- `src/services/aiService.ts` (new)
- `src/types/ai.ts` (new)

**Tasks:**

```xml
<task name="1.1.1: Create AI service">
<read_first>
- src/services/photoService.ts (existing pattern)
- src/types/plant.ts (existing types)
</read_first>
<action>
Create src/services/aiService.ts with:
- interface PlantIdentification { name, scientificName, confidence, family, commonNames[] }
- async function identifyPlant(imageUri: string): Promise<PlantIdentification>
- Use Pl@ntNet API: POST to https://my-api.plantnet.org/v2/identify/all
- Use FormData for image upload
- Parse response: bestMatch, score (0-1), species info
- Handle API errors gracefully
</action>
<acceptance_criteria>
- aiService.ts exports identifyPlant function
- Function accepts imageUri parameter
- Returns Promise with { name, scientificName, confidence, family, commonNames }
- Handles API errors gracefully
</acceptance_criteria>
</task>

<task name="1.1.2: Create AI types">
<read_first>
- src/types/plant.ts (existing types)
</read_first>
<action>
Create src/types/ai.ts with:
- PlantIdentificationResult interface
- Pl@ntNetResponse interface
- IdentificationCache interface
- API_ERROR_CODES constant
</action>
<acceptance_criteria>
- PlantIdentificationResult has: name, scientificName, confidence, family, commonNames
- Pl@ntNetResponse maps API response to our types
</acceptance_criteria>
</task>
```

---

### Plan 1.2: Photo Processing Setup

**Description:** Configure image picking and resizing for AI analysis.

**Files Modified:**
- `src/services/imageService.ts` (new)
- `src/components/ImagePicker.tsx` (new)

**Tasks:**

```xml
<task name="1.2.1: Create image processing service">
<read_first>
- src/services/photoService.ts (existing patterns)
- package.json (expo-image-manipulator)
</read_first>
<action>
Create src/services/imageService.ts with:
- resizeImage(uri, maxWidth, maxHeight, quality): Promise<string>
- Calculate image hash for caching
- Support both camera and gallery sources
</action>
<acceptance_criteria>
- resizeImage function exported
- Returns resized image URI
- Max file size under 1MB
</acceptance_criteria>
</task>

<task name="1.2.2: Create AI photo picker component">
<read_first>
- src/components/PhotoFilterModal.tsx (modal pattern)
- src/theme/colors.ts (theme)
</read_first>
<action>
Create src/components/AIPhotoPicker.tsx:
- Bottom sheet modal
- Camera and gallery buttons
- Loading state with spinner
- Preview selected image
- Call identifyPlant and display result
</action>
<acceptance_criteria>
- Component exports AIPhotoPicker
- Shows camera/gallery options
- Displays loading during identification
- Shows result with confidence
</acceptance_criteria>
</task>
```

---

## Wave 2 (Integration)

### Plan 2.1: Plant Linking

**Description:** Link AI identification to existing plant database or create new.

**Files Modified:**
- `src/screens/PlantListScreen.tsx`
- `src/services/plantService.ts`

**Tasks:**

```xml
<task name="2.1.1: Add identification source to plants">
<read_first>
- src/types/plant.ts
- supabase/migrations/001_initial_schema.sql
</read_first>
<action>
Add to Plant interface:
- identification_source: 'ai' | 'manual'
- identified_at: timestamp (optional)

Create migration for plants table if needed.
</action>
<acceptance_criteria>
- Plant type has identification_source field
- Plants created from AI have source='ai'
</acceptance_criteria>
</task>

<task name="2.1.2: Create "Add from AI" flow">
<read_first>
- src/screens/AddPlantScreen.tsx
- src/components/AIPhotoPicker.tsx
</read_first>
<action>
Create AddPlantFromAIScreen:
- Accepts PlantIdentificationResult
- Pre-fills plant name
- Shows confidence score
- Option to link to existing or create new
- Save with identification_source='ai'
</action>
<acceptance_criteria>
- New screen created
- Pre-fills from AI result
- Saves with correct source
</acceptance_criteria>
</task>
```

---

### Plan 2.3: Local Caching

**Description:** Cache identifications to reduce API calls.

**Files Modified:**
- `src/services/cacheService.ts` (new)
- `src/services/aiService.ts` (update)

**Tasks:**

```xml
<task name="2.3.1: Create identification cache service">
<read_first>
- src/services/authService.ts (AsyncStorage usage)
</read_first>
<action>
Create src/services/cacheService.ts:
- Cache AI identifications in AsyncStorage
- Key: imageHash -> PlantIdentificationResult
- TTL: 30 days
- Check cache before API call
- Store failed attempts too (to avoid retries)
</action>
<acceptance_criteria>
- cacheIdentification function exported
- getCachedIdentification function exported
- Uses AsyncStorage
- Respects TTL
</acceptance_criteria>
</task>
```

---

## Wave 3 (UI Polish)

### Plan 3.1: Results Display

**Description:** Display identification results with proper styling.

**Files Modified:**
- `src/components/IdentificationResult.tsx` (new)
- `src/theme/colors.ts`

**Tasks:**

```xml
<task name="3.1.1: Create identification result card">
<read_first>
- src/components/GardenStatsCard.tsx (card pattern)
- src/theme/colors.ts
</read_first>
<action>
Create src/components/IdentificationResult.tsx:
- Plant name header
- Confidence percentage (color-coded: green >80%, yellow 50-80%, red <50%)
- Care tips if available
- "Add to Plants" button
- "Try Again" button on low confidence
- Error message with retry suggestion
</action>
<acceptance_criteria>
- Component shows confidence with color coding
- Has add and retry buttons
- Error state with guidance
</acceptance_criteria>
</task>
```

---

## Verification

### Must-Haves (Goal-Backward)

1. User can take photo with camera
2. User can select photo from gallery
3. System returns plant name with confidence score
4. Results displayed with clear confidence indicator
5. User can add identified plant to database
6. Identifications are cached locally

### Success Criteria

- Photo can be captured from camera
- Photo can be selected from gallery  
- Claude API returns identification result
- Confidence displayed with visual indicator
- New plant created with `identification_source='ai'`
- Subsequent identifications use cache when available

---

## Files to Create

| File | Purpose |
|------|----------|
| `src/services/aiService.ts` | Claude Vision API integration |
| `src/services/imageService.ts` | Image resizing |
| `src/services/cacheService.ts` | Identification caching |
| `src/types/ai.ts` | AI type definitions |
| `src/components/AIPhotoPicker.tsx` | Photo picker modal |
| `src/components/IdentificationResult.tsx` | Result display |
| `src/screens/AddPlantFromAIScreen.tsx` | Add from AI flow |

## Files to Modify

| File | Change |
|------|--------|
| `src/types/plant.ts` | Add identification_source field |
| `src/screens/PlantListScreen.tsx` | Add AI识别 button |
| `src/services/plantService.ts` | Support AI-created plants |

---

*Plan created: 2026-03-19*
