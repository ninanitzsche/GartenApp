#!/usr/bin/env node

/**
 * Auto-Link Knowledge Articles to Plants
 * Based on keywords, categories, and text matching
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Keywords that link plants to knowledge articles
const KNOWLEDGE_KEYWORDS = {
  'aussaat': ['Aussaat', 'Anzucht', 'säen', 'planting', 'seedling'],
  'no-dig': ['Kartoffeln', 'No-Dig', 'Mulchkultur'],
  'drei-schwestern': ['Mais', 'Bohnen', 'Kürbis', 'Drei Schwestern'],
  'spinat': ['Neuseeländer Spinat', 'Spinat', 'lebender Mulch'],
  'schnitt': ['Schnitt', 'Rückschnitt', 'pruning'],
  'mulch': ['Mulch', 'Mulchen', 'mulching'],
  'ernte': ['Ernte', 'ernten', 'harvesting'],
  'tomaten': ['Tomate', 'Tomaten'],
  'wasser': ['Wasser', 'Gießen', 'watering'],
  'dünger': ['Dünger', 'Jauche', 'Nährstoff'],
  'schneckenschutz': ['Schnecke', 'Schneckenschutz'],
  'permakultur': ['Permakultur'],
  'begleiter': ['Begleit', 'Companion'],
  'winter': ['Winter', 'winterfest'],
  'kartoffel': ['Kartoffel', 'Kartoffeln', 'potato'],
  'basilikum': ['Basilikum', 'Basil'],
  'kohlrabi': ['Kohlrabi'],
  'erdbeere': ['Erdbeere', 'Erdbeeren', 'strawberry'],
  'bohne': ['Bohne', 'Bohnen', 'Bean'],
  'gurke': ['Gurke', 'Gurken', 'cucumber'],
  'kürbis': ['Kürbis', 'Pumpkin'],
  'thymian': ['Thymian', 'Thyme'],
  'lavendel': ['Lavendel', 'Lavender'],
  'lauchzwiebel': ['Lauchzwiebel', 'Spring Onion'],
};

async function main() {
  log('\n🔗 Knowledge Linker - Auto-Link Articles to Plants', 'bright');
  log('='.repeat(50) + '\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Get user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  if (!users || users.length === 0) {
    log('❌ No users found', 'red');
    process.exit(1);
  }

  const user = users[0];
  const userId = user.id;
  log(`👤 Using user: ${user.email}`, 'green');

  // Get all plants
  log('\n🌱 Loading plants...', 'blue');
  const { data: plants, error: plantsError } = await supabase
    .from('plants')
    .select('id, name, type, notes')
    .eq('user_id', userId);

  if (plantsError || !plants) {
    log(`❌ Error loading plants: ${plantsError?.message}`, 'red');
    process.exit(1);
  }

  log(`✅ Loaded ${plants.length} plants`, 'green');

  // Get all knowledge articles
  log('\n📚 Loading knowledge articles...', 'blue');
  const { data: articles, error: articlesError } = await supabase
    .from('knowledge_articles')
    .select('id, title, content, category')
    .eq('user_id', userId);

  if (articlesError || !articles) {
    log(`❌ Error loading articles: ${articlesError?.message}`, 'red');
    process.exit(1);
  }

  log(`✅ Loaded ${articles.length} knowledge articles`, 'green');

  // Link plants to knowledge articles
  log('\n🔗 Linking plants to knowledge articles...', 'blue');

  let linkedCount = 0;

  for (const plant of plants) {
    const plantText = `${plant.name} ${plant.type || ''} ${plant.notes || ''}`.toLowerCase();
    const matchingArticles = articles.filter(article => {
      const articleText = `${article.title} ${article.content}`.toLowerCase();

      // Check for keyword matches
      for (const keywords of Object.values(KNOWLEDGE_KEYWORDS)) {
        const plantHasKeyword = keywords.some(kw => plantText.includes(kw.toLowerCase()));
        const articleHasKeyword = keywords.some(kw => articleText.includes(kw.toLowerCase()));
        if (plantHasKeyword && articleHasKeyword) {
          return true;
        }
      }

      return false;
    });

    if (matchingArticles.length > 0) {
      const articleIds = matchingArticles.map(a => a.id);

      const { error: updateError } = await supabase
        .from('plants')
        .update({ knowledge_article_ids: articleIds })
        .eq('id', plant.id);

      if (!updateError) {
        linkedCount++;
        log(
          `   ✅ "${plant.name}" → ${matchingArticles.length} articles`,
          'green'
        );
      } else {
        log(
          `   ⚠️  "${plant.name}" - Error: ${updateError.message}`,
          'yellow'
        );
      }
    }
  }

  // Link knowledge articles back to plants
  log('\n🔗 Linking knowledge articles back to plants...', 'blue');

  for (const article of articles) {
    const articleText = `${article.title} ${article.content}`.toLowerCase();
    const relatedPlants = plants.filter(plant => {
      const plantText = `${plant.name} ${plant.type || ''} ${plant.notes || ''}`.toLowerCase();

      for (const keywords of Object.values(KNOWLEDGE_KEYWORDS)) {
        const plantHasKeyword = keywords.some(kw => plantText.includes(kw.toLowerCase()));
        const articleHasKeyword = keywords.some(kw => articleText.includes(kw.toLowerCase()));
        if (plantHasKeyword && articleHasKeyword) {
          return true;
        }
      }

      return false;
    });

    if (relatedPlants.length > 0) {
      const plantIds = relatedPlants.map(p => p.id);

      await supabase
        .from('knowledge_articles')
        .update({ plant_ids: plantIds })
        .eq('id', article.id);
    }
  }

  log('\n' + '='.repeat(50), 'bright');
  log(`✅ Linking complete!`, 'green');
  log(`\n📊 Summary:`, 'reset');
  log(`   • Plants linked: ${linkedCount}/${plants.length}`, 'reset');
  log(`   • Articles processed: ${articles.length}`, 'reset');
  log(`\n✨ Knowledge base now connected to plants!\n`, 'green');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}\n`, 'red');
  console.error(err);
  process.exit(1);
});
