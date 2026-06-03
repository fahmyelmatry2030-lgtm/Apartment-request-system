const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const insertData = {
    id: `TEST-${Date.now()}`,
    name: 'Test Guest',
    phone: '123456789',
    check_in: '2026-06-01',
    check_out: '2026-06-02',
    status: 'جديد',
    booking_manager: 'Test Manager'
  };

  const { error } = await supabase.from('bookings').insert(insertData);
  console.log('Error Object:', JSON.stringify(error, null, 2));
  console.log('Error type:', typeof error);
  console.log('Error message property:', error?.message);
}
main();
