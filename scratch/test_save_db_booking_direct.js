const path = require('path');
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;

// Setup manual alias resolver for "@/" to "src/"
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    request = path.join(__dirname, '../src', request.substring(2));
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// Register server-only module mock
const mockServerOnly = {};
Module._cache['server-only'] = {
  id: 'server-only',
  exports: mockServerOnly,
  loaded: true
};

require('dotenv').config({ path: '.env.local' });

// Mock revalidatePath to avoid Next.js environment errors in standalone node
const nextCache = require('next/cache');
nextCache.revalidatePath = function(path) {
  console.log(`[Mock] revalidatePath called for: ${path}`);
};

const { saveDbBooking } = require('../src/lib/actions/db');

async function main() {
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
