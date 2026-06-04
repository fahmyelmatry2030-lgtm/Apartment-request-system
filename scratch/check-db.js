const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const { data: units, error } = await supabase.from('units').select('*');
    if (error) throw error;
    console.log(`Current units in DB: ${units.length}`);
    const branch3 = units.filter(u => u.branch === 3);
    console.log(`Branch 3 units:`, branch3);
  } catch (err) {
    console.error(err);
  }
}
main();
