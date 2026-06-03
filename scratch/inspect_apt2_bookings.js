const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: bookings } = await supabase.from('bookings').select('*');
  const filtered = bookings.filter(b => b.apartment_id === 'apt-2' && (b.status === 'approved' || b.status === 'مؤكد'));
  console.log(JSON.stringify(filtered, null, 2));
}
main();
