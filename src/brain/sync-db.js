const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Mock env vars from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

async function sync() {
  console.log('🔄 Starting full sync from Supabase...');
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // 1. Sync Translations
  const { data: trans, error: tErr } = await supabase.from('translations').select('data').eq('id', 1).single();
  if (tErr) console.error('Error fetching translations:', tErr);
  if (trans && trans.data) {
    fs.writeFileSync('src/data/translations.json', JSON.stringify(trans.data, null, 2));
    console.log('✅ Translations synced to src/data/translations.json');
  }

  // 2. Sync Units
  const { data: units, error: uErr } = await supabase.from('units').select('*');
  if (uErr) console.error('Error fetching units:', uErr);
  if (units && units.length > 0) {
    const unitsCode = 'export const units = ' + JSON.stringify(units, null, 2) + ';';
    fs.writeFileSync('src/lib/data.ts', unitsCode);
    console.log('✅ Units synced to src/lib/data.ts');
  }
}

sync().catch(console.error);
