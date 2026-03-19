#!/usr/bin/env node

/**
 * Add knowledge_article_ids column to plants table
 */

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

async function main() {
  log('\n🔧 Setting up plant-knowledge links...', 'bright');
  log('='.repeat(50) + '\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  log('📝 Checking if knowledge_article_ids column exists...', 'blue');

  // Try to select the column
  const { error: selectError } = await supabase
    .from('plants')
    .select('knowledge_article_ids')
    .limit(1);

  if (selectError && selectError.message.includes('column')) {
    log('⚠️  Column missing, you need to add it via SQL...', 'yellow');

    const fs = require('fs');
    const sqlPath = path.join(__dirname, 'setup-plant-links.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    log('\n📋 SQL to run in Supabase Dashboard → SQL Editor:\n', 'yellow');
    log(sqlContent, 'reset');
    log('\n✅ Copy the SQL above and run it in your Supabase dashboard:', 'green');
    log('   1. Go to https://app.supabase.com', 'reset');
    log('   2. Select your project', 'reset');
    log('   3. Go to SQL Editor', 'reset');
    log('   4. Create a new query and paste the SQL', 'reset');
    log('   5. Click Run', 'reset');
    log('   6. Come back here and run: npm run link:plants\n', 'green');
    process.exit(0);
  }

  log('✅ Column already exists!', 'green');
  log('\n✨ Setup complete! Now run: npm run link:plants\n', 'green');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}\n`, 'red');
  process.exit(1);
});
