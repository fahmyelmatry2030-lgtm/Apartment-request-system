'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

import { motion } from 'framer-motion';

interface UnitCardProps {
  unit: any;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit }) => {
  const { t, isRTL, language } = useLanguage();
  const [status, setStatus] = useState<string>('متاح');

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch('/api/units');
        if (!res.ok) return;
        const studios = await res.json();
        const studio = studios.find((s: any) => s.id === unit.id);
        if (studio) {
          setStatus(studio.status || 'متاح');
        }
      } catch {
        // silently fail — fallback status stays as default
      }
    };
    loadStatus();
  }, [unit.id]);

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-[2rem] border border-[#EAE4D9] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group h-full`}
    >
      <div className="relative h-64 overflow-hidden">
        {unit?.images?.[0] ? (
          <Image 
            src={unit.images[0]} 
            alt={unit.title?.[language] || ''} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-[#F7F5F0] flex items-center justify-center text-[#7A7061]">
             {isRTL ? 'لا توجد صورة' : 'No Image'}
          </div>
        )}
        <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} bg-[#2A2723]/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 flex gap-2`}>
          <span>{unit?.type === 'studio' ? (isRTL ? 'استوديو' : 'STUDIO') : (isRTL ? 'شقة' : 'APARTMENT')}</span>
        </div>
        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} ${status === 'متاح' ? 'bg-green-500/90' : status === 'مشغول' ? 'bg-blue-500/90' : 'bg-red-500/90'} backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md`}>
          {status}
        </div>
      </div>
      <div className={`p-6 flex flex-col flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h3 className="text-xl font-bold text-[#2A2723] mb-2">{unit?.title?.[language] || (isRTL ? 'وحدة بدون اسم' : 'Unnamed Unit')}</h3>
        <p className="text-sm text-[#7A7061] mb-2 line-clamp-2 leading-relaxed">
          {unit?.description?.[language] || ''}
        </p>
        
        {unit?.price && (
          <div className="font-bold text-[#C1A68D] mb-4 flex items-center gap-2">
            <span>{unit.price} / {isRTL ? 'الليلة' : 'Night'}</span>
            {unit.originalPrice && (
              <span className="text-sm text-[#E63946]/70 line-through font-black">{unit.originalPrice}</span>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-8 mt-auto">          
          {unit?.features?.[language]?.slice(0, 3).map((feat: string, i: number) => (
            <span key={i} className="text-[10px] font-bold text-[#5C554B] bg-[#F7F5F0] px-2.5 py-1 rounded-lg border border-[#EAE4D9]">
              {feat}
            </span>
          ))}
        </div>

        <Link 
          href={`/mazar/units/${unit?.id}`}
          className="mt-auto w-full bg-[#2A2723] text-white text-sm font-black py-4 rounded-2xl text-center hover:bg-black transition-all shadow-xl shadow-black/5 flex items-center justify-center gap-2 group/btn"
        >
          {t?.unitsPage?.viewDetails || 'Details'}
          <span className={`transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}>
            {isRTL ? '←' : '→'}
          </span>
        </Link>
      </div>
    </motion.div>
  );
};

export default UnitCard;
