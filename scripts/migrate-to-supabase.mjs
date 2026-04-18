import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';

function req(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const SUPABASE_URL = req('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = req('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const root = process.cwd();

async function readJson(rel) {
  const p = path.join(root, rel);
  const raw = await fs.readFile(p, 'utf-8');
  return JSON.parse(raw);
}

async function migrateTranslations() {
  const data = await readJson('src/data/translations.json');
  const { error } = await supabase.from('translations').update({ data }).eq('id', 1);
  if (error) throw error;
  console.log('✓ translations migrated');
}

async function migrateAdmins() {
  const admins = await readJson('src/data/admins.json');
  if (!Array.isArray(admins) || admins.length === 0) {
    console.log('• no admins to migrate');
    return;
  }
  const { error } = await supabase.from('admins').upsert(admins, { onConflict: 'id' });
  if (error) throw error;
  console.log(`✓ admins migrated (${admins.length})`);
}

async function migrateUnits() {
  const units = await readJson('src/data/units.json');
  if (!Array.isArray(units) || units.length === 0) {
    console.log('• no units to migrate');
    return;
  }

  const rows = units.map((u) => ({
    id: u.id,
    branch: u.branch ?? null,
    type: u.type ?? null,
    title: u.title ?? null,
    status: u.status ?? null,
    housekeeping: u.housekeeping ?? null,
    next_booking: u.nextBooking ?? u.next_booking ?? null,
    description: u.description ?? null,
    images: u.images ?? null,
    video: u.video ?? null,
    features: u.features ?? null,
    original_price: u.originalPrice ?? u.original_price ?? null,
    price: u.price ?? null,
  }));

  const { error } = await supabase.from('units').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
  console.log(`✓ units migrated (${rows.length})`);
}

async function migrateBookings() {
  const bookings = await readJson('src/data/bookings.json');
  if (!Array.isArray(bookings) || bookings.length === 0) {
    console.log('• no bookings to migrate');
    return;
  }

  const rows = bookings.map((b) => ({
    id: b.id,
    name: b.name,
    phone: b.phone,
    check_in: b.checkIn,
    check_out: b.checkOut,
    apartment_id: b.apartmentId ?? null,
    studio: b.studio ?? null,
    status: b.status ?? 'رد جديد',
    payment_info: b.paymentInfo ?? null,
    total_amount: b.totalAmount ?? null,
    number_of_days: b.numberOfDays ?? null,
    timestamp: b.timestamp ?? new Date().toISOString(),
  }));

  const { error } = await supabase.from('bookings').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
  console.log(`✓ bookings migrated (${rows.length})`);
}

async function migrateUploads() {
  const dir = path.join(root, 'public', 'uploads');
  try {
    const names = await fs.readdir(dir);
    if (names.length === 0) {
      console.log('• no local uploads found');
      return;
    }

    for (const name of names) {
      const full = path.join(dir, name);
      const stat = await fs.stat(full);
      if (!stat.isFile()) continue;
      const file = await fs.readFile(full);
      const objectPath = name;

      const { error } = await supabase.storage.from('uploads').upload(objectPath, file, {
        upsert: false,
      });
      if (error) {
        // ignore duplicates
        if (String(error.message || '').toLowerCase().includes('already exists')) continue;
        throw error;
      }
    }
    console.log('✓ uploads migrated (public/uploads -> storage/uploads)');
  } catch {
    console.log('• uploads migration skipped (public/uploads not found)');
  }
}

async function main() {
  await migrateTranslations();
  await migrateAdmins();
  await migrateUnits();
  await migrateBookings();
  await migrateUploads();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

