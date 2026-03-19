#!/usr/bin/env node

/**
 * Direct Migration using REST API
 * No complex client libraries - just simple HTTP requests
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0 && !key.startsWith('#')) {
    let value = valueParts.join('=').trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key.trim()] = value;
  }
});

const SUPABASE_URL = env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const GEMINI_1_PATH = path.join(__dirname, '..', '..', 'Gemini chatverlauf 1.md');
const GEMINI_2_PATH = path.join(__dirname, '..', '..', 'Gemini Chatverlauf 2.md');

// Helpers
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

const logSuccess = (msg) => log(`✅ ${msg}`, 'green');
const logError = (msg) => log(`❌ ${msg}`, 'red');
const logInfo = (msg) => log(`ℹ️  ${msg}`, 'blue');

// Make HTTP request
function httpRequest(method, path, headers, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      method,
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Parse tasks
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
      const title = titleIdx >= 0 ? lines[titleIdx].trim() : 'Unknown';

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
        description: description.substring(0, 500).trim(),
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

// Main
async function main() {
  log('\n🌿 Chat Knowledge Migration (Direct API)', 'bright');
  log('='.repeat(50) + '\n');

  // Get user
  logInfo('Getting user information...');
  const { status, data } = await httpRequest('GET', '/auth/v1/admin/users?limit=1');

  if (status !== 200 || !data.users || data.users.length === 0) {
    logError('No users found');
    process.exit(1);
  }

  const user = data.users[0];
  const userId = user.id;
  logSuccess(`Using user: ${user.email}`);

  // Parse tasks
  logInfo('Parsing chat transcripts...');
  let allTasks = [];

  if (fs.existsSync(GEMINI_1_PATH)) {
    const content = fs.readFileSync(GEMINI_1_PATH, 'utf8');
    allTasks = allTasks.concat(parseCalendarEntries(content));
  }

  if (fs.existsSync(GEMINI_2_PATH)) {
    const content = fs.readFileSync(GEMINI_2_PATH, 'utf8');
    allTasks = allTasks.concat(parseCalendarEntries(content));
  }

  // Remove duplicates
  const seen = new Set();
  const uniqueTasks = [];
  allTasks.forEach(task => {
    const key = `${task.title}|${task.scheduled_date}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTasks.push(task);
    }
  });

  logSuccess(`Found ${uniqueTasks.length} unique tasks\n`);

  // Insert tasks
  logInfo(`Inserting ${uniqueTasks.length} tasks...\n`);

  const taskRecords = uniqueTasks.map(task => ({
    user_id: userId,
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    scheduled_date: task.scheduled_date,
    auto_generated: true
  }));

  // Insert in batches of 10
  for (let i = 0; i < taskRecords.length; i += 10) {
    const batch = taskRecords.slice(i, i + 10);

    const { status: insertStatus } = await httpRequest(
      'POST',
      '/rest/v1/tasks',
      { 'Prefer': 'return=minimal' },
      batch
    );

    if (insertStatus !== 201) {
      logError(`Batch ${Math.floor(i / 10) + 1} failed`);
    }

    process.stdout.write(`   [${Math.min(i + 10, taskRecords.length)}/${taskRecords.length}] ✓\n`);
  }

  log('\n' + '='.repeat(50), 'bright');
  logSuccess('Migration complete!');
  log('\n📊 Summary:');
  log(`   • Tasks inserted: ${uniqueTasks.length}`);

  const sorted = uniqueTasks.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
  log(`   • Date range: ${sorted[0].scheduled_date} → ${sorted[sorted.length - 1].scheduled_date}`);

  const categories = [...new Set(uniqueTasks.map(t => t.category))].sort();
  log(`   • Categories: ${categories.join(', ')}`);

  log(`\n✨ Ready to use in app!\n`);
}

main().catch(err => {
  logError(`Error: ${err.message}`);
  process.exit(1);
});
