#!/usr/bin/env node

/**
 * Chat Knowledge → Gartenplaner Migration Script (Admin Version)
 *
 * Uses Supabase Service Role key for direct database access
 * No user authentication required - runs with full admin privileges
 *
 * Usage:
 *   npm run migrate:chat-knowledge:admin                    # Full migration
 *   npm run migrate:chat-knowledge:admin -- --dry-run       # Test without changes
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
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

function parseCalendarEntries(markdownContent) {
  const entries = [];
  const lines = markdownContent.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const dateMatch = line.match(/(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag),?\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/);

    if (dateMatch) {
      let titleIdx = i - 1;
      while (titleIdx >= 0 && !lines[titleIdx].trim()) {
        titleIdx--;
      }

      const title = titleIdx >= 0 ? lines[titleIdx].trim() : 'Unknown Task';
      const day = parseInt(dateMatch[2]);
      const month = parseInt(dateMatch[3]);
      const year = parseInt(dateMatch[4]);

      let description = '';
      let descIdx = i + 1;
      let lineCount = 0;
      while (descIdx < lines.length && lineCount < 5) {
        const descLine = lines[descIdx].trim();
        if (descLine && !descLine.startsWith('##') && !descLine.includes('Du hast gesagt')) {
          description += descLine + ' ';
          lineCount++;
        }
        if (descLine === '' && description) break;
        descIdx++;
      }

      const scheduledDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      entries.push({
        title: title.replace(/\n/g, ' ').trim(),
        description: description.substring(0, 500).trim(),
        scheduled_date: scheduledDate,
        category: categorizeTask(title),
        priority: prioritizeTask(title)
      });
    }

    i++;
  }

  return entries;
}

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

function prioritizeTask(title) {
  const lower = title.toLowerCase();
  if (lower.includes('kritisch') || lower.includes('wache')) return 'hoch';
  if (lower.includes('schneckenschutz')) return 'hoch';
  if (lower.includes('vorzucht')) return 'hoch';
  return 'mittel';
}

// ============================================================================
// VALIDATION
// ============================================================================

async function validateEnvironment() {
  log('\n🌿 Chat Knowledge Migration (Admin Mode)', 'bright');
  log('='.repeat(50));

  if (isDryRun) {
    logInfo('DRY RUN MODE - No changes will be made');
  }

  if (!SUPABASE_URL) {
    logError('EXPO_PUBLIC_SUPABASE_URL not configured');
    process.exit(1);
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    logError('SUPABASE_SERVICE_ROLE_KEY not configured');
    logInfo('Add to .env file to enable admin migrations');
    process.exit(1);
  }

  logSuccess('Service role credentials configured');

  if (!fs.existsSync(GEMINI_1_PATH)) {
    logWarning(`Gemini Chatverlauf 1 not found`);
  } else {
    logSuccess('Gemini Chatverlauf 1 found');
  }

  if (!fs.existsSync(GEMINI_2_PATH)) {
    logWarning(`Gemini Chatverlauf 2 not found`);
  } else {
    logSuccess('Gemini Chatverlauf 2 found');
  }
}

// ============================================================================
// MIGRATION
// ============================================================================

async function migrateData() {
  // Use service role key for admin access
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get user info from auth
  log('\n[1/4] Getting user information...');

  const { data: { user }, error: userError } = await supabase.auth.admin.listUsers();

  let userId;

  if (userError) {
    logWarning('Could not list users, trying current user...');
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      userId = currentUser.id;
      logSuccess(`Using current user: ${currentUser.email}`);
    } else {
      logError('Could not determine user ID');
      process.exit(1);
    }
  } else if (user && user.length > 0) {
    // Get the first user (or the one with email ninamarienitzsche@gmail.com)
    const targetUser = user.find(u => u.email === 'ninamarienitzsche@gmail.com') || user[0];
    userId = targetUser.id;
    logSuccess(`Using user: ${targetUser.email}`);
  } else {
    logError('No users found in database');
    process.exit(1);
  }

  // Load and parse markdown files
  log('\n[2/4] Loading and parsing chat transcripts...');

  let allTasks = [];
  let allArticles = [];

  if (fs.existsSync(GEMINI_1_PATH)) {
    const content1 = fs.readFileSync(GEMINI_1_PATH, 'utf8');
    const tasks1 = parseCalendarEntries(content1);
    allTasks = allTasks.concat(tasks1);
    logSuccess(`Parsed Gemini Chatverlauf 1: ${tasks1.length} tasks`);
  }

  if (fs.existsSync(GEMINI_2_PATH)) {
    const content2 = fs.readFileSync(GEMINI_2_PATH, 'utf8');
    const tasks2 = parseCalendarEntries(content2);
    allTasks = allTasks.concat(tasks2);
    logSuccess(`Parsed Gemini Chatverlauf 2: ${tasks2.length} additional tasks`);
  }

  // Remove duplicates by title + date
  const uniqueTasks = [];
  const seen = new Set();
  allTasks.forEach(task => {
    const key = `${task.title}|${task.scheduled_date}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTasks.push(task);
    }
  });

  logSuccess(`Total unique tasks: ${uniqueTasks.length}`);

  // Migrate tasks
  if (!knowledgeOnly && uniqueTasks.length > 0) {
    log(`\n[3/4] Migrating ${uniqueTasks.length} tasks...`);

    const taskRecords = uniqueTasks.map(task => ({
      user_id: userId,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      scheduled_date: task.scheduled_date,
      auto_generated: true
    }));

    if (!isDryRun) {
      // Insert in batches of 10
      for (let i = 0; i < taskRecords.length; i += 10) {
        const batch = taskRecords.slice(i, i + 10);
        const { error } = await supabase
          .from('tasks')
          .insert(batch);

        if (error) {
          logWarning(`Batch ${Math.floor(i / 10) + 1}: ${error.message}`);
        }

        log(`[${Math.min(i + 10, taskRecords.length)}/${taskRecords.length}] Tasks migrated...`);
      }
    } else {
      log(`[DRY RUN] Would insert ${taskRecords.length} tasks`);
      uniqueTasks.slice(0, 5).forEach((task, idx) => {
        log(`  ${idx + 1}. ${task.title} (${task.scheduled_date})`, 'blue');
      });
    }

    logSuccess(`Tasks: ${uniqueTasks.length}`);
  }

  // Summary
  log('\n[4/4] Migration complete!', 'bright');
  log('='.repeat(50));
  logSuccess(`Processed ${uniqueTasks.length} tasks`);

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
