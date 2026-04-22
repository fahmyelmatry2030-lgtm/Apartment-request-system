"use client";

import { useState, useEffect, useMemo } from 'react';
import { getBookings, getSystemUnits } from '@/lib/data-init';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function FinancePage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const b = await getBookings();
      setBookings(b);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const totals = useMemo(() => {
    // Filter bookings for the selected month/year
    const monthlyBookings = bookings.filter((b: any) => {
      if (b.status === 'deleted' || (b.status !== 'approved' && b.status !== 'مؤكد')) return false;
      const parts = b.checkIn?.split('-');
      if (!parts || parts.length < 2) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      return month === selectedMonth && year === selectedYear;
    });

    const revenue = monthlyBookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount || 0)), 0);
    const commissions = monthlyBookings.reduce((sum, b) => sum + (parseFloat(b.commission || 0)), 0);
    
    return { revenue, commissions };
  }, [bookings, selectedMonth, selectedYear]);

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#2A2723]">كشف <span className="text-[#C1A68D]">المصاريف والتحصيل</span></h1>
          <p className="text-[#7A7061] font-bold opacity-70 text-sm">إدارة المصاريف الشهرية ومطابقتها مع إجمالي دخل الـ 24 استديو.</p>
        </div>

        <div className="flex gap-3 bg-white p-2 rounded-[1.5rem] border border-[#EAE4D9]/50 shadow-sm">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-[#FDFBF7] border-none rounded-xl px-4 py-2 text-xs font-black outline-none"
          >
            {MONTHS_AR.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-[#FDFBF7] border-none rounded-xl px-4 py-2 text-xs font-black outline-none"
          >
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      {/* Summary Section: The 2 Main Numbers from Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-3xl -mr-12 -mt-12" />
            <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-2">إجمالي دخل الـ 24 استديو (من التقارير)</p>
            <div className="text-4xl font-black text-green-600">
                {isLoading ? '...' : totals.revenue.toLocaleString()} <small className="text-sm">ج.م</small>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-3xl -mr-12 -mt-12" />
            <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-2">إجمالي العمولات (من التقارير)</p>
            <div className="text-4xl font-black text-orange-500">
                {isLoading ? '...' : totals.commissions.toLocaleString()} <small className="text-sm">ج.م</small>
            </div>
         </div>
      </div>

      {/* Expenses Management Section */}
      <div className="mt-12">
        <div className="flex items-center gap-4 mb-6">
           <div className="h-px bg-[#EAE4D9] flex-1" />
           <h3 className="text-sm font-black text-[#C1A68D] uppercase tracking-[0.3em]">بند المصروفات الشهرية التفصيلية</h3>
           <div className="h-px bg-[#EAE4D9] flex-1" />
        </div>
        
        <div className="bg-white p-12 rounded-[3rem] border border-[#EAE4D9]/50 shadow-sm mb-8 text-center">
           <div className="text-5xl mb-6">📝</div>
           <h4 className="text-xl font-black text-[#2A2723] mb-3">بانتظار نموذج المصاريف من العميل</h4>
           <p className="text-sm text-[#7A7061] font-bold max-w-lg mx-auto leading-relaxed">
              بمجرد تزويدنا بشكل ملف الإكسيل، سنقوم بإنشاء الجداول هنا لتتمكن من إدخال (الكهرباء، المياه، النظافة، الصيانة) وغيرها من المصاريف يدوياً.
           </p>
        </div>
      </div>

      {/* Final Calculation Bar */}
      <div className="bg-[#2A2723] p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="text-center md:text-right">
            <p className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest mb-1">صافي الربح النهائي (بعد خصم كافة المصاريف)</p>
            <p className="text-xs text-gray-400 font-bold italic">هذا الرقم يتم تحديثه لحظياً بناءً على إجمالي الدخل والمصاريف المدخلة.</p>
         </div>
         <div className="text-5xl font-black text-white">
            {isLoading ? '...' : (totals.revenue - totals.commissions).toLocaleString()} <small className="text-sm">ج.م</small>
         </div>
      </div>

      {/* Admin Note */}
      <div className="bg-[#C1A68D]/10 border border-[#C1A68D]/30 p-8 rounded-[2.5rem] flex items-center gap-6">
        <span className="text-3xl">ℹ️</span>
        <div>
           <p className="text-xs text-[#7A7061] font-bold leading-relaxed">
              هذه الصفحة مخصصة لـ <strong>إدارة المصاريف</strong>. يتم سحب "إجمالي الدخل" و "العمولات" آلياً من صفحة التقارير لضمان الدقة، بينما سيتم إدخال باقي التفاصيل هنا يدوياً.
           </p>
        </div>
      </div>
    </div>
  );
}
