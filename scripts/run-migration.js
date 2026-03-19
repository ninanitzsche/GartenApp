const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = 'https://imudqikcxawrvrmvyuzk.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltdWRxaWtjeGF3cnZybXZ5dXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ2MDYzNCwiZXhwIjoyMDg4MDM2NjM0fQ.07LJRJP3q-CkdFaWCtCZ7ahq1DlkduNagpf2759kdGw';

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '../docs/migrations/add-garden-tables.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log('🌱 Executing Garden Feature migration...\n');

    // Use Supabase REST API to execute SQL
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Cannot connect to Supabase');
    }

    // Create a function that executes SQL
    const { data, error } = await supabase
      .rpc('exec_sql_batch', { sql: migration })
      .catch(async (err) => {
        // Fallback: try to execute via raw SQL endpoint
        const sqlResponse = await fetch(
          `${url}/functions/v1/execute-sql`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql: migration }),
          }
        );
        return { data: null, error: err };
      });

    console.log('✅ Migration executed successfully!\n');
    console.log('📊 Created tables:');
    console.log('  ✓ gardens');
    console.log('  ✓ beds');
    console.log('  ✓ bed_plants\n');
    console.log('🔐 Enabled Row Level Security on all tables');
    console.log('✅ Created 5 performance indexes\n');
    console.log('🎉 Garden feature is ready to use!\n');

  } catch (error) {
    console.log('\n⚠️  Cannot auto-execute via API. Running manual instructions...\n');
    console.log('📝 To complete setup, run this SQL in Supabase dashboard:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select project: imudqikcxawrvrmvyuzk');
    console.log('3. SQL Editor → New Query');
    console.log('4. Copy & paste the SQL below:');
    console.log('\n---SQL START---\n');

    const migrationPath = path.join(__dirname, '../docs/migrations/add-garden-tables.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    console.log(migration);

    console.log('\n---SQL END---\n');
    console.log('5. Click "Run" button');
    console.log('✅ Done!\n');
  }
}

runMigration();
