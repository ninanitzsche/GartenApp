#!/usr/bin/env node

/**
 * Generate Migration JSON from Photo Filenames
 *
 * Parses photo filenames to extract plant names and generates garten2026-migration.json
 *
 * Naming Convention:
 *   [Location]_[Plant1]_[Plant2]_[Plant3]_[Description]_[Date].jpg
 *
 * Examples:
 *   Pergola_Weinreben.jpg
 *   Hauptbeet_Erdbeeren_Schnittlauch_Mais.jpg
 *   Februar2026_Schnittlauch_Blaetter_Aussaat.jpg
 *
 * Plants are extracted from anywhere in the filename (before the last underscore and extension)
 */

const fs = require('fs');
const path = require('path');

const GARTEN_PHOTOS_PATH = path.join(__dirname, '..', '..', 'Garten2026');
const OUTPUT_PATH = path.join(__dirname, 'data', 'garten2026-migration.json');

// List of all known plant names (will be populated from Garten2026 docs)
const KNOWN_PLANTS = [
  // Etablierte Pflanzen
  'Weinreben', 'Schnittlauch', 'Erdbeeren', 'Erdbeere',
  'Federnelke Rosa', 'Federnelke', 'Sonnenhut',
  'Günsel', 'Gunsel', 'Vogelmiere',

  // Bestellte/Geplante Pflanzen
  'Kartoffel', 'Kartoffeln',
  'Tomate', 'Tomaten',
  'Basilikum', 'Basilikums',
  'Mais',
  'Neuseeländer Spinat', 'Spinat',
  'Blaukissen',
  'Orangerote Habichtblume', 'Habichtblume',
  'Blaue Glockenblume', 'Glockenblume',
  'Beet', 'Beete',
  'Mulch', 'Aussaat', 'Triebe', 'Blaetter', 'Nahaufnahme',
  'Blatt', 'Blätter', 'Beetbereich', 'Uebersicht', 'Übersicht',
  'Moos', 'Bodendecker', 'Gewaechshaus', 'Gewächshaus',
  'Pergola', 'Gartenuebersicht', 'Garten', 'Zaun', 'Zaunseite'
];

class FilenameParser {
  constructor() {
    this.plantMap = new Map();
  }

  /**
   * Extract plant names from filename
   * Looks for known plant names in any order
   */
  extractPlants(filename) {
    const baseName = path.basename(filename, path.extname(filename))
      .replace(/[_-]/g, ' ')
      .toLowerCase();

    const plants = [];
    const foundPlants = new Set();

    // Try longer plant names first (to match "Neuseeländer Spinat" before "Spinat")
    const sortedPlants = [...KNOWN_PLANTS].sort((a, b) => b.length - a.length);

    for (const plant of sortedPlants) {
      if (baseName.includes(plant.toLowerCase()) && !foundPlants.has(plant.toLowerCase())) {
        // Skip single-word plants that are too generic (like "Beet", "Mulch", etc)
        if (plant.length > 3 && !this.isGenericTerm(plant)) {
          plants.push(plant);
          foundPlants.add(plant.toLowerCase());
        }
      }
    }

    return plants;
  }

  /**
   * Skip generic/descriptive terms that aren't specific plants
   */
  isGenericTerm(plant) {
    const generic = [
      'Beet', 'Beete', 'Mulch', 'Aussaat', 'Triebe', 'Blaetter',
      'Blatt', 'Blätter', 'Nahaufnahme', 'Beetbereich', 'Uebersicht',
      'Übersicht', 'Moos', 'Gartenuebersicht', 'Garten', 'Zaun'
    ];
    return generic.some(g => plant.toLowerCase() === g.toLowerCase());
  }

  /**
   * Extract location from filename
   */
  extractLocation(filename) {
    const baseName = path.basename(filename, path.extname(filename));

    // Check for known locations
    if (baseName.match(/hauptbeet/i)) return 'Hauptbeet';
    if (baseName.match(/hochbeet/i)) return 'Hochbeet';
    if (baseName.match(/gewaechshaus|gewächshaus/i)) return 'Gewächshaus';
    if (baseName.match(/pergola/i)) return 'Pergola';
    if (baseName.match(/zaun/i)) return 'Zaunseite';
    if (baseName.match(/beete|beet/i)) return 'Beete';

    return 'Garten'; // Default
  }

  /**
   * Extract date from filename
   */
  extractDate(filename) {
    const baseName = path.basename(filename, path.extname(filename));

    // Look for YYYY-MM-DD or YYYY_MM_DD format
    let match = baseName.match(/(\d{4}[-_]\d{2}[-_]\d{2})/);
    if (match) {
      return match[1].replace(/_/g, '-');
    }

    // Look for just year (2024, 2026, etc)
    match = baseName.match(/(\d{4})/);
    if (match) {
      return `2026-03-01`; // Default date for Garten2026
    }

    return '2026-03-01';
  }
}

function log(msg, type = 'info') {
  const colors = {
    info: '\x1b[34m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${msg}${colors.reset}`);
}

function findPhotos() {
  const photos = [];

  // Main directory
  if (fs.existsSync(GARTEN_PHOTOS_PATH)) {
    const files = fs.readdirSync(GARTEN_PHOTOS_PATH);
    files.forEach(file => {
      if (/\.(jpg|jpeg|png)$/i.test(file)) {
        photos.push({
          filename: file,
          path: path.join(GARTEN_PHOTOS_PATH, file),
          subdir: false
        });
      }
    });

    // Februar2026 subdirectory
    const februar2026 = path.join(GARTEN_PHOTOS_PATH, 'Februar2026');
    if (fs.existsSync(februar2026)) {
      const februarFiles = fs.readdirSync(februar2026);
      februarFiles.forEach(file => {
        if (/\.(jpg|jpeg|png)$/i.test(file)) {
          photos.push({
            filename: file,
            path: path.join(februar2026, file),
            subdir: true
          });
        }
      });
    }
  }

  return photos;
}

async function main() {
  log('\n📸 Generate Migration JSON from Filenames', 'success');
  log('='.repeat(50));

  try {
    const parser = new FilenameParser();
    const photos = findPhotos();

    if (photos.length === 0) {
      log('No photos found in Garten2026/', 'error');
      process.exit(1);
    }

    log(`\n📂 Found ${photos.length} photos\n`, 'info');

    const photoMigrations = [];

    photos.forEach((photo, index) => {
      const plants = parser.extractPlants(photo.filename);
      const location = parser.extractLocation(photo.filename);
      const date = parser.extractDate(photo.filename);

      const entry = {
        filename: photo.filename,
        location: location,
        date: date,
        notes: `Photo from ${photo.subdir ? 'Februar2026' : 'Garten2026'}`,
        linked_plants: plants
      };

      photoMigrations.push(entry);

      const plantStr = plants.length > 0 ? plants.join(', ') : '(keine Pflanzen erkannt)';
      log(`[${index + 1}/${photos.length}] ${photo.filename}`, 'info');
      log(`  📍 Location: ${location}`, 'info');
      log(`  🌱 Plants: ${plantStr}`, 'info');
      console.log('');
    });

    // For now, just show photo mappings
    // User will provide plant list separately
    const migration = {
      plants: [],
      photos: photoMigrations,
      notes: "Please fill in the 'plants' array with plant data from Garten2026 markdown files"
    };

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(migration, null, 2), 'utf8');

    log(`\n✅ Generated: ${OUTPUT_PATH}`, 'success');
    log(`\nNow you need to:`, 'info');
    log(`1. Add plant data to the 'plants' array`, 'warning');
    log(`2. Review photo-to-plant links in 'photos.linked_plants'`, 'warning');
    log(`3. Rename photos if needed for better clarity\n`, 'warning');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();
