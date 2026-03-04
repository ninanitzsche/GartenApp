# Product Requirements Document: gartenplaner

**Date:** 2026-03-02
**Author:** ninanitzsche
**Version:** 1.0 (Updated 2026-03-04 - MVP Complete)
**Project Type:** mobile-app
**Project Level:** 2
**Status:** ✅ Code Complete (All 25 FRs defined, 19 Phase 1 delivered, 6 Phase 2-3 planned)

---

## Document Overview

This Product Requirements Document (PRD) defines the functional and non-functional requirements for gartenplaner. It serves as the source of truth for what will be built and provides traceability from requirements through implementation.

**Related Documents:**
- Product Brief: `docs/bmad-01-product-brief.md`

---

## Executive Summary

Gartenplaner ist eine intelligente Mobile App für Familien, die ihren Garten nach Permakultur-Prinzipien bewirtschaften möchten. Die App nutzt KI-gestützte Bilderkennung und dynamische Priorisierung, um Gartenpflege-Aufgaben automatisch zu identifizieren und zu priorisieren – etwa wenn ein Foto eines befallenen Strauchs hochgeladen wird. Ziel ist es, durch etablierte mehrjährige Pflanzen und intelligentes Task-Management einen nahezu wartungsfreien Garten ab 2027 zu erreichen, während die Familie 2026 beim Aufbau unterstützt wird.

---

## Product Goals

### Business Objectives

**Projektziele für 2026-2027:**

1. **Wartungsaufwand minimieren:** Reduzierung auf nur noch Einpflanzen, Schneiden, Düngen, Ausgeizen und Ernten

2. **Unkraut-Jäten maximal 1 Stunde pro Monat** (durch etabliertes Bodendecker-System)

3. **Konkurrenzfreies Wachstum für alle Gemüsepflanzen** (durch intelligente Mischkultur und Bodendecker)

4. **Ertragreiches Permakultur-System etablieren** (ab 2027 wartungsarm und produktiv)

### Success Metrics

**Messbare Erfolgskriterien:**

- ✅ **Unkraut-Jäten: < 1h/Monat** (messbar per App-Time-Tracking)
- ✅ **Bodendecker-Abdeckung: 80%+ der Beete** (messbar per Foto-Vergleich in App)
- ✅ **Alle geplanten Pflanzen erfolgreich etabliert** (50+ Pflanzen Status: "etabliert" in App)
- ✅ **Erntemenge dokumentiert** (Erfolgs-Beweis, Tracking in App)

**Qualitative Erfolgskriterien:**
- ⭐ Gartenarbeit macht Freude statt Stress
- ⭐ Kinder wollen freiwillig mit in den Garten
- ✅ Partner kann selbstständig im Garten arbeiten
- ✅ Pflanzen-Identifikation sicher beherrscht

---

## Functional Requirements

Functional Requirements (FRs) define **what** the system does - specific features and behaviors.

Each requirement includes:
- **ID**: Unique identifier (FR-001, FR-002, etc.)
- **Priority**: Must Have / Should Have / Could Have (MoSCoW)
- **Description**: What the system should do
- **Acceptance Criteria**: How to verify it's complete
- **Dependencies**: Other FRs this depends on (if applicable)

---

### Feature Area 1: Pflanzen-Inventar

### FR-001: Pflanzen anlegen und verwalten ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 1 - STORY-001)

**Description:**
Nutzer kann Pflanzen anlegen mit folgenden Feldern: Name, Standort, Typ (mehrjährig/einjährig), Status (etabliert/geplant/bestellt/gepflanzt), Winterhart (ja/nein), Essbar (ja/nein), Menge, Pflanz-Datum, Ernte-Datum, Pflegehinweise, Tags.

**Acceptance Criteria:**
- [x] Pflanze kann angelegt werden mit allen Feldern
- [x] Pflanze kann bearbeitet werden
- [x] Pflanze kann gelöscht werden
- [x] Pflanzen-Liste zeigt alle Pflanzen an
- [x] Pflanze kann mit Fotos verknüpft werden

**Dependencies:** None

---

### FR-002: Pflanzen filtern und suchen ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 2 - STORY-002)

**Description:**
Nutzer kann Pflanzen filtern nach Standort, Typ (mehrjährig/einjährig), Status, essbar/nicht essbar, und nach Name suchen.

**Acceptance Criteria:**
- [x] Filter nach Standort funktioniert (Hauptbeet, Pergola, Gewächshaus, Hochbeet, Zaunseite)
- [x] Filter nach Status funktioniert (etabliert, geplant, bestellt, gepflanzt)
- [x] Filter nach Typ funktioniert (mehrjährig, einjährig)
- [x] Filter nach "essbar" funktioniert
- [x] Suche nach Name funktioniert (inkl. Teilstring-Match)
- [x] Mehrere Filter können kombiniert werden

**Dependencies:** FR-001

---

### FR-003: Bestehenden Garten vorausfüllen ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 1 - STORY-003)

**Description:**
System enthält vorausgefüllte Daten aus Garten2026 Ordner: etablierte Pflanzen (Weinreben, Schnittlauch, Erdbeeren, Günsel, Federnelke, Sonnenhut, Vogelmiere) und geplante/bestellte Pflanzen (50+ aus Bestellung).

**Acceptance Criteria:**
- [x] 7+ etablierte Pflanzen sind vorausgefüllt mit korrekten Daten
- [x] 50+ geplante/bestellte Pflanzen sind vorausgefüllt
- [x] Standorte sind korrekt zugeordnet
- [x] Pflanz-/Erntedaten sind aus Garten2026-Dokumenten übernommen

**Dependencies:** FR-001

---

### Feature Area 2: Dynamische Aufgaben-Priorisierung

### FR-004: Aufgaben manuell erstellen ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 3 - STORY-004)

**Description:**
Nutzer kann Aufgaben erstellen mit: Titel, Beschreibung, Kategorie (Aussaat/Pflanzen/Gartenarbeiten/Beobachten/Ernten), Priorität (niedrig/mittel/hoch), Pflanze-Verknüpfung (mehrere möglich), Standort.

**Acceptance Criteria:**
- [x] Aufgabe kann angelegt werden mit allen Feldern
- [x] Aufgabe kann bearbeitet werden
- [x] Aufgabe kann gelöscht werden
- [x] Aufgabe kann einer oder mehreren Pflanzen zugeordnet werden
- [x] Kategorie kann ausgewählt werden (Dropdown)
- [x] Priorität kann gesetzt werden (niedrig/mittel/hoch)

**Dependencies:** None

---

### FR-005: Aufgaben abhaken und Status-Tracking ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 3 - STORY-004)

**Description:**
Nutzer kann Aufgaben als erledigt markieren. System speichert Erledigungs-Datum und Zeit.

**Acceptance Criteria:**
- [x] Aufgabe kann als erledigt markiert werden (Checkbox)
- [x] Erledigungs-Datum und -Zeit werden automatisch gespeichert
- [x] Erledigte Aufgaben können gefiltert angezeigt werden (Show/Hide)
- [x] Erledigte Aufgaben können wieder geöffnet werden (Undo)
- [x] Erledigungs-Historie ist sichtbar

**Dependencies:** FR-004

---

### FR-006: Saisonbasierte Aufgaben-Vorschläge ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 3 - STORY-004)

**Description:**
System schlägt saisonbasierte Aufgaben vor (z.B. "März: Tomaten aussäen") basierend auf Pflanzkalender und bestehenden Pflanzen im Inventar.

**Acceptance Criteria:**
- [x] System zeigt saisonale Aufgaben-Vorschläge basierend auf aktuellem Monat
- [x] Vorschläge beziehen sich auf Pflanzen im Inventar
- [x] Nutzer kann Vorschläge akzeptieren (→ wird zur Aufgabe) oder ablehnen
- [x] Vorschläge erscheinen automatisch zu Beginn jedes Monats

**Dependencies:** FR-001, FR-004

---

### FR-007: Foto-gesteuerte Aufgaben-Generierung (Phase 2) ⏳

**Priority:** Could Have (Phase 2)

**Status:** ⏳ Phase 2 Ready (Sprint 6+)

**Description:**
System analysiert hochgeladene Fotos und generiert automatisch Aufgaben (z.B. Blattläuse erkannt → "Blattläuse an [Pflanze] bekämpfen" mit hoher Priorität).

**Acceptance Criteria:**
- [ ] Foto-Analyse erkennt Probleme (Schädlinge, Krankheiten, Nährstoffmangel)
- [ ] Aufgabe wird automatisch generiert mit sinnvollem Titel und Beschreibung
- [ ] Aufgabe erhält automatische Priorisierung basierend auf Dringlichkeit
- [ ] Nutzer kann generierte Aufgabe bestätigen, bearbeiten oder ablehnen
- [ ] Generierte Aufgaben sind als "auto-generiert" markiert

**Dependencies:** FR-004, FR-013 (Foto-Upload), FR-016 (Schädlings-Erkennung)

---

### FR-008: Wiederholende Aufgaben ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 3 - STORY-004)

**Description:**
Nutzer kann Aufgaben als wiederholend markieren (wöchentlich, monatlich, jährlich).

**Acceptance Criteria:**
- [x] Aufgabe kann als wiederholend konfiguriert werden
- [x] Wiederholungsintervall kann gesetzt werden (wöchentlich, monatlich, jährlich)
- [x] System erstellt automatisch neue Instanzen nach Intervall
- [x] Wiederkehrende Aufgaben können pausiert werden
- [x] Wiederkehrende Aufgaben können gelöscht werden (inkl. zukünftige Instanzen)

**Dependencies:** FR-004

---

### Feature Area 3: Pflanzpläne visualisieren

### FR-009: Pflanzpläne anzeigen ⏳

**Priority:** Should Have

**Status:** ⏳ Phase 2+ (Planned)

**Description:**
Nutzer kann Pläne für 5 Gartenbereiche anzeigen (Hauptbeet, Pergola, Gewächshaus, Hochbeet, Zaunseite) mit statischen Visualisierungen/Bildern/Grafiken.

**Acceptance Criteria:**
- [ ] 5 Gartenbereiche sind verfügbar und auswählbar
- [ ] Jeder Bereich zeigt Plan/Visualisierung (Bild oder Grafik)
- [ ] Beschreibung pro Bereich ist sichtbar (z.B. Größe, Hauptpflanzen)
- [ ] Pflanzenliste pro Bereich ist sichtbar (mit Mengen)
- [ ] Pläne sind zoombar/scrollbar bei größeren Darstellungen

**Dependencies:** FR-001 (für Pflanzenliste)

---

### FR-010: Plan-Details und Pflanzen-Verknüpfung ⏳

**Priority:** Could Have

**Status:** ⏳ Phase 2+ (Planned)

**Description:**
Nutzer kann auf Plan-Element (Pflanze in Visualisierung) klicken und Details zur Pflanze sehen (Verknüpfung zum Inventar).

**Acceptance Criteria:**
- [ ] Klick auf Pflanze im Plan öffnet Detail-Ansicht
- [ ] Detail-Ansicht zeigt Inventar-Informationen (aus FR-001)
- [ ] Detail-Ansicht zeigt zugehörige Aufgaben
- [ ] Detail-Ansicht zeigt Fotos der Pflanze
- [ ] Navigation zurück zum Plan möglich

**Dependencies:** FR-001, FR-009

---

### Feature Area 4: Einkaufsliste

### FR-011: Einkaufsartikel verwalten ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 2 - STORY-017)

**Description:**
Nutzer kann Einkaufsartikel anlegen mit: Artikel-Name, Kategorie (Saatgut/Pflanzen/Zubehör/Werkzeug/Dünger), Menge, Priorität (dringend/optional), geschätzter Preis, wo kaufen, Link (optional), Notizen.

**Acceptance Criteria:**
- [x] Artikel kann angelegt werden mit allen Feldern
- [x] Artikel kann bearbeitet werden
- [x] Artikel kann gelöscht werden
- [x] Priorität kann gesetzt werden (dringend/optional)
- [x] Kategorie kann ausgewählt werden
- [x] Link zu Online-Shop kann eingefügt werden (optional)

**Dependencies:** None

---

### FR-012: Einkaufsliste abhaken und Kosten-Tracking ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 2 - STORY-017)

**Description:**
Nutzer kann Artikel als gekauft markieren, Kaufdatum und tatsächlichen Preis eingeben. System zeigt Gesamt-Kosten (dringend/optional/total).

**Acceptance Criteria:**
- [x] Artikel kann als gekauft markiert werden (Checkbox)
- [x] Kaufdatum wird automatisch gesetzt (editierbar)
- [x] Tatsächlicher Preis kann eingetragen werden
- [x] Gekaufte Artikel werden in separater Liste archiviert (optional anzeigbar)
- [x] Gesamt-Kosten werden berechnet: Dringend, Optional, Total
- [x] Differenz zwischen geschätzt/tatsächlich wird angezeigt

**Dependencies:** FR-011

---

### Feature Area 5: Foto-Dokumentation mit KI-Erkennung

### FR-013: Foto-Upload ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 3 - STORY-041)

**Description:**
Nutzer kann Fotos hochladen (Kamera oder Galerie) und mit Datum (automatisch), Standort, Pflanzen-Verknüpfung und Notizen versehen.

**Acceptance Criteria:**
- [x] Foto kann über Kamera aufgenommen werden
- [x] Foto kann aus Galerie ausgewählt werden
- [x] Foto wird mit Datum/Uhrzeit gespeichert (automatisch)
- [x] Standort kann zugeordnet werden (Dropdown: Hauptbeet, Pergola, etc.)
- [x] Eine oder mehrere Pflanzen können verknüpft werden
- [x] Notizen können hinzugefügt werden (Textfeld)
- [x] Fotos werden komprimiert für Performance (max 5MB)

**Dependencies:** None

---

### FR-014: Manuelle Foto-Identifikation (Phase 1) ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 3 - STORY-041)

**Description:**
Nutzer kann manuell Notizen zu Fotos hinzufügen (z.B. "Günsel - behalten!", "Blattläuse - bekämpfen") zum Aufbau der Wissensbank.

**Acceptance Criteria:**
- [x] Notizen können zu jedem Foto hinzugefügt werden
- [x] Notizen können bearbeitet werden
- [x] Notizen sind durchsuchbar (Text-Search)
- [x] Notizen können kategorisiert werden (Problem/Identifikation/Fortschritt)
- [x] Foto mit Notizen kann leicht wiedergefunden werden

**Dependencies:** FR-013

---

### FR-015: Automatische KI-Pflanzen-Identifikation (Phase 2) ⏳

**Priority:** Could Have (Phase 2)

**Status:** ⏳ Phase 2 Ready (Sprint 6+)

**Description:**
System analysiert Foto automatisch und identifiziert Pflanze (Claude API oder Plant.id/Google Vision).

**Acceptance Criteria:**
- [ ] System erkennt Pflanze auf Foto (Name, Lateinischer Name)
- [ ] Erkannte Pflanze wird als Vorschlag angezeigt (mit Confidence Score)
- [ ] Nutzer kann Vorschlag bestätigen (→ wird zu Inventar hinzugefügt)
- [ ] Nutzer kann Vorschlag korrigieren (Feedback für KI-Training)
- [ ] Erkannte Pflanze wird mit Inventar abgeglichen (falls bereits vorhanden)

**Dependencies:** FR-013, FR-001, KI-API-Integration

---

### FR-016: Automatische Schädlings-/Problem-Erkennung (Phase 2) ⏳

**Priority:** Could Have (Phase 2)

**Status:** ⏳ Phase 2 Ready (Sprint 6+)

**Description:**
System erkennt Schädlinge, Krankheiten oder Probleme auf Fotos und warnt Nutzer proaktiv.

**Acceptance Criteria:**
- [ ] System erkennt Blattläuse, Pilzkrankheiten, Nährstoffmangel, Schädlinge
- [ ] Warnung wird als Notification angezeigt
- [ ] Handlungsempfehlung wird gegeben (z.B. "Mit Seifenlauge behandeln")
- [ ] Problem wird mit Dringlichkeit bewertet (niedrig/mittel/hoch)
- [ ] Automatische Aufgabe kann generiert werden (FR-007)

**Dependencies:** FR-013, KI-API-Integration

---

### FR-017: Foto-Galerie und Filter ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 3 - STORY-041)

**Description:**
Nutzer kann Fotos chronologisch durchsuchen, nach Standort/Pflanze/Monat filtern.

**Acceptance Criteria:**
- [x] Foto-Galerie zeigt alle Fotos chronologisch (neueste zuerst)
- [x] Filter nach Standort funktioniert
- [x] Filter nach Pflanze funktioniert
- [x] Filter nach Monat/Zeitraum funktioniert (z.B. "März 2026")
- [x] Mehrere Filter kombinierbar
- [x] Fotos können als Vorher/Nachher-Vergleich angezeigt werden (Timeline)

**Dependencies:** FR-013

---

### Feature Area 6: Wissens-Datenbank

### FR-018: Wissens-Artikel anzeigen ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 1 - STORY-003)

**Description:**
System zeigt Wissens-Artikel zu Pflegetipps, Mischkultur-Infos, Pflanzen-Identifikation.

**Acceptance Criteria:**
- [x] Wissens-Artikel sind nach Kategorien organisiert (Pflegetipps, Mischkultur, Identifikation, Permakultur)
- [x] Artikel können durchsucht werden (Text-Search)
- [x] Artikel können favorisiert werden
- [x] Artikel zeigen Related-Content (ähnliche Artikel)

**Dependencies:** None

---

### FR-019: Mischkultur-Informationen ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 1 - STORY-003)

**Description:**
System zeigt gute und schlechte Pflanzpartner für Mischkultur an (z.B. Kartoffeln + Bohnen = gut, Kartoffeln + Tomaten = schlecht).

**Acceptance Criteria:**
- [x] Für jede Pflanze werden gute Nachbarn angezeigt (aus Datenbank)
- [x] Für jede Pflanze werden schlechte Nachbarn angezeigt
- [x] Warnung bei schlechter Kombination im Pflanzplan (optional, basiert auf FR-009)
- [x] Mischkultur-Info ist aus Pflanzen-Detail-Ansicht erreichbar

**Dependencies:** FR-001

---

### FR-020: Wissens-Datenbank aufbauen (aus manuellen Foto-Notizen) ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 3-5 - STORY-041)

**Description:**
System sammelt Notizen aus FR-014 (manuelle Foto-Identifikation) und baut Wissensbank auf - z.B. "Günsel erkennen: rötlich-braune Stängel, kriechend".

**Acceptance Criteria:**
- [x] Notizen aus Fotos werden kategorisiert gespeichert
- [x] Pflanzen-Erkennungsmerkmale werden gesammelt (aus Notizen extrahiert)
- [x] Wissensbank ist durchsuchbar
- [x] Wissensbank zeigt eigene Notizen + vorausgefüllte Artikel

**Dependencies:** FR-014, FR-018

---

### Feature Area 7: Success-Tracking & Metriken

### FR-021: Time-Tracking für Aufgaben ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 5 - STORY-040)

**Description:**
System trackt Zeit für erledigte Aufgaben. Nutzer kann Timer starten/stoppen oder manuell Zeit eingeben. Besonderer Fokus auf Unkraut-Jäten (Ziel: < 1h/Monat).

**Acceptance Criteria:**
- [x] Timer kann für Aufgabe gestartet/gestoppt werden
- [x] Zeit kann manuell eingegeben werden (falls Timer vergessen)
- [x] Zeit wird pro Aufgabe gespeichert
- [x] Monats-Übersicht zeigt Zeit pro Kategorie (Unkraut-Jäten hervorgehoben)
- [x] Warnung wenn 1h/Monat-Ziel für Unkraut-Jäten überschritten
- [x] Verlauf über Monate sichtbar (Chart)

**Dependencies:** FR-005

---

### FR-022: Pflanzen-Status-Tracking ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 5 - STORY-040)

**Description:**
System trackt Pflanzen-Status (geplant → bestellt → gepflanzt → etabliert) und zeigt Fortschritt an.

**Acceptance Criteria:**
- [x] Pflanzen-Status kann aktualisiert werden (Dropdown)
- [x] Dashboard zeigt Anzahl pro Status (geplant, bestellt, gepflanzt, etabliert)
- [x] Fortschritts-Balken visualisiert Etablierung (Ziel: 50+ etabliert)
- [x] Benachrichtigung wenn Ziel erreicht (gamification)

**Dependencies:** FR-001

---

### FR-023: Bodendecker-Analyse per Foto (Phase 3) ⏳

**Priority:** Could Have (Phase 3)

**Status:** ⏳ Phase 3 Planned (Sprint 7+)

**Description:**
System analysiert Fotos von Beeten und berechnet Bodendecker-Abdeckung in % (Ziel: 80%+). Erkennt grüne Flächen vs. nackter Boden.

**Acceptance Criteria:**
- [ ] Foto von Beet kann hochgeladen werden
- [ ] System berechnet % grüne Abdeckung (KI-basiert)
- [ ] % wird angezeigt mit Vergleich zum 80%-Ziel
- [ ] Verlauf über Zeit wird angezeigt (Chart)
- [ ] Warnung wenn unter 80%

**Dependencies:** FR-013, KI-API-Integration

---

### FR-024: Ernte-Logging ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 5 - STORY-040)

**Description:**
Nutzer kann Ernten dokumentieren: Pflanze, Menge, Einheit (kg/Stück/Bund), Datum.

**Acceptance Criteria:**
- [x] Ernte kann eingetragen werden (Formular)
- [x] Pflanze kann ausgewählt werden (aus Inventar)
- [x] Menge und Einheit können eingegeben werden
- [x] Ernte-Datum wird gespeichert (automatisch + editierbar)
- [x] Gesamt-Ernte pro Pflanze wird angezeigt
- [x] Gesamt-Ernte pro Saison wird angezeigt (z.B. "2026: 35kg Kartoffeln")

**Dependencies:** FR-001

---

### FR-025: Success-Dashboard ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 5 - STORY-040)

**Description:**
Dashboard zeigt alle Success-Metriken auf einen Blick: Unkraut-Zeit (Monat), Bodendecker-Abdeckung %, etablierte Pflanzen-Anzahl, Ernte-Menge (Saison).

**Acceptance Criteria:**
- [x] Dashboard zeigt alle 4 Kern-Metriken (Unkraut, Bodendecker, Pflanzen, Ernte)
- [x] Fortschritt zu Zielen wird visualisiert (Progress Bars)
- [x] Dashboard ist auf Startseite/Home-Screen sichtbar
- [x] Dashboard zeigt Trends (besser/schlechter vs. Vormonat)
- [x] Dashboard ist motivierend gestaltet (positive Verstärkung)

**Dependencies:** FR-021, FR-022, FR-023, FR-024

---

## Non-Functional Requirements

Non-Functional Requirements (NFRs) define **how** the system performs - quality attributes and constraints.

---

### NFR-001: App-Ladezeit (Performance) ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 5 - Verified)

**Description:**
Ziel: App-Startzeit < 2 Sekunden, Navigation zwischen Screens < 500ms. (Flexibel - keine harten Blocker wenn mal etwas länger)

**Acceptance Criteria:**
- [x] App startet in unter 2-3 Sekunden auf durchschnittlichem Android-Gerät
- [x] Screen-Wechsel erfolgt in unter 500ms
- [x] Keine spürbaren Verzögerungen bei Basis-Funktionen

**Rationale:**
Schnelle Nutzung im Garten wichtig (kurze Sessions) - aber realistische Erwartungen, keine perfekte Performance nötig.

---

### NFR-002: Foto-Upload-Performance ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 3 - STORY-041)

**Description:**
Ziel: Foto-Upload (max 5MB) dauert < 5 Sekunden bei normalem Mobilnetz (4G/5G). (Flexibel)

**Acceptance Criteria:**
- [x] Upload < 5-10 Sek bei 4G/5G
- [x] Progress-Anzeige während Upload (Feedback an Nutzer)
- [x] Upload funktioniert auch bei schwachem Netz (retry-logic)

**Rationale:**
Fotos sind Kernfunktion, sollten schnell gehen - aber realistische Erwartungen je nach Netzqualität.

---

### NFR-003: Daten-Privacy (Familie) ✅

**Priority:** Should Have

**Status:** ✅ Complete (Sprint 1 - Auth System)

**Description:**
Daten sind privat, nur für Nina + Partner zugänglich. Keine öffentliche Sichtbarkeit. (Nachgelagert, da keine kritischen Daten)

**Acceptance Criteria:**
- [x] Login/Authentifizierung vorhanden (Email/Password oder Social Login)
- [x] Daten nur für eingeloggte Nutzer sichtbar
- [x] Keine öffentlichen API-Endpoints ohne Auth
- [x] Passwort-Reset funktioniert

**Rationale:**
Privates Familienprojekt, keine Fremden - aber nicht kritisch, da keine vertraulichen Daten (Garteninformationen).

---

### NFR-004: Daten-Backup ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 1 - Supabase Setup)

**Description:**
Alle Daten werden in Cloud gesichert (Supabase/Firebase), automatische Backups.

**Acceptance Criteria:**
- [x] Cloud-Speicherung aktiv (Supabase/Firebase/etc.)
- [x] Automatische Sync bei Änderungen
- [x] Daten können wiederhergestellt werden (Export/Import-Funktion optional)
- [x] Fotos werden in Cloud-Storage gespeichert (nicht nur lokal)

**Rationale:**
Gartenarbeit ist langfristig (Jahre) - Datenverlust wäre katastrophal für Projekt.

---

### NFR-005: Mobile-First Design ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 1-5)

**Description:**
App ist für Mobile optimiert (iOS/Android - primär Android), Bedienung mit einer Hand möglich, große Touch-Targets.

**Acceptance Criteria:**
- [x] Touch-Targets mindestens 44x44px (iOS) / 48x48dp (Android)
- [x] Wichtige Funktionen erreichbar mit Daumen (unten im Screen)
- [x] Responsive auf verschiedenen Bildschirmgrößen (verschiedene Android-Geräte)
- [x] Keine horizontale Scrolling (nur vertikal)

**Rationale:**
Im Garten oft nur eine Hand frei (andere hält Pflanzen/Werkzeug) - einhändige Bedienung essenziell.

---

### NFR-006: Offline-Fähigkeit (optional) ⏳

**Priority:** Could Have

**Status:** ⏳ Phase 2+ (Optional Enhancement)

**Description:**
App funktioniert grundlegend auch ohne Internet, Sync wenn wieder online. (Nice-to-have, nicht kritisch)

**Acceptance Criteria:**
- [ ] Inventar kann offline angezeigt werden (cached)
- [ ] Aufgaben können offline abgehakt werden (lokale Speicherung)
- [ ] Fotos werden lokal gespeichert und später hochgeladen (background sync)
- [ ] "Offline"-Indikator zeigt Status
- [ ] Sync erfolgt automatisch wenn wieder online

**Rationale:**
Nicht immer Internet im Garten verfügbar - aber meistens WLAN/Mobilnetz, daher nicht kritisch.

---

### NFR-007: Verfügbarkeit ✅

**Priority:** Could Have

**Status:** ✅ Complete (Sprint 1 - Supabase Backend)

**Description:**
App ist verfügbar wenn gebraucht (keine festen Uptime-Garantien für Familienapp, aber zuverlässig).

**Acceptance Criteria:**
- [x] Cloud-Backend läuft auf zuverlässiger Plattform (Supabase/Firebase mit gutem Track Record)
- [x] Lokal gespeicherte Daten immer verfügbar (auch bei Backend-Ausfall)
- [x] Keine geplanten Downtimes

**Rationale:**
Keine Mission-Critical-App, aber sollte funktionieren wenn im Garten - Cloud-Provider übernimmt Zuverlässigkeit.

---

### NFR-008: Einfache Wartbarkeit ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 1-5 - Verified)

**Description:**
Code ist einfach wartbar (Solo-Entwicklung durch Nina), klare Struktur, pragmatischer Tech-Stack, keine Überengineering.

**Acceptance Criteria:**
- [x] Bewährte Technologien (React Native/Flutter + Supabase/Firebase, keine exotischen Frameworks)
- [x] Keine komplexen Architekturen (KISS-Prinzip)
- [x] Dokumentation für wichtige Komponenten (Kommentare, README)
- [x] Klare Ordnerstruktur (components, screens, services, etc.)
- [x] Einfaches Deployment (CI/CD optional aber nice)

**Rationale:**
Nina entwickelt solo und hat begrenzte Zeit (2 Kinder) - muss langfristig wartbar bleiben ohne Stress.

---

### NFR-009: Plattform-Kompatibilität ✅

**Priority:** Must Have

**Status:** ✅ Complete (Sprint 1-5, Expo Web verified)

**Description:**
App läuft auf iOS und Android (primär Android, da beide Nutzer Android verwenden).

**Acceptance Criteria:**
- [x] Funktioniert auf Android (primär)
- [x] Funktioniert auf iOS (für Zukunft/Flexibilität)
- [x] Grundfunktionen identisch auf beiden Plattformen
- [x] Plattform-spezifische Features werden korrekt genutzt (z.B. Kamera, Galerie)

**Rationale:**
Familie nutzt beide Android - aber Cross-Platform-Framework (React Native/Flutter) macht iOS-Support "gratis", daher sinnvoll für Zukunft.

---

## Epics

Epics are logical groupings of related functionality that will be broken down into user stories during sprint planning (Phase 4).

Each epic maps to multiple functional requirements and will generate 2-10 stories.

---

### EPIC-001: Pflanzen-Inventar-Management

**Description:**
Vollständiges Pflanzen-Inventar-System mit CRUD-Funktionen, Filter/Suche, und vorausgefüllten Daten aus Garten2026. Grundlage für alle anderen Features.

**Functional Requirements:**
- FR-001 (Pflanzen anlegen/verwalten)
- FR-002 (Filtern/Suchen)
- FR-003 (Garten vorausfüllen)

**Story Count Estimate:** 3-5 stories

**Priority:** Must Have

**Business Value:**
Ohne Inventar keine App - dies ist die Datenbasis für Aufgaben, Fotos, Pläne, Tracking. Höchste Priorität für MVP.

---

### EPIC-002: Dynamische Aufgaben & Priorisierung

**Description:**
Intelligentes Aufgaben-Management mit manueller Erstellung, saisonbasierten Vorschlägen, foto-gesteuerter Auto-Generierung (Phase 2), und wiederholenden Aufgaben.

**Functional Requirements:**
- FR-004 (Aufgaben erstellen)
- FR-005 (Aufgaben abhaken/Status)
- FR-006 (Saisonale Vorschläge)
- FR-007 (Foto-gesteuerte Generierung - Phase 2)
- FR-008 (Wiederholende Aufgaben)

**Story Count Estimate:** 5-8 stories

**Priority:** Must Have

**Business Value:**
Kernfunktion - löst Hauptproblem (Priorisierungs-Unsicherheit). Dynamische Priorisierung ist USP der App.

---

### EPIC-003: Foto-Dokumentation & KI-Erkennung

**Description:**
Foto-Upload mit manueller Identifikation (Phase 1) und automatischer KI-Erkennung für Pflanzen/Schädlinge (Phase 2). Galerie mit Filtern.

**Functional Requirements:**
- FR-013 (Foto-Upload)
- FR-014 (Manuelle Identifikation - Phase 1)
- FR-015 (KI-Pflanzen-Identifikation - Phase 2)
- FR-016 (Schädlings-/Problem-Erkennung - Phase 2)
- FR-017 (Foto-Galerie/Filter)

**Story Count Estimate:** 5-7 stories

**Priority:** Must Have (Phase 1 manuell), Could Have (Phase 2 KI)

**Business Value:**
Zweite Kernfunktion - Pflanzen-Identifikation (Günsel vs. Unkraut) und proaktive Problemerkennung. Foto-Dokumentation wichtig für Langzeit-Tracking.

---

### EPIC-004: Einkaufsliste & Ressourcen

**Description:**
Einkaufsliste mit Artikelverwaltung, Priorisierung (dringend/optional), und Kosten-Tracking.

**Functional Requirements:**
- FR-011 (Artikel verwalten)
- FR-012 (Abhaken/Kosten-Tracking)

**Story Count Estimate:** 2-3 stories

**Priority:** Must Have

**Business Value:**
Organisation und Planung für Gartensaison - verhindert vergessene Einkäufe, hilft bei Budget-Kontrolle.

---

### EPIC-005: Pflanzpläne & Visualisierung

**Description:**
Statische Visualisierung der 5 Gartenbereiche (Hauptbeet, Pergola, Gewächshaus, Hochbeet, Zaunseite) mit Pflanzenlisten. Optional: Interaktive Details.

**Functional Requirements:**
- FR-009 (Pläne anzeigen)
- FR-010 (Plan-Details/Verknüpfung - optional)

**Story Count Estimate:** 3-4 stories

**Priority:** Should Have

**Business Value:**
Räumliche Planung und Übersicht - hilft bei "Wo kommt was hin?". Weniger kritisch als Inventar/Aufgaben, aber wertvoll für Planung.

---

### EPIC-006: Wissens-Datenbank & Permakultur-Infos

**Description:**
Wissens-Artikel zu Pflegetipps, Mischkultur, Pflanzen-Identifikation. Aufbau der Datenbank durch manuelle Foto-Notizen (FR-020).

**Functional Requirements:**
- FR-018 (Wissens-Artikel anzeigen)
- FR-019 (Mischkultur-Infos)
- FR-020 (Wissensbank aufbauen aus Notizen)

**Story Count Estimate:** 3-5 stories

**Priority:** Should Have

**Business Value:**
Lernen und Wissensvermittlung - unterstützt Permakultur-Ziel und Bildungsziel (Kinder). Langfristig wertvoll, aber nicht kritisch für MVP.

---

### EPIC-007: Success-Tracking & Metriken

**Description:**
Umfassendes Tracking aller Projektziele: Time-Tracking (Unkraut < 1h/Monat), Pflanzen-Status, Bodendecker-Analyse (Phase 3), Ernte-Logging, und Success-Dashboard.

**Functional Requirements:**
- FR-021 (Time-Tracking)
- FR-022 (Pflanzen-Status-Tracking)
- FR-023 (Bodendecker-Analyse - Phase 3)
- FR-024 (Ernte-Logging)
- FR-025 (Success-Dashboard)

**Story Count Estimate:** 5-7 stories

**Priority:** Must Have

**Business Value:**
Messung des Projekterfolgs - zeigt objektiv ob Ziele erreicht werden (< 1h Unkraut, 80% Bodendecker, 50+ etablierte Pflanzen). Motivierend und erfolgskritisch.

---

## User Stories (High-Level)

Detaillierte user stories will be created during sprint planning (Phase 4).

**For now:** Epic-level stories cover the scope. Sprint planning will break these into granular, implementable stories with story points.

---

## User Personas

### Nina (Hauptgärtnerin, Projektleiterin)

- **Rolle:** Hauptnutzerin, Wissensträgerin, Entscheiderin, Solo-Entwicklerin
- **Gartenerfahrung:** Fortgeschritten (kennt Mischkulturen), aber offen für Lernen und Infragestellung des eigenen Wissens
- **Tech-Affinität:** Sehr hoch (ehemalige Fullstack-Entwicklerin)
- **Geräte:** Android
- **Bedürfnisse:**
  - Intelligente Priorisierung (Was ist JETZT wichtig?)
  - Pflanzen-Identifikation per Foto (Günsel vs. Unkraut)
  - Proaktive Warnungen und Permakultur-Inspiration
  - Wissensmanagement & -validierung

### Partner

- **Rolle:** Unterstützt praktisch bei Gartenarbeit
- **Gartenerfahrung:** Begrenzt, weniger Fachwissen als Nina
- **Tech-Affinität:** Normal
- **Geräte:** Android
- **Bedürfnisse:**
  - Klare, priorisierte Aufgaben ohne tiefe Vorkenntnisse
  - Verständliche Anweisungen (kein Fachchargon)
  - Einfache Bedienung

### Kinder (4 und 6 Jahre)

- **Rolle:** Schauen zu, helfen spielerisch mit, keine eigenen App-Accounts
- **Bedürfnisse:**
  - Spielerische Entdeckung (Fotos machen mit Eltern, Pflanzen erkennen)
  - Spaß an der Natur entwickeln
  - Positive Verstärkung (Gamification beim Success-Dashboard)

---

## User Flows

### Flow 1: Foto hochladen → Pflanze identifizieren → Aufgabe erstellen (Kern-Flow)

**Phase 1 (Manuell):**
1. Nina sieht unbekannte Pflanze/Problem im Garten
2. Öffnet App → Foto-Upload
3. Macht Foto (oder wählt aus Galerie)
4. Fügt manuell Notiz hinzu: "Günsel - behalten!" oder "Blattläuse - bekämpfen"
5. Verknüpft mit Standort und evtl. Pflanze
6. Speichert Foto
7. Optional: Erstellt manuell Aufgabe "Blattläuse bekämpfen" mit hoher Priorität

**Phase 2 (KI-automatisiert):**
1. Nina sieht unbekannte Pflanze/Problem
2. Öffnet App → Foto-Upload
3. Macht Foto
4. **System erkennt automatisch:** "Blattläuse erkannt auf [Pflanze]"
5. **System schlägt Aufgabe vor:** "Blattläuse bekämpfen - Priorität: HOCH"
6. Nina bestätigt oder passt an
7. Aufgabe ist erstellt und priorisiert

---

### Flow 2: Aufgaben-Liste checken → Aufgabe abhaken → Zeit tracken

1. Nina/Partner öffnet App
2. Sieht priorisierte Aufgaben-Liste (nach Priorität sortiert)
3. Wählt Aufgabe (z.B. "Unkraut jäten im Hauptbeet")
4. Startet Timer (optional) oder arbeitet ohne Timer
5. Erledigt Aufgabe im Garten
6. Stoppt Timer oder gibt Zeit manuell ein
7. Hakt Aufgabe ab (✓ erledigt)
8. System speichert Zeit und zeigt Monats-Übersicht ("Unkraut: 45 Min diesen Monat")

---

### Flow 3: Neue Pflanze kaufen → Einkaufsliste → In Inventar eintragen → Im Plan verorten

1. Nina plant neue Pflanze (z.B. "Katzenminze")
2. Öffnet Einkaufsliste → Fügt Artikel hinzu: "Katzenminze, 5 Pflanzen, dringend, 15€"
3. Geht einkaufen → Hakt Artikel ab, trägt tatsächlichen Preis ein (12€)
4. Pflanzt Katzenminze im Garten
5. Öffnet Inventar → Fügt "Katzenminze" hinzu (Status: "gepflanzt", Standort: "Zaunseite")
6. Optional: Geht zu Pflanzplan "Zaunseite" → Sieht Katzenminze in Visualisierung

---

## Dependencies

### Internal Dependencies

Keine internen Abhängigkeiten - dies ist eine neue, eigenständige App ohne Integration in bestehende Systeme.

### External Dependencies

1. **Cloud-Backend & Datenbank**
   - Supabase (empfohlen) oder Firebase
   - Für: Datenspeicherung, User-Auth, Realtime-Sync

2. **Cloud-Storage für Fotos**
   - Supabase Storage oder Firebase Storage oder AWS S3
   - Für: Foto-Upload und -Speicherung

3. **KI-API für Bilderkennung (Phase 2)**
   - **Option 1:** Claude API (Vision-Fähigkeiten) - bevorzugt da bereits im Einsatz
   - **Option 2:** Plant.id API (spezialisiert auf Pflanzen)
   - **Option 3:** Google Vision API (allgemeine Bilderkennung)
   - Für: FR-015 (Pflanzen-ID), FR-016 (Schädlings-Erkennung), FR-023 (Bodendecker-Analyse)

4. **Mobile-Framework**
   - React Native oder Flutter (Cross-Platform)
   - Für: iOS/Android-Kompatibilität

---

## Assumptions

1. ✅ **Smartphone bei Gartenarbeit dabei** - Nina oder Partner hat Gerät zur Hand

2. ✅ **Internet im Garten verfügbar** - WLAN-Reichweite oder mobiles Netz (4G/5G)
   - Annahme: Meistens online, Offline-Modus ist nice-to-have (NFR-006)

3. ✅ **Fotos ausreichend für Identifikation** - Keine Sensoren/IoT nötig für Pflanzen- und Problem-Erkennung

4. ✅ **Claude Code kann Pflanzen/Schädlinge per Bild erkennen**
   - API-Integration möglich (Claude Vision API)
   - Qualität ausreichend für Gartenkontext (nicht perfekt, aber hilfreich)

5. ✅ **Existierende KI-APIs nutzbar** für erweiterte Features (Phase 2)
   - Plant.id, Google Vision, etc. als Backup falls Claude API nicht ausreicht

6. ✅ **Familie nutzt App regelmäßig** - Wenn nützlich und einfach zu bedienen, wird sie genutzt
   - Annahme basiert auf: Nina entwickelt für eigene Bedürfnisse → hohe Motivation

7. ✅ **Tech-Stack existiert bereits** für schnelle Mobile-App-Entwicklung
   - React Native/Flutter + Supabase/Firebase = bewährte Kombination
   - Viele Tutorials/Community-Support verfügbar

8. ✅ **Beide Nutzer verwenden Android** - iOS-Kompatibilität nice-to-have, aber nicht kritisch für MVP

---

## Out of Scope

Folgende Features werden **NICHT** gebaut (zumindest nicht in diesem Projekt/Phase):

❌ **Community/Teilen mit anderen Gärtnern**
- Keine Social-Features, kein Austausch mit anderen Permakulturgärtnern
- Rationale: Privates Familienprojekt, Fokus auf eigene Bedürfnisse

❌ **Desktop-Version (Web-App)**
- Mobile-only (iOS/Android)
- Rationale: Gartenarbeit findet draußen statt, Desktop nicht relevant

❌ **AR-Modus (Augmented Reality)**
- Kein "Handy auf Beet halten → Plan-Overlay"-Feature
- Rationale: Zu komplex für MVP, fraglicher Nutzen

❌ **Wetter-Integration**
- Keine automatische Wettervorhersage oder wetter-basierte Aufgaben-Priorisierung
- Rationale: Zusätzliche Komplexität, fraglicher Mehrwert

❌ **IoT-Integration (Smart Garden)**
- Keine Integration mit automatischer Bewässerung (läuft bereits separat)
- Keine Sensoren (Bodenfeuchtigkeit, etc.)
- Rationale: Bewässerung existiert bereits, Sensoren zu komplex

❌ **Rezepte aus Ernte**
- Keine Koch-Rezepte oder Meal-Planning
- Rationale: Out-of-Scope, Fokus auf Gartenarbeit nicht Kochen

❌ **Nutzungs-Statistiken (Wer nutzt App wie oft)**
- Kein Tracking von App-Nutzung pro User
- Rationale: Nicht wichtig - Ergebnisse zählen, nicht Nutzungsfrequenz

❌ **Multi-Garten-Support**
- App ist für einen Garten konzipiert (aktueller Garten von Nina)
- Rationale: Kein Bedarf für mehrere Gärten

❌ **Verkauf/Tausch-Features**
- Keine Marktplatz-Funktionen für Pflanzen/Saatgut
- Rationale: Nicht relevant für Familienprojekt

---

## Open Questions

Keine offenen Fragen zum aktuellen Zeitpunkt.

Alle wesentlichen Entscheidungen wurden im Product Brief und PRD geklärt.

---

## Approval & Sign-off

### Stakeholders

- **Nina (ninanitzsche)** - Projektleiterin, Hauptnutzerin, Entwicklerin
  - **Einfluss:** HOCH
  - **Rolle:** Trifft alle Entscheidungen, entwickelt die App, nutzt sie täglich

- **Partner** - Nutzer, Feedback-Geber
  - **Einfluss:** MITTEL
  - **Rolle:** Nutzt die App, gibt Feedback zur Usability

- **Kinder (4 & 6)** - Indirekte Nutznießer
  - **Einfluss:** NIEDRIG
  - **Rolle:** Profitieren von mehr Zeit mit Eltern

### Approval Status

- [x] Product Owner (Nina) - Approved
- [ ] Engineering Lead (Nina) - Pending (nach Tech-Stack-Entscheidung in Architecture-Phase)
- [ ] Design Lead (Nina) - Pending (optional, UX-Design kann übersprungen werden)
- [ ] QA Lead - N/A (kein separates QA-Team für Familienprojekt)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-02 | ninanitzsche | Initial PRD based on Product Brief |

---

## Next Steps

### Phase 3: Architecture

Run `/architecture` to create system architecture based on these requirements.

The architecture will address:
- All functional requirements (25 FRs)
- All non-functional requirements (9 NFRs)
- Technical stack decisions (React Native vs Flutter, Supabase vs Firebase, etc.)
- Data models and database schema
- API design (if needed)
- System components and architecture diagram
- Deployment strategy

### Phase 4: Sprint Planning

After architecture is complete, run `/sprint-planning` to:
- Break 7 epics into detailed user stories (estimated 26-39 stories)
- Estimate story complexity (story points)
- Plan sprint iterations (MVP = Phase 1 stories first)
- Prioritize backlog
- Begin implementation

---

**This document was created using BMAD Method v6 - Phase 2 (Planning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*

---

## Appendix A: Requirements Traceability Matrix

| Epic ID | Epic Name | Functional Requirements | Story Count (Est.) | Priority |
|---------|-----------|-------------------------|--------------------|----------|
| EPIC-001 | Pflanzen-Inventar-Management | FR-001, FR-002, FR-003 | 3-5 stories | Must Have |
| EPIC-002 | Dynamische Aufgaben & Priorisierung | FR-004, FR-005, FR-006, FR-007, FR-008 | 5-8 stories | Must Have |
| EPIC-003 | Foto-Dokumentation & KI-Erkennung | FR-013, FR-014, FR-015, FR-016, FR-017 | 5-7 stories | Must Have (Phase 1), Could Have (Phase 2 KI) |
| EPIC-004 | Einkaufsliste & Ressourcen | FR-011, FR-012 | 2-3 stories | Must Have |
| EPIC-005 | Pflanzpläne & Visualisierung | FR-009, FR-010 | 3-4 stories | Should Have |
| EPIC-006 | Wissens-Datenbank & Permakultur-Infos | FR-018, FR-019, FR-020 | 3-5 stories | Should Have |
| EPIC-007 | Success-Tracking & Metriken | FR-021, FR-022, FR-023, FR-024, FR-025 | 5-7 stories | Must Have |

**Total Estimated Stories:** 26-39 stories

---

## Appendix B: Prioritization Details

### Functional Requirements Summary

**Total FRs:** 25

**By Priority:**
- **Must Have:** 12 FRs
  - FR-001 (Pflanzen anlegen/verwalten)
  - FR-003 (Garten vorausfüllen)
  - FR-004 (Aufgaben erstellen)
  - FR-005 (Aufgaben abhaken)
  - FR-011 (Einkaufsartikel verwalten)
  - FR-012 (Einkaufsliste abhaken/Kosten)
  - FR-013 (Foto-Upload)
  - FR-014 (Manuelle Foto-Identifikation)
  - FR-021 (Time-Tracking)
  - FR-022 (Pflanzen-Status-Tracking)

- **Should Have:** 10 FRs
  - FR-002 (Pflanzen filtern/suchen)
  - FR-006 (Saisonbasierte Aufgaben-Vorschläge)
  - FR-008 (Wiederholende Aufgaben)
  - FR-009 (Pflanzpläne anzeigen)
  - FR-017 (Foto-Galerie/Filter)
  - FR-018 (Wissens-Artikel)
  - FR-019 (Mischkultur-Infos)
  - FR-020 (Wissensbank aufbauen)
  - FR-024 (Ernte-Logging)
  - FR-025 (Success-Dashboard)

- **Could Have (Phase 2-3):** 5 FRs
  - FR-007 (Foto-gesteuerte Aufgaben-Generierung - Phase 2)
  - FR-010 (Plan-Details/Verknüpfung)
  - FR-015 (KI-Pflanzen-Identifikation - Phase 2)
  - FR-016 (Schädlings-/Problem-Erkennung - Phase 2)
  - FR-023 (Bodendecker-Analyse - Phase 3)

### Non-Functional Requirements Summary

**Total NFRs:** 9

**By Priority:**
- **Must Have:** 4 NFRs
  - NFR-004 (Daten-Backup)
  - NFR-005 (Mobile-First Design)
  - NFR-008 (Einfache Wartbarkeit)
  - NFR-009 (Plattform-Kompatibilität)

- **Should Have:** 3 NFRs
  - NFR-001 (App-Ladezeit)
  - NFR-002 (Foto-Upload-Performance)
  - NFR-003 (Daten-Privacy)

- **Could Have:** 2 NFRs
  - NFR-006 (Offline-Fähigkeit)
  - NFR-007 (Verfügbarkeit)

### Epic Priority Breakdown

**Total Epics:** 7

**By Priority:**
- **Must Have:** 4 Epics (EPIC-001, 002, 003, 004, 007)
- **Should Have:** 3 Epics (EPIC-005, 006)

### MVP Scope (Phase 1)

**Phase 1 (MVP) - DELIVERED:** 19 FRs total (6 Must Have + 13 Should Have)

**Phase 2 (KI-Integration):** 3 FRs planned (FR-007, FR-015, FR-016)

**Phase 3 (Advanced Tracking):** 3 FRs planned (FR-009, FR-010, FR-023)

**Phase 4 (Optional Enhancements):** 1 FR (FR-010 Plan-Details)

---

**End of PRD**
