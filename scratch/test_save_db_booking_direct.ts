import Module from 'module';
require('dotenv').config({ path: '.env.local' });

// Register server-only module mock
const mockServerOnly = {};
(Module as any)._cache['server-only'] = {
  id: 'server-only',
  exports: mockServerOnly,
  loaded: true
};

// Mock revalidatePath to avoid Next.js environment errors in standalone node
const nextCache = require('next/cache');
nextCache.revalidatePath = function(path: string) {
  console.log(`[Mock] revalidatePath called for: ${path}`);
};

async function main() {
  // Require dynamically after mocks are set up
  const { saveDbBooking } = require('../src/lib/actions/db');

  const booking = {
    name: 'Fahmy Test',
    phone: '201234567890',
    checkIn: '2026-06-05',
    checkOut: '2026-06-06',
    apartmentId: 'b1-s1',
    studio: 'استوديو 1',
    status: 'جديد',
    bookingManager: 'Test Manager Person',
    paymentMethod: 'Cash',
    notes: 'Testing notes'
  };

  console.log('Calling saveDbBooking...');
  const result = await saveDbBooking(booking);
  console.log('Result:', result);
}

main();
