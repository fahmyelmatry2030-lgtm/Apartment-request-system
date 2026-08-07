'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t, isRTL } = useLanguage();

  // Do not render on admin dashboard pages
  if (pathname?.startsWith('/admin')) return null;

  const navItems = [
    {
      name: isRTL ? 'الرئيسية' : 'Home',
      href: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    },
    {
      name: isRTL ? 'كيفية الحجز' : 'How to Book',
      href: '/mazar/how-to-book',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )
    },
    {
      name: isRTL ? 'ابدأ الحجز الان' : 'Book Now',
      href: '/mazar/book',
      isCenter: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )
    },
    {
      name: isRTL ? 'عن مزار' : 'About',
      href: '/mazar/about',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      )
    },
    {
      name: isRTL ? 'روابطنا' : 'Socials',
      href: '/social',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      )
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="bg-[#2A2723]/95 backdrop-blur-xl border border-white/10 rounded-[28px] shadow-[0_10px_35px_rgba(0,0,0,0.35)] flex justify-between items-center py-2 px-3 pointer-events-auto">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;

          if (item.isCenter) {
            return (
              <Link 
                key={i} 
                href={item.href}
                className="flex flex-col items-center justify-center shrink-0 -mt-8 bg-[#E63946] hover:bg-[#c1121f] text-white w-14 h-14 rounded-full shadow-lg shadow-red-500/40 transition-all active:scale-90 border-4 border-[#2A2723]"
                title={item.name}
              >
                {item.icon}
              </Link>
            );
          }

          return (
            <Link
              key={i}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 py-1 px-2.5 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'text-[#C1A68D]' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-[#C1A68D]' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-black tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
