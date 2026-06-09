"use client";

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Facebook, Globe, Instagram, Phone as WhatsApp, Share2 } from 'lucide-react';

const socialLinks = [
  {
    icon: <Globe className="w-6 h-6" />,
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
    icon: (
      <span className="text-lg font-black">Ti</span>
    ),
    label: 'تيك توك',
    description: '@mazar.studios',
    url: 'https://www.tiktok.com/@mazar.studios?_r=1&_t=ZS-973GRvogEcv',
    color: 'from-[#000000] to-[#141414]',
  },
  {
    icon: <Facebook className="w-6 h-6" />,
    label: 'فيسبوك',
    description: '@mazar.studios',
    url: 'https://www.facebook.com/share/17KqUZDzV1/',
    color: 'from-[#1877F2] to-[#0f69d6]',
  },
  {
    icon: <WhatsApp className="w-6 h-6" />,
    label: 'واتساب',
    description: '+201108109969',
    url: 'https://wa.me/201108109969',
    color: 'from-[#25D366] to-[#1DA851]',
  },
];

export default function SocialLinksPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2A2723] font-sans relative overflow-hidden" dir="rtl">
      
      {/* Logo Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-20">
        <div className="transform scale-125">
          <Logo size={220} mdSize={260} imageClassName="h-auto" />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-[#EAE4D9]">
        <Link href="/">
           <Logo size={42} mdSize={48} />
        </Link>
      </nav>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        
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
              className={`inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${link.color} text-white shadow-2xl shadow-black/30 transition duration-300 hover:scale-110 hover:shadow-2xl`}
              title={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
