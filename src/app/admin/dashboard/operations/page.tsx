"use client";

import { useEffect, useState, useCallback } from 'react';
import { getBookings, updateBookingStatus, updateUnitDetails } from '@/lib/data-init';

export default function OperationsCenter() {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'after' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await getBookings(Date.now().toString());
    const todayStr = new Date().toISOString().split('T')[0];

    // Auto-Cancel Logic: If it's a request and check-in is today or earlier
    const processed = data.map((b: any) => {
      const isRequest = b.status === 'pending' || b.status === 'طلب جديد' || b.status === 'انتظار';
      if (isRequest && b.checkIn <= todayStr) {
        return { ...b, status: 'cancelled_auto' }; // Mark as auto-cancelled
      }
      return b;
    });

    setBookings(processed.filter((b: any) => 
      !['cancelled', 'deleted', 'rejected', 'مرفوض', 'cancelled_auto'].includes(b.status)
    ));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (id: string, updates: any) => {
    setActionLoading(id);
    try {
      await updateBookingStatus(id, updates);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleHousekeeping = async (unitId: string, status: string) => {
    setActionLoading(unitId);
    try {
      await updateUnitDetails(unitId, { housekeeping: status });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const targetDate = () => {
    if (activeTab === 'custom') return customDate;
    const d = new Date();
    if (activeTab === 'tomorrow') d.setDate(d.getDate() + 1);
    if (activeTab === 'after') d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const dayLabel = () => {
    if (activeTab === 'today') return 'اليوم';
    if (activeTab === 'tomorrow') return 'غداً';
    if (activeTab === 'after') return 'بعد غد';
    return customDate;
  };

  const dateStr = targetDate();
  const arrivals = bookings.filter(b => b.checkIn === dateStr);
  const departures = bookings.filter(b => b.checkOut === dateStr);

  const out1 = departures.slice(0, Math.ceil(departures.length / 2));
  const out2 = departures.slice(Math.ceil(departures.length / 2));
  const in1 = arrivals.slice(0, Math.ceil(arrivals.length / 2));
  const in2 = arrivals.slice(Math.ceil(arrivals.length / 2));

  return (
    <div className="min-h-screen bg-[#1A1816] -m-6 md:-m-12 p-6 md:p-12 text-white font-sans animate-fade-in custom-scrollbar" dir="rtl">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-[#C1A68D] rounded-full shadow-[0_0_15px_#C1A68D]" />
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-blue-400">
                    Operations Center
                </h1>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full bg-green-500 ${isLoading ? 'animate-ping' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {isLoading ? 'جاري التحديث...' : 'بيانات حية متزامنة'}
                </span>
            </div>
        </div>

        {/* Filters Tabs */}
        <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1 bg-[#23211F] p-1.5 rounded-2xl border border-white/5 w-full md:w-fit shadow-2xl">
            {[
                { id: 'today', label: 'اليوم' },
                { id: 'tomorrow', label: 'غداً' },
                { id: 'after', label: 'بعد غد' },
                { id: 'custom', label: 'بحث بالتاريخ 🔍' }
            ].map((tab) => (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 rounded-xl text-[10px] md:text-sm font-black transition-all duration-500 whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] scale-105' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                >
                {tab.label}
                </button>
            ))}
            </div>

            {activeTab === 'custom' && (
                <input 
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="bg-[#23211F] border border-yellow-400/30 text-yellow-400 px-6 py-4 rounded-2xl outline-none font-black text-sm animate-fade-in focus:border-yellow-400 transition-all"
                />
            )}
        </div>
      </header>

      {isLoading && !bookings.length ? (
        <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#C1A68D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <OpCard 
            title="مغادرة (خروج اليوم)" 
            items={out1} 
            color="border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.05)]" 
            titleColor="text-red-500"
            type="out"
            onAction={handleUpdateStatus}
            onHousekeeping={handleHousekeeping}
            actionLoading={actionLoading}
          />
          <OpCard 
            title="مغادرة (تابع)" 
            items={out2} 
            color="border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.02)]" 
            titleColor="text-gray-300"
            type="out"
            onAction={handleUpdateStatus}
            onHousekeeping={handleHousekeeping}
            actionLoading={actionLoading}
          />
          <OpCard 
            title="وصول (دخول اليوم)" 
            items={in1} 
            color="border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.05)]" 
            titleColor="text-green-500"
            type="in"
            onAction={handleUpdateStatus}
            actionLoading={actionLoading}
          />
          <OpCard 
            title="وصول (تابع)" 
            items={in2} 
            color="border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.05)]" 
            titleColor="text-blue-400"
            type="in"
            onAction={handleUpdateStatus}
            actionLoading={actionLoading}
          />
        </div>
      )}

      <footer className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> إجمالي الخروج ({dayLabel()}): {departures.length}</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> إجمالي الدخول ({dayLabel()}): {arrivals.length}</div>
          </div>
          <button 
            onClick={loadData}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C1A68D] hover:text-white transition-colors"
          >
            🔄 تحديث يدوي للمزامنة
          </button>
      </footer>
    </div>
  );
}

function OpCard({ title, items, color, titleColor, type, onAction, onHousekeeping, actionLoading }: any) {
  return (
    <div className={`bg-[#23211F]/80 backdrop-blur-3xl p-8 rounded-[2.5rem] border transition-all duration-500 min-h-[300px] ${color}`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-2xl font-black ${titleColor} flex items-center gap-3`}>
            {type === 'in' ? '🛬' : '🛫'}
            {title}
        </h3>
        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black text-gray-500 italic">
            {items.length} عمليات
        </span>
      </div>

      <div className="space-y-6">
        {items.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-gray-700 text-xs font-black italic uppercase tracking-widest border-2 border-dashed border-white/5 rounded-3xl">
            لا توجد عمليات مجدولة
          </div>
        ) : (
          items.map((b: any, i: number) => (
            <div key={i} className="group relative bg-white/5 p-5 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                        <div className="text-xl font-black text-gray-100 flex items-center gap-2">
                            {b.studio || b.apartmentId}
                            {b.guestsCount > 1 && (
                                <span className="bg-blue-500/20 text-blue-300 text-[9px] px-2 py-0.5 rounded-full border border-blue-500/30">
                                    {b.guestsCount} ضيوف
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] font-bold text-gray-500 flex items-center gap-2">
                            👤 {b.name}
                            <span className={`px-2 py-0.5 rounded text-[9px] ${b.status?.includes('مؤكد') ? 'bg-green-500/20 text-green-400' : 'bg-white/5'}`}>{b.status}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <a 
                            href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-green-500/10"
                            title="تواصل واتساب"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </a>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    {type === 'in' ? (
                        <>
                            <ActionButton 
                                label="تأكيد الدخول ✅" 
                                color="bg-green-500" 
                                onClick={() => onAction(b.id, { status: 'مؤكد/دخول' })} 
                                loading={actionLoading === b.id}
                            />
                            <ActionButton 
                                label="تحصيل 💰" 
                                color="bg-yellow-500" 
                                onClick={() => onAction(b.id, { notes: (b.notes || '') + '\n[تم تحصيل المبلغ عند الدخول]' })} 
                                loading={actionLoading === b.id || actionLoading === b.apartmentId}
                            />
                        </>
                    ) : (
                        <>
                            <ActionButton 
                                label="بدأ التنظيف 🧹" 
                                color="bg-red-500" 
                                onClick={() => {
                                    onAction(b.id, { status: 'مغادر/تنظيف' });
                                    if (onHousekeeping) onHousekeeping(b.apartmentId, 'dirty');
                                }} 
                                loading={actionLoading === b.id || actionLoading === b.apartmentId}
                            />
                            <ActionButton 
                                label="الوحدة جاهزة ✨" 
                                color="bg-green-600" 
                                onClick={() => {
                                    onAction(b.id, { status: 'مغادر/تم' });
                                    if (onHousekeeping) onHousekeeping(b.apartmentId, 'clean');
                                }} 
                                loading={actionLoading === b.id || actionLoading === b.apartmentId}
                            />
                        </>
                    )}
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ActionButton({ label, color, onClick, loading }: any) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-[10px] font-black text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-30 ${color} shadow-lg shadow-black/20`}
        >
            {loading ? '...' : label}
        </button>
    );
}
