"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { getBookings, getPublicSystemUnits } from '@/lib/data-init';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function DashboardOverview() {
  const [newBookingToast, setNewBookingToast] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt to load a default notification sound
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
  }, []);

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    checkInTomorrow: 0,
    checkOutTomorrow: 0,
  });

  const [tomorrowPlans, setTomorrowPlans] = useState<{in: any[], out: any[]}>({ in: [], out: [] });
  const [todaySchedule, setTodaySchedule] = useState<{in: any[], out: any[]}>({ in: [], out: [] });
  const [apartmentMap, setApartmentMap] = useState<any[]>([]);

  const loadOverviewData = useCallback(async () => {
    const bookings = await getBookings();
    const apts = await getPublicSystemUnits();
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const approved = bookings.filter((b: any) => b.status === 'مؤكد' || b.status === 'approved');

    setTomorrowPlans({
      in: approved.filter((b: any) => b.checkIn === tomorrowStr),
      out: approved.filter((b: any) => b.checkOut === tomorrowStr),
    });

    setStats({
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b: any) => ['جديد', 'قيد المراجعة', 'pending', 'رد جديد'].includes(b.status)).length,
      approvedBookings: approved.length,
      checkInTomorrow: approved.filter((b: any) => b.checkIn === tomorrowStr).length,
      checkOutTomorrow: approved.filter((b: any) => b.checkOut === tomorrowStr).length,
    });

    setTodaySchedule({
      in: approved.filter((b: any) => b.checkIn === todayStr),
      out: approved.filter((b: any) => b.checkOut === todayStr),
    });

    // Map units to their current status (live check)
    const map = apts.map((apt: any) => {
      const activeBooking = approved.find((b: any) => {
         const bIn = new Date(b.checkIn);
         const bOut = new Date(b.checkOut);
         return b.apartmentId === apt.id && today >= bIn && today < bOut;
      });
      return { ...apt, isOccupied: !!activeBooking || apt.status === 'مشغول', guest: activeBooking?.name };
    });
    setApartmentMap(map);
  }, []);

  useEffect(() => {
    loadOverviewData();

    // Setup Supabase Realtime Subscription
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload: any) => {
          const newB = payload.new;
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play blocked', e));
          }
          setNewBookingToast(newB);
          // Reload the data to reflect the new counts
          loadOverviewData();
          
          // Hide toast after 8 seconds
          setTimeout(() => {
            setNewBookingToast(null);
          }, 8000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOverviewData]);


  const kpis = [
    { label: 'إجمالي الطلبات', value: stats.totalBookings, icon: '📊', color: 'text-[#2A2723]' },
    { label: 'قيد المراجعة', value: stats.pendingBookings, icon: '⏳', color: 'text-[#C1A68D]' },
    { label: 'مؤكدة', value: stats.approvedBookings, icon: '💎', color: 'text-green-600' },
    { label: 'وصول (غداً)', value: stats.checkInTomorrow, icon: '🔑', color: 'text-[#C1A68D]' },
    { label: 'مغادرة (غداً)', value: stats.checkOutTomorrow, icon: '🚪', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-[#2A2723]">مركز <span className="text-[#C1A68D]">العمليات</span></h1>
          <p className="text-[#7A7061] font-bold opacity-80">متابعة دقيقة وشاملة لـ 10 وحدات فندقية فاخرة.</p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 rounded-xl bg-white border border-[#EAE4D9]/50 shadow-sm text-[10px] font-black text-[#7A7061] uppercase tracking-widest">
             {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
           </div>
        </div>
      </header>

      {/* Realtime Toast Notification */}
      {newBookingToast && (
        <div className="fixed top-6 right-6 z-[100] bg-white border-2 border-green-500 p-6 rounded-2xl shadow-2xl animate-fade-in w-80">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl shrink-0 animate-pulse">
              🔔
            </div>
            <div>
              <h4 className="font-black text-[#2A2723] mb-1">طلب حجز جديد!</h4>
              <p className="text-xs text-[#7A7061] font-bold mb-2">من: {newBookingToast.name}</p>
              <p className="text-[10px] text-[#C1A68D] font-black uppercase tracking-widest">{newBookingToast.check_in} ➔ {newBookingToast.check_out}</p>
            </div>
          </div>
          <button 
            onClick={() => setNewBookingToast(null)} 
            className="absolute top-2 right-3 text-gray-400 hover:text-black text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute -bottom-4 -right-4 text-5xl opacity-[0.05] group-hover:opacity-10 transition-opacity rotate-12">{kpi.icon}</div>
            <div className={`text-3xl font-black mb-3 ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest opacity-60">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Apartment Status Map - Live View */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm">
          <div className="flex justify-between items-center mb-8">
             <h3 className="font-black text-lg text-[#2A2723]">🗺️ خريطة الوحدات (Live)</h3>
             <div className="flex gap-4">
               <div className="flex items-center gap-1.5 text-[8px] font-black text-green-600 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> متاح</div>
               <div className="flex items-center gap-1.5 text-[8px] font-black text-red-600 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-red-500" /> مشغول</div>
               <div className="flex items-center gap-1.5 text-[8px] font-black text-[#7A7061] uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-gray-400" /> صيانة</div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {apartmentMap.map((apt) => (
              <div key={apt.id} className={`p-5 rounded-2xl border transition-all ${
                apt.status === 'maintenance' || apt.status === 'صيانة' ? 'bg-gray-50 border-gray-100 opacity-60' : 
                apt.isOccupied ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
              }`}>
                <div className="text-[10px] font-black text-[#7A7061] uppercase mb-2 opacity-60">وحدة {apt.id}</div>
                <div className={`text-xs font-black mb-3 ${apt.status === 'صيانة' ? 'text-[#7A7061]' : apt.isOccupied ? 'text-red-600' : 'text-green-600'}`}>
                  {apt.status === 'صيانة' ? 'صيانة' : apt.isOccupied ? 'مشغول' : 'متاح'}
                </div>
                {apt.isOccupied && <div className="text-[8px] text-[#2A2723] truncate font-black opacity-40">الضيف: {apt.guest}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Arriving Tomorrow */}
        <div className="bg-[#C1A68D]/5 border border-[#C1A68D]/20 p-8 rounded-[2.5rem] shadow-sm flex flex-col">
          <h3 className="font-black text-lg mb-6 flex items-center justify-between text-[#2A2723]">
            <span>📅 غداً - القادمون</span>
            <span className="w-7 h-7 rounded-full bg-[#C1A68D] text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-[#C1A68D]/20">{tomorrowPlans.in.length}</span>
          </h3>
          <div className="space-y-4 flex-1">
            {tomorrowPlans.in.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 mt-10">
                 <span className="text-4xl mb-4">🛌</span>
                 <p className="text-[10px] font-black uppercase tracking-widest">لا يوجد وصول مجدول لغدٍ.</p>
              </div>
            ) : (
              tomorrowPlans.in.map((b, i) => (
                <div key={i} className="p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-[#C1A68D]/10 flex items-center justify-between group hover:bg-white transition-all shadow-sm">
                   <div>
                     <div className="text-xs font-black text-[#2A2723]">{b.name}</div>
                     <div className="text-[9px] text-[#C1A68D] mt-1 font-black">وحدة رقم {b.apartmentId}</div>
                   </div>
                   <div className="text-[10px] font-black text-[#7A7061] group-hover:text-[#C1A68D] transition-colors">تجهيز المفتاح 🔑</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm">
          <h3 className="font-black text-lg mb-8 text-[#2A2723]">⌚ جدول اليوم ({new Date().toLocaleDateString('ar-EG')})</h3>
          <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-4">
               <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest pl-2 border-r-4 border-green-500">وصول (In)</h4>
               {todaySchedule.in.map((b, i) => (
                 <div key={i} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE4D9]/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-black border border-green-200">{b.apartmentId || '?'}</div>
                    <div className="text-xs font-black text-[#2A2723]">{b.name}</div>
                 </div>
               ))}
               {todaySchedule.in.length === 0 && <p className="text-[10px] text-[#7A7061] font-bold italic opacity-40 mt-4">لا عمليات وصول.</p>}
             </div>
             <div className="space-y-4">
               <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest pl-2 border-r-4 border-red-500">مغادرة (Out)</h4>
               {todaySchedule.out.map((b, i) => (
                 <div key={i} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE4D9]/50 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-black border border-red-200">{b.apartmentId || '?'}</div>
                    <div className="text-xs font-black text-[#2A2723]">{b.name}</div>
                 </div>
               ))}
               {todaySchedule.out.length === 0 && <p className="text-[10px] text-[#7A7061] font-bold italic opacity-40 mt-4">لا عمليات مغادرة.</p>}
             </div>
          </div>
        </div>

        {/* Sent Messages Feed */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden flex flex-col">
           <h3 className="font-black text-lg mb-6 flex items-center gap-3 text-[#2A2723]">
             <span className="text-[#C1A68D] text-xl">📩</span> آخر المراسلات المرسلة
           </h3>
            <div className="space-y-4 flex-1">
              <MessagesFeed />
           </div>
        </div>
      </div>
    </div>
  );
}

function MessagesFeed() {
  const [messages, setMessages] = useState<any[]>([]);
  useEffect(() => {
    getBookings().then(bookings => {
      setMessages(bookings.filter((b: any) => b.paymentInfo).slice(0, 4));
    });
  }, []);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[10px] text-[#7A7061] opacity-40 italic py-10">
         <span className="text-3xl mb-4">📭</span>
         <p className="font-black uppercase tracking-widest">لم يتم إرسال أي تعليمات دفع حتى الآن.</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((m: any, i: number) => (
        <div key={i} className="p-5 bg-[#FDFBF7] rounded-2xl border border-[#EAE4D9]/50 hover:bg-white hover:shadow-md transition-all group">
          <div className="flex justify-between items-center mb-3">
             <span className="text-sm font-black text-[#2A2723]">{m.name}</span>
             <span className="text-[10px] text-[#7A7061] font-black opacity-60">{new Date(m.id).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
          </div>
          <p className="text-[10px] text-[#7A7061] line-clamp-2 italic leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">"{m.paymentInfo}"</p>
        </div>
      ))}
    </>
  );
}
