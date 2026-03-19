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

// Task-to-Plant mappings based on plant names
const taskPlantMappings = [
  { plantName: 'Kartoffel', keywords: ['Kartoffel', 'kartoffeln'] },
  { plantName: 'Tomate', keywords: ['Tomate', 'tomaten'] },
  { plantName: 'Mais', keywords: ['Mais', 'mais'] },
  { plantName: 'Basilikum', keywords: ['Basilikum', 'basilikum'] },
  { plantName: 'Neuseeländer Spinat', keywords: ['Neuseeländer', 'Spinat'] },
  { plantName: 'Kohlrabi', keywords: ['Kohlrabi', 'kohlrabi'] },
  { plantName: 'Lauchzwiebel', keywords: ['Lauchzwiebel', 'lauchzwiebel'] },
  { plantName: 'Erdbeeren', keywords: ['Erdbeeren', 'erdbeeren', 'erdbeer'] },
  { plantName: 'Riesenzwiebel', keywords: ['Riesenzwiebel', 'The Kelsae'] },
  { plantName: 'Bohne', keywords: ['Bohnen', 'bohnen', 'Stangenbohne'] },
  { plantName: 'Gurke', keywords: ['Gurke', 'gurken'] },
  { plantName: 'Kürbis', keywords: ['Kürbis', 'kürbis'] },
  { plantName: 'Thymian', keywords: ['Thymian', 'thymian'] },
  { plantName: 'Lavendel', keywords: ['Lavendel', 'lavendel'] },
  { plantName: 'Blaukissen', keywords: ['Blaukissen', 'blaukissen'] },
  { plantName: 'Blütenblume', keywords: ['Wildblumenmischung', 'Wildblume'] },
  { plantName: 'Weinreben', keywords: ['Weinreben', 'weinreben'] },
  { plantName: 'Schnittlauch', keywords: ['Schnittlauch', 'schnittlauch'] },
];

async function linkTasksToPlants() {
  try {
    console.log('🔗 Linking tasks to plants...\n');

    // Get all tasks
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, user_id');

    if (taskError) throw taskError;

    // Get all plants
    const { data: plants, error: plantError } = await supabase
      .from('plants')
      .select('id, name, user_id');

    if (plantError) throw plantError;

    if (!tasks || !plants) {
      console.log('No tasks or plants found');
      return;
    }

    console.log(`Found ${tasks.length} tasks and ${plants.length} plants\n`);

    let linked = 0;

    for (const task of tasks) {
      // Find matching plants for this task
      const matchingPlants = [];

      for (const mapping of taskPlantMappings) {
        for (const keyword of mapping.keywords) {
          if (task.title.toLowerCase().includes(keyword.toLowerCase())) {
            // Find all plants with this name for this user
            const matches = plants.filter(
              p => p.name.toLowerCase().includes(mapping.plantName.toLowerCase()) &&
                    p.user_id === task.user_id
            );
            matchingPlants.push(...matches);
          }
        }
      }

      // Remove duplicates
      const uniquePlants = [...new Set(matchingPlants.map(p => p.id))];

      // Update task with plant associations (store as JSON)
      if (uniquePlants.length > 0) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ 
            description: `${task.title} - Bezug: ${uniquePlants.length} Pflanze(n)`
          })
          .eq('id', task.id);

        if (!updateError) {
          console.log(`✅ "${task.title}"`);
          console.log(`   → Verlinkt mit: ${uniquePlants.map(id => plants.find(p => p.id === id)?.name).join(', ')}`);
          linked += uniquePlants.length;
        }
      }
    }

    console.log(`\n📊 Linking Summary:`);
    console.log(`   ✅ Tasks linked: ${tasks.filter(t => {
      const matchingPlants = [];
      for (const mapping of taskPlantMappings) {
        for (const keyword of mapping.keywords) {
          if (t.title.toLowerCase().includes(keyword.toLowerCase())) {
            const matches = plants.filter(
              p => p.name.toLowerCase().includes(mapping.plantName.toLowerCase()) &&
                    p.user_id === t.user_id
            );
            matchingPlants.push(...matches);
          }
        }
      }
      return [...new Set(matchingPlants.map(p => p.id))].length > 0;
    }).length}`);
    console.log(`   📌 Total links created: ${linked}`);

    console.log(`\n✨ Task-to-Plant linking complete!`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

linkTasksToPlants();
