# Sprint Start - 15 Minuten Checklist
**Nutze BEVOR du den Sprint startest!**

---

## ⏰ TIMING: 15 MINUTEN TOTAL

```
Min 0-3:   Feature Definition
Min 3-8:   Schema Planning
Min 8-12:  Web-Kompatibilität
Min 12-15: Code Reuse
```

---

## 1️⃣ Feature Definition (3 min)

- [ ] **Feature Name:** _______________
- [ ] **1-Satz Beschreibung:**
  > [User Action] so that [Benefit]

- [ ] **3 Acceptance Criteria:**
  - [ ] AC1: _______________
  - [ ] AC2: _______________
  - [ ] AC3: _______________

**Beispiel:**
```
Name: Photo Upload
Description: User can upload compressed photos linked to plants

AC1: Image compressed to 1200x1200 @ 70% quality
AC2: Photo linked to plant via photo_plants junction table
AC3: Delete removes storage file + DB entries
```

---

## 2️⃣ Schema Planning (5 min)

### Schritt 1: Supabase öffnen
- [ ] Go to: https://app.supabase.com
- [ ] Select project
- [ ] Go to: SQL Editor

### Schritt 2: Tabellen prüfen
```
MUSS EXISTIEREN:
- [ ] Main table (z.B. "photos")
- [ ] Foreign keys correct?
- [ ] Junction-table wenn nötig?

NEUE SPALTEN?
- [ ] ALTER TABLE photos ADD COLUMN ...
- [ ] Type correct?
```

### Schritt 3: ER-Diagram skizzieren (Papier/Miro)
```
┌─────────────┐
│   photos    │
├─────────────┤
│ id (PK)     │
│ user_id (FK)│
│ file_url    │
└─────────────┘
       ↓
┌────────────────┐
│  photo_plants  │   ← Junction!
├────────────────┤
│ photo_id (FK)  │
│ plant_id (FK)  │
└────────────────┘
```

### Schritt 4: RLS-Policies kurz planen
```
SELECT:  auth.uid() = user_id   [Nur eigene]
INSERT:  auth.uid() = user_id   [Nur eigene]
UPDATE:  auth.uid() = user_id   [Nur eigene]
DELETE:  auth.uid() = user_id   [Cascade junction!]
```

---

## 3️⃣ Web-Kompatibilität (4 min)

### Schnell durchgehen:

**Braucht BILDER?** JA / NEIN
- [ ] JA → Muss blob:// Konvertierung + getPublicUrl() schreiben

**Braucht KAMERA?** JA / NEIN
- [ ] JA → Muss Platform.OS fallback schreiben

**Braucht LOCATION?** JA / NEIN
- [ ] JA → Muss navigator.geolocation fallback schreiben

**Nutzt ALERT.alert()?** JA / NEIN
- [ ] JA → Ersetze mit window.confirm() auf Web

**Nutzt useFocusEffect()?** JA / NEIN
- [ ] JA → Fallback useEffect hinzufügen

**Neue Packages?** JA / NEIN
- [ ] JA → Check Expo 55 kompatibilität

---

## 4️⃣ Code Reuse (3 min)

### MEMORY.md checken
- [ ] Ähnliche Features vorhanden?
- [ ] Pattern kopierbar?
- [ ] Service Layer Pattern anwendbar?

**Template-Services kopieren von:**
```
✅ plantService.ts (fetch, create, update, delete)
✅ shoppingService.ts (filters, pagination)
✅ photoService.ts (storage + junction-tables)
```

### Welcher Service ist ähnlich?
```
Feature: _____________
Ähnlich wie: _____________
Copy dari: _____________
```

---

## 5️⃣ FINAL: Bereit? ✅

- [ ] **Definition:** Clear & 3 ACs geschrieben
- [ ] **Schema:** Diagram gemacht, Supabase verifiziert
- [ ] **RLS:** Policies geplant (screenshot!)
- [ ] **Web-Check:** Alle Gotchas identifiziert
- [ ] **Reuse:** Service-Template ready
- [ ] **GO:** Ready to code!

---

## ❌ WENN ETWAS FEHLT:

```
"Schema nicht klar?"
  → STOP! Frag oder skizzier mehr
  → Nicht mit unklar Schema coden!

"Unsicher mit Web-Compat?"
  → Check WEB-NATIVE-DIFFERENCES.md
  → Kopiere Template-Solution

"Keine ähnliche Service?"
  → OK, neu schreiben aber mit Template
  → SCHEMA-CHECKLIST nutzen
```

---

## 📝 BEISPIEL AUSGEFÜLLT: Photo Feature

```
=== SPRINT START CHECKLIST ===

1. DEFINITION (3 min)
Feature: Photo Upload & Gallery
Beschreibung: User can upload compressed photos linked to plants
AC1: Image compressed to 1200x1200 @ 70% quality
AC2: Photo linked to plant via photo_plants junction
AC3: Delete removes from storage + DB

2. SCHEMA (5 min)
Main Table: photos (user_id, file_url, created_at)
Junction: photo_plants (photo_id, plant_id)
ER-Diagram: [Skizze gemacht]
RLS-Policy: SELECT/INSERT/DELETE on auth.uid() = user_id

3. WEB-COMPAT (4 min)
Bilder: JA → blob:// Konvertierung + getPublicUrl()
Kamera: JA → fallback zu ImagePicker.launchImageLibraryAsync()
Location: NEIN
Alert: NEIN (nur showConfirm in delete)
useFocusEffect: NEIN
Packages: NEIN neu

4. REUSE (3 min)
Ähnlich wie: photoService.ts
Copy von: src/services/photoService.ts
Patterns: Service Layer, RLS filtering, Junction-tables

✅ READY TO CODE!
```

---

## ⏱️ TIMER NUTZEN

**Terminal:**
```bash
# 15 min timer starten
timer 15m
```

**Wenn du UNTER 15 min fertig bist:** 🎉
- Du verstehst Feature gut genug
- Schema ist klar
- Ready to code schneller

**Wenn du ÜBER 15 min brauchst:** ⚠️
- Feature nicht klar genug
- Schema zu komplex
- Vielleicht zu großes Feature für Sprint?

---

## 🚀 NACH CHECKLIST - DANN CODE!

1. `docs/SCHEMA-CHECKLIST.md` ausfüllen (20 min)
2. Service Layer schreiben mit Template
3. Tests schreiben
4. **Day 2 EOD: Web-Build Test**
5. **Day 4 EOD: Core Feature Web-Test**

---

**NUTZE DIESE 15-MIN-CHECKLIST FÜR JEDEN SPRINT!**

Spart 3+ Stunden Debugging!
