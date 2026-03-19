const fs = require('fs');
const path = require('path');

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

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
];

async function createLinksWithIds() {
  try {
    console.log('🔗 Creating plant links with IDs...\n');

    const { data: tasks } = await supabase.from('tasks').select('id, title, user_id');
    const { data: plants } = await supabase.from('plants').select('id, name, user_id');

    if (!tasks || !plants) return;

    let updated = 0;

    for (const task of tasks) {
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

      const uniquePlants = [...new Map(matchingPlants.map(p => [p.id, p])).values()];

      if (uniquePlants.length > 0) {
        const plantLinks = uniquePlants
          .map(p => `[🌱 ${p.name}](plant:${p.id})`)
          .join('\n');
        
        const description = `📌 Bezug zu Pflanzen:\n${plantLinks}`;

        const { error } = await supabase
          .from('tasks')
          .update({ description })
          .eq('id', task.id);

        if (!error) {
          console.log(`✅ "${task.title.substring(0, 50)}..."`);
          updated++;
        }
      }
    }

    console.log(`\n✨ ${updated} tasks updated with clickable plant links!`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createLinksWithIds();
