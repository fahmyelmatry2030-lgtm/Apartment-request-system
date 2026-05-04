"use client";

import React from 'react';
import { Instagram, Facebook, Phone as WhatsApp, Globe, ArrowLeft, Share2 } from 'lucide-react';

export default function SocialLinksPage() {
  const socialLinks = [
    {
      name: 'فيسبوك',
      id: '@mazar.studios',
      icon: <Facebook className="w-6 h-6" />,
      url: 'https://www.facebook.com/share/17njbUjG8Y/',
      color: 'bg-[#1877F2]',
      textColor: 'text-white'
    },
    {
      name: 'تيك توك',
      id: '@mazar.studios',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.77c.02 1.16-.32 2.36-1.12 3.23-1.39 1.63-3.9 2.13-5.83 1.25-2.02-.91-3.1-3.23-2.5-5.36.5-1.92 2.33-3.41 4.31-3.41.31 0 .62.03.93.09v4.03c-.31-.05-.63-.08-.95-.08-1.01 0-2.02.7-2.31 1.67-.39 1.1.28 2.45 1.39 2.82.91.31 2.02.04 2.65-.72.46-.57.54-1.34.52-2.05V.02z"/>
        </svg>
      ),
      url: 'https://www.tiktok.com/@mazar.studios?_r=1&_t=ZS-964Jf4u391A',
      color: 'bg-black',
      textColor: 'text-white'
    },
    {
      name: 'انستجرام',
      id: '@mazarstudios',
      icon: <Instagram className="w-6 h-6" />,
      url: 'https://www.instagram.com/mazarstudios?igsh=Mnd0b2xvbjNkZDBx',
      color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
      textColor: 'text-white'
    },
    {
      name: 'واتساب',
      id: 'تواصل مباشر',
      icon: <WhatsApp className="w-6 h-6" />,
      url: 'https://wa.me/201116666324',
      color: 'bg-[#25D366]',
      textColor: 'text-white'
    },
    {
      name: 'الموقع الإلكتروني',
      id: 'mazarbooking.com',
      icon: <Globe className="w-6 h-6" />,
      url: '/',
      color: 'bg-[#2A2723]',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D]/20 font-sans" dir="rtl">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-[#C1A68D]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-[#2A2723]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 py-12 flex flex-col items-center">
        {/* Header / Profile Section */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-[#C1A68D] rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
            <img 
              src="/icon.png" 
              alt="Mazar Logo" 
              className="w-full h-full object-contain p-4"
              onError={(e) => {
                (e.target as any).src = 'https://xhvikeyigduvayrbvura.supabase.co/storage/v1/object/public/uploads/1776799762260-20260218_195727.jpg';
              }}
            />
          </div>
        </div>

        <h1 className="text-3xl font-black mb-2 tracking-tight">مزار <span className="text-[#C1A68D]">Mazar</span></h1>
        <p className="text-[#7A7061] text-sm font-bold mb-8 opacity-80">عيش احساس الاقامة الفندقية بأمان وثقة</p>

        {/* Links Grid */}
        <div className="w-full space-y-4">
          {socialLinks.map((link, i) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex items-center justify-between p-4 rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-xl border border-white ${link.color} ${link.textColor}`}
              style={{
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  {link.icon}
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-black">{link.name}</span>
                  <span className="text-[10px] font-bold opacity-70 tracking-wider">{link.id}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center space-y-4">
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Mazar Social Links',
                  url: window.location.href
                });
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-[#EAE4D9] rounded-2xl text-[11px] font-black hover:bg-[#2A2723] hover:text-white transition-all shadow-sm group"
          >
            <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>مشاركة الصفحة</span>
          </button>
          
          <div className="pt-8 border-t border-[#EAE4D9]/50">
            <p className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest">Mazar Hotel Studios</p>
            <p className="text-[9px] text-[#7A7061] font-bold opacity-60 mt-1">Luxury Stay • Premium Experience</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
