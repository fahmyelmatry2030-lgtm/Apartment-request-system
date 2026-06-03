const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: bookings } = await supabase.from('bookings').select('*');
  const approved = bookings.filter(b => b.status === 'approved' || b.status === 'مؤكد');
  const uniqueStatuses = [...new Set(approved.map(b => b.client_status))];
  console.log('Unique client_status values in approved bookings:', uniqueStatuses);
  
  // Also check check_in and check_out formats
  const invalidDates = approved.filter(b => !b.check_in || !b.check_out || !b.check_in.includes('-') || !b.check_out.includes('-'));
  console.log('Bookings with invalid dates:', invalidDates.map(b => ({ id: b.id, check_in: b.check_in, check_out: b.check_out })));
}
main();
