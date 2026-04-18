
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- Checking Supabase Data ---');
    
    // Check Bookings
    const { data: bookings, error: bErr } = await supabase.from('bookings').select('*');
    if (bErr) console.error('Bookings Error:', bErr);
    else console.log(`Found ${bookings.length} bookings. Latest:`, bookings.slice(0, 2));

    // Check Units
    const { data: units, error: uErr } = await supabase.from('units').select('*');
    if (uErr) console.error('Units Error:', uErr);
    else console.log(`Found ${units.length} units.`);

    // Check Translations
    const { data: trans, error: tErr } = await supabase.from('translations').select('*');
    if (tErr) console.error('Translations Error:', tErr);
    else console.log(`Found ${trans ? 1 : 0} translation record in DB.`);
}

checkData();
