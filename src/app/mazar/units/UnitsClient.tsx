'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { units } from '@/lib/data';

import { Home, Menu, Search, Grid, ShoppingCart } from 'lucide-react';

export default function UnitsListingPage() {
  const { t, media, isRTL, language } = useLanguage();
  const [counts, setCounts] = useState({ studios: 4, apts: 3 });

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const res = await fetch('/api/units');
        if (!res.ok) return;
        const allStudios = await res.json();
        const availableStudios = units.filter(u => u.type === 'studio' && allStudios.find((s: any) => s.id === u.id)?.status === 'متاح').length;
        const availableApts = units.filter(u => u.type === 'apartment' && allStudios.find((s: any) => s.id === u.id)?.status === 'متاح').length;
        setCounts({ studios: availableStudios, apts: availableApts });
      } catch {
        // silently fail, keep default counts
      }
    };
    loadCounts();
  }, []);

  const categories = [
    {
      id: 'studios',
      title: isRTL ? 'الاستوديوهات' : 'Studios',
      image: media.branch1Image,
      link: '/mazar/units/studios',
      count: counts.studios
    },
    {
      id: 'apartments',
      title: isRTL ? 'الشقق الفندقية' : 'Apartments',
      image: media.apartmentsImage,
      link: '/mazar/units/apartments',
      count: counts.apts
    }
  ];

  return (
    <main className="min-h-screen bg-[#E5E5E5] text-[#2A2723] font-cairo pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Bar (Optional, matches screenshot feel) */}
      <div className="w-full bg-[#1A1A1A] text-white py-4 px-6 flex justify-between items-center text-sm font-bold shadow-lg mb-8">
        <div className="flex items-center gap-2">
           <span className="text-lg">→</span>
           <span>{isRTL ? 'هل ترغب بالتسوق دولياً؟ انقر هنا' : 'Want to shop internationally? Click here'}</span>
        </div>
      </div>

      <div className="px-6 space-y-10">
        {/* Title */}
        <h1 className="text-3xl font-black text-[#2A2723] px-2">
          {isRTL ? 'المجموعات' : 'Collections'}
        </h1>

        {/* Horizontal Scroll / Grid of Categories */}
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x px-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="flex-shrink-0 w-[85%] md:w-[400px] group snap-start"
            >
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-sm mb-4">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-[#2A2723]">{cat.title}</h2>
                <span className="text-2xl">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Large Featured Card (like the bottom one in screenshot) */}
        <div className="px-2 pb-10">
           <div className="relative aspect-[3/4] md:aspect-video rounded-[2rem] overflow-hidden shadow-lg group">
              <img 
                src={media.branch1Image} 
                alt="Featured" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6">
                <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-xl flex items-center gap-3 font-bold text-sm">
                   En <span>⌄</span>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Navigation (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-gray-200 px-6 py-4 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-2xl">
        <div className="flex flex-col items-center gap-1 opacity-40">
          <ShoppingCart size={24} />
          <span className="text-[10px] font-bold">{isRTL ? 'عربة التسوق' : 'Cart'}</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <Grid size={24} />
          <span className="text-[10px] font-black">{isRTL ? 'محل' : 'Shop'}</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <Search size={24} />
          <span className="text-[10px] font-bold">{isRTL ? 'بحث' : 'Search'}</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <Menu size={24} />
          <span className="text-[10px] font-bold">{isRTL ? 'قائمة طعام' : 'Menu'}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-mazar-coffee">
          <Home size={24} />
          <span className="text-[10px] font-black">{isRTL ? 'بيت' : 'Home'}</span>
        </div>
      </div>
    </main>
  );
}
