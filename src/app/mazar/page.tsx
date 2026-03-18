'use client';

import React from 'react';
import Link from 'next/link';

export default function MazarHybridLanding() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D] selection:text-white overflow-x-hidden relative" style={{ fontFamily: 'Calibri, sans-serif' }}>
      
      {/* Background Ambient Glows (Light/Warm mode) */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#EAE4D9]/40 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#D5C5B3]/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Navigation (Light) */}
      <nav className="w-full px-8 py-5 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-[#EAE4D9]">
        <Link href="/mazar" className="text-3xl font-bold tracking-tight text-[#2A2723] flex items-center gap-2">
            مزار 
            <span className="w-2 h-2 rounded-full bg-[#C1A68D]"></span>
        </Link>
        
        <div className="hidden md:flex gap-10 text-sm font-bold text-[#5C554B]">
          <Link href="/mazar/about" className="hover:text-[#2A2723] transition-colors">عن المكان</Link>
          <Link href="/mazar/rules" className="hover:text-[#2A2723] transition-colors">قوانين المكان</Link>
          <Link href="/mazar/how-to-book" className="hover:text-[#2A2723] transition-colors">طريقة الحجز</Link>
        </div>

        <Link href="/mazar/book" className="bg-[#2A2723] text-white text-sm font-bold px-8 py-2.5 rounded-full hover:bg-[#3E3A35] hover:shadow-lg transition-all">
          تجربة الحجز
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-6 flex flex-col items-center text-center relative z-10">
        
        {/* Top Pill / Badge */}
        <div className="bg-white border border-[#EAE4D9] text-[#7A7061] px-5 py-2 rounded-full text-xs font-bold mb-8 shadow-sm">
          ✨ تجربة إقامة متكاملة في قلب مدينة نصر
        </div>

        {/* Big Titles */}
        <h1 className="text-5xl md:text-7xl font-bold text-[#2A2723] mb-4 tracking-tight leading-tight">
          إقامة فندقية فاخرة..
        </h1>
        <h2 className="text-4xl md:text-6xl font-light italic text-[#7A7061] mb-8">
          بتجربة مختلفة
        </h2>

        {/* Subtitle */}
        <p className="max-w-2xl text-lg md:text-xl text-[#5C554B] leading-relaxed mb-16 px-4">
          في مزار بنقدملك تجربة إقامة متكاملة مش مكان مفروش. ستوديوهات مجهزة بالكامل، دخول ذكي بدون مفاتيح، وخدمة و ريسبشن 24 ساعة… علشان تعيش راحتك فعلاً.
        </p>

        {/* Overlapping Images (Luxury Light Style) */}
        <div className="relative w-full max-w-5xl h-[450px] md:h-[550px] mt-4 rounded-3xl z-10">
           {/* Left Image (Front/Lower) - Glass Frame */}
           <div className="absolute right-0 md:right-10 bottom-0 md:-bottom-16 w-[85%] md:w-[55%] h-[320px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-20 group">
              <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors z-10 duration-500" />
              <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop" alt="Studio Bedroom" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" />
              
              <div className="absolute bottom-6 right-6 left-6 bg-white/90 backdrop-blur-md p-5 rounded-2xl text-right z-20 shadow-sm border border-gray-100">
                 <h3 className="font-bold text-[#2A2723] text-xl mb-1">رفاهية الإقامة</h3>
                 <p className="text-sm text-[#7A7061]">وراحة من أول لحظة</p>
              </div>
           </div>

           {/* Right Image (Back/Higher) */}
           <div className="absolute left-0 md:left-10 top-0 w-[85%] md:w-[65%] h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-xl border border-[#EAE4D9] z-10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 z-10" />
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop" alt="Luxury Living Room" className="w-full h-full object-cover" />
           </div>
        </div>
      </section>

      {/* The About, Features, and Goal sections were moved to their respective pages. */}

      {/* Footer */}
      <footer className="py-12 text-center text-[#5C554B] border-t border-[#EAE4D9] bg-white">
         <div className="text-3xl font-bold text-[#2A2723] mb-6 flex items-center justify-center gap-2">
           مزار <span className="w-1 h-1 rounded-full bg-[#C1A68D]"></span>
         </div>
         <div className="flex justify-center gap-6 mb-8 text-sm font-bold">
           <Link href="/mazar/how-to-book" className="hover:text-[#C1A68D]">الشروط والأحكام</Link>
           <Link href="/mazar/how-to-book" className="hover:text-[#C1A68D]">طريقة الحجز</Link>
           <Link href="/mazar/rules" className="hover:text-[#C1A68D]">قوانين المكان</Link>
         </div>
         <p className="text-sm opacity-80">جميع الحقوق محفوظة © 2026 لمشروع مزار.</p>
      </footer>

    </main>
  );
}
