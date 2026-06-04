const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    for (let i = 25; i <= 30; i++) {
      const id = `p-s${i}`;
      const titleAr = `شقة غرفتين (${i})`;
      const titleEn = `Two-room Apartment (${i})`;
      
      const { data, error } = await supabase
        .from('units')
        .update({
          title: { ar: titleAr, en: titleEn },
          type: 'studio', // keep type as 'studio' so it works natively with current classification but has the updated name
          branch: 3
        })
        .eq('id', id);
        
      if (error) throw error;
      console.log(`Updated ${id} to ${titleAr}`);
    }
    console.log("Database update complete!");
  } catch (err) {
    console.error(err);
  }
}
main();
