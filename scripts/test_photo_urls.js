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
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getPublicPhotoUrl(storagePath) {
  const { data } = supabase.storage
    .from('plant-photos')
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

async function testUrls() {
  try {
    console.log('Testing photo URL generation...\n');
    
    const { data: photos } = await supabase
      .from('photos')
      .select('id, file_url')
      .limit(3);

    if (photos && photos.length > 0) {
      photos.forEach(photo => {
        const publicUrl = getPublicPhotoUrl(photo.file_url);
        console.log(`Photo: ${photo.id.substring(0, 8)}`);
        console.log(`  file_url: ${photo.file_url}`);
        console.log(`  public_url: ${publicUrl}`);
        console.log();
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testUrls();
