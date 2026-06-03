const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: bookings } = await supabase.from('bookings').select('*');
  const approved = bookings.filter(b => b.status === 'approved' || b.status === 'مؤكد');
  const unitCounts = {};
  approved.forEach(b => {
    unitCounts[b.apartment_id] = (unitCounts[b.apartment_id] || 0) + 1;
  });
  console.log('Approved bookings count per unit:', unitCounts);
}
main();
