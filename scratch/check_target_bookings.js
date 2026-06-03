const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: bookings } = await supabase.from('bookings').select('*');
  const targetIds = ['b2-s7', 'b2-s9', 'b2-s11', 'b2-s12', 'apt-1', 'apt-2', 'apt-3'];
  const filtered = bookings.filter(b => targetIds.includes(b.apartment_id) && (b.status === 'approved' || b.status === 'مؤكد'));
  
  for (const b of filtered) {
    console.log(`Booking ID: ${b.id}`);
    console.log(`  check_in: ${b.check_in} (type: ${typeof b.check_in})`);
    console.log(`  check_out: ${b.check_out} (type: ${typeof b.check_out})`);
    console.log(`  total_amount: ${b.total_amount} (type: ${typeof b.total_amount})`);
    console.log(`  number_of_days: ${b.number_of_days} (type: ${typeof b.number_of_days})`);
    console.log(`  commission: ${b.commission} (type: ${typeof b.commission})`);
    console.log(`  client_status: ${b.client_status} (type: ${typeof b.client_status})`);
  }
}
main();
