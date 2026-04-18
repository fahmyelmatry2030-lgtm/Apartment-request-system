const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Simple dotenv parser
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim();
    }
});

const SUPABASE_URL = process.env.SUPABASE_URL || env['SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Dummy fallback images in case importing data.ts is hard in CJS
const mazar1Images = Array(20).fill('/images/Mazar%201%20Pictures/2026%201.jpeg');
const mazar2Images = Array(20).fill('/images/Mazar%202%20Pictures/1.jpeg');

const units = [
  {
    id: "s-single",
    branch: 1,
    type: "studio",
    title: { ar: "استوديو سنجل", en: "Single Studio" },
    description: { ar: "استوديو فندقي مريح مجهز بكافة الخدمات لقضاء إقامة هادئة.", en: "A comfortable hotel studio equipped with all services for a quiet stay." },
    images: mazar1Images.slice(0, 5),
    video: "/images/video/studio 1.mp4",
    features: { ar: ["تكييف", "واي فاي سريع", "شاشة سمارت", "مطبخ مجهز"], en: ["AC", "Fast WiFi", "Smart TV", "Equipped Kitchen"] },
    price: "150",
    status: "متاح"
  },
  {
    id: "s-double",
    branch: 1,
    type: "studio",
    title: { ar: "استوديو دبل", en: "Double Studio" },
    description: { ar: "استوديو فندقي واسع يناسب شخصين بأحدث التجهيزات العصرية.", en: "A spacious hotel studio suitable for two people with modern amenities." },
    images: mazar1Images.slice(5, 10),
    video: "/images/video/studio 2.mp4",
    features: { ar: ["سرير مزدوج", "تكييف", "واي فاي سريع", "دخول ذكي", "شاشة سمارت"], en: ["Double Bed", "AC", "Fast WiFi", "Smart Entry", "Smart TV"] },
    price: "200",
    status: "متاح"
  },
  {
    id: "s-triple",
    branch: 1,
    type: "studio",
    title: { ar: "استوديو تريبل", en: "Triple Studio" },
    description: { ar: "استوديو فندقي واسع جداً مجهز لثلاثة أشخاص بكل وسائل الراحة.", en: "A very spacious hotel studio equipped for three people with all comforts." },
    images: mazar2Images.slice(0, 5),
    video: "/images/video/studio 3.mp4",
    features: { ar: ["٣ أسرة فردية", "تكييف", "واي فاي سريع", "مطبخ مجهز"], en: ["3 Single Beds", "AC", "Fast WiFi", "Equipped Kitchen"] },
    price: "250",
    status: "متاح"
  },
  {
    id: "s-tworoom",
    branch: 1,
    type: "studio",
    title: { ar: "استوديو غرفتين", en: "Two-room Studio" },
    description: { ar: "استوديو عائلي فندقي مكون من غرفتين، خيار مثالي للعائلات.", en: "A family hotel studio consisting of two rooms, an ideal choice for families." },
    images: mazar2Images.slice(5, 10),
    video: "/images/video/studio 4.mp4",
    features: { ar: ["غرفتين", "تكييف", "دخول ذكي", "شاشة سمارت", "مطبخ مجهز"], en: ["Two Rooms", "AC", "Smart Entry", "Smart TV", "Equipped Kitchen"] },
    price: "350",
    status: "متاح"
  },
];

for (let i = 0; i < 3; i++) {
  units.push({
    id: `apt-${i + 1}`,
    branch: 1, 
    type: 'apartment',
    title: { ar: `شقة فندقية فاخرة ${i + 1}`, en: `Luxury Hotel Apartment ${i + 1}` },
    description: {
      ar: 'شقة فندقية واسعة متكاملة الخدمات للعائلات والباحثين عن الرقي في مدينة نصر.',
      en: 'Spacious hotel apartment with complete services for families and luxury seekers in Nasr City.'
    },
    images: mazar1Images.slice(0, 5), 
    video: `/images/video/studio 1.mp4`,
    features: {
      ar: ['غرفتين نوم', 'ريسبشن واسع', 'واي فاي فايبر', 'خدمة نظافة', 'موقف سيارات'],
      en: ['2 Bedrooms', 'Spacious Reception', 'Fiber WiFi', 'Housekeeping', 'Parking']
    },
    status: "متاح"
  });
}

(async () => {
    console.log('Connecting to Supabase...');
    
    // Check if table contains data
    const { data: existing, error: err } = await supabase.from('units').select('id');
    if (err) {
        console.error('Error fetching existing units:', err);
        process.exit(1);
    }
    
    console.log(`Found ${existing.length} existing units. Wiping out...`);
    if (existing.length > 0) {
        // Delete all
        const ids = existing.map(e => e.id);
        // Supabase allows deleting all by just using a match that covers everything, but let's delete by ids to be safe
        const chunks = [];
        for (let i = 0; i < ids.length; i += 10) {
            chunks.push(ids.slice(i, i + 10));
        }
        for (const chunk of chunks) {
            await supabase.from('units').delete().in('id', chunk);
        }
        console.log('Old units wiped out successfully.');
    }
    
    console.log('Inserting 7 new unified units...');
    for (const unit of units) {
         // Create the db object
         const dbUnit = {
            id: unit.id,
            branch: unit.branch,
            type: unit.type,
            title: unit.title,
            description: unit.description,
            images: unit.images,
            video: unit.video,
            features: unit.features,
            original_price: unit.price, // mapped to price property
            price: unit.price,
            status: unit.status,
            housekeeping: "نظيف",
            next_booking: "لا يوجد",
         };
         
         const { error: insertErr } = await supabase.from('units').upsert(dbUnit);
         if (insertErr) {
             console.error(`Failed to insert ${unit.id}:`, insertErr);
         } else {
             console.log(`Successfully inserted ${unit.id}`);
         }
    }
    
    console.log('Sync complete.');
    process.exit(0);
})();
