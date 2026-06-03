const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const formatDate = (dateStr) => {
  if (typeof dateStr !== 'string') return '';
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

async function main() {
  const { data: bookings, error: bError } = await supabase.from('bookings').select('*');
  const { data: units, error: uError } = await supabase.from('units').select('*');
  if (bError || uError) {
    console.error('DB Error:', bError || uError);
    return;
  }

  const mappedBookings = bookings.map((b) => ({
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
  }));

  // Target database unit IDs
  const testUnits = ['apt-1', 'apt-2', 'apt-3', 'b2-s7', 'b2-s11', 'b2-s9', 'b2-s12'];
  const years = [2025, 2026, 2027];
  
  console.log(`Analyzing ${mappedBookings.length} bookings for real unit IDs: ${testUnits.join(', ')}...`);

  for (const selectedUnit of testUnits) {
    const unitObj = units.find(u => u.id === selectedUnit);
    const unitPrice = unitObj?.price ? parseInt(unitObj.price.toString().replace(/[^0-9]/g, '')) || 0 : 0;
    
    console.log(`\nTesting Unit: ${selectedUnit} (Base Price: ${unitPrice})`);

    for (const selectedYear of years) {
      for (let selectedMonth = 0; selectedMonth < 12; selectedMonth++) {
        try {
          const filteredBookings = mappedBookings.map((b) => {
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
          const dataRows = filteredBookings.map((booking, i) => {
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

            // Verify row output fields
            const row = {
              no: i + 1,
              id: booking.id,
              date: booking.checkIn,
              name: booking.name,
              nationality: booking.nationality || '',
              idNumber: booking.idNumber || '',
              phone: booking.phone,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              days,
              pricePerNight,
              total,
              commission,
              brokerName: booking.brokerName || '',
              netValue,
              clientStatus,
              bookingManager: booking.bookingManager || '',
              paymentMethod: booking.paymentMethod || '',
              notes: notesVal,
              isCarriedOver: booking.isCarriedOver,
              hasData: true,
            };

            // Simulating JSX renders or operations that could crash
            formatDate(row.date);
            formatDate(row.checkIn);
            formatDate(row.checkOut);
            if (row.days === undefined || isNaN(row.days)) {
              throw new Error(`Invalid days for booking ID ${booking.id}`);
            }
            if (isNaN(row.pricePerNight) || !isFinite(row.pricePerNight)) {
              throw new Error(`Invalid pricePerNight for booking ID ${booking.id}: ${row.pricePerNight}`);
            }
            if (isNaN(row.total) || !isFinite(row.total)) {
              throw new Error(`Invalid total for booking ID ${booking.id}`);
            }
            if (isNaN(row.netValue) || !isFinite(row.netValue)) {
              throw new Error(`Invalid netValue for booking ID ${booking.id}`);
            }

            return row;
          });

          if (filteredBookings.length > 0) {
            console.log(`  - Year ${selectedYear}, Month ${MONTHS_AR[selectedMonth]}: Checked ${filteredBookings.length} bookings successfully.`);
          }
        } catch (err) {
          console.error(`❌ CRASH detected for Unit: ${selectedUnit}, Year: ${selectedYear}, Month: ${selectedMonth} (${MONTHS_AR[selectedMonth]}):`, err.message);
        }
      }
    }
  }
  console.log('\nAnalysis completed!');
}

main();
