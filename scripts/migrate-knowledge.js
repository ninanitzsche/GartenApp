#!/usr/bin/env node

/**
 * Migrate Knowledge Articles from Chat Transcripts
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

// Extract knowledge articles from markdown
function parseKnowledgeArticles(content, source) {
  const articles = [];

  // 1. Extract main sections (marked with ##)
  const sectionPattern = /^## (.*?)\n\n([\s\S]*?)(?=^##|Du hast gesagt|$)/gm;
  let match;

  while ((match = sectionPattern.exec(content)) !== null) {
    const title = match[1].trim();
    let contentText = match[2].trim();

    // Skip section headers that are just navigation
    if (title.toLowerCase().includes('next step') ||
        title.toLowerCase().includes('troubleshoot')) {
      continue;
    }

    // Truncate very long content
    if (contentText.length > 2000) {
      contentText = contentText.substring(0, 2000) + '...';
    }

    articles.push({
      title: title,
      category: categorizeContent(title),
      content: contentText,
      is_favorited: false,
      source: source
    });
  }

  // 2. Extract care tables (|Pflanze|...|)
  const tablePattern = /(\|.*?\|.*?\n[\s\S]*?\|[\s\S]*?\|)/g;
  const tables = content.match(tablePattern) || [];

  tables.forEach((table, idx) => {
    if (table.includes('Pflanze') || table.includes('plant')) {
      articles.push({
        title: `Pflegeanleitung - Pflanzentabelle ${idx + 1}`,
        category: 'care',
        content: `## Ausaat- und Pflegeanleitung\n\n${table}`,
        is_favorited: false,
        source: source
      });
    }
  });

  // 3. Extract specific strategies
  const strategies = [
    {
      pattern: /No-Dig.*?\n\n([\s\S]*?)(?=\n##|Du hast|$)/i,
      title: 'No-Dig Methode - Kartoffeln ohne Graben',
      category: 'strategy'
    },
    {
      pattern: /Drei Schwestern.*?\n\n([\s\S]*?)(?=\n##|Du hast|$)/i,
      title: 'Die Drei Schwestern - Mais, Bohnen, Kürbis',
      category: 'strategy'
    },
    {
      pattern: /Lebender Mulch.*?\n\n([\s\S]*?)(?=\n##|Du hast|$)/i,
      title: 'Lebender Mulch mit Neuseeländer Spinat',
      category: 'strategy'
    },
    {
      pattern: /Permakultur.*?\n\n([\s\S]*?)(?=\n##|Du hast|$)/i,
      title: 'Permakultur Prinzipien für Low-Maintenance Garten',
      category: 'strategy'
    },
    {
      pattern: /Companion Plant|Begleitpflanz.*?\n\n([\s\S]*?)(?=\n##|Du hast|$)/i,
      title: 'Begleitpflanzung - Wer passt zu wem?',
      category: 'companions'
    }
  ];

  strategies.forEach(({ pattern, title, category }) => {
    const stratMatch = pattern.exec(content);
    if (stratMatch) {
      articles.push({
        title: title,
        category: category,
        content: stratMatch[0].substring(0, 2000),
        is_favorited: false,
        source: source
      });
    }
  });

  // 4. Extract Anzucht (Seedling) guide
  const anzuchtPattern = /Anzucht|Quick Pot|Vorkultur.*?\n\n([\s\S]*?)(?=\n##|Du hast|$)/i;
  const anzuchtMatch = anzuchtPattern.exec(content);
  if (anzuchtMatch) {
    articles.push({
      title: 'Anzuchtanleitung - Pflanzen vorziehen',
      category: 'care',
      content: anzuchtMatch[0].substring(0, 2000),
      is_favorited: false,
      source: source
    });
  }

  // 5. Extract MHD / Seed age handling
  const mhdPattern = /MHD.*Saatgut.*?\n\n([\s\S]*?)(?=\n##|Du hast|$)/i;
  const mhdMatch = mhdPattern.exec(content);
  if (mhdMatch) {
    articles.push({
      title: 'Saatgut-Alter (MHD) - Keimfähigkeit erhöhen',
      category: 'care',
      content: mhdMatch[0].substring(0, 1500),
      is_favorited: false,
      source: source
    });
  }

  // 6. Extract seasonal planting guides
  const monthPattern = /(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember):.*?\n\n([\s\S]*?)(?=\n(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember):|Du hast|$)/i;
  let monthMatch;
  const monthRegex = new RegExp(monthPattern.source, 'gi');

  while ((monthMatch = monthRegex.exec(content)) !== null) {
    articles.push({
      title: `${monthMatch[1]}: Gartenkalender & Aufgaben`,
      category: 'seasonal',
      content: monthMatch[0].substring(0, 1500),
      is_favorited: false,
      source: source
    });
  }

  return articles;
}

function categorizeContent(title) {
  const lower = title.toLowerCase();
  if (lower.includes('strategi') || lower.includes('design') || lower.includes('planung')) return 'strategy';
  if (lower.includes('schnitt') || lower.includes('ernte') || lower.includes('pflege')) return 'care';
  if (lower.includes('begleiter') || lower.includes('companion')) return 'companions';
  if (lower.includes('mulch') || lower.includes('boden')) return 'soil';
  if (lower.includes('anzucht') || lower.includes('saatgut')) return 'seedling';
  if (lower.includes('januar') || lower.includes('februar') || lower.includes('märz') ||
      lower.includes('april') || lower.includes('mai') || lower.includes('juni') ||
      lower.includes('juli') || lower.includes('august') || lower.includes('september') ||
      lower.includes('oktober') || lower.includes('november') || lower.includes('dezember')) {
    return 'seasonal';
  }
  return 'gardening';
}

async function main() {
  log('\n📚 Knowledge Article Migration', 'bright');
  log('='.repeat(50) + '\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Get user
  log('Getting user...', 'blue');
  const { data: { users } } = await supabase.auth.admin.listUsers();
  if (!users || users.length === 0) {
    log('❌ No users found', 'red');
    process.exit(1);
  }

  const user = users[0];
  const userId = user.id;
  log(`✅ Using user: ${user.email}`, 'green');

  // Parse articles
  log('\nParsing chat transcripts...', 'blue');
  let allArticles = [];

  if (fs.existsSync(GEMINI_1_PATH)) {
    const content = fs.readFileSync(GEMINI_1_PATH, 'utf8');
    const parsed = parseKnowledgeArticles(content, 'Gemini Chatverlauf 1');
    allArticles = allArticles.concat(parsed);
    log(`   ✅ Gemini 1: ${parsed.length} articles`, 'green');
  }

  if (fs.existsSync(GEMINI_2_PATH)) {
    const content = fs.readFileSync(GEMINI_2_PATH, 'utf8');
    const parsed = parseKnowledgeArticles(content, 'Gemini Chatverlauf 2');
    allArticles = allArticles.concat(parsed);
    log(`   ✅ Gemini 2: ${parsed.length} articles`, 'green');
  }

  // Deduplicate
  const seen = new Set();
  const uniqueArticles = [];
  allArticles.forEach(article => {
    const key = article.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueArticles.push(article);
    }
  });

  log(`\n✅ Total unique articles: ${uniqueArticles.length}`, 'green');

  // Check existing
  log('\nChecking existing articles...', 'blue');
  const { data: existingArticles } = await supabase
    .from('knowledge_articles')
    .select('title')
    .eq('user_id', userId);

  const existingTitles = new Set((existingArticles || []).map(a => a.title.toLowerCase()));
  const newArticles = uniqueArticles.filter(a => !existingTitles.has(a.title.toLowerCase()));

  log(`   ✅ Found ${existingArticles?.length || 0} existing articles`, 'green');
  log(`📝 Will insert ${newArticles.length} new articles\n`, 'blue');

  if (newArticles.length === 0) {
    log('✅ All articles already in database!', 'green');
    return;
  }

  // Prepare records
  const articleRecords = newArticles.map(article => ({
    user_id: userId,
    title: article.title.substring(0, 200),
    category: article.category,
    content: article.content,
    is_favorited: article.is_favorited
  }));

  // Insert
  let inserted = 0;
  for (let i = 0; i < articleRecords.length; i++) {
    const record = articleRecords[i];

    const { error } = await supabase
      .from('knowledge_articles')
      .insert([record])
      .select();

    if (!error) {
      inserted++;
    }

    if ((i + 1) % 5 === 0 || i === articleRecords.length - 1) {
      process.stdout.write(`\r   [${i + 1}/${articleRecords.length}] Articles inserted...`);
    }
  }

  log('\n\n' + '='.repeat(50), 'bright');
  log(`✅ Migration complete!`, 'green');
  log(`\n📊 Summary:`, 'reset');
  log(`   • Articles inserted: ${inserted}/${newArticles.length}`, 'reset');

  const byCategory = {};
  newArticles.forEach(a => {
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
  });
  log(`   • By category:`, 'reset');
  Object.entries(byCategory).forEach(([cat, count]) => {
    log(`     - ${cat}: ${count}`, 'reset');
  });

  log(`\n✨ Ready to use in app!\n`, 'green');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}\n`, 'red');
  console.error(err);
  process.exit(1);
});
