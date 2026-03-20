# Companion Planting Feature - Brainstorming

**Datum:** 2026-03-20
**Framework:** SCAMPER + Mind Mapping

---

## 🔍 REZHERCHE: Was machen andere Apps?

| App | Companion Feature |
|-----|-------------------|
| **Planter.app** | Intuitives UI, 80+ Pflanzen, 1000+ Sorten, Pflanzzeiten |
| **VegPlotter** | Garten-Layout Designer, Pflanzverfolgung, Zeitpläne |
| **GardenCalc** | Calculator mit Compatibility Matrix, Pflanzen vergleichen |
| **PictureThis** | KI-Pflanzerkennung, detaillierte Profile |

**Key Insights:**
- Benutzer wollen: Schnelle Antwort "Passt das zusammen?"
- Pflanzen vergleichen ist beliebt
- Zeitpläne (wann pflanzen) sind wichtig
- Nicht nur "gut/schlecht" - auch "warum"

---

## 🧠 SCAMPER Brainstorming

### S - Substitute (Ersetzen)
- ❓ Seed-Daten statt leerer DB → **✓ Seed-Daten mit 50+ Pflanzen**
- ❓ Statische DB → **API für dynamische Daten? Nein, lokale DB reicht**
- ❓ Nur lateinische Namen → **Deutsche Namen als Alias**

### C - Combine (Kombinieren)
- ✅ **Pflanzentyp + Zeiträume** → "Karotten im Frühling brauchen diese Begleiter"
- ✅ **Learnings + Companion** → "Das ist ein Tipp aus der Wissensbasis!"
- ✅ **PlantDetail + Companion** → Integration in bestehende Pflanzendetail-Seite

### A - Adapt (Anpassen)
- ✅ **Compatibility Score** → 0-100% statt nur gut/schlecht
- ✅ **Distance Info** → "Mindestabstand: 30cm"
- ✅ **Season Filter** → "Zeige nur Frühling-Paarungen"

### M - Modify (Modifizieren)
- ✅ **Visuelle Darstellung** → Graph/Netz statt Listen
- ✅ **Filter nach Pflanzenart** → Gemüse, Kräuter, Blumen
- ✅ **Suchfunktion** → "Welche Pflanzen passen zu Tomaten?"

### P - Put to other uses
- ✅ **Mischkultur-Planung** → Baldrian + Tomaten = weniger Läuse
- ✅ **Pest-Abwehr** → "Pflanze Ringelblumen gegen Blattläuse"
- ✅ **Bodenverbesserung** → "Erbsen fixieren Stickstoff"

### E - Eliminate
- ❌ **Oversized Matrix** → Erstmal einfache Liste
- ❌ **Komplexe Algorithmen** → Keine KI nötig
- ❌ **Externe APIs** → Lokale DB reicht für Permakultur-DE

### R - Reverse
- ✅ **Anti-Companion** → "Diese Pflanzen NICHT zusammen"
- ✅ **Worst Case** → "Wenn alles schief geht, was pflanzt man zuletzt?"

---

## 🎯 FEATURE PRIORISIERUNG

### P0 - Must Have (Launch)
1. ✅ **plant_companions Tabelle** erstellen mit Seed-Daten
2. ✅ **Anzeige in PlantDetail** - "Gute Nachbarn" + "Schlechte Nachbarn"
3. ✅ **CompanionService** - Datenbank-Abfragen

### P1 - Should Have (V2)
4. ⬜ **Suchfunktion** - "Welche Pflanzen passen zu X?"
5. ⬜ **Filter nach Kategorie** - Gemüse, Kräuter, Blumen
6. ⬜ **Learnings Integration** - Auto-Generierung von Tipps

### P2 - Nice to Have (V3)
7. ⬜ **Compatibility Score** (0-100%)
8. ⬜ **Visuelle Graph-Darstellung**
9. ⬜ **Distance/Abstands-Info**

---

## 📋 SEED-DATEN KONZEPT

### Pflanzen-Liste (50+ für Permakultur-DE)

**Gemüse:**
| Pflanze | Gut | Schlecht |
|---------|-----|----------|
| Tomate | Basilikum, Karotten, Petersilie, Ringelblume | Kartoffel, Kohl, Fenchel |
| Karotte | Zwiebel, Salat, Radieschen, Erbsen | Dill, Rote Bete |
| Zwiebel | Karotten, Rote Bete, Erdbeeren | Erbsen, Bohnen |
| Erbsen | Karotten, Radieschen, Spinat, Mais | Zwiebel, Knoblauch |
| Buschbohnen | Gurken, Mais, Kartoffeln, Erdbeeren | Zwiebel, Knoblauch |

**Kräuter:**
| Pflanze | Gut | Schlecht |
|---------|-----|----------|
| Basilikum | Tomaten, Paprika | Salbei, Oregano |
| Dill | Karotten, Gurken, Salat | Tomaten, Bohnen |
| Petersilie | Tomaten, Radieschen, Spargel | Salat |

**Blumen:**
| Pflanze | Gut | Schlecht |
|---------|-----|----------|
| Ringelblume | Tomaten, Gurken, Erdbeeren | - |
| Kapuzinerkresse | Tomaten, Gurken, Kohl | - |

---

## 🏗️ TECHNISCHE UMSETZUNG

### Datenbank

```sql
CREATE TABLE plant_companions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_name TEXT NOT NULL,
  plant_name_de TEXT,  -- Deutsche Namen
  category TEXT,  -- 'gemüse', 'kräuter', 'blumen'
  
  -- Gut/Sclet
  good_companions JSONB DEFAULT '[]',
  good_reasons JSONB DEFAULT '[]',  -- Warum gut?
  
  bad_companions JSONB DEFAULT '[]',
  bad_reasons JSONB DEFAULT '[]',   -- Warum schlecht?
  
  -- Zusatzinfos
  distance_cm INTEGER,
  nitrogen_fixer BOOLEAN DEFAULT FALSE,
  pest_repellent TEXT[],  -- ['blattläuse', 'weiße fliege']
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companion_name ON plant_companions(plant_name);
CREATE INDEX idx_companion_category ON plant_companions(category);
```

### API

```typescript
// CompanionService
getCompanionsByPlant(plantName: string): Promise<PlantCompanion>
searchCompanions(query: string): Promise<PlantCompanion[]>
getByCategory(category: string): Promise<PlantCompanion[]>
```

### UI Integration

1. **PlantDetailScreen** - Neue Sektion "Mischkultur"
2. **PlantListScreen** - Filter nach Companion-Score
3. **Search** - "Welche Pflanzen passen zu...?"

---

## ✅ NÄCHSTE SCHRITTE

1. [ ] Migration erstellen (plant_companions + Seed-Daten)
2. [ ] Types erweitern
3. [ ] Service implementieren
4. [ ] UI in PlantDetailScreen
5. [ ] Testen

---

*Brainstorming abgeschlossen: 2026-03-20*
