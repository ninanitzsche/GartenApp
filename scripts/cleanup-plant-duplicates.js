/**
 * Script to clean up duplicate plants and consolidate their photos
 * Usage: node scripts/cleanup-plant-duplicates.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
if (fs.existsSync(path.join(__dirname, '..', '.env'))) {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicates() {
  try {
    console.log('🔍 Scanning for duplicate plants...\n');

    // Get current user (for multi-user setup, we'd need user_id param)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user && !userError) {
      // For service role, we need to handle all users or ask for user_id
      console.log('ℹ️  Using service role to clean all user data\n');
    }

    // Find all duplicate plants
    const { data: duplicates, error: dupError } = await supabase
      .from('plants')
      .select('id, name, user_id')
      .order('name')
      .order('created_at');

    if (dupError) throw dupError;

    // Group by name to find duplicates
    const grouped = {};
    (duplicates || []).forEach(plant => {
      const key = `${plant.user_id}:${plant.name}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(plant);
    });

    const duplicateGroups = Object.entries(grouped).filter(([_, plants]) => plants.length > 1);

    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    console.log(`Found ${duplicateGroups.length} plants with duplicates:\n`);

    let totalConsolidated = 0;
    let totalDeleted = 0;

    // Process each duplicate group
    for (const [key, plants] of duplicateGroups) {
      const [userId, plantName] = key.split(':');
      console.log(`📌 ${plantName} (${plants.length} duplicates)`);

      // Keep the first one, consolidate others
      const keepPlant = plants[0];
      const deletePlants = plants.slice(1);

      console.log(`   ✓ Keep: ${keepPlant.id}`);
      console.log(`   ✗ Delete: ${deletePlants.map(p => p.id).join(', ')}`);

      try {
        // Consolidate photos from duplicates to main plant
        for (const dupPlant of deletePlants) {
          // Get all photo links for this duplicate
          const { data: photoLinks, error: linkError } = await supabase
            .from('photo_plants')
            .select('photo_id')
            .eq('plant_id', dupPlant.id);

          if (linkError) {
            console.log(`   ⚠️  Error fetching photos for ${dupPlant.id}: ${linkError.message}`);
            continue;
          }

          // Re-link photos to main plant (if not already linked)
          if (photoLinks && photoLinks.length > 0) {
            for (const link of photoLinks) {
              // Check if already linked
              const { data: existing } = await supabase
                .from('photo_plants')
                .select('id')
                .eq('plant_id', keepPlant.id)
                .eq('photo_id', link.photo_id);

              // Only insert if not already linked
              if (!existing || existing.length === 0) {
                await supabase
                  .from('photo_plants')
                  .insert({
                    plant_id: keepPlant.id,
                    photo_id: link.photo_id,
                  });

                totalConsolidated++;
              }
            }
          }

          // Delete old photo links
          await supabase
            .from('photo_plants')
            .delete()
            .eq('plant_id', dupPlant.id);

          // Delete the duplicate plant
          await supabase
            .from('plants')
            .delete()
            .eq('id', dupPlant.id);

          totalDeleted++;
        }

        console.log(`   ✅ Consolidated ${deletePlants.length} duplicates\n`);
      } catch (error) {
        console.log(`   ❌ Error processing: ${error.message}\n`);
      }
    }

    console.log('📊 Cleanup Summary:');
    console.log(`   Photos consolidated: ${totalConsolidated}`);
    console.log(`   Duplicate plants deleted: ${totalDeleted}`);
    console.log(`   Duplicate groups cleaned: ${duplicateGroups.length}\n`);
    console.log('✅ Cleanup completed!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run cleanup
cleanupDuplicates();
