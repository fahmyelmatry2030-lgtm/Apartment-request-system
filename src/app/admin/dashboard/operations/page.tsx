"use client";

import { useEffect, useState, useCallback } from 'react';
import { getBookings } from '@/lib/data-init';

export default function OperationsCenter() {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'after'>('today');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await getBookings();
    setBookings(data.filter((b: any) => b.status === 'approved' || b.status === 'مؤكد'));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const targetDate = () => {
    const d = new Date();
    if (activeTab === 'tomorrow') d.setDate(d.getDate() + 1);
    if (activeTab === 'after') d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const dayLabel = () => {
    if (activeTab === 'today') return 'اليوم';
    if (activeTab === 'tomorrow') return 'غداً';
    return 'بعد غد';
  };

  const dateStr = targetDate();
  const arrivals = bookings.filter(b => b.checkIn === dateStr);
  const departures = bookings.filter(b => b.checkOut === dateStr);

  // Divide into groups of 2 for the 4-square layout
  const out1 = departures.slice(0, Math.ceil(departures.length / 2));
  const out2 = departures.slice(Math.ceil(departures.length / 2));
  const in1 = arrivals.slice(0, Math.ceil(arrivals.length / 2));
  const in2 = arrivals.slice(Math.ceil(arrivals.length / 2));

  return (
    <div className="min-h-screen bg-[#1A1816] -m-6 md:-m-12 p-6 md:p-12 text-white font-sans animate-fade-in custom-scrollbar" dir="rtl">
      {/* Header based on Image 2 */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-10 bg-[#C1A68D] rounded-full shadow-[0_0_15px_#C1A68D]" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-blue-400">
                Check-in & out
            </h1>
        </div>

        {/* Filters Tabs */}
        <div className="flex gap-1 bg-[#23211F] p-1.5 rounded-2xl border border-white/5 w-full md:w-fit shadow-2xl">
          {[
            { id: 'today', label: 'اليوم' },
            { id: 'tomorrow', label: 'غداً' },
            { id: 'after', label: 'بعد غد' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-4 rounded-xl text-sm font-black transition-all duration-500 ${
                activeTab === tab.id 
                ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] scale-105' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#C1A68D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Out Row 1 */}
          <OpCard 
            title="خروج" 
            items={out1} 
            color="border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]" 
            titleColor="text-red-500"
          />
          {/* Out Row 2 */}
          <OpCard 
            title="خروج" 
            items={out2} 
            color="border-white shadow-[0_0_30px_rgba(255,255,255,0.05)]" 
            titleColor="text-white"
          />
          {/* In Row 1 */}
          <OpCard 
            title="دخول" 
            items={in1} 
            color="border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.1)]" 
            titleColor="text-green-500"
          />
          {/* In Row 2 */}
          <OpCard 
            title="دخول" 
            items={in2} 
            color="border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.1)]" 
            titleColor="text-green-400"
            isAltIn={true}
          />
        </div>
      )}

      {/* Stats Summary */}
      <footer className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-8 text-xs font-black uppercase tracking-widest text-gray-500">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> إجمالي المغادرين ({dayLabel()}): {departures.length}</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> إجمالي الواصلين ({dayLabel()}): {arrivals.length}</div>
      </footer>
    </div>
  );
}

function OpCard({ title, items, color, titleColor, isAltIn = false }: any) {
  return (
    <div className={`bg-[#23211F]/60 backdrop-blur-xl p-8 rounded-[2rem] border-2 transition-all duration-500 hover:scale-[1.02] min-h-[240px] ${color}`}>
      <h3 className={`text-2xl font-black mb-6 flex items-center justify-between ${titleColor}`}>
        {title}
        <span className="text-[10px] opacity-20 italic">#{isAltIn ? '2' : '1'}</span>
      </h3>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-gray-600 text-xs italic font-bold">لا توجد عمليات حالياً...</p>
        ) : (
          items.map((b: any, i: number) => (
            <div key={i} className="flex flex-col gap-1 border-r-2 border-white/10 pr-4">
                <div className="text-lg font-black text-gray-100">{b.studio || `وحدة ${b.apartmentId}`}</div>
                <div className={`text-xs font-bold ${titleColor} opacity-80`}>{b.name}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
