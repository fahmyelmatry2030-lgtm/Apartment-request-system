
import { getSupabaseServerClient } from '../src/lib/supabase/server';

async function main() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return console.error('Supabase client failed');

  console.log('Fetching 5 bookings to inspect IDs...');
  const { data, error } = await supabase.from('bookings').select('id, name').limit(5);
  
  if (error) return console.error('Error:', error);
  console.log('Bookings:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
