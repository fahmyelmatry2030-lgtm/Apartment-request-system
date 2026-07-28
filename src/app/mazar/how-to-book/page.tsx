'use client';
import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';

export default function HowToBookPage() {
  const { t, isRTL } = useLanguage();

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D] selection:text-white overflow-x-hidden relative">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#EAE4D9]/40 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#D5C5B3]/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full px-4 md:px-8 py-4 md:py-5 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-[#EAE4D9]">
        <Link href="/" className="shrink-0">
           <Logo size={36} mdSize={40} />
        </Link>
        
        <div className="hidden md:flex gap-10 text-sm font-bold text-[#5C554B]">
          <Link href="/mazar/units" className="hover:text-[#2A2723] transition-colors">{t.common.ourUnits}</Link>
          <Link href="/mazar/about" className="hover:text-[#2A2723] transition-colors">{t.common.about}</Link>
          <Link href="/mazar/rules" className="hover:text-[#2A2723] transition-colors">{t.common.rules}</Link>
          <Link href="/mazar/how-to-book" className="text-[#C1A68D] transition-colors">{t.common.howToBook}</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSwitcher />
          <Link href="/mazar/book" className="hidden xs:inline-flex bg-[#2A2723] text-white text-[10px] md:text-sm font-bold px-4 md:px-8 py-2 md:py-2.5 rounded-full hover:bg-[#3E3A35] transition-all">
            {t.common.bookNow}
          </Link>
        </div>
      </nav>

      {/* Mobile sub-navigation bar for quick links */}
      <div className="md:hidden flex items-center justify-start gap-4 px-4 py-3 border-b border-[#EAE4D9]/50 overflow-x-auto scrollbar-hide bg-white/70 backdrop-blur-md sticky top-[58px] z-40 w-full text-xs font-black text-[#5C554B]" dir={isRTL ? 'rtl' : 'ltr'}>
        <Link href="/mazar/units" className="hover:text-[#C1A68D] whitespace-nowrap bg-[#C1A68D]/10 text-[#C1A68D] px-3.5 py-1.5 rounded-full">{t.common.ourUnits}</Link>
        <Link href="/mazar/about" className="hover:text-[#C1A68D] whitespace-nowrap px-2 py-1.5">{t.common.about}</Link>
        <Link href="/mazar/how-to-book" className="hover:text-[#C1A68D] whitespace-nowrap px-2 py-1.5">{t.common.howToBook}</Link>
        <Link href="/mazar/rules" className="hover:text-[#C1A68D] whitespace-nowrap px-2 py-1.5">{t.common.rules}</Link>
        <Link href="/social" className="hover:text-[#C1A68D] whitespace-nowrap px-2 py-1.5">{isRTL ? 'روابطنا' : 'Social'}</Link>
      </div>

      {/* Header */}
      <section className="pt-16 md:pt-24 pb-12 md:pb-16 px-6 text-center">
        <h1 className="text-3xl md:text-6xl font-black text-[#2A2723] mb-4 tracking-tighter leading-tight">{t.howToBookPage.title}</h1>
        <p className="text-base md:text-lg text-[#7A7061] max-w-2xl mx-auto font-bold opacity-70">{t.howToBookPage.subtitle}</p>
      </section>

      {/* Steps Content */}
      <section className="py-8 md:py-16 max-w-4xl mx-auto px-4 md:px-6 relative z-10">
         <div className="space-y-4 md:space-y-6">
            {t.howToBookPage.steps.map((step, i) => (
              <div key={i} className={`bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#EAE4D9]/60 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 relative ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse text-left'}`}>
                  <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-full bg-[#FDFBF7] border border-[#EAE4D9] flex items-center justify-center text-xl md:text-2xl font-black text-[#C1A68D] shadow-inner">{i + 1}</div>
                  <div className="flex-1 text-center md:text-inherit">
                      <h3 className="text-xl md:text-2xl font-black text-[#2A2723] mb-2">{step.title}</h3>
                      <p className="text-sm md:text-base text-[#5C554B] leading-relaxed font-bold opacity-80">{step.desc}</p>
                  </div>
              </div>
            ))}
         </div>

         <div className="mt-12 md:mt-16 text-center">
            <Link href="/mazar/book" className="w-full md:w-auto inline-block bg-[#2A2723] text-white text-base md:text-lg font-black px-10 md:px-14 py-4 md:py-5 rounded-full hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {t.howToBookPage.cta}
            </Link>
         </div>
      </section>

      <Footer />
    </main>
  );
}
