"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { getBookings, getPublicSystemUnits } from '@/lib/data-init';
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
  const [apartmentMap, setApartmentMap] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inventoryStats, setInventoryStats] = useState<any[]>([]);

  const loadOverviewData = useCallback(async () => {
    setIsLoading(true);
    const bookings = await getBookings(Date.now().toString());
    const apts = await getPublicSystemUnits();
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const targetDateStr = selectedDate;
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    const confirmed = bookings.filter((b: any) => CONFIRMED_STATUSES.includes(b.status));
    const pending = bookings.filter((b: any) => PENDING_STATUSES.includes(b.status));

    // Hardcoded IDs mapping for filtering
    const singleIds = [2, 3, 6, 7, 8, 17].map(n => `b1-s${n}`);
    const doubleIds = [1, 5, 9, 10, 11, 12, 13, 18, 20, 24].map(n => `b1-s${n}`);
    const tripleIds = [4, 14, 15, 22, 23].map(n => `b1-s${n}`);
    const twoRoomIds = [16, 19, 21].map(n => `b1-s${n}`);

    // 1. Map units based on SELECTED DATE and CATEGORY
    const map = apts.map((apt: any) => {
      const activeBooking = confirmed.find((b: any) => {
        const bIn = b.checkIn;
        const bOut = b.checkOut;
        return b.apartmentId === apt.id && targetDateStr >= bIn && targetDateStr < bOut;
      });

      // Categorization logic
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
        guestsCount: activeBooking?.guestsCount 
      };
    });

    // Apply UI Filter
    const filteredMap = selectedCategory === 'all' 
      ? map 
      : map.filter(u => u.category === selectedCategory);

    setApartmentMap(filteredMap);

    // 2. Calculate Category Availability for SELECTED DATE
    const physicalStudios = map.filter((u: any) => u.id.startsWith('b1-s'));
    const categories = [
      { id: 'single', label: 'سنجل', count: physicalStudios.filter(u => singleIds.includes(u.id) && !u.isOccupied).length, color: 'text-green-500' },
      { id: 'double', label: 'دبل', count: physicalStudios.filter(u => doubleIds.includes(u.id) && !u.isOccupied).length, color: 'text-blue-400' },
      { id: 'triple', label: 'تريبل', count: physicalStudios.filter(u => tripleIds.includes(u.id) && !u.isOccupied).length, color: 'text-orange-400' },
      { id: 'two-room', label: 'غرفتين', count: physicalStudios.filter(u => twoRoomIds.includes(u.id) && !u.isOccupied).length, color: 'text-purple-400' }
    ];
    setInventoryStats(categories);

    setStats({
      totalBookings: bookings.length,
      pendingBookings: pending.length,
      approvedBookings: confirmed.length,
      checkInToday: confirmed.filter((b: any) => b.checkIn === targetDateStr).length,
      checkOutToday: confirmed.filter((b: any) => b.checkOut === targetDateStr).length,
      checkInTomorrow: confirmed.filter((b: any) => b.checkIn === nextDayStr).length,
      checkOutTomorrow: confirmed.filter((b: any) => b.checkOut === nextDayStr).length,
    });

    setTodaySchedule({
      in: confirmed.filter((b: any) => b.checkIn === targetDateStr),
      out: confirmed.filter((b: any) => b.checkOut === targetDateStr),
    });

    setTomorrowPlans({
      in: confirmed.filter((b: any) => b.checkIn === nextDayStr),
      out: confirmed.filter((b: any) => b.checkOut === nextDayStr),
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
        const newB = payload.new;
        if (audioRef.current) audioRef.current.play().catch(() => {});
        setNewBookingToast(newB);
        loadOverviewData();
        setTimeout(() => setNewBookingToast(null), 8000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadOverviewData]);

  const kpis = [
    { label: 'إجمالي الطلبات', value: stats.totalBookings, icon: '📊', gradient: 'from-[#2A2723] to-[#3D3530]', text: 'text-white' },
    { label: 'قيد المراجعة', value: stats.pendingBookings, icon: '⏳', gradient: 'from-amber-500 to-orange-500', text: 'text-white' },
    { label: 'مؤكدة', value: stats.approvedBookings, icon: '✅', gradient: 'from-green-500 to-emerald-600', text: 'text-white' },
    { label: 'وصول اليوم', value: stats.checkInToday, icon: '🛬', gradient: 'from-blue-500 to-blue-600', text: 'text-white' },
    { label: 'مغادرة اليوم', value: stats.checkOutToday, icon: '🛫', gradient: 'from-rose-500 to-red-600', text: 'text-white' },
  ];

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      {/* Header */}
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
            title="تحديث البيانات"
          >
            🔄
          </button>
        </div>
      </header>

      {/* Realtime Toast */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className={`bg-gradient-to-br ${kpi.gradient} p-6 rounded-[2rem] shadow-lg hover:scale-105 transition-all overflow-hidden relative`}>
            <div className="absolute -bottom-3 -left-3 text-5xl opacity-10 rotate-12">{kpi.icon}</div>
            <div className={`text-4xl font-black mb-2 ${kpi.text}`}>{kpi.value}</div>
            <div className={`text-[9px] font-black uppercase tracking-widest opacity-70 ${kpi.text}`}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* CLEAN INVENTORY SEARCH & STATS */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 pb-6 border-b border-[#EAE4D9]/30">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#C1A68D]/10 rounded-2xl flex items-center justify-center text-2xl">🏢</div>
                <div>
                    <h3 className="font-black text-lg text-[#2A2723]">البحث السريع عن المتاح</h3>
                    <p className="text-[10px] text-[#7A7061] font-bold uppercase tracking-widest">اختر التاريخ والفئة لعرض الوحدات</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-[#FDFBF7] p-2 rounded-2xl border border-[#EAE4D9]">
                <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white text-[#2A2723] px-4 py-2 rounded-xl outline-none border border-[#EAE4D9] focus:border-[#C1A68D] font-bold text-sm shadow-sm transition-all"
                />
                <div className="w-px h-6 bg-[#EAE4D9]" />
                <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${selectedCategory === 'all' ? 'bg-[#2A2723] text-white' : 'text-[#7A7061] hover:bg-[#EAE4D9]/30'}`}
                >
                    الكل
                </button>
                {inventoryStats.map((item, i) => (
                    <button 
                        key={i}
                        onClick={() => setSelectedCategory(item.id)}
                        className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${selectedCategory === item.id ? 'bg-[#C1A68D] text-white shadow-md' : 'text-[#7A7061] hover:bg-[#EAE4D9]/30'}`}
                    >
                        {item.label} ({item.count})
                    </button>
                ))}
            </div>
        </div>

        {/* Dynamic Unit Map Title based on Filter */}
        <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-[#2A2723]">
                {selectedCategory === 'all' ? '🗺️ جميع الوحدات' : `🟢 وحدات ${inventoryStats.find(i => i.id === selectedCategory)?.label} المتاحة`}
            </h4>
            <span className="text-[10px] font-bold text-[#7A7061] opacity-60">تاريخ العرض: {selectedDate}</span>
        </div>

        {apartmentMap.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-300 animate-pulse font-black text-sm italic">لا يوجد وحدات مطابقة للبحث...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {apartmentMap.map((apt) => (
              <div key={apt.id} className={`p-4 rounded-2xl border transition-all duration-500 ${
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
                {!apt.isOccupied && (
                   <div className="text-[10px] font-bold text-[#2A2723] mt-1">{apt.title?.ar}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Tomorrow Preview */}
        <div className="bg-[#2A2723] p-8 rounded-[2.5rem] shadow-xl flex flex-col">
          <h3 className="font-black text-lg mb-2 text-white flex items-center justify-between">
            <span>📅 غداً</span>
            <span className="text-[10px] text-[#C1A68D] font-black uppercase tracking-widest bg-[#C1A68D]/10 px-3 py-1 rounded-full border border-[#C1A68D]/20">
              {tomorrowPlans.in.length} وصول · {tomorrowPlans.out.length} مغادرة
            </span>
          </h3>
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-6">خطة الغد</p>
          <div className="space-y-3 flex-1">
            {tomorrowPlans.in.length === 0 && tomorrowPlans.out.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 pt-8">
                <span className="text-4xl mb-3">🌙</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-white">لا توجد عمليات غداً</p>
              </div>
            ) : (
              <>
                {tomorrowPlans.in.map((b, i) => (
                  <div key={`in-${i}`} className="p-3 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
                    <span className="text-green-400 text-sm">🛬</span>
                    <div>
                      <div className="text-xs font-black text-white">{b.name}</div>
                      <div className="text-[9px] text-green-400 font-black">{b.studio || b.apartmentId}</div>
                    </div>
                  </div>
                ))}
                {tomorrowPlans.out.map((b, i) => (
                  <div key={`out-${i}`} className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                    <span className="text-red-400 text-sm">🛫</span>
                    <div>
                      <div className="text-xs font-black text-white">{b.name}</div>
                      <div className="text-[9px] text-red-400 font-black">{b.studio || b.apartmentId}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Today Schedule */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm">
        <h3 className="font-black text-lg mb-8 text-[#2A2723] flex items-center gap-3">
          ⌚ جدول اليوم
          <span className="text-[10px] text-[#7A7061] font-bold opacity-60">{new Date().toLocaleDateString('ar-EG')}</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest pb-2 border-b-2 border-green-100 flex items-center gap-2">
              🛬 وصول اليوم
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[8px]">{todaySchedule.in.length}</span>
            </h4>
            {todaySchedule.in.length === 0 ? (
              <p className="text-[10px] text-[#7A7061] font-bold italic opacity-30 pt-2">لا عمليات وصول اليوم.</p>
            ) : todaySchedule.in.map((b, i) => (
              <div key={i} className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[9px] font-black border border-green-200 shrink-0">{b.apartmentId || '?'}</div>
                <div>
                  <div className="text-xs font-black text-[#2A2723]">{b.name}</div>
                  <div className="text-[9px] text-[#7A7061] font-bold">{b.studio} {b.guestsCount > 1 ? `· ${b.guestsCount} أشخاص` : ''}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest pb-2 border-b-2 border-red-100 flex items-center gap-2">
              🛫 مغادرة اليوم
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[8px]">{todaySchedule.out.length}</span>
            </h4>
            {todaySchedule.out.length === 0 ? (
              <p className="text-[10px] text-[#7A7061] font-bold italic opacity-30 pt-2">لا عمليات مغادرة اليوم.</p>
            ) : todaySchedule.out.map((b, i) => (
              <div key={i} className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[9px] font-black border border-red-200 shrink-0">{b.apartmentId || '?'}</div>
                <div>
                  <div className="text-xs font-black text-[#2A2723]">{b.name}</div>
                  <div className="text-[9px] text-[#7A7061] font-bold">{b.studio} {b.guestsCount > 1 ? `· ${b.guestsCount} أشخاص` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
