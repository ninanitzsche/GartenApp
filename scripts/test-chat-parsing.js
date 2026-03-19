#!/usr/bin/env node

/**
 * Test Script: Verify chat knowledge parsing without authentication
 * Tests if the migration script correctly extracts tasks and knowledge articles
 */

const fs = require('fs');
const path = require('path');

const GEMINI_1_PATH = path.join(__dirname, '..', '..', 'Gemini chatverlauf 1.md');
const GEMINI_2_PATH = path.join(__dirname, '..', '..', 'Gemini Chatverlauf 2.md');

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
function logInfo(msg) { log(`ℹ️  ${msg}`, 'blue'); }

// ============================================================================
// PARSING FUNCTIONS (copy from migrate-chat-knowledge.js)
// ============================================================================

function parseCalendarEntries(markdownContent, fileName) {
  const entries = [];

  // More flexible pattern to catch calendar entries
  // Pattern: Title, then date in German format on next line(s)
  const lines = markdownContent.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Look for German date pattern (e.g., "Montag, 10.05.2026")
    const dateMatch = line.match(/(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag),?\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/);

    if (dateMatch) {
      // Go back to find the title (usually previous non-empty line)
      let titleIdx = i - 1;
      while (titleIdx >= 0 && !lines[titleIdx].trim()) {
        titleIdx--;
      }

      const title = titleIdx >= 0 ? lines[titleIdx].trim() : 'Unknown Task';
      const day = parseInt(dateMatch[2]);
      const month = parseInt(dateMatch[3]);
      const year = parseInt(dateMatch[4]);

      // Collect description (next few non-empty lines)
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
// TEST EXECUTION
// ============================================================================

console.log('\n');
log('🌿 Chat Knowledge Parsing Test', 'bright');
log('='.repeat(60));

// Check files exist
logInfo('Checking source files...');
if (!fs.existsSync(GEMINI_1_PATH)) {
  logWarning(`Gemini Chatverlauf 1 not found`);
} else {
  logSuccess(`Gemini Chatverlauf 1 found (${fs.statSync(GEMINI_1_PATH).size} bytes)`);
}

if (!fs.existsSync(GEMINI_2_PATH)) {
  logWarning(`Gemini Chatverlauf 2 not found`);
} else {
  logSuccess(`Gemini Chatverlauf 2 found (${fs.statSync(GEMINI_2_PATH).size} bytes)`);
}

// Parse files
console.log('\n' + '='.repeat(60));
log('Parsing Results', 'bright');
log('='.repeat(60) + '\n');

let totalTasks = 0;
let tasks = [];

if (fs.existsSync(GEMINI_1_PATH)) {
  const content1 = fs.readFileSync(GEMINI_1_PATH, 'utf8');
  const parsed1 = parseCalendarEntries(content1, 'Gemini Chatverlauf 1');
  tasks = tasks.concat(parsed1);
  console.log(`\n📄 Gemini Chatverlauf 1 (${content1.split('\n').length} lines)`);
  logSuccess(`Found ${parsed1.length} tasks`);

  if (parsed1.length > 0) {
    console.log('\n   Sample tasks:');
    parsed1.slice(0, 5).forEach((task, idx) => {
      log(`   [${idx + 1}] ${task.title}`, 'yellow');
      log(`       📅 ${task.scheduled_date} | 📌 ${task.category} | ⭐ ${task.priority}`, 'blue');
      log(`       ${task.description.substring(0, 60)}...`, 'reset');
    });
    if (parsed1.length > 5) {
      log(`   ... and ${parsed1.length - 5} more tasks`, 'yellow');
    }
  }
}

if (fs.existsSync(GEMINI_2_PATH)) {
  const content2 = fs.readFileSync(GEMINI_2_PATH, 'utf8');
  const parsed2 = parseCalendarEntries(content2, 'Gemini Chatverlauf 2');
  tasks = tasks.concat(parsed2);
  console.log(`\n📄 Gemini Chatverlauf 2 (${content2.split('\n').length} lines)`);
  logSuccess(`Found ${parsed2.length} tasks`);

  if (parsed2.length > 0) {
    console.log('\n   Sample tasks:');
    parsed2.slice(0, 5).forEach((task, idx) => {
      log(`   [${idx + 1}] ${task.title}`, 'yellow');
      log(`       📅 ${task.scheduled_date} | 📌 ${task.category} | ⭐ ${task.priority}`, 'blue');
      log(`       ${task.description.substring(0, 60)}...`, 'reset');
    });
    if (parsed2.length > 5) {
      log(`   ... and ${parsed2.length - 5} more tasks`, 'yellow');
    }
  }
}

// Summary
console.log('\n' + '='.repeat(60));
log('Summary', 'bright');
log('='.repeat(60));

logSuccess(`Total tasks found: ${tasks.length}`);

// Group by category
const byCategory = {};
tasks.forEach(task => {
  byCategory[task.category] = (byCategory[task.category] || 0) + 1;
});

console.log('\nBy Category:');
Object.entries(byCategory).forEach(([cat, count]) => {
  log(`  • ${cat}: ${count}`, 'blue');
});

// Group by priority
const byPriority = {};
tasks.forEach(task => {
  byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
});

console.log('\nBy Priority:');
Object.entries(byPriority).forEach(([pri, count]) => {
  log(`  • ${pri}: ${count}`, 'blue');
});

// Sort by date
const sorted = [...tasks].sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
console.log('\nChronological Order (first 10):');
sorted.slice(0, 10).forEach((task, idx) => {
  log(`  ${idx + 1}. [${task.scheduled_date}] ${task.title}`, 'yellow');
});

if (sorted.length > 10) {
  log(`  ... and ${sorted.length - 10} more`, 'yellow');
}

console.log('\n' + '='.repeat(60));
logSuccess('✨ Parsing test complete!');
logInfo(`Ready to migrate ${tasks.length} tasks to database\n`);
