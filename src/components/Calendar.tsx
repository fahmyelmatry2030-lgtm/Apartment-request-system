'use client';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface CalendarProps {
  checkIn: string;
  checkOut: string;
  activeTab: 'checkIn' | 'checkOut';
  onSelect: (checkIn: string, checkOut: string) => void;
  bookedDates?: string[];
}

export default function Calendar({ checkIn, checkOut, activeTab, onSelect, bookedDates = [] }: CalendarProps) {
  const { isRTL, language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const months = {
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  const daysLabels = {
    ar: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
    en: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  };

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = selectedDate.toISOString().split('T')[0];

    if (activeTab === 'checkIn') {
      // If picking check-in, set it and reset check-out if it's now invalid
      if (checkOut && dateStr >= checkOut) {
        onSelect(dateStr, '');
      } else {
        onSelect(dateStr, checkOut);
      }
    } else {
      // If picking check-out
      if (dateStr <= checkIn) {
        // If pick before check-in, treat it as new check-in
        onSelect(dateStr, '');
      } else {
        onSelect(checkIn, dateStr);
      }
    }
  };

  const isSelected = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    return dateStr === checkIn || dateStr === checkOut;
  };

  const isInRange = (day: number) => {
    if (!checkIn || !checkOut) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return date > start && date < end;
  };

  const isPast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date < today;
  };

  const isBooked = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    return bookedDates.includes(dateStr);
  };

  return (
    <div className={`w-full bg-[#FDFBF7] p-4 md:p-8 rounded-[30px] md:rounded-[40px] border border-[#EAE4D9] shadow-inner select-none ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="flex justify-between items-center mb-6 md:mb-10 px-2">
        <button onClick={prevMonth} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#EAE4D9] hover:bg-white flex items-center justify-center transition-all">
          {isRTL ? '→' : '←'}
        </button>
        <h3 className="text-lg md:text-xl font-black text-[#2A2723]">
          {months[language as keyof typeof months][currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#EAE4D9] hover:bg-white flex items-center justify-center transition-all">
          {isRTL ? '←' : '→'}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 md:gap-y-4 text-center">
        {daysLabels[language as keyof typeof daysLabels].map((day, i) => (
          <div key={i} className="text-[9px] md:text-[10px] font-black text-[#C1A68D] uppercase tracking-widest mb-2 md:mb-4">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selected = isSelected(day);
          const inRange = isInRange(day);
          const past = isPast(day);

          return (
            <div 
              key={day} 
              onClick={() => !past && !isBooked(day) && handleDateClick(day)}
              className={`
                relative h-12 md:h-14 flex flex-col items-center justify-center cursor-pointer text-xs md:text-sm font-bold transition-all duration-300
                ${past ? 'opacity-20 cursor-not-allowed' : ''}
                ${isBooked(day) ? 'cursor-not-allowed' : 'hover:scale-110'}
                ${selected ? 'bg-[#2A2723] text-white rounded-full z-10 shadow-lg' : ''}
                ${inRange ? 'bg-[#C1A68D]/10 text-[#C1A68D]' : ''}
              `}
            >
              <span className={isBooked(day) ? 'line-through opacity-30' : ''}>{day}</span>
              
              {isBooked(day) && !selected && (
                <span className="absolute top-1 text-[6px] font-black text-red-500 uppercase tracking-tighter">Sold Out</span>
              )}

              {day === today.getDate() && currentMonth.getMonth() === today.getMonth() && !selected && !isBooked(day) && (
                <div className="absolute bottom-2 w-1 h-1 bg-[#C1A68D] rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
