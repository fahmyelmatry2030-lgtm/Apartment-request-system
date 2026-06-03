const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: bookings } = await supabase.from('bookings').select('*');
  
  const invalidDates = bookings.filter(b => !b.check_in || !b.check_out || typeof b.check_in !== 'string' || typeof b.check_out !== 'string');
  console.log('Bookings with completely invalid date types or nulls:', invalidDates.map(b => ({ id: b.id, check_in: b.check_in, check_out: b.check_out })));
}
main();
