'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';
import { units } from '@/lib/data';
import { getStudios } from '@/lib/data-init';

export default function UnitsListingPage() {
  const { t, media, isRTL, language } = useLanguage();


  const [counts, setCounts] = useState({ studios: 4, apts: 3 });

  useEffect(() => {
    const loadCounts = async () => {
      const allStudios = await getStudios();

      const availableStudios = units.filter(u => u.type === 'studio' && allStudios.find((s: any) => s.id === u.id)?.status === 'متاح').length;
      const availableApts = units.filter(u => u.type === 'apartment' && allStudios.find((s: any) => s.id === u.id)?.status === 'متاح').length;

      setCounts({ studios: availableStudios, apts: availableApts });
    };
    loadCounts();
  }, []);

  const categories = [
    {
      id: 'studios',
      title: isRTL ? 'الاستوديوهات' : 'Studios',
      subtitle: isRTL ? '٤ استوديوهات فندقية متنوعة' : '4 Diverse Hotel Studios',
      image: media.branch1Image,
      link: '/mazar/units/studios',
      count: counts.studios
    },
    {
      id: 'apartments',
      title: t.unitsPage.apartments,
      subtitle: isRTL ? '٣ شقق فندقية واسعة' : '3 Spacious Apartments',
      image: media.apartmentsImage,
      link: '/mazar/units/apartments',
      count: counts.apts
    }
  ];

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D] selection:text-white">

      {/* Navigation */}
      <nav className="w-full px-4 md:px-6 py-4 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-[#EAE4D9]">
        <Link href="/" className="shrink-0">
          <Logo size={36} mdSize={42} />
        </Link>
        <div className="flex items-center gap-3 md:gap-6">
          <LanguageSwitcher />
          <Link href="/" className="text-[10px] md:text-xs font-bold text-[#7A7061] hover:text-[#2A2723] uppercase">
            {isRTL ? 'الرئيسية' : 'Home'}
          </Link>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-6 py-12 md:py-20">

        {/* Header */}
        <header className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-[#2A2723] mb-4 md:mb-6 leading-tight tracking-tighter">
            {t.unitsPage.title}
          </h1>
        </header>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-5xl mx-auto">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="group relative h-[380px] md:h-[500px] rounded-[30px] md:rounded-[40px] overflow-hidden border border-[#EAE4D9]/50 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block"
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Overlay (Glassmorphism) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A2723]/95 via-[#2A2723]/40 to-transparent" />

              {/* Content */}
              <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-10 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="mb-3 md:mb-4 inline-block bg-white/10 backdrop-blur-md border border-white/20 px-3 md:px-4 py-1.5 rounded-full text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                  {cat.count} {t.unitsPage.availableUnits}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-2 leading-tight">{cat.title}</h2>
                <p className="text-[#EAE4D9] text-sm md:text-base opacity-70 mb-4 md:mb-6 font-bold">{cat.subtitle}</p>

                <div className="flex items-center gap-3 text-white text-xs md:text-sm font-black group-hover:gap-5 transition-all">
                  {isRTL ? 'استكشف الوحدات' : 'Explore Units'}
                  <span className={`text-xl transform transition-transform ${isRTL ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`}>
                    {isRTL ? '←' : '→'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      <Footer />
    </main>
  );
}
