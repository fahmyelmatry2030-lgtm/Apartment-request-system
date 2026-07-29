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
      name: isRTL ? 'الوحدات' : 'Units',
      href: '/mazar/units',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M20.25 21h1.5m-1.5 0h-1.5m-1.5 0H3m17.25 0h-1.5m-1.5 0H15M3 21h1.5m12 0h-12m12 0V11.73M3.75 21h.008v-.008H3.75V21zm.375 0h.008v-.008H4.125V21zm-.375-3.75h.008v-.008H3.75v.008zm.375 0h.008v-.008H4.125v.008zm-.375-3.75h.008v-.008H3.75v.008zm.375 0h.008v-.008H4.125v.008zm0-3.75h.008v-.008H4.125v.008zm-.375 0h.008v-.008H3.75v.008zm16.5 0h.008v-.008h-.008v.008zm.375 0h.008v-.008H20.25v.008zm-.375-3.75h.008v-.008h-.008v.008zm.375 0h.008v-.008H20.25v.008zm-.375-3.75h.008v-.008h-.008v.008zm.375 0h.008v-.008H20.25v.008zm-11.25 4.5h.008v-.008H9V12zm.375 0h.008v-.008H9.375V12zm-.375 3.75h.008v-.008H9v.008zm.375 0h.008v-.008H9.375v.008zm3-3.75h.008v-.008h-.008v.008zm.375 0h.008v-.008H12.75V12zm-.375 3.75h.008v-.008h-.008v.008zm.375 0h.008v-.008H12.75v.008z" />
        </svg>
      )
    },
    {
      name: isRTL ? 'احجز الآن' : 'Book Now',
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
