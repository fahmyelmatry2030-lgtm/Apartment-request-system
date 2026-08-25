import { NextRequest, NextResponse } from 'next/server';
import { initialCustodyData, CustodyDataStore } from '@/lib/custody-data';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CUSTODY_FILE_PATH = path.join(process.cwd(), 'custody_data.json');

// Helper to read custody data
function readCustodyStore(): CustodyDataStore {
  try {
    if (fs.existsSync(CUSTODY_FILE_PATH)) {
      const raw = fs.readFileSync(CUSTODY_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.sections) {
        return data;
      }
    }
  } catch (err) {
    console.warn('⚠️ Custody API: Failed to read custody_data.json, using initial defaults.', err);
  }
  return initialCustodyData;
}

// Helper to write custody data
function writeCustodyStore(data: CustodyDataStore): boolean {
  try {
    fs.writeFileSync(CUSTODY_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('❌ Custody API: Failed to write custody_data.json:', err);
    return false;
  }
}

export async function GET() {
  try {
    const store = readCustodyStore();
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

    const success = writeCustodyStore(newStore);
    if (!success) {
      return NextResponse.json({ error: 'Failed to write custody data to disk' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newStore });
  } catch (error) {
    console.error('[API /api/custody POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
