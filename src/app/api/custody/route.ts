import { NextRequest, NextResponse } from 'next/server';
import { initialCustodyData, CustodyDataStore } from '@/lib/custody-data';
import { getDbCustody, updateDbCustody } from '@/lib/actions/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CUSTODY_FILE_PATH = path.join(process.cwd(), 'custody_data.json');

// Helper to read custody data
async function readCustodyStore(): Promise<CustodyDataStore> {
  // 1. Try reading from Supabase DB first
  try {
    const dbStore = await getDbCustody();
    if (dbStore && dbStore.sections) {
      return dbStore;
    }
  } catch (e) {
    console.warn('⚠️ Custody API: Failed to read from Supabase DB, falling back to disk', e);
  }

  // 2. Fallback to reading disk file
  try {
    if (fs.existsSync(CUSTODY_FILE_PATH)) {
      const raw = fs.readFileSync(CUSTODY_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.sections) {
        return data;
      }
    }
  } catch (err) {
    console.warn('⚠️ Custody API: Failed to read custody_data.json', err);
  }

  return initialCustodyData;
}

// Helper to write custody data
async function writeCustodyStore(data: CustodyDataStore): Promise<boolean> {
  let diskSuccess = false;
  try {
    fs.writeFileSync(CUSTODY_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    diskSuccess = true;
  } catch (err) {
    console.error('❌ Custody API: Failed to write custody_data.json:', err);
  }

  // Save to Supabase DB for permanent cloud persistence across server restarts
  try {
    await updateDbCustody(data);
  } catch (err) {
    console.error('❌ Custody API: Failed to save to Supabase DB:', err);
  }

  return true;
}

export async function GET() {
  try {
    const store = await readCustodyStore();
    return NextResponse.json(store);
  } catch (error) {
    console.error('[API /api/custody GET] Error:', error);
    return NextResponse.json(initialCustodyData, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newStore: CustodyDataStore = await req.json();
    if (!newStore || !newStore.sections) {
      return NextResponse.json({ error: 'Invalid custody data structure' }, { status: 400 });
    }

    await writeCustodyStore(newStore);
    return NextResponse.json({ success: true, data: newStore });
  } catch (error) {
    console.error('[API /api/custody POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
