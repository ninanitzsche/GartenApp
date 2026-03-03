/**
 * Seed Data für Gartenplaner - Garten2026
 *
 * Diese Datei lädt Pflanzen-Daten aus data/garden-seed-data.json
 * und synchronisiert sie mit der Datenbank.
 *
 * Daten basieren auf: Garten2026/Pflanzen_Inventar_und_Pflege.md
 * - 7 etablierte Pflanzen (Weinreben, Schnittlauch, Erdbeeren, etc.)
 * - 50+ geplante/bestellte Pflanzen
 *
 * Alle Pflanzen mit: name, location, type, status, winterhart, essbar, dates
 */

// Note: In React Native/Expo, müssen JSON-Dateien direkt importiert werden
// Diese hardcoded Daten werden aus der garden-seed-data.json generiert

import { supabase } from '../services/supabase';

export interface PlantData {
  name: string;
  latin_name?: string;
  location: string;
  type: string;
  status: string;
  winterhart?: boolean;
  essbar?: boolean;
  quantity?: number;
  menge?: number;
  pflanz_datum?: string;
  ernte_datum?: string;
  notes?: string;
  tags?: string[];
}

export const ESTABLISHED_PLANTS: PlantData[] = [
  {
    name: 'Weinreben',
    latin_name: 'Vitis vinifera',
    location: 'Pergola',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: true,
    notes: 'Winterhart, im November schneiden, rankend',
    tags: ['rankend', 'winterhart', 'obst']
  },
  {
    name: 'Schnittlauch',
    latin_name: 'Allium schoenoprasum',
    location: 'Beete',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: true,
    notes: 'Immer wieder ernten, fördert Wachstum',
    tags: ['kräuter', 'essbar', 'mehrjährig']
  },
  {
    name: 'Erdbeeren',
    latin_name: 'Fragaria',
    location: 'Hauptbeet',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: true,
    notes: 'Alte Blätter im Frühjahr entfernen, Bodendecker, winterhart',
    tags: ['obst', 'bodendecker', 'mehrjährig']
  },
  {
    name: 'Federnelke Rosa',
    latin_name: 'Dianthus plumarius',
    location: 'Beet',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: false,
    notes: 'Bodendeckend, pflegeleicht, Austrieb sichtbar im Frühjahr',
    tags: ['blumen', 'bodendecker', 'mehrjährig']
  },
  {
    name: 'Sonnenhut',
    latin_name: 'Echinacea',
    location: 'Zaunseite',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: false,
    notes: 'Winterhart, für Bienen, Blattrosette sichtbar',
    tags: ['blumen', 'bienenfreundlich', 'mehrjährig']
  },
  {
    name: 'Günsel',
    latin_name: 'Ajuga reptans',
    location: 'Beet',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: true,
    notes: 'Wintergrün, blaue Blüten (April-Juni), kriechend, bildet Teppiche, essbar!',
    tags: ['bodendecker', 'essbar', 'wichtig', 'mehrjährig']
  },
  {
    name: 'Vogelmiere',
    latin_name: 'Stellaria media',
    location: 'Beete',
    type: 'einjährig',
    status: 'etabliert',
    winterhart: false,
    essbar: true,
    notes: 'Essbares Beikraut, Bodendecker, aktiv und grün',
    tags: ['bodendecker', 'essbar', 'beikraut', 'einjährig']
  }
];

export const PLANNED_PLANTS: PlantData[] = [
  // Kartoffeln (5 Sorten à 10 Stück = 50 Stück)
  {
    name: 'Kartoffel - Innovator',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'bestellt',
    winterhart: false,
    essbar: true,
    quantity: 10,
    pflanz_datum: '2026-04-15',
    ernte_datum: '2026-08-15',
    notes: 'Frühe Sorte, Pflanzabstand 30-40 cm',
    tags: ['kartoffel', 'gemüse', 'starkzehrer']
  },
  {
    name: 'Kartoffel - Laura',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'bestellt',
    winterhart: false,
    essbar: true,
    quantity: 10,
    pflanz_datum: '2026-04-15',
    ernte_datum: '2026-08-30',
    notes: 'Mittelfrühe Sorte',
    tags: ['kartoffel', 'gemüse', 'starkzehrer']
  },
  {
    name: 'Kartoffel - Agria',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'bestellt',
    winterhart: false,
    essbar: true,
    quantity: 10,
    pflanz_datum: '2026-04-15',
    ernte_datum: '2026-08-30',
    notes: 'Mittelfrühe Sorte',
    tags: ['kartoffel', 'gemüse', 'starkzehrer']
  },
  {
    name: 'Kartoffel - Spunta',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'bestellt',
    winterhart: false,
    essbar: true,
    quantity: 10,
    pflanz_datum: '2026-04-15',
    ernte_datum: '2026-09-15',
    notes: 'Späte Sorte',
    tags: ['kartoffel', 'gemüse', 'starkzehrer']
  },
  {
    name: 'Kartoffel - Cara',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'bestellt',
    winterhart: false,
    essbar: true,
    quantity: 10,
    pflanz_datum: '2026-04-15',
    ernte_datum: '2026-09-15',
    notes: 'Späte Sorte',
    tags: ['kartoffel', 'gemüse', 'starkzehrer']
  },
  // Tomaten (4 Sorten)
  {
    name: 'Tomate - Zuckertraube',
    location: 'Gewächshaus',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    quantity: 2,
    pflanz_datum: '2026-05-20',
    ernte_datum: '2026-08-15',
    notes: 'Kirschtomate, 8-10 Wochen Anzucht im März',
    tags: ['tomate', 'gemüse', 'starkzehrer']
  },
  {
    name: 'Tomate - Matina',
    location: 'Gewächshaus',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    quantity: 1,
    pflanz_datum: '2026-05-20',
    ernte_datum: '2026-08-15',
    notes: 'Fleischtomate',
    tags: ['tomate', 'gemüse', 'starkzehrer']
  },
  {
    name: 'Tomate - Marmande',
    location: 'Gewächshaus',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    quantity: 1,
    pflanz_datum: '2026-05-20',
    ernte_datum: '2026-08-15',
    notes: 'Fleischtomate',
    tags: ['tomate', 'gemüse', 'starkzehrer']
  },
  {
    name: 'Tomate - Tom Red',
    location: 'Hochbeet',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    quantity: 1,
    pflanz_datum: '2026-05-20',
    ernte_datum: '2026-08-15',
    notes: 'Strauchtomate',
    tags: ['tomate', 'gemüse', 'starkzehrer']
  },
  // Drei Schwestern System
  {
    name: 'Mais',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    quantity: 12,
    pflanz_datum: '2026-04-15',
    ernte_datum: '2026-08-15',
    notes: 'Drei Schwestern: Teil des Mais-Bohnen-Kürbis-Systems',
    tags: ['mais', 'gemüse', 'drei-schwestern', 'starkzehrer']
  },
  {
    name: 'Stangenbohnen',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-05-20',
    ernte_datum: '2026-08-15',
    notes: 'Drei Schwestern: Bohnen klettern am Mais, fixieren Stickstoff',
    tags: ['bohnen', 'gemüse', 'drei-schwestern', 'stickstoffsammler']
  },
  {
    name: 'Hokkaido Kürbis',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    quantity: 4,
    pflanz_datum: '2026-05-20',
    ernte_datum: '2026-09-15',
    notes: 'Drei Schwestern: Bodendecker, beschattet Boden',
    tags: ['kürbis', 'gemüse', 'drei-schwestern', 'starkzehrer']
  },
  // Weiteres Gemüse
  {
    name: 'Gurke - Ranktürme',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    quantity: 3,
    pflanz_datum: '2026-05-20',
    ernte_datum: '2026-08-15',
    notes: 'Klettergurke für Rankhilfen, regelmäßig ernten',
    tags: ['gurke', 'gemüse', 'rankend', 'starkzehrer']
  },
  {
    name: 'Kohlrabi',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-05-15',
    ernte_datum: '2026-07-15',
    notes: 'Direktsaat nach Eisheiligen, schnellwüchsig',
    tags: ['kohlrabi', 'gemüse']
  },
  {
    name: 'Zwiebel',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-05-15',
    ernte_datum: '2026-08-15',
    notes: 'Direktsaat, Sorte Stuttgarter Riesen',
    tags: ['zwiebel', 'gemüse']
  },
  {
    name: 'Riesenzwiebel Kelsae',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    quantity: 1,
    pflanz_datum: '2026-03-15',
    ernte_datum: '2026-08-15',
    notes: '8-10 Wochen Anzucht im März, extremer Züchter',
    tags: ['zwiebel', 'gemüse']
  },
  {
    name: 'Porree',
    location: 'Hauptbeet',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-05-15',
    ernte_datum: '2026-09-15',
    notes: 'Lauch, Direktsaat',
    tags: ['lauch', 'gemüse']
  },
  // Kräuter
  {
    name: 'Basilikum',
    location: 'Gewächshaus',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-04-01',
    ernte_datum: '2026-08-15',
    notes: 'Anzucht im Lichtregal, Aussaat Anfang April',
    tags: ['basilikum', 'kräuter']
  },
  {
    name: 'Thymian',
    location: 'Pergola',
    type: 'mehrjährig',
    status: 'geplant',
    winterhart: true,
    essbar: true,
    pflanz_datum: '2026-05-20',
    notes: 'Winterhart, Bodendecker, pflegeleicht',
    tags: ['thymian', 'kräuter', 'bodendecker', 'mehrjährig']
  },
  {
    name: 'Bärlauch',
    location: 'Schattige Ecke',
    type: 'mehrjährig',
    status: 'geplant',
    winterhart: true,
    essbar: true,
    pflanz_datum: '2026-04-01',
    ernte_datum: '2026-05-15',
    notes: 'Aus Kühlschrank holen, vorkeimen',
    tags: ['bärlauch', 'kräuter', 'mehrjährig', 'essbar']
  },
  {
    name: 'Petersilie',
    location: 'Beete',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-03-15',
    ernte_datum: '2026-10-15',
    notes: 'Direktsaat oder Anzucht',
    tags: ['petersilie', 'kräuter', 'essbar']
  },
  // Bodendecker & Salate
  {
    name: 'Neuseeländer Spinat',
    location: 'Beete',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-03-15',
    ernte_datum: '2026-10-15',
    notes: 'Direktsaat sobald Boden bearbeitbar, breitet sich aus',
    tags: ['spinat', 'gemüse', 'bodendecker']
  },
  {
    name: 'Feldsalat Vit',
    location: 'Beete',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-04-01',
    ernte_datum: '2026-05-15',
    notes: 'Schnellwüchsig, Bodendecker',
    tags: ['salat', 'gemüse', 'bodendecker']
  },
  {
    name: 'Portulak Sommer',
    location: 'Beete',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-05-15',
    ernte_datum: '2026-08-15',
    notes: 'Hitzeverträglich, Bodendecker',
    tags: ['portulak', 'gemüse', 'bodendecker']
  },
  // Stickstoffsammler & Gründüngung
  {
    name: 'Rotklee',
    location: 'Hauptbeet',
    type: 'mehrjährig',
    status: 'geplant',
    winterhart: true,
    essbar: false,
    pflanz_datum: '2026-03-15',
    notes: 'Gründüngung, Stickstoffsammler, mehrjährig',
    tags: ['klee', 'gründüngung', 'stickstoffsammler', 'mehrjährig']
  },
  {
    name: 'Weißklee',
    location: 'Beete',
    type: 'mehrjährig',
    status: 'geplant',
    winterhart: true,
    essbar: false,
    pflanz_datum: '2026-03-15',
    notes: 'Bodendecker, mehrjährig',
    tags: ['klee', 'bodendecker', 'mehrjährig']
  },
  {
    name: 'Phacelia (Gründüngung)',
    location: 'Zaunseite',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: false,
    pflanz_datum: '2026-03-15',
    notes: 'Gründüngung, Bienenmagnet, Aussaat auf Zaunseite',
    tags: ['phacelia', 'gründüngung', 'bienenfreundlich']
  },
  // Blumen & Balkon-Kindergarten
  {
    name: 'Katzenminze',
    location: 'Zaunseite',
    type: 'mehrjährig',
    status: 'geplant',
    winterhart: true,
    essbar: false,
    quantity: 1,
    pflanz_datum: '2026-09-01',
    notes: 'Balkon-Kindergarten, Aussaat in Anzuchtschale, auspflanzen September',
    tags: ['katzenminze', 'blumen', 'bienenfreundlich', 'mehrjährig']
  },
  {
    name: 'Blaukissen',
    location: 'Zaunseite',
    type: 'mehrjährig',
    status: 'geplant',
    winterhart: true,
    essbar: false,
    quantity: 10,
    pflanz_datum: '2026-09-01',
    notes: 'Balkon-Kindergarten (10x), Aussaat in Anzuchtschale, auspflanzen September',
    tags: ['blaukissen', 'blumen', 'bodendecker', 'mehrjährig']
  },
  {
    name: 'Lavendel',
    location: 'Zaunseite',
    type: 'mehrjährig',
    status: 'geplant',
    winterhart: true,
    essbar: false,
    quantity: 2,
    pflanz_datum: '2026-09-01',
    notes: 'Balkon-Kindergarten (2x), Aussaat in Anzuchtschale, auspflanzen September',
    tags: ['lavendel', 'blumen', 'bodendecker', 'mehrjährig']
  },
  {
    name: 'Wildblumen-Mix',
    location: 'Zaunseite',
    type: 'mehrjährig',
    status: 'geplant',
    winterhart: true,
    essbar: false,
    pflanz_datum: '2026-03-15',
    notes: 'Aussaat auf Zaunseite, dick aufs gemähte Gras',
    tags: ['wildblumen', 'blumen', 'bienenfreundlich', 'mehrjährig']
  },
  // Einjährige Blumen
  {
    name: 'Rittersporn',
    location: 'Beetränder',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: false,
    pflanz_datum: '2026-05-15',
    ernte_datum: '2026-08-15',
    notes: 'Direktsaat',
    tags: ['rittersporn', 'blumen']
  },
  {
    name: 'Ringelblume',
    location: 'Beetränder',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-05-15',
    ernte_datum: '2026-08-15',
    notes: 'Direktsaat, selbstaussaend',
    tags: ['ringelblume', 'blumen', 'essbar']
  },
  {
    name: 'Sonnenblume',
    location: 'Beetränder',
    type: 'einjährig',
    status: 'geplant',
    winterhart: false,
    essbar: true,
    pflanz_datum: '2026-05-15',
    ernte_datum: '2026-09-15',
    notes: 'Direktsaat',
    tags: ['sonnenblume', 'blumen', 'essbar']
  },
  // Zu überprüfen
  {
    name: 'Blaue Glockenblume',
    location: 'Beet',
    type: 'mehrjährig',
    status: 'zu überprüfen',
    winterhart: true,
    essbar: false,
    notes: 'Blattrosette + Blüten Mai-Juli, überprüfen ob etabliert',
    tags: ['glockenblume', 'blumen', 'mehrjährig']
  },
  {
    name: 'Orangerote Habichtblume',
    location: 'Beet',
    type: 'mehrjährig',
    status: 'zu überprüfen',
    winterhart: true,
    essbar: false,
    notes: 'Behaarte Rosette + Blüten Mai-Aug, überprüfen ob etabliert',
    tags: ['habichtblume', 'blumen', 'mehrjährig']
  }
];

/**
 * Fügt/aktualisiert Seed-Daten in die Datenbank ein (idempotent)
 *
 * Verwendet Supabase upsert() um sicherzustellen, dass:
 * 1. Duplicate-Fehler vermieden werden (idempotent)
 * 2. Bestehende Einträge aktualisiert werden können
 * 3. Script jederzeit sicher ausgeführt werden kann
 */

export async function insertSeedData() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be logged in to insert seed data');
  }

  try {
    // Prepare established plants with user_id
    const establishedWithUserId = ESTABLISHED_PLANTS.map(plant => ({
      ...plant,
      user_id: user.id,
      menge: plant.quantity || 1
    }));

    // Prepare planned plants with user_id
    const plannedWithUserId = PLANNED_PLANTS.map(plant => ({
      ...plant,
      user_id: user.id,
      menge: plant.quantity || 1
    }));

    // Combine all plants
    const allPlants = [...establishedWithUserId, ...plannedWithUserId];

    // Use upsert for idempotency - based on name+location+user_id uniqueness
    // (or just insert if unique constraint exists on name+user_id)
    const { data, error } = await supabase
      .from('plants')
      .upsert(
        allPlants,
        {
          onConflict: 'name', // Adjust based on your unique constraint
          ignoreDuplicates: false // Update if exists
        }
      )
      .select();

    if (error) {
      console.error('Error upserting seed data:', error);
      throw error;
    }

    console.log(`✅ Seed data synchronized: ${data?.length || 0} plants`);
    console.log(`   - ${ESTABLISHED_PLANTS.length} established plants`);
    console.log(`   - ${PLANNED_PLANTS.length} planned plants`);

    return {
      established: ESTABLISHED_PLANTS.length,
      planned: PLANNED_PLANTS.length,
      total: allPlants.length,
      synced: data?.length || 0
    };
  } catch (error) {
    console.error('Error in insertSeedData:', error);
    throw error;
  }
}

/**
 * Importiert Seed-Daten mit Progress-Tracking (für UI)
 * Wird vom seedDataService verwendet
 */
export async function insertSeedDataWithProgress(
  onProgress?: (current: number, total: number, plant: string) => void
) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be logged in to insert seed data');
  }

  const allPlants = [
    ...ESTABLISHED_PLANTS.map(p => ({ ...p, user_id: user.id, menge: p.quantity || 1 })),
    ...PLANNED_PLANTS.map(p => ({ ...p, user_id: user.id, menge: p.quantity || 1 }))
  ];

  const total = allPlants.length;
  let synced = 0;

  for (let i = 0; i < allPlants.length; i++) {
    const plant = allPlants[i];

    if (onProgress) {
      onProgress(i + 1, total, plant.name);
    }

    try {
      const { error } = await supabase
        .from('plants')
        .upsert(
          [plant],
          { onConflict: 'name', ignoreDuplicates: false }
        );

      if (!error) {
        synced++;
      } else {
        console.error(`Error syncing plant ${plant.name}:`, error);
      }
    } catch (err) {
      console.error(`Error syncing plant ${plant.name}:`, err);
    }
  }

  return {
    total,
    synced,
    established: ESTABLISHED_PLANTS.length,
    planned: PLANNED_PLANTS.length
  };
}
