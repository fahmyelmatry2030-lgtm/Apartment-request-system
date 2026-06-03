const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const newBookingWithId = {
    id: `TEST-${Date.now()}`,
    name: 'Test Guest',
    phone: '123456789',
    checkIn: '2026-06-01',
    checkOut: '2026-06-02',
    status: 'جديد',
    bookingManager: 'Test Manager'
  };

  const insertData = {
    id: newBookingWithId.id,
    name: newBookingWithId.name,
    phone: newBookingWithId.phone,
    check_in: newBookingWithId.checkIn,
    check_out: newBookingWithId.checkOut,
    status: newBookingWithId.status,
  };

  if (newBookingWithId.bookingManager) insertData.booking_manager = newBookingWithId.bookingManager;

  console.log('Attempting insert with:', insertData);
  let { error } = await supabase.from('bookings').insert(insertData);
  console.log('Initial Insert Error:', error);

  if (error && error.message?.includes('schema cache')) {
    console.warn('Retrying insert without booking_manager/payment_method columns...');
    delete insertData.booking_manager;
    delete insertData.payment_method;
    const retry = await supabase.from('bookings').insert(insertData);
    error = retry.error;
    console.log('Retry Result Error:', error);
  }
}
main();
