"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getBookings, getSystemUnits } from '@/lib/data-init';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { updateDbBookingStatus } from '@/lib/actions/db';
import CustomerProfileModal from '@/components/CustomerProfileModal';
import { User, Phone, MessageSquare, FileText, Calendar, CheckCircle2, Home, X } from 'lucide-react';
import { formatWhatsAppNumber } from '@/lib/utils';

const CONFIRMED_STATUSES = ['مؤكد', 'approved', 'مؤكد/دخول', 'مغادر/تنظيف', 'مغادر/تم'];
const PENDING_STATUSES = ['جديد', 'قيد المراجعة', 'pending', 'رد جديد'];

export default function DashboardOverview() {
  const [newBookingToast, setNewBookingToast] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
  }, []);

  const [todaySchedule, setTodaySchedule] = useState<{in: any[], out: any[]}>({ in: [], out: [] });
  const [tomorrowPlans, setTomorrowPlans] = useState<{in: any[], out: any[]}>({ in: [], out: [] });
  const [nextDayPlans, setNextDayPlans] = useState<{in: any[], out: any[]}>({ in: [], out: [] });
  const [apartmentMap, setApartmentMap] = useState<any[]>([]);
  const [fullMap, setFullMap] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inventoryStats, setInventoryStats] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [adminRole, setAdminRole] = useState<string>('Admin');
  const router = useRouter();

  // Customer Profile Modal State
  const [profileModal, setProfileModal] = useState<{ isOpen: boolean; name: string | null; phone?: string | null }>({
    isOpen: false,
    name: null,
    phone: null,
  });

  // Note Viewer Modal State
  const [activeNoteModal, setActiveNoteModal] = useState<{ isOpen: boolean; text: string; title?: string }>({
    isOpen: false,
    text: '',
  });

  useEffect(() => {
    const info = sessionStorage.getItem('adminInfo');
    if (info) {
      const admin = JSON.parse(info);
      setAdminRole(admin.role);
    }
  }, []);

  const isPartner = adminRole === 'Partner';
  const isAkoura = adminRole === 'Akoura';

  const loadOverviewData = useCallback(async () => {
    setIsLoading(true);
    let bookings = await getBookings(Date.now().toString());
    let apts = await getSystemUnits();

    const currentRole = typeof window !== 'undefined'
      ? (JSON.parse(sessionStorage.getItem('adminInfo') || '{}')?.role || adminRole)
      : adminRole;
    const isCurrentAkoura = currentRole === 'Akoura';
    const isCurrentPartner = currentRole === 'Partner';

    if (isCurrentPartner || isCurrentAkoura) {
      apts = apts.filter((u: any) => u.branch === 3);
      const branch3Ids = apts.map((u: any) => u.id);
      bookings = bookings.filter((b: any) => branch3Ids.includes(b.apartmentId) || String(b.apartmentId).startsWith('p-s'));
    }

    apts = apts.filter((u: any) => !['s-single', 's-double', 's-triple', 's-tworoom'].includes(u.id));

    const targetDateStr = selectedDate;
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    const dayAfter = new Date(selectedDate);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    const confirmed = bookings.filter((b: any) => CONFIRMED_STATUSES.includes(b.status));

    const map = apts.map((apt: any) => {
      const targetDateStr = selectedDate;
      const aptBookings = confirmed.filter((b: any) => b.apartmentId === apt.id);
      
      const activeBooking = aptBookings.find((b: any) => targetDateStr >= b.checkIn && targetDateStr < b.checkOut);
      const outToday = aptBookings.find((b: any) => b.checkOut === targetDateStr);
      const inToday = aptBookings.find((b: any) => b.checkIn === targetDateStr);
      
      const pastBookings = aptBookings
        .filter((b: any) => b.checkOut <= targetDateStr)
        .sort((a: any, b: any) => b.checkOut.localeCompare(a.checkOut));
      const lastBooking = pastBookings[0];

      const upcomingBookings = aptBookings
        .filter((b: any) => b.checkIn > targetDateStr)
        .sort((a: any, b: any) => a.checkIn.localeCompare(b.checkIn));
      const nextBooking = upcomingBookings[0];

      let daysUntilNextBooking: number | null = null;
      if (nextBooking) {
        const nextCheckInDate = nextBooking.checkIn;
        const refDate = activeBooking ? activeBooking.checkOut : targetDateStr;
        const diffTime = new Date(nextCheckInDate).getTime() - new Date(refDate).getTime();
        daysUntilNextBooking = Math.round(diffTime / (1000 * 3600 * 24));
      }

      let isTurnover = !!outToday && !!inToday;
      let isCheckingOut = !!outToday && !inToday;
      let isCheckingIn = !!inToday && !outToday;

      const currentHour = new Date().getHours();
      
      if (currentHour >= 14) {
        if (isTurnover) {
          isTurnover = false;
          isCheckingIn = true;
        }
        if (isCheckingOut) {
          isCheckingOut = false;
        }
      }

      const cat = apt.id.startsWith('apt-') ? 'apartment' : apt.type || 'single';

      return {
        ...apt,
        category: cat,
        isOccupied: !!activeBooking || apt.status === 'مشغول',
        guest: activeBooking?.name,
        bookingId: activeBooking?.id,
        phone: activeBooking?.phone,
        clientStatus: activeBooking?.clientStatus || 'انتظار',
        checkOut: activeBooking?.checkOut,
        guestsCount: activeBooking?.guestsCount,
        lastCheckOut: lastBooking?.checkOut,
        upcomingBookingsCount: upcomingBookings.length,
        daysUntilNextBooking,
        isTurnover,
        notes: activeBooking?.notes || (outToday?.notes ? outToday.notes : inToday?.notes ? inToday.notes : ''),
        leavingNotes: outToday?.notes || '',
        arrivingNotes: inToday?.notes || '',
        leavingGuest: outToday?.name,
        leavingPhone: outToday?.phone,
        leavingBookingId: outToday?.id,
        leavingClientStatus: outToday?.clientStatus || 'انتظار',
        leavingCheckOut: outToday?.checkOut,
        arrivingGuest: inToday?.name,
        arrivingPhone: inToday?.phone,
        arrivingBookingId: inToday?.id,
        arrivingClientStatus: inToday?.clientStatus || 'انتظار',
        arrivingCheckOut: inToday?.checkOut,
        isCheckingOut,
        isCheckingIn,
      };
    });

    setFullMap(map);

    setInventoryStats([
      { id: 'single',   label: 'سنجل',    count: map.filter((u: any) => u.category === 'single' && !u.isOccupied).length, total: map.filter((u: any) => u.category === 'single').length, color: 'text-green-500'  },
      { id: 'double',   label: 'دبل',      count: map.filter((u: any) => u.category === 'double' && !u.isOccupied).length, total: map.filter((u: any) => u.category === 'double').length, color: 'text-blue-400'   },
      { id: 'triple',   label: 'تريبل',    count: map.filter((u: any) => u.category === 'triple' && !u.isOccupied).length, total: map.filter((u: any) => u.category === 'triple').length, color: 'text-orange-400' },
      { id: 'two-room', label: 'غرفتين',   count: map.filter((u: any) => u.category === 'two-room' && !u.isOccupied).length, total: map.filter((u: any) => u.category === 'two-room').length, color: 'text-purple-400' },
      { id: 'apartment', label: 'شقق',    count: map.filter((u: any) => u.category === 'apartment' && !u.isOccupied).length, total: map.filter((u: any) => u.category === 'apartment').length, color: 'text-amber-500' },
    ]);

    setAllBookings(bookings);

    setTodaySchedule({
      in:  confirmed.filter((b: any) => b.checkIn  === targetDateStr),
      out: confirmed.filter((b: any) => b.checkOut === targetDateStr),
    });
    setTomorrowPlans({
      in:  confirmed.filter((b: any) => b.checkIn  === nextDayStr),
      out: confirmed.filter((b: any) => b.checkOut === nextDayStr),
    });
    setNextDayPlans({
      in:  confirmed.filter((b: any) => b.checkIn  === dayAfterStr),
      out: confirmed.filter((b: any) => b.checkOut === dayAfterStr),
    });

    setLastUpdated(new Date());
    setIsLoading(false);
  }, [selectedDate, selectedCategory, adminRole]);

  useEffect(() => {
    loadOverviewData();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload: any) => {
        if (audioRef.current) audioRef.current.play().catch(() => {});
        setNewBookingToast(payload.new);
        loadOverviewData();
        setTimeout(() => setNewBookingToast(null), 8000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadOverviewData]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    if (!bookingId) return;
    try {
      await updateDbBookingStatus(bookingId, { clientStatus: newStatus });
      loadOverviewData();
    } catch (err) {
      alert('فشل تحديث الحالة.');
    }
  };

  const handleUnitClick = (apt: any) => {
    const d = new Date(selectedDate);
    const m = d.getMonth();
    const y = d.getFullYear();
    router.push(`/admin/dashboard/reports?unit=${apt.id}&month=${m}&year=${y}&tab=operational`);
  };

  const openCustomerProfile = (name: string, phone?: string) => {
    if (!name || name === '—') return;
    setProfileModal({
      isOpen: true,
      name,
      phone
    });
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">

      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black mb-1 tracking-tight text-[#2A2723]">
            الاستعراض <span className="text-[#C1A68D]">العام</span>
          </h1>
          <p className="text-[#7A7061] font-bold opacity-80 text-sm">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#EAE4D9]/50 px-4 py-2 rounded-full shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${isLoading ? 'bg-amber-400 animate-ping' : 'bg-green-500'}`} />
            <span className="text-xs font-black uppercase tracking-widest text-[#7A7061]">
              {isLoading ? 'جاري التحديث...' : `آخر تحديث: ${lastUpdated.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </div>
          <button
            onClick={loadOverviewData}
            className="w-10 h-10 bg-[#C1A68D]/10 hover:bg-[#C1A68D] text-[#C1A68D] hover:text-white rounded-full flex items-center justify-center transition-all border border-[#C1A68D]/30 shadow-sm"
            title="تحديث البيانات"
          >🔄</button>
        </div>
      </header>

      {/* ── REALTIME TOAST ── */}
      {newBookingToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#2A2723] border-2 border-green-400 p-5 rounded-2xl shadow-2xl animate-fade-in w-80">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-400/20 text-green-400 rounded-full flex items-center justify-center text-xl shrink-0 animate-pulse">🔔</div>
            <div>
              <h4 className="font-black text-white mb-1">طلب حجز جديد!</h4>
              <p className="text-xs text-gray-300 font-bold">من: {newBookingToast.name}</p>
              <p className="text-[10px] text-[#C1A68D] font-black mt-1">{newBookingToast.check_in} ← {newBookingToast.check_out}</p>
            </div>
          </div>
          <button onClick={() => setNewBookingToast(null)} className="absolute top-3 left-3 text-gray-500 hover:text-white text-xs font-bold">✕</button>
        </div>
      )}

      {/* ── FULL-WIDTH DAILY OPERATIONS SCHEDULE (جدول خطة الدخول والخروج تفصيلي بعرض الصفحة) ── */}
      <div className="bg-[#1F1C18] p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/10 text-white relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C1A68D]/20 border border-[#C1A68D]/30 flex items-center justify-center text-[#C1A68D]">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">جدول وخطة حركة الدخول والخروج اليومية</h3>
              <p className="text-xs text-gray-400 font-bold">التفاصيل الكاملة لعملاء اليوم وغداً اضغط على اسم العميل لعرض السجل الكامل</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-black">
              🛬 وصول اليوم: {todaySchedule.in.length}
            </span>
            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3.5 py-1.5 rounded-full text-xs font-black">
              🛫 مغادرة اليوم: {todaySchedule.out.length}
            </span>
          </div>
        </div>

        {/* Detailed Operations Grid */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* CHECK-INS TODAY */}
          <div className="bg-[#2A2723] rounded-2xl p-5 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-black text-sm text-emerald-400 flex items-center gap-2">
                🛬 حركات وصول اليوم ({todaySchedule.in.length})
              </span>
              <span className="text-[10px] text-gray-400 font-bold">سياسة الدخول: 02:00 ظهراً</span>
            </div>

            {todaySchedule.in.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6 font-bold">لا يوجد حالات وصول مسجلة لليوم</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar-horizontal pr-1">
                {todaySchedule.in.map((b: any, i: number) => {
                  const cleanP = formatWhatsAppNumber(b.phone);
                  return (
                    <div key={`in-${i}`} className="bg-[#1F1C18] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-emerald-500/40 transition-all">
                      <div className="space-y-1">
                        <button
                          onClick={() => openCustomerProfile(b.name, b.phone)}
                          className="text-base font-black text-white hover:text-[#C1A68D] transition-colors text-right flex items-center gap-1.5"
                        >
                          <User size={16} className="text-[#C1A68D]" />
                          <span>{b.name}</span>
                        </button>
                        <div className="flex items-center gap-3 text-xs text-gray-300 font-bold flex-wrap">
                          <span>🏠 الوحدة: <strong className="text-amber-400">{b.studio || b.apartmentId}</strong></span>
                          <span>📅 الفترة: <strong className="text-blue-300">{b.checkIn} ← {b.checkOut}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {b.totalAmount && (
                          <span className="bg-emerald-500/20 text-emerald-300 font-black text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30">
                            {b.totalAmount} ج.م
                          </span>
                        )}
                        {b.phone && (
                          <a
                            href={`https://wa.me/${cleanP}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-xs font-black flex items-center justify-center shadow"
                            title="تواصل واتساب"
                          >
                            <MessageSquare size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CHECK-OUTS TODAY */}
          <div className="bg-[#2A2723] rounded-2xl p-5 border border-rose-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-black text-sm text-rose-400 flex items-center gap-2">
                🛫 حركات مغادرة اليوم ({todaySchedule.out.length})
              </span>
              <span className="text-[10px] text-gray-400 font-bold">سياسة المغادرة: 12:00 ظهراً</span>
            </div>

            {todaySchedule.out.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6 font-bold">لا يوجد حالات مغادرة مسجلة لليوم</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar-horizontal pr-1">
                {todaySchedule.out.map((b: any, i: number) => {
                  const cleanP = formatWhatsAppNumber(b.phone);
                  return (
                    <div key={`out-${i}`} className="bg-[#1F1C18] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-rose-500/40 transition-all">
                      <div className="space-y-1">
                        <button
                          onClick={() => openCustomerProfile(b.name, b.phone)}
                          className="text-base font-black text-white hover:text-[#C1A68D] transition-colors text-right flex items-center gap-1.5"
                        >
                          <User size={16} className="text-[#C1A68D]" />
                          <span>{b.name}</span>
                        </button>
                        <div className="flex items-center gap-3 text-xs text-gray-300 font-bold flex-wrap">
                          <span>🏠 الوحدة: <strong className="text-amber-400">{b.studio || b.apartmentId}</strong></span>
                          <span>📅 خروج: <strong className="text-rose-300">{b.checkOut}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {b.totalAmount && (
                          <span className="bg-rose-500/20 text-rose-300 font-black text-xs px-3 py-1.5 rounded-xl border border-rose-500/30">
                            {b.totalAmount} ج.م
                          </span>
                        )}
                        {b.phone && (
                          <a
                            href={`https://wa.me/${cleanP}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-xs font-black flex items-center justify-center shadow"
                            title="تواصل واتساب"
                          >
                            <MessageSquare size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── UNIT INVENTORY TABLE & QUICK FILTERS ── */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm space-y-6">
        
        {/* Header Filters & Date Picker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EAE4D9]/40">
          <h4 className="font-black text-base text-[#2A2723]">
            {selectedCategory === 'all' ? '🗺️ جميع الوحدات والاستديوهات' : `🟢 وحدات ${inventoryStats.find(i => i.id === selectedCategory)?.label} المتاحة`}
          </h4>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="بحث عن ضيف أو وحدة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F8F5F0] border border-[#EAE4D9] rounded-xl px-9 py-2 text-xs font-black text-[#2A2723] focus:ring-2 focus:ring-[#C1A68D] transition-all outline-none w-48"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            </div>

            {/* Smart Date Navigator */}
            <div className="flex items-center gap-2 bg-white border border-[#EAE4D9] rounded-2xl px-3 py-1.5 shadow-sm">
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-lg"
              >◀️</button>
              
              <div className="relative group">
                <div className="flex flex-col items-center px-3 cursor-pointer">
                  <span className="text-[9px] font-black text-[#C1A68D] uppercase leading-none">تاريخ العرض</span>
                  <span className="text-xs font-black text-[#2A2723]">
                    {new Date(selectedDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                />
              </div>

              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-lg"
              >▶️</button>
            </div>

            {/* Category filters */}
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedCategory === 'all' ? 'bg-[#2A2723] text-white shadow-md' : 'bg-gray-50 text-[#7A7061] hover:bg-gray-100'}`}
              >الكل</button>
              {inventoryStats.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCategory(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedCategory === item.id ? 'bg-[#C1A68D] text-white shadow-md' : 'bg-gray-50 text-[#7A7061] hover:bg-gray-100'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Unit Table */}
        {(() => {
          const formatMiniDate = (d: string) => {
            if (!d || !d.includes('-')) return '—';
            const [y, m, day] = d.split('-');
            return `${day}/${m}`;
          };

          const displayList = apartmentMap.filter(apt => {
            if (!searchTerm) return true;
            const s = searchTerm.toLowerCase();
            const guestMatch = String(apt.guest || '').toLowerCase().includes(s);
            const idMatch = String(apt.id || '').toLowerCase().includes(s);
            const titleMatch = String(apt.title?.ar || '').toLowerCase().includes(s);
            const dateMatch = apt.checkOut?.includes(s) || (apt.checkOut && (() => {
              const [y, m, d] = apt.checkOut.split('-');
              return `${d}/${m}`.includes(s);
            })());
            return guestMatch || idMatch || titleMatch || dateMatch;
          });

          if (displayList.length === 0) {
            return <div className="h-40 flex items-center justify-center text-gray-300 animate-pulse font-black text-sm italic">لا يوجد وحدات مطابقة للبحث...</div>;
          }

          return (
            <div className="overflow-x-auto custom-scrollbar-horizontal pb-4">
              <table className="w-full min-w-[1100px] border-collapse text-right">
                <thead>
                  <tr className="bg-[#2A2723] text-white text-xs font-black">
                    <th className="px-4 py-4 text-center w-12">#</th>
                    <th className="px-4 py-4">اسم الوحدة</th>
                    <th className="px-4 py-4">النوع</th>
                    <th className="px-4 py-4 min-w-[180px]">اسم الضيف (اضغط للتفاصيل)</th>
                    <th className="px-4 py-4 min-w-[180px]">الملاحظات</th>
                    <th className="px-4 py-4 text-center">تاريخ الخروج</th>
                    <th className="px-4 py-4 text-center">حجوزات قادمة</th>
                    <th className="px-4 py-4 text-center">الحالة</th>
                    <th className="px-4 py-4">حالة الإقامة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE4D9]/40 text-xs">
                  {[...displayList]
                    .sort((a, b) => {
                      const n = (u: any) => {
                        const id = String(u.id);
                        if (id.startsWith('b1-s')) return parseInt(id.replace('b1-s',''),10);
                        if (id.startsWith('b2-s')) return parseInt(id.replace('b2-s',''),10)+12;
                        if (id.startsWith('p-s')) return parseInt(id.replace('p-s',''),10);
                        return 99;
                      };
                      return n(a) - n(b);
                    })
                    .map((apt) => {
                      const isB1 = String(apt.id).startsWith('b1-s');
                      const isB2 = String(apt.id).startsWith('b2-s');
                      const isPs = String(apt.id).startsWith('p-s');
                      const num = isB1 ? parseInt(apt.id.replace('b1-s',''),10) : isB2 ? parseInt(apt.id.replace('b2-s',''),10)+12 : isPs ? parseInt(apt.id.replace('p-s',''),10) : 0;
                      const rowBg = isB1 ? 'bg-blue-50/40 hover:bg-blue-50/80' : isB2 ? 'bg-emerald-50/40 hover:bg-emerald-50/80' : isPs ? 'bg-purple-50/40 hover:bg-purple-50/80' : 'bg-amber-50/40 hover:bg-amber-50/80';
                      const badgeColor = isB1 ? 'bg-blue-600 text-white' : isB2 ? 'bg-emerald-600 text-white' : isPs ? 'bg-purple-600 text-white' : 'bg-[#C1A68D] text-white';
                      const typeLabel: Record<string,string> = { single:'سنجل', double:'دبل', triple:'تريبل', 'two-room':'غرفتين', apartment:'شقة' };

                      return (
                        <tr key={apt.id} className={`${rowBg} transition-colors`}>
                          <td className="px-4 py-3 text-center">
                            <button 
                              onClick={() => handleUnitClick(apt)}
                              className={`${badgeColor} w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mx-auto hover:scale-110 transition-transform shadow-sm`}
                              title="عرض التقرير المالي"
                            >
                              {num}
                            </button>
                          </td>
                          <td className="px-4 py-3 font-black text-[#2A2723] text-xs md:text-sm">
                            <button 
                              onClick={() => handleUnitClick(apt)}
                              className="hover:text-[#C1A68D] transition-colors"
                            >
                              {apt.title?.ar || apt.id}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#7A7061] font-bold">{typeLabel[apt.category] || apt.category}</td>
                          
                          {/* GUEST NAME (PROMINENT, BOLD, CLICKABLE) */}
                          <td className="px-4 py-3 font-black text-sm text-[#2A2723]">
                            {apt.isTurnover ? (
                              <div className="flex flex-col gap-1.5 items-start justify-center">
                                <button
                                  onClick={() => openCustomerProfile(apt.leavingGuest, apt.leavingPhone)}
                                  className="text-rose-600 hover:underline font-black text-xs text-right truncate max-w-[160px]"
                                >
                                  🛫 {apt.leavingGuest}
                                </button>
                                <button
                                  onClick={() => openCustomerProfile(apt.arrivingGuest, apt.arrivingPhone)}
                                  className="text-blue-600 hover:underline font-black text-xs text-right truncate max-w-[160px]"
                                >
                                  🛬 {apt.arrivingGuest}
                                </button>
                              </div>
                            ) : apt.guest ? (
                              <button
                                onClick={() => openCustomerProfile(apt.guest, apt.phone)}
                                className="hover:text-[#C1A68D] text-[#2A2723] transition-colors flex items-center gap-1.5 font-black text-sm text-right"
                              >
                                <User size={15} className="text-[#C1A68D] shrink-0" />
                                <span>{apt.guest}</span>
                              </button>
                            ) : (
                              <span className="text-gray-300 font-normal">—</span>
                            )}
                          </td>

                          {/* NOTES COLUMN (EXPANDABLE ON CLICK) */}
                          <td className="px-4 py-3 text-xs font-bold text-[#7A7061] max-w-[220px]">
                            {apt.notes ? (
                              <button
                                onClick={() => setActiveNoteModal({ isOpen: true, text: apt.notes, title: `ملاحظات ${apt.title?.ar || apt.id}` })}
                                className="truncate block w-full text-right bg-amber-100/80 border border-amber-300/60 px-3 py-1.5 rounded-xl text-amber-900 font-bold hover:bg-amber-200/80 transition-all shadow-sm"
                                title="اضغط لقراءة الملاحظة كاملة"
                              >
                                📝 {apt.notes}
                              </button>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-xs text-center text-[#2A2723] font-black">
                            {apt.isTurnover ? (
                              <div className="flex flex-col gap-1 items-center justify-center">
                                <span className="text-rose-500">🛫 {formatMiniDate(apt.leavingCheckOut)}</span>
                                <span className="text-blue-600">🛬 {formatMiniDate(apt.arrivingCheckOut)}</span>
                              </div>
                            ) : apt.isOccupied ? (
                              <div className="flex flex-col items-center">
                                <span>{formatMiniDate(apt.checkOut)}</span>
                                {apt.daysUntilNextBooking !== null && apt.daysUntilNextBooking > 0 && (
                                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md mt-1 whitespace-nowrap shadow-sm">
                                    متاح {apt.daysUntilNextBooking} يوم حتى الحجز القادم
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                {apt.lastCheckOut ? <span className="text-gray-400 font-bold opacity-60">آخر: {formatMiniDate(apt.lastCheckOut)}</span> : <span>—</span>}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {apt.upcomingBookingsCount > 0 ? (
                              <span className="text-xs font-black text-white bg-blue-500 shadow-sm px-3 py-1 rounded-lg">
                                {apt.upcomingBookingsCount}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-gray-400">—</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-black px-3 py-1 rounded-full ${
                              apt.isTurnover ? 'bg-orange-500 text-white animate-pulse' :
                              apt.isCheckingOut ? 'bg-rose-100 text-rose-600' :
                              apt.isCheckingIn ? 'bg-blue-100 text-blue-600' :
                              apt.status === 'صيانة' ? 'bg-gray-100 text-gray-500' : 
                              apt.isOccupied ? 'bg-red-100 text-red-600' : 
                              'bg-green-100 text-green-700'
                            }`}>
                              {apt.isTurnover ? '🔄 تبديل' : 
                               apt.isCheckingOut ? '🛫 خروج اليوم' :
                               apt.isCheckingIn ? '🛬 وصول اليوم' :
                               apt.isOccupied ? 'مشغول' : 
                               apt.status === 'صيانة' ? 'صيانة' : 
                               'متاح'}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {apt.isTurnover ? (
                              <div className="flex flex-col gap-1.5 items-start">
                                <div className="flex items-center gap-1">
                                  <span className="text-rose-500 font-bold text-[10px]" title="النزيل المغادر">🛫</span>
                                  <select 
                                    disabled={isPartner || isAkoura}
                                    value={apt.leavingClientStatus} 
                                    onChange={(e) => handleStatusUpdate(apt.leavingBookingId, e.target.value)}
                                    className={`text-[10px] font-black rounded-lg px-2 py-0.5 outline-none border transition-all ${
                                      (isPartner || isAkoura) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                                    } ${
                                      apt.leavingClientStatus === 'متواجد' ? 'bg-green-600 text-white border-green-700' :
                                      apt.leavingClientStatus === 'غادر' ? 'bg-gray-600 text-white border-gray-700' :
                                      'bg-amber-100 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    <option value="انتظار">⏳ انتظار</option>
                                    <option value="متواجد">👤 متواجد</option>
                                    <option value="غادر">🚪 غادر</option>
                                  </select>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600 font-bold text-[10px]" title="النزيل القادم">🛬</span>
                                  <select 
                                    disabled={isPartner || isAkoura}
                                    value={apt.arrivingClientStatus} 
                                    onChange={(e) => handleStatusUpdate(apt.arrivingBookingId, e.target.value)}
                                    className={`text-[10px] font-black rounded-lg px-2 py-0.5 outline-none border transition-all ${
                                      (isPartner || isAkoura) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                                    } ${
                                      apt.arrivingClientStatus === 'متواجد' ? 'bg-green-600 text-white border-green-700' :
                                      apt.arrivingClientStatus === 'غادر' ? 'bg-gray-600 text-white border-gray-700' :
                                      'bg-amber-100 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    <option value="انتظار">⏳ انتظار</option>
                                    <option value="متواجد">👤 متواجد</option>
                                    <option value="غادر">🚪 غادر</option>
                                  </select>
                                </div>
                              </div>
                            ) : apt.isOccupied && apt.bookingId ? (
                              <select 
                                disabled={isPartner || isAkoura}
                                value={apt.clientStatus} 
                                onChange={(e) => handleStatusUpdate(apt.bookingId, e.target.value)}
                                className={`text-[10px] font-black rounded-lg px-2 py-1 outline-none border transition-all ${
                                  isPartner ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                                } ${
                                  apt.clientStatus === 'متواجد' ? 'bg-green-600 text-white border-green-700' :
                                  apt.clientStatus === 'غادر' ? 'bg-gray-600 text-white border-gray-700' :
                                  'bg-amber-100 text-amber-700 border-amber-200'
                                }`}
                              >
                                <option value="انتظار">⏳ انتظار</option>
                                <option value="متواجد">👤 متواجد</option>
                                <option value="غادر">🚪 غادر</option>
                              </select>
                            ) : <span className="text-[10px] text-gray-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* ── CUSTOMER PROFILE MODAL ── */}
      <CustomerProfileModal
        isOpen={profileModal.isOpen}
        customerName={profileModal.name}
        customerPhone={profileModal.phone}
        bookings={allBookings}
        onClose={() => setProfileModal({ isOpen: false, name: null })}
        onRefresh={loadOverviewData}
      />

      {/* ── FULL NOTE VIEWER MODAL ── */}
      {activeNoteModal.isOpen && (
        <div className="fixed inset-0 z-[140] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" dir="rtl">
          <div className="bg-[#1F1C18] border border-[#C1A68D]/40 rounded-[2rem] p-6 max-w-lg w-full text-white space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveNoteModal({ isOpen: false, text: '' })}
              className="absolute top-4 left-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-[#C1A68D] font-black text-sm">
              <FileText size={18} />
              <span>{activeNoteModal.title || 'الملاحظات الكاملة'}</span>
            </div>

            <div className="bg-[#2A2723] p-4 rounded-xl border border-white/10 text-xs md:text-sm font-bold leading-relaxed text-amber-200 max-h-60 overflow-y-auto">
              {activeNoteModal.text}
            </div>

            <button
              onClick={() => setActiveNoteModal({ isOpen: false, text: '' })}
              className="w-full bg-[#C1A68D] text-white font-black py-2.5 rounded-xl hover:opacity-90 transition-all text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
