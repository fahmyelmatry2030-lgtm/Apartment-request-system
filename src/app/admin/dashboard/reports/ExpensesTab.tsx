"use client";

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ExpensesTab() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  const loadExpenses = async () => {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading expenses:', error);
      setError(error.message);
    } else {
      setExpenses(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('expenses').insert([{
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
      branch: parseInt(newExpense.branch),
      from_entity: newExpense.from_entity,
      to_entity: newExpense.to_entity,
      ordered_by: newExpense.ordered_by
    }]);

    if (error) {
      alert('خطأ في الإضافة: ' + error.message);
    } else {
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
      setIsFormOpen(false);
      loadExpenses();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) alert(error.message);
    else loadExpenses();
  };

  const categories = [
    { name: 'صيانة', icon: '🛠️', count: expenses.filter(e => e.category === 'صيانة').length },
    { name: 'غسيل', icon: '🧺', count: expenses.filter(e => e.category === 'غسيل').length },
    { name: 'إيجار', icon: '🏠', count: expenses.filter(e => e.category === 'إيجار').length },
    { name: 'كهرباء', icon: '⚡', count: expenses.filter(e => e.category === 'كهرباء').length },
    { name: 'رواتب', icon: '💰', count: expenses.filter(e => e.category === 'رواتب').length },
    { name: 'أخرى', icon: '📦', count: expenses.filter(e => e.category === 'أخرى').length },
  ];

  const totalAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  if (error && (error.includes('Could not find the table') || error.includes('relation "public.expenses" does not exist'))) {
    return (
      <div className="p-12 text-center glass-card border-red-100">
        <span className="text-5xl mb-6 block">⚠️</span>
        <h3 className="text-2xl font-black mb-3">جدول المصروفات غير موجود</h3>
        <p className="text-mazar-gray mb-8">يرجى تشغيل كود الـ SQL التالي في Supabase لتفعيل هذه الصفحة:</p>
        <pre className="bg-mazar-coffee text-white p-6 rounded-[1.5rem] text-left text-[11px] overflow-x-auto">
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
    <div className="space-y-12 animate-fade-in" dir="rtl">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-mazar-coffee uppercase tracking-tight">المصروفات</h2>
          <p className="text-mazar-gray mt-2 font-bold uppercase tracking-widest text-xs">إدارة ومتابعة السجلات المالية</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex-1 md:flex-none bg-mazar-coffee text-white px-8 py-4 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            {isFormOpen ? 'إغلاق النموذج' : 'إضافة مصروف جديد'}
            <span>{isFormOpen ? '✕' : '➕'}</span>
          </button>
        </div>
      </div>

      {/* Categories Grid (Inspired by the Screenshot) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat, i) => (
          <div 
            key={i} 
            className="glass-card group cursor-pointer hover:bg-mazar-coffee hover:text-white transition-all duration-500 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-mazar-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{cat.icon}</span>
              <span className="font-black text-sm uppercase tracking-wide">{cat.name}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black opacity-40 group-hover:opacity-60">{cat.count} عملية</span>
                <span className="text-mazar-gold group-hover:text-white">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Banner */}
      <div className="bg-mazar-coffee p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mazar-gold/5 blur-[100px] rounded-full"></div>
        <div className="relative z-10 text-center md:text-right">
          <p className="text-mazar-gold font-black uppercase tracking-widest text-[10px] mb-2">إجمالي المصروفات المسجلة</p>
          <h3 className="text-5xl md:text-7xl font-black">{totalAmount.toLocaleString()} <span className="text-lg md:text-2xl text-mazar-gold">ج.م</span></h3>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[1.5rem] text-center">
            <p className="text-mazar-gold text-[10px] font-black uppercase mb-1">عدد العمليات</p>
            <p className="text-2xl font-black">{expenses.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[1.5rem] text-center">
            <p className="text-mazar-gold text-[10px] font-black uppercase mb-1">هذا الشهر</p>
            <p className="text-2xl font-black">---</p>
          </div>
        </div>
      </div>

      {/* Add Form (Expandable) */}
      {isFormOpen && (
        <div className="glass-card animate-slide-up border-mazar-gold/30">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
             <span className="w-8 h-8 rounded-full bg-mazar-coffee text-white flex items-center justify-center text-xs">01</span>
             تفاصيل المصروف الجديد
          </h3>
          <form onSubmit={handleAddExpense} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40">الفئة الأساسية</label>
                <input 
                  required
                  placeholder="مثال: غسيل، صيانة"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full bg-[#FDFBF7] border-b-2 border-[#EAE4D9] px-2 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40">المبلغ المطلوب (ج.م)</label>
                <input 
                  type="number"
                  required
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full bg-[#FDFBF7] border-b-2 border-[#EAE4D9] px-2 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40">تاريخ العملية</label>
                <input 
                  type="date"
                  required
                  value={newExpense.date}
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full bg-[#FDFBF7] border-b-2 border-[#EAE4D9] px-2 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40">من (الجهة)</label>
                <input 
                  placeholder="---"
                  value={newExpense.from_entity}
                  onChange={e => setNewExpense({...newExpense, from_entity: e.target.value})}
                  className="w-full bg-[#FDFBF7] border-b-2 border-[#EAE4D9] px-2 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40">إلى (الجهة)</label>
                <input 
                  placeholder="---"
                  value={newExpense.to_entity}
                  onChange={e => setNewExpense({...newExpense, to_entity: e.target.value})}
                  className="w-full bg-[#FDFBF7] border-b-2 border-[#EAE4D9] px-2 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40">الآمر بالصرف</label>
                <input 
                  placeholder="---"
                  value={newExpense.ordered_by}
                  onChange={e => setNewExpense({...newExpense, ordered_by: e.target.value})}
                  className="w-full bg-[#FDFBF7] border-b-2 border-[#EAE4D9] px-2 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all" 
                />
              </div>
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black text-mazar-coffee uppercase tracking-widest opacity-40">الوصف التفصيلي</label>
                <textarea 
                  placeholder="أدخل أي ملاحظات إضافية هنا..."
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full bg-[#FDFBF7] border-b-2 border-[#EAE4D9] px-2 py-4 text-sm font-bold outline-none focus:border-mazar-gold transition-all h-24 resize-none"
                />
            </div>
            <button type="submit" className="w-full bg-mazar-coffee text-white font-black py-6 rounded-[1.5rem] hover:bg-black transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs">
              تأكيد وإضافة المصروف للقيود
            </button>
          </form>
        </div>
      )}

      {/* Records Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-xl font-black text-mazar-coffee uppercase">أحدث القيود</h3>
          <button className="text-xs font-black text-mazar-gold hover:text-mazar-coffee transition-colors uppercase tracking-widest">تصدير التقارير ↓</button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="p-20 text-center text-mazar-gray italic font-bold">جاري المزامنة...</div>
          ) : expenses.length === 0 ? (
            <div className="p-20 text-center glass-card opacity-40 font-bold uppercase tracking-widest text-xs">لا توجد قيود مسجلة حتى الآن</div>
          ) : expenses.map((exp) => (
            <div key={exp.id} className="glass-card flex flex-col md:flex-row items-center justify-between gap-6 hover:border-mazar-gold/50 group transition-all">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-14 h-14 rounded-full bg-mazar-coffee text-white flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-mazar-gold transition-colors">
                  <span className="text-[10px] font-black leading-none">{new Date(exp.date).toLocaleDateString('ar-EG', { day: '2-digit' })}</span>
                  <span className="text-[10px] font-black leading-none mt-1 opacity-60 uppercase">{new Date(exp.date).toLocaleDateString('ar-EG', { month: 'short' })}</span>
                </div>
                <div>
                  <h4 className="font-black text-lg text-mazar-coffee uppercase">{exp.category}</h4>
                  <p className="text-[10px] font-black text-mazar-gray uppercase tracking-widest mt-1">بواسطة: {exp.ordered_by || '---'} • فرع {exp.branch}</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-[#EAE4D9]">
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-mazar-gray uppercase tracking-widest mb-1">الجهة (من/إلى)</p>
                  <p className="text-xs font-bold text-mazar-coffee">{exp.from_entity || '---'} → {exp.to_entity || '---'}</p>
                </div>
                <div className="text-center md:text-right min-w-[120px]">
                  <p className="text-[10px] font-black text-mazar-gray uppercase tracking-widest mb-1">المبلغ</p>
                  <p className="text-xl font-black text-red-600">-{exp.amount?.toLocaleString()} <span className="text-[10px]">ج.م</span></p>
                </div>
                <button 
                  onClick={() => handleDelete(exp.id)} 
                  className="w-10 h-10 rounded-full border border-red-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
