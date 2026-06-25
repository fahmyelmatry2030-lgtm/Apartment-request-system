"use client";

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useLanguage } from '@/lib/LanguageContext';

const MetallicButton = ({ type, href, label, iconRender }: any) => {
  let innerBgClass = '';
  let logoStyle = {};
  let textClass = '';
  
  if (type === 'brown') {
    // Facebook, Instagram
    innerBgClass = 'bg-gradient-to-br from-[#68533b] via-[#4a3927] to-[#2c2014]';
    textClass = 'text-[#18110b]'; // Very dark
    logoStyle = {
      filter: 'drop-shadow(0px 1px 1px rgba(255,255,255,0.15)) drop-shadow(0px -2px 3px rgba(0,0,0,0.8))'
    };
  } else if (type === 'black') {
    // TikTok, WhatsApp
    innerBgClass = 'bg-gradient-to-br from-[#2a2a2a] via-[#111111] to-[#000000]';
    textClass = 'text-transparent bg-clip-text'; // Gold will be filled via SVG
    logoStyle = {
      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.9)) drop-shadow(0px -1px 1px rgba(255,255,255,0.2))'
    };
  } else if (type === 'beige') {
    // Google
    innerBgClass = 'bg-gradient-to-br from-[#F5EBD0] via-[#DECAA8] to-[#C0A880]';
    textClass = 'text-[#18110b]';
    logoStyle = {
      filter: 'drop-shadow(0px 1px 1px rgba(255,255,255,0.4)) drop-shadow(0px -2px 3px rgba(0,0,0,0.4))'
    };
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={label} className="group flex flex-col items-center gap-3">
      {/* Outer Border */}
      <div className="w-[85px] h-[85px] sm:w-[110px] sm:h-[110px] rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[#EBD6AC] via-[#B8925B] to-[#715024] p-[3px] shadow-[0_15px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        {/* Inner Button */}
        <div className={`w-full h-full rounded-[21px] sm:rounded-[29px] flex items-center justify-center relative overflow-hidden shadow-[inset_0_8px_20px_rgba(0,0,0,0.7),inset_0_-2px_4px_rgba(255,255,255,0.15)] ${innerBgClass}`}>
           <div className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center ${textClass}`} style={logoStyle}>
              {iconRender(type)}
           </div>
        </div>
      </div>
    </a>
  );
}

export default function SocialLinksPage() {
  const { language } = useLanguage();

  const socialLinks = [
    {
      id: 'facebook',
      label: 'فيسبوك',
      url: 'https://www.facebook.com/share/17KqUZDzV1/',
      type: 'brown',
      icon: (type: string) => (
        <svg viewBox="0 0 24 24" className="w-[85%] h-[85%]" style={{ fill: type === 'black' ? 'url(#goldGradient)' : 'currentColor' }}>
          <path d="M14 10h-2V8.5c0-.8.6-1.5 1.5-1.5h1.5V4h-2.5C9.5 4 8 6 8 9v1H6v4h2v8h4v-8h2.5L15 10z" />
        </svg>
      )
    },
    {
      id: 'tiktok',
      label: 'تيك توك',
      url: 'https://www.tiktok.com/@mazar.studios?_r=1&_t=ZS-973GRvogEcv',
      type: 'black',
      icon: (type: string) => (
        <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: type === 'black' ? 'url(#goldGradient)' : 'currentColor' }}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.02c-.01 1.63-.55 3.25-1.53 4.49-1.3 1.63-3.23 2.67-5.32 2.86-2.08.19-4.22-.3-5.91-1.55-1.63-1.21-2.73-2.99-3.1-4.99-.36-1.92-.02-3.95 1-5.63 1.04-1.7 2.67-2.96 4.56-3.55 1.58-.49 3.32-.47 4.88.08v4.13c-1.34-.41-2.84-.28-4.06.39-1.2.66-2.05 1.83-2.3 3.16-.25 1.34.1 2.77.94 3.85.83 1.05 2.16 1.62 3.49 1.64 1.33.01 2.63-.56 3.48-1.55.85-.99 1.25-2.32 1.25-3.66V.02z"/>
        </svg>
      )
    },
    {
      id: 'instagram',
      label: 'انستجرام',
      url: 'https://www.instagram.com/mazarstudios?igsh=Mnd0b2xvbjNkZDBx',
      type: 'brown',
      icon: (type: string) => (
        <svg viewBox="0 0 24 24" className="w-[85%] h-[85%]" style={{ fill: type === 'black' ? 'url(#goldGradient)' : 'currentColor' }}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.822a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      )
    },
    {
      id: 'google',
      label: 'جوجل',
      url: 'https://share.google/0S8xjtO2gOGZxheKs',
      type: 'beige',
      icon: (type: string) => (
        <svg viewBox="0 0 24 24" className="w-[85%] h-[85%]" style={{ fill: type === 'black' ? 'url(#goldGradient)' : 'currentColor' }}>
          <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
        </svg>
      )
    },
    {
      id: 'whatsapp',
      label: 'واتساب',
      url: 'https://wa.me/201108109969',
      type: 'black',
      icon: (type: string) => (
        <svg viewBox="0 0 24 24" className="w-[95%] h-[95%]" style={{ fill: type === 'black' ? 'url(#goldGradient)' : 'currentColor' }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2EADA] text-[#1D1610] font-sans relative overflow-x-hidden flex flex-col items-center py-10" dir="rtl">
      
      {/* Background Texture Overlay to simulate paper */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-multiply" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>

      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE1A9" />
            <stop offset="40%" stopColor="#C9A26A" />
            <stop offset="60%" stopColor="#E6C893" />
            <stop offset="100%" stopColor="#876233" />
          </linearGradient>
        </defs>
      </svg>

      {/* Navigation / Header */}
      <nav className="w-full px-6 py-2 flex justify-center items-center max-w-screen-xl z-50">
        <Link href="/">
           <Logo size={80} mdSize={100} imageClassName="h-auto opacity-90 filter drop-shadow-md" transparent />
        </Link>
      </nav>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-start px-6 pt-6 pb-12 text-center flex-grow">
        
        {/* Title */}
        <div className="w-full mb-10 sm:mb-16 max-w-2xl mt-4 sm:mt-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.02em] text-[#2C241B] drop-shadow-sm">
            (تابع مزار على السوشيال ميديا)
          </h1>
        </div>

        {/* The Icons */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
          {socialLinks.map((link) => (
            <MetallicButton key={link.id} {...link} iconRender={link.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}
