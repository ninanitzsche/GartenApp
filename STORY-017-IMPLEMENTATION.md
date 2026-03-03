# STORY-017: Einkaufsartikel verwalten - Implementierungsbericht

## Status: Implementiert (3 Punkte)

Datum: 2026-03-03
Sprint: Sprint 3, Task 3

---

## Zusammenfassung

STORY-017 wurde vollständig implementiert. Die Einkaufsartikel-Verwaltung ermöglicht es Benutzern, Artikel zu erstellen, zu bearbeiten, zu löschen und als gekauft zu markieren. Alle Änderungen werden zu Supabase synchronisiert.

---

## Implementierte Features

### 1. Datenbank (Supabase)
- **Tabelle:** `shopping_items` (bereits vorhanden)
- **Spalten:**
  - `id` (UUID, Primary Key)
  - `item_name` (TEXT, Required)
  - `category` (TEXT) - Kategorien: saatgut, werkzeug, dünger, erde, töpfe, sonstiges
  - `quantity` (TEXT) - Flexible Mengenangabe (z.B. "2kg", "1 Pack")
  - `priority` (TEXT) - niedrig, mittel, hoch, dringend
  - `estimated_price` (DECIMAL) - Geschätzter Preis in Euro
  - `actual_price` (DECIMAL) - Tatsächlicher Preis (optional)
  - `purchased` (BOOLEAN) - Kaufstatus
  - `purchased_at` (TIMESTAMPTZ) - Kaufdatum
  - `where_to_buy` (TEXT) - Kaufort/Händler
  - `link` (TEXT) - Produktlink
  - `notes` (TEXT) - Notizen
  - `user_id` (UUID) - Benutzer-Referenz
  - `created_at`, `updated_at` (TIMESTAMPTZ)

- **RLS Policies:** Benutzer können nur ihre eigenen Artikel sehen und verwalten

---

## Neu erstellte Dateien

### 1. Screens
- **`/src/screens/AddShoppingItemScreen.tsx`** (10.5 KB)
  - Formular zum Erstellen neuer Einkaufsartikel
  - Validierung erforderlicher Felder
  - Category und Priority Button Selectors
  - Dekimale Preis-Eingabe

- **`/src/screens/ShoppingListScreen.tsx`** (15.6 KB)
  - Hauptansicht mit Artikel-Liste
  - Suchfunktion mit Debouncing
  - Filterung nach Kategorie und Priorität
  - Edit/Delete Buttons pro Artikel
  - Artikel als gekauft markieren
  - FAB (Floating Action Button) zum Hinzufügen
  - Leere Liste Placeholder
  - Pull-to-Refresh Funktionalität

- **`/src/screens/EditShoppingItemScreen.tsx`** (13 KB)
  - Bearbeitung bestehender Artikel
  - Laden von Artikel-Daten
  - Delete-Funktion mit Bestätigung
  - Alle Felder wie bei "Add"

### 2. Navigation
- **`/src/navigation/ShoppingStackNavigator.tsx`** (1.2 KB)
  - Stack Navigator für Shopping-Feature
  - Routes: ShoppingList, AddShoppingItem, EditShoppingItem

### 3. Services
- **`/src/services/shoppingService.ts`** (bereits vorhanden, 6 KB)
  - `fetchShoppingItems()` - Alle Artikel mit Filtern
  - `fetchShoppingItem()` - Einzelnen Artikel laden
  - `createShoppingItem()` - Neuen Artikel erstellen
  - `updateShoppingItem()` - Artikel aktualisieren
  - `deleteShoppingItem()` - Artikel löschen
  - `markAsPurchased()` - Als gekauft markieren
  - `markAsNotPurchased()` - Kaufstatus zurücksetzen

### 4. Types
- **`/src/types/shopping_item.ts`** (bereits vorhanden)
  - `ShoppingItem` Interface
  - `ShoppingItemFormData` Interface
  - `SHOPPING_CATEGORIES` Konstanten
  - `SHOPPING_PRIORITIES` Konstanten

---

## Aktualisierte Dateien

### 1. Navigation Integration
- **`/src/navigation/TabNavigator.tsx`**
  - ShoppingStackNavigator importiert
  - Neuer Tab "Shopping" (Einkaufen) hinzugefügt
  - Icon: shopping-cart
  - Position: Zwischen Photos und More

---

## UI/UX Features

### Add/Edit Screens
- Horizontale Category Buttons mit Active State
- Horizontale Priority Buttons mit Active State
- Dezimale Preis-Eingabe mit Keyboard Type
- Multiline Notes Feld
- Error Validation und Fehlermeldungen
- Loading Indikator beim Speichern
- Cancel/Save Navigation

### List Screen
- Suchleiste mit Icon
- Filterbar (Category + Priority)
- Artikel-Karten mit:
  - Artikel-Name in Bold
  - Farbige Category Badge
  - Menge mit Icon
  - Preis mit Euro-Symbol
  - Priorität mit Priority-Icon
  - Kaufort (wenn vorhanden)
  - Notizen in Italic
  - Edit/Delete Action Buttons
  - "Gekauft" Button mit Success-Farbe
- Pull-to-Refresh
- FAB für neuen Artikel
- Empty State mit Icon und Text

### Styling
- Konsistent mit Plant-Screens
- Colors aus `Colors` Theme
- Responsive Layout
- Touch Feedback (activeOpacity)
- Icons aus MaterialIcons

---

## Kategorien

1. **Saatgut** - Samen und Saatgut für Pflanzen
2. **Werkzeug** - Garten-Werkzeuge
3. **Dünger** - Düngemittel
4. **Erde** - Erde und Substrate
5. **Töpfe** - Blumentöpfe und Behälter
6. **Sonstiges** - Andere Artikel

---

## Prioritäten

1. **Niedrig** - Optionale Artikel
2. **Mittel** - Normale Artikel (Default)
3. **Hoch** - Wichtige Artikel
4. **Dringend** - Sehr wichtige Artikel

---

## Funktionalität

### Create (AddShoppingItemScreen)
1. Artikel-Name eingeben (erforderlich)
2. Kategorie wählen
3. Menge eingeben
4. Priorität wählen
5. Preis schätzen
6. Kaufort optional eintragen
7. Link optional hinzufügen
8. Notizen optional hinzufügen
9. "Speichern" drücken → Artikel erstellt

### Read (ShoppingListScreen)
- Alle unkauf­ten Artikel anzeigen
- Suchfunktion für Artikel-Namen
- Filter nach Kategorie
- Filter nach Priorität
- Artikel mit Kategorienfarbe, Menge, Preis, Priorität anzeigen

### Update (EditShoppingItemScreen)
1. Artikel durch Klick bearbeiten
2. Alle Felder sind editierbar
3. "Speichern" speichert Änderungen
4. "Löschen" löscht mit Bestätigung

### Delete (All Screens)
- Edit Screen: Delete Button mit Bestätigung
- List Screen: Delete Icon pro Artikel mit Bestätigung

### Mark as Purchased
- "Gekauft" Button auf Artikel-Karte
- Entfernt Artikel aus Hauptansicht
- Speichert Kaufdatum und optionalen Preis

---

## Supabase Integration

### Sync Verhalten
- Alle CRUD Operationen synchronisieren automatisch zu Supabase
- User-ID wird automatisch hinzugefügt (Authentifizierung)
- RLS Policies gewährleisten Datenschutz
- Fehlerbehandlung mit Alert Dialogen

### Fehlerbehandlung
- Network Fehler → Alert mit Fehlermeldung
- Validierungsfehler → Input-Felder rot markiert
- User Feedback via Toast/Alerts

---

## Getestete Szenarien

### Happy Path
1. ✓ Artikel erstellen
2. ✓ Artikel-Liste laden
3. ✓ Artikel bearbeiten
4. ✓ Artikel löschen
5. ✓ Artikel als gekauft markieren
6. ✓ Suche funktioniert
7. ✓ Filter funktionieren

### Edge Cases
- ✓ Leere Artikel-Liste → Placeholder anzeigen
- ✓ Artikel ohne optionale Felder → Felder nicht angezeigt
- ✓ Validierung: Leerer Name → Fehler
- ✓ Validierung: Negativer Preis → Fehler

---

## Navigation Struktur

```
TabNavigator
├── Home
├── Plants (Stack)
├── Tasks
├── Photos
├── Shopping (NEW Stack)
│   ├── ShoppingList (Home)
│   ├── AddShoppingItem
│   └── EditShoppingItem
├── More (Stack)
│   ├── MoreMenu
│   └── ShoppingDashboard (Alternative View)
```

---

## Design Konsistenz

- Gleiche Farben wie Plant-Screens
- Gleiche Typographie
- Gleiche Button Styles
- MaterialIcons überall verwendet
- Responsive Design
- Dark Theme Support (via Colors Theme)

---

## Code Quality

- TypeScript strict mode
- Props Interfaces definiert
- Error Handling implementiert
- Loading States
- Empty States
- Debouncing für Suche
- Memory Cleanup (useEffect Cleanup)

---

## Bekannte Limitierungen

1. List zeigt nur unkaufte Artikel (per Design)
2. Keine Archive/Purchased Items View im ShoppingListScreen (vorhanden in ShoppingDashboardScreen)
3. Keine Offline-Unterstützung (benötigt AsyncStorage)

---

## Nächste Schritte / Verbesserungen

1. Purchased Items in separater View anzeigen
2. Kaufdatum und tatsächlichen Preis anzeigen
3. Statistiken (Gesamt-Budget, etc.)
4. Share/Export Funktionalität
5. Photo Upload pro Artikel
6. Barcode Scanner Integration

---

## Deployment Checklist

- [x] All TypeScript types defined
- [x] All imports correct
- [x] Service methods implemented
- [x] Screens created and functional
- [x] Navigation updated
- [x] Error handling in place
- [x] Loading states
- [x] Empty states
- [x] UI/UX consistent
- [x] Forms validated

---

**Implementierung abgeschlossen: 2026-03-03**
**Co-Authored-By:** Claude Code
**Story Points:** 3 (Completed)
