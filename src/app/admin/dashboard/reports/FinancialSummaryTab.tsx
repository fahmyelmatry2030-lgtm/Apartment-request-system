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
        // Super Admin: All bookings
        return true;
      }
    });
  }, [bookings, units, selectedMonth, selectedYear, isAkoura]);

  // Filter expenses by selected month/year
  const filteredExpenses = useMemo(() => {
    if (selectedMonth === -1 || selectedYear === -1) return [];
    return expenses.filter((e: any) => {
      if (!e.date) return false;
      const parts = e.date.split('-');
      if (parts.length < 2) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      if (month !== selectedMonth || year !== selectedYear) return false;

      if (isAkoura) {
        // For Akoura: only show expenses tagged to branch 3
        return e.branch === 3 || e.branch === '3' || String(e.unitId || '').startsWith('p-s');
      } else {
        // Super Admin: All expenses
        return true;
      }
    });
  }, [expenses, selectedMonth, selectedYear, isAkoura]);

  // ── Calculation Helper ──
  const calculateEntityData = (entityKey: 'mazar12' | 'mazar3' | 'apt-1' | 'apt-2' | 'apt-3') => {
    // 1. Filter Bookings
    const entityBookings = filteredBookings.filter((b: any) => {
      const u = units.find((unit: any) => unit.id === b.apartmentId);
      if (entityKey === 'mazar12') {
        return u?.type === 'studio' && (u?.branch === 1 || u?.branch === 2 || u?.branch === 12 || !u?.branch);
      }
      if (entityKey === 'mazar3') {
        return u?.branch === 3 || String(b.apartmentId).startsWith('p-s');
      }
      return b.apartmentId === entityKey;
    });

    // 2. Filter Expenses
    const entityExpensesList = filteredExpenses.filter((e: any) => {
      const b = parseInt(e.branch) || 12; // default to 12
      if (entityKey === 'mazar12') {
        return b === 1 || b === 2 || b === 12 || !e.branch;
      }
      if (entityKey === 'mazar3') {
        return b === 3;
      }
      if (entityKey === 'apt-1') return b === 4;
      if (entityKey === 'apt-2') return b === 5;
      if (entityKey === 'apt-3') return b === 6;
      return false;
    });

    const revenue = entityBookings.reduce(
      (acc, b) => acc + (parseFloat(b.totalAmount || 0) - parseFloat(b.commission || 0)),
      0
    );

    const expensesAmount = entityExpensesList.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);

    return {
      revenue,
      expenses: expensesAmount,
      netProfit: revenue - expensesAmount
    };
  };

  const mazar12Data = useMemo(() => calculateEntityData('mazar12'), [filteredBookings, filteredExpenses, units]);
  const mazar3Data = useMemo(() => calculateEntityData('mazar3'), [filteredBookings, filteredExpenses, units]);
  const apt1Data = useMemo(() => calculateEntityData('apt-1'), [filteredBookings, filteredExpenses, units]);
  const apt2Data = useMemo(() => calculateEntityData('apt-2'), [filteredBookings, filteredExpenses, units]);
  const apt3Data = useMemo(() => calculateEntityData('apt-3'), [filteredBookings, filteredExpenses, units]);

  // Grand Totals
  const totalRevenue = useMemo(() => {
    if (isAkoura) return mazar3Data.revenue;
    return mazar12Data.revenue + mazar3Data.revenue + apt1Data.revenue + apt2Data.revenue + apt3Data.revenue;
  }, [isAkoura, mazar12Data, mazar3Data, apt1Data, apt2Data, apt3Data]);

  const totalExpenses = useMemo(() => {
    if (isAkoura) return mazar3Data.expenses;
    return mazar12Data.expenses + mazar3Data.expenses + apt1Data.expenses + apt2Data.expenses + apt3Data.expenses;
  }, [isAkoura, mazar12Data, mazar3Data, apt1Data, apt2Data, apt3Data]);

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
            <span>📊</span> ملخص مالي مفصل للتحصيل والمصاريف
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#2A2723] text-white text-[11px] font-black uppercase tracking-widest">
                <th className="px-8 py-5 border-l border-white/10 text-center">القسم / الفرع</th>
                <th className="px-8 py-5 border-l border-white/10 text-center">صافي الإيرادات (ج.م)</th>
                <th className="px-8 py-5 border-l border-white/10 text-center">المصروفات التشغيلية (ج.م)</th>
                <th className="px-8 py-5 text-center">صافي الربح (ج.م)</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold divide-y divide-[#EAE4D9]/30 text-center">
              {!isAkoura ? (
                <>
                  {/* Mazar 1 & 2 */}
                  <tr className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-8 py-5 bg-[#FDFBF7]/40 font-black text-right">مزار 1 و 2</td>
                    <td className="px-8 py-5 text-green-600 font-black">{mazar12Data.revenue.toLocaleString()}</td>
                    <td className="px-8 py-5 text-red-600 font-black">-{mazar12Data.expenses.toLocaleString()}</td>
                    <td className={`px-8 py-5 font-black ${mazar12Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {mazar12Data.netProfit.toLocaleString()}
                    </td>
                  </tr>
                  {/* Mazar 3 */}
                  <tr className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-8 py-5 bg-[#FDFBF7]/40 font-black text-right">مزار 3 (أكورا)</td>
                    <td className="px-8 py-5 text-green-600 font-black">{mazar3Data.revenue.toLocaleString()}</td>
                    <td className="px-8 py-5 text-red-600 font-black">-{mazar3Data.expenses.toLocaleString()}</td>
                    <td className={`px-8 py-5 font-black ${mazar3Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {mazar3Data.netProfit.toLocaleString()}
                    </td>
                  </tr>
                  {/* Apartment 1 */}
                  <tr className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-8 py-5 bg-[#FDFBF7]/40 font-black text-right">شقة فندقية 1</td>
                    <td className="px-8 py-5 text-green-600 font-black">{apt1Data.revenue.toLocaleString()}</td>
                    <td className="px-8 py-5 text-red-600 font-black">-{apt1Data.expenses.toLocaleString()}</td>
                    <td className={`px-8 py-5 font-black ${apt1Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {apt1Data.netProfit.toLocaleString()}
                    </td>
                  </tr>
                  {/* Apartment 2 */}
                  <tr className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-8 py-5 bg-[#FDFBF7]/40 font-black text-right">شقة فندقية 2</td>
                    <td className="px-8 py-5 text-green-600 font-black">{apt2Data.revenue.toLocaleString()}</td>
                    <td className="px-8 py-5 text-red-600 font-black">-{apt2Data.expenses.toLocaleString()}</td>
                    <td className={`px-8 py-5 font-black ${apt2Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {apt2Data.netProfit.toLocaleString()}
                    </td>
                  </tr>
                  {/* Apartment 3 */}
                  <tr className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-8 py-5 bg-[#FDFBF7]/40 font-black text-right">شقة فندقية 3</td>
                    <td className="px-8 py-5 text-green-600 font-black">{apt3Data.revenue.toLocaleString()}</td>
                    <td className="px-8 py-5 text-red-600 font-black">-{apt3Data.expenses.toLocaleString()}</td>
                    <td className={`px-8 py-5 font-black ${apt3Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {apt3Data.netProfit.toLocaleString()}
                    </td>
                  </tr>
                </>
              ) : (
                /* Akoura View */
                <tr className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="px-8 py-5 bg-[#FDFBF7]/40 font-black text-right">مزار 3 (أكورا)</td>
                  <td className="px-8 py-5 text-green-600 font-black">{mazar3Data.revenue.toLocaleString()}</td>
                  <td className="px-8 py-5 text-red-600 font-black">-{mazar3Data.expenses.toLocaleString()}</td>
                  <td className={`px-8 py-5 font-black ${mazar3Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                    {mazar3Data.netProfit.toLocaleString()}
                  </td>
                </tr>
              )}
              {/* Grand Total Row */}
              <tr className="bg-yellow-50/50">
                <td className="px-8 py-6 text-lg font-black border-t-2 border-[#2A2723] text-right">الإجمالي الشامل (Grand Total)</td>
                <td className="px-8 py-6 text-lg font-black text-green-700 border-t-2 border-[#2A2723]">{totalRevenue.toLocaleString()}</td>
                <td className="px-8 py-6 text-lg font-black text-red-600 border-t-2 border-[#2A2723]">-{totalExpenses.toLocaleString()}</td>
                <td className="px-8 py-6 text-2xl font-black text-[#2A2723] border-t-2 border-[#2A2723]">{netProfit.toLocaleString()} ج.م</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
