/**
 * Seed Garden Script - Gartenplaner
 *
 * Dieses Script synchronisiert die Garten-Seed-Daten (Garten2026) mit Supabase.
 *
 * Verwendung:
 *   ts-node scripts/seed-garden.ts
 *
 * Funktionen:
 * - Liest Pflanzendaten aus data/garden-seed-data.json
 * - Synchronisiert mit Supabase (upsert = idempotent)
 * - Zeigt Progress und Zusammenfassung
 *
 * Die Daten enthalten:
 * - 7 etablierte Pflanzen (Weinreben, Schnittlauch, Erdbeeren, Federnelke, Sonnenhut, Günsel, Vogelmiere)
 * - 50+ geplante/bestellte Pflanzen (Kartoffeln, Tomaten, Gemüse, Kräuter, Blumen, etc.)
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.error('Please set these environment variables in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PlantData {
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

interface GardenSeedData {
  established_plants: PlantData[];
  planned_plants: PlantData[];
}

async function seedGarden() {
  console.log('🌱 Starting Gartenplaner Seed Data Synchronization...\n');

  try {
    // Check authentication (optional - can work with anon key for insert/upsert)
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (!session) {
      console.log('⚠️  No active session. Using anonymous key for operations.');
      console.log('   Note: RLS policies must allow anonymous inserts if configured.\n');
    }

    // Load seed data from JSON file
    const seedDataPath = path.join(__dirname, '../data/garden-seed-data.json');

    if (!fs.existsSync(seedDataPath)) {
      console.error(`❌ Error: Seed data file not found at ${seedDataPath}`);
      process.exit(1);
    }

    const seedDataContent = fs.readFileSync(seedDataPath, 'utf-8');
    const seedData: GardenSeedData = JSON.parse(seedDataContent);

    console.log(`📂 Loaded seed data from data/garden-seed-data.json`);
    console.log(`   - ${seedData.established_plants.length} established plants`);
    console.log(`   - ${seedData.planned_plants.length} planned plants\n`);

    // Combine all plants
    const allPlants = [
      ...seedData.established_plants,
      ...seedData.planned_plants
    ];

    // Prepare plants for database (add menge = quantity, handle nulls)
    const plantsToSync = allPlants.map(plant => ({
      name: plant.name,
      latin_name: plant.latin_name || null,
      location: plant.location,
      type: plant.type,
      status: plant.status,
      winterhart: plant.winterhart ?? false,
      essbar: plant.essbar ?? false,
      menge: plant.quantity || plant.menge || 1,
      pflanz_datum: plant.pflanz_datum || null,
      ernte_datum: plant.ernte_datum || null,
      tags: plant.tags || [],
      notes: plant.notes || null,
      pflegehinweise: plant.notes || null
    }));

    console.log('🔄 Synchronizing plants with Supabase...\n');

    let synced = 0;
    let errors = 0;
    const erroredPlants: string[] = [];

    // Upsert plants one by one to show progress
    for (let i = 0; i < plantsToSync.length; i++) {
      const plant = plantsToSync[i];
      const progress = `[${i + 1}/${plantsToSync.length}]`;

      try {
        // Use upsert for idempotency
        const { error } = await supabase
          .from('plants')
          .upsert(
            [plant],
            {
              onConflict: 'name',
              ignoreDuplicates: false
            }
          );

        if (error) {
          console.error(`${progress} ❌ ${plant.name}: ${error.message}`);
          errors++;
          erroredPlants.push(plant.name);
        } else {
          console.log(`${progress} ✅ ${plant.name}`);
          synced++;
        }
      } catch (err: any) {
        console.error(`${progress} ❌ ${plant.name}: ${err.message}`);
        errors++;
        erroredPlants.push(plant.name);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNCHRONIZATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully synced: ${synced}/${plantsToSync.length} plants`);
    console.log(`❌ Errors: ${errors}/${plantsToSync.length} plants`);
    console.log(`   - Established: ${seedData.established_plants.length}`);
    console.log(`   - Planned: ${seedData.planned_plants.length}`);

    if (erroredPlants.length > 0) {
      console.log(`\n⚠️  Plants with errors:`);
      erroredPlants.forEach(name => console.log(`   - ${name}`));
    }

    console.log('\n✨ Seed data synchronization complete!');
    console.log('   Plants are now visible in the Gartenplaner app.\n');

    // Verify data
    try {
      const { count } = await supabase
        .from('plants')
        .select('*', { count: 'exact', head: true });

      console.log(`📈 Total plants in database: ${count || 0}`);
    } catch (err) {
      console.log('   (Could not verify plant count)');
    }

    process.exit(errors > 0 ? 1 : 0);

  } catch (error: any) {
    console.error('❌ Fatal Error:', error.message || error);
    process.exit(1);
  }
}

// Run the seed function
seedGarden();
