"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { getBookings, getSystemUnits } from '@/lib/data-init';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

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

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    checkInToday: 0,
    checkOutToday: 0,
    checkInTomorrow: 0,
    checkOutTomorrow: 0,
  });

  const [todaySchedule, setTodaySchedule] = useState<{in: any[], out: any[]}>({ in: [], out: [] });
  const [tomorrowPlans, setTomorrowPlans] = useState<{in: any[], out: any[]}>({ in: [], out: [] });
  const [nextDayPlans, setNextDayPlans] = useState<{in: any[], out: any[]}>({ in: [], out: [] });
  const [apartmentMap, setApartmentMap] = useState<any[]>([]);
  const [fullMap, setFullMap] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inventoryStats, setInventoryStats] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const loadOverviewData = useCallback(async () => {
    setIsLoading(true);
    const bookings = await getBookings(Date.now().toString());
    const apts = await getSystemUnits();

    const targetDateStr = selectedDate;
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    const dayAfter = new Date(selectedDate);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    const confirmed = bookings.filter((b: any) => CONFIRMED_STATUSES.includes(b.status));
    const pending = bookings.filter((b: any) => PENDING_STATUSES.includes(b.status));

    // Helper to map 1-24 to b1-sX or b2-sX
    const getFullId = (n: number) => n <= 12 ? `b1-s${n}` : `b2-s${n-12}`;

    const singleIds  = [2, 3, 6, 7, 8, 17].map(getFullId);
    const doubleIds  = [1, 5, 9, 10, 11, 12, 13, 18, 20, 24].map(getFullId);
    const tripleIds  = [4, 14, 15, 22, 23].map(getFullId);
    const twoRoomIds = [16, 19, 21].map(getFullId);

    const map = apts.map((apt: any) => {
      const activeBooking = confirmed.find((b: any) =>
        b.apartmentId === apt.id && targetDateStr >= b.checkIn && targetDateStr < b.checkOut
      );
      let cat = 'apartment';
      if (singleIds.includes(apt.id)) cat = 'single';
      else if (doubleIds.includes(apt.id)) cat = 'double';
      else if (tripleIds.includes(apt.id)) cat = 'triple';
      else if (twoRoomIds.includes(apt.id)) cat = 'two-room';

      return {
        ...apt,
        category: cat,
        isOccupied: !!activeBooking || apt.status === 'مشغول',
        guest: activeBooking?.name,
        checkOut: activeBooking?.checkOut,
        guestsCount: activeBooking?.guestsCount,
      };
    });

    setFullMap(map);

    setInventoryStats([
      { id: 'single',   label: 'سنجل',    count: map.filter((u: any) => singleIds.includes(u.id)  && !u.isOccupied).length, total: 6,  color: 'text-green-500'  },
      { id: 'double',   label: 'دبل',      count: map.filter((u: any) => doubleIds.includes(u.id)  && !u.isOccupied).length, total: 10, color: 'text-blue-400'   },
      { id: 'triple',   label: 'تريبل',    count: map.filter((u: any) => tripleIds.includes(u.id)  && !u.isOccupied).length, total: 5,  color: 'text-orange-400' },
      { id: 'two-room', label: 'غرفتين',   count: map.filter((u: any) => twoRoomIds.includes(u.id) && !u.isOccupied).length, total: 3,  color: 'text-purple-400' },
      { id: 'apartment', label: 'شقق',    count: map.filter((u: any) => u.id.startsWith('apt-') && !u.isOccupied).length, total: map.filter((u: any) => u.id.startsWith('apt-')).length, color: 'text-amber-500' },
    ]);

    setAllBookings(bookings);

    const occupiedStudios = map.filter((u: any) => (u.id.startsWith('b1-s') || u.id.startsWith('b2-s')) && u.isOccupied).length;
    const totalStudios = map.filter((u: any) => u.id.startsWith('b1-s') || u.id.startsWith('b2-s')).length;
    const occupiedApartments = map.filter((u: any) => u.id.startsWith('apt-') && u.isOccupied).length;
    const totalApartments = map.filter((u: any) => u.id.startsWith('apt-')).length;

    setStats({
      totalBookings: bookings.length,
      pendingBookings: pending.length,
      approvedBookings: confirmed.length,
      checkInToday:    confirmed.filter((b: any) => b.checkIn  === targetDateStr).length,
      checkOutToday:   confirmed.filter((b: any) => b.checkOut === targetDateStr).length,
      checkInTomorrow: confirmed.filter((b: any) => b.checkIn  === nextDayStr).length,
      checkOutTomorrow:confirmed.filter((b: any) => b.checkOut === nextDayStr).length,
      // @ts-ignore
      occupiedStudios,
      totalStudios,
      occupiedApartments,
      totalApartments
    });

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
  }, [selectedDate, selectedCategory]);

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

  // Reactive filter: recompute whenever category or data changes
  useEffect(() => {
    if (fullMap.length === 0) return;
    const filtered = selectedCategory === 'all'
      ? fullMap // Show everything when 'all' is selected
      : fullMap.filter((u: any) => u.category === selectedCategory);
    setApartmentMap(filtered);
  }, [selectedCategory, fullMap]);

  const targetDateStr = selectedDate;

  const kpis = [
    { key: 'total',    label: 'إجمالي الطلبات', value: stats.totalBookings,   icon: '📊', gradient: 'from-[#2A2723] to-[#3D3530]',   text: 'text-white' },
    { key: 'pending',  label: 'قيد المراجعة',   value: stats.pendingBookings,  icon: '⏳', gradient: 'from-amber-500 to-orange-500', text: 'text-white' },
    { key: 'approved', label: 'مؤكدة',           value: stats.approvedBookings, icon: '✅', gradient: 'from-green-500 to-emerald-600', text: 'text-white' },
    { key: 'occupancy', label: 'نسبة الإشغال',    value: `${Math.round(((stats as any).occupiedStudios + (stats as any).occupiedApartments) / ((stats as any).totalStudios + (stats as any).totalApartments) * 100) || 0}%`, icon: '🏠', gradient: 'from-purple-500 to-indigo-600', text: 'text-white' },
    { key: 'checkin',  label: 'وصول اليوم',      value: stats.checkInToday,    icon: '🛬', gradient: 'from-blue-500 to-blue-600',     text: 'text-white' },
    { key: 'checkout', label: 'مغادرة اليوم',    value: stats.checkOutToday,   icon: '🛫', gradient: 'from-rose-500 to-red-600',      text: 'text-white' },
  ];

  const getKpiBookings = (key: string) => {
    const confirmed = allBookings.filter((b: any) => CONFIRMED_STATUSES.includes(b.status));
    const pending   = allBookings.filter((b: any) => PENDING_STATUSES.includes(b.status));
    if (key === 'total')    return allBookings;
    if (key === 'pending')  return pending;
    if (key === 'approved') return confirmed;
    if (key === 'checkin')  return confirmed.filter((b: any) => b.checkIn  === targetDateStr);
    if (key === 'checkout') return confirmed.filter((b: any) => b.checkOut === targetDateStr);
    if (key === 'occupancy') return confirmed.filter((b: any) => targetDateStr >= b.checkIn && targetDateStr < b.checkOut);
    return [];
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">

      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black mb-1 tracking-tight text-[#2A2723]">
            الاستعراض <span className="text-[#C1A68D]">العام</span>
          </h1>
          <p className="text-[#7A7061] font-bold opacity-70 text-sm">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#EAE4D9]/50 px-4 py-2 rounded-full shadow-sm">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-ping' : 'bg-green-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#7A7061]">
              {isLoading ? 'جاري التحديث...' : `آخر تحديث: ${lastUpdated.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </div>
          <button
            onClick={loadOverviewData}
            className="w-10 h-10 bg-[#C1A68D]/10 hover:bg-[#C1A68D] text-[#C1A68D] hover:text-white rounded-full flex items-center justify-center transition-all border border-[#C1A68D]/30"
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

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <button
            key={i}
            onClick={() => setSelectedKpi(selectedKpi === kpi.key ? null : kpi.key)}
            className={`bg-gradient-to-br ${kpi.gradient} p-6 rounded-[2rem] shadow-lg hover:scale-105 transition-all overflow-hidden relative text-right cursor-pointer ring-offset-2 ${
              selectedKpi === kpi.key ? 'ring-4 ring-white/60 scale-105' : ''
            }`}
          >
            <div className="absolute -bottom-3 -left-3 text-5xl opacity-10 rotate-12">{kpi.icon}</div>
            <div className={`text-4xl font-black mb-2 ${kpi.text}`}>{kpi.value}</div>
            <div className={`text-[9px] font-black uppercase tracking-widest opacity-70 ${kpi.text}`}>{kpi.label}</div>
            <div className={`text-[8px] mt-2 opacity-50 ${kpi.text}`}>اضغط للتفاصيل ▾</div>
          </button>
        ))}
      </div>

      {/* ── KPI DETAIL PANEL ── */}
      {selectedKpi && (() => {
        const list = getKpiBookings(selectedKpi);
        const kpi  = kpis.find(k => k.key === selectedKpi)!;
        return (
          <div className={`bg-gradient-to-br ${kpi.gradient} rounded-[2rem] overflow-hidden shadow-2xl transition-all`}>
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{kpi.icon}</span>
                <div>
                  <h3 className="font-black text-white text-sm">{kpi.label}</h3>
                  <p className="text-[10px] text-white/60 font-bold">{list.length} حجز نشط الآن</p>
                </div>
              </div>
              <button onClick={() => setSelectedKpi(null)} className="text-white/60 hover:text-white text-lg font-black">✕</button>
            </div>
            
            {selectedKpi === 'occupancy' && (
              <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-white/5">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-purple-200 uppercase mb-1">الاستديوهات</p>
                  <div className="text-xl font-black text-white">{(stats as any).occupiedStudios} <span className="text-[10px] opacity-40">/ {(stats as any).totalStudios}</span></div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-purple-200 uppercase mb-1">الشقق</p>
                  <div className="text-xl font-black text-white">{(stats as any).occupiedApartments} <span className="text-[10px] opacity-40">/ {(stats as any).totalApartments}</span></div>
                </div>
              </div>
            )}

            {list.length === 0 ? (
              <div className="py-10 text-center text-white/40 font-black text-sm">لا توجد بيانات</div>
            ) : (
              <div className="p-4 grid gap-2 max-h-64 overflow-y-auto">
                {list.map((b: any, i: number) => (
                  <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-black text-white shrink-0">
                        {b.apartmentId?.replace('b1-s','').replace('b2-s','').replace('apt-','ش') || '?'}
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">{b.name}</div>
                        <div className="text-[9px] text-white/60 font-bold">{b.checkIn} ← {b.checkOut}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full text-white shrink-0">{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── COMMAND CENTER: 3-DAY PREVIEW FULL WIDTH ── */}
      <div className="grid lg:grid-cols-1 gap-6">

        {/* 3-DAY OPERATIONAL PREVIEW */}
        <div className="bg-[#1A1816] p-8 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C1A68D] to-transparent opacity-20" />
          <div className="grid md:grid-cols-3 gap-6 divide-x divide-white/5 rtl:divide-x-reverse">

            {/* TODAY */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="text-lg">📅</span><h4 className="text-white font-black text-sm">اليوم</h4></div>
                <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full text-[8px] font-black border border-green-500/20">
                  {todaySchedule.in.length} وصول · {todaySchedule.out.length} مغادرة
                </span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {todaySchedule.in.length === 0 && todaySchedule.out.length === 0 ? (
                  <p className="text-[10px] text-gray-600 text-center py-6">لا عمليات اليوم</p>
                ) : (<>
                  {todaySchedule.in.map((b, i) => (
                    <div key={`t-in-${i}`} className="p-2 bg-green-500/5 border border-green-500/10 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-white truncate max-w-[90px]">🛬 {b.name}</span>
                      <span className="text-[8px] font-black text-green-400">{b.studio || b.apartmentId}</span>
                    </div>
                  ))}
                  {todaySchedule.out.map((b, i) => (
                    <div key={`t-out-${i}`} className="p-2 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-white truncate max-w-[90px]">🛫 {b.name}</span>
                      <span className="text-[8px] font-black text-red-400">{b.studio || b.apartmentId}</span>
                    </div>
                  ))}
                </>)}
              </div>
            </div>

            {/* TOMORROW */}
            <div className="space-y-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="text-lg">☀️</span><h4 className="text-white font-black text-sm">غداً</h4></div>
                <span className="bg-[#C1A68D]/10 text-[#C1A68D] px-2 py-0.5 rounded-full text-[8px] font-black border border-[#C1A68D]/20">
                  {tomorrowPlans.in.length} وصول · {tomorrowPlans.out.length} مغادرة
                </span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {tomorrowPlans.in.length === 0 && tomorrowPlans.out.length === 0 ? (
                  <p className="text-[10px] text-gray-600 text-center py-6">لا عمليات غداً</p>
                ) : (<>
                  {tomorrowPlans.in.map((b, i) => (
                    <div key={`tom-in-${i}`} className="p-2 bg-[#C1A68D]/5 border border-[#C1A68D]/10 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-white truncate max-w-[90px]">🛬 {b.name}</span>
                      <span className="text-[8px] font-black text-[#C1A68D]">{b.studio || b.apartmentId}</span>
                    </div>
                  ))}
                  {tomorrowPlans.out.map((b, i) => (
                    <div key={`tom-out-${i}`} className="p-2 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-white truncate max-w-[90px]">🛫 {b.name}</span>
                      <span className="text-[8px] font-black text-red-400">{b.studio || b.apartmentId}</span>
                    </div>
                  ))}
                </>)}
              </div>
            </div>

            {/* DAY AFTER TOMORROW */}
            <div className="space-y-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="text-lg">⏳</span><h4 className="text-white font-black text-sm">بعد غد</h4></div>
                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[8px] font-black border border-blue-500/20">
                  {nextDayPlans.in.length} وصول · {nextDayPlans.out.length} مغادرة
                </span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {nextDayPlans.in.length === 0 && nextDayPlans.out.length === 0 ? (
                  <p className="text-[10px] text-gray-600 text-center py-6">لا عمليات بعد غد</p>
                ) : (<>
                  {nextDayPlans.in.map((b, i) => (
                    <div key={`next-in-${i}`} className="p-2 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-white truncate max-w-[90px]">🛬 {b.name}</span>
                      <span className="text-[8px] font-black text-blue-400">{b.studio || b.apartmentId}</span>
                    </div>
                  ))}
                  {nextDayPlans.out.map((b, i) => (
                    <div key={`next-out-${i}`} className="p-2 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-white truncate max-w-[90px]">🛫 {b.name}</span>
                      <span className="text-[8px] font-black text-red-400">{b.studio || b.apartmentId}</span>
                    </div>
                  ))}
                </>)}
              </div>
            </div>

          </div>
        </div>

        {/* QUICK SEARCH merged into Unit Map */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm">
          {/* Header row: title + date + filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#EAE4D9]/30">
            <h4 className="font-black text-sm text-[#2A2723]">
              {selectedCategory === 'all' ? '🗺️ جميع الوحدات' : `🟢 وحدات ${inventoryStats.find(i => i.id === selectedCategory)?.label} المتاحة`}
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث عن ضيف أو وحدة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#F8F5F0] border border-[#EAE4D9] rounded-xl px-9 py-1.5 text-xs font-black text-[#2A2723] focus:ring-2 focus:ring-[#C1A68D] transition-all outline-none w-48"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              </div>

              {/* Date picker */}
              <div className="flex items-center gap-2 bg-[#F8F5F0] border border-[#EAE4D9] rounded-xl px-2">
                <span className="text-[10px] font-black text-[#7A7061] pr-1">التاريخ:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none py-1.5 text-xs font-black text-[#2A2723] outline-none"
                />
              </div>

              <div className="w-px h-5 bg-[#EAE4D9] hidden md:block" />
              
              {/* Category filters */}
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${selectedCategory === 'all' ? 'bg-[#2A2723] text-white shadow-md' : 'bg-gray-50 text-[#7A7061] hover:bg-gray-100'}`}
                >الكل</button>
                {inventoryStats.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCategory(item.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${selectedCategory === item.id ? 'bg-[#C1A68D] text-white shadow-md' : 'bg-gray-50 text-[#7A7061] hover:bg-gray-100'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Unit Grid or Table */}
          {(() => {
            const displayList = apartmentMap.filter(apt => {
              if (!searchTerm) return true;
              const s = searchTerm.toLowerCase();
              const guestMatch = apt.guest?.toLowerCase().includes(s);
              const idMatch = apt.id.toLowerCase().includes(s);
              const titleMatch = apt.title?.ar?.toLowerCase().includes(s);
              // Support searching by date in format YYYY-MM-DD or DD/MM
              const dateMatch = apt.checkOut?.includes(s) || (apt.checkOut && (() => {
                const [y, m, d] = apt.checkOut.split('-');
                return `${d}/${m}`.includes(s);
              })());
              
              return guestMatch || idMatch || titleMatch || dateMatch;
            });

            if (displayList.length === 0) {
              return <div className="h-40 flex items-center justify-center text-gray-300 animate-pulse font-black text-sm italic">لا يوجد وحدات مطابقة للبحث...</div>;
            }

            if (selectedCategory === 'all') {
              return (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-right">
                    <thead>
                      <tr className="bg-[#2A2723] text-white">
                        <th className="px-4 py-3 text-[10px] font-black text-center w-12">#</th>
                        <th className="px-4 py-3 text-[10px] font-black">اسم الوحدة</th>
                        <th className="px-4 py-3 text-[10px] font-black">النوع</th>
                        <th className="px-4 py-3 text-[10px] font-black text-center">الحالة</th>
                        <th className="px-4 py-3 text-[10px] font-black">الضيف</th>
                        <th className="px-4 py-3 text-[10px] font-black text-center">تاريخ الخروج</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE4D9]/30">
                      {[...displayList]
                        .sort((a, b) => {
                          const n = (u: any) => u.id.startsWith('b1-s') ? parseInt(u.id.replace('b1-s',''),10) : u.id.startsWith('b2-s') ? parseInt(u.id.replace('b2-s',''),10)+12 : 99;
                          return n(a) - n(b);
                        })
                        .map((apt) => {
                          const isB1 = apt.id.startsWith('b1-s');
                          const isB2 = apt.id.startsWith('b2-s');
                          const num = isB1 ? parseInt(apt.id.replace('b1-s',''),10) : isB2 ? parseInt(apt.id.replace('b2-s',''),10)+12 : 0;
                          const rowBg = isB1 ? 'bg-blue-50/50 hover:bg-blue-50' : isB2 ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'bg-amber-50/50 hover:bg-amber-50';
                          const badgeColor = isB1 ? 'bg-blue-600 text-white' : isB2 ? 'bg-emerald-600 text-white' : 'bg-[#C1A68D] text-white';
                          const typeLabel: Record<string,string> = { single:'سنجل', double:'دبل', triple:'تريبل', 'two-room':'غرفتين', apartment:'شقة' };
                          
                          const formatMiniDate = (d: string) => {
                            if (!d || !d.includes('-')) return '—';
                            const [y, m, day] = d.split('-');
                            return `${day}/${m}`;
                          };

                          return (
                            <tr key={apt.id} className={`${rowBg} transition-colors`}>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`${badgeColor} w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black mx-auto`}>{num}</span>
                              </td>
                              <td className="px-4 py-2.5 font-black text-[#2A2723] text-xs">{apt.title?.ar || apt.id}</td>
                              <td className="px-4 py-2.5 text-[10px] text-[#7A7061] font-bold">{typeLabel[apt.category] || apt.category}</td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${apt.status === 'صيانة' ? 'bg-gray-100 text-gray-500' : apt.isOccupied ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                  {apt.isOccupied ? 'مشغول' : apt.status === 'صيانة' ? 'صيانة' : 'متاح'}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-[10px] text-[#7A7061] font-bold">{apt.guest || '—'}</td>
                              <td className="px-4 py-2.5 text-[10px] text-center text-[#2A2723] font-black">{formatMiniDate(apt.checkOut)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              );
            } else {
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {displayList.map((apt) => (
                    <div key={apt.id} className={`p-4 rounded-2xl border transition-all duration-300 ${
                      apt.status === 'maintenance' || apt.status === 'صيانة'
                        ? 'bg-gray-50 border-gray-100 opacity-60'
                        : apt.isOccupied
                        ? 'bg-red-50 border-red-100 opacity-40 grayscale'
                        : 'bg-white border-[#EAE4D9] shadow-sm hover:border-[#C1A68D] hover:scale-105'
                    }`}>
                      <div className="text-[9px] font-black text-[#7A7061] uppercase mb-1 opacity-60">{apt.id}</div>
                      <div className={`text-[11px] font-black mb-1 ${apt.status === 'صيانة' ? 'text-gray-400' : apt.isOccupied ? 'text-red-500' : 'text-green-600'}`}>
                        {apt.isOccupied ? '🔴 مشغول' : apt.status === 'صيانة' ? '🔧 صيانة' : '🟢 متاح'}
                      </div>
                      <div className="text-[10px] font-bold text-[#2A2723] mt-1">{apt.title?.ar}</div>
                      {apt.guest && <div className="text-[9px] text-[#7A7061] mt-1 truncate">👤 {apt.guest}</div>}
                    </div>
                  ))}
                </div>
              );
            }
          })()}
        </div>
      </div>

    </div>
  );
}
