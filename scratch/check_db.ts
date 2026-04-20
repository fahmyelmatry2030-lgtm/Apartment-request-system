
import { getDbBookings } from '../src/lib/actions/db';

async function main() {
  console.log('Fetching bookings from DB...');
  const bookings = await getDbBookings();
  console.log(`Total bookings found: ${bookings.length}`);
  if (bookings.length > 0) {
    console.log('Sample booking:', JSON.stringify(bookings[0], null, 2));
  }
}

main().catch(console.error);
