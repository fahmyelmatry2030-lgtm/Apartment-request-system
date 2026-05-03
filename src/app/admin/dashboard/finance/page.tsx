"use client";

import { useState, useEffect, useMemo } from 'react';
import { getBookings } from '@/lib/data-init';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { saveDbExpense, deleteDbExpense } from '@/lib/actions/db';

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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '', from_entity: '', to_entity: '', ordered_by: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    const [b] = await Promise.all([getBookings()]);
    setBookings(b);

    const { data: expData } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    setExpenses(expData || []);

    const { data: salData } = await supabase.from('salaries').select('*');
    setSalaries(salData || []);

    setIsLoading(false);
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
      const d = new Date(e.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
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
  const rentTotal = monthlyExpenses.filter(e => e.category === 'إيجار').reduce((s, e) => s + (e.amount || 0), 0);
  const otherExpenses = monthlyExpenses.filter(e => e.category !== 'إيجار' && !e.category.startsWith('إيجار')).reduce((s, e) => s + (e.amount || 0), 0);
  const salariesTotal = monthlySalaries.reduce((sum, s) => sum + (s.amount || 0), 0);
  const netProfit = revenue - commissions - rentTotal - otherExpenses - salariesTotal;


  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount) return;
    setSaving(true);
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    try {
      await saveDbExpense({
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: dateStr,
        description: newExpense.description,
        from_entity: newExpense.from_entity,
        to_entity: newExpense.to_entity,
        ordered_by: newExpense.ordered_by
      });
      setNewExpense({ category: '', amount: '', description: '', from_entity: '', to_entity: '', ordered_by: '' });
      await loadData();
    } catch (err) {
      console.error(err);
      alert('خطأ في الإضافة');
    }
    setSaving(false);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm text-center">
          <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">إجمالي الإيرادات</p>
          <div className="text-3xl font-black text-green-600">{isLoading ? '...' : revenue.toLocaleString()} <small className="text-sm">ج.م</small></div>
          <p className="text-[10px] text-[#7A7061] mt-2">{monthlyBookings.length} حجز مؤكد</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border-2 border-[#C1A68D]/30 shadow-sm text-center">
          <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">معدل سعر الليلة الواحدة</p>
          <div className="text-3xl font-black text-[#C1A68D]">{isLoading ? '...' : Math.round(avgNightlyRate).toLocaleString()} <small className="text-sm">ج.م</small></div>
          <p className="text-[10px] text-[#7A7061] mt-2">{totalNights} ليلة إجمالاً</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm text-center">
          <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">إجمالي العمولات</p>
          <div className="text-3xl font-black text-orange-500">{isLoading ? '...' : commissions.toLocaleString()} <small className="text-sm">ج.م</small></div>
          <p className="text-[10px] text-[#7A7061] mt-2">مخصومة من الإيرادات</p>
        </div>
      </div>



      {/* ── ADD EXPENSE FORM ── */}
      <div className="bg-white p-8 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm">
        <h3 className="font-black text-[#2A2723] mb-6 text-lg flex items-center gap-3">
          <span className="w-9 h-9 bg-[#C1A68D]/10 text-[#C1A68D] rounded-xl flex items-center justify-center">➕</span>
          إضافة مصروف — Expenses
        </h3>
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">الفئة</label>
            <input required value={newExpense.category}
              onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">المبلغ (ج.م)</label>
            <input type="number" required value={newExpense.amount}
              onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">من</label>
            <input value={newExpense.from_entity}
              onChange={e => setNewExpense({ ...newExpense, from_entity: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">إلى</label>
            <input value={newExpense.to_entity}
              onChange={e => setNewExpense({ ...newExpense, to_entity: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">الآمر بالصرف</label>
            <input value={newExpense.ordered_by}
              onChange={e => setNewExpense({ ...newExpense, ordered_by: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">ملاحظات</label>
            <input value={newExpense.description}
              onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D] transition-colors" />
          </div>
          <div className="lg:col-span-6 flex justify-end">
            <button type="submit" disabled={saving}
              className="bg-[#C1A68D] text-white font-black px-12 py-3.5 rounded-xl hover:bg-[#a08060] transition-all disabled:opacity-40 active:scale-95 shadow-sm">
              {saving ? 'جاري الحفظ...' : 'إضافة المصروف'}
            </button>
          </div>
        </form>
      </div>

      {/* ── MONTHLY EXPENSES TABLE ── */}
      {monthlyExpenses.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#EAE4D9]/50 bg-[#FDFBF7]/50 flex justify-between items-center">
            <h3 className="font-black text-[#2A2723]">
              تفاصيل مصروفات {MONTHS_AR[selectedMonth]} {selectedYear}
            </h3>
            <span className="text-[10px] font-black bg-red-50 text-red-500 px-4 py-1.5 rounded-full">
              الإجمالي: {monthlyExpenses.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()} ج.م
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#2A2723] text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">الفئة</th>
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">من</th>
                  <th className="px-6 py-4">إلى</th>
                  <th className="px-6 py-4">الآمر بالصرف</th>
                  <th className="px-6 py-4">الوصف</th>
                  <th className="px-6 py-4 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D9]/30">
                {monthlyExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="px-6 py-4 font-black text-[#2A2723]">{exp.category}</td>
                    <td className="px-6 py-4 font-black text-red-600">- {exp.amount?.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-xs text-[#7A7061] font-bold">{exp.from_entity || '—'}</td>
                    <td className="px-6 py-4 text-xs text-[#7A7061] font-bold">{exp.to_entity || '—'}</td>
                    <td className="px-6 py-4 text-xs text-[#2A2723] font-black">{exp.ordered_by || '—'}</td>
                    <td className="px-6 py-4 text-xs text-[#7A7061] font-bold">{exp.description || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(exp.id)}
                        className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
