"use client";

import { useState, useEffect, useMemo } from 'react';
import { getDbExpenses } from '@/lib/actions/db';

interface FinancialSummaryTabProps {
  bookings: any[];
  units: any[];
  selectedMonth: number;
  selectedYear: number;
}

export default function FinancialSummaryTab({
  bookings,
  units,
  selectedMonth,
  selectedYear
}: FinancialSummaryTabProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Filter bookings: only approved, matching month/year, and of type studio (branch !== 3)
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

      // Filter by Studio only (type === 'studio' && branch !== 3)
      const u = units.find(unit => unit.id === b.apartmentId);
      return u?.type === 'studio' && u?.branch !== 3;
    });
  }, [bookings, units, selectedMonth, selectedYear]);

  // Filter expenses by selected month/year
  const filteredExpenses = useMemo(() => {
    if (selectedMonth === -1 || selectedYear === -1) return [];
    return expenses.filter((e: any) => {
      if (!e.date) return false;
      const parts = e.date.split('-');
      if (parts.length < 2) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      return month === selectedMonth && year === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

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

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
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
