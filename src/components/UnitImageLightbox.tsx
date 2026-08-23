"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface UnitImageLightboxProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onSelectIndex?: (index: number) => void;
  isRTL?: boolean;
}

export default function UnitImageLightbox({
  isOpen,
  images,
  currentIndex,
  onClose,
  onSelectIndex,
  isRTL = true,
}: UnitImageLightboxProps) {
  const [index, setIndex] = useState(currentIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    setIndex(currentIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") isRTL ? handleNext() : handlePrev();
      if (e.key === "ArrowRight") isRTL ? handlePrev() : handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, index, isRTL]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentSrc = images[index] || images[0];

  const handleNext = () => {
    const nextIdx = (index + 1) % images.length;
    setIndex(nextIdx);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onSelectIndex?.(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (index - 1 + images.length) % images.length;
    setIndex(prevIdx);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onSelectIndex?.(prevIdx);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4));
  const zoomOut = () => {
    setScale((prev) => {
      const nextScale = Math.max(prev - 0.25, 0.5);
      if (nextScale <= 1) setPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Touch & Mouse Drag handlers for zoomed images
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Pinch Zoom & Pan logic for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = (currentDist - touchDistanceRef.current) / 200;
      setScale((prev) => {
        const newScale = Math.min(Math.max(prev + diff, 0.5), 4);
        if (newScale <= 1) setPosition({ x: 0, y: 0 });
        return newScale;
      });
      touchDistanceRef.current = currentDist;
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in select-none"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between z-10 bg-black/40 backdrop-blur-lg px-4 py-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
          <ImageIcon size={18} className="text-[#C1A68D]" />
          <span>
            {index + 1} / {images.length}
          </span>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={zoomIn}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1 font-bold active:scale-95"
            title="تكبير"
          >
            <ZoomIn size={18} />
            <span className="hidden sm:inline">تكبير</span>
          </button>
          <button
            type="button"
            onClick={zoomOut}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1 font-bold active:scale-95"
            title="تصغير"
          >
            <ZoomOut size={18} />
            <span className="hidden sm:inline">تصغير</span>
          </button>
          {scale !== 1 && (
            <button
              type="button"
              onClick={resetZoom}
              className="p-2.5 rounded-xl bg-[#C1A68D] hover:bg-[#a68d74] text-black transition-all text-xs flex items-center gap-1 font-bold active:scale-95"
              title="إعادة الحجم الأصلي"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all mr-2 active:scale-95"
            title="إغلاق"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden my-4 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentSrc}
          alt={`صورة ${index + 1}`}
          className="max-h-[78vh] max-w-full object-contain rounded-2xl transition-transform duration-100 ease-out shadow-2xl"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
          draggable={false}
        />

        {/* Previous Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={isRTL ? handleNext : handlePrev}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-[#C1A68D] hover:text-black text-white backdrop-blur-md border border-white/20 transition-all shadow-2xl active:scale-90"
            title="الصورة السابقة"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Next Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={isRTL ? handlePrev : handleNext}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-[#C1A68D] hover:text-black text-white backdrop-blur-md border border-white/20 transition-all shadow-2xl active:scale-90"
            title="الصورة التالية"
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>

      {/* Footer Thumbnail Bar */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 max-w-xl mx-auto w-full">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIndex(i);
                setScale(1);
                setPosition({ x: 0, y: 0 });
                onSelectIndex?.(i);
              }}
              className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                i === index ? "border-[#C1A68D] scale-105 ring-2 ring-[#C1A68D]/50" : "border-white/20 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`مصغرة ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
