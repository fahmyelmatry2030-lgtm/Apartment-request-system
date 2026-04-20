
import { updateDbBookingStatus, getDbBookings } from '../src/lib/actions/db';

async function testSync() {
  console.log('--- DB SYNC TEST ---');
  
  // 1. Get current bookings
  const bookings = await getDbBookings('initial_test');
  if (bookings.length === 0) {
    console.log('No bookings found to test.');
    return;
  }
  
  const target = bookings[0];
  const originalName = target.name;
  const testName = `MazarTest_${Date.now()}`;
  
  console.log(`Original Name: "${originalName}" | ID: ${target.id}`);
  console.log(`Setting new name: "${testName}"...`);
  
  // 2. Perform update
  try {
    await updateDbBookingStatus(target.id, { name: testName });
    console.log('Update command finished.');
  } catch (err) {
    console.error('Update failed:', err.message);
    return;
  }
  
  // 3. Fetch fresh data (with nonce)
  const freshBookings = await getDbBookings(`validation_${Date.now()}`);
  const updatedEntry = freshBookings.find(b => b.id === target.id);
  
  if (updatedEntry && updatedEntry.name === testName) {
    console.log('🎉 SUCCESS: Data persisted and fetched correctly!');
  } else {
    console.log('❌ UNEXPECTED: Data still shows old name or wrong data.');
    console.log('Fetched Name:', updatedEntry?.name);
  }
  
  // 4. Restore original name (cleanup)
  await updateDbBookingStatus(target.id, { name: originalName });
  console.log('Original name restored.');
}

testSync().catch(console.error);
