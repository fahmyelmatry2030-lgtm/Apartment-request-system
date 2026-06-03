const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const { data: bookings, error } = await supabase.from('bookings').select('*').limit(1);
    if (error) {
      console.error('Error fetching bookings:', error);
      return;
    }
    if (bookings.length === 0) {
      console.log('No bookings found in DB');
    } else {
      console.log('Booking keys:', Object.keys(bookings[0]));
      console.log('Booking sample:', bookings[0]);
    }
  } catch (err) {
    console.error('Crash:', err);
  }
}
main();
