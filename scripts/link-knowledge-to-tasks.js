#!/usr/bin/env node

/**
 * Auto-Link Knowledge Articles to Tasks and Plants
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

// Keywords that link tasks to knowledge articles
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
};

async function main() {
  log('\n🔗 Knowledge Linker - Auto-Link Articles to Tasks', 'bright');
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

  // Get all tasks
  log('\n📋 Loading tasks...', 'blue');
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, category')
    .eq('user_id', userId)
    .eq('auto_generated', true);

  if (tasksError || !tasks) {
    log(`❌ Error loading tasks: ${tasksError?.message}`, 'red');
    process.exit(1);
  }

  log(`✅ Loaded ${tasks.length} tasks`, 'green');

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

  // Link tasks to knowledge articles
  log('\n🔗 Linking tasks to knowledge articles...', 'blue');

  let linkedCount = 0;

  for (const task of tasks) {
    const taskText = `${task.title} ${task.category}`.toLowerCase();
    const matchingArticles = articles.filter(article => {
      const articleText = `${article.title} ${article.content}`.toLowerCase();

      // Check for direct category matches
      if (task.category === 'planting' && article.category === 'seedling') return true;
      if (task.category === 'pruning' && article.category === 'care') return true;
      if (task.category === 'mulching' && article.category === 'soil') return true;

      // Check for keyword matches
      for (const keywords of Object.values(KNOWLEDGE_KEYWORDS)) {
        const taskHasKeyword = keywords.some(kw => taskText.includes(kw.toLowerCase()));
        const articleHasKeyword = keywords.some(kw => articleText.includes(kw.toLowerCase()));
        if (taskHasKeyword && articleHasKeyword) {
          return true;
        }
      }

      return false;
    });

    if (matchingArticles.length > 0) {
      const articleIds = matchingArticles.map(a => a.id);

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ knowledge_article_ids: articleIds })
        .eq('id', task.id);

      if (!updateError) {
        linkedCount++;
        log(
          `   ✅ "${task.title.substring(0, 40)}" → ${matchingArticles.length} articles`,
          'green'
        );
      }
    }
  }

  // Link knowledge articles back to tasks
  log('\n🔗 Linking knowledge articles back to tasks...', 'blue');

  for (const article of articles) {
    const articleText = `${article.title} ${article.content}`.toLowerCase();
    const relatedTasks = tasks.filter(task => {
      const taskText = `${task.title} ${task.category}`.toLowerCase();

      if (task.category === 'planting' && article.category === 'seedling') return true;
      if (task.category === 'pruning' && article.category === 'care') return true;
      if (task.category === 'mulching' && article.category === 'soil') return true;

      for (const keywords of Object.values(KNOWLEDGE_KEYWORDS)) {
        const taskHasKeyword = keywords.some(kw => taskText.includes(kw.toLowerCase()));
        const articleHasKeyword = keywords.some(kw => articleText.includes(kw.toLowerCase()));
        if (taskHasKeyword && articleHasKeyword) {
          return true;
        }
      }

      return false;
    });

    if (relatedTasks.length > 0) {
      const taskIds = relatedTasks.map(t => t.id);

      await supabase
        .from('knowledge_articles')
        .update({ related_task_ids: taskIds })
        .eq('id', article.id);
    }
  }

  log('\n' + '='.repeat(50), 'bright');
  log(`✅ Linking complete!`, 'green');
  log(`\n📊 Summary:`, 'reset');
  log(`   • Tasks linked: ${linkedCount}/${tasks.length}`, 'reset');
  log(`   • Articles linked: ${articles.length}`, 'reset');
  log(`\n✨ Knowledge base now connected to tasks!\n`, 'green');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}\n`, 'red');
  console.error(err);
  process.exit(1);
});
