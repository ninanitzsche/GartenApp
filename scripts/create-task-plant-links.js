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

// Task-to-Plant mappings
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
  { plantName: 'Weinreben', keywords: ['Weinreben', 'weinreben'] },
  { plantName: 'Schnittlauch', keywords: ['Schnittlauch', 'schnittlauch'] },
];

async function createTaskPlantLinks() {
  try {
    console.log('🔗 Creating task-plant links in junction table...\n');

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
      console.log('❌ No tasks or plants found');
      return;
    }

    console.log(`📊 Found ${tasks.length} tasks and ${plants.length} plants\n`);

    let linked = 0;
    let errors = 0;

    for (const task of tasks) {
      // Find matching plants for this task
      const matchingPlants = [];

      for (const mapping of taskPlantMappings) {
        for (const keyword of mapping.keywords) {
          if (task.title.toLowerCase().includes(keyword.toLowerCase())) {
            const matches = plants.filter(
              p => p.name.toLowerCase().includes(mapping.plantName.toLowerCase()) &&
                    p.user_id === task.user_id
            );
            matchingPlants.push(...matches);
          }
        }
      }

      // Remove duplicates by plant ID
      const uniquePlants = [...new Map(matchingPlants.map(p => [p.id, p])).values()];

      // Create links in task_plants table
      for (const plant of uniquePlants) {
        // Check if link already exists
        const { data: existing } = await supabase
          .from('task_plants')
          .select('id')
          .eq('task_id', task.id)
          .eq('plant_id', plant.id);

        if (!existing || existing.length === 0) {
          const { error: insertError } = await supabase
            .from('task_plants')
            .insert({
              task_id: task.id,
              plant_id: plant.id,
            });

          if (!insertError) {
            linked++;
          } else {
            errors++;
            console.error(`   ❌ Failed to link "${task.title}" to "${plant.name}"`);
          }
        }
      }

      if (uniquePlants.length > 0) {
        const plantNames = uniquePlants.map(p => p.name).join(', ');
        console.log(`✅ "${task.title.substring(0, 40)}..."`);
        console.log(`   → ${uniquePlants.length} plant(s): ${plantNames}`);
      }
    }

    console.log(`\n📊 Linking Summary:`);
    console.log(`   ✅ Links created: ${linked}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📌 Tasks with plants: ${tasks.filter(t => {
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
      return [...new Map(matchingPlants.map(p => [p.id, p])).values()].length > 0;
    }).length}`);

    console.log(`\n✨ Task-plant linking complete!`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTaskPlantLinks();
