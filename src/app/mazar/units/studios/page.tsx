'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';

import UnitCard from '@/components/UnitCard';

export default function StudiosPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [allStudios, setAllStudios] = useState<any[]>([]);
  const [displayedStudios, setDisplayedStudios] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await fetch('/api/units');
        if (!res.ok) return;
        const allUnits = await res.json();
        const filtered = allUnits.filter((u: any) => u.type === 'studio');
        setAllStudios(filtered);
        setDisplayedStudios(filtered);

        // Fetch bookings for date filtering
        const bookingsRes = await fetch('/api/bookings');
        if (bookingsRes.ok) {
          const allB = await bookingsRes.json();
          setBookings(allB);
        }
      } catch {
        // silently fail
      }
    };
    loadUnits();
  }, []);

  useEffect(() => {
    if (!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)) {
      setDisplayedStudios(allStudios);
      return;
    }

    const filtered = allStudios.filter((unit) => {
      const hasOverlap = bookings.some((b: any) => {
        if (b.apartmentId !== unit.id) return false;
        if (['cancelled', 'deleted', 'rejected', 'مرفوض', 'ملغي'].includes(b.status)) return false;
        return (checkIn < b.checkOut && checkOut > b.checkIn);
      });
      return !hasOverlap;
    });
    setDisplayedStudios(filtered);
  }, [checkIn, checkOut, allStudios, bookings]);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D] selection:text-white">
      
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-[#EAE4D9]">
        <Link href="/">
           <Logo size={42} mdSize={48} />
        </Link>
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <Link href="/mazar/units" className="text-xs font-bold text-[#7A7061] hover:text-[#2A2723]">
            {t.unitsPage.backToCategories}
          </Link>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <header className="mb-12 md:mb-16">
           <div className="mb-6">
              <button 
                onClick={() => router.push('/mazar/units')}
                className={`text-sm font-bold text-[#C1A68D] hover:opacity-80 flex items-center gap-2`}
              >
                 {isRTL ? `← ${t.unitsPage.backToCategories}` : `← ${t.unitsPage.backToCategories}`}
              </button>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-[#2A2723] mb-4 md:mb-6 leading-tight">
             {isRTL ? 'الاستوديوهات الفندقية' : 'Hotel Studios'}
           </h1>
           <p className="text-base md:text-xl text-[#5C554B] opacity-70 max-w-3xl leading-relaxed">
              {isRTL 
                ? `استعرض مجموعة متنوعة من الاستوديوهات الفندقية الفاخرة التي تناسب احتياجاتك.` 
                : `Explore a diverse selection of premium hotel studios tailored to your needs.`}
           </p>
        </header>

        {/* Date Filter Bar */}
        <div className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9] shadow-sm mb-12 flex flex-col md:flex-row gap-6 items-end max-w-4xl">
          <div className="flex-1 w-full space-y-2">
            <label className={`block text-[10px] font-black text-[#7A7061] uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
              🛬 {isRTL ? 'تاريخ الدخول (البحث عن المتاح)' : 'Check-In Date (Search Availability)'}
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#EAE4D9]/60 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D] transition-all text-[#2A2723]"
            />
          </div>
          <div className="flex-1 w-full space-y-2">
            <label className={`block text-[10px] font-black text-[#7A7061] uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
              🛫 {isRTL ? 'تاريخ الخروج' : 'Check-Out Date'}
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#EAE4D9]/60 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D] transition-all text-[#2A2723]"
            />
          </div>
          {(checkIn || checkOut) && (
            <button
              onClick={() => { setCheckIn(''); setCheckOut(''); }}
              className="px-6 py-3.5 bg-[#2A2723] text-white rounded-xl text-xs font-black hover:bg-black transition-all shrink-0 w-full md:w-auto"
            >
              {isRTL ? 'إعادة تعيين' : 'Reset'}
            </button>
          )}
        </div>

        {/* Available Count Badge */}
        {checkIn && checkOut && new Date(checkOut) > new Date(checkIn) && (
          <div className={`mb-8 p-4 bg-[#C1A68D]/10 text-[#C1A68D] border border-[#C1A68D]/20 rounded-2xl inline-flex items-center gap-3 font-bold text-sm ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <span>✨</span>
            <span>
              {isRTL 
                ? `وجدنا ${displayedStudios.length} استوديو متاح لهذه التواريخ` 
                : `Found ${displayedStudios.length} available studios for these dates`}
            </span>
          </div>
        )}

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {displayedStudios.map((unit: any) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>

        {displayedStudios.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm mt-8">
            <span className="text-4xl block mb-4">📭</span>
            <h3 className="text-xl font-bold text-[#2A2723]">
              {isRTL ? 'عذراً، لا توجد استوديوهات متاحة في هذه التواريخ.' : 'Sorry, no studios available for these dates.'}
            </h3>
            <p className="text-sm text-[#7A7061] mt-2">
              {isRTL ? 'جرب البحث بتواريخ أخرى.' : 'Try searching with different dates.'}
            </p>
          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}
