// Exactly simulates the React component's render path for the operational tab
// to identify what crashes in the browser

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: rawBookings, error: bErr } = await supabase.from('bookings').select('*').not('id', 'is', null).order('timestamp', { ascending: false });
  const { data: rawUnits, error: uErr } = await supabase.from('units').select('*').order('id', { ascending: true });

  if (bErr || uErr) { console.error('DB error', bErr || uErr); return; }

  // Simulate getFreshDbBookings() - check if auto-cleanup branch is triggered
  const today = new Date().toISOString().split('T')[0];
  const pendingStatuses = ['جديد', 'قيد المراجعة', 'pending', 'رد جديد'];
  const expiredIds = rawBookings
    .filter(b => pendingStatuses.includes(b.status) && b.check_in < today)
    .map(b => b.id);

  console.log(`=== EXPIRED PENDING BOOKINGS: ${expiredIds.length} ===`);
  if (expiredIds.length > 0) {
    console.log('⚠️ EXPIRED IDs (would trigger cleanup branch):', expiredIds);
    console.log('THIS MEANS THE FIRST RETURN PATH IS USED (missing pricePerNight, bookingManager, paymentMethod)');
  } else {
    console.log('✅ No expired pending bookings — normal return path used');
  }

  // Map bookings the same way getFreshDbBookings does (normal path)
  const bookings = rawBookings.map(b => {
    const totalAmount = Number(b.total_amount || 0);
    const days = Number(b.number_of_days || 0);
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
      totalAmount,
      numberOfDays: days,
      pricePerNight: days > 0 ? (totalAmount / days) : 0,
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

  // Simulate getDbUnits()
  const units = rawUnits
    .filter(u => {
      if (u.type === 'studio') {
        const titleMatch = u.title?.ar?.match(/(25|26|27|28|29|30)/);
        const idMatch = String(u.id).match(/s(25|26|27|28|29|30)$/);
        if (titleMatch || idMatch) return false;
      }
      return true;
    })
    .map(u => ({
      id: u.id, branch: u.branch, type: u.type, title: u.title,
      status: u.status, housekeeping: u.housekeeping,
      nextBooking: u.next_booking, description: u.description,
      images: u.images, video: u.video, features: u.features,
      originalPrice: u.original_price, price: u.price,
    }));

  // Test the problematic units
  const testUnits = ['b2-s7', 'b2-s9', 'b2-s11', 'b2-s12', 'apt-1', 'apt-2', 'apt-3'];
  const selectedMonth = new Date().getMonth(); // Current month (0-indexed)
  const selectedYear = new Date().getFullYear();

  console.log(`\n=== Testing for ${selectedMonth + 1}/${selectedYear} ===`);

  for (const selectedUnit of testUnits) {
    try {
      // Exactly matches the page.tsx filteredBookings logic (lines 515-542)
      const filteredBookings = bookings.map(b => {
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
      }).filter(b => {
        if (!b.matches) return false;
        if (b.status === 'deleted') return false;
        const isApproved = b.status === 'approved' || b.status === 'مؤكد';
        if (!isApproved) return false;
        if (b.apartmentId !== selectedUnit) return false;
        return true;
      });

      const currentUnit = units.find(u => u.id === selectedUnit);
      const unitPrice = currentUnit?.price ? parseInt(currentUnit.price.toString().replace(/[^0-9]/g, '')) || 0 : 0;

      // safeNum function from page.tsx
      const safeNum = v => {
        if (v === null || v === undefined) return 0;
        if (typeof v === 'number') return v;
        const clean = String(v).replace(/[^0-9.-]/g, '');
        const n = Number(clean);
        return isNaN(n) ? 0 : n;
      };

      // Totals calculation (lines 557-574)
      const totals = filteredBookings.reduce((acc, b) => {
        if (b.isCarriedOver) return acc;
        const days = safeNum(b.numberOfDays);
        const total = safeNum(b.totalAmount);
        const commission = safeNum(b.commission);
        const netValue = total - commission;
        return {
          days: safeNum(acc.days) + days,
          total: safeNum(acc.total) + total,
          commission: safeNum(acc.commission) + commission,
          netValue: safeNum(acc.netValue) + netValue,
        };
      }, { days: 0, total: 0, commission: 0, netValue: 0 });

      // Build dataRows (lines 577-648)
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

        return {
          no: i + 1, id: booking.id, date: booking.checkIn,
          name: booking.name, nationality: booking.nationality || '',
          idNumber: booking.idNumber || '', phone: booking.phone,
          checkIn: booking.checkIn, checkOut: booking.checkOut,
          days, pricePerNight, total, commission,
          brokerName: booking.brokerName || '', netValue, clientStatus,
          bookingManager: booking.bookingManager || '',
          paymentMethod: booking.paymentMethod || '',
          notes: typeof booking.notes === 'string' ? booking.notes.replace(/خصم بقيمة \d+/, '').trim() : '',
          isCarriedOver: booking.isCarriedOver, hasData: true,
        };
      });

      // Test toLocaleString calls (this is what renders in JSX)
      try {
        totals.total.toLocaleString();
        totals.commission.toLocaleString();
        totals.netValue.toLocaleString();
      } catch (e) {
        console.error(`❌ toLocaleString crash for ${selectedUnit}:`, e.message);
      }

      // Test formatDate on all rows
      const formatDate = (dateStr) => {
        if (typeof dateStr !== 'string') return '';
        if (!dateStr || !dateStr.includes('-')) return dateStr;
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
      };

      for (const row of dataRows) {
        // Simulate what the JSX does
        formatDate(row.date);
        formatDate(row.checkIn);
        formatDate(row.checkOut);
        String(row.no).padStart(2, '0'); // line 1103
        
        // Check for any NaN or undefined that would crash rendering
        if (typeof row.pricePerNight !== 'number' || !isFinite(row.pricePerNight)) {
          console.error(`❌ Invalid pricePerNight: ${row.pricePerNight} for booking ${row.id} in unit ${selectedUnit}`);
        }
        if (typeof row.total !== 'number' || !isFinite(row.total)) {
          console.error(`❌ Invalid total: ${row.total} for booking ${row.id} in unit ${selectedUnit}`);
        }
        if (typeof row.netValue !== 'number' || !isFinite(row.netValue)) {
          console.error(`❌ Invalid netValue: ${row.netValue} for booking ${row.id} in unit ${selectedUnit}`);
        }
      }

      console.log(`✅ ${selectedUnit}: ${filteredBookings.length} bookings, totals OK (total=${totals.total}, commission=${totals.commission}, net=${totals.netValue})`);
    } catch (err) {
      console.error(`❌ CRASH for ${selectedUnit}:`, err.message, err.stack);
    }
  }

  // Also test ALL bookings for any anomalous fields
  console.log('\n=== Checking ALL bookings for anomalous data ===');
  let anomalyCount = 0;
  for (const b of bookings) {
    if (b.checkIn && typeof b.checkIn !== 'string') {
      console.error(`❌ Booking ${b.id}: checkIn is not string: ${typeof b.checkIn} = ${b.checkIn}`);
      anomalyCount++;
    }
    if (b.checkOut && typeof b.checkOut !== 'string') {
      console.error(`❌ Booking ${b.id}: checkOut is not string: ${typeof b.checkOut} = ${b.checkOut}`);
      anomalyCount++;
    }
    if (b.notes !== null && b.notes !== undefined && typeof b.notes !== 'string') {
      console.error(`❌ Booking ${b.id}: notes is not string: ${typeof b.notes} = ${JSON.stringify(b.notes)}`);
      anomalyCount++;
    }
    if (typeof b.totalAmount !== 'number') {
      console.error(`❌ Booking ${b.id}: totalAmount is not number: ${typeof b.totalAmount} = ${b.totalAmount}`);
      anomalyCount++;
    }
  }
  if (anomalyCount === 0) {
    console.log('✅ No data anomalies found in any bookings');
  }
}

main().catch(err => console.error('FATAL:', err));
