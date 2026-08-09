'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface BranchCardProps {
  branchNumber: number;
  title: string;
  subtitle: string;
  address: string;
  mapsUrl: string;
  heroImage: string;
  galleryImages: string[];
  videoSrc?: string;
  unitCount: number;
  unitLabel: string;
  browseHref: string;
  accentColor?: string;
}

export default function BranchCard({
  branchNumber,
  title,
  subtitle,
  address,
  mapsUrl,
  heroImage,
  galleryImages,
  videoSrc,
  unitCount,
  unitLabel,
  browseHref,
  accentColor = '#C1A68D',
}: BranchCardProps) {
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="group relative bg-white border border-[#EAE4D9] rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
      dir="rtl"
    >
      {/* Branch Badge */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
        <span className="text-xs font-black text-[#2A2723]">{unitCount} {unitLabel}</span>
      </div>

      {/* Media Section */}
      <div className="relative w-full aspect-video bg-[#F0EBE3] overflow-hidden">
        {/* Toggle Buttons */}
        {videoSrc && (
          <div className="absolute top-5 left-5 z-20 flex gap-2">
            <button
              onClick={() => setActiveMedia('image')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
                activeMedia === 'image'
                  ? 'bg-white text-[#2A2723] shadow-md'
                  : 'bg-black/40 text-white backdrop-blur-sm'
              }`}
            >
              📸 صور
            </button>
            <button
              onClick={() => setActiveMedia('video')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
                activeMedia === 'video'
                  ? 'bg-white text-[#2A2723] shadow-md'
                  : 'bg-black/40 text-white backdrop-blur-sm'
              }`}
            >
              🎬 فيديو
            </button>
          </div>
        )}

        {/* Video */}
        {videoSrc && activeMedia === 'video' ? (
          <video
            src={encodeURI(videoSrc)}
            controls
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {/* Main Image */}
            <img
              src={!imgError ? (galleryImages[activeImg] || heroImage) : heroImage}
              alt={title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {galleryImages.length > 1 && activeMedia === 'image' && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none bg-[#FDFBF7] border-b border-[#EAE4D9]">
          {galleryImages.slice(0, 6).map((img, i) => (
            <button
              key={i}
              onClick={() => { setActiveImg(i); setImgError(false); }}
              className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                activeImg === i ? 'border-[#C1A68D] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-6 md:p-8 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-block text-[10px] font-black px-3 py-1 rounded-full mb-2" style={{ background: `${accentColor}20`, color: accentColor }}>
            الفرع {branchNumber === 1 ? 'الأول' : branchNumber === 2 ? 'الثاني' : 'الثالث'}
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-[#2A2723] tracking-tight">{title}</h3>
          <p className="text-sm text-[#7A7061] font-bold">{subtitle}</p>
        </div>

        {/* Address + Maps */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-[#C1A68D] hover:bg-[#A68D74] text-white rounded-2xl px-5 py-4 transition-all group/maps shadow-md"
        >
          <span className="text-xl">📍</span>
          <div className="flex-1 text-right">
            <div className="text-sm font-black tracking-wider mb-0.5">فتح اللوكيشن على الخريطة</div>
            <div className="text-xs font-bold opacity-90">{address}</div>
          </div>
          <span className="text-white text-lg group-hover/maps:-translate-x-1 transition-transform">←</span>
        </a>

        {/* CTA Button */}
        <Link
          href={browseHref}
          className="flex items-center justify-center gap-2 w-full bg-[#2A2723] hover:bg-black text-white font-black py-4 rounded-2xl text-sm transition-all hover:shadow-xl active:scale-95"
        >
          <span>تصفح وحدات هذا الفرع</span>
          <span>←</span>
        </Link>
      </div>
    </div>
  );
}
