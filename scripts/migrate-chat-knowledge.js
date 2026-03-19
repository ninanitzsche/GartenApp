#!/usr/bin/env node

/**
 * Chat Knowledge → Gartenplaner Migration Script
 *
 * Bulk-imports gardening knowledge, calendar tasks, and plant schedules
 * from Gemini chat transcripts into the Gartenplaner Supabase database.
 *
 * Usage:
 *   npm run migrate:chat-knowledge                    # Full migration
 *   npm run migrate:chat-knowledge -- --dry-run       # Test without changes
 *   npm run migrate:chat-knowledge -- --tasks-only    # Only migrate tasks
 *   npm run migrate:chat-knowledge -- --knowledge-only # Only migrate knowledge
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ============================================================================
// LOAD ENV FILE
// ============================================================================

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !key.startsWith('#')) {
      let value = valueParts.join('=').trim();
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
const GEMINI_1_PATH = path.join(__dirname, '..', '..', 'Gemini chatverlauf 1.md');
const GEMINI_2_PATH = path.join(__dirname, '..', '..', 'Gemini Chatverlauf 2.md');

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const tasksOnly = args.includes('--tasks-only');
const knowledgeOnly = args.includes('--knowledge-only');

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

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Extract calendar entries from Gemini chat format
 * Format: "Title\n\nDate (e.g., Sonntag, 10.05.2026)\n\nDescription"
 */
function parseCalendarEntries(markdownContent) {
  const entries = [];

  // Pattern: Title followed by date in German format
  const datePattern = /^(.*?)\n\n(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag),\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/gm;

  let match;
  while ((match = datePattern.exec(markdownContent)) !== null) {
    const title = match[1].trim();
    const day = parseInt(match[3]);
    const month = parseInt(match[4]);
    const year = parseInt(match[5]);

    // Get description (text until next calendar entry or section)
    const startIndex = match.index + match[0].length;
    const nextMatch = datePattern.exec(markdownContent);
    datePattern.lastIndex = match.index; // Reset for next iteration

    const endIndex = nextMatch ? nextMatch.index : markdownContent.length;
    const description = markdownContent.substring(startIndex, endIndex).trim();

    // Format date as YYYY-MM-DD
    const scheduledDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    entries.push({
      title: title.replace(/\n/g, ' ').trim(),
      description: description.substring(0, description.indexOf('\n\nDu hast gesagt') || description.length).trim(),
      scheduled_date: scheduledDate,
      category: categorizeTask(title),
      priority: prioritizeTask(title)
    });
  }

  return entries;
}

/**
 * Categorize task based on title
 */
function categorizeTask(title) {
  const lower = title.toLowerCase();
  if (lower.includes('aussaat') || lower.includes('säen')) return 'planting';
  if (lower.includes('schnitt') || lower.includes('rückschnitt')) return 'pruning';
  if (lower.includes('ernte')) return 'harvesting';
  if (lower.includes('mulch')) return 'mulching';
  if (lower.includes('gießen') || lower.includes('wasser')) return 'watering';
  if (lower.includes('jauche')) return 'fertilizing';
  if (lower.includes('dünger')) return 'fertilizing';
  return 'maintenance';
}

/**
 * Set priority based on task importance
 */
function prioritizeTask(title) {
  const lower = title.toLowerCase();
  if (lower.includes('kritisch') || lower.includes('wache')) return 'hoch';
  if (lower.includes('schneckenschutz')) return 'hoch';
  if (lower.includes('vorzucht')) return 'hoch';
  return 'mittel';
}

/**
 * Extract plant-specific care information for knowledge articles
 */
function parsePlantCareGuides(markdownContent) {
  const articles = [];

  // Extract care tables and sections
  const careTablePattern = /\|Pflanze\|.*?\n\|[\s\-|]*\n([\s\S]*?)(?=\n---|\n##|Du hast gesagt|$)/g;

  let match;
  while ((match = careTablePattern.exec(markdownContent)) !== null) {
    articles.push({
      title: 'Pflegeanleitung - Pflanzentabelle',
      category: 'care',
      content: `## Pflegeanleitung Tabelle\n\n${match[0]}`,
      is_favorited: false
    });
  }

  // Extract strategy sections (marked by ## headings)
  const strategyPattern = /^## (.*?)\n\n([\s\S]*?)(?=\n##|Du hast gesagt|$)/gm;

  while ((match = strategyPattern.exec(markdownContent)) !== null) {
    if (match[1].toLowerCase().includes('strategi') ||
        match[1].toLowerCase().includes('design') ||
        match[1].toLowerCase().includes('tipp')) {
      articles.push({
        title: `Strategie: ${match[1].trim()}`,
        category: 'strategy',
        content: match[2].substring(0, 2000), // Limit content
        is_favorited: false
      });
    }
  }

  return articles;
}

/**
 * Extract plant-specific planting dates to update planted_date
 */
function extractPlantingDates(markdownContent) {
  const plantDates = {};

  // Pattern: "Plant Name ... Date"
  const patterns = [
    /Kartoffel[^:]*:\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/gi,
    /Tomate[^:]*:\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/gi,
    /Spinat[^:]*:\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/gi,
    /(.*?)\s*\((\d{1,2})\.(\d{1,2})\.(\d{4})\)/g
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(markdownContent)) !== null) {
      if (match.length >= 4) {
        // Handle different capture group counts
        const text = match[0];
        if (!text.includes('Google Calendar') && !text.includes('Ereignis')) {
          // Try to extract plant name and date
          const dayMatch = match[1];
          const monthMatch = match[2];
          const yearMatch = match[3];

          if (dayMatch && monthMatch && yearMatch) {
            const date = `${yearMatch}-${String(monthMatch).padStart(2, '0')}-${String(dayMatch).padStart(2, '0')}`;
            // Simple plant extraction - would need more sophisticated parsing
          }
        }
      }
    }
  });

  return plantDates;
}

// ============================================================================
// VALIDATION
// ============================================================================

async function validateEnvironment() {
  log('\n🌿 Chat Knowledge Migration Script', 'bright');
  log('='.repeat(50));

  if (isDryRun) {
    logInfo('DRY RUN MODE - No changes will be made');
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    logError('Supabase credentials not configured');
    logInfo('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  if (!fs.existsSync(GEMINI_1_PATH)) {
    logWarning(`Gemini Chatverlauf 1 not found: ${GEMINI_1_PATH}`);
  } else {
    logSuccess('Gemini Chatverlauf 1 found');
  }

  if (!fs.existsSync(GEMINI_2_PATH)) {
    logWarning(`Gemini Chatverlauf 2 not found: ${GEMINI_2_PATH}`);
  } else {
    logSuccess('Gemini Chatverlauf 2 found');
  }
}

// ============================================================================
// MIGRATION
// ============================================================================

async function migrateData() {
  // Use service role key for migrations (bypass RLS)
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  const supabase = createClient(SUPABASE_URL, supabaseKey);

  // Get authenticated user
  log('\n[1/4] Authenticating user...');

  let userId;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Using service role - we need to get the user's ID
    // For now, get from auth.getUser if available
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      logSuccess(`Authenticated as: ${user.email} (service role)`);
    } else {
      logError('Could not determine user ID. Please ensure you are logged in or provide user_id.');
      process.exit(1);
    }
  } else {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      logError('Not authenticated. Please run: npm start and login first');
      process.exit(1);
    }

    logSuccess(`Authenticated as: ${user.email}`);
    userId = user.id;
  }

  // Load and parse markdown files
  log('\n[2/4] Loading and parsing chat transcripts...');

  let allTasks = [];
  let allArticles = [];

  if (fs.existsSync(GEMINI_1_PATH)) {
    const content1 = fs.readFileSync(GEMINI_1_PATH, 'utf8');
    allTasks = allTasks.concat(parseCalendarEntries(content1));
    allArticles = allArticles.concat(parsePlantCareGuides(content1));
    logSuccess(`Parsed Gemini Chatverlauf 1: ${allTasks.length} tasks found`);
  }

  if (fs.existsSync(GEMINI_2_PATH)) {
    const content2 = fs.readFileSync(GEMINI_2_PATH, 'utf8');
    allTasks = allTasks.concat(parseCalendarEntries(content2));
    allArticles = allArticles.concat(parsePlantCareGuides(content2));
    logSuccess(`Parsed Gemini Chatverlauf 2: ${allTasks.length} total tasks found`);
  }

  // Migrate tasks
  if (!knowledgeOnly && allTasks.length > 0) {
    log(`\n[3/4] Migrating ${allTasks.length} tasks...`);

    for (let i = 0; i < allTasks.length; i++) {
      const task = allTasks[i];

      if (!isDryRun) {
        const { error } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            scheduled_date: task.scheduled_date,
            auto_generated: true
          });

        if (error) {
          logWarning(`Task "${task.title}": ${error.message}`);
        }
      }

      log(`[${i + 1}/${allTasks.length}] ${task.title} (${task.scheduled_date})`);
    }

    logSuccess(`Migrated ${allTasks.length} tasks`);
  }

  // Migrate knowledge articles
  if (!tasksOnly && allArticles.length > 0) {
    log(`\n[3/4] Migrating ${allArticles.length} knowledge articles...`);

    for (let i = 0; i < allArticles.length; i++) {
      const article = allArticles[i];

      if (!isDryRun) {
        const { error } = await supabase
          .from('knowledge_articles')
          .insert({
            user_id: userId,
            title: article.title,
            category: article.category,
            content: article.content,
            is_favorited: article.is_favorited
          });

        if (error) {
          logWarning(`Article "${article.title}": ${error.message}`);
        }
      }

      log(`[${i + 1}/${allArticles.length}] ${article.title}`);
    }

    logSuccess(`Migrated ${allArticles.length} knowledge articles`);
  }

  // Summary
  log('\n[4/4] Migration complete!', 'bright');
  log('='.repeat(50));
  logSuccess(`Tasks: ${allTasks.length}`);
  logSuccess(`Knowledge Articles: ${allArticles.length}`);

  if (isDryRun) {
    logInfo('(DRY RUN - no data was actually saved)');
  }
}

// ============================================================================
// MAIN
// ============================================================================

(async () => {
  try {
    await validateEnvironment();
    await migrateData();
  } catch (error) {
    logError(`Migration failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
})();
