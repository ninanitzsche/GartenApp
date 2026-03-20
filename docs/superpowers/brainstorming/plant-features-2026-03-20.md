# Brainstorming: Neue Features für Pflanzen

> **Datum:** 2026-03-20  
> **Fokus:** Pflanze-Features erweitern  
> **Techniken:** SCAMPER, Starbursting, Mind Mapping

---

## Aktueller Stand (Was haben wir bereits?)

### Pflanze-Lebenszyklus
```
Pflanze hinzufügen → Pflege-Status → Ernte → Lernen
```

### Aktuelle Features:

| Feature | Status | Implementation |
|---------|--------|----------------|
| Pflanzen-Liste | ✅ | Filter nach Status, Standort, Typ, Essbar |
| Pflanzendetail | ✅ | Fotos, Ernten, Metadaten, Mischkultur |
| KI-Erkennung | ✅ | PlantNet API Integration |
| Mischkultur | ✅ | Gute/schlechte Begleiter pro Pflanze |
| Aufgaben-Verknüpfung | ✅ | Tasks können Pflanzen zugeordnet werden |
| Ernte-Tracking | ✅ | Menge, Einheit, Datum, Notizen |
| Wissen/Learnings | ⚠️ | Pro Pflanze, aber nicht prominent |

---

## SCAMPER Analyse

### S - Substitute (Ersetzen)
- **Ersetze manuelle Eingabe** → KI-generierte Pflege-Hinweise
- **Ersetze statische Daten** → Dynamische Saison-Empfehlungen
- **Ersetze einzelne Pflanzen** → Garten-Übersicht als "Ökosystem"

### C - Combine (Kombinieren)
- **Pflanzen + Wetter** → Wetter-basierte Pflege-Erinnerungen
- **Pflanzen + Standort** → Microclimate-Analyse
- **Pflanzen + Ernte** → Ertrags-Prognosen
- **Mischkultur + KI** → Automatische Mischkultur-Optimierung

### A - Adapt (Anpassen)
- **Pflanzen-App-Gameification** → "Garten-Level" basierend auf Pflege
- **Pflanzen-Freunde** → Andere User können Pflanzen "adoptieren"
- **Saisonale Challenges** → "Pflanze 5 Tomaten diesen Monat"

### M - Modify (Verändern)
- **Timeline-View** → Lebenszyklus einer Pflanze visualisieren
- **Fortschritts-Badges** → "Erste Ernte!", "100 Tage überlebt"
- **Verfallsdatum** → Samen/Setzlinge mit Haltbarkeitsdatum

### P - Put to other uses (Andere Verwendung)
- ** Pflanzen teilen** → QR-Code für Pflanze generieren
- **Pflanzen-Muster** → Erfahrung anderer Gärtner nutzen
- **Samenbibliothek** → Samen-Vorrat digital verwalten

### E - Eliminate (Eliminieren)
- **Manuelle Status-Updates** → Automatisch basierend auf Datum
- **Duplizierte Filter** → Intelligente Such mit "Was gerade wichtig"
- **Einseitige Ansicht** → Multi-Plant Comparison

### R - Reverse (Umkehren)
- **Ernte rückgängig** → Falls zu früh geerntet
- **Zeitreise** → "Was hätte ich vor 1 Monat tun sollen"
- **Pflanze "verliehen"** → Temporäre Übergabe an Nachbar

---

## Starbursting (6 Fragen)

### WHO (Wer?)
- Hobby-Gärtner mit wenig Zeit
- Permakultur-Enthusiasten
- Community-Gärtner (Schrebergarten)
- Anfänger, die lernen wollen

### WHAT (Was?)
- **Pflege-Automatisiert:** Erinnerungen, die wirklich relevant sind
- **Wissen-Transfer:** Von erfahrenen Gärtnern lernen
- **Erfolgs-Tracking:** Was hat funktioniert, was nicht
- **Netzwerk-Effekt:** Pflanzentausch, Saatgut-Sharing

### WHERE (Wo?)
- Balkon/Gemüsegarten
- Gewächshaus
- Indoor-Pflanzen
- Gemeinschaftsgärten

### WHEN (Wann?)
- **Saison-Start:** Was pflanze ich wann?
- **Pflege-Zeit:** Wöchentliche Übersicht
- **Ernte-Zeit:** Optimale Erntezeit nicht verpassen
- **Reflexion:** Saison-Ende auswerten

### WHY (Warum?)
- **Motivation:** Gärtnern soll Freude machen
- **Effizienz:** Weniger Zeitaufwand, mehr Ertrag
- **Wissen:** Erfahrungen teilen und lernen
- **Nachhaltigkeit:** Ressourcen schonen

### HOW (Wie?)
- **Gamification:** Punkte, Level, Achievements
- **KI-Assistent:** "Deine Tomaten brauchen Wasser"
- **Community:** Plattform für Pflanzentausch
- **Visualisierung:** Garten als lebendige Karte

---

## Mind Map: Feature-Ideen

```
                        🌱 PFLANZEN-FEATURES
                                |
        ┌───────────────────────┼───────────────────────┐
        |                       |                       |
    📊 TRACKING           🧠 WISSEN & KI         🤝 COMMUNITY
        |                       |                       |
    ├─ Ertrags-Prognose    ├─ KI-Pflege-Tipps     ├─ Pflanzentausch
    ├─ Wachstums-Timeline  ├─ Automatische        ├─ Saatgut-Bibliothek
    ├─ Standort-Analyse        Mischkultur-Vorschl. ├─ Garten teilen
    ├─ Pflege-Erinnerungen  ├─ Schädlings-Info     ├─ Community-Challenges
    └─ Kosten-Tracking     └─ Saison-Empfehlungen  └─ Erfahrungs-Datenbank
    
    🎯 MOTIVATION          📱 SMART FEATURES       🌍 NACHHALTIGKEIT
        |                       |                       |
    ├─ Gamification         ├─ Wetter-Integration  ├─ Ressourcen-Sparen
    ├─ Fortschritts-Badges  ├─ Standort-basierte   ├─ Biodiversität
    ├─ Erfolgs-Stories         Erinnerungen        ├─ Saatgut-Erhaltung
    └─ "Garden Level"       └─ QR-Code für Pflanzen└─ Lokale Sorten
```

---

## Feature-Ideen (Konkret)

### 🔥 High Priority

| # | Feature | Beschreibung | Warum wichtig |
|---|---------|--------------|---------------|
| 1 | **Intelligente Pflege-Erinnerungen** | KI-generiert, nicht nur Zeit-basiert | Mehr Relevant, weniger "Alarm-Müdigkeit" |
| 2 | **Saison-Planer Dashboard** | "Was pflanze ich jetzt / in 2 Wochen" | Entscheidungs-Hilfe für Anfänger |
| 3 | **Mischkultur-Automat** | KI schlägt optimale Pflanzenkombinationen vor | Nutzt bestehende DB + KI |

### 📊 Medium Priority

| # | Feature | Beschreibung | Warum wichtig |
|---|---------|--------------|---------------|
| 4 | **Ertrags-Tracker mit Vergleich** | "Im letzten Jahr: 5kg Tomaten" | Motivation, Erfolgsmessung |
| 5 | **Standort/Microclimate-Analyse** | "Südbalkon: +2°C wärmer" | Optimale Pflanzenauswahl |
| 6 | **Pflanzen-Timeline** | Visuelle Zeitleiste pro Pflanze | Überblick über Lebenszyklus |

### 🌱 Nice-to-Have

| # | Feature | Beschreibung | Warum wichtig |
|---|---------|--------------|---------------|
| 7 | **QR-Code für Pflanzen** | Pflanze scannen, Info teilen | Community-Aufbau |
| 8 | **Saatgut-Vorrat** | Samen-Einlagerung digital verwalten | Organisation |
| 9 | **Gamification: Garden Level** | Punkte für Pflege, Level-Up | Motivation für Neulinge |
| 10 | **Pflanzentausch-Börse** | Lokalen Tausch organisieren | Community-Bildung |

---

## Ideen-Priorisierung (Quick Vote)

### Must-Have (Für nächstes Sprint)
- [ ] Intelligente Pflege-Erinnerungen
- [ ] Saison-Planer Dashboard

### Should-Have (Für übernächstes Sprint)
- [ ] Mischkultur-Automat
- [ ] Ertrags-Tracker
- [ ] Pflanzen-Timeline

### Nice-to-Have (Future)
- [ ] Community-Features
- [ ] Gamification
- [ ] Saatgut-Vorrat

---

## Nächste Schritte

1. **Entscheidung:** Welche 2-3 Features priorisieren?
2. **Business Case:** Aufwand vs. Nutzen abschätzen
3. **User Stories:** Für Top-Features schreiben
4. **Tech-Analyse:** Welche APIs/Daten werden benötigt?

---

*Brainstorming abgeschlossen: 2026-03-20*
*Moderiert durch: Creative Intelligence (Superpowers)*
