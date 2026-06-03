const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: units, error } = await supabase.from('units').select('*');
  if (error) {
    console.error('DB Error:', error);
    return;
  }
  for (const u of units) {
    console.log(`ID: ${u.id}`);
    console.log(`  title: ${JSON.stringify(u.title)} (type: ${typeof u.title})`);
    console.log(`  type: ${u.type}`);
    console.log(`  price: ${u.price} (type: ${typeof u.price})`);
  }
}
main();
