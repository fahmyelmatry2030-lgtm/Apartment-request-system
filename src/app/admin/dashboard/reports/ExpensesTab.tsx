"use client";

import { useState, useEffect, useMemo } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { saveDbExpense, deleteDbExpense } from '@/lib/actions/db';

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    branch: '1',
    from_entity: '',
    to_entity: '',
    ordered_by: ''
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const parseDate = (displayStr: string) => {
    if (!displayStr || !displayStr.includes('/')) return displayStr;
    const [d, m, y] = displayStr.split('/');
    if (y && m && d) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    return displayStr;
  };

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
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

  // ── Derived Data ──
  const filteredExpenses = useMemo(() => {
    if (!selectedCategory) return expenses;
    return expenses.filter(e => e.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [filteredExpenses]);

  const categories = [
    { name: 'صيانة', icon: '🛠️', color: '#8B4513' },
    { name: 'غسيل', icon: '🧺', color: '#4682B4' },
    { name: 'إيجار', icon: '🏠', color: '#2F4F4F' },
    { name: 'كهرباء', icon: '⚡', color: '#FFD700' },
    { name: 'رواتب', icon: '💰', color: '#228B22' },
    { name: 'أخرى', icon: '📦', color: '#708090' },
  ];

  const categoryStats = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      count: expenses.filter(e => e.category === cat.name).length
    }));
  }, [expenses]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveDbExpense({
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        date: newExpense.date,
        branch: parseInt(newExpense.branch),
        from_entity: newExpense.from_entity,
        to_entity: newExpense.to_entity,
        ordered_by: newExpense.ordered_by
      });
      setNewExpense({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        branch: '1',
        from_entity: '',
        to_entity: '',
        ordered_by: ''
      });
      loadExpenses();
    } catch (error: any) {
      alert('خطأ في الإضافة: ' + error.message);
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
             <p className="text-mazar-gray font-bold uppercase tracking-widest text-[10px]">إدارة السجلات المالية الذكية</p>
          </div>
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
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">الفئة الأساسية</label>
              <input 
                required
                placeholder="مثال: غسيل، صيانة"
                value={newExpense.category}
                onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>
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
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">التاريخ (يوم/شهر/سنة)</label>
              <input 
                type="text"
                required
                placeholder="DD/MM/YYYY"
                value={formatDate(newExpense.date)}
                onChange={e => {
                  const val = e.target.value;
                  // Simple auto-formatting for DD/MM/YYYY
                  let clean = val.replace(/[^0-9/]/g, '');
                  setNewExpense({...newExpense, date: parseDate(clean)});
                }}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all" 
              />
            </div>
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">الآمر بالصرف</label>
              <input 
                placeholder="اسم المسؤول"
                value={newExpense.ordered_by}
                onChange={e => setNewExpense({...newExpense, ordered_by: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">من (الجهة)</label>
              <input 
                placeholder="مصدر المبلغ"
                value={newExpense.from_entity}
                onChange={e => setNewExpense({...newExpense, from_entity: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">إلى (الجهة)</label>
              <input 
                placeholder="المستلم"
                value={newExpense.to_entity}
                onChange={e => setNewExpense({...newExpense, to_entity: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>
            <div className="space-y-3 lg:col-span-2 group">
              <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">ملاحظات إضافية</label>
              <input 
                placeholder="اكتب تفاصيل إضافية للعملية..."
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                className="w-full bg-transparent border-b-2 border-gray-100 px-0 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all placeholder:text-gray-300" 
              />
            </div>
          </div>
          
          <button type="submit" className="w-full bg-mazar-coffee text-white font-black py-6 rounded-2xl hover:bg-mazar-gold hover:text-mazar-coffee transition-all shadow-2xl active:scale-95 uppercase tracking-[0.3em] text-xs">
            تأكيد وإدراج المصروف في النظام
          </button>
        </form>
      </div>

      {/* Categories Horizontal Scroll / Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categoryStats.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
            className={`glass-card group flex flex-col items-center justify-center gap-3 py-6 transition-all duration-500 relative overflow-hidden ${selectedCategory === cat.name ? 'border-mazar-gold bg-mazar-coffee text-white scale-105 shadow-2xl' : 'hover:border-mazar-gold/50'}`}
          >
            {selectedCategory === cat.name && (
              <div className="absolute top-0 right-0 p-1">
                <div className="w-2 h-2 rounded-full bg-mazar-gold shadow-[0_0_10px_#D4AF37]"></div>
              </div>
            )}
            <span className={`text-4xl transition-transform duration-500 ${selectedCategory === cat.name ? 'scale-110' : 'group-hover:scale-125'}`}>{cat.icon}</span>
            <span className="font-black text-xs uppercase tracking-widest">{cat.name}</span>
            <div className={`text-[10px] font-black px-3 py-1 rounded-full transition-colors ${selectedCategory === cat.name ? 'bg-mazar-gold text-mazar-coffee' : 'bg-gray-100 text-gray-400 group-hover:bg-mazar-gold/20'}`}>
              {cat.count} عملية
            </div>
          </button>
        ))}
      </div>

      {/* Summary Banner (Animated) */}
      <div className="bg-mazar-coffee p-12 rounded-[3rem] text-white flex flex-col lg:flex-row justify-between items-center gap-10 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(44,38,28,0.4)] border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-mazar-gold/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10 text-center lg:text-right">
          <p className="text-mazar-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 opacity-80">إجمالي التكاليف {selectedCategory ? `(فئة ${selectedCategory})` : '(كافة الفئات)'}</p>
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

      {/* Records Section (Dynamic Filtering) */}
      <div className="space-y-8">
        <div className="flex justify-between items-end px-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-2xl font-black text-mazar-coffee uppercase leading-none">سجلات القيود</h3>
            <p className="text-[9px] font-black text-mazar-gray uppercase tracking-widest mt-2">
              عرض {filteredExpenses.length} عملية {selectedCategory ? `في فئة ${selectedCategory}` : ''}
            </p>
          </div>
          <div className="flex gap-4">
             {selectedCategory && (
               <button 
                 onClick={() => setSelectedCategory(null)}
                 className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest"
               >
                 إلغاء الفلتر ✕
               </button>
             )}
             <button className="text-[10px] font-black text-mazar-gold hover:text-mazar-coffee transition-colors uppercase tracking-[0.2em] border-b-2 border-mazar-gold">تصدير PDF ↓</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block w-12 h-12 border-4 border-mazar-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-mazar-gray font-black uppercase tracking-widest text-xs">جاري جلب البيانات...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-32 text-center glass-card border-dashed border-gray-200">
               <span className="text-4xl block mb-4 opacity-20">📂</span>
               <div className="text-gray-400 font-black uppercase tracking-widest text-xs">لا توجد سجلات مطابقة لهذا البحث</div>
            </div>
          ) : filteredExpenses.map((exp, i) => (
            <div 
              key={exp.id} 
              className="glass-card flex flex-col md:flex-row items-center justify-between gap-8 p-8 hover:border-mazar-gold/50 group transition-all animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="w-16 h-16 rounded-3xl bg-[#FDFBF7] border border-[#EAE4D9] flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-mazar-coffee group-hover:text-white transition-all duration-500 shadow-sm">
                  <span className="text-[11px] font-black leading-none">{formatDate(exp.date)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{categories.find(c => c.name === exp.category)?.icon || '📦'}</span>
                    <h4 className="font-black text-xl text-mazar-coffee uppercase tracking-tight">{exp.category}</h4>
                  </div>
                  <p className="text-[9px] font-black text-mazar-gray uppercase tracking-[0.2em]">
                    بواسطة: <span className="text-mazar-coffee">{exp.ordered_by || '---'}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-10 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-gray-50">
                <div className="text-center md:text-right">
                  <p className="text-[9px] font-black text-mazar-gray uppercase tracking-widest mb-1 opacity-50">المسار (من / إلى)</p>
                  <p className="text-xs font-bold text-mazar-coffee bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                    {exp.from_entity || '---'} 
                    <span className="mx-2 text-mazar-gold">←</span> 
                    {exp.to_entity || '---'}
                  </p>
                </div>
                <div className="text-center md:text-right min-w-[140px]">
                  <p className="text-[9px] font-black text-mazar-gray uppercase tracking-widest mb-1 opacity-50">القيمة المالية</p>
                  <p className="text-3xl font-black text-red-600 tracking-tighter">
                    -{exp.amount?.toLocaleString()} 
                    <span className="text-xs font-bold mr-2">ج.م</span>
                  </p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handleDelete(exp.id)} 
                    className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
