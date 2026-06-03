import { NextRequest, NextResponse } from 'next/server';
import { getFreshDbBookings, saveDbBooking } from '@/lib/actions/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bookings = await getFreshDbBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('[API /api/bookings] Error fetching bookings:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json();
    const result = await saveDbBooking(bookingData);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to save booking' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /api/bookings POST] Error saving booking:', error);
    return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
  }
}
