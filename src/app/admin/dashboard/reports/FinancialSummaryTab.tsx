"use client";

import { useState, useEffect, useMemo } from 'react';
import { getDbExpenses } from '@/lib/actions/db';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

interface FinancialSummaryTabProps {
  bookings: any[];
  units: any[];
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
}

export default function FinancialSummaryTab({
  bookings,
  units,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear
}: FinancialSummaryTabProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminRole, setAdminRole] = useState<string>('Super Admin');

  useEffect(() => {
    const info = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('adminInfo') || '{}') : {};
    if (info?.role) setAdminRole(info.role);
  }, []);

  const isAkoura = adminRole === 'Akoura';

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await getDbExpenses();
        setExpenses(data || []);
      } catch (error) {
        console.error('Error loading expenses in summary:', error);
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, []);

  // Filter bookings: only approved, matching month/year
  // For Akoura: only branch 3 (p-s* units)
  // For others: branch 1 & 2 studios + apartments (excluding branch 3)
  const filteredBookings = useMemo(() => {
    if (selectedMonth === -1 || selectedYear === -1) return [];
    return bookings.filter((b: any) => {
      if (b.status === 'deleted') return false;
      if (b.status !== 'approved' && b.status !== 'مؤكد') return false;

      // Match month/year based on check-in date string
      const parts = b.checkIn?.split('-');
      if (!parts || parts.length < 2) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      if (month !== selectedMonth || year !== selectedYear) return false;

      const u = units.find((unit: any) => unit.id === b.apartmentId);

      if (isAkoura) {
        // Akoura: only Mazar 3 (branch === 3, p-s* ids)
        return u?.branch === 3 || String(b.apartmentId).startsWith('p-s');
      } else {
        // Super Admin: only branch 1 & 2 studios + apartments (exclude branch 3)
        return (u?.type === 'studio' && u?.branch !== 3) || u?.type === 'apartment';
      }
    });
  }, [bookings, units, selectedMonth, selectedYear, isAkoura]);

  // Filter expenses by selected month/year (and branch for Akoura)
  const filteredExpenses = useMemo(() => {
    if (selectedMonth === -1 || selectedYear === -1) return [];
    return expenses.filter((e: any) => {
      if (!e.date) return false;
      const parts = e.date.split('-');
      if (parts.length < 2) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      if (month !== selectedMonth || year !== selectedYear) return false;
      // For Akoura: only show expenses tagged to branch 3
      if (isAkoura) {
        return e.branch === 3 || e.branch === '3' || String(e.unitId || '').startsWith('p-s');
      }
      // For others: exclude branch 3 expenses
      return e.branch !== 3 && e.branch !== '3' && !String(e.unitId || '').startsWith('p-s');
    });
  }, [expenses, selectedMonth, selectedYear, isAkoura]);

  const totalRevenue = useMemo(() => {
    return filteredBookings.reduce(
      (acc, b) => acc + (parseFloat(b.totalAmount || 0) - parseFloat(b.commission || 0)),
      0
    );
  }, [filteredBookings]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);
  }, [filteredExpenses]);

  const netProfit = totalRevenue - totalExpenses;

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* Header & Selectors */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="animate-in slide-in-from-right duration-700">
          <h2 className="text-4xl md:text-6xl font-black text-mazar-coffee uppercase tracking-tighter leading-none">
            التقرير المالي
          </h2>
          <div className="flex items-center gap-3 mt-3">
             <span className="w-2 h-2 rounded-full bg-mazar-gold animate-pulse"></span>
             <p className="text-mazar-gray font-bold uppercase tracking-widest text-[10px]">
               التقرير المالي لشهر {selectedMonth !== -1 ? MONTHS_AR[selectedMonth] : MONTHS_AR[new Date().getMonth()]} {selectedYear !== -1 ? selectedYear : new Date().getFullYear()}
             </p>
          </div>
        </div>
        <div className="flex gap-3 bg-white p-2 rounded-[1.5rem] border border-[#EAE4D9]/50 shadow-sm">
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-[#FDFBF7] border-none rounded-xl px-4 py-2 text-xs font-black outline-none cursor-pointer">
            {MONTHS_AR.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-[#FDFBF7] border-none rounded-xl px-4 py-2 text-xs font-black outline-none cursor-pointer">
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-green-100 shadow-xl shadow-green-600/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-green-500/10 transition-all" />
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">صافي إيرادات الحجوزات (بعد العمولات)</p>
          <div className="text-4xl font-black text-[#2A2723]">{totalRevenue.toLocaleString()} <small className="text-sm">ج.م</small></div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-xl shadow-red-600/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-red-500/10 transition-all" />
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">إجمالي المصروفات التشغيلية</p>
          <div className="text-4xl font-black text-[#2A2723]">{totalExpenses.toLocaleString()} <small className="text-sm">ج.م</small></div>
        </div>

        <div className="bg-[#2A2723] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C1A68D]/10 rounded-full blur-3xl -mr-12 -mt-12" />
          <p className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest mb-4">صافي الربح النهائي (الخزينة)</p>
          <div className="text-4xl font-black text-white">{netProfit.toLocaleString()} <small className="text-sm">ج.م</small></div>
        </div>
      </div>

      {/* Breakdown Table (Excel Style) */}
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#EAE4D9]/50 bg-[#FDFBF7]/50">
          <h3 className="text-xl font-black text-[#2A2723] flex items-center gap-3">
            <span>📊</span> ملخص مالي "Excel" للتحصيل والمصاريف
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#2A2723] text-white text-[11px] font-black uppercase tracking-widest">
                <th className="px-8 py-5 border-l border-white/10">البند</th>
                <th className="px-8 py-5 border-l border-white/10">القيمة (ج.م)</th>
                <th className="px-8 py-5">النسبة / ملاحظات</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold divide-y divide-[#EAE4D9]/30">
              <tr>
                <td className="px-8 py-5 bg-[#FDFBF7] font-black">إجمالي التحصيلات (Revenue)</td>
                <td className="px-8 py-5 text-green-600 font-black">{totalRevenue.toLocaleString()}</td>
                <td className="px-8 py-5 text-[#7A7061] text-xs">إجمالي مبالغ الحجوزات المعتمدة بعد خصم العمولات.</td>
              </tr>
              <tr>
                <td className="px-8 py-5 bg-[#FDFBF7] font-black">إجمالي المصروفات (Expenses)</td>
                <td className="px-8 py-5 text-red-600 font-black">-{totalExpenses.toLocaleString()}</td>
                <td className="px-8 py-5 text-[#7A7061] text-xs">تشمل الصيانة، الغسيل، الكهرباء، وأي بنود أخرى.</td>
              </tr>
              <tr className="bg-yellow-50/50">
                <td className="px-8 py-6 text-lg font-black border-t-2 border-[#2A2723]">الربح الصافي (Net Profit)</td>
                <td className="px-8 py-6 text-2xl font-black text-[#2A2723] border-t-2 border-[#2A2723]">{netProfit.toLocaleString()} ج.م</td>
                <td className="px-8 py-6 text-xs text-[#C1A68D] font-black border-t-2 border-[#2A2723]">المبلغ المتبقي فعلياً في الخزينة بعد كافة الالتزامات.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
