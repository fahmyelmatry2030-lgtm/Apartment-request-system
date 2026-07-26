"use client";

import { useState, useEffect, useMemo } from 'react';
import { getDbExpenses, saveDbExpense, deleteDbExpense } from '@/lib/actions/db';
import { Calendar, TrendingUp, DollarSign, ChevronDown, ChevronUp, Plus, Trash2, X, PlusCircle, CheckCircle2, Receipt, User, HelpCircle } from 'lucide-react';

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
  
  // Modal for new expense
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  
  // New Expense form state
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    date: '',
    branch: '12',
    from_entity: '',
    to_entity: '',
    ordered_by: '',
    invoice_number: '',
    category: 'عام',
  });

  useEffect(() => {
    const info = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('adminInfo') || '{}') : {};
    if (info?.role) setAdminRole(info.role);
    
    // Set default date to today
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setNewExpense(prev => ({
      ...prev,
      date: `${y}-${m}-${d}`
    }));
  }, []);

  const isAkoura = adminRole === 'Akoura';

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await getDbExpenses();
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses in summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Multi-Month Rollup Calculation (Months 1 to 12 for selectedYear)
  const monthlyRollupData = useMemo(() => {
    const activeYear = selectedYear !== -1 ? selectedYear : new Date().getFullYear();
    const result = [];

    for (let m = 0; m < 12; m++) {
      // Month bookings
      const mBookings = bookings.filter((b: any) => {
        if (b.status === 'deleted') return false;
        if (b.status !== 'approved' && b.status !== 'مؤكد') return false;
        const parts = b.checkIn?.split('-');
        if (!parts || parts.length < 2) return false;
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        if (month !== m || year !== activeYear) return false;

        const u = units.find((unit: any) => unit.id === b.apartmentId);
        if (isAkoura) {
          return u?.branch === 3 || String(b.apartmentId).startsWith('p-s');
        }
        return true;
      });

      // Month expenses
      const mExpenses = expenses.filter((e: any) => {
        if (!e.date) return false;
        const parts = e.date.split('-');
        if (parts.length < 2) return false;
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        if (month !== m || year !== activeYear) return false;

        if (isAkoura) {
          return e.branch === 3 || e.branch === '3' || String(e.unitId || '').startsWith('p-s');
        }
        return true;
      });

      const rev = mBookings.reduce((acc, b) => acc + (parseFloat(b.totalAmount || 0) - parseFloat(b.commission || 0)), 0);
      const exp = mExpenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);
      const profit = rev - exp;

      result.push({
        monthIndex: m,
        monthName: MONTHS_AR[m],
        bookingsCount: mBookings.length,
        revenue: rev,
        expenses: exp,
        netProfit: profit,
        hasData: rev > 0 || exp > 0 || mBookings.length > 0
      });
    }

    return result;
  }, [bookings, expenses, units, selectedYear, isAkoura]);

  // Filter bookings: only approved, matching month/year
  const filteredBookings = useMemo(() => {
    if (selectedMonth === -1 || selectedYear === -1) return [];
    return bookings.filter((b: any) => {
      if (b.status === 'deleted') return false;
      if (b.status !== 'approved' && b.status !== 'مؤكد') return false;

      const parts = b.checkIn?.split('-');
      if (!parts || parts.length < 2) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      if (month !== selectedMonth || year !== selectedYear) return false;

      const u = units.find((unit: any) => unit.id === b.apartmentId);
      if (isAkoura) {
        return u?.branch === 3 || String(b.apartmentId).startsWith('p-s');
      }
      return true;
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
        return e.branch === 3 || e.branch === '3' || String(e.unitId || '').startsWith('p-s');
      }
      return true;
    });
  }, [expenses, selectedMonth, selectedYear, isAkoura]);

  // ── Calculation Helper ──
  const calculateEntityData = (entityKey: 'mazar12' | 'mazar3' | 'apt-1' | 'apt-2' | 'apt-3') => {
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

    const entityExpensesList = filteredExpenses.filter((e: any) => {
      const b = parseInt(e.branch) || 12;
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

  const getBranchLabel = (branch: any) => {
    const b = parseInt(branch);
    if (b === 1 || b === 2 || b === 12) return 'مزار 1 و 2';
    if (b === 3) return 'مزار 3';
    if (b === 4) return 'شقة فندقية 1';
    if (b === 5) return 'شقة فندقية 2';
    if (b === 6) return 'شقة فندقية 3';
    return 'عام';
  };

  // Log new expense logic
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(newExpense.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }

    if (!newExpense.description.trim()) {
      alert('الرجاء إدخال السبب / البيان');
      return;
    }

    setSavingExpense(true);
    try {
      await saveDbExpense({
        category: newExpense.category || 'عام',
        amount: amount,
        description: newExpense.description.trim(),
        date: newExpense.date || new Date().toISOString().split('T')[0],
        branch: parseInt(newExpense.branch) || 12,
        from_entity: newExpense.from_entity.trim(),
        to_entity: newExpense.to_entity.trim(),
        ordered_by: newExpense.ordered_by.trim(),
        invoice_number: newExpense.invoice_number.trim(),
      });

      // Clear state and close
      setNewExpense(prev => ({
        ...prev,
        amount: '',
        description: '',
        from_entity: '',
        to_entity: '',
        ordered_by: '',
        invoice_number: '',
      }));
      setIsExpenseModalOpen(false);
      await loadExpenses();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      alert('خطأ في الإضافة: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setSavingExpense(false);
    }
  };

  // Delete expense logic
  const handleDeleteExpense = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await deleteDbExpense(id);
      await loadExpenses();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('فشل حذف المصروف');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      
      {/* --- Unified Monthly Account Card (مربع واحد كبير للشهر الحالي) --- */}
      <div className="bg-[#1F1C18] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-8 text-white relative overflow-hidden">
        
        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C1A68D]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        {/* Card Header: Month/Year selector & Action buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#C1A68D] text-xs font-black uppercase tracking-widest mb-1">
              <Calendar size={13} />
              <span>كشف الحساب الشهري المعروض</span>
            </div>
            <h2 className="text-3xl font-black text-white">
              شهر {MONTHS_AR[selectedMonth !== -1 ? selectedMonth : new Date().getMonth()]} {selectedYear !== -1 ? selectedYear : new Date().getFullYear()}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Selectors */}
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 shrink-0">
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
                className="bg-[#2A2723] text-white border border-white/10 rounded-lg px-3 py-1.5 text-xs font-black outline-none cursor-pointer">
                {MONTHS_AR.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-[#2A2723] text-white border border-white/10 rounded-lg px-3 py-1.5 text-xs font-black outline-none cursor-pointer">
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Quick Expense Logging Button */}
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-[#1F1C18] font-black px-6 py-2.5 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-102 shrink-0"
            >
              <PlusCircle size={14} />
              تسجيل مصروف جديد
            </button>
          </div>
        </div>

        {/* 3 Main KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Revenue */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">إجمالي الإيرادات (بعد العمولات)</span>
            <div className="text-3xl font-black text-emerald-400">
              {totalRevenue.toLocaleString()} <span className="text-xs text-white/70">ج.م</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">إجمالي المصروفات التشغيلية</span>
            <div className="text-3xl font-black text-red-400">
              -{totalExpenses.toLocaleString()} <span className="text-xs text-white/70">ج.م</span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-[#C1A68D]/10 p-6 rounded-2xl border border-[#C1A68D]/20 shadow-inner">
            <span className="text-[10px] font-black text-[#C1A68D] uppercase tracking-wider block mb-2">صافي الربح النهائي (الخزينة)</span>
            <div className="text-3xl font-black text-white">
              {netProfit.toLocaleString()} <span className="text-xs text-[#C1A68D]">ج.م</span>
            </div>
          </div>
        </div>

        {/* Detailed Expenses Breakdown for the Current Month */}
        <div className="space-y-4 pt-4 relative z-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-sm font-black text-[#C1A68D] uppercase tracking-wider">تفاصيل المصروفات لشهر {MONTHS_AR[selectedMonth]}</h3>
            <span className="text-[10px] text-gray-400 font-bold">{filteredExpenses.length} مصروف مسجل</span>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs font-bold bg-white/5 rounded-2xl border border-white/5">
              لا توجد مصروفات مسجلة لهذا الشهر.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10 pb-2">
                    <th className="pb-3 pr-2">التاريخ</th>
                    <th className="pb-3 pr-2">البيان / السبب</th>
                    <th className="pb-3 text-center">القسم</th>
                    <th className="pb-3 text-center">بواسطة</th>
                    <th className="pb-3 text-center">المبلغ (ج.م)</th>
                    <th className="pb-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredExpenses.map((exp, idx) => (
                    <tr key={exp.id || idx} className="hover:bg-white/5 transition-all">
                      <td className="py-3.5 pr-2 font-bold text-gray-300">
                        {exp.date ? new Date(exp.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="py-3.5 pr-2 font-black text-white">{exp.description}</td>
                      <td className="py-3.5 text-center font-bold text-gray-300">{getBranchLabel(exp.branch)}</td>
                      <td className="py-3.5 text-center font-bold text-gray-400">{exp.ordered_by || '—'}</td>
                      <td className="py-3.5 text-center font-black text-red-400">-{parseFloat(exp.amount || 0).toLocaleString()}</td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center mx-auto transition-all"
                          title="حذف المصروف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- Monthly Comparison Table (مقارنة شهور السنة بالكامل سطر بسطر) --- */}
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden space-y-6 p-8">
        <div>
          <h3 className="text-xl font-black text-[#2A2723] flex items-center gap-2">
            <span>📈</span> جدول مقارنة الأداء المالي بين شهور السنة
          </h3>
          <p className="text-xs text-gray-500 font-bold mt-1">
            مقارنة الإيرادات والمصروفات وصافي الربح في سطر كامل لكل شهر من شهور العام {selectedYear}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#2A2723] text-white font-black">
                <th className="px-6 py-4 rounded-r-2xl">الشهر</th>
                <th className="px-6 py-4 text-center">عدد الحجوزات</th>
                <th className="px-6 py-4 text-center">الإيرادات (ج.م)</th>
                <th className="px-6 py-4 text-center">المصروفات (ج.م)</th>
                <th className="px-6 py-4 text-center">صافي الربح (ج.م)</th>
                <th className="px-6 py-4 text-center rounded-l-2xl">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4D9]/30 font-bold text-[#7A7061]">
              {monthlyRollupData.map((m) => {
                const isSelected = m.monthIndex === selectedMonth;
                return (
                  <tr key={m.monthIndex} className={`hover:bg-[#FDFBF7] transition-all ${isSelected ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-6 py-4 font-black text-[#2A2723] text-sm">
                      {m.monthName} ({m.monthIndex + 1})
                      {isSelected && <span className="bg-[#C1A68D] text-white text-[9px] font-black px-2 py-0.5 rounded-full mr-2">الحالي</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-black text-[#2A2723]">{m.bookingsCount} حجز</td>
                    <td className="px-6 py-4 text-center text-emerald-600 font-black">{m.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-red-500 font-black">-{m.expenses.toLocaleString()}</td>
                    <td className={`px-6 py-4 text-center text-sm font-black ${m.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {m.netProfit.toLocaleString()} ج.م
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedMonth(m.monthIndex)}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                          isSelected ? 'bg-[#2A2723] text-white' : 'bg-[#EAE4D9]/50 hover:bg-[#C1A68D] hover:text-white text-[#7A7061]'
                        }`}
                      >
                        عرض التفاصيل 🔍
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Branch-by-Branch breakdown details --- */}
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#EAE4D9]/50 bg-[#FDFBF7]/50">
          <h3 className="text-lg font-black text-[#2A2723] flex items-center gap-3">
            <span>🏢</span> التوزيع المالي التفصيلي حسب الأقسام والفروع لشهر {MONTHS_AR[selectedMonth]}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#2A2723] text-white font-black">
                <th className="px-8 py-4 text-right">القسم / الفرع</th>
                <th className="px-8 py-4 text-center">صافي الإيرادات (ج.م)</th>
                <th className="px-8 py-4 text-center">المصروفات التشغيلية (ج.م)</th>
                <th className="px-8 py-4 text-center">صافي الربح (ج.م)</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold divide-y divide-[#EAE4D9]/30 text-[#7A7061] text-center">
              {!isAkoura ? (
                <>
                  {/* Mazar 1 & 2 */}
                  <tr className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-8 py-4 font-black text-right text-[#2A2723]">مزار 1 و 2</td>
                    <td className="px-8 py-4 text-green-600 font-black">{mazar12Data.revenue.toLocaleString()}</td>
                    <td className="px-8 py-4 text-red-600 font-black">-{mazar12Data.expenses.toLocaleString()}</td>
                    <td className={`px-8 py-4 font-black ${mazar12Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {mazar12Data.netProfit.toLocaleString()}
                    </td>
                  </tr>
                  {/* Mazar 3 */}
                  <tr className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-8 py-4 font-black text-right text-[#2A2723]">مزار 3 (أكورا)</td>
                    <td className="px-8 py-4 text-green-600 font-black">{mazar3Data.revenue.toLocaleString()}</td>
                    <td className="px-8 py-4 text-red-600 font-black">-{mazar3Data.expenses.toLocaleString()}</td>
                    <td className={`px-8 py-4 font-black ${mazar3Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {mazar3Data.netProfit.toLocaleString()}
                    </td>
                  </tr>
                  {/* Apartment 1 */}
                  <tr className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-8 py-4 font-black text-right text-[#2A2723]">شقة فندقية 1</td>
                    <td className="px-8 py-4 text-green-600 font-black">{apt1Data.revenue.toLocaleString()}</td>
                    <td className="px-8 py-4 text-red-600 font-black">-{apt1Data.expenses.toLocaleString()}</td>
                    <td className={`px-8 py-4 font-black ${apt1Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {apt1Data.netProfit.toLocaleString()}
                    </td>
                  </tr>
                  {/* Apartment 2 */}
                  <tr className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-8 py-4 font-black text-right text-[#2A2723]">شقة فندقية 2</td>
                    <td className="px-8 py-4 text-green-600 font-black">{apt2Data.revenue.toLocaleString()}</td>
                    <td className="px-8 py-4 text-red-600 font-black">-{apt2Data.expenses.toLocaleString()}</td>
                    <td className={`px-8 py-4 font-black ${apt2Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {apt2Data.netProfit.toLocaleString()}
                    </td>
                  </tr>
                  {/* Apartment 3 */}
                  <tr className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-8 py-4 font-black text-right text-[#2A2723]">شقة فندقية 3</td>
                    <td className="px-8 py-4 text-green-600 font-black">{apt3Data.revenue.toLocaleString()}</td>
                    <td className="px-8 py-4 text-red-600 font-black">-{apt3Data.expenses.toLocaleString()}</td>
                    <td className={`px-8 py-4 font-black ${apt3Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {apt3Data.netProfit.toLocaleString()}
                    </td>
                  </tr>
                </>
              ) : (
                /* Akoura View */
                <tr className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="px-8 py-4 font-black text-right text-[#2A2723]">مزار 3 (أكورا)</td>
                  <td className="px-8 py-4 text-green-600 font-black">{mazar3Data.revenue.toLocaleString()}</td>
                  <td className="px-8 py-4 text-red-600 font-black">-{mazar3Data.expenses.toLocaleString()}</td>
                  <td className={`px-8 py-4 font-black ${mazar3Data.netProfit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                    {mazar3Data.netProfit.toLocaleString()}
                  </td>
                </tr>
              )}
              {/* Grand Total Row */}
              <tr className="bg-yellow-50/50">
                <td className="px-8 py-6 text-sm font-black border-t border-[#2A2723] text-[#2A2723] text-right">الإجمالي الشامل (Grand Total)</td>
                <td className="px-8 py-6 text-sm font-black text-green-700 border-t border-[#2A2723]">{totalRevenue.toLocaleString()}</td>
                <td className="px-8 py-6 text-sm font-black text-red-600 border-t border-[#2A2723]">-{totalExpenses.toLocaleString()}</td>
                <td className="px-8 py-6 text-lg font-black text-[#2A2723] border-t border-[#2A2723]">{netProfit.toLocaleString()} ج.م</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Add Expense Modal --- */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsExpenseModalOpen(false)}>
          <div className="relative w-full max-w-lg bg-[#1F1C18] border border-white/10 rounded-[2rem] shadow-2xl p-6 text-white overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Receipt size={18} className="text-[#C1A68D]" />
                تسجيل مصروف تشغيلي جديد
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="font-black text-gray-300">المبلغ بالجنيه *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="مثال: 1500"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="font-black text-gray-300">التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={newExpense.date}
                    onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-black text-gray-300">البيان / السبب بالتفصيل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فاتورة كهرباء، صيانة تكييف استوديو 3، أدوات نظافة"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#C1A68D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Branch / Entity */}
                <div className="space-y-1.5">
                  <label className="font-black text-gray-300">القسم / الفرع *</label>
                  <select
                    value={newExpense.branch}
                    onChange={e => setNewExpense({...newExpense, branch: e.target.value})}
                    disabled={isAkoura}
                    className="w-full bg-[#2A2723] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#C1A68D] cursor-pointer"
                  >
                    {!isAkoura && (
                      <>
                        <option value="12">مزار 1 و 2</option>
                        <option value="4">شقة فندقية 1</option>
                        <option value="5">شقة فندقية 2</option>
                        <option value="6">شقة فندقية 3</option>
                      </>
                    )}
                    <option value="3">مزار 3 (أكورا)</option>
                  </select>
                </div>

                {/* Ordered By */}
                <div className="space-y-1.5">
                  <label className="font-black text-gray-300">من طلب الصرف (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: م. أحمد"
                    value={newExpense.ordered_by}
                    onChange={e => setNewExpense({...newExpense, ordered_by: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* From Entity */}
                <div className="space-y-1.5">
                  <label className="font-black text-gray-300">من خزينة / حساب (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: الخزينة الرئيسية"
                    value={newExpense.from_entity}
                    onChange={e => setNewExpense({...newExpense, from_entity: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>

                {/* To Entity */}
                <div className="space-y-1.5">
                  <label className="font-black text-gray-300">إلى جهة / المورد (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: شركة الكهرباء"
                    value={newExpense.to_entity}
                    onChange={e => setNewExpense({...newExpense, to_entity: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Invoice Number */}
                <div className="space-y-1.5">
                  <label className="font-black text-gray-300">رقم الفاتورة / الإيصال (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: INV-987"
                    value={newExpense.invoice_number}
                    onChange={e => setNewExpense({...newExpense, invoice_number: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="font-black text-gray-300">الفئة (عام، صيانة، فواتير...)</label>
                  <select
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full bg-[#2A2723] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#C1A68D] cursor-pointer"
                  >
                    <option value="عام">عام</option>
                    <option value="صيانة">صيانة</option>
                    <option value="فواتير">فواتير / خدمات</option>
                    <option value="رواتب">رواتب وأجور</option>
                    <option value="مشتريات">مشتريات / بضاعة</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={savingExpense}
                className="w-full bg-amber-500 hover:bg-amber-400 text-[#1F1C18] font-black py-3 rounded-2xl text-xs transition-all shadow-lg mt-4 disabled:opacity-50"
              >
                {savingExpense ? 'جاري الحفظ والتدقيق...' : 'حفظ وتسجيل المصروف في الحساب 💾'}
              </button>

            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

    </div>
  );
}
