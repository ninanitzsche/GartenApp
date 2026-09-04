# Bilder für Alle (Gilden, Pflanzen, Beete) Design

## Überblick

Ermöglicht das Hinzufügen von Titelfotos und Galerien für:
1. **Gilden** - Titelfoto + Galerie
2. **Pflanzen** - Titelfoto + Galerie  
3. **Beete** - Galerie (exist already)

## Bestehende Struktur (Beete)

```typescript
// Bed Type - existiert bereits
cover_photo_url?: string;

// photo_beds Junction - existiert bereits
interface PhotoBed {
  photo_id: string;
  bed_id: string;
}
```

## Datenmodell - Erweiterung

### Gilden
```typescript
// src/types/gilde.ts
interface Gilde {
  id: string;
  cover_photo_url?: string;
  // ... existing fields
}

// src/types/photo.ts
interface PhotoGilde {
  photo_id: string;
  gilde_id: string;
}
```

### Pflanzen
```typescript
// src/types/plant.ts
interface Plant {
  id: string;
  cover_photo_url?: string;
  // ... existing fields
}

// src/types/photo.ts  
interface PhotoPlant {
  photo_id: string;
  plant_id: string;
}
```

## Datenbank Schema

```sql
-- Gilden Cover-Foto (Spalte hinzufügen)
ALTER TABLE gilden ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Pflanzen Cover-Foto (Spalte hinzufügen)
ALTER TABLE plants ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Junction Tabelle photo_gilden
CREATE TABLE IF NOT EXISTS photo_gilden (
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  gilde_id UUID REFERENCES gilden(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, gilde_id)
);

-- Junction Tabelle photo_plants
CREATE TABLE IF NOT EXISTS photo_plants (
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, plant_id)
);
```

## Service-Funktionen

### Gilde Photos
```typescript
// src/services/photoGildeService.ts
export async function fetchPhotosForGilde(gildeId: string): Promise<Photo[]>
export async function linkPhotoToGilde(photoId: string, gildeId: string): Promise<void>
export async function unlinkPhotoFromGilde(photoId: string, gildeId: string): Promise<void>
export async function setGildeCoverPhoto(gildeId: string, photoUrl: string): Promise<void>
export async function uploadPhotoForGilde(gildeId: string, imageUri: string): Promise<string>
```

### Pflanzen Photos
```typescript
// src/services/photoPlantService.ts (falls nicht vorhanden)
export async function fetchPhotosForPlant(plantId: string): Promise<Photo[]>
export async function linkPhotoToPlant(photoId: string, plantId: string): Promise<void>
export async function unlinkPhotoFromPlant(photoId: string, plantId: string): Promise<void>
export async function setPlantCoverPhoto(plantId: string, photoUrl: string): Promise<void>
export async function uploadPhotoForPlant(plantId: string, imageUri: string): Promise<string>
```

## UI Komponenten

### CoverImagePicker
- Zeigt Cover-Foto (oder Placeholder)
- "Bild ändern" / "Bild entfernen" Buttons
- Öffnet ImagePicker

### PhotoGallery
- Grid-Ansicht aller Fotos
- Plus-Button für neue Fotos
- "Foto auswählen" und "Foto aufnehmen"
- Tap → Fullscreen-Ansicht

### Integration in Edit-Screens

**GildeEditScreen:**
- Cover-Foto oben
- Galerie-Sektion unten

**PlantEditScreen:**
- Cover-Foto oben (falls noch nicht vorhanden)
- Galerie-Sektion

**BeetEditScreen:**
- Galerie-Sektion (Cover bereits vorhanden)

## API Endpoints

```
POST   /api/gilden/:id/photos          - Fotos hochladen
GET    /api/gilden/:id/photos         - Galerie abrufen
DELETE /api/gilden/:id/photos/:photoId - Foto entfernen
PUT    /api/gilden/:id/cover          - Cover setzen

POST   /api/pflanzen/:id/photos       - Fotos hochladen
GET    /api/pflanzen/:id/photos      - Galerie abrufen
DELETE /api/pflanzen/:id/photos/:photoId - Foto entfernen
PUT    /api/pflanzen/:id/cover       - Cover setzen
```

## Architektur

```
src/
├── services/
│   ├── photoGildeService.ts    # NEU
│   └── photoPlantService.ts    # NEU (oder erweitern)
├── components/
│   ├── CoverImagePicker.tsx    # NEU - wiederverwendbar
│   └── PhotoGallery.tsx       # NEU - wiederverwendbar
└── screens/
    ├── GildeEditScreen.tsx    # + Cover + Galerie
    ├── PlantEditScreen.tsx    # + Cover + Galerie
    └── EditBedScreen.tsx       # + Galerie
```

## Akzeptanzkriterien

- [ ] Gilden: Cover-Foto setzen und anzeigen
- [ ] Gilden: Galerie mit mehreren Fotos
- [ ] Pflanzen: Cover-Foto setzen und anzeigen
- [ ] Pflanzen: Galerie mit mehreren Fotos
- [ ] Beete: Galerie (existiert bereits)
- [ ] Image Picker funktioniert (Kamera + Galerie)
- [ ] Fotos werden in Supabase Storage gespeichert

## Abhängigkeiten

- Benötigt: `photoBedService.ts` als Vorlage
- Benötigt: Supabase Storage Bucket "plant-photos" (existiert)

## Offene Fragen

- [x] Strukture: Gleiche wie Beete ✓