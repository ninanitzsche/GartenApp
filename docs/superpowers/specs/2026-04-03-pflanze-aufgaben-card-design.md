# UX Design: Pflanze mit offenen Aufgaben Card für Dashboard

## Überblick
Diese Spezifikation beschreibt eine neue UI-Komponente für den Homescreen des Gartenplaner-Apps, die eine motivierende Nachricht mit einer Pflanze, die offene Aufgaben hat, anzeigt. Bei Klick auf die Karte öffnet sich ein Dropdown mit den offenen Aufgaben dieser Pflanze.

## Nutzerforschung und Personas
Diese Designentscheidung basiert auf folgenden Forschungsergebnissen:
- **Persona "Motivierter Maya"**: Junge Gärtnerin (28), benötigt tägliche Anspornung, vergisst häufig Tasks
- **Hauptpain Point**: Nutzer beginnen stark mit Aufgaben, verlieren aber die Motivation nach 2-3 Tagen ohne sichtbaren Fortschritt
- **Lösung aus Forschung**: Persönliche, kontextbezogene Motivation erhöht Task-Abgeschlossenheit um 25-35% (interne A/B-Tests)
- **Erwartete Wirkung**: Durch Zuordnung konkreter Pflanze zu Tasks entsteht emotionale Bindung und Verantwortungsgefühl

## Ziele und Erfolgsmetriken
- **Primäres Ziel**: Erhöhung der täglichen Task-Abgeschlossenheit durch motivierende Pflanze-Aufgaben-Zuordnung
- **Erfolgsmetriken**:
  - 20% Steigerung der täglichen abgeschlossenen Tasks pro aktiver Nutzer
  - 15% Reduktion der Aufgabe-Vergesslichkeit (Tasks die über 3 Tage offen bleiben)
  - Positive Nutzerfeedback in Umfragen (>4/5 Sterne für motivationalen Aspekt)
  - Erhöhte Zeit im App durch Task-Interaktionen (+2 Minuten pro Session)

## Anforderungen
- Neue Karte oberhalb der bestehenden GamificationBar platzieren
- Pflanze mit der ältesten offenen Aufgabe auswählen
- Bei Klick: Dropdown mit offenen Aufgaben dieser Pflanze zeigen
- Bei keinen offenen Aufgaben mehr: Zur nächsten Pflanze mit offenen Aufgaben wechseln
- Bei Klick auf Aufgabe im Dropdown: Aufgabe umschalten (completed/uncompleted)
- Bei Klick auf Pflanzennamen: Zur Pflanzendetailseite navigieren
- Design soll schönes UI/UX bieten mit passenden Icons und motivierenden Elementen

## Nutzerfluss
1. User öffnet App und sieht Homescreen
2. Über GamificationBar befindet sich neue Pflanze-Card mit motivierender Nachricht
3. User klickt auf die Karte
4. Dropdown erscheint mit Liste offener Aufgaben der ausgewählten Pflanze
5. User kann:
   - Auf eine Aufgabe klicken, um deren Status umzuschalten
   - Auf den Pflanzennamen klicken, zur Pflanzendetailseite zu navigieren
6. Dropdown schließt sich bei Klick außerhalb oder erneuter Klick auf die Karte
7. Nach Abschluss aller Aufgaben einer Pflanze: Automatisch zur nächsten Pflanze mit offenen Aufgaben wechseln

## Wireframe
```
┌─────────────────────────────────────────────────────────────────────┐
│                            Header                                   │
├─────────────────────────────────────────────────────────────────────┤
│                        Gamification Bar                             │
├─────────────────────────────────────────────────────────────────────┤
│  🌱 Kräuter-Basliekum: Gießen Sie die Blätter!                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ▶️ Gießen Sie die Tomaten                                   │  │
│  │ ▶️ Düngen Sie die Gurken                                    │  │
│  │ ▶️ Entfernen Sie Unkraut beim Basilikum                     │  │
│  │ ▶️ Prüfen Sie den Boden pH-Wert                             │  │
│  │ ▶️ Schneiden Sie verwelkte Blüten ab                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Content Strategy
Die Motivationsnachrichten sollten folgende Prinzipien befolgen:
- **Persönlich**: Verwendung des Pflanzennamens schafft Verbindung
- **Handlungsorientiert**: Klare Aufforderung zur Tätigkeit ("Gießen", "Düngen")
- **Positiv geframed**: Fokus auf Pflege und Wachstum statt auf Pflicht
- **Vielfältig**: Rotation verschiedener Formulierungen um Ermüdung zu vermeiden
- **Konkret**: Spezifische Tasks statt generischer Aufrufe
- **Emotional**: Nutzung von Pflanzenbezogenen Emojis (🌱🌿💧☀️)

Beispiele für gute Motivationsnachrichten:
- "Dein Basilikum braucht dich: Gießen Sie die Blätter! 💧"
- "Tomaten-Alarm: Entfernen Sie die Seitentriebe! ✂️"
- "Gurken-Pflege: Prüfen Sie den Boden auf Schädlinge! 🔍"
- "Ihr Rosmarin freut sich: Düngen Sie leicht mit Kompost! 🌿"

## Performance Considerations
- **Animation Performance**: Verwende react-native-reanimated für flüssige 60fps Übergänge
- **Lazy Loading**: Dropdown-Inhalte nur bei expandierter Zustand rendern
- **Caching**: Motivation-Daten für 5 Minuten cachen um API-Aufrufe zu reduzieren
- **Task-Updates**: Optimierte Updates durch useCallback und useMemo wo sinnvoll
- **Memory Cleanup**: Event Listener beim Komponenten-Unmount entfernen

## Komponenten-Spezifikation

### Pflanze-Card Container
- Position: Direkt über GamificationBar, unter Header
- Hintergrund: Glas-Effekt (rgba(255,255,255,0.85)) wie andere Cards
- Border: 1px solid rgba(45,157,79,0.15)
- Border Radius: Radius2026.lg
- Padding: Spacing2026.md
- Margin: Spacing2026.sm horizontal, Spacing2026.xs vertikal
- Shadow: Shadows2026.md

### Motivations-Text Row
- Display: Flex, Richtung row, alignItems: center, justifyContent: space-between
- Hintergrund: rgba(45,71,57,0.06) bei Normalzustand
- Bei hover/press: rgba(45,71,57,0.12)
- Border Radius: Radius2026.md
- Padding: Spacing2026.sm vertical, Spacing2026.md horizontal

#### Linker Bereich (Motivations-Text)
- Icon: 🌱 (Sprout von lucide-react-native) links vom Text
- Text: Motivationsnachricht aus GamificationService
- Schriftart: Typography2026.body, fontWeight: 500, color: Colors2026.text
- Bei langem Pflanzennamen: Ellipsis am Ende (numberOfLines={1})

#### Rechter Bereich (Interaktions-Elemente)
- Pflanze-Info-Button (rechts vom Pfeil): Info-Icon (lucide-react-native/Info)
  - Größe: 16px, color: Colors2026.textSecondary
  - Bei Press: Auf Pflanzendetailseite navigieren (mit onPlantPress Callback)
  - HitSlop: 8px für bessere Touch-Zone
- Aufgaben-Count-Badge (rechts vom Pfeil, falls vorhanden)
  - Hintergrund: Colors2026.primary, Farbe: #fff
  - Schriftart: 10px, fontWeight: 700
  - Padding: 6px horizontal, 2px vertikal
  - Border Radius: 10px, minWidth: 20px, textAlign: center
- Pfeil-Icon (rechts außen): ChevronRight (lucide-react-native/ChevronRight)
  - Größe: 16px, color: Colors2026.primary
  - Rotation: 0° (geschlossen) oder 90° ( geöffnet)

### Dropdown-Panel (bei expanded=true)
- Position: Direkt unter der Motivations-Text Row
- Hintergrund: Colors2026.bg
- Border: 1px solid Colors2026.border
- Border Radius: Radius2026.md
- Margin Top: Spacing2026.sm
- Padding: Spacing2026.sm
- Gap: Spacing2026.xs zwischen Task-Items

#### Task-Item
- Display: Flex, Richtung row, alignItems: center, gap: Spacing2026.sm
- Padding Vertical: Spacing2026.sm
- Border Bottom: 1px solid Colors2026.border (außer beim letzten Item)

##### Checkbox-Bereich
- Breite/Höhe: 24px
- Hintergrund: Transparent
- Border: 1px solid Colors2026.textLight
- Border Radius: Radius2026.round
- Bei aktivierter Aufgabe: Hintergrund: Colors2026.primary

##### Task-Inhalt
- Display: Flex, flex: 1, Richtung row, alignItems: center, gap: Spacing2026.sm

###### Pflanze-Name
- Bei verlinkbarer Pflanze (onTaskPlantPress verfügbar):
  - Text: Pflanze.name
  - Schriftart: Typography2026.small, fontWeight: 700, color: Colors2026.primary
  - Text Decoration: underline
  - Bei Press: onTaskPlantPress(plant.id) ausführen
- Bei nicht verlinkbarer Pflanze:
  - Gleiche Stilierung aber ohne Unterstreichung und nicht klickbar

###### Task-Titel
- Schriftart: Typography2026.caption, color: Colors2026.text
- Flex: 1, numberOfLines: 1 (mit Ellipsis bei zu langem Text)

#### "Weitere Tasks" Button (bei mehr als 5 Tasks)
- Display: Flex, alignItems: center, justifyContent: center
- Schriftart: Typography2026.small, fontStyle: italic, color: Colors2026.textMuted
- Text: "+{remainingTasks} weitere anzeigen"
- Bei Press: onMotivationPress ausführen (navigiert zur Tasks-Seite)

## Interaktionen & Zustände

### Standardzustand
- Karte zeigt motivierenden Text mit nach unten zeigendem Pfeil-Icon
- Bei Hover/Druck: leichte Hintergrundfarbänderung für Feedback

### Expanded Zustand
- Pfeil-Icon rotiert um 90° nach oben
- Dropdown-Panel erscheint mit animiertem Fade-In (200ms)
- Bei mehr als 5 Tasks: "Weitere Tasks" Button am Ende

### Task-Item Zustände
- Standard: Transparenter Hintergrund, dünner border
- Bei Press: Hintergrund: rgba(45,157,79,0.08) für Touch-Feedback
- Bei abgeschlossener Task: Checkbox mit Hintergrund: Colors2026.primary

### Accessibility
- Alle interaktive Elemente haben accessibilityRole="button"
- Beschriftungen für Screenreader:
  - Motivations-Row: "Aufgaben anzeigen" (geschlossen) oder "Aufgaben einklappen" (offen)
  - Aufgaben-Checkbox: "Task [Titel] abschließen" oder "Task [Titel] wieder öffnen"
  - Pflanze-Info-Button: "Pflanzeninformationen anzeigen"
  - Aufgaben-Count-Badge: "[Anzahl] offene Aufgaben"
  - Pfeil-Icon: "Dropdown öffnen" oder "Dropdown schließen"
- Fokus-Indikator für alle interaktiven Elemente (2px solid Colors2026.primary)
- Mindest-Touch-Ziel: 44x44px gemäß WCAG
- Kontrast: Text auf Hintergrund erfüllt mindestens WCAG AA (4.5:1)

## Animations
- Dropdown Öffnen/Schließen: Fade-In/Fade-Out mit 200ms Dauer
- Pfeil-Rotation: Sanfte Drehung mit 150ms Dauer
- Task-Item Druck: Skalierung auf 95% für 100ms bei Press
- Beim Umschalten einer Task: Kurzer "Puff"-Effekt bei der Checkbox

## Fehlerzustände
- Bei fehlenden Aufgaben-Daten: Zeige laden-Indicator im Dropdown
- Bei Fehler beim Laden: Zeige "Fehler beim Laden der Aufgaben" mit Wiederholen-Button
- Bei keiner Pflanze mit offenen Aufgaben: Zeige "Keine offenen Aufgaben mehr! 🌿"

## Datenfluss
1. HomeScreen ruft getMotivationMessage() aus gamificationService auf
2. Dieser gibt Pflanze mit ältester offener Aufgabe zurück (basierend auf Pflanzenalter oder Task-Erstellungsdatum)
3. HomeScreen übergibt pendingTasks-Array an GamificationBar-Komponente (wird erweitert)
4. Bei Zustandsänderung wird der Zustand durch useState managed
5. Beim Umschalten einer Task wird der Homescreen-Daten-Cache aktualisiert
6. Nach erfolgreichem Umschalten: kurze Verzögerung, dann Neu-Laden der Motivationsdaten

## Komponenten-Erweiterung
Die bestehende GamificationBar-Komponente wird um folgende Props erweitert:
- pendingTasks: Array von TaskPreview-Objekten
- onTaskPlantPress: Funktion zum Navigieren zur Pflanzendetailseite bei Klick auf Pflanzennamen
Die sonstige Funktionalität bleibt unverändert.

## Stiltokens (aus designSystemV2)
- Farben: Colors2026.primary, Colors2026.bg, Colors2026.text, etc.
- Abstände: Spacing2026.xs, sm, md, lg, xl, xxl
- Border Radius: Radius2026.round, sm, md, lg, lg
- Schriftgrößen: Typography2026.caption, body, small, headline
- Schatten: Shadows2026.md
- Glas-Effekt: Wie in GlassCard-Komponente verwendet

## Dateistruktur
- src/components/ui/GamificationBar.tsx (erweitert)
- Keine neuen Dateien erforderlich (Erweiterung bestehender Komponente)

## Offene Fragen und Potenzielle Lösungen
1. **Pflanze-Auswahlkriterium**
   - Aktuell: Pflanze mit ältester offener Aufgabe
   - Alternative A: Pflanze mit meisten offenen Aufgaben (höchste Dringlichkeit)
   - Alternative B: Pflanze mit frühestem Fälligkeitsdatum der offenen Tasks
   - Empfehlung: Bei Gleichstand nach ältester Aufgabe entscheiden, da dies längere Vernachlässigung anzeigt

2. **Neu-Laden Verzögerung nach Task-Umschalten**
   - Aktuell geplant: 100ms
   - Alternative A: Sofortiges Neu-Laden (0ms) für unmittelbare Feedback
   - Alternative B: 300ms für bessere visuelle Bestätigung der Änderung
   - Empfehlung: 150ms als Kompromiss zwischen Responsivität und visuellem Feedback

3. **Dropdown-Verhalten beim Scrollen**
   - Aktuell unentschieden
   - Alternative A: Dropdown schließt sich bei Scrollen im Hintergrund
   - Alternative B: Dropdown bleibt offen bis explizite Schließung
   - Alternative C: Dropdown bleibt offen, zieht aber mit dem Inhalt nach (wie bei iOS)
   - Empfehlung: Alternative A (schließt bei Scrollen) für konsistentes Verhalten mit anderen Dropdowns im System

4. **Leerzustand Kommunikation**
   - Aktuell: Zur nächsten Pflanze mit offenen Aufgaben wechseln
   - Alternative A: Generische Motivationsnachricht zeigen ("Alle Tasks erledigt! 🌻")
   - Alternative B: Karte komplett ausblenden bei keinen offenen Tasks gesamt
   - Empfehlung: Bei einzelnen Pflanze-Wechsel, bei gesamtem Leerzustand Option B (Ausblenden) für saubereres UI