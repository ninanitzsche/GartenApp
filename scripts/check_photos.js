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
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPhotos() {
  try {
    console.log('Checking photos schema and content...\n');
    
    const { data, error } = await supabase
      .from('photos')
      .select('id, file_url, created_at')
      .limit(10);

    if (error) throw error;

    if (data && data.length > 0) {
      console.log('Sample photos:');
      data.forEach((p, i) => {
        console.log(`${i + 1}. ID: ${p.id.substring(0, 8)}...`);
        console.log(`   file_url: ${p.file_url ? '✓ ' + p.file_url.substring(0, 50) + '...' : '✗ NULL'}`);
      });
      
      const withoutFileUrl = data.filter(p => !p.file_url);
      
      console.log(`\n📊 Summary:`);
      console.log(`   Total photos sampled: ${data.length}`);
      console.log(`   Missing file_url: ${withoutFileUrl.length}`);
      
      if (withoutFileUrl.length > 0) {
        console.log(`\n⚠️  ${withoutFileUrl.length} photos missing file_url!`);
        console.log(`   These photos cannot be displayed without a storage path.`);
      }
    } else {
      console.log('No photos found in database');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkPhotos();
