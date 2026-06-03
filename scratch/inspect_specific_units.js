const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: units } = await supabase.from('units').select('*');
  const targetIds = ['b2-s7', 'b2-s9', 'b2-s11', 'b2-s12', 'apt-1', 'apt-2', 'apt-3'];
  const filtered = units.filter(u => targetIds.includes(u.id));
  console.log(JSON.stringify(filtered, null, 2));
}
main();
