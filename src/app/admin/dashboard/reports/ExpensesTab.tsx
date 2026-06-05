"use client";

import { useState, useEffect, useMemo } from 'react';
import { saveDbExpense, deleteDbExpense, getDbExpenses, updateDbExpense } from '@/lib/actions/db';
import { Pencil, Trash2 } from 'lucide-react';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

// ── Custom CountUp Component (No external lib needed) ──
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 800; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (outQuart)
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * ease);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export default function ExpensesTab() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(-1);
  const [selectedYear, setSelectedYear] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
  }, []);

  const getDefaultDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    date: '',
    branch: '1',
    from_entity: '',
    to_entity: '',
    ordered_by: '',
    invoice_number: '',
  });

  useEffect(() => {
    setNewExpense(prev => ({
      ...prev,
      date: getDefaultDate()
    }));
  }, []);

  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  const parseDate = (displayStr: string) => {
    if (!displayStr || !displayStr.includes('/')) return displayStr;
    const parts = displayStr.split('/');
    if (parts.length !== 3) return displayStr;
    const [d, m, y] = parts;
    if (y && y.length === 4 && m && d) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    return displayStr;
  };

  // Validate date is in YYYY-MM-DD format
  const isValidDate = (dateStr: string) => {
    if (!dateStr) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  };

  const [adminRole, setAdminRole] = useState<string>('Super Admin');

  useEffect(() => {
    const info = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('adminInfo') || '{}') : {};
    if (info?.role) {
      setAdminRole(info.role);
      if (info.role === 'Akoura') {
        setNewExpense(prev => ({ ...prev, branch: '3' }));
      }
    }
  }, []);

  const isAkoura = adminRole === 'Akoura';

  const getBranchLabel = (branch: any) => {
    const b = parseInt(branch);
    if (b === 1) return 'مزار 1';
    if (b === 2) return 'مزار 2';
    if (b === 3) return 'مزار 3';
    if (b === 4) return 'شقة 1';
    if (b === 5) return 'شقة 2';
    if (b === 6) return 'شقة 3';
    return 'مزار 1';
  };

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await getDbExpenses();
      let cleanData = data || [];
      if (typeof window !== 'undefined') {
        const info = JSON.parse(sessionStorage.getItem('adminInfo') || '{}');
        if (info?.role === 'Akoura') {
          cleanData = cleanData.filter((e: any) => e.branch === 3);
        }
      }
      setExpenses(cleanData);
      setError(null);
    } catch (err: any) {
      console.error('Error loading expenses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // ── Derived Data: Filter by month ──
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e: any) => {
      if (!e.date) return false;
      const parts = e.date.split('-');
      if (parts.length < 2) return false;
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      return month === selectedMonth && year === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [filteredExpenses]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate amount
    const amount = parseFloat(newExpense.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }

    // Validate description
    if (!newExpense.description.trim()) {
      alert('الرجاء إدخال السبب / البيان');
      return;
    }

    // Validate and fix date
    let dateToSave = newExpense.date;
    if (!isValidDate(dateToSave)) {
      // Try to parse it in case it's in DD/MM/YYYY format
      const parsed = parseDate(dateToSave);
      if (isValidDate(parsed)) {
        dateToSave = parsed;
      } else {
        // Fallback to today's date
        dateToSave = getDefaultDate();
      }
    }

    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveDbExpense({
        category: 'عام',
        amount: amount,
        description: newExpense.description.trim(),
        date: dateToSave,
        branch: parseInt(newExpense.branch) || 1,
        from_entity: newExpense.from_entity.trim(),
        to_entity: newExpense.to_entity.trim(),
        ordered_by: newExpense.ordered_by.trim(),
        invoice_number: newExpense.invoice_number.trim(),
      });
      setNewExpense({
        amount: '',
        description: '',
        date: getDefaultDate(),
        branch: '1',
        from_entity: '',
        to_entity: '',
        ordered_by: '',
        invoice_number: '',
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadExpenses();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      alert('خطأ في الإضافة: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense({ ...expense });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDbExpense(editingExpense.id, {
        amount: parseFloat(editingExpense.amount),
        description: editingExpense.description,
        date: editingExpense.date,
        from_entity: editingExpense.from_entity,
        to_entity: editingExpense.to_entity,
        ordered_by: editingExpense.ordered_by,
        invoice_number: editingExpense.invoice_number,
        branch: parseInt(editingExpense.branch) || 1,
      });
      setIsEditModalOpen(false);
      setEditingExpense(null);
      loadExpenses();
    } catch (error: any) {
      alert('خطأ في التعديل: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await deleteDbExpense(id);
      loadExpenses();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (error && (error.includes('Could not find the table') || error.includes('relation "public.expenses" does not exist'))) {
    return (
      <div className="p-12 text-center glass-card border-red-100 animate-in fade-in zoom-in duration-500">
        <span className="text-5xl mb-6 block animate-bounce">⚠️</span>
        <h3 className="text-2xl font-black mb-3 text-mazar-coffee">جدول المصروفات غير موجود</h3>
        <p className="text-mazar-gray mb-8">يرجى تشغيل كود الـ SQL التالي في Supabase لتفعيل هذه الصفحة:</p>
        <pre className="bg-mazar-coffee text-white p-6 rounded-[1.5rem] text-left text-[11px] overflow-x-auto shadow-2xl">
{`create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  amount numeric not null,
  date date not null default current_date,
  description text,
  branch integer default 1,
  from_entity text,
  to_entity text,
  ordered_by text,
  invoice_number text,
  created_at timestamptz default now()
);
alter table public.expenses enable row level security;
create policy "Allow all access" on public.expenses for all using (true) with check (true);`}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20" dir="rtl">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="animate-in slide-in-from-right duration-700">
          <h2 className="text-4xl md:text-6xl font-black text-mazar-coffee uppercase tracking-tighter leading-none">
            المصروفات
          </h2>
          <div className="flex items-center gap-3 mt-3">
             <span className="w-2 h-2 rounded-full bg-mazar-gold animate-pulse"></span>
             <p className="text-mazar-gray font-bold uppercase tracking-widest text-[10px]">مصروفات شهر {MONTHS_AR[selectedMonth]} {selectedYear}</p>
          </div>
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
      </div>

      {/* Add Form (Modernized) */}
      <div className="glass-card animate-in slide-in-from-bottom duration-500 border-mazar-gold/40 p-10 shadow-3xl">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-mazar-coffee text-white flex items-center justify-center font-black shadow-lg">01</div>
          <div>
             <h3 className="text-2xl font-black text-mazar-coffee uppercase">تسجيل مصروف جديد</h3>
             <p className="text-[10px] font-black text-mazar-gray uppercase tracking-widest mt-1">يرجى تعبئة كافة الحقول المطلوبة بدقة</p>
          </div>
        </div>

        <form onSubmit={handleAddExpense} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">

            {/* المبلغ */}
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">المبلغ (ج.م)</label>
              <input 
                type="number"
                required
                placeholder="0.00"
                value={newExpense.amount}
                onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>

            {/* التاريخ */}
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">التاريخ</label>
              <input 
                type="date"
                required
                value={newExpense.date}
                onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all" 
              />
            </div>

            {/* رقم الفاتورة */}
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">رقم الفاتورة</label>
              <input 
                placeholder="مثلاً: INV-001"
                value={newExpense.invoice_number}
                onChange={e => setNewExpense({...newExpense, invoice_number: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>

            {/* الآمر بالصرف */}
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">الآمر بالصرف</label>
              <input 
                placeholder="اسم المسؤول"
                value={newExpense.ordered_by}
                onChange={e => setNewExpense({...newExpense, ordered_by: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>

            {/* من */}
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">من (الجهة)</label>
              <input 
                placeholder="مصدر المبلغ"
                value={newExpense.from_entity}
                onChange={e => setNewExpense({...newExpense, from_entity: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>

            {/* إلى */}
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">إلى (الجهة)</label>
              <input 
                placeholder="المستلم"
                value={newExpense.to_entity}
                onChange={e => setNewExpense({...newExpense, to_entity: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>

            {/* الفرع / القسم */}
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">الفرع / القسم</label>
              <select
                disabled={isAkoura}
                value={newExpense.branch}
                onChange={e => setNewExpense({...newExpense, branch: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all cursor-pointer"
              >
                <option value="1">مزار 1</option>
                <option value="2">مزار 2</option>
                <option value="3">مزار 3</option>
                <option value="4">شقة 1</option>
                <option value="5">شقة 2</option>
                <option value="6">شقة 3</option>
              </select>
            </div>

            {/* السبب */}
            <div className="space-y-3 lg:col-span-2 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">السبب / البيان (Reason)</label>
              <input 
                required
                placeholder="مثلاً: إعلانات فيسبوك، شراء أدوات نظافة..."
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={saving}
            className={`w-full font-black py-6 rounded-2xl transition-all shadow-2xl active:scale-95 uppercase tracking-[0.3em] text-xs ${
              saving 
                ? 'bg-gray-400 text-white cursor-wait' 
                : saveSuccess 
                  ? 'bg-green-600 text-white' 
                  : 'bg-mazar-coffee text-white hover:bg-mazar-gold hover:text-mazar-coffee'
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                جاري الحفظ...
              </span>
            ) : saveSuccess ? (
              '✅ تم حفظ المصروف بنجاح!'
            ) : (
              'تأكيد وإدراج المصروف في النظام'
            )}
          </button>
        </form>
      </div>

      {/* Summary Banner (Animated) */}
      <div className="bg-mazar-coffee p-12 rounded-[3rem] text-white flex flex-col lg:flex-row justify-between items-center gap-10 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(44,38,28,0.4)] border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-mazar-gold/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10 text-center lg:text-right">
          <p className="text-mazar-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 opacity-80">إجمالي التكاليف (كافة المصروفات)</p>
          <h3 className="text-6xl md:text-8xl font-black tracking-tighter">
            <AnimatedNumber value={totalAmount} />
            <span className="text-xl md:text-3xl text-mazar-gold mr-4">ج.م</span>
          </h3>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 w-full lg:w-auto">
          <div className="glass-card bg-white/5 border-white/10 p-8 flex flex-col items-center justify-center min-w-[140px]">
            <p className="text-mazar-gold text-[10px] font-black uppercase tracking-widest mb-2">العمليات</p>
            <p className="text-3xl font-black"><AnimatedNumber value={filteredExpenses.length} /></p>
          </div>
          <div className="glass-card bg-white/5 border-white/10 p-8 flex flex-col items-center justify-center min-w-[140px]">
            <p className="text-mazar-gold text-[10px] font-black uppercase tracking-widest mb-2">أعلى مصروف</p>
            <p className="text-3xl font-black">
              {filteredExpenses.length > 0 ? (
                <AnimatedNumber value={Math.max(...filteredExpenses.map(e => e.amount || 0))} />
              ) : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Records Section (Excel Style Table) */}
      <div className="space-y-8">
        <div className="flex justify-between items-end px-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-2xl font-black text-mazar-coffee uppercase leading-none">سجلات القيود المالية</h3>
            <p className="text-[9px] font-black text-mazar-gray uppercase tracking-widest mt-2">
              عرض {filteredExpenses.length} عملية
            </p>
          </div>
          <div className="flex gap-4">
             <button className="text-[10px] font-black text-mazar-gold hover:text-mazar-coffee transition-colors uppercase tracking-[0.2em] border-b-2 border-mazar-gold">تصدير EXCEL ↓</button>
          </div>
        </div>
        
        <div className="glass-card overflow-hidden border-[#EAE4D9]/60 shadow-2xl rounded-[1.5rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#2A2723] text-white text-xs font-black uppercase tracking-widest">
                  <th className="px-4 py-5 border-x border-white/10 w-12">No</th>
                  <th className="px-4 py-5 border-x border-white/10 w-36">Date</th>
                  <th className="px-4 py-5 border-x border-white/10 w-32">Price</th>
                  <th className="px-4 py-5 border-x border-white/10">Reason</th>
                  <th className="px-4 py-5 border-x border-white/10 w-36">Invoice No</th>
                  <th className="px-4 py-5 border-x border-white/10 w-32">From</th>
                  <th className="px-4 py-5 border-x border-white/10 w-32">To</th>
                  <th className="px-4 py-5 border-x border-white/10 w-32">Order By</th>
                  <th className="px-4 py-5 border-x border-white/10 w-36">الفرع / القسم</th>
                  <th className="px-4 py-5 border-x border-white/10 w-32">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-20 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-mazar-gold border-t-transparent rounded-full animate-spin"></div>
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-32 text-center text-gray-300 font-black uppercase tracking-widest text-sm">لا توجد سجلات</td>
                  </tr>
                ) : filteredExpenses.map((exp, i) => (
                  <tr key={exp.id} className="hover:bg-[#FDFBF7] transition-colors group">
                    <td className="px-4 py-5 border border-[#EAE4D9]/40 text-sm font-black text-mazar-gray">{i + 1}</td>
                    <td className="px-4 py-5 border border-[#EAE4D9]/40 text-sm font-black whitespace-nowrap">{formatDate(exp.date)}</td>
                    <td className="px-4 py-5 border border-[#EAE4D9]/40 text-base font-black text-red-600">{exp.amount?.toLocaleString()}</td>
                    <td className="px-4 py-5 border border-[#EAE4D9]/40 text-right">
                      <span className="text-sm font-bold text-mazar-coffee">{exp.description || '—'}</span>
                    </td>
                    <td className="px-4 py-5 border border-[#EAE4D9]/40 text-sm font-bold text-mazar-gold">{exp.invoice_number || '—'}</td>
                    <td className="px-4 py-5 border border-[#EAE4D9]/40 text-sm font-bold text-mazar-coffee">{exp.from_entity || '—'}</td>
                    <td className="px-4 py-5 border border-[#EAE4D9]/40 text-sm font-bold text-mazar-coffee">{exp.to_entity || '—'}</td>
                    <td className="px-4 py-5 border border-[#EAE4D9]/40 text-sm font-bold text-mazar-coffee">{exp.ordered_by || '—'}</td>
                    <td className="px-4 py-5 border border-[#EAE4D9]/40 text-xs font-black text-mazar-gold">{getBranchLabel(exp.branch)}</td>
                    <td className="px-4 py-5 border border-[#EAE4D9]/40">
                      <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleEdit(exp)} 
                          className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                          title="تعديل"
                        >
                          <Pencil size={15} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => handleDelete(exp.id)} 
                          className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="حذف"
                        >
                          <Trash2 size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-3xl border border-white/10 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-mazar-coffee p-8 flex justify-between items-center text-white">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">تعديل سجل المصروف</h3>
                <p className="text-[10px] font-black text-mazar-gold uppercase tracking-[0.2em] mt-1">تعديل البيانات المالية المسجلة</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">✕</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* المبلغ */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-mazar-coffee uppercase tracking-widest opacity-60">المبلغ</label>
                  <input 
                    type="number"
                    required
                    value={editingExpense.amount}
                    onChange={e => setEditingExpense({...editingExpense, amount: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all"
                  />
                </div>

                {/* التاريخ */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-mazar-coffee uppercase tracking-widest opacity-60">التاريخ</label>
                  <input 
                    type="text"
                    required
                    value={formatDate(editingExpense.date)}
                    onChange={e => {
                      const val = e.target.value;
                      let clean = val.replace(/[^0-9/]/g, '');
                      setEditingExpense({...editingExpense, date: parseDate(clean)});
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all"
                  />
                </div>

                {/* رقم الفاتورة */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-mazar-coffee uppercase tracking-widest opacity-60">رقم الفاتورة</label>
                  <input 
                    value={editingExpense.invoice_number || ''}
                    onChange={e => setEditingExpense({...editingExpense, invoice_number: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all"
                  />
                </div>

                {/* الآمر بالصرف */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-mazar-coffee uppercase tracking-widest opacity-60">الآمر بالصرف</label>
                  <input 
                    value={editingExpense.ordered_by}
                    onChange={e => setEditingExpense({...editingExpense, ordered_by: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all"
                  />
                </div>

                {/* من */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-mazar-coffee uppercase tracking-widest opacity-60">من</label>
                  <input 
                    value={editingExpense.from_entity}
                    onChange={e => setEditingExpense({...editingExpense, from_entity: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all"
                  />
                </div>

                {/* إلى */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-mazar-coffee uppercase tracking-widest opacity-60">إلى</label>
                  <input 
                    value={editingExpense.to_entity}
                    onChange={e => setEditingExpense({...editingExpense, to_entity: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all"
                  />
                </div>

                {/* الفرع / القسم */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-mazar-coffee uppercase tracking-widest opacity-60">الفرع / القسم</label>
                  <select
                    disabled={isAkoura}
                    value={editingExpense.branch || '1'}
                    onChange={e => setEditingExpense({...editingExpense, branch: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all cursor-pointer"
                  >
                    <option value="1">مزار 1</option>
                    <option value="2">مزار 2</option>
                    <option value="3">مزار 3</option>
                    <option value="4">شقة 1</option>
                    <option value="5">شقة 2</option>
                    <option value="6">شقة 3</option>
                  </select>
                </div>

                {/* السبب */}
                <div className="lg:col-span-3 space-y-2">
                  <label className="text-[9px] font-black text-mazar-coffee uppercase tracking-widest opacity-60">السبب / البيان</label>
                  <input 
                    required
                    value={editingExpense.description}
                    onChange={e => setEditingExpense({...editingExpense, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-mazar-coffee text-white font-black py-5 rounded-2xl hover:bg-mazar-gold hover:text-mazar-coffee transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[11px]">حفظ التعديلات</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-10 bg-gray-100 text-gray-500 font-black py-5 rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-[11px]">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
