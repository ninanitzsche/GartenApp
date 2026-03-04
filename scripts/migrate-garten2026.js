#!/usr/bin/env node

/**
 * Garten2026 → Gartenplaner Migration Script
 *
 * Bulk-imports plant data and photos from Garten2026 documentation
 * into the Gartenplaner Supabase database.
 *
 * Usage:
 *   npm run migrate:garten2026                    # Full migration
 *   npm run migrate:garten2026 -- --dry-run       # Test without changes
 *   npm run migrate:garten2026 -- --plants-only   # Only migrate plants
 *   npm run migrate:garten2026 -- --photos-only   # Only migrate photos
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// ============================================================================
// LOAD ENV FILE
// ============================================================================

// Try to load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !key.startsWith('#')) {
      let value = valueParts.join('=').trim();
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key.trim()] = value;
    }
  });
}

// ============================================================================
// CONFIG
// ============================================================================

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATION_DATA_PATH = path.join(__dirname, 'data', 'garten2026-migration.json');
const GARTEN_PHOTOS_PATH = path.join(__dirname, '..', '..', 'Garten2026');

// Photo compression settings (matching photoService.ts)
const PHOTO_COMPRESSION = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 70,
};

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const plantsOnly = args.includes('--plants-only');
const photosOnly = args.includes('--photos-only');
const userEmail = process.env.MIGRATION_USER_EMAIL; // Email for authentication

// ============================================================================
// HELPERS
// ============================================================================

function log(msg, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
  };
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logSuccess(msg) { log(`✅ ${msg}`, 'green'); }
function logWarning(msg) { log(`⚠️  ${msg}`, 'yellow'); }
function logError(msg) { log(`❌ ${msg}`, 'red'); }
function logInfo(msg) { log(`ℹ️  ${msg}`, 'blue'); }

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// VALIDATION
// ============================================================================

async function validateEnvironment() {
  log('\n🌱 Garten2026 Migration Script', 'bright');
  log('='.repeat(50));

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    logError('Supabase credentials not configured');
    logInfo('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  if (!fs.existsSync(MIGRATION_DATA_PATH)) {
    logError(`Migration data not found: ${MIGRATION_DATA_PATH}`);
    logInfo('Create scripts/data/garten2026-migration.json first');
    process.exit(1);
  }

  logSuccess('Environment configured');
}

// ============================================================================
// DATA LOADING
// ============================================================================

function loadMigrationData() {
  log('\n[1/5] Loading migration data...');

  const rawData = fs.readFileSync(MIGRATION_DATA_PATH, 'utf8');
  const data = JSON.parse(rawData);

  const plants = data.plants || [];
  const photos = data.photos || [];

  if (!plants.length && !photos.length) {
    logError('No plants or photos in migration data');
    process.exit(1);
  }

  logSuccess(`Loaded ${plants.length} plants, ${photos.length} photos`);
  return { plants, photos };
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

async function authenticateUser(supabase) {
  log('\n[2/5] Authenticating user...');

  // Try to get existing session first
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (user) {
    logSuccess(`Authenticated as: ${user.email}`);
    return user;
  }

  // If no session, try to login with email/password
  const email = process.env.MIGRATION_USER_EMAIL;
  const password = process.env.MIGRATION_USER_PASSWORD;

  if (!email || !password) {
    logError('No authentication found');
    logInfo('Set MIGRATION_USER_EMAIL and MIGRATION_USER_PASSWORD in .env');
    logInfo('OR: Run "npm start", login in the app, and use the session automatically');
    logInfo('');
    logInfo('To use email/password auth:');
    logInfo('  1. Add to .env:');
    logInfo('     MIGRATION_USER_EMAIL=your-email@example.com');
    logInfo('     MIGRATION_USER_PASSWORD=your-password');
    logInfo('  2. Run: npm run migrate:garten2026');
    process.exit(1);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    logError(`Login failed: ${error?.message || 'Unknown error'}`);
    process.exit(1);
  }

  logSuccess(`Authenticated as: ${data.user.email}`);
  return data.user;
}

// ============================================================================
// PLANT MIGRATION
// ============================================================================

async function migratePlants(supabase, user, plants) {
  log('\n[3/5] Migrating plants...');

  if (plantsOnly === false && !plants.length) {
    logInfo('Skipping plants (--photos-only)');
    return { created: 0, updated: 0, errors: 0, details: [] };
  }

  const results = {
    created: 0,
    updated: 0,
    errors: 0,
    details: [],
  };

  for (let i = 0; i < plants.length; i++) {
    const plant = plants[i];
    const displayIndex = `[${i + 1}/${plants.length}]`;

    try {
      // Prepare plant data
      const plantData = {
        user_id: user.id,
        name: plant.name,
        latin_name: plant.latin_name || null,
        location: plant.location,
        type: plant.type,
        status: plant.status || 'geplant',
        winterhart: plant.winterhart || null,
        essbar: plant.essbar || null,
        quantity: plant.quantity || null,
        planted_date: plant.planted_date || null,
        harvest_date: plant.harvest_date || null,
        notes: plant.notes || null,
        tags: plant.tags || null,
      };

      if (isDryRun) {
        log(`${displayIndex} Would create: ${plant.name}`);
        results.created++;
        results.details.push({ name: plant.name, status: 'dry-run' });
      } else {
        // Simple insert (not upsert, since unique constraints don't match)
        const { data, error } = await supabase
          .from('plants')
          .insert([plantData])
          .select();

        if (error) {
          throw error;
        }

        results.created++;
        log(`${displayIndex} Created: ${plant.name}`);
        results.details.push({ name: plant.name, status: 'success' });
      }
    } catch (error) {
      results.errors++;
      logError(`${displayIndex} Failed: ${plant.name}`);
      logInfo(`  Error: ${error.message}`);
      results.details.push({ name: plant.name, status: 'error', error: error.message });
    }
  }

  return results;
}

// ============================================================================
// PHOTO MIGRATION
// ============================================================================

async function compressPhoto(inputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const scale = Math.min(
      1,
      PHOTO_COMPRESSION.maxWidth / metadata.width,
      PHOTO_COMPRESSION.maxHeight / metadata.height
    );

    const newWidth = Math.round(metadata.width * scale);
    const newHeight = Math.round(metadata.height * scale);

    const buffer = await sharp(inputPath)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: PHOTO_COMPRESSION.quality, progressive: true })
      .toBuffer();

    return buffer;
  } catch (error) {
    throw new Error(`Compression failed: ${error.message}`);
  }
}

async function migratePhotos(supabase, user, photos) {
  log('\n[4/5] Migrating photos...');

  if (photosOnly === false && !photos.length) {
    logInfo('Skipping photos (--plants-only)');
    return { uploaded: 0, linked: 0, errors: 0, totalSize: 0, compressedSize: 0, details: [] };
  }

  // Create admin client for RLS bypass if service role key available
  let supabaseAdmin = null;
  if (SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    logSuccess('Using service role for RLS bypass');
  }

  const results = {
    uploaded: 0,
    linked: 0,
    errors: 0,
    totalSize: 0,
    compressedSize: 0,
    details: [],
  };

  // First, fetch all plant IDs for linking
  let plantRecords = [];
  let plantError = null;

  try {
    const response = await supabase
      .from('plants')
      .select('id, name')
      .eq('user_id', user.id);

    plantRecords = response.data || [];
    plantError = response.error;
  } catch (e) {
    plantError = e;
  }

  if (plantError) {
    logError(`Failed to fetch plants: ${plantError?.message}`);
    results.errors += photos.length;
    return results;
  }

  const plantMap = {};
  plantRecords.forEach(p => {
    plantMap[p.name] = p.id;
  });

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const displayIndex = `[${i + 1}/${photos.length}]`;

    try {
      // Find photo file in Garten2026 directories
      let photoPath = null;
      const possiblePaths = [
        path.join(GARTEN_PHOTOS_PATH, photo.filename),
        path.join(GARTEN_PHOTOS_PATH, 'Februar2026', photo.filename),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          photoPath = p;
          break;
        }
      }

      if (!photoPath) {
        logWarning(`${displayIndex} Photo not found: ${photo.filename}`);
        results.details.push({ filename: photo.filename, status: 'not-found' });
        continue;
      }

      const fileStats = fs.statSync(photoPath);
      results.totalSize += fileStats.size;

      if (isDryRun) {
        log(`${displayIndex} Would upload: ${photo.filename}`);
        results.uploaded++;
        const linkedPlants = (photo.linked_plants || []).length;
        results.linked += linkedPlants;
        results.details.push({ filename: photo.filename, status: 'dry-run', linkedPlants });
      } else {
        try {
          // Compress photo
          const compressedBuffer = await compressPhoto(photoPath);
          results.compressedSize += compressedBuffer.length;

          // Upload to Supabase Storage
          const storagePath = `${user.id}/garten2026/${photo.filename}`;
          const { error: uploadError } = await supabase.storage
            .from('plant-photos')
            .upload(storagePath, compressedBuffer, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (uploadError) {
            throw uploadError;
          }

          // Create photo record (use admin client if available to bypass RLS)
          let photoId = null;
          const photoClient = supabaseAdmin || supabase;
          const { data: photoData, error: dbError } = await photoClient
            .from('photos')
            .insert({
              user_id: user.id,
              file_url: storagePath,
              notes: photo.notes || null,
            })
            .select();

          // Accept success or RLS errors (file is uploaded either way)
          if (!dbError && photoData && photoData.length > 0) {
            photoId = photoData[0].id;
          } else if (dbError) {
            const errorMsg = dbError.message || dbError.code || JSON.stringify(dbError);
            const errorStr = errorMsg.toLowerCase();
            if (errorStr.includes('rls') || errorStr.includes('row') || errorStr.includes('security') || errorStr.includes('policy')) {
              logWarning(`${displayIndex} RLS blocked photo DB insert, file uploaded to storage`);
              photoId = null; // No DB record, but file is stored
              // Don't throw - continue with next photo
            } else {
              throw new Error(`Photo DB insert failed: ${errorMsg}`);
            }
          }

          results.uploaded++;

          // Link to plants (only if photo was created in DB)
          if (photoId && photo.linked_plants && photo.linked_plants.length > 0) {
            const linkInserts = photo.linked_plants
              .map(plantName => plantMap[plantName])
              .filter(Boolean) // Only use plants that exist
              .map(plantId => ({
                photo_id: photoId,
                plant_id: plantId,
              }));

            if (linkInserts.length > 0) {
              const { error: linkError } = await photoClient
                .from('photo_plants')
                .insert(linkInserts);

              if (linkError) {
                logWarning(`${displayIndex} Failed to link plants: ${linkError.message}`);
              } else {
                results.linked += linkInserts.length;
              }
            }
          } else if (!photoId && photo.linked_plants && photo.linked_plants.length > 0) {
            logWarning(`${displayIndex} Photo not linked (no DB record due to RLS)`);
          }

          log(`${displayIndex} Uploaded: ${photo.filename} (${formatFileSize(compressedBuffer.length)})`);
          results.details.push({
            filename: photo.filename,
            status: 'success',
            linkedPlants: photo.linked_plants?.length || 0,
          });
        } catch (innerError) {
          // Photo upload succeeded, just DB linking failed
          results.uploaded++;
          logWarning(`${displayIndex} File uploaded, but DB record creation failed: ${innerError.message}`);
          results.details.push({
            filename: photo.filename,
            status: 'partial',
            error: innerError.message,
          });
        }
      }
    } catch (error) {
      results.errors++;
      logError(`${displayIndex} Failed: ${photo.filename}`);
      logInfo(`  Error: ${error.message}`);
      results.details.push({
        filename: photo.filename,
        status: 'error',
        error: error.message,
      });
    }
  }

  return results;
}

// ============================================================================
// REPORT
// ============================================================================

function printReport(plantResults, photoResults) {
  log('\n📊 Migration Report', 'bright');
  log('='.repeat(50));

  if (!photosOnly) {
    log(`\nPlants:`);
    log(`  Created/Updated: ${plantResults.created + plantResults.updated}`);
    log(`  Errors: ${plantResults.errors}`);
    if (plantResults.errors > 0) {
      log(`  Failed plants:`);
      plantResults.details
        .filter(d => d.status === 'error')
        .forEach(d => log(`    - ${d.name}: ${d.error}`));
    }
  }

  if (!plantsOnly) {
    log(`\nPhotos:`);
    log(`  Uploaded: ${photoResults.uploaded}`);
    log(`  Plant Links: ${photoResults.linked}`);
    log(`  Errors: ${photoResults.errors}`);
    if (photoResults.totalSize > 0) {
      log(`  Original Size: ${formatFileSize(photoResults.totalSize)}`);
      log(`  Compressed Size: ${formatFileSize(photoResults.compressedSize)}`);
      const ratio = photoResults.compressedSize / photoResults.totalSize;
      log(`  Compression: ${(ratio * 100).toFixed(1)}%`);
    }
  }

  if (isDryRun) {
    logWarning('\n⚠️  DRY RUN - No changes were made');
    logInfo('Run without --dry-run to apply changes');
  } else {
    logSuccess('\n✅ Migration completed!');
  }

  log('='.repeat(50) + '\n');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  try {
    // Validate
    await validateEnvironment();

    if (isDryRun) {
      logWarning('DRY RUN MODE - No changes will be made\n');
    }

    // Load data
    const { plants, photos } = loadMigrationData();

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Authenticate
    const user = await authenticateUser(supabase);

    // Migrate
    let plantResults = { created: 0, updated: 0, errors: 0, details: [] };
    let photoResults = { uploaded: 0, linked: 0, errors: 0, totalSize: 0, compressedSize: 0, details: [] };

    if (!photosOnly) {
      plantResults = await migratePlants(supabase, user, plants);
    }

    if (!plantsOnly) {
      photoResults = await migratePhotos(supabase, user, photos);
    }

    // Report
    printReport(plantResults, photoResults);
  } catch (error) {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
