'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { formatWhatsAppNumber } from '@/lib/utils';


// --- TELEGRAM CONFIG ---
const TG_TOKEN = process.env.TG_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;

async function sendTelegramNotification(booking: any) {
  try {
    if (!TG_TOKEN || !TG_CHAT_ID) return;

    // Clean phone for WhatsApp link: Ensure international format
    const cleanPhone = formatWhatsAppNumber(booking.phone);
    
    // Using HTML format as it's more stable than Markdown for special characters
    const htmlMessage = `
<b>🔔 طلب حجز جديد في مزار!</b>
━━━━━━━━━━━━━━
<b>👤 العميل:</b> ${booking.name}
<b>📱 هاتف:</b> ${booking.phone}
<b>👥 عدد الأشخاص:</b> ${booking.guestsCount ?? 1}
<b>🏠 الوحدة:</b> ${booking.studio} (ID: ${booking.apartmentId})
<b>📅 الفترة:</b> ${booking.checkIn} إلى ${booking.checkOut}
<b>⏰ التاريخ:</b> ${new Date().toLocaleString('ar-EG')}
━━━━━━━━━━━━━━
<b>💬 تواصل مع العميل واتساب:</b>
https://wa.me/${cleanPhone}
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: htmlMessage,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram response error:', errorText);
    } else {
      console.log('Telegram message sent successfully!');
    }
  } catch (error) {
    console.error('Telegram network error:', error);
  }
}

// --- BOOKINGS ---

export async function getFreshDbBookings(nonce?: string) {
  if (nonce) console.log(`[SYNC] Fetching fresh bookings with nonce: ${nonce}`);
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .not('id', 'is', null) // Bypasses exact-match caches
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error reading bookings:', error);
    return [];
  }

  // --- AUTO-CLEANUP: Delete expired pending requests ---
  // If a booking is still 'pending' and its check-in day has arrived, delete it.
  const today = new Date().toISOString().split('T')[0];
  const pendingStatuses = ['جديد', 'قيد المراجعة', 'pending', 'رد جديد'];
  
  const expiredIds = data
    .filter((b: any) => pendingStatuses.includes(b.status) && b.check_in < today)
    .map((b: any) => b.id);

  if (expiredIds.length > 0) {
    console.log(`[CLEANUP] Automatically deleting ${expiredIds.length} expired pending requests:`, expiredIds);
    // Hard delete from DB
    await supabase.from('bookings').delete().in('id', expiredIds);
    
    // Filter them out of the current result set
    return data
      .filter((b: any) => !expiredIds.includes(b.id))
      .map((b: any) => ({
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
        notes: b.notes,
        timestamp: b.timestamp,
      }));
  }

  return (data || []).map((b: any) => ({
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
    notes: b.notes,
    timestamp: b.timestamp,
  }));
}

export async function saveDbBooking(booking: any) {
  try {
    const newBooking = {
      ...booking,
      id: `#B-${Math.floor(1000 + Math.random() * 9000)}`,
      status: booking.status || 'رد جديد',
      timestamp: booking.timestamp || new Date().toISOString(),
    };

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      console.warn('⚠️ Database Offline: Simulate saving booking', newBooking.id);
      return newBooking; 
    }

    const { error } = await supabase.from('bookings').insert({
      id: newBooking.id,
      name: newBooking.name,
      phone: newBooking.phone,
      check_in: newBooking.checkIn,
      check_out: newBooking.checkOut,
      apartment_id: newBooking.apartmentId ?? null,
      studio: newBooking.studio ?? null,
      status: newBooking.status,
      payment_info: newBooking.paymentInfo ?? null,
      total_amount: newBooking.totalAmount ?? null,
      number_of_days: newBooking.numberOfDays ?? null,
      nationality: newBooking.nationality ?? null,
      id_number: newBooking.idNumber ?? null,
      commission: newBooking.commission ?? null,
      broker_name: newBooking.brokerName ?? null,
      client_status: newBooking.clientStatus || 'انتظار',
      guests_count: newBooking.guestsCount ?? 1,
      notes: newBooking.notes ?? null,
      timestamp: newBooking.timestamp,
    });
    if (error) throw error;

    // Send Telegram Alert to Admin (Awaiting to ensure delivery)
    try {
      await sendTelegramNotification(newBooking);
    } catch (err) {
      console.error('Telegram notification error:', err);
    }

    revalidatePath('/admin/dashboard/reports');
    return newBooking;
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
}

export async function updateDbBookingStatus(id: string, updates: any) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    console.warn('⚠️ Database Offline: Simulate updating booking status', id);
    return await getFreshDbBookings();
  }

  const patch: any = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.phone !== undefined) patch.phone = updates.phone;
  if (updates.checkIn !== undefined) patch.check_in = updates.checkIn;
  if (updates.checkOut !== undefined) patch.check_out = updates.checkOut;
  if (updates.studio !== undefined) patch.studio = updates.studio;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.apartmentId !== undefined) patch.apartment_id = updates.apartmentId;
  if (updates.paymentInfo !== undefined) patch.payment_info = updates.paymentInfo;
  if (updates.totalAmount !== undefined) patch.total_amount = updates.totalAmount;
  if (updates.numberOfDays !== undefined) patch.number_of_days = updates.numberOfDays;
  if (updates.nationality !== undefined) patch.nationality = updates.nationality;
  if (updates.idNumber !== undefined) patch.id_number = updates.idNumber;
  if (updates.commission !== undefined) patch.commission = updates.commission;
  if (updates.brokerName !== undefined) patch.broker_name = updates.brokerName;
  if (updates.clientStatus !== undefined) patch.client_status = updates.clientStatus;
  if (updates.guestsCount !== undefined) patch.guests_count = updates.guestsCount;
  if (updates.notes !== undefined) patch.notes = updates.notes;
  
  // ALWAYS update the timestamp on edit to ensure "Fresh First" sync logic works
  patch.timestamp = new Date().toISOString();

  const { data, error } = await supabase.from('bookings')
    .update(patch)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating booking:', error);
    throw error;
  }

  // If no rows were affected, the ID is probably wrong or doesn't exist in DB
  // Note: .update().eq() returns success even if 0 rows match. We must check.
  const affected = data ? data.length : 0;
  if (affected === 0) {
    console.error(`⚠️ Update FAILED: No record found with ID ${id}`);
    throw new Error(`لم يتم العثور على سجل بالرقم التعريف: ${id}`);
  }

  console.log(`✅ Successfully updated ${affected} row(s) for ID: ${id}`);
  
  // Revalidate to clear any server-side response cache
  revalidatePath('/admin/dashboard/reports');
  
  // Return the fresh data directly
  return await getFreshDbBookings(Date.now().toString());
}

export async function deleteDbBooking(id: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    console.warn('⚠️ Database Offline: Simulate deleting booking', id);
    return await getFreshDbBookings();
  }

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }

  console.log(`✅ Successfully deleted booking ID: ${id}`);
  
  // Revalidate to clear server-side cache
  revalidatePath('/admin/dashboard/reports');
  
  // Return the fresh data
  return await getFreshDbBookings(Date.now().toString());
}

export async function deleteDbBookingsByPhone(phone: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('phone', phone);

  if (error) {
    console.error('Error deleting bookings by phone:', error);
    throw error;
  }

  console.log(`✅ Successfully deleted all bookings for phone: ${phone}`);
  revalidatePath('/admin/dashboard/customers');
  revalidatePath('/admin/dashboard/reports');
  return await getFreshDbBookings(Date.now().toString());
}

// --- UNITS ---

export async function getDbUnits() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from('units').select('*').order('id', { ascending: true });
  if (error) {
    console.error('Error reading units:', error);
    return [];
  }

  return (data || []).map((u: any) => ({
    id: u.id,
    branch: u.branch,
    type: u.type,
    title: u.title,
    status: u.status,
    housekeeping: u.housekeeping,
    nextBooking: u.next_booking,
    description: u.description,
    images: u.images,
    video: u.video,
    features: u.features,
    originalPrice: u.original_price,
    price: u.price,
  }));
}

export async function updateDbUnitDetails(id: string, updates: any) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    console.warn('⚠️ Database Offline: Simulate updating unit', id);
    return await getDbUnits();
  }

  const patch: any = {};

  // Accept both raw db-like keys and app keys; normalize to DB columns.
  if (updates.branch !== undefined) patch.branch = updates.branch;
  if (updates.type !== undefined) patch.type = updates.type;
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.housekeeping !== undefined) patch.housekeeping = updates.housekeeping;
  if (updates.nextBooking !== undefined) patch.next_booking = updates.nextBooking;
  if (updates.next_booking !== undefined) patch.next_booking = updates.next_booking;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.images !== undefined) patch.images = updates.images;
  if (updates.video !== undefined) patch.video = updates.video;
  if (updates.features !== undefined) patch.features = updates.features;
  if (updates.originalPrice !== undefined) patch.original_price = updates.originalPrice;
  if (updates.original_price !== undefined) patch.original_price = updates.original_price;
  if (updates.price !== undefined) patch.price = updates.price;
  patch.updated_at = new Date().toISOString();
  const { error } = await supabase.from('units').upsert({ id, ...patch });
  if (error) {
    console.error('Error updating unit:', error);
    throw error;
  }

  return await getDbUnits();
}

// --- ADMIN ---

export async function verifyAdminAuth(username: string, pass: string) {
  try {
    const cleanUsername = username.trim();
    const cleanPass = pass.trim();
    
    console.log(`Login attempt for: ${cleanUsername}`);
    
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      console.warn('Database offline, using fallback authentication');
      // Fallback for demo: if no DB, check a default admin
      if (cleanUsername === 'admin' && cleanPass === 'mazar2026') {
        return { 
          success: true, 
          admin: { 
            id: 'fallback-admin', 
            username: 'admin', 
            name: 'Admin (Offline Mode)', 
            role: 'Super Admin' 
          } 
        };
      }
      return { success: false };
    }

    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', cleanUsername)
      .eq('password', cleanPass)
      .limit(1);
    if (error) throw error;

    const validAdmin = data?.[0];
    if (validAdmin) return { success: true, admin: validAdmin };
    return { success: false };
  } catch (error) {
    console.error('Error reading admins:', error);
    return { success: false };
  }
}

export async function getDbAdmins() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from('admins').select('*').order('role', { ascending: false });
  if (error) {
    console.error('Error getting admins:', error);
    return [];
  }
  return data || [];
}

export async function addDbAdmin(admin: any) {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
        console.warn('⚠️ Database Offline: Simulate adding admin');
        return { success: true, admin: { ...admin, id: `mock-${Date.now()}` } };
    }

    const newAdmin = { ...admin, id: `admin-${Date.now()}` };
    const { error } = await supabase.from('admins').insert(newAdmin);
    if (error) throw error;
    return { success: true, admin: newAdmin };
  } catch (error) {
    console.error('Error adding admin:', error);
    return { success: false };
  }
}

export async function updateDbAdmin(id: string, updates: any) {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return { success: false };

    const { error } = await supabase.from('admins').update(updates).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating admin:', error);
    return { success: false };
  }
}

export async function deleteDbAdmin(id: string) {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return { success: false };

    const { error } = await supabase.from('admins').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting admin:', error);
    return { success: false };
  }
}

// --- TRANSLATIONS (CMS) ---
import initialTranslations from '@/data/translations.json';

export async function getDbTranslations() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null; // Return null instead of old fallback

  const { data, error } = await supabase.from('translations').select('data').eq('id', 1).single();
  if (error || !data?.data) {
    if (error && error.code !== 'PGRST116') {
      console.error('Error reading translations:', error);
      return null; // Fail fast on real errors
    }
    return initialTranslations; // Only fallback if DB is empty but connected
  }
  return data.data;
}

export async function updateDbTranslations(newTranslations: any) {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
        console.warn('⚠️ Database Offline: Simulate saving translations');
        return { success: true };
    }

    const { error } = await supabase
      .from('translations')
      .upsert({ id: 1, data: newTranslations, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating translations:', error);
    return { success: false, error: 'Failed to save translations' };
  }
}

// --- HR: STAFF ---

export async function getDbStaff() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from('staff').select('*').order('name', { ascending: true });
  if (error) {
    console.error('Error reading staff:', error);
    return [];
  }
  return data || [];
}

export async function saveDbStaff(staff: any) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return staff;

  const { error } = await supabase.from('staff').upsert(staff);
  if (error) throw error;
  return staff;
}

export async function deleteDbStaff(id: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) throw error;
}

// --- HR: SALARIES ---

export async function getDbSalaries() {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase configuration missing on server');

  const { data, error } = await supabase.from('salaries').select('*').order('year', { ascending: false }).order('month', { ascending: false });
  if (error) {
    console.error('Error reading salaries:', error);
    throw error;
  }
  return data || [];
}

export async function saveDbSalary(salary: any) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return salary;

  const { error } = await supabase.from('salaries').upsert(salary);
  if (error) throw error;
  return salary;
}

export async function deleteDbSalary(id: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase.from('salaries').delete().eq('id', id);
  if (error) throw error;
}

// --- HR: VACATIONS ---

export async function getDbVacations() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from('vacations').select('*').order('start_date', { ascending: false });
  if (error) {
    console.error('Error reading vacations:', error);
    return [];
  }
  return (data || []).map((v: any) => ({
    id: v.id,
    staff_id: v.staff_id,
    start_date: v.start_date,
    end_date: v.end_date,
    type: v.status,
    notes: v.reason
  }));
}

export async function saveDbVacation(vacation: any) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return vacation;

  const dbData = {
    id: vacation.id,
    staff_id: vacation.staff_id,
    start_date: vacation.start_date,
    end_date: vacation.end_date,
    status: vacation.type,
    reason: vacation.notes
  };

  const { error } = await supabase.from('vacations').upsert(dbData);
  if (error) throw error;
  return vacation;
}

export async function deleteDbVacation(id: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase.from('vacations').delete().eq('id', id);
  if (error) throw error;
}

// --- EXPENSES ---

export async function getDbExpenses() {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase configuration missing on server');

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
  return data || [];
}

export async function saveDbExpense(expense: any) {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase configuration missing on server');

  const { error } = await supabase.from('expenses').insert([expense]);
  if (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
  
  revalidatePath('/admin/dashboard/reports');
  revalidatePath('/admin/dashboard/finance');
  return expense;
}

export async function deleteDbExpense(id: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
  
  revalidatePath('/admin/dashboard/reports');
  revalidatePath('/admin/dashboard/finance');
}

export async function updateDbExpense(id: string, updates: any) {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase configuration missing on server');

  const { error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
  
  revalidatePath('/admin/dashboard/reports');
  revalidatePath('/admin/dashboard/finance');
}


