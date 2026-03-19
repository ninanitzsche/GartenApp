#!/usr/bin/env ts-node

/**
 * Chat Knowledge Migration - CLI Tool
 * Standalone migration that uses the app's existing session
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env
dotenv.config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_1_PATH = path.join(__dirname, '..', '..', 'Gemini chatverlauf 1.md');
const GEMINI_2_PATH = path.join(__dirname, '..', '..', 'Gemini Chatverlauf 2.md');

interface Task {
  title: string;
  description: string;
  scheduled_date: string;
  category: string;
  priority: string;
}

function parseCalendarEntries(content: string): Task[] {
  const tasks: Task[] = [];
  const lines = content.split('\n');

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

function categorizeTask(title: string): string {
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

function prioritizeTask(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('kritisch') || lower.includes('wache')) return 'hoch';
  if (lower.includes('schneckenschutz')) return 'hoch';
  if (lower.includes('vorzucht')) return 'hoch';
  return 'mittel';
}

async function main() {
  console.log('\n🌿 Chat Knowledge Migration CLI\n');

  // Validate config
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase configuration');
    process.exit(1);
  }

  // Load tasks
  console.log('📖 Parsing chat transcripts...');
  let allTasks: Task[] = [];

  if (fs.existsSync(GEMINI_1_PATH)) {
    const content = fs.readFileSync(GEMINI_1_PATH, 'utf8');
    allTasks = allTasks.concat(parseCalendarEntries(content));
  }

  if (fs.existsSync(GEMINI_2_PATH)) {
    const content = fs.readFileSync(GEMINI_2_PATH, 'utf8');
    allTasks = allTasks.concat(parseCalendarEntries(content));
  }

  // Remove duplicates
  const uniqueTasks = Array.from(
    new Map(allTasks.map(t => [`${t.title}|${t.scheduled_date}`, t])).values()
  );

  console.log(`✅ Found ${uniqueTasks.length} unique tasks\n`);

  // Authenticate with service role
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get first user
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError || !users || users.length === 0) {
    console.error('❌ No users found in database');
    console.error('   Please login to the app first using email: ninamarienitzsche@gmail.com');
    process.exit(1);
  }

  const user = users[0];
  console.log(`👤 Using user: ${user.email}\n`);

  // Migrate tasks
  console.log('📝 Inserting tasks...');
  const taskRecords = uniqueTasks.map(task => ({
    user_id: user.id,
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    scheduled_date: task.scheduled_date,
    auto_generated: true
  }));

  // Insert in batches
  for (let i = 0; i < taskRecords.length; i += 10) {
    const batch = taskRecords.slice(i, i + 10);
    const { error } = await supabase.from('tasks').insert(batch);

    if (error) {
      console.warn(`⚠️  Batch error: ${error.message}`);
    }

    process.stdout.write(`\r   [${Math.min(i + 10, taskRecords.length)}/${taskRecords.length}]`);
  }

  console.log(`\n✅ Migration complete!\n`);
  console.log(`📊 Summary:`);
  console.log(`   • Tasks inserted: ${uniqueTasks.length}`);
  console.log(`   • Date range: ${uniqueTasks.sort((a,b) => a.scheduled_date.localeCompare(b.scheduled_date))[0].scheduled_date} - ${uniqueTasks.sort((a,b) => b.scheduled_date.localeCompare(a.scheduled_date))[0].scheduled_date}`);
  console.log(`   • Categories: ${[...new Set(uniqueTasks.map(t => t.category))].join(', ')}\n`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
