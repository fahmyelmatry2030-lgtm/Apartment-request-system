const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const { data: bookings, error: bError } = await supabase.from('bookings').select('*');
    const { data: units, error: uError } = await supabase.from('units').select('*');
    if (bError || uError) throw new Error('DB error');

    const mappedBookings = bookings.map((b) => {
      return {
        id: b.id,
        name: b.name,
        phone: b.phone,
        checkIn: b.check_in,
        checkOut: b.check_out,
        apartmentId: b.apartment_id,
        studio: b.studio,
        status: b.status,
        paymentInfo: b.payment_info,
        totalAmount: Number(b.total_amount || 0),
        numberOfDays: Number(b.number_of_days || 0),
        pricePerNight: Number(b.number_of_days || 0) > 0 ? (Number(b.total_amount || 0) / Number(b.number_of_days || 0)) : 0,
        nationality: b.nationality,
        idNumber: b.id_number,
        commission: Number(b.commission || 0),
        brokerName: b.broker_name,
        guestsCount: Number(b.guests_count || 1),
        clientStatus: b.client_status || 'انتظار',
        bookingManager: b.booking_manager || '',
        paymentMethod: b.payment_method || '',
        notes: b.notes,
        timestamp: b.timestamp,
      };
    });

    console.log("Units loaded: ", units.length);

    for (const unit of units) {
      const selectedUnit = unit.id;
      for (let selectedMonth = 0; selectedMonth < 12; selectedMonth++) {
        const selectedYear = 2026;

        const filteredBookings = mappedBookings.map((b) => {
          if (selectedMonth === -1 || selectedYear === -1) return { ...b, matches: false };
          
          const partsIn = b.checkIn?.split('-');
          const partsOut = b.checkOut?.split('-');
          if (!partsIn || partsIn.length < 2 || !partsOut || partsOut.length < 2) return { ...b, matches: false };
          
          const checkInYear = parseInt(partsIn[0], 10);
          const checkInMonth = parseInt(partsIn[1], 10) - 1;
          const checkOutYear = parseInt(partsOut[0], 10);
          const checkOutMonth = parseInt(partsOut[1], 10) - 1;
          
          const inVal = checkInYear * 12 + checkInMonth;
          const outVal = checkOutYear * 12 + checkOutMonth;
          const selVal = selectedYear * 12 + selectedMonth;
          
          const isCarriedOver = selVal > inVal;
          const matches = selVal >= inVal && selVal <= outVal;
          
          return { ...b, isCarriedOver, matches };
        }).filter((b) => {
          if (!b.matches) return false;
          if (b.status === 'deleted') return false;
          const isApproved = b.status === 'approved' || b.status === 'مؤكد';
          if (!isApproved) return false;
          if (b.apartmentId !== selectedUnit) return false;
          return true;
        });

        // Run dataRows mapping
        const unitPrice = unit.price ? parseInt(unit.price.toString().replace(/[^0-9]/g, '')) || 0 : 0;

        filteredBookings.map((booking, i) => {
          const days = booking.numberOfDays || 0;
          let pricePerNight = unitPrice;
          if (days > 0 && booking.totalAmount !== undefined && booking.totalAmount !== null) {
            pricePerNight = booking.totalAmount / days;
          }

          const total = booking.totalAmount || (days * pricePerNight);
          const commission = booking.commission || 0;
          const netValue = total - commission;

          let rawStatus = String(booking.clientStatus || 'انتظار').trim();
          let clientStatus = rawStatus;

          if (booking.checkIn && booking.checkOut) {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const todayStr = `${y}-${m}-${d}`;
            const currentHour = now.getHours();

            const checkInStr = String(booking.checkIn || '').trim();
            const checkOutStr = String(booking.checkOut || '').trim();

            if (rawStatus === 'انتظار' || !rawStatus) {
              if (todayStr > checkOutStr || (todayStr === checkOutStr && currentHour >= 12)) {
                clientStatus = 'غادر';
              } else if (todayStr > checkInStr || (todayStr === checkInStr && currentHour >= 14)) {
                clientStatus = 'متواجد';
              }
            } else if (rawStatus === 'متواجد') {
              if (todayStr > checkOutStr || (todayStr === checkOutStr && currentHour >= 12)) {
                clientStatus = 'غادر';
              }
            }
          }

          const notesVal = typeof booking.notes === 'string' ? booking.notes.replace(/خصم بقيمة \d+/, '').trim() : '';

          return {
            no: i + 1,
            id: booking.id,
            notes: notesVal
          };
        });
      }
    }
    console.log("No error during dataRows execution on all units!");
  } catch (err) {
    console.error("CRASH FOUND:", err);
  }
}
main();
