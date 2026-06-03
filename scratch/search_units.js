const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: units } = await supabase.from('units').select('*');
  const filtered = units.filter(u => 
    String(u.id).includes('19') || 
    String(u.id).includes('21') || 
    String(u.id).includes('23') || 
    String(u.id).includes('24') || 
    u.title?.ar?.includes('19') ||
    u.title?.ar?.includes('21') ||
    u.title?.ar?.includes('23') ||
    u.title?.ar?.includes('24')
  );
  console.log(JSON.stringify(filtered.map(u => ({ id: u.id, title: u.title, price: u.price })), null, 2));
}
main();
