import { NextRequest, NextResponse } from 'next/server';
import { getPublicSystemUnits, getPublicCategoryUnits } from '@/lib/data-init';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoriesOnly = searchParams.get('categories') === 'true';
    
    const units = categoriesOnly 
      ? await getPublicCategoryUnits()
      : await getPublicSystemUnits();

    return NextResponse.json(units);
  } catch (error) {
    console.error('[API /api/units] Error fetching units:', error);
    return NextResponse.json([], { status: 500 });
  }
}
