import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function runMigration() {
  const sql = fs.readFileSync('./scripts/migrate-add-tags-to-knowledge.sql', 'utf-8');
  
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: sql,
    });
    
    if (error) {
      console.error('Migration error:', error);
    } else {
      console.log('✓ Migration successful');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

runMigration();
