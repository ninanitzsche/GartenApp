# Quick Start Guide: Einkaufsliste-Dashboard (STORY-019)

## How to Test the Shopping Dashboard

### Prerequisites
- Shopping items must exist in the database (STORY-017)
- User must be logged in
- Items should be marked as `purchased = false` to appear on dashboard

### Accessing the Dashboard

1. **From App Navigation**:
   - Tap the "Mehr" (More) tab at bottom
   - Tap "Einkaufsliste" menu item
   - Dashboard loads with all unpurchased items

2. **Visual Hierarchy**:
   - Primary screen header: "Einkaufsliste"
   - Categories displayed with green headers
   - Items listed under each category
   - Fixed footer with total cost

### Testing Scenarios

#### Scenario 1: View Dashboard with Items

**Setup**:
- Database has unpurchased shopping items in different categories
- At least 2-3 items per category preferred

**Expected Results**:
- Dashboard loads quickly
- Items grouped by category (Saatgut, Dünger, Werkzeug, etc.)
- Category headers show item count and subtotal
- Overall total displays in footer
- All prices calculated correctly
- All items visible without scrolling (if few items)

**Verification Points**:
- [ ] Category icons display correctly
- [ ] Item quantities show when provided
- [ ] Where to buy locations display
- [ ] Prices formatted with 2 decimals and € symbol
- [ ] Footer shows correct total count
- [ ] Subtotals equal sum of items in category

#### Scenario 2: Buy Item

**Setup**:
- Dashboard displayed with items

**Action**:
- Tap "Gekauft" button on any item

**Expected Results**:
- Item disappears immediately
- Category count decreases by 1
- Subtotal updates
- Total cost decreases
- Totals still correct
- No error messages

**Edge Case**:
- If last item in category, category section disappears entirely

#### Scenario 3: Clear Purchased Items

**Setup**:
- At least one item marked as purchased
- Dashboard displayed

**Action**:
- Tap "Gekaufte löschen" (Clear Purchased) button
- Confirm in alert dialog

**Expected Results**:
- Alert shows: "Gekaufte Artikel löschen"
- Option to "Abbrechen" (Cancel) or "Löschen" (Delete)
- After confirmation: Success alert shown
- Dashboard refreshes
- Purchased items removed from database
- Dashboard updates correctly

#### Scenario 4: Empty State

**Setup**:
- All items marked as purchased or deleted

**Expected Results**:
- Shopping cart icon displays
- "Einkaufsliste ist leer" title
- Helpful message about status
- No crash or errors
- Footer hidden (no items to purchase)

#### Scenario 5: Pull to Refresh

**Setup**:
- Dashboard displayed

**Action**:
- Swipe down from top

**Expected Results**:
- Pull indicator appears
- Loading spinner shows
- Data re-fetches from Supabase
- Dashboard updates with current data
- Smooth animation

#### Scenario 6: Navigation

**Setup**:
- Dashboard open

**Action**:
- Tap back button (top left)

**Expected Results**:
- Returns to More menu
- Tab bar still visible
- Navigation state maintained

### Data Verification

#### Item Structure
Each item displays:
```
[Icon] Category Title          Category Total
├─ Item Name
│  Menge: [quantity]
│  [Place Icon] Where to Buy
│  [Price] €        [Gekauft Button]
└─ ...
```

#### Cost Calculation Formula
```
Category Subtotal = SUM(item.estimated_price) for items in category
Overall Total = SUM(all category subtotals)
Item Count = COUNT(unpurchased items)
```

### Sample Test Data

For testing, add items like:

**Saatgut (Seeds)**
- Tomato seeds, 1 pack, €3.99
- Cucumber seeds, 2 packs, €5.98

**Dünger (Fertilizer)**
- Compost, 20 kg, €14.99
- Liquid fertilizer, 1 liter, €8.50

**Werkzeug (Tools)**
- Shovel, 1 piece, €24.99
- Garden fork, 1 piece, €19.99

**Category Total Expectations**:
- Saatgut: €9.97
- Dünger: €23.49
- Werkzeug: €44.98
- **Overall: €78.44**

### Common Issues & Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---|---|
| Dashboard blank | No unpurchased items | Add items via Add Shopping Item |
| Items not grouped | Category field missing | Ensure items have category set |
| Prices not calculating | Estimated price null | Set estimated_price for items |
| Button not responding | Touch target too small | Ensure screen zoom at 100% |
| Navigation doesn't work | No navigation prop | Check MoreMenuStackNavigator setup |
| Scrolling slow | Too many items | Dashboard optimized for <100 items |

### Browser/Device Testing

**Recommended Test Devices**:
- iOS: iPhone 14/15 (375px width)
- Android: Pixel 5 (393px width)
- Tablet: iPad Pro (1024px width)

**Responsive Checks**:
- [ ] Text readable on small screens
- [ ] Buttons tappable on all sizes
- [ ] Categories fit without overflow
- [ ] Footer doesn't overlap content
- [ ] Long item names wrap correctly

### Performance Metrics

**Expected Load Times**:
- Initial load: <500ms (with 50 items)
- Refresh: <1s
- Buy item action: <200ms
- Clear purchased action: <1-2s

### Integration Checklist

Before considering complete:
- [ ] ShoppingDashboardScreen.tsx created and error-free
- [ ] MoreMenuStackNavigator.tsx created
- [ ] TabNavigator.tsx updated with stack navigator
- [ ] MoreMenuScreen.tsx navigation integrated
- [ ] No TypeScript compilation errors
- [ ] All imports resolve correctly
- [ ] Navigation works end-to-end
- [ ] Data displays properly
- [ ] Purchase functionality works
- [ ] Clear purchased functionality works
- [ ] Error messages display correctly
- [ ] Empty state displays
- [ ] Pull-to-refresh works
- [ ] Back navigation works

### Debugging Tips

**Enable Logging**:
```javascript
// Add to ShoppingDashboardScreen.tsx
console.log('Loaded items:', items);
console.log('Grouped items:', groupedItems);
console.log('Total cost:', totalCost);
```

**Check Supabase Data**:
- Query shopping_items table
- Verify purchased field is false for visible items
- Check category values match SHOPPING_CATEGORIES
- Verify estimated_price is numeric or null

**Network Inspector**:
- Monitor Supabase requests in network tab
- Check response payloads
- Verify no 401/403 errors (auth issues)
- Check database query time

### Success Criteria

STORY-019 is complete when:

1. ✅ Dashboard displays with no errors
2. ✅ Items properly grouped by category
3. ✅ Cost calculations are accurate
4. ✅ Buy button removes items correctly
5. ✅ Clear purchased clears items correctly
6. ✅ Empty state displays when needed
7. ✅ Navigation works properly
8. ✅ UI matches design specifications
9. ✅ Error handling is robust
10. ✅ Performance is acceptable

---

**Last Updated**: 2026-03-03
**Status**: Ready for Testing
