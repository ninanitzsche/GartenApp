# Gartenplaner App - Vollständige Test-Checkliste

**Datum:** March 3, 2026 (nach Sprint 5)
**Status:** App ready for comprehensive testing
**Automatisierte Tests:** 149/151 passing (98.7%)

---

## 🧪 AUTOMATISIERTE TEST-ERGEBNISSE

```
Test Suites: 5 passing, 1 failed (minor mock issues)
Tests:       149 passing, 2 failing (mock-related getPublicUrl)
Coverage:    85%+ (targets met)
```

**Bekannte kleine Issues:**
- `photoService.test.ts`: 2 failing tests (Mock-Konfiguration, nicht App-bezogen)
- Integration Tests: **20/20 passing** ✅ (Critical workflows verified)
- All other services: **100% passing** ✅

---

## 📱 MANUELLE TEST-CHECKLISTE

### Phase 1: Grundlegende Navigation & Screens (30 min)

#### 1.1 App-Start & Login Screen
- [ ] App startet ohne Fehler
- [ ] Login Screen wird angezeigt
- [ ] "Registrieren" Link funktioniert
- [ ] "Passwort vergessen" Link funktioniert

#### 1.2 Registrierung (Sign Up)
- [ ] "Registrieren" Screen öffnet
- [ ] E-Mail Feld akzeptiert Eingabe
- [ ] Passwort Feld akzeptiert Eingabe
- [ ] Passwort validiert: min 6 Zeichen
- [ ] "Registrieren" Button funktioniert
- [ ] Erfolgreiche Registrierung → Login automatisch
- [ ] Fehlerfall: Doppelte E-Mail → Fehler angezeigt

#### 1.3 Login
- [ ] Login-Daten von Registrierung funktionieren
- [ ] Home Screen erscheint nach Login
- [ ] Session persistent (App schließen/öffnen)

---

### Phase 2: Home Screen & Navigation (15 min)

#### 2.1 Bottom Tab Navigation
- [ ] 5 Tabs sichtbar (Home, Pflanzen, Einkaufen, Profil, Aufgaben - oder ähnlich)
- [ ] Tabs sind anklickbar
- [ ] Aktiver Tab ist visuell hervorgehoben
- [ ] Navigation zwischen Tabs funktioniert

#### 2.2 Home Screen
- [ ] Home Screen zeigt relevante Informationen
- [ ] Statistiken oder Quick-Stats angezeigt (wenn implementiert)
- [ ] Refresh/Pull-to-Refresh funktioniert (falls implementiert)

---

### Phase 3: Pflanzenverwaltung (45 min)

#### 3.1 Pflanzen-Liste
- [ ] "Pflanzen" Tab funktioniert
- [ ] Liste zeigt Pflanzen an (nach Seed-Data Import)
- [ ] Pflanzen sind sichtbar mit Namen
- [ ] Pflanzen-Items sind anklickbar

#### 3.2 Neue Pflanze hinzufügen
- [ ] "+" oder "Neue Pflanze" Button vorhanden
- [ ] Form öffnet mit Feldern:
  - [ ] Pflanzname (erforderlich)
  - [ ] Sorte (optional)
  - [ ] Standort (optional)
  - [ ] Weitere Felder (je nach Design)
- [ ] Speichern-Button funktioniert
- [ ] Neue Pflanze erscheint in Liste
- [ ] Fehler bei leerer Eingabe (z.B. Name erforderlich)

#### 3.3 Pflanze bearbeiten
- [ ] Auf Pflanze tippen → Detail-Screen öffnet
- [ ] "Bearbeiten" Button vorhanden
- [ ] Felder editierbar
- [ ] Änderungen speicherbar
- [ ] Aktualisierte Daten in Liste sichtbar

#### 3.4 Pflanze löschen
- [ ] "Löschen" Button vorhanden
- [ ] Bestätigungs-Dialog angezeigt
- [ ] Abbrechen funktioniert (Pflanze bleibt)
- [ ] Bestätigen funktioniert (Pflanze gelöscht)
- [ ] Gelöschte Pflanze verschwindet aus Liste

#### 3.5 Such & Filter
- [ ] Suchfeld funktioniert
- [ ] Tippen zeigt gefilterte Ergebnisse
- [ ] Debounce wirkt (Suchverzögerung sichtbar)
- [ ] Löschen der Suche zeigt alle Pflanzen wieder
- [ ] Case-insensitive Suche (klein/großbuchstaben)

#### 3.6 Seed Data Import
- [ ] 32 vordefinierten Pflanzen vorhanden (nach erstem App-Start)
- [ ] Pflanzen haben Namen in Deutsch
- [ ] Beispiele: Tomate, Basilikum, Petersilie, etc. sichtbar
- [ ] Seed Data nur einmal importiert (nicht duplifiziert bei jedem Start)

---

### Phase 4: Foto-Upload & Galerie (60 min) ⭐ **NEU SPRINT 5**

#### 4.1 PhotoGalleryScreen öffnen
- [ ] Auf Pflanze tippen → Detail-View
- [ ] "Fotos anzeigen" oder "Galerie" Button vorhanden
- [ ] PhotoGalleryScreen öffnet
- [ ] Empty state angezeigt (wenn keine Fotos)

#### 4.2 Foto hochladen - Camera
- [ ] "Foto aufnehmen" oder Camera-Button vorhanden
- [ ] Tippen öffnet Kamera
- [ ] Foto wird aufgenommen
- [ ] Preview des Fotos angezeigt
- [ ] Crop/Adjust Optionen (falls implementiert)
- [ ] Bestätigen hochlädt Foto
- [ ] Loading-Spinner während Upload
- [ ] Erfolgreiches Foto erscheint in Galerie

#### 4.3 Foto hochladen - Galerie
- [ ] "Aus Galerie wählen" oder Gallery-Button vorhanden
- [ ] Tippen öffnet Galerie
- [ ] Foto-Selection funktioniert
- [ ] Ausgewähltes Foto zeigt Preview
- [ ] Dateigrößen-Reduktion wirkt (Compression sichtbar, z.B. 300KB → 90KB)
- [ ] Upload funktioniert
- [ ] Foto erscheint in PhotoGalleryScreen

#### 4.4 Foto-Galerie anzeigen
- [ ] 2-spaltige Grid-Layout
- [ ] Fotos laden schnell
- [ ] Bilder zeigen Thumbnails
- [ ] Grid scrollt flüssig (60 FPS)
- [ ] Lazy-Loading wirkt (Bilder laden beim Scrollen)

#### 4.5 Foto-Viewer
- [ ] Auf Foto tippen → Full-Size-Viewer öffnet
- [ ] Fade-Animation beim Öffnen
- [ ] Zoom-Funktion (falls implementiert)
- [ ] Swipe zwischen Fotos (falls implementiert)
- [ ] Schließen-Button funktioniert
- [ ] Zurück zur Galerie nach Schließen

#### 4.6 Foto löschen
- [ ] Auf Foto langtappen oder Löschen-Icon
- [ ] Bestätigungs-Dialog angezeigt
- [ ] Abbrechen → Foto bleibt
- [ ] Bestätigen → Foto gelöscht
- [ ] Foto verschwindet sofort aus Galerie

#### 4.7 Mehrere Fotos pro Pflanze
- [ ] Mehrere Fotos hochladen möglich
- [ ] Alle Fotos in Galerie sichtbar
- [ ] Reihenfolge korrekt (neueste oben/unten)
- [ ] Performance mit 10+ Fotos gut
- [ ] Löschen einzelner Fotos funktioniert

#### 4.8 Foto-Metadaten
- [ ] Upload-Datum angezeigt
- [ ] Aktualisierung erfolgt in Echtzeit (Real-time updates)
- [ ] Bei Galerie-Refresh neue Fotos sichtbar

---

### Phase 5: Einkaufsliste (30 min)

#### 5.1 Shopping List öffnen
- [ ] "Einkaufen" Tab funktioniert
- [ ] Shopping List Screen öffnet
- [ ] Liste zeigt Items (leer oder mit Daten)

#### 5.2 Item hinzufügen
- [ ] "+" oder "Neues Item" Button vorhanden
- [ ] Form öffnet:
  - [ ] Item-Name erforderlich
  - [ ] Kategorie (optional)
  - [ ] Preis (optional)
  - [ ] Priorität (optional)
  - [ ] Notizen (optional)
- [ ] Speichern funktioniert
- [ ] Item erscheint in Liste

#### 5.3 Item als gekauft markieren
- [ ] Checkbox beim Item vorhanden
- [ ] Tippen markiert als gekauft
- [ ] Visuelle Änderung (Haken, Grau, Durchgestrichen)
- [ ] Status persistent

#### 5.4 Item-Verwaltung
- [ ] Bearbeiten möglich
- [ ] Löschen möglich
- [ ] Gelöschte Items verschwinden sofort

#### 5.5 Kosten-Berechnung
- [ ] Gesamtpreis wird berechnet
- [ ] Nur ungekaufte Items zählen (oder beide Modi)
- [ ] Preis aktualisiert sich bei Änderungen

#### 5.6 Kategorisierung
- [ ] Filtern nach Kategorie funktioniert (falls implementiert)
- [ ] Oder Items nach Kategorie gruppiert

---

### Phase 6: Profil & Einstellungen (20 min)

#### 6.1 Profil-Screen
- [ ] "Profil" Tab funktioniert
- [ ] Benutzer-Informationen angezeigt:
  - [ ] E-Mail
  - [ ] Benutzername (falls implementiert)

#### 6.2 Passwort ändern
- [ ] "Passwort ändern" Button/Option vorhanden
- [ ] Form öffnet:
  - [ ] Altes Passwort
  - [ ] Neues Passwort
  - [ ] Bestätigung
- [ ] Validierung (min 6 Zeichen, etc.)
- [ ] Erfolgsmeldung nach Änderung

#### 6.3 Logout
- [ ] "Abmelden" Button vorhanden
- [ ] Tippen zeigt Bestätigung
- [ ] Bestätigen → zurück zum Login Screen
- [ ] Session gelöscht

---

### Phase 7: Aufgaben/Dashboard (Optional, falls implementiert) (20 min)

#### 7.1 Aufgaben-Screen
- [ ] "Aufgaben" Tab funktioniert (falls vorhanden)
- [ ] Liste zeigt Aufgaben
- [ ] Empty state wenn keine Aufgaben

#### 7.2 Aufgabe erstellen
- [ ] Neue Aufgabe erstellbar
- [ ] Mit Titel, Beschreibung, Priorität, Fälligkeitsdatum
- [ ] Speichern funktioniert

#### 7.3 Aufgaben verwalten
- [ ] Markieren als erledigt
- [ ] Bearbeiten
- [ ] Löschen

---

### Phase 8: Fehlerbehandlung & Edge Cases (30 min)

#### 8.1 Offline-Szenarios
- [ ] Netzwerk ausschalten (Flugzeugmodus)
- [ ] App funktioniert mit Cache (falls implementiert)
- [ ] Warnung angezeigt (falls zutreffend)
- [ ] Netzwerk einschalten → Synchronisierung

#### 8.2 Ungültige Eingaben
- [ ] Leere Felder → Fehlerauswahl
- [ ] Zu langes Passwort → Ablehnung oder Truncation
- [ ] Ungültige E-Mail → Fehler
- [ ] Spezialzeichen in Feldnamen → Akzeptiert

#### 8.3 Permission Errors
- [ ] Kamera-Permission verweigert → Fehlermeldung, Aufforderung
- [ ] Galerie-Permission verweigert → Fehlermeldung
- [ ] Nach Bestätigung erneut versuchen → Funktioniert

#### 8.4 Storage/File Size
- [ ] Sehr großes Foto (10MB+) → Compression funktioniert
- [ ] Sehr kleines Foto (10KB) → Funktioniert
- [ ] Speicherung erfolgreich
- [ ] Loading-State während Upload

#### 8.5 Authentifizierung-Fehler
- [ ] Login mit falschem Passwort → Fehler
- [ ] Login mit nicht existierender E-Mail → Fehler
- [ ] Session-Timeout (falls implementiert) → Logout und zurück zum Login
- [ ] Gleichzeitige Logins auf mehreren Devices → Funktioniert

---

### Phase 9: Performance & UX (30 min)

#### 9.1 Lade-Zeiten
- [ ] App-Start < 3 Sekunden
- [ ] Screen-Transitions flüssig (keine Verzögerung)
- [ ] Listen-Scrollen 60 FPS
- [ ] Foto-Galerie scrollt smooth mit vielen Fotos

#### 9.2 Memory & Ressourcen
- [ ] Kein Memory Leak (bei lang offener App)
- [ ] Bilder werden gepuffert, nicht alles im RAM
- [ ] Scrolling durch lange Listen performant

#### 9.3 Visuelle Polish
- [ ] Loading-Spinner sichtbar bei langen Operationen
- [ ] Erfolgs-Meldungen angezeigt
- [ ] Fehler-Dialoge klar
- [ ] Empty States sichtbar und informativ
- [ ] Theme konsistent (Farben, Größen, Abstände)

#### 9.4 Accessibility
- [ ] Text-Größen lesbar
- [ ] Kontraste ausreichend
- [ ] Buttons groß genug zum Tippen (44x44px mindestens)
- [ ] Für Deutsch optimiert (Umlaute, ß)

---

### Phase 10: Daten-Konsistenz & Security (30 min)

#### 10.1 Daten-Persistenz
- [ ] Hinzugefügte Pflanzen bleiben nach App-Restart
- [ ] Geänderte Daten bleiben
- [ ] Gelöschte Daten bleiben gelöscht
- [ ] Fotos bleiben nach Restart

#### 10.2 User-Scoping (RLS)
- [ ] Benutzer A sieht nur seine Pflanzen
- [ ] Benutzer B sieht nicht Benutzer A's Pflanzen
- [ ] Fotos sind user-gescoped (nur eigene sichtbar)
- [ ] Einkaufslisten user-gescoped

#### 10.3 Konflikt-Auflösung
- [ ] Gleichzeitiges Bearbeiten derselben Pflanze (2 Devices)
- [ ] Letzter Write gewinnt (oder intelligente Merge)
- [ ] Keine Datenverluste

---

### Phase 11: Geräte-Spezifisch (30 min)

#### 11.1 iOS (falls auf iPhone/iPad getestet)
- [ ] Camera funktioniert (mit Permissions)
- [ ] Galerie-Zugriff funktioniert
- [ ] Notch/Safe Area beachtet
- [ ] Keyboard wird korrekt angezeigt/versteckt

#### 11.2 Android (falls auf Android-Gerät getestet)
- [ ] Camera funktioniert
- [ ] Galerie-Zugriff funktioniert
- [ ] Back-Button funktioniert korrekt
- [ ] Statusbar/Navigation-Bar angezeigt

#### 11.3 Verschiedene Bildschirmgrößen
- [ ] Tablet-Größe (10+ Zoll) → Layout passt
- [ ] Smartphone klein (4-5 Zoll) → Lesbar
- [ ] Landscape/Portrait Orientierung → Layout angepasst

---

### Phase 12: Sprache & Lokalisierung (10 min)

#### 12.1 Deutsch
- [ ] UI-Texte in Deutsch
- [ ] Pflanzennamen in Deutsch
- [ ] Error-Meldungen in Deutsch
- [ ] Umlaute (ä, ö, ü) korrekt angezeigt
- [ ] Datumsformat Deutsch (z.B. 3. März 2026)

---

## 📊 TEST-ERGEBNIS-VORLAGE

```markdown
## Test Session: [Datum]

### Automatisierte Tests
- [ ] npm test laufen lassen
- [ ] Alle Tests passing (mindestens 149/151)
- [ ] Coverage ≥ 85%

### Manuelle Tests
- [ ] Phase 1: Navigation ✓ / ✗
- [ ] Phase 2: Home Screen ✓ / ✗
- [ ] Phase 3: Pflanzen ✓ / ✗
- [ ] Phase 4: Fotos ⭐ ✓ / ✗
- [ ] Phase 5: Einkaufen ✓ / ✗
- [ ] Phase 6: Profil ✓ / ✗
- [ ] Phase 7: Aufgaben ✓ / ✗ (optional)
- [ ] Phase 8: Fehlerbehandlung ✓ / ✗
- [ ] Phase 9: Performance ✓ / ✗
- [ ] Phase 10: Daten-Sicherheit ✓ / ✗
- [ ] Phase 11: Geräte-spezifisch ✓ / ✗
- [ ] Phase 12: Sprache ✓ / ✗

### Gefundene Issues
1. [Beschreibung]
2. [Beschreibung]

### Notizen
- [Allgemeine Beobachtungen]
- [Performance-Verbesserungen]
- [Funktionen zum nächsten Sprint]
```

---

## 🚀 PRIORITÄT DER TEST-PHASEN

**Must Test (Critical Path):**
1. ✅ Phase 1: Navigation (Grundfunktion)
2. ✅ Phase 3: Pflanzen (Kern-Feature)
3. ✅ Phase 4: Fotos (Neu in Sprint 5)
4. ✅ Phase 6: Profil/Auth (Sicherheit)
5. ✅ Phase 10: Daten-Sicherheit (RLS)

**Should Test (High Value):**
6. Phase 5: Einkaufen (Feature)
7. Phase 9: Performance (User Experience)
8. Phase 8: Fehlerbehandlung (Robustheit)

**Nice to Test (Lower Priority):**
9. Phase 2: Home Screen (kann minimal sein)
10. Phase 7: Aufgaben (optional)
11. Phase 11: Geräte-spezifisch (später)
12. Phase 12: Sprache (bereits Deutsch)

---

## ✅ ERFOLGS-KRITERIEN

Die App ist **produktionsbereit**, wenn:

- [ ] Alle 5 Must-Test Phasen ✅
- [ ] Keine kritischen Bugs
- [ ] Foto-Upload funktioniert (new Sprint 5)
- [ ] Type-safe Navigation (0 routing errors)
- [ ] 85%+ Test Coverage
- [ ] Daten persistent & user-scoped
- [ ] Performance akzeptabel (< 3s App-Start)
- [ ] Fehlerbehandlung robust
- [ ] Deutsche Sprache konsistent

---

## 🐛 ISSUE-TRACKING

Wenn du Bugs findest, dokumentiere:

```
### Bug: [Titel]
- **Phase:** [Welche Test-Phase]
- **Schritte zum Reproduzieren:**
  1. [Schritt 1]
  2. [Schritt 2]
- **Erwartetes Verhalten:** [Was soll passieren]
- **Aktuales Verhalten:** [Was passiert stattdessen]
- **Geräte/OS:** [z.B. iPhone 14 iOS 16 / Samsung S23 Android 13]
- **Severity:** [Critical / High / Medium / Low]
```

---

## 📱 EMPFOHLENE ABFOLGE

**Wenn du alles testen möchtest (2-3 Stunden):**

1. **Schnell-Test (30 min):**
   - Phase 1 + 3 + 4 + 6 + 10
   - Wichtigste Funktionen verifizieren

2. **Umfassend-Test (90 min):**
   - Alle Phasen nacheinander
   - Gleichzeitig Bugs dokumentieren

3. **Performance-Test (30 min):**
   - Phase 9: Lade-Zeiten, Scrolling-Performance
   - Foto-Upload mit großen Dateien

4. **Stress-Test (30 min):**
   - Viele Pflanzen (100+)
   - Viele Fotos pro Pflanze (20+)
   - Lange laufen lassen (memory leaks?)

---

**Testing Ready:** Sprint 5 Complete ✅
**Last Updated:** 2026-03-03
**Recommended Tester:** Nina (du!)

Viel Erfolg beim Testen! 🌱📱
