'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { useLanguage } from '@/lib/LanguageContext';

export default function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="py-12 md:py-16 text-center text-[#5C554B] border-t border-[#EAE4D9]/50 bg-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C1A68D]/5 rounded-full blur-[100px] pointer-events-none -mt-32" />

      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        {/* Prominent Logo Section - User requested Logo only */}
        <div className="flex flex-col items-center justify-center group w-full text-center">
          <Link href="/" className="mb-4 transform hover:scale-105 transition-transform duration-700 flex justify-center w-full">
            {/* Elegant balanced size */}
            <Logo size={isRTL ? 64 : 70} mdSize={90} imageClassName="max-h-none" />
          </Link>
          <div className="w-16 h-1 bg-[#C1A68D] rounded-full opacity-20 group-hover:w-24 group-hover:opacity-100 transition-all duration-1000 mb-8" />
        </div>

        {/* Credits & Legal */}
        <div className="pt-12 flex flex-col items-center">
          <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.4em] opacity-40 mb-3 text-[#2A2723]">
            {t.common.footerRights}
          </p>
          <div className="text-[9px] text-[#7A7061] font-bold opacity-30 tracking-[0.2em]">
            MAZAR HOTEL STUDIOS • PREMIUM STAY EXPERIENCE
          </div>
        </div>
      </div>
    </footer>
  );
}
