'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function MobileLangToggle() {
  const pathname = usePathname();

  // Do not render on admin dashboard pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="md:hidden fixed top-4 left-4 z-50 pointer-events-auto">
      <LanguageSwitcher />
    </div>
  );
}
