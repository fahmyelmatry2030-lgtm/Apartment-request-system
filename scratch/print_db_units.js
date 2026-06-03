const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const targetIds = ['b2-s7', 'b2-s8', 'b2-s9', 'b2-s10', 'b2-s11', 'b2-s12', 'apt-1', 'apt-2', 'apt-3'];
  const { data: units, error } = await supabase
    .from('units')
    .select('*')
    .in('id', targetIds);
  
  if (error) {
    console.error('Error fetching units:', error);
    return;
  }
  
  console.log(`Fetched ${units.length} units:`);
  for (const u of units) {
    console.log(`ID: ${u.id}`);
    console.log(`Title:`, JSON.stringify(u.title));
    console.log(`Type: ${u.type}`);
    console.log(`Price: ${u.price}`);
    console.log(`Description:`, JSON.stringify(u.description));
    console.log(`Features:`, JSON.stringify(u.features));
    console.log(`-------------------------------------`);
  }
}
main();
