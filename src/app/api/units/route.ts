import { NextResponse } from 'next/server';
import { getPublicSystemUnits } from '@/lib/data-init';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const units = await getPublicSystemUnits();
    return NextResponse.json(units);
  } catch (error) {
    console.error('[API /api/units] Error fetching units:', error);
    return NextResponse.json([], { status: 500 });
  }
}
