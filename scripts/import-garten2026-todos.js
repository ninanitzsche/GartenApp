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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// All TODOs from Garten2026
const todos = [
  // Fehlende_Artikel.md
  { title: 'Knoblauch-Zehen bestellen (für Frühjahrspflanzung)', category: 'einkaufen', priority: 'hoch', location: 'Baumschule' },
  { title: 'Stangenbohnen-Samen bestellen (für Mai)', category: 'einkaufen', priority: 'hoch', location: 'Online' },
  { title: 'Ranktürme/Bambusstäbe für Gurken bestellen', category: 'einkaufen', priority: 'mittel', location: 'Gartencenter' },
  { title: 'Beschriftungs-Schilder bestellen', category: 'einkaufen', priority: 'mittel', location: 'Online' },
  { title: 'Pflanzstäbe für Tomaten bestellen', category: 'einkaufen', priority: 'hoch', location: 'Gartencenter' },
  { title: 'Zusätzlicher Neuseeländer Spinat kaufen', category: 'einkaufen', priority: 'niedrig', location: 'Online' },
  { title: 'Kapuzinerkresse Samen bestellen', category: 'einkaufen', priority: 'niedrig', location: 'Online' },
  { title: 'Kriechender Thymian bestellen', category: 'einkaufen', priority: 'niedrig', location: 'Baumschule' },
  { title: 'Kompost/Dünger kaufen', category: 'einkaufen', priority: 'hoch', location: 'Gartencenter' },
  { title: 'Gießkanne kaufen', category: 'einkaufen', priority: 'mittel', location: 'Baumarkt' },
  { title: 'Handschuhe kaufen', category: 'einkaufen', priority: 'niedrig', location: 'Baumarkt' },

  // Gewächshaus & Hochbeet
  { title: 'Tomaten (4 Sorten) in Quick Pots aussäen', category: 'Aussaat', priority: 'hoch', location: 'Lichtregal Küche' },
  { title: 'Bärlauch aus Kühlschrank holen und vorkeimen', category: 'Aussaat', priority: 'mittel', location: 'Kühlschrank' },
  { title: 'Basilikum in Quick Pots aussäen', category: 'Aussaat', priority: 'mittel', location: 'Lichtregal Küche' },
  { title: 'Tomaten pikieren (wenn 2. Blattpaar da ist)', category: 'Jungpflanzen', priority: 'mittel', location: 'Lichtregal' },
  { title: 'Thymian in Balkonkästen aussäen/pflanzen', category: 'Aussaat', priority: 'niedrig', location: 'Balkon' },
  { title: 'Gewächshaus-Boden vorbereiten', category: 'Vorbereitung', priority: 'hoch', location: 'Gewächshaus' },
  { title: 'Tomaten auspflanzen (4 Pflanzen, Abstand 60 cm)', category: 'Pflanzung', priority: 'hoch', location: 'Gewächshaus' },
  { title: 'Basilikum auspflanzen (6-8 Pflanzen)', category: 'Pflanzung', priority: 'mittel', location: 'Gewächshaus' },
  { title: 'Stäbe/Schnüre für Tomaten anbringen', category: 'Stützen', priority: 'hoch', location: 'Gewächshaus' },
  { title: 'Tomaten regelmäßig ausgeizen', category: 'Pflege', priority: 'hoch', location: 'Gewächshaus', is_recurring: true },
  { title: 'Tomaten anbinden (alle 2 Wochen)', category: 'Pflege', priority: 'hoch', location: 'Gewächshaus', is_recurring: true },
  { title: 'Basilikum-Spitzen ernten (fördert Buschwuchs)', category: 'Ernte', priority: 'mittel', location: 'Gewächshaus' },
  { title: 'Alte Erdbeer-Blätter entfernen', category: 'Pflege', priority: 'mittel', location: 'Hochbeet' },
  { title: 'Hochbeet düngen', category: 'Vorbereitung', priority: 'hoch', location: 'Hochbeet' },
  { title: 'Knoblauch-Zehen stecken (für Ernte August)', category: 'Pflanzung', priority: 'hoch', location: 'Hochbeet' },
  { title: 'Erdbeeren-Ableger nehmen', category: 'Vermehrung', priority: 'mittel', location: 'Hochbeet' },
  { title: 'Erdbeeren zurückschneiden', category: 'Pflege', priority: 'mittel', location: 'Hochbeet' },
  { title: 'Neue Erdbeerpflanzen ins Hochbeet setzen', category: 'Pflanzung', priority: 'mittel', location: 'Hochbeet' },

  // Hauptbeet
  { title: 'Neuseeländer Spinat aussäen', category: 'Aussaat', priority: 'hoch', location: 'Hauptbeet' },
  { title: 'Riesenzwiebel The Kelsae in Quick Pots vorziehen', category: 'Aussaat', priority: 'mittel', location: 'Lichtregal' },
  { title: 'Kartoffeln legen (Mitte April)', category: 'Pflanzung', priority: 'hoch', location: 'Hauptbeet' },
  { title: 'Mais in Quick Pots vorziehen', category: 'Aussaat', priority: 'mittel', location: 'Lichtregal' },
  { title: 'Rotklee + Phacelia zwischen Kartoffelreihen säen', category: 'Aussaat', priority: 'niedrig', location: 'Hauptbeet' },
  { title: 'Mais auspflanzen (Quadrat-Formation)', category: 'Pflanzung', priority: 'hoch', location: 'Hauptbeet' },
  { title: 'Bohnen + Sojabohnen aussäen', category: 'Aussaat', priority: 'mittel', location: 'Hauptbeet' },
  { title: 'Kohlrabi, Zwiebeln, Lauchzwiebel aussäen', category: 'Aussaat', priority: 'mittel', location: 'Hauptbeet' },
  { title: 'Riesenzwiebel The Kelsae auspflanzen', category: 'Pflanzung', priority: 'mittel', location: 'Hauptbeet' },
  { title: 'Kartoffeln 1. Mal anhäufeln', category: 'Pflege', priority: 'hoch', location: 'Hauptbeet' },
  { title: 'Kartoffeln 2. Mal anhäufeln', category: 'Pflege', priority: 'hoch', location: 'Hauptbeet' },
  { title: 'Neuseeländer Spinat: Lücken nachsäen', category: 'Aussaat', priority: 'mittel', location: 'Hauptbeet' },

  // Ernte
  { title: 'Kohlrabi, Lauchzwiebel, Bohnen ernten', category: 'Ernte', priority: 'hoch', location: 'Hauptbeet' },
  { title: 'Kartoffeln Laura + Agria ernten', category: 'Ernte', priority: 'hoch', location: 'Hauptbeet' },
  { title: 'Kartoffeln Innovator + Cara ernten', category: 'Ernte', priority: 'hoch', location: 'Hauptbeet' },
  { title: 'Tomaten, Gurken, Bohnen, Mais ernten', category: 'Ernte', priority: 'hoch', location: 'Gewächshaus/Hauptbeet' },

  // Pflege & Beobachtung
  { title: 'Beete vorbereiten - Unkraut entfernen', category: 'Vorbereitung', priority: 'hoch', location: 'Alle Beete' },
  { title: 'Schneckenbarrieren vorbereiten', category: 'Schutz', priority: 'mittel', location: 'Alle Beete' },
  { title: 'Mulch ausbringen', category: 'Mulch', priority: 'hoch', location: 'Alle Beete' },
  { title: 'Mulch kontrollieren und auffüllen', category: 'Mulch', priority: 'mittel', location: 'Alle Beete', is_recurring: true },
  { title: 'Schädlinge beobachten', category: 'Beobachtung', priority: 'mittel', location: 'Alle Beete', is_recurring: true },
  { title: 'Bewässerung bei Trockenheit', category: 'Bewässerung', priority: 'hoch', location: 'Alle Beete', is_recurring: true },
  { title: 'Blütenbildung beobachten (Federnelke)', category: 'Beobachtung', priority: 'mittel', location: 'Blumenbeet' },

  // Obstgarten
  { title: 'Weinreben schneiden', category: 'Pflege', priority: 'niedrig', location: 'Pergola' },
  { title: 'Weinreben - Austrieb beobachten', category: 'Beobachtung', priority: 'mittel', location: 'Pergola' },
  { title: 'Weinreben - überschüssige Triebe entfernen', category: 'Pflege', priority: 'mittel', location: 'Pergola' },

  // Blumen & Zaunseite
  { title: 'Blaukissen, Lavendel, Thymian entlang Zaunlinie pflanzen', category: 'Bepflanzung', priority: 'mittel', location: 'Zaunseite' },
  { title: 'Wildblumenmischung + Phacelia aussäen', category: 'Aussaat', priority: 'mittel', location: 'Zaunseite' },
  { title: 'Zaunseite mähen (Vorbereitung für Wildblumen)', category: 'Vorbereitung', priority: 'hoch', location: 'Zaunseite' },
];

async function importTodos() {
  try {
    console.log('🌱 Importing Garten2026 TODOs...\n');

    // Get user_id from existing plant
    const { data: plants, error: plantError } = await supabase
      .from('plants')
      .select('user_id')
      .limit(1);

    if (plantError || !plants || plants.length === 0) {
      console.error('❌ Could not find any plants to determine user_id');
      process.exit(1);
    }

    const userId = plants[0].user_id;
    console.log(`📝 Importing for user: ${userId.substring(0, 8)}...\n`);

    let created = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i];
      try {
        const { error } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            title: todo.title,
            category: todo.category || 'Sonstiges',
            priority: todo.priority || 'mittel',
            location: todo.location || null,
            completed: false,
            is_recurring: todo.is_recurring || false,
          });

        if (error) {
          errors.push(`${todo.title}: ${error.message}`);
          failed++;
        } else {
          console.log(`✅ [${i+1}/${todos.length}] ${todo.title}`);
          created++;
        }
      } catch (err) {
        errors.push(`${todo.title}: ${err.message}`);
        failed++;
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Created: ${created}/${todos.length}`);
    console.log(`   ❌ Failed: ${failed}/${todos.length}`);

    if (errors.length > 0 && created === 0) {
      console.log(`\nFirst error: ${errors[0]}`);
    }

    if (created > 0) {
      console.log(`\n✨ Successfully imported ${created} tasks from Garten2026!`);
      console.log(`📲 Open the app and check the "Aufgaben" tab to see all your garden TODOs.`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

importTodos();
