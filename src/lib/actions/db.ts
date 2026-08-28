'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { formatWhatsAppNumber, normalizeDateString } from '@/lib/utils';


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

export async function sendSecurityTelegramAlert(username: string, details: string) {
  try {
    if (!TG_TOKEN || !TG_CHAT_ID) return;

    const htmlMessage = `
🚨 <b>تنبيه أمني: محاولة دخول إلى لوحة التحكم!</b>
━━━━━━━━━━━━━━
<b>👤 اسم المستخدم المحاول:</b> <code>${username}</code>
<b>⚠️ النتيجة:</b> محاولة دخول غير مصرح بها / خاطئة
<b>📝 التفاصيل:</b> ${details}
<b>⏰ التوقيت:</b> ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}
━━━━━━━━━━━━━━
<i>يرجى التاكد من سلامة الحسابات وكلمات المرور.</i>
    `.trim();

    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: htmlMessage,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Security alert Telegram network error:', error);
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
    .filter((b: any) => pendingStatuses.includes(b.status) && normalizeDateString(b.check_in) < today)
    .map((b: any) => b.id);

  if (expiredIds.length > 0) {
    console.log(`[CLEANUP] Automatically deleting ${expiredIds.length} expired pending requests:`, expiredIds);
    // Hard delete from DB
    await supabase.from('bookings').delete().in('id', expiredIds);
  }

  const detectPaymentStatus = (b: any) => {
    const noteStr = String(b.notes || '').trim().toLowerCase();
    const infoStr = String(b.payment_info || '').trim().toLowerCase();
    const combined = `${noteStr} ${infoStr}`;

    const cleanKeywords = ['حساب خالص', 'الحساب خالص', 'خالص', 'تم الدفع', 'تم السداد', 'مدفوع بالكامل'];
    const isExplicitlyClean = cleanKeywords.some(kw => combined.includes(kw));

    const debtKeywords = ['متبقي', 'باقي', 'باقى', 'علية', 'عليها', 'دين', 'مستحق', 'آجل', 'اجل', 'عقد'];
    const hasNumbers = /\d+/.test(noteStr);
    const hasDebtKeyword = debtKeywords.some(kw => combined.includes(kw));

    if (!isExplicitlyClean && (hasDebtKeyword || hasNumbers)) {
      return 'باقي';
    }

    if (isExplicitlyClean) {
      return 'خالص';
    }

    if (b.payment_status === 'باقي') return 'باقي';
    return 'خالص';
  };

  return data
    .filter((b: any) => !expiredIds.includes(b.id))
    .map((b: any) => {
      const totalAmount = Number(b.total_amount || 0);
      const days = Number(b.number_of_days || 0);

      return {
        id: b.id,
        name: b.name,
        phone: b.phone,
        checkIn: normalizeDateString(b.check_in),
        checkOut: normalizeDateString(b.check_out),
        apartmentId: b.apartment_id,
        studio: b.studio,
        status: b.status,
        paymentInfo: b.payment_info,
        paymentStatus: detectPaymentStatus(b),
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
        source: b.source || (String(b.payment_info || '').includes('[طلب') ? 'website' : 'manual'),
        isWebsiteBooking: b.is_website_booking ?? (String(b.payment_info || '').includes('[طلب') || b.status === 'جديد' || b.status === 'pending'),
        timestamp: b.timestamp,
      };
    });
}

export async function saveDbBooking(booking: any) {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      console.warn('⚠️ Database Offline: Simulate saving booking');
      return { success: true, data: [] };
    }

    const newBookingWithId = {
      ...booking,
      id: `B-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: booking.status || 'جديد',
      timestamp: booking.timestamp || new Date().toISOString(),
    };

    // Build insert object — exclude columns that may not exist in DB yet
    const insertData: any = {
      id: newBookingWithId.id,
      name: newBookingWithId.name,
      phone: newBookingWithId.phone,
      check_in: newBookingWithId.checkIn,
      check_out: newBookingWithId.checkOut,
      apartment_id: newBookingWithId.apartmentId ?? null,
      studio: newBookingWithId.studio ?? null,
      status: newBookingWithId.status,
      payment_info: newBookingWithId.paymentInfo ?? null,
      total_amount: newBookingWithId.totalAmount ?? null,
      number_of_days: newBookingWithId.numberOfDays ?? null,
      nationality: newBookingWithId.nationality ?? null,
      id_number: newBookingWithId.idNumber ?? null,
      commission: newBookingWithId.commission ?? null,
      broker_name: newBookingWithId.brokerName ?? null,
      client_status: newBookingWithId.clientStatus || 'انتظار',
      guests_count: newBookingWithId.guestsCount ?? 1,
      notes: newBookingWithId.notes ?? null,
      timestamp: newBookingWithId.timestamp,
    };

    // Append optional columns only if they have values (they may not exist in the DB schema yet)
    if (newBookingWithId.bookingManager) insertData.booking_manager = newBookingWithId.bookingManager;
    if (newBookingWithId.paymentMethod) insertData.payment_method = newBookingWithId.paymentMethod;

    let { error } = await supabase.from('bookings').insert(insertData);

    // Retry without optional columns if they don't exist in the schema
    const isSchemaError = error && (
      error.code === 'PGRST204' ||
      error.code === '42703' ||
      error.message?.toLowerCase().includes('schema cache') ||
      error.message?.toLowerCase().includes('booking_manager') ||
      error.message?.toLowerCase().includes('payment_method')
    );

    if (isSchemaError) {
      console.warn('Retrying insert without booking_manager/payment_method columns...');
      delete insertData.booking_manager;
      delete insertData.payment_method;
      // Preserve booking_manager/payment_method info in notes if they were provided
      const extras: string[] = [];
      if (newBookingWithId.bookingManager) extras.push(`مسئول الحجز: ${newBookingWithId.bookingManager}`);
      if (newBookingWithId.paymentMethod) extras.push(`طريقة الدفع: ${newBookingWithId.paymentMethod}`);
      if (extras.length > 0) {
        insertData.notes = [insertData.notes, ...extras].filter(Boolean).join(' | ');
      }
      const retry = await supabase.from('bookings').insert(insertData);
      error = retry.error;
    }

    if (error) {
      console.error('Supabase Insert Error:', error);
      return { success: false, error: error.message };
    }

    // Send Telegram Alert to Admin (Awaiting to ensure delivery)
    try {
      await sendTelegramNotification(newBookingWithId);
    } catch (err) {
      console.error('Telegram notification error:', err);
    }

    revalidatePath('/admin/dashboard/reports');
    const freshData = await getFreshDbBookings(Date.now().toString());
    return { success: true, data: freshData };
  } catch (error: any) {
    console.error('Error saving booking:', error);
    return { success: false, error: error.message || 'Unknown error' };
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
  if (updates.paymentStatus !== undefined) {
    patch.payment_status = updates.paymentStatus;
    patch.payment_info = updates.paymentStatus;
  }
  if (updates.totalAmount !== undefined) patch.total_amount = updates.totalAmount;
  if (updates.numberOfDays !== undefined) patch.number_of_days = updates.numberOfDays;
  if (updates.nationality !== undefined) patch.nationality = updates.nationality;
  if (updates.idNumber !== undefined) patch.id_number = updates.idNumber;
  if (updates.commission !== undefined) patch.commission = updates.commission;
  if (updates.brokerName !== undefined) patch.broker_name = updates.brokerName;
  if (updates.clientStatus !== undefined) patch.client_status = updates.clientStatus;
  if (updates.guestsCount !== undefined) patch.guests_count = updates.guestsCount;
  // booking_manager, payment_method & payment_status: try to include, will be stripped on retry if columns don't exist
  if (updates.bookingManager !== undefined) patch.booking_manager = updates.bookingManager;
  if (updates.paymentMethod !== undefined) patch.payment_method = updates.paymentMethod;
  if (updates.notes !== undefined) patch.notes = updates.notes;
  
  // ALWAYS update the timestamp on edit to ensure "Fresh First" sync logic works
  patch.timestamp = new Date().toISOString();

  let { data, error } = await supabase.from('bookings')
    .update(patch)
    .eq('id', id)
    .select();

  // Retry without optional columns if they don't exist in the schema
  const isSchemaError = error && (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    error.message?.toLowerCase().includes('schema cache') ||
    error.message?.toLowerCase().includes('booking_manager') ||
    error.message?.toLowerCase().includes('payment_method') ||
    error.message?.toLowerCase().includes('payment_status')
  );

  if (isSchemaError) {
    console.warn('Retrying update without optional columns...');
    delete patch.booking_manager;
    delete patch.payment_method;
    delete patch.payment_status;
    if (updates.paymentStatus !== undefined) {
      patch.payment_info = updates.paymentStatus;
    }
    const retry = await supabase.from('bookings')
      .update(patch)
      .eq('id', id)
      .select();
    data = retry.data;
    error = retry.error;
  }

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

export async function deleteAllPendingDbBookings() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const pendingStatuses = ['جديد', 'طلب جديد', 'قيد المراجعة', 'pending', 'رد جديد', 'في الانتظار', 'بانتظار التأكيد'];
  const { error } = await supabase
    .from('bookings')
    .delete()
    .in('status', pendingStatuses);

  if (error) {
    console.error('Error deleting pending bookings:', error);
  } else {
    console.log('✅ Successfully deleted all pending/dummy bookings from DB');
  }

  revalidatePath('/admin/dashboard');
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

    // Keep the partner login independent from the admin database.
    if (['akoura', 'aura', 'أورا', 'اورا', 'koura', 'كورة'].includes(cleanUsername.toLowerCase()) && (cleanPass === 'akoura2026' || cleanPass === 'aura2026')) {
      return {
        success: true,
        admin: {
          id: 'akoura-admin',
          username: 'Akoura',
          name: 'أورا (مزار 3)',
          role: 'Akoura'
        }
      };
    }

    const fixedAdmins: Record<string, { username: string; name: string; role: string; password: string }> = {
      owner: { username: 'Owner', name: 'Owner', role: 'Owner', password: 'Owner50' },
      admin: { username: 'Admin', name: 'Admin', role: 'Admin', password: 'Admin220' },
      moderator: { username: 'Moderator', name: 'Moderator', role: 'Moderator', password: 'Moderator90' },
      mohsen: { username: 'Mohsen', name: 'Mohsen', role: 'Mohsen', password: 'Mohsen 55' },
      akoura: { username: 'Akoura', name: 'أورا (مزار 3)', role: 'Akoura', password: 'akoura2026' },
      aura: { username: 'Akoura', name: 'أورا (مزار 3)', role: 'Akoura', password: 'akoura2026' },
      koura: { username: 'Akoura', name: 'أورا (مزار 3)', role: 'Akoura', password: 'akoura2026' },
    };
    const fixedAdmin = fixedAdmins[cleanUsername.toLowerCase()];
    if (fixedAdmin && fixedAdmin.password === cleanPass) {
      const { password, ...admin } = fixedAdmin;
      return { success: true, admin: { id: `fixed-${admin.role.toLowerCase()}`, ...admin } };
    }
    
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
    if (error) {
      console.error('Supabase error during admin auth:', error);
      throw error;
    }

    const validAdmin = data?.[0];
    if (validAdmin) return { success: true, admin: validAdmin };

    // Send security alert to Telegram on failed login attempt
    await sendSecurityTelegramAlert(cleanUsername, 'محاولة دخول فاشلة - كلمة المرور أو اسم المستخدم غير صحيح.');

    return { success: false };
  } catch (error) {
    console.error('Error reading admins:', error);
    await sendSecurityTelegramAlert(username || 'غير محدد', 'خطأ أثناء فحص بيانات الدخول في النظام.');
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

  // --- SMART CATEGORIZATION: Link to Expenses ---
  // If a salary is marked as 'paid', automatically record it as an expense
  if (salary.payment_status === 'paid') {
    try {
      const staffList = await getDbStaff();
      const staffMember = staffList.find((s: any) => s.id === salary.staff_id);
      const expenseDesc = `راتب شهر ${salary.month}/${salary.year} - الموظف: ${staffMember?.name || 'مجهول'}`;
      
      // Check if this expense already exists to avoid duplicates on multiple saves
      const { data: existingExpenses } = await supabase
        .from('expenses')
        .select('id')
        .eq('description', expenseDesc)
        .limit(1);

      if (!existingExpenses || existingExpenses.length === 0) {
        const expenseData = {
          category: 'رواتب',
          amount: Number(salary.net_salary),
          date: new Date().toISOString().split('T')[0],
          description: expenseDesc,
          from_entity: 'الخزينة الرئيسية',
          to_entity: staffMember?.name || 'موظف',
          ordered_by: 'النظام الآلي'
        };
        
        await saveDbExpense(expenseData);
      }
    } catch (err) {
      console.error('Failed to auto-categorize salary as expense:', err);
    }
  }

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

  // Auto-generate invoice number if empty
  if (!expense.invoice_number || expense.invoice_number.trim() === '') {
    try {
      const { count } = await supabase.from('expenses').select('*', { count: 'exact', head: true });
      const nextNum = (count || 0) + 1;
      expense.invoice_number = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;
    } catch (e) {
      expense.invoice_number = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
  }

  const { error } = await supabase.from('expenses').insert([expense]);
  if (error) {
    if (error.message?.includes('invoice_number') || error.code === '42703') {
      console.warn('⚠️ Column "invoice_number" not found in DB table. Retrying with fallback...');
      const fallbackExpense = { ...expense };
      delete fallbackExpense.invoice_number;
      if (expense.invoice_number) {
        fallbackExpense.description = `[فاتورة: ${expense.invoice_number}] ${expense.description || ''}`.trim();
      }
      const { error: retryError } = await supabase.from('expenses').insert([fallbackExpense]);
      if (retryError) {
        console.error('Error saving expense on fallback retry:', retryError);
        throw retryError;
      }
    } else {
      console.error('Error saving expense:', error);
      throw error;
    }
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
    if (error.message?.includes('invoice_number') || error.code === '42703') {
      console.warn('⚠️ Column "invoice_number" not found in DB table on update. Retrying with fallback...');
      const fallbackUpdates = { ...updates };
      delete fallbackUpdates.invoice_number;
      if (updates.invoice_number) {
        fallbackUpdates.description = `[فاتورة: ${updates.invoice_number}] ${updates.description || ''}`.trim();
      }
      const { error: retryError } = await supabase
        .from('expenses')
        .update(fallbackUpdates)
        .eq('id', id);
      if (retryError) {
        console.error('Error updating expense on fallback retry:', retryError);
        throw retryError;
      }
    } else {
      console.error('Error updating expense:', error);
      throw error;
    }
  }
  
  revalidatePath('/admin/dashboard/reports');
  revalidatePath('/admin/dashboard/finance');
}

// --- TREASURY TRANSFERS ---

function isTableMissingError(error: any) {
  if (!error) return false;

  const errorText = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`.toLowerCase();
  return (
    error.code === '42P01' ||
    error.code === 'PGRST301' ||
    error.code === 'PGRST205' ||
    (errorText.includes('treasury_transfers') &&
      (errorText.includes('does not exist') || errorText.includes('relation') || errorText.includes('not found')))
  );
}

export async function getDbTreasuryTransfers() {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase configuration missing on server');

  const { data, error } = await supabase
    .from('treasury_transfers')
    .select('*')
    .order('transfer_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    if (isTableMissingError(error)) {
      console.warn('⚠️ Treasury table is not yet present in Supabase. Returning empty transfer list.');
      return [];
    }
    throw error;
  }

  return data || [];
}

export async function saveDbTreasuryTransfer(transfer: any) {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase configuration missing on server');

  const row = {
    amount: Number(transfer.amount) || 0,
    handed_by: String(transfer.handed_by || '').trim(),
    received_by: String(transfer.received_by || '').trim(),
    transfer_date: transfer.transfer_date || new Date().toISOString().slice(0, 10),
  };

  const { data, error } = await supabase.from('treasury_transfers').insert([row]).select().single();
  if (error) {
    if (isTableMissingError(error)) {
      throw new Error('جدول treasury_transfers غير موجود في Supabase. يرجى تطبيقه أولاً في قاعدة البيانات.');
    }
    throw error;
  }

  revalidatePath('/admin/dashboard/treasury');
  return data;
}

export async function deleteDbTreasuryTransfer(id: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase configuration missing on server');

  const { error } = await supabase.from('treasury_transfers').delete().eq('id', id);
  if (error) {
    if (isTableMissingError(error)) {
      throw new Error('جدول treasury_transfers غير موجود في Supabase. يرجى تطبيقه أولاً في قاعدة البيانات.');
    }
    throw error;
  }
  revalidatePath('/admin/dashboard/treasury');
}


