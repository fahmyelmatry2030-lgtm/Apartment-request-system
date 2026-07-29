'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';

import UnitCard from '@/components/UnitCard';
import ScrollReveal from '@/components/ScrollReveal';
import { motion } from 'framer-motion';

export default function HomeClient() {
  const { t, media, isRTL } = useLanguage();
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await fetch('/api/units?categories=true');
        if (!res.ok) throw new Error('Failed to fetch units');
        const allUnits = await res.json();
        setUnits(allUnits);
      } catch (e) {
        console.error('Failed to load units on home page:', e);
      } finally {
        setLoading(false);
      }
    };
    loadUnits();
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D] selection:text-white overflow-x-hidden relative">

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-[#EAE4D9]/40 rounded-full blur-[60px] md:blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-[#D5C5B3]/20 rounded-full blur-[50px] md:blur-[100px] -z-10 pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full px-4 md:px-8 py-5 md:py-8 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/85 backdrop-blur-xl border-b border-[#EAE4D9] shadow-sm">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <Logo size={isRTL ? 60 : 65} mdSize={90} imageClassName="max-h-[100px]" transparent />
        </Link>

        {/* Center: Desktop Nav & Lang Switcher */}
        <div className="flex items-center gap-3 md:gap-10 px-2">
          <div className="hidden md:flex items-center gap-8 text-base md:text-lg font-black text-[#5C554B]">
            <Link href="/mazar/units" className="hover:text-[#C1A68D] transition-colors">{t.common.ourUnits}</Link>
            <Link href="/mazar/about" className="hover:text-[#C1A68D] transition-colors">{t.common.about}</Link>
            <Link href="/mazar/how-to-book" className="hover:text-[#C1A68D] transition-colors">{t.common.howToBook}</Link>
            <Link href="/mazar/rules" className="hover:text-[#C1A68D] transition-colors">{t.common.rules}</Link>
            <Link href="/social" className="hover:text-[#C1A68D] transition-colors">روابطنا</Link>
          </div>
          <div className="w-px h-6 bg-[#EAE4D9] hidden md:block" />
          <div className="scale-110 md:scale-125 origin-center">
             <LanguageSwitcher />
          </div>
        </div>

        {/* Book Now (Hidden on very small mobile, visible on tablet+) */}
        <Link href="/mazar/book" className="hidden sm:inline-flex bg-[#2A2723] text-white text-xs md:text-sm font-black min-w-[90px] px-6 md:px-10 py-3 md:py-4 rounded-full hover:bg-black hover:scale-105 transition-all text-center leading-tight shadow-md">
          {isRTL ? 'احجز\nالآن' : 'BOOK\nNOW'}
        </Link>
      </nav>

      {/* Mobile sub-navigation bar for quick links */}
      <div className="md:hidden flex items-center justify-start gap-4 px-4 py-3 border-b border-[#EAE4D9]/50 overflow-x-auto scrollbar-hide bg-white/70 backdrop-blur-md sticky top-[68px] z-40 w-full text-xs font-black text-[#5C554B]" dir={isRTL ? 'rtl' : 'ltr'}>
        <Link href="/mazar/units" className="hover:text-[#C1A68D] whitespace-nowrap bg-[#C1A68D]/10 text-[#C1A68D] px-3.5 py-1.5 rounded-full">{t.common.ourUnits}</Link>
        <Link href="/mazar/about" className="hover:text-[#C1A68D] whitespace-nowrap px-2 py-1.5">{t.common.about}</Link>
        <Link href="/mazar/how-to-book" className="hover:text-[#C1A68D] whitespace-nowrap px-2 py-1.5">{t.common.howToBook}</Link>
        <Link href="/mazar/rules" className="hover:text-[#C1A68D] whitespace-nowrap px-2 py-1.5">{t.common.rules}</Link>
        <Link href="/social" className="hover:text-[#C1A68D] whitespace-nowrap px-2 py-1.5">{isRTL ? 'روابطنا' : 'Social'}</Link>
      </div>

      {/* Hero Section */}
      <section className="pt-12 md:pt-20 pb-16 px-6 flex flex-col items-center text-center relative z-10 w-full max-w-screen-2xl mx-auto">

        {/* Background Decorative Logo (Scaled for mobile) */}
        <div className={`absolute top-[-20px] md:top-[30px] ${isRTL ? 'right-[-20px] md:right-[-120px]' : 'left-[-20px] md:left-[-120px]'} z-0 opacity-10 md:opacity-20 pointer-events-none`}>
          <Logo
            size={150}
            imageClassName="w-[180px] md:w-[450px] h-auto max-h-none"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-[#2A2723] mb-4 tracking-tighter leading-[1.1]">
            {t.common.luxuryStay}
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-[#5C554B] mb-10 opacity-90">
            {t.common.differentExperience}
          </h2>

          {/* Marketing Subtitle */}
          <p className="max-w-2xl mx-auto text-base md:text-2xl text-[#2A2723] leading-relaxed mb-6 px-2 font-bold opacity-80">
            {t.common.heroSubtitle}
          </p>

          {/* Services Badges */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12 bg-[#C1A68D]/5 p-3 md:p-6 rounded-[2rem] md:rounded-[3rem] border border-[#C1A68D]/10">
            {(t.common.heroServices as { icon: string; label: string }[]).map((service, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-white border border-[#EAE4D9]/50 px-3 md:px-5 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-sm md:text-base">{service.icon}</span>
                <span className="text-[10px] md:text-sm font-bold text-[#4A3F2F]">
                  {service.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 bg-white/50 backdrop-blur-md border border-[#EAE4D9] rounded-3xl px-6 md:px-12 py-5 flex flex-row gap-6 md:gap-12 items-center justify-center">
          <ScrollReveal delay={0.2} direction="down">
            <div className="text-center">
              <span className="block text-xl md:text-3xl font-black text-[#2A2723]">24</span>
              <span className="text-[8px] md:text-[10px] font-bold text-[#7A7061] uppercase tracking-wider">{t.unitsPage.branch1} & {t.unitsPage.branch2}</span>
            </div>
          </ScrollReveal>
          <div className="w-px h-8 bg-[#EAE4D9]" />
          <ScrollReveal delay={0.3} direction="down">
            <div className="text-center">
              <span className="block text-xl md:text-3xl font-black text-[#2A2723]">3</span>
              <span className="text-[8px] md:text-[10px] font-bold text-[#7A7061] uppercase tracking-wider">{t.unitsPage.apartments}</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Units Display Section - DIRECTLY UNDER STATS */}
        <ScrollReveal delay={0.4}>
          <div className="w-full max-w-7xl mt-16 px-4">
             {loading ? (
               <div className="py-20 flex justify-center">
                  <div className="w-12 h-12 border-4 border-[#C1A68D] border-t-transparent rounded-full animate-spin"></div>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {units.map((unit) => (
                   <UnitCard key={unit.id} unit={unit} />
                 ))}
               </div>
             )}
          </div>
        </ScrollReveal>

        {/* Feature Highlights (Horizontal on mobile) */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-16 text-[9px] md:text-[11px] font-black text-[#9A8F82] uppercase tracking-widest bg-white/30 px-6 py-3 rounded-full">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> {isRTL ? 'تأكيد فوري' : 'Instant Confirm'}
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span> {isRTL ? 'دخول ذكي' : 'Smart Access'}
          </div>
          <div className="flex items-center gap-2">
            <span>⭐</span> {isRTL ? 'خدمة فندقية' : 'Hotel Service'}
          </div>
        </div>

        {/* Visual Showcase */}
        <ScrollReveal delay={0.6} direction="up" distance={100}>
          <div className="relative w-full max-w-6xl mt-20 flex flex-col md:block min-h-[500px] md:h-[600px] gap-6">

            {/* Main Showcase Image (Right on Desktop, Top on Mobile) */}
            <div className={`relative md:absolute ${isRTL ? 'md:left-0' : 'md:right-0'} md:top-0 w-full md:w-[70%] h-[300px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-xl z-10`}>
              <NextImage
                src={media.homeHeroRight}
                alt="Luxury Living"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
            </div>

            {/* Secondary Detail Image (Left on Desktop, Bottom on Mobile) */}
            <div className={`relative md:absolute ${isRTL ? 'md:right-0 md:bottom-0' : 'md:left-0 md:bottom-0'} w-full md:w-[50%] h-[280px] md:h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] md:border-[12px] border-white z-20 md:-mt-32`}>
              <NextImage
                src={media.homeHeroLeft}
                alt="Cozy Studio"
                fill
                className="object-cover"
              />
              <div className={`absolute bottom-4 md:bottom-8 ${isRTL ? 'right-4 md:right-8 left-4 md:left-8 text-right' : 'left-4 md:left-8 right-4 md:right-8 text-left'} bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-xl border border-gray-100`}>
                <h3 className="font-bold text-[#2A2723] text-lg md:text-xl mb-1">{t.common.features.quiet}</h3>
                <p className="text-xs md:text-sm text-[#7A7061] leading-relaxed">{t.common.features.quietDesc}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>


      <Footer />
    </main>
  );
}
