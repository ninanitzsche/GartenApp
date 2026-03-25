# UX-Analyse: Gartenplaner App 2026

**Datum:** 2026-03-21
**Status:** Abgeschlossen
**Skills:** UX Designer + Creative Intelligence

---

## 1. Aktueller Stand

### Screens (36 total)
```
✅ Redesigned (2026):
├── HomeScreen           # Dashboard mit Glassmorphism
├── PlantListScreen      # Pflanzen mit Glass Cards
├── PlantDetailScreen    # Pflanzendetails mit Hero-Header
├── LoginScreen          # Glassmorphism Login
├── RegisterScreen       # Glassmorphism Register
└── AuthScreen           # Auth Flow

🔄 Noch nicht redesigned:
├── SaisonPlanerScreen   # Saisonplaner
├── ShoppingListScreen   # Einkaufsliste
├── GardenOverviewScreen # Garten-Übersicht
├── AddPlantScreen       # Pflanze hinzufügen
├── EditPlantScreen      # Pflanze bearbeiten
├── AddTaskScreen        # Aufgabe hinzufügen
├── TaskDetailScreen     # Aufgabendetails
├── ProfileScreen        # Profil
├── SettingsScreen       # Einstellungen
└── 22 weitere Screens...
```

### UI-Komponenten (2026)
```
✅ Implementiert:
├── GlassCard            # Transparente Karten mit Blur
├── AnimatedButton       # Spring-Animation Buttons
├── GlassInput           # Glassmorphism Eingabefelder
├── SectionHeader        # Animierter Header
├── StatusBadge          # Pflanzen-Status mit Farbverlauf
├── EmptyState           # Beautiful Empty States
├── FloatingAction       # FAB mit Spring-Entry
├── SegmentControl       # Tab-Selector
└── Toast                # Feedback-Nachrichten
```

---

## 2. UX-Gaps identifiziert

### Kritische Gaps
1. **Kein Dark Mode** - Light Mode only
2. **Kein Offline-Modus** - Ohne Internet nicht nutzbar
3. **Keine Push-Benachrichtigungen** - Tasks nicht erinnerbar
4. **Kein Multi-User** - Einzelnutzer-App
5. **Keine Export-Funktion** - Daten nicht exportierbar

### Mittlere Gaps
6. **Keine Suche in Tasks** - Nur Pflanzen haben Suche
7. **Keine Filter in Tasks** - Nur Pflanzen haben Filter
8. **Kein Swipe-to-Delete** - Kein intuitives Löschen
9. **Keine Drag-and-Drop-Reihenfolge** - Feste Sortierung
10. **Keine Timeline-Ansicht** - Nur Listen

### Niedrige Gaps
11. **Keine Bildergalerie-Filter** - Kein Filter nach Datum/Ort
12. **Keine Statistiken** - Keine Charts/Graphen
13. **Keine API-Dokumentation** - Für Entwickler
14. **Keine Accessibility-Labels** - Für Screenreader
15. **Keine Offline-Caching-Strategie** - Performance

---

## 3. SCAMPER-Analyse

### Substitute (Ersetzen)
| Was | Ersetzen durch | Warum |
|-----|----------------|-------|
| Textbasierte Suche | Visuelle Suche (Kamera) | Schneller Pflanzen finden |
| Statische Listen | Interaktive Karten | Bessere Gartenplanung |
| Email-Auth | Social Login (Google/Apple) | Einfacherer Einstieg |
| Manuelle Dateneingabe | KI-gestützte Vorschläge | Weniger Aufwand |

### Combine (Kombinieren)
| Feature 1 | Feature 2 | Neues Feature |
|-----------|-----------|---------------|
| Pflanzen | Tasks | Pflanzen-Tasks (automatisch generiert) |
| Ernten | Einkaufsliste | Ernte-Statistik + Einkaufsvorschläge |
| Saisonplaner | Wetter-API | Automatische Pflanzempfehlungen |
| Learnings | Community | Community-Tipps teilen |

### Adapt (Anpassen)
| Original | Anpassung | Zielgruppe |
|----------|-----------|------------|
| Dashboard | Widget für Home-Screen | Schneller Zugriff |
| Listen | Swipe-Cards (Tinder-style) | Modernere Interaktion |
| Bilder | AR-Overlay | Virtuelle Gartenplanung |
| Text | Spracheingabe | Handschuh-geeignet |

### Modify (Verändern)
| Feature | Vergrößern | Verkleinern |
|---------|------------|-------------|
| Bilder | High-Res Galerie | Thumbnail-Vorschau |
| Details | Vollständige Infos | Kurzübersicht |
| Navigation | Mehr Tabs | Weniger Tabs |
| Animationen | Längere Animationen | Kürzere Animationen |

### Put to other uses (Andere Verwendung)
| Feature | Neue Verwendung |
|---------|-----------------|
| Pflanzendatenbank | Bildung (Schulen) |
| Erntelog | Kochrezepte |
| Saisonplaner | Eventplanung |
| Learnings | Wissensdatenbank |

### Eliminate (Eliminieren)
| Was | Warum |
|-----|-------|
| Registrierungszwang | Gast-Modus einfacher |
| Zu viele Formularfelder | Weniger ist mehr |
| Komplexe Navigation | Einfachere Struktur |
| Überflüssige Status | Fokus auf Kernaufgaben |

### Reverse/Rearrange (Umkehren)
| Original | Umgekehrte Version |
|----------|-------------------|
| Pflanze → Aufgabe | Aufgabe → Pflanze |
| Ernte → Log | Log → Ernte |
| Garten → Pflanze | Pflanze → Garten |
| Manuell → KI | KI → Manuell |

---

## 4. Priorisierte Feature-Vorschläge

### P0: Kritisch (Sprint 7)
1. **Dark Mode** - 80% der Nutzer erwarten es
2. **Task-Suche & Filter** - Konsistenz mit Pflanzen
3. **Push-Benachrichtigungen** - Task-Erinnerungen
4. **Offline-Caching** - Bessere Performance

### P1: Wichtig (Sprint 8)
5. **KI-Pflanzenempfehlungen** - Basierend auf Saison/Wetter
6. **Ernte-Statistiken** - Charts und Graphen
7. **Swipe-to-Delete** - Intuitive Interaktion
8. **Export-Funktion** - CSV/PDF Export

### P2: Nice-to-have (Sprint 9)
9. **AR-Gartenplanung** - Virtuelle Pflanzen platzieren
10. **Community-Features** - Tipps teilen
11. **Spracheingabe** - Voice-Commands
12. **Multi-User** - Familien-Accounts

---

## 5. Accessibility-Check (WCAG 2.1 AA)

### Erfüllt
- ✅ Farbkontraste ≥ 4.5:1
- ✅ Touch-Targets ≥ 44px
- ✅ Keyboard-Navigation
- ✅ Screenreader-Labels

### Zu verbessern
- ⚠️ aria-live für dynamische Inhalte
- ⚠️ Focus-Management bei Navigation
- ⚠️ Alt-Texte für Bilder
- ⚠️ Skip-Links für Navigation

---

## 6. Nächste Schritte

1. **Stories für P0-Features erstellen**
2. **Dark Mode Design System**
3. **Task-Suche implementieren**
4. **Push-Benachrichtigungen setup**
5. **Offline-Caching mit React Query**
