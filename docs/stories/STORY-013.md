# STORY-013: Foto-Galerie mit Filter

**Epic:** EPIC-003 (Foto-Dokumentation & KI-Erkennung)
**Priority:** 🔴 MUST HAVE
**Story Points:** 3
**Status:** Ready for Development
**Assigned To:** Unassigned
**Created:** 2026-03-04
**Sprint:** Sprint 6

---

## User Story

As a **gardener**
I want to **browse my photos chronologically and filter by context**
So that **I can find specific photos and see garden progress**

---

## Description

### Background
During Sprint 5, photo upload and storage (STORY-011) were completed successfully. 21 photos from Garten2026 migration are now in Supabase Storage. However, the current PhotoGalleryScreen only shows photos linked to a specific plant (accessed via plant detail view). There's no way to:
- See all photos at once
- Filter photos by location, plant, or date
- Browse the complete garden photo history

This story delivers a **standalone photo gallery** as a main app feature, making the 21+ photos discoverable and searchable.

### Scope

**In Scope:**
- Standalone gallery screen accessible from main navigation
- Display all user photos in 2-column grid
- Filter by: Location (Hauptbeet, Hochbeet, Gewächshaus, Pergola, Zaunseite)
- Filter by: Linked Plant (multi-select)
- Filter by: Date Range (this month, this year, all-time)
- Combine multiple filters
- Sort: newest first (default), with options for oldest/by plant name
- Pull-to-refresh
- Tap to view full-resolution modal
- Pagination for 50+ photos
- Empty state

**Out of Scope:**
- AI photo identification (STORY-014, Phase 2)
- Photo editing/filters (Phase 3)
- Photo notes/categories (STORY-012, Phase 2)
- Batch operations (multi-select, bulk delete)
- Photo sharing/export

### User Flow

1. **User taps "Fotos" tab** (main navigation)
   - Gallery loads with all photos in 2-column grid
   - Shows loading spinner while fetching
   - "Fotos (21)" header with refresh button

2. **User browses photos**
   - Scrolls through grid
   - Lazy-loads as needed (pagination)
   - Pull-to-refresh reloads from Supabase

3. **User applies filters** (optional)
   - Taps "Filter" button
   - Modal shows checkboxes for:
     - Locations: Hauptbeet, Hochbeet, Gewächshaus, Pergola, Zaunseite, Beete, Garten
     - Plants: Multi-select from linked plants
     - Date: This Month / This Year / All-Time
   - Applies filters → grid updates
   - "Filter (2)" badge shows active filter count
   - "Clear All" button resets

4. **User taps photo**
   - Opens full-screen modal
   - Shows: high-res image, date taken, notes (if any), linked plants
   - Close button (or tap background)
   - Delete button (with confirmation)

5. **User deletes photo**
   - Confirms deletion
   - Photo removed from gallery + storage
   - Gallery refreshes

---

## Acceptance Criteria

### Gallery Screen (1 pt)
- [ ] PhotoGalleryScreen component created
  - [ ] Not tied to single plant (shows all user photos)
  - [ ] Accessible from main navigation tab
- [ ] Display all photos in 2-column grid layout
  - [ ] Each item: 1:1 aspect ratio
  - [ ] Proper spacing/margins
- [ ] Sorted chronologically (newest first by created_at)
- [ ] Header shows: "Fotos" title + photo count + refresh button
- [ ] Pull-to-refresh functionality works
- [ ] Empty state when no photos:
  - [ ] Icon + "Keine Fotos vorhanden" message
  - [ ] "Foto hochladen" action button

### Filtering (1 pt)
- [ ] Filter button opens modal dialog
- [ ] Filter by Location:
  - [ ] Checkboxes for: Hauptbeet, Hochbeet, Gewächshaus, Pergola, Zaunseite, Beete, Garten
  - [ ] Multi-select support
- [ ] Filter by Linked Plant:
  - [ ] Shows only plants with linked photos
  - [ ] Multi-select checkboxes
  - [ ] Searchable list (optional, Phase 2)
- [ ] Filter by Date Range:
  - [ ] Tabs: "This Month" / "This Year" / "All-Time"
  - [ ] Date range picker for custom (optional, Phase 2)
- [ ] Apply button executes filter
- [ ] Active filter badge shows count ("Filter (2)")
- [ ] "Clear All" button resets all filters
- [ ] Multiple filters combine with AND logic (location AND plant AND date)

### Photo Modal (1 pt)
- [ ] Tapping grid item opens full-screen modal
  - [ ] Transparent dark background
  - [ ] Full-resolution image centered
  - [ ] Proper scaling for different screen sizes
- [ ] Modal displays:
  - [ ] High-res photo
  - [ ] Date taken (formatted: "3. März 2026")
  - [ ] Linked plant names (tags/chips)
  - [ ] Notes if present
- [ ] Close button (X icon, top-right)
- [ ] Background tap closes modal
- [ ] Delete button with confirmation dialog:
  - [ ] "Dieses Foto wird permanent gelöscht. Fortfahren?"
  - [ ] Confirm → removes photo from Supabase Storage + database
  - [ ] Gallery refreshes after delete

### Pagination & Performance
- [ ] Infinite scroll/pagination for 50+ photos
  - [ ] Initial load: 50 photos
  - [ ] Load more on scroll near bottom
  - [ ] Loading indicator while fetching
- [ ] FlatList optimizations:
  - [ ] removeClippedSubviews={true}
  - [ ] maxToRenderPerBatch={10}
  - [ ] initialNumToRender={4}
  - [ ] getItemLayout for random access
- [ ] Gallery remains responsive with 21+ photos
- [ ] No memory leaks on navigation

### Error Handling
- [ ] Network error → show message + retry button
- [ ] Image load failure → show error icon, not blank/gray
- [ ] Filter error → show "Keine Ergebnisse" if no matches
- [ ] Delete error → alert with error message

---

## Technical Notes

### Components to Create/Modify
```typescript
// Main gallery screen
src/screens/PhotoGalleryScreen.tsx
  - Replaces/refactors existing PhotoGalleryScreen
  - Shows all user photos, not just plant-specific

// Components
src/components/PhotoFilterModal.tsx (NEW)
  - Filter UI with location, plant, date options
  - Apply/Clear buttons

src/components/PhotoGrid.tsx (NEW, optional)
  - Reusable photo grid component
  - 2-column layout with FlatList

// Navigation
src/types/navigation.ts (UPDATE)
  - Add 'PhotoGallery' to RootStackParamList
  - Optional params: { filters?: PhotoFilters }
```

### Services
**Extend `src/services/photoService.ts`:**

```typescript
// Fetch all photos for user (with optional filters)
export async function fetchAllPhotos(
  filters?: {
    locations?: string[];
    plantIds?: string[];
    dateRange?: { from: Date; to: Date };
  },
  pagination?: { offset: number; limit: number }
): Promise<Photo[]>

// Get distinct locations for filter dropdown
export async function fetchPhotoLocations(): Promise<string[]>

// Get plants that have linked photos
export async function fetchPlantsWithPhotos(): Promise<Plant[]>

// Delete photo and associated storage file
export async function deletePhoto(photoId: string, fileUrl: string): Promise<void>

// Count total photos for user
export async function countUserPhotos(): Promise<number>
```

### Supabase Queries

**Fetch all photos (with filters):**
```sql
SELECT
  p.*,
  array_agg(DISTINCT pl.name) as linked_plants,
  COUNT(pp.photo_id) as plant_count
FROM photos p
LEFT JOIN photo_plants pp ON p.id = pp.photo_id
LEFT JOIN plants pl ON pp.plant_id = pl.id
WHERE p.user_id = $1
  AND (p.location = ANY($2) OR $2 IS NULL)
  AND (pp.plant_id = ANY($3) OR $3 IS NULL)
  AND (p.created_at >= $4 OR $4 IS NULL)
  AND (p.created_at <= $5 OR $5 IS NULL)
GROUP BY p.id
ORDER BY p.created_at DESC
OFFSET $6 LIMIT $7;
```

**Distinct locations:**
```sql
SELECT DISTINCT location FROM photos WHERE user_id = $1 AND location IS NOT NULL ORDER BY location;
```

**Plants with photos:**
```sql
SELECT DISTINCT pl.* FROM plants pl
JOIN photo_plants pp ON pl.id = pp.plant_id
JOIN photos p ON pp.photo_id = p.id
WHERE p.user_id = $1
ORDER BY pl.name;
```

### State Management

```typescript
// Local state in PhotoGalleryScreen
const [photos, setPhotos] = useState<Photo[]>([])
const [filters, setFilters] = useState<PhotoFilters>({
  locations: [],
  plantIds: [],
  dateRange: null
})
const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
const [modalVisible, setModalVisible] = useState(false)
const [loading, setLoading] = useState(true)
const [pagination, setPagination] = useState({ offset: 0, limit: 50 })

// Type definitions
interface PhotoFilters {
  locations?: string[]
  plantIds?: string[]
  dateRange?: { from: Date; to: Date }
}
```

### Performance Optimization

1. **FlatList optimization:**
   - Use `getItemLayout` for constant height items
   - Set `removeClippedSubviews={true}`
   - Batch rendering: `maxToRenderPerBatch={10}`
   - Initial render: `initialNumToRender={4}`

2. **Image loading:**
   - React Native Image caches automatically
   - Use `progressiveRenderingEnabled` for slow networks
   - Fallback placeholder while loading

3. **Pagination:**
   - Load 50 photos initially
   - On scroll to bottom: load next 50
   - Show loading indicator between batches

4. **Filter caching:**
   - Cache location/plant lists (don't refetch each open)
   - Debounce filter changes if search added

### Database Schema (Validate Exists)

**photos table:**
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL (FK users.id)
file_url TEXT NOT NULL  -- Path in Supabase Storage
photo_url TEXT          -- Public URL (generated from file_url)
location TEXT           -- Hauptbeet, Hochbeet, Gewächshaus, Pergola, Zaunseite
notes TEXT              -- Optional user notes
created_at TIMESTAMP
updated_at TIMESTAMP
```

**photo_plants junction table:**
```sql
photo_id UUID (FK photos.id)
plant_id UUID (FK plants.id)
PRIMARY KEY (photo_id, plant_id)
```

### RLS Policies (Verify)

**photos table:**
- Users can SELECT only their own photos
- Users can DELETE only their own photos
- Users cannot UPDATE (immutable after creation)

```sql
-- SELECT policy
CREATE POLICY "Users can view their own photos"
ON photos FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete their own photos"
ON photos FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

## Dependencies

### Must Be Done First
- ✅ STORY-011: Photo Upload (Sprint 5 - COMPLETED)
  - Photos must be in Supabase Storage and database
  - photo_plants junction table must be populated

- ✅ STORY-INF-001: Database Schema (Sprint 0 - COMPLETED)
  - photos, photo_plants tables must exist

### Related Stories (Can Run in Parallel)
- STORY-005: Task Management (doesn't depend on photos)
- STORY-006: Task Completion (doesn't depend on photos)
- STORY-009: Task Sorting (doesn't depend on photos)

### Future Dependencies
- STORY-012: Photo Notes (enhances with note filtering)
- STORY-014: AI Plant Identification (optional enhancement)

---

## Definition of Done

### Code Quality
- [ ] PhotoGalleryScreen component created with proper TypeScript
- [ ] photoService extended with filter/fetch methods
- [ ] All functions properly typed (no `any` types)
- [ ] Error handling for network failures
- [ ] No console.log (except error logs)
- [ ] Code reviewed and approved

### Testing
- [ ] Unit tests for photoService filter methods
  - [ ] Test location filter (single and multiple)
  - [ ] Test plant filter
  - [ ] Test date range filter
  - [ ] Test combined filters (AND logic)
  - [ ] Test pagination
- [ ] Integration tests
  - [ ] Navigate to gallery → see photos
  - [ ] Apply filter → verify results
  - [ ] Delete photo → removed from gallery
  - [ ] Pull-to-refresh → reloads photos
- [ ] Manual testing
  - [ ] Tested on iOS Simulator
  - [ ] Tested on Android Emulator
  - [ ] Works with 21 migrated photos
  - [ ] Tested with 50+ photos (if available)
  - [ ] All filters work correctly
  - [ ] Modal displays images properly
  - [ ] Navigation doesn't cause memory leaks

### Documentation
- [ ] Story file created (this file ✓)
- [ ] Code comments for complex filter logic
- [ ] Function JSDoc comments in photoService
- [ ] Navigation types updated (RootStackParamList)
- [ ] README updated with gallery feature

### UI/UX
- [ ] Consistent with app design (Colors theme)
- [ ] Responsive on different screen sizes
- [ ] Empty state is helpful (not just blank)
- [ ] Error messages are user-friendly (German)
- [ ] Loading states provide feedback
- [ ] Smooth animations/transitions

### Performance
- [ ] Gallery renders smoothly with 50+ photos
- [ ] No memory leaks on repeated filter changes
- [ ] No memory leaks on navigation away/back
- [ ] Images load progressively
- [ ] FlatList optimization settings applied

### Integration
- [ ] Navigation flows:
  - [ ] Main tab → PhotoGallery
  - [ ] PhotoGallery → PhotoDetail (modal)
  - [ ] Back navigation works
- [ ] Data consistency:
  - [ ] Filters match actual photo counts
  - [ ] Deleted photos don't reappear
  - [ ] New photos appear immediately (after refresh)
- [ ] No breaking changes to existing features
- [ ] All existing photos/plants still work

### Deployment Ready
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Code merged to main
- [ ] Demo-able (can show working gallery)

---

## Story Points Breakdown

| Component | Complexity | Time | Points |
|-----------|-----------|------|--------|
| Gallery grid setup | Medium | 2h | 1 |
| Filter modal UI | Medium | 2h | 1 |
| Filter logic + queries | High | 2h | 1 |
| Modal + delete | Low | 1h | 0 |
| **TOTAL** | | **~7h** | **3** |

**Estimate Rationale:**
- 3 points = ~6-7 hours work for senior dev
- Builds on existing photoService patterns
- FlatList optimization straightforward
- Supabase filtering well-established

---

## Risks & Mitigation

**Risk: Photo URLs still showing as gray**
- **Mitigation:** Verify file_url format matches Supabase Storage structure
- **Check:** Direct URL test in browser before gallery integration

**Risk: Filter queries are slow with large datasets**
- **Mitigation:** Add database indexes (user_id, location, created_at)
- **Test:** With 100+ photo test dataset

**Risk: FlatList performance issues with pagination**
- **Mitigation:** Keep batch size at 50 photos, test memory usage
- **Fallback:** Switch to simpler non-paginated approach if needed

**Risk: Modal doesn't show high-res images**
- **Mitigation:** Test image sizing logic on different devices
- **Fallback:** Use react-native-image-zoom-viewer if needed

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review existing PhotoGalleryScreen (understand current structure)
- [ ] Verify 21 migrated photos are accessible
- [ ] Test direct Supabase Storage URL in browser
- [ ] Check photo_plants junction table has all links
- [ ] Review photo.ts type definition

### Development Phase 1: Gallery Screen (1 pt)
- [ ] Create src/screens/PhotoGalleryScreen.tsx
  - [ ] Use FlatList with numColumns={2}
  - [ ] Implement loading + empty states
  - [ ] Add pull-to-refresh
  - [ ] Test with 21 photos

### Development Phase 2: Filter UI (1 pt)
- [ ] Create src/components/PhotoFilterModal.tsx
  - [ ] Location checkboxes
  - [ ] Plant multi-select
  - [ ] Date range options
  - [ ] Apply/Clear buttons
- [ ] Hook up to gallery (open/close modal)

### Development Phase 3: Filter Logic (1 pt)
- [ ] Extend photoService.ts with:
  - [ ] fetchAllPhotos(filters, pagination)
  - [ ] fetchPhotoLocations()
  - [ ] fetchPlantsWithPhotos()
  - [ ] deletePhoto(id, fileUrl)
- [ ] Implement filter state management
- [ ] Test filter combinations

### Testing Phase
- [ ] Unit tests for photoService
- [ ] Integration tests for gallery flow
- [ ] Manual testing on simulators
- [ ] Performance testing (50+ photos)

### Finalization
- [ ] Code review
- [ ] Documentation updates
- [ ] Merge to main
- [ ] Deploy to staging

---

## Notes for Developer

**Key Files to Reference:**
- `src/screens/PlantDetailScreen.tsx` - Navigation pattern
- `src/services/plantService.ts` - Filter query patterns
- `src/screens/PlantListScreen.tsx` - FlatList optimization example
- `docs/TESTING-GUIDE.md` - Testing patterns

**Helpful Commands:**
```bash
# Test with production data
npm test -- photoService.test.ts

# Run app on iOS
npm start -- --ios

# Check database structure
npx supabase db list
```

**Remember:**
- Keep filter state in React (not Supabase)
- Use optimistic updates for delete
- Test on slow networks (throttle in DevTools)
- Verify RLS doesn't block gallery queries

---

**Story Status:** 🟡 Ready for Development
**Created:** 2026-03-04
**Next:** /dev-story STORY-013

---

**Generated by BMAD Method v6 - Phase 4 (Story Definition)**
