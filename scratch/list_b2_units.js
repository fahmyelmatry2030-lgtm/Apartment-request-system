const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: units, error } = await supabase.from('units').select('id, type, title');
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('All units in DB:');
  for (const u of units) {
    if (u.id.includes('19') || u.id.includes('23') || u.id.includes('21') || u.id.includes('24') || u.id.includes('b2-')) {
      console.log(`- ID: "${u.id}", Title (ar): "${u.title?.ar}", Type: "${u.type}"`);
    }
  }
  
  console.log('\nAll unit IDs:');
  console.log(units.map(u => u.id).join(', '));
}
main();
