"use client";

import { useState, useEffect, useMemo } from 'react';
import { getBookings, getSystemUnits } from '@/lib/data-init';
import { saveDbExpense, deleteDbExpense, getDbExpenses, getDbSalaries } from '@/lib/actions/db';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const PARTNERS = [
  { key: 'MH', label: 'M.H', percentage: 35 },
  { key: 'MM', label: 'M.M', percentage: 23.5 },
  { key: 'ME', label: 'M.E', percentage: 23.5 },
  { key: 'MO', label: 'M.O', percentage: 18 },
];

export default function FinancePage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '', from_entity: '', to_entity: '', ordered_by: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [b, expData, salData, unitsData] = await Promise.all([
        getBookings(),
        getDbExpenses(),
        getDbSalaries(),
        getSystemUnits()
      ]);
      setBookings(b);
      setExpenses(expData || []);
      setSalaries(salData || []);
      setUnits(unitsData || []);
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const monthlyBookings = useMemo(() => {
    return bookings.filter((b: any) => {
      if (b.status === 'deleted') return false;
      if (b.status !== 'approved' && b.status !== 'مؤكد') return false;
      const parts = b.checkIn?.split('-');
      if (!parts || parts.length < 2) return false;
      return parseInt(parts[1], 10) - 1 === selectedMonth && parseInt(parts[0], 10) === selectedYear;
    });
  }, [bookings, selectedMonth, selectedYear]);

  const monthlyExpenses = useMemo(() => {
    return expenses.filter((e: any) => {
      if (!e.date) return false;
      // Split "YYYY-MM-DD" to avoid timezone shifts
      const parts = e.date.split('-');
      if (parts.length < 2) return false;
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      return month === selectedMonth && year === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  const monthlySalaries = useMemo(() => {
    return salaries.filter((s: any) =>
      Number(s.month) - 1 === selectedMonth && Number(s.year) === selectedYear
    );
  }, [salaries, selectedMonth, selectedYear]);

  const revenue = monthlyBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
  const commissions = monthlyBookings.reduce((sum, b) => sum + parseFloat(b.commission || 0), 0);
  const totalNights = monthlyBookings.reduce((sum, b) => sum + (Number(b.numberOfDays) || 0), 0);
  const avgNightlyRate = totalNights > 0 ? revenue / totalNights : 0;
  
  // Grouped Revenue
  const studioRevenue = monthlyBookings
    .filter(b => units.find(u => u.id === b.apartmentId)?.type === 'studio')
    .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
    
  const apartmentRevenue = monthlyBookings
    .filter(b => units.find(u => u.id === b.apartmentId)?.type === 'apartment')
    .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
  
  // Smart Categorization:
  const rentTotal = monthlyExpenses
    .filter(e => e.category === 'إيجار')
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    
  const salariesFromExpenses = monthlyExpenses
    .filter(e => e.category === 'رواتب' || e.category === 'مرتبات' || e.category === 'مرتب')
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    
  const salariesTotal = monthlySalaries.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0) + salariesFromExpenses;
  
  const otherExpenses = monthlyExpenses
    .filter(e => 
      e.category !== 'إيجار' && 
      e.category !== 'رواتب' && 
      e.category !== 'مرتبات' && 
      e.category !== 'مرتب'
    )
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const netProfit = revenue - commissions - rentTotal - otherExpenses - salariesTotal;
  const totalExpenses = rentTotal + otherExpenses + salariesTotal;

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await deleteDbExpense(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('خطأ في الحذف');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">

      {/* ── HEADER ── */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#2A2723]">الإدارة <span className="text-[#C1A68D]">المالية الشاملة</span></h1>
          <p className="text-[#7A7061] font-bold opacity-70 text-sm mt-1">ملخص الإيرادات، المصروفات، وتوزيع الأرباح</p>
        </div>
        <div className="flex gap-3 bg-white p-2 rounded-[1.5rem] border border-[#EAE4D9]/50 shadow-sm">
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-[#FDFBF7] border-none rounded-xl px-4 py-2 text-xs font-black outline-none">
            {MONTHS_AR.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-[#FDFBF7] border-none rounded-xl px-4 py-2 text-xs font-black outline-none">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm text-center">
          <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">إجمالي الإيرادات</p>
          <div className="text-3xl font-black text-green-600">{isLoading ? '...' : revenue.toLocaleString()} <small className="text-sm">ج.م</small></div>
          <p className="text-[10px] text-[#7A7061] mt-2">{monthlyBookings.length} حجز مؤكد</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border-2 border-blue-500/30 shadow-sm text-center">
          <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">إيراد الاستديوهات</p>
          <div className="text-2xl font-black text-blue-600">{isLoading ? '...' : studioRevenue.toLocaleString()} <small className="text-xs">ج.م</small></div>
          <p className="text-[9px] text-blue-400 mt-2 font-bold">جميع الاستديوهات</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border-2 border-amber-500/30 shadow-sm text-center">
          <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">إيراد الشقق</p>
          <div className="text-2xl font-black text-amber-600">{isLoading ? '...' : apartmentRevenue.toLocaleString()} <small className="text-xs">ج.م</small></div>
          <p className="text-[9px] text-amber-500 mt-2 font-bold">جميع الشقق</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm text-center">
          <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">معدل سعر الليلة</p>
          <div className="text-2xl font-black text-[#2A2723]">{isLoading ? '...' : Math.round(avgNightlyRate).toLocaleString()} <small className="text-xs">ج.م</small></div>
          <p className="text-[10px] text-[#7A7061] mt-2">{totalNights} ليلة إجمالاً</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm text-center">
          <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">إجمالي العمولات</p>
          <div className="text-2xl font-black text-orange-500">{isLoading ? '...' : commissions.toLocaleString()} <small className="text-xs">ج.م</small></div>
          <p className="text-[10px] text-[#7A7061] mt-2">مخصومة من الإيرادات</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-red-500/20 shadow-sm text-center">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">إجمالي المصروفات</p>
          <div className="text-2xl font-black text-red-600">{isLoading ? '...' : totalExpenses.toLocaleString()} <small className="text-xs">ج.م</small></div>
          <p className="text-[10px] text-[#7A7061] mt-2">إيجارات + رواتب + تشغيل</p>
        </div>
      </div>


      {/* ── SUM TABLE (Excel Layout) ── */}
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
        <div className="bg-[#2A2723] px-8 py-4 flex items-center gap-3">
          <span className="text-white font-black text-sm tracking-widest uppercase">SUM</span>
          <span className="text-[#C1A68D] text-xs font-bold">— ملخص الدورة المالية لشهر {MONTHS_AR[selectedMonth]} {selectedYear}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr>
                <th className="px-6 py-4 font-black text-xs bg-[#F97316] text-white border border-orange-300">Rent</th>
                <th className="px-6 py-4 font-black text-xs bg-[#F97316] text-white border border-orange-300">Expenses</th>
                <th className="px-6 py-4 font-black text-xs bg-[#F97316] text-white border border-orange-300">Salaries</th>
                <th className="px-6 py-4 font-black text-sm bg-[#FACC15] text-[#2A2723] border border-yellow-300">Final</th>
              </tr>
              <tr>
                <th className="px-4 py-1 text-[10px] font-bold text-[#7A7061] bg-orange-50 border border-orange-100">الإيجار</th>
                <th className="px-4 py-1 text-[10px] font-bold text-[#7A7061] bg-orange-50 border border-orange-100">المصروفات</th>
                <th className="px-4 py-1 text-[10px] font-bold text-[#7A7061] bg-orange-50 border border-orange-100">الرواتب</th>
                <th className="px-4 py-1 text-[10px] font-bold text-[#2A2723] bg-yellow-50 border border-yellow-100">الصافي النهائي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-6 py-8 border border-[#EAE4D9]/40">
                  <div className="text-2xl font-black text-[#2A2723]">{isLoading ? '...' : rentTotal.toLocaleString()}</div>
                  <div className="text-[10px] text-[#7A7061] font-bold">ج.م</div>
                </td>
                <td className="px-6 py-8 border border-[#EAE4D9]/40">
                  <div className="text-2xl font-black text-red-600">{isLoading ? '...' : otherExpenses.toLocaleString()}</div>
                  <div className="text-[10px] text-[#7A7061] font-bold">ج.م</div>
                </td>
                <td className="px-6 py-8 border border-[#EAE4D9]/40">
                  <div className="text-2xl font-black text-orange-600">{isLoading ? '...' : salariesTotal.toLocaleString()}</div>
                  <div className="text-[10px] text-[#7A7061] font-bold">ج.م</div>
                </td>
                <td className={`px-6 py-8 border border-yellow-200 bg-[#FACC15]/10 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="text-3xl font-black">{isLoading ? '...' : netProfit.toLocaleString()}</div>
                  <div className="text-[10px] text-[#7A7061] font-bold">ج.م</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PROFIT DISTRIBUTION TABLE (Excel Layout) ── */}
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
        <div className="bg-[#2A2723] px-8 py-4 flex items-center justify-between">
          <h2 className="text-white font-black text-sm tracking-widest uppercase">توزيع الأرباح بين الشركاء</h2>
          <span className="text-[#C1A68D] text-xs font-black bg-white/10 px-4 py-1.5 rounded-full">
            صافي الربح: {netProfit.toLocaleString()} ج.م
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-[#FDFBF7]">
                <th className="px-8 py-4 font-black text-xs text-[#7A7061] border border-[#EAE4D9]/60 w-32">Name</th>
                {PARTNERS.map(p => (
                  <th key={p.key} className="px-8 py-4 font-black text-sm text-[#2A2723] border border-[#EAE4D9]/60">
                    {p.label}
                    <span className="block text-[10px] font-bold text-[#C1A68D]">({p.percentage}%)</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-8 py-6 font-black text-[#7A7061] text-sm border border-[#EAE4D9]/40 bg-[#FDFBF7]/60">Value</td>
                {PARTNERS.map(p => (
                  <td key={p.key} className="px-8 py-6 border border-[#EAE4D9]/40">
                    <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {isLoading ? '...' : Math.round(netProfit * p.percentage / 100).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#7A7061] font-bold mt-1">ج.م</div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FINAL NET BAR ── */}
      <div className={`p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 ${netProfit >= 0 ? 'bg-[#2A2723]' : 'bg-red-900'}`}>
        <div className="text-center md:text-right">
          <p className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest mb-2">
            صافي الربح النهائي — {MONTHS_AR[selectedMonth]} {selectedYear}
          </p>
          <p className="text-xs text-gray-400 font-bold">
            الإيرادات ({revenue.toLocaleString()}) − العمولات − الإيجارات − المصروفات − الرواتب
          </p>
        </div>
        <div className={`text-5xl font-black ${netProfit >= 0 ? 'text-white' : 'text-red-200'}`}>
          {isLoading ? '...' : netProfit.toLocaleString()} <small className="text-sm">ج.م</small>
        </div>
      </div>

    </div>
  );
}
