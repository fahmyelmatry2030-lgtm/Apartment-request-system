const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: units, error } = await supabase.from('units').select('*');
  if (error) {
    console.error('Error fetching units:', error);
    return;
  }

  console.log(`Checking ${units.length} units in database...`);
  
  for (const u of units) {
    console.log(`\nUnit ID: ${u.id}`);
    console.log(`- Type: ${u.type}`);
    console.log(`- Status: ${u.status}`);
    
    // Check title
    console.log(`- Title:`, typeof u.title, u.title);
    if (u.title && typeof u.title === 'object') {
      console.log(`  - title.ar:`, u.title.ar);
      console.log(`  - title.en:`, u.title.en);
    } else {
      console.warn(`  ⚠️ title is NOT an object!`);
    }

    // Check description
    console.log(`- Description:`, typeof u.description, u.description);
    if (u.description && typeof u.description === 'object') {
      console.log(`  - description.ar:`, u.description.ar);
      console.log(`  - description.en:`, u.description.en);
    } else {
      console.log(`  - description is missing or not an object.`);
    }

    // Check features
    console.log(`- Features:`, typeof u.features, u.features);
    if (u.features) {
      if (typeof u.features === 'object') {
        console.log(`  - features.ar:`, Array.isArray(u.features.ar) ? 'Array' : typeof u.features.ar, u.features.ar);
        console.log(`  - features.en:`, Array.isArray(u.features.en) ? 'Array' : typeof u.features.en, u.features.en);
      } else {
        console.warn(`  ⚠️ features is NOT an object!`);
      }
    }

    // Check images
    console.log(`- Images:`, Array.isArray(u.images) ? `Array (length ${u.images.length})` : typeof u.images, u.images);
    
    // Check price and original_price
    console.log(`- Price: ${u.price}`);
    console.log(`- Original Price: ${u.original_price}`);
  }
}
main();
