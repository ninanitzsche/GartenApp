# STORY-002: Test Guide - Pflanzen filtern und suchen

## Manual Testing Steps

### Prerequisite
1. Ensure you have at least 5 plants in the database with different:
   - Names (e.g., "Tomate", "Basilikum", "Tomatenbaum")
   - Latin names
   - Statuses (etabliert, geplant, bestellt, gepflanzt)
   - Locations (e.g., "Garten", "Balkon", "Gewächshaus")
   - Some marked as essbar (edible)
   - Types (einjährig, mehrjährig, etc.)

### Test Case 1: Search Functionality
**Steps**:
1. Navigate to Plant List screen
2. Tap the search bar
3. Type "Tom" (should find "Tomate", "Tomatenbaum")
4. Verify case-insensitivity (try "TOM", "tom")
5. Search should also match latin names
6. Tap X icon to clear search
7. Results should update in real-time as typing

**Expected Results**:
- ✓ Search matches substring, case-insensitive
- ✓ Results update immediately
- ✓ Clear (X) button removes search
- ✓ Both name and latin_name fields searched

### Test Case 2: Status Filter (Multi-Select)
**Steps**:
1. Tap on "Etabliert" status chip
2. Notice it highlights green and shows in results
3. Tap on "Geplant" status chip
4. Should show plants with EITHER status (OR logic)
5. Deselect both
6. Verify all plants shown again

**Expected Results**:
- ✓ Chips highlight when selected
- ✓ Multiple status selection works (OR logic)
- ✓ Results update in real-time
- ✓ Deselection removes filter

### Test Case 3: Location Filter (Multi-Select)
**Steps**:
1. Scroll to second filter row
2. If "Garten" exists, tap it
3. Results should show only plants from "Garten"
4. Tap "Balkon" (if exists)
5. Should show plants from "Garten" OR "Balkon"
6. Deselect both

**Expected Results**:
- ✓ Multiple locations can be selected
- ✓ OR logic applies within locations
- ✓ Location icon visible on chips
- ✓ Results update correctly

### Test Case 4: Type Filter (Single Select)
**Steps**:
1. In second filter row, tap "Einjährig"
2. Results should filter to only einjährig plants
3. Tap "Mehrjährig"
4. Should deselect "Einjährig" and select "Mehrjährig" (single select)
5. Tap again to deselect

**Expected Results**:
- ✓ Only one type can be selected at a time
- ✓ Selecting another deselects previous
- ✓ Results update correctly
- ✓ Deselecting clears the filter

### Test Case 5: Essbar Toggle
**Steps**:
1. Scroll to end of second filter row
2. Tap "Essbar" chip
3. Should show only plants with essbar = true
4. Restaurant icon should be visible
5. Tap again to deselect

**Expected Results**:
- ✓ Essbar toggle filters correctly
- ✓ Only edible plants shown when active
- ✓ Restaurant icon displays
- ✓ Toggle on/off works

### Test Case 6: Combined Filters (AND Logic)
**Steps**:
1. Select a Status (e.g., "Etabliert")
2. Also select a Location (e.g., "Garten")
3. Also toggle Essbar on
4. Results should show: (status=etabliert OR others) AND (location=garten OR others) AND (essbar=true)
5. Change one filter and verify results update

**Expected Results**:
- ✓ Filters combine with AND logic
- ✓ Only plants matching ALL filter criteria shown
- ✓ Real-time updates work correctly
- ✓ Changing any filter updates results

### Test Case 7: Filter Count Badge
**Steps**:
1. Apply some filters (search + 2 statuses + 1 location + essbar)
2. Look for green summary bar below filters
3. Count badge should show: 1 (search) + 2 (statuses) + 1 (location) + 1 (essbar) = 5
4. Text should say "Filter aktiv"

**Expected Results**:
- ✓ Summary bar appears when any filter active
- ✓ Badge shows correct count
- ✓ Text displays "Filter aktiv"
- ✓ Bar positioning doesn't obstruct content

### Test Case 8: Clear Filters Button
**Steps**:
1. Apply multiple filters
2. Tap "Löschen" button in the filter summary bar
3. All filters should reset
4. Summary bar should disappear
5. All plants should be shown again

**Expected Results**:
- ✓ Clear button removes all filters at once
- ✓ Search cleared
- ✓ All chips deselected
- ✓ Results show all plants
- ✓ Summary bar disappears

### Test Case 9: Empty State Messages
**Steps**:
1. Clear all filters (should show "Noch keine Pflanzen" if DB is empty)
2. Apply filters that match no plants
3. Should show "Keine Pflanzen gefunden"
4. Tap "Pflanze hinzufügen" button
5. Should navigate to AddPlant screen

**Expected Results**:
- ✓ Correct empty state when no plants exist
- ✓ Correct empty state when filters match nothing
- ✓ Add plant button works from both states
- ✓ Message is helpful and contextual

### Test Case 10: Real-Time Updates
**Steps**:
1. Have PlantDetailScreen open in another window (if possible)
2. In PlantListScreen, apply a filter
3. Edit a plant from the detail view
4. Return to list view (pull to refresh or focus)
5. Filtered results should reflect the edit
6. Pull to refresh while filters active

**Expected Results**:
- ✓ Filters persist after navigation
- ✓ Refresh button works with active filters
- ✓ New/edited plants appear in correct filters
- ✓ Removing filtered property updates results

### Test Case 11: Search Input Usability
**Steps**:
1. Tap search bar, should show keyboard
2. Type some text
3. Results update as typing
4. Verify X button appears only when text exists
5. Tap X to clear
6. Keyboard should stay open (user can type again)

**Expected Results**:
- ✓ Keyboard opens/closes appropriately
- ✓ X button shows/hides based on content
- ✓ X button clears search immediately
- ✓ Input is responsive

### Test Case 12: Horizontal Scroll on Filter Chips
**Steps**:
1. On narrow screen or with many filters, scroll horizontally
2. Status chips should scroll independently
3. Secondary filter chips should scroll independently
4. No overlap of scroll areas

**Expected Results**:
- ✓ Chips scroll smoothly
- ✓ No indicators needed on small screens
- ✓ All filter options accessible by scrolling
- ✓ Smooth interaction

## Edge Cases to Test

1. **Empty Filter Results**
   - Apply filters that match 0 plants
   - Verify empty state message shows "Keine Pflanzen gefunden"

2. **No Locations in DB**
   - If no plants have locations, location chips shouldn't appear (or show empty)

3. **Search Partial Match**
   - Search "om" should find "Tomate", "Tomatenbaum"
   - But NOT "Orange"

4. **Case Sensitivity**
   - Search "TOMATE", "tomate", "Tomate" should all find same plants

5. **Special Characters in Plant Names**
   - If any plant names have special chars, verify search works

6. **Latin Name Search**
   - Search for partial latin name should work
   - E.g., "Luc" should find "Lycopersicon"

7. **Filter Persistence During Navigation**
   - Apply filters, tap a plant to view details
   - Go back to list
   - Filters should still be active

8. **Rapid Filter Changes**
   - Quickly toggle multiple filters
   - Results should update without errors

9. **Very Long Plant Names**
   - Plant names should not break layout in filters

10. **No Essbar Plants**
    - If no plants are essbar=true, toggle should work but show empty state

## Performance Testing

1. **Large Dataset**: If possible, load 100+ plants and verify:
   - Filters still work quickly
   - Scrolling is smooth
   - No UI lag

2. **Filter Application Speed**:
   - Measure time from filter tap to results update
   - Should be < 500ms

3. **Memory**:
   - Apply/clear filters repeatedly
   - Watch for memory leaks in DevTools

## Accessibility Testing

1. Screen Reader (if using iOS):
   - Filter chips should be announced
   - Clear button should be findable
   - Search input should have proper label

2. Touch Targets:
   - All filter chips should be easy to tap (44x44px minimum)
   - Clear button should be accessible

3. Color Contrast:
   - Active filter chips have good contrast (white on green)
   - Inactive chips have good contrast (text on white)

## Regression Testing

1. Verify original functionality still works:
   - Adding plants
   - Viewing plant details
   - Editing plants
   - Deleting plants
   - Pull-to-refresh
   - Navigation
   - FAB button

2. Verify no broken screens:
   - PlantDetailScreen
   - AddPlantScreen
   - EditPlantScreen
   - Other screens shouldn't be affected
