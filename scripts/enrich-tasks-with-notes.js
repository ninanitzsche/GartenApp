const fs = require('fs');
const path = require('path');

// Load environment variables
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

const supabase = createClient(supabaseUrl, supabaseKey);

// Read all markdown files and extract notes
const gartenDir = '/Users/ninanitzsche/aipm/Garten2026';

function extractNotesForTask(taskTitle) {
  const notes = [];

  // Read all markdown files
  const files = fs.readdirSync(gartenDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(gartenDir, file), 'utf8');
    const lines = content.split('\n');

    // Look for the task and extract surrounding context
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(taskTitle) || lines[i].includes(taskTitle.split('(')[0].trim())) {
        // Extract context: current line + next few lines with indentation
        for (let j = Math.max(0, i - 1); j < Math.min(lines.length, i + 3); j++) {
          const line = lines[j].trim();
          if (line && !line.startsWith('-') && !line.startsWith('#') && line.length > 0) {
            notes.push(line);
          }
        }
      }
    }
  }

  // Deduplicate and clean notes
  return [...new Set(notes)].filter(n => n.length > 0 && n.length < 200).slice(0, 2).join('\n');
}

async function enrichTasks() {
  try {
    console.log('📝 Enriching tasks with notes from Garten2026...\n');

    // Get all tasks without description
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title')
      .is('description', null)
      .limit(100);

    if (error) throw error;

    if (!tasks || tasks.length === 0) {
      console.log('No tasks to enrich');
      return;
    }

    console.log(`Found ${tasks.length} tasks without descriptions\n`);

    let updated = 0;

    for (const task of tasks) {
      const notes = extractNotesForTask(task.title);

      if (notes) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ description: notes })
          .eq('id', task.id);

        if (!updateError) {
          console.log(`✅ ${task.title}`);
          console.log(`   📌 ${notes.substring(0, 60)}...`);
          updated++;
        }
      }
    }

    console.log(`\n✨ Updated ${updated} tasks with notes`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

enrichTasks();
