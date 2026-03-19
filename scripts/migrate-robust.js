#!/usr/bin/env node

/**
 * Robust Chat Migration with Supabase Client
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

function parseCalendarEntries(content) {
  const tasks = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const dateMatch = line.match(/(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag),?\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/);

    if (dateMatch) {
      let titleIdx = i - 1;
      while (titleIdx >= 0 && !lines[titleIdx].trim()) titleIdx--;
      const title = titleIdx >= 0 ? lines[titleIdx].trim().substring(0, 200) : 'Unknown';

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

      tasks.push({
        title: title.replace(/\n/g, ' ').trim(),
        description: description.substring(0, 1000).trim(),
        scheduled_date: scheduledDate,
        category: categorizeTask(title),
        priority: prioritizeTask(title)
      });
    }
    i++;
  }

  return tasks;
}

function categorizeTask(title) {
  const lower = title.toLowerCase();
  if (lower.includes('aussaat') || lower.includes('säen')) return 'planting';
  if (lower.includes('schnitt') || lower.includes('rückschnitt')) return 'pruning';
  if (lower.includes('ernte')) return 'harvesting';
  if (lower.includes('mulch')) return 'mulching';
  if (lower.includes('gießen') || lower.includes('wasser')) return 'watering';
  if (lower.includes('jauche') || lower.includes('dünger')) return 'fertilizing';
  return 'maintenance';
}

function prioritizeTask(title) {
  const lower = title.toLowerCase();
  if (lower.includes('kritisch') || lower.includes('wache') || lower.includes('schneckenschutz') || lower.includes('vorzucht')) {
    return 'hoch';
  }
  return 'mittel';
}

async function main() {
  log('\n🌿 Chat Knowledge Migration (Robust)', 'bright');
  log('='.repeat(50) + '\n');

  // Init Supabase
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Get current user or first user
  log('Getting user...', 'blue');
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError || !users || users.length === 0) {
    log('❌ No users found', 'red');
    process.exit(1);
  }

  const user = users[0];
  const userId = user.id;
  log(`✅ Using user: ${user.email}`, 'green');

  // Parse tasks
  log('\nParsing chat transcripts...', 'blue');
  let allTasks = [];

  if (fs.existsSync(GEMINI_1_PATH)) {
    const content = fs.readFileSync(GEMINI_1_PATH, 'utf8');
    const parsed = parseCalendarEntries(content);
    allTasks = allTasks.concat(parsed);
    log(`   ✅ Gemini 1: ${parsed.length} tasks`, 'green');
  }

  if (fs.existsSync(GEMINI_2_PATH)) {
    const content = fs.readFileSync(GEMINI_2_PATH, 'utf8');
    const parsed = parseCalendarEntries(content);
    allTasks = allTasks.concat(parsed);
    log(`   ✅ Gemini 2: ${parsed.length} additional tasks`, 'green');
  }

  // Deduplicate
  const seen = new Set();
  const uniqueTasks = [];
  allTasks.forEach(task => {
    const key = `${task.title}|${task.scheduled_date}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTasks.push(task);
    }
  });

  log(`\n✅ Total unique tasks: ${uniqueTasks.length}`, 'green');

  // Check existing tasks
  log('\nChecking existing tasks...', 'blue');
  const { data: existingTasks, error: fetchError } = await supabase
    .from('tasks')
    .select('id,title,scheduled_date')
    .eq('user_id', userId)
    .eq('auto_generated', true);

  if (fetchError) {
    log(`   ⚠️  Could not fetch existing: ${fetchError.message}`, 'yellow');
  } else {
    log(`   ✅ Found ${existingTasks?.length || 0} existing auto-generated tasks`, 'green');
  }

  // Filter out duplicates
  const existingKeys = new Set((existingTasks || []).map(t => `${t.title}|${t.scheduled_date}`));
  const newTasks = uniqueTasks.filter(t => !existingKeys.has(`${t.title}|${t.scheduled_date}`));

  log(`\n📝 Will insert ${newTasks.length} new tasks\n`, 'blue');

  if (newTasks.length === 0) {
    log('✅ All tasks already in database!', 'green');
    return;
  }

  // Prepare records
  const taskRecords = newTasks.map(task => ({
    user_id: userId,
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    scheduled_date: task.scheduled_date,
    auto_generated: true
  }));

  // Insert one by one for better error reporting
  let inserted = 0;
  for (let i = 0; i < taskRecords.length; i++) {
    const record = taskRecords[i];

    const { data, error } = await supabase
      .from('tasks')
      .insert([record])
      .select();

    if (error) {
      log(`   ❌ [${i + 1}/${taskRecords.length}] ${record.title}: ${error.message}`, 'red');
    } else {
      inserted++;
      if ((i + 1) % 10 === 0 || i === taskRecords.length - 1) {
        process.stdout.write(`\r   [${i + 1}/${taskRecords.length}] Tasks inserted...`);
      }
    }
  }

  log('\n\n' + '='.repeat(50), 'bright');
  log(`✅ Migration complete!`, 'green');
  log(`\n📊 Summary:`, 'reset');
  log(`   • Tasks inserted: ${inserted}/${newTasks.length}`, 'reset');
  log(`   • Already existed: ${existingTasks?.length || 0}`, 'reset');

  const sorted = newTasks.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
  if (sorted.length > 0) {
    log(`   • Date range: ${sorted[0].scheduled_date} → ${sorted[sorted.length - 1].scheduled_date}`, 'reset');
  }

  const categories = [...new Set(newTasks.map(t => t.category))].sort();
  log(`   • Categories: ${categories.join(', ')}`, 'reset');

  log(`\n✨ Ready to use in app!\n`, 'green');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}\n`, 'red');
  console.error(err);
  process.exit(1);
});
