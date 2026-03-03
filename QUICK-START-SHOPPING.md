# Quick Start: Einkausartikel verwalten (STORY-017)

## Features Überblick

Die Einkaufsartikel-Verwaltung ermöglicht:
- Artikel hinzufügen mit Name, Kategorie, Menge, Priorität, Preis
- Artikel-Liste mit Suche und Filtern
- Artikel bearbeiten und löschen
- Artikel als gekauft markieren
- Automatische Synchronisation zu Supabase

---

## Wie man es verwendet

### 1. Navigation zur Einkaufsliste
```
App → Bottom Tab "Einkaufen" → ShoppingListScreen
```

### 2. Neuen Artikel hinzufügen
1. FAB (Plus-Button) oben rechts drücken
2. Formular ausfüllen:
   - **Artikel-Name** (erforderlich) - z.B. "Tomatensamen"
   - **Kategorie** - Saatgut, Werkzeug, Dünger, Erde, Töpfe, Sonstiges
   - **Menge** - z.B. "2kg" oder "1 Pack"
   - **Priorität** - Niedrig, Mittel, Hoch, Dringend
   - **Geschätzter Preis** - z.B. 12.99
   - **Wo kaufen?** (Optional) - z.B. "OBI Baumarkt"
   - **Link** (Optional) - Produktlink
   - **Notizen** (Optional) - z.B. "Bio-Sorten bevorzugt"
3. "Speichern" drücken

### 3. Artikel anschauen
- **Liste-View:** Alle unkauf­ten Artikel sehen
- **Pro Artikel sichtbar:**
  - Name (fett)
  - Kategorie (farbiger Badge)
  - Menge (mit Symbol)
  - Preis (mit Euro-Symbol)
  - Priorität (mit Icon)
  - Kaufort (wenn vorhanden)

### 4. Artikel bearbeiten
1. Artikel-Karte drücken oder Edit-Icon (Stift) drücken
2. Felder ändern
3. "Speichern" drücken
4. Optional: "Löschen" drücken zum Löschen

### 5. Artikel als gekauft markieren
1. "Gekauft" Button auf Artikel-Karte drücken
2. Artikel wird aus der List entfernt
3. Kaufdatum wird gespeichert

### 6. Nach Artikel suchen
1. Suchleiste oben nutzen
2. Artikel-Namen eingeben
3. Liste aktualisiert automatisch

### 7. Artikel filtern
1. Filter-Icon drücken
2. Kategorie(n) wählen oder Priorität(en) wählen
3. Filter werden sofort angewendet
4. "Filter löschen" Button zum Zurücksetzen

---

## Datenbankänderungen

Keine Datenbankänderungen notwendig! Die `shopping_items` Tabelle existiert bereits.

---

## Neue Dateien

```
src/
├── screens/
│   ├── AddShoppingItemScreen.tsx        (Neuer Artikel)
│   ├── EditShoppingItemScreen.tsx       (Artikel bearbeiten)
│   └── ShoppingListScreen.tsx           (Artikel-Liste)
└── navigation/
    └── ShoppingStackNavigator.tsx       (Navigation)
```

---

## Bestehende Dateien (Updated)

```
src/
├── navigation/
│   └── TabNavigator.tsx                 (Shopping Tab hinzugefügt)
├── services/
│   └── shoppingService.ts               (CRUD Service - bereits vorhanden)
└── types/
    └── shopping_item.ts                 (Types - bereits vorhanden)
```

---

## Testing Checklist

### Create
- [ ] App öffnen
- [ ] Zum "Einkaufen" Tab gehen
- [ ] FAB (Plus) drücken
- [ ] Artikel-Name eingeben
- [ ] Kategorie wählen
- [ ] "Speichern" drücken
- [ ] Artikel erscheint in der Liste

### Read
- [ ] Artikel-Liste anschauen
- [ ] Alle Felder korrekt angezeigt?
  - [ ] Name
  - [ ] Kategorie (mit Farbe)
  - [ ] Menge
  - [ ] Preis
  - [ ] Priorität

### Search & Filter
- [ ] Suche-Input nutzen
- [ ] Artikel finden sich?
- [ ] Filter-Icon drücken
- [ ] Nach Kategorie filtern
- [ ] Nach Priorität filtern
- [ ] Filter kombinieren
- [ ] "Filter löschen" drücken

### Update
- [ ] Edit-Icon drücken
- [ ] Artikel-Daten ändern
- [ ] "Speichern" drücken
- [ ] Änderungen sichtbar?

### Delete
- [ ] Delete-Icon drücken
- [ ] Bestätigung anzeigen?
- [ ] "Löschen" drücken
- [ ] Artikel verschwindet?

### Mark as Purchased
- [ ] "Gekauft" Button drücken
- [ ] Artikel verschwindet?
- [ ] In Supabase `purchased` = true?

---

## Debugging

### Artikel nicht in Liste?
- Suche: Hat noch Text aus vorherigen Tests?
- Filter: Sind noch Filter aktiv?
- Netzwerk: Internet Verbindung vorhanden?

### Form Fehler?
- Artikel-Name ist erforderlich
- Preis muss >= 0 sein
- Fehlermeldungen sollten angezeigt werden

### Supabase nicht verbunden?
- Check `.env` Datei für Supabase Keys
- Netzwerk-Fehler in Console checken
- User muss eingeloggt sein

---

## API Reference

### ShoppingService
```typescript
// Fetch
await fetchShoppingItems(filters?: ShoppingItemFilters)
await fetchShoppingItem(id: string)

// Create
await createShoppingItem(data: ShoppingItemFormData)

// Update
await updateShoppingItem(id: string, data: ShoppingItemFormData)

// Delete
await deleteShoppingItem(id: string)

// Mark purchased
await markAsPurchased(id: string, actualPrice?: number)
await markAsNotPurchased(id: string)
```

### ShoppingItem Type
```typescript
{
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
```

---

## Häufige Fehler

### "Item must be logged in to create shopping items"
- User ist nicht eingeloggt
- Login Screen sollte angezeigt werden

### "Artikel konnte nicht geladen werden"
- Netzwerk-Fehler
- Check Internet Verbindung
- Check Supabase Status

### Validierungsfehler
- Input-Feld wird rot
- Fehlermeldung unter dem Feld
- Artikel-Name ist erforderlich!

---

## Performance Notes

- Suche mit 300ms Debounce für bessere UX
- Pull-to-Refresh funktioniert
- Loading Indikatoren bei async Operationen
- Memory Cleanup in useEffect

---

## Accessibility

- All buttons have clear labels
- Error messages informative
- Loading states visible
- Colors for category/priority help distinguish items

---

**Bereit zum Testen!**

Viel Spaß mit der Einkaufsartikel-Verwaltung!
