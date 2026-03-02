/**
 * Seed Data für Gartenplaner
 * 
 * Diese Datei enthält die initialen Pflanzen-Daten aus Garten2026.
 * Wird beim ersten App-Start nach User-Registration automatisch eingefügt.
 */

import { supabase } from '../services/supabase';

export const ESTABLISHED_PLANTS = [
  {
    name: 'Weinreben',
    latin_name: 'Vitis vinifera',
    location: 'Pergola',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: true,
    notes: 'Im November schneiden',
    tags: ['rankend', 'winterhart']
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
    tags: ['kräuter', 'essbar']
  },
  {
    name: 'Erdbeeren',
    latin_name: 'Fragaria',
    location: 'Hauptbeet',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: true,
    notes: 'Alte Blätter im Frühjahr entfernen, Bodendecker',
    tags: ['obst', 'bodendecker']
  },
  {
    name: 'Federnelke Rosa',
    latin_name: 'Dianthus plumarius',
    location: 'Beet',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: false,
    notes: 'Bodendeckend, pflegeleicht',
    tags: ['blumen', 'bodendecker']
  },
  {
    name: 'Sonnenhut',
    latin_name: 'Echinacea',
    location: 'Zaunseite',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: false,
    notes: 'Winterhart, für Bienen',
    tags: ['blumen', 'bienenfreundlich']
  },
  {
    name: 'Günsel',
    latin_name: 'Ajuga reptans',
    location: 'Beet',
    type: 'mehrjährig',
    status: 'etabliert',
    winterhart: true,
    essbar: true,
    notes: 'Rötlich-braune Stängel, kriechend, essbar! Nicht entfernen.',
    tags: ['bodendecker', 'essbar', 'wichtig']
  },
  {
    name: 'Vogelmiere',
    latin_name: 'Stellaria media',
    location: 'Beete',
    type: 'einjährig',
    status: 'etabliert',
    winterhart: false,
    essbar: true,
    notes: 'Essbares Beikraut, Bodendecker, ist OK im Beet',
    tags: ['bodendecker', 'essbar', 'beikraut']
  }
];

export const PLANNED_PLANTS = [
  // Kartoffeln (50 Stück, 5 Sorten)
  { name: 'Innovator (Kartoffel)', location: 'Hauptbeet', type: 'einjährig', status: 'bestellt', essbar: true, quantity: 10, tags: ['kartoffel'] },
  { name: 'Ditta (Kartoffel)', location: 'Hauptbeet', type: 'einjährig', status: 'bestellt', essbar: true, quantity: 10, tags: ['kartoffel'] },
  { name: 'Leyla (Kartoffel)', location: 'Hauptbeet', type: 'einjährig', status: 'bestellt', essbar: true, quantity: 10, tags: ['kartoffel'] },
  { name: 'Blue Star (Kartoffel)', location: 'Hauptbeet', type: 'einjährig', status: 'bestellt', essbar: true, quantity: 10, tags: ['kartoffel'] },
  { name: 'Highland Burgundy Red (Kartoffel)', location: 'Hauptbeet', type: 'einjährig', status: 'bestellt', essbar: true, quantity: 10, tags: ['kartoffel'] },
  
  // Tomaten (4 Sorten)
  { name: 'Zuckertraube (Tomate)', location: 'Gewächshaus', type: 'einjährig', status: 'geplant', essbar: true, quantity: 2, tags: ['tomate'] },
  { name: 'Matina (Tomate)', location: 'Gewächshaus', type: 'einjährig', status: 'geplant', essbar: true, quantity: 1, tags: ['tomate'] },
  { name: 'Marmande (Tomate)', location: 'Gewächshaus', type: 'einjährig', status: 'geplant', essbar: true, quantity: 1, tags: ['tomate'] },
  { name: 'Tom Red (Tomate)', location: 'Hochbeet', type: 'einjährig', status: 'geplant', essbar: true, quantity: 1, tags: ['tomate'] },
  
  // Drei Schwestern
  { name: 'Mais', location: 'Hauptbeet', type: 'einjährig', status: 'geplant', essbar: true, quantity: 12, tags: ['mais', 'drei-schwestern'] },
  { name: 'Stangenbohnen', location: 'Hauptbeet', type: 'einjährig', status: 'geplant', essbar: true, tags: ['bohnen', 'drei-schwestern'] },
  { name: 'Hokkaido Kürbis', location: 'Hauptbeet', type: 'einjährig', status: 'geplant', essbar: true, quantity: 4, tags: ['kürbis', 'drei-schwestern'] },
  
  // Weitere Gemüse
  { name: 'Gurke (Ranktürme)', location: 'Hauptbeet', type: 'einjährig', status: 'geplant', essbar: true, quantity: 3, tags: ['gurke'] },
  { name: 'Kohlrabi', location: 'Hauptbeet', type: 'einjährig', status: 'geplant', essbar: true, tags: ['kohlrabi'] },
  { name: 'Zwiebeln', location: 'Hauptbeet', type: 'einjährig', status: 'geplant', essbar: true, tags: ['zwiebel'] },
  { name: 'Riesenzwiebel Kelsae', location: 'Hauptbeet', type: 'einjährig', status: 'geplant', essbar: true, quantity: 1, tags: ['zwiebel'] },
  { name: 'Porree', location: 'Hauptbeet', type: 'einjährig', status: 'geplant', essbar: true, tags: ['lauch'] },
  
  // Kräuter & Bodendecker
  { name: 'Basilikum', location: 'Gewächshaus', type: 'einjährig', status: 'geplant', essbar: true, tags: ['kräuter'] },
  { name: 'Thymian', location: 'Gewächshaus', type: 'mehrjährig', status: 'geplant', essbar: true, winterhart: true, tags: ['kräuter', 'bodendecker'] },
  { name: 'Neuseeländer Spinat', location: 'Beete', type: 'einjährig', status: 'geplant', essbar: true, tags: ['spinat', 'bodendecker'] },
  { name: 'Feldsalat Vit', location: 'Beete', type: 'einjährig', status: 'geplant', essbar: true, tags: ['salat', 'bodendecker'] },
  { name: 'Portulak Sommer', location: 'Beete', type: 'einjährig', status: 'geplant', essbar: true, tags: ['portulak', 'bodendecker'] },
  { name: 'Rotklee', location: 'Hauptbeet', type: 'mehrjährig', status: 'geplant', essbar: false, winterhart: true, tags: ['bodendecker', 'gründüngung'] },
  { name: 'Weißklee', location: 'Beete', type: 'mehrjährig', status: 'geplant', essbar: false, winterhart: true, tags: ['bodendecker'] },
  
  // Blumen/Bienen
  { name: 'Katzenminze', location: 'Zaunseite', type: 'mehrjährig', status: 'geplant', winterhart: true, tags: ['blumen', 'bienenfreundlich'] },
  { name: 'Wildblumen-Mix', location: 'Zaunseite', type: 'mehrjährig', status: 'geplant', winterhart: true, tags: ['blumen', 'bienenfreundlich'] },
];

/**
 * Fügt Seed-Daten in die Datenbank ein
 * Nur ausführen wenn noch keine Pflanzen vorhanden!
 */
export async function insertSeedData() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to insert seed data');
  }
  
  // Check if plants already exist
  const { data: existingPlants, error: checkError } = await supabase
    .from('plants')
    .select('id')
    .limit(1);
    
  if (checkError) throw checkError;
  
  if (existingPlants && existingPlants.length > 0) {
    console.log('Seed data already inserted. Skipping.');
    return { skipped: true };
  }
  
  // Insert established plants
  const establishedWithUserId = ESTABLISHED_PLANTS.map(plant => ({
    ...plant,
    user_id: user.id
  }));
  
  const { data: established, error: establishedError } = await supabase
    .from('plants')
    .insert(establishedWithUserId)
    .select();
    
  if (establishedError) throw establishedError;
  
  // Insert planned plants
  const plannedWithUserId = PLANNED_PLANTS.map(plant => ({
    ...plant,
    user_id: user.id
  }));
  
  const { data: planned, error: plannedError } = await supabase
    .from('plants')
    .insert(plannedWithUserId)
    .select();
    
  if (plannedError) throw plannedError;
  
  console.log(`✅ Seed data inserted: ${established?.length} established plants, ${planned?.length} planned plants`);
  
  return {
    established: established?.length || 0,
    planned: planned?.length || 0,
    total: (established?.length || 0) + (planned?.length || 0)
  };
}
