const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: bookings } = await supabase.from('bookings').select('*');
  const targetIds = ['b2-s7', 'b2-s9', 'b2-s11', 'b2-s12', 'apt-1', 'apt-2', 'apt-3', 'b2-s19', 'b2-s21', 'b2-s23', 'b2-s24'];
  const filtered = bookings.filter(b => targetIds.includes(b.apartment_id));
  console.log(JSON.stringify(filtered, null, 2));
}
main();
