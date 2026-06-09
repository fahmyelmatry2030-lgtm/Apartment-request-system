"use client";

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useLanguage } from '@/lib/LanguageContext';
import { Facebook, Globe, Instagram, Share2 } from 'lucide-react';

const socialLinks = [
  {
    icon: <img src="/icons/google.svg" alt="Google" className="w-8 h-8" />, 
    label: 'جوجل',
    description: 'share.google',
    url: 'https://share.google/0S8xjtO2gOGZxheKs',
    color: 'from-[#4285F4] to-[#34A853]',
  },
  {
    icon: <Instagram className="w-6 h-6" />,
    label: 'انستجرام',
    description: '@mazarstudios',
    url: 'https://www.instagram.com/mazarstudios?igsh=Mnd0b2xvbjNkZDBx',
    color: 'from-[#fdf5a7] via-[#f56040] to-[#7b2ff7]',
  },
  {
    icon: <img src="/icons/tiktok.svg" alt="TikTok" className="w-8 h-8" />,
    label: 'تيك توك',
    description: '@mazar.studios',
    url: 'https://www.tiktok.com/@mazar.studios?_r=1&_t=ZS-973GRvogEcv',
    color: 'from-[#000000] via-[#25F4EE] to-[#FE2C55]',
  },

  {
    icon: <img src="/icons/facebook.svg" alt="Facebook" className="w-9 h-9" />,
    label: 'فيسبوك',
    description: '@mazar.studios',
    url: 'https://www.facebook.com/share/17KqUZDzV1/',
    color: 'from-[#1877F2] to-[#0f69d6]',
  },
];

export default function SocialLinksPage() {
  const { language } = useLanguage();
  const logoBg = language === 'ar' ? '/images/logo-ar.jpg' : '/images/logo-en.jpg';

  return (
    <div className="h-screen bg-[#FDFBF7] text-[#2A2723] font-sans relative overflow-hidden" dir="rtl">
      
      {/* Logo Page Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${logoBg})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.06,
        }}
      />
      
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-transparent border-none shadow-none">
        <Link href="/">
           <Logo size={42} mdSize={48} imageClassName="h-auto" transparent />
        </Link>
      </nav>

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-start px-6 pt-12 pb-6 text-center">
        
        {/* Header */}
        <div className="w-full mb-16 max-w-3xl">
          <p className="text-5xl font-black tracking-[-0.03em] text-[#111111] sm:text-6xl md:text-7xl">
            تابع مزار على السوشيال
          </p>
          <p className="mt-6 text-lg md:text-xl text-[#333333] leading-9 font-semibold tracking-tight">
            هنا كل روابط مزار الرسمية من حسابات التواصل والسوشيال إلى الواتساب. اضغط على أي خدمة للانتقال مباشرة.
          </p>
        </div>

        <div className="grid w-full max-w-4xl gap-8 justify-items-center grid-cols-3 sm:grid-cols-4 lg:grid-cols-5">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex h-28 w-28 flex-col items-center justify-center rounded-full border border-white/15 bg-gradient-to-br ${link.color} text-white shadow-[0_24px_64px_rgba(0,0,0,0.14)] transition duration-200 ease-out hover:shadow-[0_28px_72px_rgba(0,0,0,0.18)]`}
              title={link.label}
            >
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-60" />
              <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur-xl border border-white/15 shadow-inner">
                {React.cloneElement(link.icon, { className: 'w-10 h-10' })}
              </div>
              <span className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/90">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
