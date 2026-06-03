const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const targetIds = ['apt-1', 'apt-2', 'apt-3', 'b2-s19', 'b2-s23', 'b2-s21', 'b2-s24'];
  const { data: units, error } = await supabase
    .from('units')
    .select('*')
    .in('id', targetIds);
  
  if (error) {
    console.error('Error fetching units:', error);
    return;
  }
  
  console.log(`Found ${units.length} target units:`);
  for (const u of units) {
    console.log(`\n===================`);
    console.log(`ID: ${u.id}`);
    console.log(`Type: ${u.type}`);
    console.log(`Title:`, JSON.stringify(u.title));
    console.log(`Price: ${u.price}`);
    console.log(`Original Price: ${u.original_price}`);
    console.log(`Images:`, JSON.stringify(u.images));
    console.log(`Features:`, JSON.stringify(u.features));
    console.log(`Description:`, JSON.stringify(u.description));
  }
}
main();
