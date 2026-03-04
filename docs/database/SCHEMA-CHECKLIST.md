# Schema Checklist für Features
**Nutze diese Vorlage BEVOR du Code schreibst!**

---

## Template für jedes neue Feature

### 1. Feature Definition (3 min)
- [ ] **Feature Name:** _______________
- [ ] **1-Satz Beschreibung:** _______________
- [ ] **Acceptance Criteria:**
  - [ ] AC1: _______________
  - [ ] AC2: _______________
  - [ ] AC3: _______________

---

### 2. Tabellen & Schema (10 min)

#### Neue Tabellen?
```
Tabelle: ________________

Spalten:
- id (uuid, primary key)
- user_id (uuid, foreign key → auth.users)
- _____________ (type: ____)
- _____________ (type: ____)
- created_at (timestamp)
- updated_at (timestamp)

Junction-Tables? JA / NEIN
Wenn JA:
  - Tabelle: ________________
  - Spalten: col1 (fk), col2 (fk)
```

#### Bestehende Tabellen ändern?
```
Tabelle: ________________
Neue Spalten:
- _____________ (type: ____)
- _____________ (type: ____)

Bestehende Spalten löschen?
- Ja / Nein: ________________
```

#### Supabase Verification ✅
- [ ] Alle Tabellen existieren in Supabase (screenshot!)
- [ ] Alle Spalten haben richtige Types
- [ ] Foreign Keys sind definiert
- [ ] Unique Constraints gesetzt (wo nötig)

---

### 3. RLS-Policies (10 min)

#### Wer darf was?

**SELECT Policy:**
```
Wer darf lesen?
- [ ] Nur eigene Daten (auth.uid() = user_id)
- [ ] Alle authentifizierten Users
- [ ] Public (anyone)

SQL:
auth.uid() = user_id
```

**INSERT Policy:**
```
Wer darf schreiben?
- [ ] Nur authentifizierte
- [ ] Nur admin

SQL:
auth.uid() = user_id
```

**UPDATE Policy:**
```
Wer darf aktualisieren?
- [ ] Nur Besitzer
- [ ] Admin only
- [ ] Anyone

SQL:
auth.uid() = user_id
```

**DELETE Policy:**
```
Wer darf löschen?
- [ ] Nur Besitzer
- [ ] Admin only

SQL:
auth.uid() = user_id

Cascade bei Junction-Table?
- [ ] JA (wichtig!)
- [ ] NEIN
```

#### Policies in Supabase erstellt?
- [ ] SELECT policy defined
- [ ] INSERT policy defined
- [ ] UPDATE policy defined (falls UPDATE unterstützt)
- [ ] DELETE policy defined (falls DELETE unterstützt)
- [ ] Alle getestet!

---

### 4. Code-Impact (5 min)

#### Service Layer Funktionen

```typescript
// MUSS implementiert werden:

// 1. LIST - alle Items holen
export async function list(filters?: Filters): Promise<T[]> {
  // ✅ Must: RLS filtering (user_id)
  // ✅ Must: Error handling
}

// 2. CREATE - neues Item
export async function create(data: T): Promise<T> {
  // ✅ Must: user_id automatisch setzen
  // ✅ Must: Validierung
  // ✅ Must: Junction-Table insert? (falls ja)
}

// 3. UPDATE - Item ändern
export async function update(id: string, data: Partial<T>): Promise<T> {
  // ✅ Must: user ownership check
  // ✅ Must: Nur erlaubte Felder updaten
}

// 4. DELETE - Item löschen
export async function delete(id: string): Promise<void> {
  // ✅ Must: Junction-Table Einträge auch löschen
  // ✅ Must: Storage-Files löschen (falls relevant)
  // ✅ Must: Cascading?
}
```

#### Error Cases
- [ ] Was wenn Tabelle nicht existiert? (Schema-Migration fehlgeschlagen)
- [ ] Was wenn user_id nicht gesetzt ist?
- [ ] Was wenn user keine Permission hat? (RLS reject)
- [ ] Was wenn Duplikat-Unique-Key?
- [ ] Was wenn Junction-Table Fremdschlüssel kaputt?

---

### 5. Web-Kompatibilität (8 min)

#### File/Image Handling
- [ ] Braucht dieses Feature Bilder/Files?
  - JA / NEIN

Wenn JA:
```
✅ MUST DO:
- [ ] Blob-Konvertierung schreiben (file:// → blob://)
- [ ] getPublicUrl() wrapper für Web
- [ ] Test: Image auf Web angezeigt?
- [ ] Test: Image-Upload funktioniert?
```

#### Native APIs
- [ ] Braucht Camera? (expo-camera)
  - [ ] JA → Web-Fallback schreiben
  - [ ] NEIN

- [ ] Braucht Location? (expo-location)
  - [ ] JA → Web-Fallback
  - [ ] NEIN

- [ ] Braucht Notifications?
  - [ ] JA → Web-Fallback
  - [ ] NEIN

#### UI Components
```
❌ NATIVE ONLY:
- [ ] Alert.alert() verwendet?
  → Ersetze mit: window.confirm() (Web)

- [ ] useFocusEffect() verwendet?
  → Füge hinzu: Fallback useEffect

- [ ] Pressable/TouchableOpacity?
  → Web-Test: onClick funktioniert?
```

#### Package Kompatibilität
```
Neue Packages hinzugefügt?
- [ ] JA → check version
- [ ] NEIN

Falls JA:
- [ ] Version kompatibel mit Expo 55?
- [ ] Web-Support? (check docs)
- [ ] npm install --legacy-peer-deps nötig?
```

---

### 6. Testing Pre-Check (5 min)

#### Unit Test Setup
- [ ] Service Funktionen schreiben
- [ ] Mock Supabase setup
- [ ] 3+ Test Cases (happy path + errors)

#### Integration Test
- [ ] Real Supabase connection test?
- [ ] RLS policy test?
- [ ] User scoping test?

#### Platform Testing
- [ ] [ ] Auf Web testen (npm start → Browser)
- [ ] [ ] Auf Mobile testen (Expo Go)
- [ ] [ ] Screenshot wenn unterschiedlich

---

### 7. Final Checklist vor Code

- [ ] **Definition:** Clear & 3 ACs
- [ ] **Schema:** Diagram + Supabase verified
- [ ] **RLS:** Alle Policies definiert
- [ ] **Service Layer:** Funktions-Skeleton ready
- [ ] **Web-Compat:** Alle Gotchas identifiziert
- [ ] **Tests:** Plan geschrieben
- [ ] **Ready?** JA → START CODING!

---

## Beispiel: Photo Feature (ausgefüllt)

### 1. Feature Definition
- **Feature Name:** Photo Upload & Gallery
- **Beschreibung:** User können Fotos hochladen und in Gallery anzeigen
- **AC1:** Upload komprimiert auf 1200x1200
- **AC2:** Fotos mit Pflanze verlinkt (junction-table)
- **AC3:** Foto-Löschung auch Storage-File löscht

### 2. Tabellen
```
Tabelle: photos
- id (uuid, pk)
- user_id (uuid, fk)
- file_url (text) ← Storage-Pfad
- created_at (timestamp)

Tabelle: photo_plants (junction)
- photo_id (uuid, fk → photos)
- plant_id (uuid, fk → plants)
```

### 3. RLS-Policies
```
SELECT: auth.uid() = user_id (nur eigene Fotos)
INSERT: auth.uid() = user_id
DELETE: auth.uid() = user_id

+ Cascade delete bei photo_plants!
```

### 4. Service Functions
```
- fetchPhotos(plantId) ← Query via junction-table!
- uploadPhoto(plantId, fileUri)
- deletePhoto(photoId) ← Auch junction-table + storage!
```

### 5. Web-Kompatibilität
```
✅ File handling: Blob-Konvertierung nötig
❌ Keine Native APIs
⚠️ getPublicUrl() wrapper für image-URLs
```

### 6. Testing
```
- Unit: uploadPhoto mocked, deletePhoto mit junction-table
- Integration: Real upload zu Supabase
- Web: Image-Anzeige, upload funktioniert?
```

---

## 📝 Ausfüll-Vorlage (Copy-Paste Ready)

```markdown
# Schema Checklist: [FEATURE NAME]

## 1. Definition
- Feature:
- Beschreibung:
- AC1:
- AC2:
- AC3:

## 2. Tabellen
Neue Tabellen:
-

Änderungen bestehendes Schema:
-

## 3. RLS-Policies
SELECT:
INSERT:
UPDATE:
DELETE:
Cascade?

## 4. Service Functions
- list():
- create():
- update():
- delete():

## 5. Web-Compat
Files/Images?
Native APIs?
UI Components OK?
Packages OK?

## 6. Testing
Unit Tests?
Integration Tests?
Web-Test?

## 7. Status
✅ READY
```

---

**NUTZE DIESE CHECKLIST FÜR JEDEN FEATURE!**

**Zeitaufwand:** 15-20 min → Spart 3-4 Stunden Debugging später!
