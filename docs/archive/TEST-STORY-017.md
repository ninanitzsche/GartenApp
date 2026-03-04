# Test Plan: STORY-017 - Einkaufsartikel verwalten

**Story:** STORY-017 (3 Punkte)
**Feature:** Shopping Items Management (Create, Read, Update, Delete)
**Test Datum:** 2026-03-03
**Tester:** QA Team

---

## Test Scope

- Create Shopping Items
- Edit Shopping Items
- Delete Shopping Items
- Mark Items as Purchased
- Search & Filter Functionality
- Supabase Synchronization
- Form Validation
- Error Handling

---

## Test Cases

### TC-001: Create Shopping Item - Happy Path

**Precondition:** User ist eingeloggt und auf ShoppingListScreen

**Steps:**
1. Drücke FAB (Plus-Button) unten rechts
2. AddShoppingItemScreen öffnet sich
3. Fülle Formular aus:
   - item_name: "Tomatensamen Bio"
   - category: "Saatgut"
   - quantity: "100g"
   - priority: "Hoch"
   - estimated_price: "8.99"
   - where_to_buy: "OBI"
   - link: "https://example.com"
   - notes: "Sorte: San Marzano"
4. Drücke "Speichern"

**Expected Result:**
- Alert "Erfolg" wird angezeigt
- Navigation zurück zu ShoppingListScreen
- Neuer Artikel erscheint in der Liste
- Alle Felder korrekt angezeigt
- In Supabase unter shopping_items visible

**Status:** [ ] Pass [ ] Fail

---

### TC-002: Create Shopping Item - Required Field Validation

**Precondition:** AddShoppingItemScreen offen, Formular leer

**Steps:**
1. Versuche ohne item_name zu speichern
2. Drücke "Speichern"

**Expected Result:**
- Input-Feld "item_name" wird rot
- Fehlermeldung "Name des Artikels ist erforderlich" erscheint
- Artikel wird NICHT erstellt
- Alert "Fehler" wird angezeigt

**Status:** [ ] Pass [ ] Fail

---

### TC-003: Create Shopping Item - Negative Price Validation

**Precondition:** AddShoppingItemScreen offen

**Steps:**
1. Gebe item_name: "Test Artikel" ein
2. Gebe estimated_price: "-5.00" ein
3. Drücke "Speichern"

**Expected Result:**
- Input-Feld "estimated_price" wird rot
- Fehlermeldung "Preis muss positiv sein" erscheint
- Artikel wird NICHT erstellt

**Status:** [ ] Pass [ ] Fail

---

### TC-004: Read - Display Shopping List

**Precondition:** Mehrere Shopping Items in Datenbank existieren

**Steps:**
1. Gehe zu "Einkaufen" Tab
2. ShoppingListScreen lädt

**Expected Result:**
- Alle unpurchased Items werden angezeigt
- Pro Item sichtbar:
  - [ ] Artikel-Name (fett)
  - [ ] Kategorie (farbiger Badge)
  - [ ] Menge (mit Symbol)
  - [ ] Preis (mit Euro-Symbol)
  - [ ] Priorität (mit Icon)
  - [ ] Kaufort (wenn vorhanden)
  - [ ] Notizen (wenn vorhanden)
- Edit/Delete Buttons vorhanden
- "Gekauft" Button vorhanden

**Status:** [ ] Pass [ ] Fail

---

### TC-005: Read - Empty State

**Precondition:** Keine unpurchased Shopping Items existieren

**Steps:**
1. Gehe zu "Einkaufen" Tab

**Expected Result:**
- Placeholder wird angezeigt:
  - Shopping Cart Icon
  - Text: "Keine Artikel vorhanden"
  - Subtext: "Fügen Sie einen Artikel hinzu, um zu beginnen"
- FAB ist sichtbar

**Status:** [ ] Pass [ ] Fail

---

### TC-006: Update - Edit Shopping Item

**Precondition:** Shopping Item existiert in Liste

**Steps:**
1. Drücke Edit-Icon (Stift) auf Artikel
2. EditShoppingItemScreen öffnet sich mit vorausgefüllten Daten
3. Ändere Felder:
   - item_name: "Tomatensamen Bio v2"
   - priority: "Mittel" (von "Hoch")
4. Drücke "Speichern"

**Expected Result:**
- Alert "Erfolg" wird angezeigt
- Navigation zurück zu ShoppingListScreen
- Artikel zeigt neue Daten
- In Supabase updated_at aktualisiert

**Status:** [ ] Pass [ ] Fail

---

### TC-007: Delete - Delete Shopping Item

**Precondition:** Shopping Item existiert in Liste

**Steps:**
1. Drücke Delete-Icon auf Artikel in Liste
2. Bestätigungs-Alert: "Möchten Sie ... wirklich löschen?"
3. Drücke "Löschen"

**Expected Result:**
- Alert verschwindet
- Artikel verschwindet aus Liste
- Alert "Erfolg: Artikel wurde gelöscht." wird angezeigt
- In Supabase nicht mehr vorhanden

**Status:** [ ] Pass [ ] Fail

---

### TC-008: Delete - Cancel Delete

**Precondition:** Shopping Item existiert

**Steps:**
1. Drücke Delete-Icon
2. Bestätigungs-Alert erscheint
3. Drücke "Abbrechen"

**Expected Result:**
- Alert verschwindet
- Artikel bleibt in Liste
- Keine Änderungen in Supabase

**Status:** [ ] Pass [ ] Fail

---

### TC-009: Delete from Edit Screen

**Precondition:** EditShoppingItemScreen offen

**Steps:**
1. Drücke "Löschen" Button
2. Bestätigungs-Alert
3. Drücke "Löschen"

**Expected Result:**
- Alert "Erfolg: Artikel wurde gelöscht."
- Navigation zurück zu ShoppingListScreen
- Artikel nicht mehr in Liste
- Artikel gelöscht in Supabase

**Status:** [ ] Pass [ ] Fail

---

### TC-010: Search - Find Article by Name

**Precondition:** Multiple Articles in Liste

**Steps:**
1. Gebe in Suchleiste "Tomate" ein
2. Warte 300ms (Debounce)

**Expected Result:**
- Liste gefiltert nach "Tomate"
- Nur Artikel mit "Tomate" im Namen sichtbar
- Andere Artikel ausgeblendet
- Suche case-insensitive

**Status:** [ ] Pass [ ] Fail

---

### TC-011: Search - Clear Search

**Precondition:** Suche hat Ergebnisse

**Steps:**
1. Lösche Suchtext
2. Lasse Feld leer

**Expected Result:**
- Alle unpurchased Items wieder angezeigt
- Filter zurückgesetzt

**Status:** [ ] Pass [ ] Fail

---

### TC-012: Filter - By Category

**Precondition:** Articles mit verschiedenen Kategorien existieren

**Steps:**
1. Drücke Filter-Icon
2. Filter Panel öffnet sich
3. Wähle Category "Saatgut"

**Expected Result:**
- Liste zeigt nur "Saatgut" Artikel
- Andere Kategorien ausgeblendet
- Filter bleibt aktiv

**Status:** [ ] Pass [ ] Fail

---

### TC-013: Filter - By Priority

**Precondition:** Articles mit verschiedenen Prioritäten existieren

**Steps:**
1. Drücke Filter-Icon
2. Wähle Priority "Hoch"

**Expected Result:**
- Liste zeigt nur "Hoch" Artikel
- Andere Prioritäten ausgeblendet

**Status:** [ ] Pass [ ] Fail

---

### TC-014: Filter - Combine Filters

**Precondition:** Articles mit verschiedenen Kategorien und Prioritäten

**Steps:**
1. Drücke Filter-Icon
2. Wähle Category "Saatgut"
3. Wähle Priority "Hoch"

**Expected Result:**
- Liste zeigt nur Artikel mit BEIDEN Kriterien
- (Saatgut UND Hoch)

**Status:** [ ] Pass [ ] Fail

---

### TC-015: Filter - Clear Filters

**Precondition:** Filter sind aktiv

**Steps:**
1. Drücke Filter-Icon
2. Drücke "Filter löschen" Button

**Expected Result:**
- Alle Filter zurückgesetzt
- Alle unpurchased Items wieder sichtbar
- Filter Panel schließt sich

**Status:** [ ] Pass [ ] Fail

---

### TC-016: Mark as Purchased

**Precondition:** Shopping Item in Liste

**Steps:**
1. Drücke "Gekauft" Button auf Artikel
2. Dialog/Toast könnte erscheinen

**Expected Result:**
- Artikel verschwindet aus Liste (purchased filter aktiv)
- In Supabase: purchased = true, purchased_at = now()
- Artikel kann in Dashboard noch angezeigt werden

**Status:** [ ] Pass [ ] Fail

---

### TC-017: Pull to Refresh

**Precondition:** ShoppingListScreen sichtbar

**Steps:**
1. Ziehe von oben nach unten
2. Refresh Control Activity wird angezeigt

**Expected Result:**
- Liste wird neu geladen
- Activity Indicator sichtbar
- Nach Laden: Activity verschwindet
- Liste aktualisiert

**Status:** [ ] Pass [ ] Fail

---

### TC-018: Category Colors

**Precondition:** Articles mit verschiedenen Kategorien

**Steps:**
1. Schaue Badges auf Artikel-Karten

**Expected Result:**
- Saatgut: Grün (#4CAF50)
- Werkzeug: Orange (#FF9800)
- Dünger: Braun (#8B4513)
- Erde: Saddle Brown (#A0522D)
- Töpfe: Orchidee (#CE93D8)
- Sonstiges: TextLight Farbe

**Status:** [ ] Pass [ ] Fail

---

### TC-019: Navigation Stack - Back Button

**Precondition:** AddShoppingItemScreen offen

**Steps:**
1. Drücke Back/Zurück Button (iOS zurück Pfeil)

**Expected Result:**
- Navigation zurück zu ShoppingListScreen
- Unsaved Änderungen gehen verloren
- Kein Bestätigungs-Dialog

**Status:** [ ] Pass [ ] Fail

---

### TC-020: Supabase Integration - User ID

**Precondition:** Shopping Item erstellt

**Steps:**
1. Öffne Supabase Dashboard
2. Schaue shopping_items Tabelle

**Expected Result:**
- Neue Reihe existiert
- user_id = Aktueller User ID
- Artikel nur für diesen User sichtbar (RLS)

**Status:** [ ] Pass [ ] Fail

---

## Test Data

### Sample Articles to Create

| Name | Category | Qty | Priority | Price | Notes |
|------|----------|-----|----------|-------|-------|
| Tomatensamen Bio | Saatgut | 100g | Hoch | 8.99 | San Marzano |
| Gartenspaten | Werkzeug | 1 Stück | Mittel | 29.99 | Lang Stiel |
| NPK Dünger | Dünger | 5kg | Niedrig | 15.00 | - |
| Blumenerde | Erde | 10L | Mittel | 5.99 | Universal |
| Terrakotta Töpfe | Töpfe | 5 Stück | Niedrig | 12.50 | 15cm |

---

## Browser/Device Testing

- [ ] iOS iPhone
- [ ] Android Phone
- [ ] Tablet (iPad)
- [ ] Different Screen Sizes
- [ ] Dark Mode
- [ ] Light Mode

---

## Performance Testing

- [ ] List mit 50+ Items rendert smooth
- [ ] Search Response < 500ms
- [ ] Filter Response < 100ms
- [ ] Scrolling Performance

---

## Accessibility Testing

- [ ] All buttons have labels
- [ ] Error messages visible
- [ ] Loading states clear
- [ ] Colors sufficient contrast

---

## Regression Testing

- [ ] Plant Management still works
- [ ] Task Management still works
- [ ] Photo Gallery still works
- [ ] Home Screen still works
- [ ] Other Tabs still accessible

---

## Sign-Off

**QA Tester:** _______________ **Date:** ______________

**Test Result:** [ ] PASS [ ] FAIL

**Comments:**
```
[Space for comments]
```

---

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| - | - | - |

---

**Test Plan Version:** 1.0
**Created:** 2026-03-03
**Last Updated:** 2026-03-03
