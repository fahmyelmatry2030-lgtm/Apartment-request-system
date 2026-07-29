'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  size?: number;
  mdSize?: number;
  transparent?: boolean;
}

export default function Logo({ className = "", imageClassName = "max-h-[80px]", size = 40, mdSize, transparent = false }: LogoProps) {
  const { language } = useLanguage();
  const logoSrc = language === 'ar'
    ? '/images/WhatsApp_Image_2026-03-18_-removebg-preview.png'
    : '/images/WhatsApp_Image_2026-03-18_at_2.02.10_PM-removebg-preview.png';

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size * 3 }}>
        {/* Mobile Logo */}
        <div className={mdSize ? 'md:hidden' : ''}>
          <Image
            src={logoSrc}
            alt="Mazar Studio Logo"
            width={size * 3}
            height={size * 3}
            className={`object-contain w-full h-auto ${imageClassName}`}
            priority
          />
        </div>
        
        {/* Desktop/MD Logo */}
        {mdSize && (
          <div className="hidden md:block" style={{ width: mdSize * 3 }}>
            <Image
              src={logoSrc}
              alt="Mazar Studio Logo"
              width={mdSize * 3}
              height={mdSize * 3}
              className={`object-contain w-full h-auto ${imageClassName}`}
              priority
            />
          </div>
        )}
      </div>
    </div>
  );
}
