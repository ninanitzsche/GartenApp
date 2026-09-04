# Gilde bearbeiten - Erweiterung Design

## Überblick

Erweiterung der Gilde bearbeiten-Funktion mit:
1. Beet-Zuordnung mit automatischen Standort-Vorschlägen
2. Pflanzenauswahl aus allen eigenen Pflanzen + Neue erstellen
3. Automatische KI-Bewertung nach dem Speichern

## Änderungen

### 1. Beet-Zuordnung (Standort)

**Backend:**
- `standort` Feld in `Gilde` bleibt Text (frei editierbar)
- Neuer Parameter `bed_id` wird beim Erstellen übergeben (optional)

**Frontend - GildeEditScreen:**
- **Beet-Dropdown**: Alle Beete des Nutzers laden
- **Standort-Feld**: Textfeld mit Vorschlag basierend auf Beet
  - Wenn Beet ausgewählt → Standort = Beet-Vorschlag (editierbar)
  - Aus Beet-`notes` übernehmen falls vorhanden

**Beet-Vorschlag-Logik:**
```typescript
const getStandortVorschlag = (bed: Bed): string => {
  // Standort basierend auf Beet.notes
  return bed.notes || '';
};
```

### 2. Pflanzenauswahl (Priorisiert)

**Beet-Pflanzen zuerst:**
- Wenn Beet ausgewählt → laden der Pflanzen aus diesem Beet (`fetchBedPlants(bedId)`)
- Diese werden oben in der Liste angezeigt (priorisiert)
- Autovervollständigung zeigt Beet-Pflanzen zuerst

**Alle anderen Pflanzen:**
- Nach den Beet-Pflanzen: alle anderen eigenen Pflanzen
- Autovervollständigung zeigt kombinierte Liste

**Pflanzen-Row:**
- Autovervollständigung mit priorisierter Liste
- Suchfeld zum Filtern
- "+ Neue Pflanze" Button (wie bisher)

**Logik:**
```typescript
const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
const [beetPflanzen, setBeetPflanzen] = useState<Plant[]>([]);
const [allePflanzen, setAllePflanzen] = useState<Plant[]>([]);

// Wenn Beet geändert wird:
useEffect(() => {
  if (selectedBedId) {
    loadBeetPflanzen(selectedBedId);
  }
}, [selectedBedId]);

const loadBeetPflanzen = async (bedId: string) => {
  const fromBed = await fetchBedPlants(bedId);
  setBeetPflanzen(fromBed);
};

// Autovervollständigung: Beet-Pflanzen zuerst, dann alle anderen
const suchPflanzen = [...beetPflanzen, ...allePflanzen.filter(p => !beetPflanzen.includes(p))];
```

### 3. Automatische KI-Bewertung nach Speichern

**Service-Erweiterung:**
```typescript
// gildeService.ts
export async function rateGilde(gildeId: string, bedId?: string): Promise<GildeRating> {
  // OpenZen AI-Aufruf für Bewertung
  const gilde = await fetchGildeById(gildeId);
  const bed = bedId ? await fetchBedById(bedId) : null;
  
  const prompt = `Bewerte die Gilde "${gilde.name}" (${gilde.concept}) mit Pflanzen: 
    ${gilde.plants.map(p => `${p.name} (${p.role})`).join(', ')}
  für das Beet ${bed?.name || '(kein Beet zugeordnet}'.
  Vergib 1-5 Sterne und erkläre warum.`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  });
  
  // Parse rating from response (1-5)
  // Parse comment from response
  return createOrUpdateGildeRating(gildeId, bedId, rating, comment);
}
```

**GildeEditScreen - handleSave:**
```typescript
const handleSave = async () => {
  // ... speichern ...
  await createGilde(gildeData);
  
  // Automatisch bewerten wenn Beet ausgewählt
  if (bedId) {
    setBewertungLoading(true);
    try {
      const rating = await rateGilde(newGildeId, bedId);
      setBewertung(rating);
    } catch (e) {
      console.warn('KI-Bewertung fehlgeschlagen:', e);
    } finally {
      setBewertungLoading(false);
    }
  }
  
  navigation.goBack();
};
```

**GildeDetailSheet - Anzeige:**
- Wenn `rating` vorhanden → Sterne anzeigen + Kommentar
- "Erneut bewerten" Button

## Komponenten-Änderungen

### GildeEditScreen.tsx

**Neue State:**
```typescript
const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
const [allePflanzen, setAllePflanzen] = useState<Plant[]>([]);
// ...
const [bewertung, setBewertung] = useState<GildeRating | null>(null);
const [bewertungLoading, setBewertungLoading] = useState(false);
```

**Neue UI:**
- `<BeetSelector>` Dropdown (vorhanden oder neu erstellen)
- `<PlantMultiSelect>` Liste mit "+ Pflanze hinzufügen"
- Nach Speichern: Loading-Indicator während KI-Bewertung

### BeetSelector Komponente

Falls noch nicht vorhanden:
```typescript
// components/gilde/BeetSelector.tsx
export default function BeetSelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (bedId: string | null) => void;
}) {
  const { beds } = useBeets();
  
  return (
    <Picker
      selectedValue={value}
      onValueChange={onChange}
      items={[{ label: 'Kein Beet', value: null }, ...beds.map(b => ({ label: b.name, value: b.id }))]}
    />
  );
}
```

### PlantMultiSelect Komponente

Falls noch nicht vorhanden:
```typescript
// components/gilde/PlantMultiSelect.tsx
export default function PlantMultiSelect({
  plants,
  value,
  onChange,
}: {
  allPlants: Plant[];
  value: GildePlant[];
  onChange: (plants: GildePlant[]) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  
  const selectedPlantNames = value.map(p => p.name);
  
  const addPlant = (plant: Plant) => {
    onChange([...value, { name: plant.name, role: '' }]);
  };
  
  const createAndAddPlant = (plantData: PlantFormData) => {
    // createPlant(plantData) → addPlant(created)
  };
  
  return (
    <View>
      {/* Anzeige der ausgewählten Pflanzen mit Rollen */}
      {value.map((p, i) => (
        <PlantRow key={i} plant={p} onChange={(p) => update(i, p)} onRemove={() => remove(i)} />
      ))}
      
      {/* Dropdown */}
      <PickerDialog
        items={allPlants
          .filter(p => !selectedPlantNames.includes(p.name))
          .map(p => ({ label: p.name, value: p.id }))}
        onSelect={addPlant}
      />
      
      {/* Neue Pflanze */}
      <TouchableOpacity onPress={() => navigation.navigate('PlantEdit')}>
        <Text>+ Neue Pflanze</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## API Endpoints (bleiben gleich)

```
POST /api/gilden           - Neue Gilde erstellen
POST /api/gilden/:id/bewerten - KI-Bewertung (neu)
GET  /api/gilden/:id/bewertung - Letzte Bewertung abrufen
```

## Akzeptanzkriterien

- [ ] Beet-Dropdown zeigt alle eigenen Beete
- [ ] Standort-Vorschlag erscheint wenn Beet ausgewählt
- [ ] Standort ist frei editierbar
- [ ] Multiselect-Dropdown zeigt alle eigenen Pflanzen
- [ ] "+ Neue Pflanze" öffnet Pflanze hinzufügen
- [ ] Nach Speichern → KI-Bewertung automatisch (wenn Beet選択)
- [ ] Rating wird in Detailansicht angezeigt

## Offene Fragen

- [x] Beet-Zuordnung: Pflicht oder optional? → Optional (Vorschlag)
- [x] Neue Pflanze: Modal oder Screen? → Gleiche Screen wie bisher
- [x] KI-Bewertung: Auto oder Button? → Automatisch nach Speichern