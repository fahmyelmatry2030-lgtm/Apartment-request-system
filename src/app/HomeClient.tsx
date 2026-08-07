'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AvailabilityBanner from '@/components/AvailabilityBanner';
import BranchCard from '@/components/BranchCard';
import { useLanguage } from '@/lib/LanguageContext';
import { 
  BuildingOffice2Icon, 
  DocumentTextIcon, 
  BookOpenIcon, 
  CalendarDaysIcon, 
  DevicePhoneMobileIcon 
} from '@heroicons/react/24/solid';

// ─── Quick Nav Items ────────────────────────────────────────────────
const NAV_BOXES = [
  { icon: BuildingOffice2Icon, label: 'عن مزار',        href: '/mazar/about',        color: 'from-amber-50 to-orange-50',   border: 'border-amber-200',  text: 'text-amber-800'  },
  { icon: DocumentTextIcon,  label: 'قوانين الإقامة', href: '/mazar/rules',        color: 'from-blue-50 to-sky-50',       border: 'border-blue-200',   text: 'text-blue-800'   },
  { icon: BookOpenIcon,  label: 'كيفية الحجز',    href: '/mazar/how-to-book',  color: 'from-violet-50 to-purple-50',  border: 'border-violet-200', text: 'text-violet-800' },
  { icon: CalendarDaysIcon, label: 'ابدأ الحجز الان',      href: '/mazar/book',         color: 'from-green-50 to-emerald-50',  border: 'border-green-200',  text: 'text-green-800'  },
  { icon: DevicePhoneMobileIcon, label: 'السوشيال ميديا', href: '/social',             color: 'from-indigo-50 to-blue-50',    border: 'border-indigo-200', text: 'text-indigo-800' },
];

// ─── Branch 1 Images ────────────────────────────────────────────────
const BRANCH1_IMAGES = [
  '/images/Mazar%201%20Pictures/mazar1-hero.jpg',
  '/images/Mazar%201%20Pictures/2026%201.jpeg',
  '/images/Mazar%201%20Pictures/2026.jpeg',
  '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.16_ff8ccd08.jpg',
  '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.24_989640c4.jpg',
  '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.25_2995ad23.jpg',
];

// ─── Branch 2 Images ────────────────────────────────────────────────
const BRANCH2_IMAGES = [
  '/images/Mazar%202%20Pictures/20260218_015423.jpg',
  '/images/Mazar%202%20Pictures/20260218_015425.jpg',
  '/images/Mazar%202%20Pictures/20260218_023924.jpg',
  '/images/Mazar%202%20Pictures/20260218_171702.jpg',
  '/images/Mazar%202%20Pictures/20260218_183029.jpg',
  '/images/Mazar%202%20Pictures/20260218_185108.jpg',
];

// ─── External Apartments ────────────────────────────────────────────
const EXTERNAL_APARTMENTS = [
  {
    id: 'ext-1',
    title: 'شقة مزار الخارجية 1',
    address: 'مدينة نصر، القاهرة',
    mapsUrl: 'https://maps.google.com/?q=Nasr+City+Cairo',
    images: [
      '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.33_361d04a7.jpg',
      '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.35_8ae4078a.jpg',
      '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.36_a209e979.jpg',
    ],
    browseHref: '/mazar/units/apartments',
    unitId: 'p-s25',
  },
  {
    id: 'ext-2',
    title: 'شقة مزار الخارجية 2',
    address: 'مدينة نصر، القاهرة',
    mapsUrl: 'https://maps.google.com/?q=Nasr+City+Cairo',
    images: [
      '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.37_46a06ccb.jpg',
      '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.38_e7c5836c.jpg',
      '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.39_9b4da674.jpg',
    ],
    browseHref: '/mazar/units/apartments',
    unitId: 'p-s26',
  },
  {
    id: 'ext-3',
    title: 'شقة مزار الخارجية 3',
    address: 'مدينة نصر، القاهرة',
    mapsUrl: 'https://maps.google.com/?q=Nasr+City+Cairo',
    images: [
      '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.40_789a6fdb.jpg',
      '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.40_ebec746d.jpg',
      '/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.40_5586b607.jpg',
    ],
    browseHref: '/mazar/units/apartments',
    unitId: 'p-s27',
  },
];

// ─── External Apartment Card ─────────────────────────────────────────
function ExternalApartmentCard({ apt }: { apt: typeof EXTERNAL_APARTMENTS[0] }) {
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-white border border-[#EAE4D9] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500" dir="rtl">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EBE3]">
        <img
          src={!imgError ? apt.images[activeImg] : apt.images[0]}
          alt={apt.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {/* Thumbnail dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {apt.images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActiveImg(i); setImgError(false); }}
              className={`w-2 h-2 rounded-full transition-all ${activeImg === i ? 'bg-white scale-125' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-[#FDFBF7] border-b border-[#EAE4D9]">
        {apt.images.map((img, i) => (
          <button
            key={i}
            onClick={() => { setActiveImg(i); setImgError(false); }}
            className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
              activeImg === i ? 'border-[#C1A68D] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h4 className="text-xl font-black text-[#2A2723]">{apt.title}</h4>

        <a
          href={apt.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-bold text-[#7A7061] hover:text-[#C1A68D] transition-colors"
        >
          <span>📍</span>
          <span>{apt.address}</span>
          <span className="text-[10px] underline">فتح الخريطة</span>
        </a>

        <Link
          href={apt.browseHref}
          className="flex items-center justify-center gap-2 w-full bg-[#2A2723] hover:bg-black text-white font-black py-3 rounded-xl text-sm transition-all active:scale-95"
        >
          <span>عرض الشقة وحجزها</span>
          <span>←</span>
        </Link>
      </div>
    </div>
  );
}

// ─── Section Divider ─────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 w-full" dir="rtl">
      <div className="flex-1 h-px bg-gradient-to-l from-[#EAE4D9] to-transparent" />
      <div className="bg-[#2A2723] text-white text-sm font-black px-6 py-2 rounded-full shrink-0">
        {label}
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-[#EAE4D9] to-transparent" />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function HomeClient() {
  const { t, isRTL } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main
      className="min-h-screen bg-[#FDFBF7] text-[#2A2723] overflow-x-hidden relative"
      dir="rtl"
    >
      {/* ── Ambient Glows ── */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#C1A68D]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#EAE4D9]/30 rounded-full blur-[100px] -z-10 pointer-events-none" />



      {/* ══════════════════════════════════════════════════════════════
          HERO — العنوان الكبير
      ══════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full min-h-[60vh] flex flex-col items-center justify-center text-center pt-12 pb-8 px-4 overflow-hidden"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      >
        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <div className="w-[900px] h-[900px] rounded-full border-[3px] border-[#C1A68D]" />
          <div className="absolute w-[600px] h-[600px] rounded-full border-[2px] border-[#C1A68D]" />
        </div>

        {/* Background watermark logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <Logo size={500} imageClassName="w-[600px] h-auto" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Tagline pill */}
          <div className="inline-flex items-center gap-2 bg-[#C1A68D]/10 border border-[#C1A68D]/30 text-[#C1A68D] text-[11px] font-black px-5 py-2 rounded-full uppercase tracking-widest mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#C1A68D] animate-pulse"></span>
            مدينة نصر، القاهرة
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#2A2723] leading-none tracking-tighter mb-6 animate-slide-up">
            مجمع مزار
          </h1>

          {/* Sub-headline */}
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#5C554B] tracking-tight mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up delay-100">
            أكبر مجمع سكني فندقي في مدينة نصر
          </h2>



          {/* Stats row / Description */}
          <div className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md border border-[#EAE4D9] rounded-3xl px-6 md:px-12 py-5 shadow-sm animate-fade-in delay-200 max-w-4xl mx-auto w-[90%] md:w-auto">
            <span className="text-sm md:text-lg lg:text-xl font-black text-[#2A2723] leading-loose text-center">
              2 فرع - اكثر من 30 وحدة متنوعة: <br className="sm:hidden" />
              <span className="text-[#C1A68D]">ستوديو - شقة غرفة واحدة - شقة غرفتين - شقة 3 غرف</span>
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          QUICK NAV BOXES — المستطيلات التفاعلية
      ══════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-wrap justify-center items-stretch gap-3 md:gap-4 w-full">
          {NAV_BOXES.map((box) => (
            <Link
              key={box.label}
              href={box.href}
              className={`group flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${box.color} border ${box.border} rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 w-[calc(50%-0.5rem)] sm:w-[calc(33.33%-0.75rem)] md:w-[170px] lg:flex-1 lg:max-w-[220px]`}
            >
              <div className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                <box.icon className="w-16 h-16 drop-shadow-md mb-2" />
              </div>
              <span className={`text-sm md:text-base font-black ${box.text} leading-tight`}>
                {box.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          AVAILABILITY BANNER — احجز وحدتك
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-b from-white to-[#FDFBF7] border-y border-[#EAE4D9]">
        <AvailabilityBanner />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BROWSE UNITS — تصفح وحدات المزار الفندقية
      ══════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16 space-y-12" dir="rtl">

        {/* Section Header */}
        <div className="text-center space-y-3">

          <h2 className="text-3xl md:text-5xl font-black text-[#2A2723] tracking-tight">
            تصفح وحدات مزار الفندقية
          </h2>
          <p className="text-[#7A7061] font-bold text-sm md:text-base max-w-xl mx-auto">
            فرعان رئيسيان وشقق خارجية مجهزة بالكامل في قلب مدينة نصر
          </p>
        </div>

        {/* ─── الفرع الأول ─── */}
        <SectionDivider label="🏨 الفرع الأول — مزار 1" />

        <BranchCard
          branchNumber={1}
          title="مزار 1 — الفرع الأول"
          subtitle="12 استوديو فندقي متنوع بين سنجل ودبل وتريبل، مجهزة بالكامل بأحدث التقنيات"
          address="مدينة نصر، القاهرة — الفرع الأول"
          mapsUrl="https://maps.google.com/?q=Mazar+Nasr+City+Cairo+Branch+1"
          heroImage={BRANCH1_IMAGES[0]}
          galleryImages={BRANCH1_IMAGES}
          unitCount={12}
          unitLabel="استوديو"
          browseHref="/mazar/units/studios"
          accentColor="#C1A68D"
        />

        {/* Branch 1 Studios Grid */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-[#2A2723]">استوديوهات الفرع الأول</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
              <Link
                key={num}
                href={`/mazar/units/studios/b1-s${num}`}
                className="group flex flex-col items-center bg-white border border-[#EAE4D9] hover:border-[#C1A68D] rounded-2xl p-4 text-center transition-all hover:shadow-lg active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#C1A68D]/10 flex items-center justify-center mb-2 group-hover:bg-[#C1A68D]/20 transition-colors">
                  <span className="text-sm font-black text-[#C1A68D]">{num}</span>
                </div>
                <span className="text-[10px] font-black text-[#2A2723]">استوديو {num}</span>
                <span className="mt-1 text-[9px] font-bold text-[#7A7061]">الفرع الأول</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ─── الفرع الثاني ─── */}
        <SectionDivider label="🏨 الفرع الثاني — مزار 2" />

        <BranchCard
          branchNumber={2}
          title="مزار 2 — الفرع الثاني"
          subtitle="12 استوديو بريميوم + شقق فندقية عائلية + غرف مزدوجة، مجهزة بأحدث المعايير الفندقية"
          address="مدينة نصر، القاهرة — الفرع الثاني"
          mapsUrl="https://maps.google.com/?q=Mazar+Nasr+City+Cairo+Branch+2"
          heroImage={BRANCH2_IMAGES[0]}
          galleryImages={BRANCH2_IMAGES}
          videoSrc="/images/Mazar%202%20Pictures/WhatsApp%20Video%202026-02-19%20at%209.16.14%20AM.mp4"
          unitCount={12}
          unitLabel="وحدة"
          browseHref="/"
          accentColor="#8B7355"
        />

        {/* Branch 2 Studios Grid */}
        <div className="space-y-4 mt-8">
          <h3 className="text-xl font-black text-[#2A2723]">استوديوهات الفرع الثاني</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
              <Link
                key={`b2-${num}`}
                href={`/mazar/units/studios/b2-s${num}`}
                className="group flex flex-col items-center bg-white border border-[#EAE4D9] hover:border-[#8B7355] rounded-2xl p-4 text-center transition-all hover:shadow-lg active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#8B7355]/10 flex items-center justify-center mb-2 group-hover:bg-[#8B7355]/20 transition-colors">
                  <span className="text-sm font-black text-[#8B7355]">{num}</span>
                </div>
                <span className="text-[10px] font-black text-[#2A2723]">استوديو {num}</span>
                <span className="mt-1 text-[9px] font-bold text-[#7A7061]">الفرع الثاني</span>
              </Link>
            ))}
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#2A2723] text-white py-16 px-4 text-center" dir="rtl">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="text-4xl mb-2">🌟</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">جاهز تحجز؟</h2>
          <p className="text-white/70 font-bold text-sm md:text-base">
            احجز وحدتك الفندقية في مزار الآن واستمتع بأفضل إقامة في مدينة نصر
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/mazar/book"
              className="bg-[#C1A68D] hover:bg-[#A68D74] text-white font-black px-10 py-4 rounded-full text-base transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              احجز الآن
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
