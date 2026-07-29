'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';
import UnitCard from '@/components/UnitCard';

export default function UnitsListingPage() {
  const { t, media, isRTL, language } = useLanguage();
  const router = useRouter();

  const [counts, setCounts] = useState({ studios: 30, apts: 3 });
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [allUnits, setAllUnits] = useState<any[]>([]);
  const [displayedUnits, setDisplayedUnits] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/units');
        if (!res.ok) return;
        const data = await res.json();
        setAllUnits(data);

        // Fetch bookings for date filtering
        const bookingsRes = await fetch('/api/bookings');
        const bData = bookingsRes.ok ? await bookingsRes.json() : [];
        setBookings(bData);

        // Calculate counts
        const availableStudios = data.filter((u: any) => u.type === 'studio' && u.status === 'متاح').length;
        const availableApts = data.filter((u: any) => u.type === 'apartment' && u.status === 'متاح').length;
        setCounts({ studios: availableStudios, apts: availableApts });
      } catch {
        // silently fail
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)) {
      alert(isRTL ? 'يرجى إدخال تواريخ صحيحة' : 'Please enter valid dates');
      return;
    }

    setIsSearching(true);
    // Overlap filtering
    const available = allUnits.filter((unit: any) => {
      if (unit.status !== 'متاح') return false;
      const hasOverlap = bookings.some((b: any) => {
        if (b.apartmentId !== unit.id) return false;
        if (['cancelled', 'deleted', 'rejected', 'مرفوض', 'ملغي'].includes(b.status)) return false;
        return (checkIn < b.checkOut && checkOut > b.checkIn);
      });
      return !hasOverlap;
    });

    setDisplayedUnits(available);
    setHasSearched(true);
    setIsSearching(false);
  };

  const handleReset = () => {
    setCheckIn('');
    setCheckOut('');
    setDisplayedUnits([]);
    setHasSearched(false);
  };

  const categories = [
    {
      id: 'studios',
      title: isRTL ? 'الاستوديوهات الفندقية' : 'Hotel Studios',
      desc: isRTL 
        ? 'ستوديوهات فاخرة فردية، زوجية، وثلاثية مجهزة بأنظمة دخول ذكية ومكيفة بالكامل.' 
        : 'Premium single, double, and triple studios equipped with smart access and fully air-conditioned.',
      image: media.branch1Image,
      link: '/mazar/units/studios',
      count: counts.studios
    },
    {
      id: 'apartments',
      title: isRTL ? 'الشقق الفندقية العائلية' : 'Luxury Apartments',
      desc: isRTL 
        ? 'شقق فندقية واسعة ومؤثثة بالكامل تناسب العائلات الكبيرة والباحثين عن المساحات الرحبة.' 
        : 'Spacious, fully furnished hotel apartments suitable for families and seekers of broad spaces.',
      image: media.apartmentsImage,
      link: '/mazar/units/apartments',
      count: counts.apts
    }
  ];

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2A2723] font-sans pb-24 selection:bg-[#C1A68D] selection:text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Navigation */}
      <nav className="w-full px-4 md:px-8 py-3 md:py-5 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-[#EAE4D9]">
         <Link href="/" className="shrink-0">
            <Logo size={45} mdSize={54} />
         </Link>

         <div className="hidden md:flex gap-10 text-sm font-bold text-[#5C554B]">
            <Link href="/mazar/units" className="text-[#C1A68D] transition-colors">{t.common.ourUnits}</Link>
            <Link href="/mazar/about" className="hover:text-[#2A2723] transition-colors">{t.common.about}</Link>
            <Link href="/mazar/rules" className="hover:text-[#2A2723] transition-colors">{t.common.rules}</Link>
            <Link href="/mazar/how-to-book" className="hover:text-[#2A2723] transition-colors">{t.common.howToBook}</Link>
         </div>

         <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher />
            <Link href="/mazar/book" className="hidden xs:inline-flex bg-[#2A2723] text-white text-[10px] md:text-sm font-bold px-4 md:px-8 py-2 md:py-2.5 rounded-full hover:bg-[#3E3A35] transition-all">
               {t.common.bookNow}
            </Link>
         </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-6 py-12 md:py-20 space-y-16">
        
        {/* Header Section */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block bg-[#C1A68D]/10 text-[#C1A68D] border border-[#C1A68D]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            {isRTL ? 'مزار للفنادق والاستوديوهات' : 'Mazar Hotel & Studios'}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#2A2723] tracking-tighter leading-tight">
            {isRTL ? 'مجموعات الإقامة الفاخرة' : 'Luxury Accommodation Collections'}
          </h1>
          <p className="text-base md:text-xl text-[#5C554B] leading-relaxed opacity-70">
            {isRTL 
              ? 'تصفح وحداتنا المجهزة بالكامل بأحدث التقنيات الذكية في مدينة نصر. اختر المجموعة المناسبة لاحتياجاتك.'
              : 'Browse our fully equipped hotel units with smart features in Nasr City. Choose the perfect stay for you.'}
          </p>
        </header>

        {/* Category Cards (Studios & Apartments) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="group relative flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-[#EAE4D9] shadow-sm hover:shadow-2xl hover:border-[#C1A68D] transition-all duration-500"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] md:aspect-video w-full relative overflow-hidden bg-[#F7F5F0]">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A2723]/90 via-[#2A2723]/30 to-transparent opacity-80" />
                
                {/* Available Badge on Card Image */}
                <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-[#2A2723] shadow-md flex items-center gap-2`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span>{cat.count} {isRTL ? 'وحدة متاحة' : 'Available'}</span>
                </div>
              </div>

              {/* Content Description */}
              <div className={`p-8 md:p-10 space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h2 className="text-3xl md:text-4xl font-black text-[#2A2723] tracking-tight group-hover:text-[#C1A68D] transition-colors">
                  {cat.title}
                </h2>
                <p className="text-sm md:text-base text-[#5C554B] leading-relaxed opacity-85">
                  {cat.desc}
                </p>
                <div className="pt-4 flex items-center justify-between border-t border-[#F0EBE3] mt-6">
                  <span className="text-sm font-black text-[#2A2723] group-hover:text-[#C1A68D] transition-colors">
                    {isRTL ? 'استكشف هذه المجموعة' : 'Explore this Collection'}
                  </span>
                  <span className={`text-2xl transform transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`}>
                    {isRTL ? '←' : '→'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Smart Date Availability Search Widget */}
        <section className="bg-white p-8 md:p-12 rounded-[3rem] border border-[#EAE4D9] shadow-xl max-w-4xl mx-auto space-y-8">
          <header className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="text-2xl md:text-3xl font-black text-[#2A2723] tracking-tight">
              🔍 {isRTL ? 'البحث الذكي عن الوحدات المتاحة' : 'Smart Availability Search'}
            </h3>
            <p className="text-xs md:text-sm text-[#7A7061] font-bold opacity-80">
              {isRTL 
                ? 'أدخل تاريخ الدخول وتاريخ الخروج لتظهر لك فوراً جميع الغرف والشقق المتاحة للحجز.' 
                : 'Enter your check-in and check-out dates to view all available rooms and apartments instantly.'}
            </p>
          </header>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className={`block text-[10px] font-black text-[#7A7061] uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                🛬 {isRTL ? 'تاريخ الدخول' : 'Check-In Date'}
              </label>
              <input
                type="date"
                required
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
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#EAE4D9]/60 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D] transition-all text-[#2A2723]"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                type="submit"
                disabled={isSearching}
                className="flex-1 md:flex-none px-8 py-3.5 bg-[#2A2723] text-white rounded-xl text-xs font-black hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSearching ? '...' : (isRTL ? 'بحث عن المتاح' : 'Search')}
              </button>
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3.5 bg-[#F7F5F0] text-[#7A7061] border border-[#EAE4D9] rounded-xl text-xs font-bold hover:bg-gray-100 transition-all"
                >
                  {isRTL ? 'إعادة تعيين' : 'Reset'}
                </button>
              )}
            </div>
          </form>

          {/* Search Results Display inline */}
          {hasSearched && (
            <div className="pt-6 border-t border-[#F0EBE3] space-y-6">
              <h4 className={`text-lg font-black text-[#2A2723] flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <span>✨</span>
                <span>
                  {isRTL 
                    ? `الوحدات المتاحة (${displayedUnits.length} وحدة)` 
                    : `Available Units (${displayedUnits.length} units)`}
                </span>
              </h4>

              {displayedUnits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedUnits.map((unit) => (
                    <UnitCard key={unit.id} unit={unit} checkIn={checkIn} checkOut={checkOut} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#FDFBF7] rounded-3xl border border-dashed border-[#EAE4D9]">
                  <span className="text-3xl block mb-2">📭</span>
                  <p className="text-sm font-bold text-[#7A7061]">
                    {isRTL 
                      ? 'عذراً، لا توجد وحدات متاحة في هذه التواريخ. جرب تغييرهما.' 
                      : 'Sorry, no units available for these dates. Try different dates.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

      </div>

      <Footer />
    </main>
  );
}
