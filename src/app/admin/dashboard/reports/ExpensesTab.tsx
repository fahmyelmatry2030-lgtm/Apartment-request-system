"use client";

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ExpensesTab() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  if (error && (error.includes('Could not find the table') || error.includes('relation "public.expenses" does not exist'))) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border border-red-100">
        <span className="text-4xl mb-4 block">⚠️</span>
        <h3 className="text-xl font-black mb-2">جدول المصروفات غير موجود</h3>
        <p className="text-sm text-[#7A7061] mb-6">يرجى تشغيل كود الـ SQL التالي في Supabase Editor لتفعيل هذه الصفحة:</p>
        <pre className="bg-gray-50 p-4 rounded-xl text-left text-[10px] overflow-x-auto border border-gray-200">
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
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* Add Expense Form */}
      <div className="bg-white p-8 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm">
        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
          <span>➕</span> إضافة مصروف جديد
        </h3>
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">الفئة (مثال: غسيل، صيانة)</label>
            <input 
              required
              value={newExpense.category}
              onChange={e => setNewExpense({...newExpense, category: e.target.value})}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D]" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">المبلغ (ج.م)</label>
            <input 
              type="number"
              required
              value={newExpense.amount}
              onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D]" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">التاريخ</label>
            <input 
              type="date"
              required
              value={newExpense.date}
              onChange={e => setNewExpense({...newExpense, date: e.target.value})}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D]" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">الفرع</label>
            <select 
              value={newExpense.branch}
              onChange={e => setNewExpense({...newExpense, branch: e.target.value})}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D]"
            >
              <option value="1">فرع 1</option>
              <option value="2">فرع 2</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">من</label>
            <input 
              value={newExpense.from_entity}
              onChange={e => setNewExpense({...newExpense, from_entity: e.target.value})}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D]" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">إلى</label>
            <input 
              value={newExpense.to_entity}
              onChange={e => setNewExpense({...newExpense, to_entity: e.target.value})}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D]" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">الآمر بالصرف</label>
            <input 
              value={newExpense.ordered_by}
              onChange={e => setNewExpense({...newExpense, ordered_by: e.target.value})}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D]" 
            />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full bg-[#2A2723] text-white font-black px-6 py-3.5 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">
              إضافة مصروف
            </button>
          </div>
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-black text-[#C1A68D]">الوصف / ملاحظات</label>
            <textarea 
              value={newExpense.description}
              onChange={e => setNewExpense({...newExpense, description: e.target.value})}
              className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#C1A68D] h-12"
            />
          </div>
        </form>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#EAE4D9]/50 flex justify-between items-center bg-[#FDFBF7]/50">
          <h3 className="font-black text-[#2A2723]">سجل المصروفات الأخير</h3>
          <span className="text-[10px] font-black bg-[#C1A68D]/10 text-[#C1A68D] px-3 py-1 rounded-full">إجمالي: {expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()} ج.م</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#2A2723] text-white text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الفئة</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">الفرع</th>
                <th className="px-6 py-4">من</th>
                <th className="px-6 py-4">إلى</th>
                <th className="px-6 py-4">الآمر بالصرف</th>
                <th className="px-6 py-4">الوصف</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4D9]/30">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-[#7A7061] italic">جاري التحميل...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-[#7A7061] opacity-40">لا توجد مصروفات مسجلة.</td></tr>
              ) : expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#FDFBF7] transition-colors group">
                  <td className="px-6 py-4 font-bold text-[#7A7061] text-xs">{exp.date}</td>
                  <td className="px-6 py-4 font-black text-[#2A2723] text-sm">{exp.category}</td>
                  <td className="px-6 py-4 font-black text-red-600 text-sm">-{exp.amount?.toLocaleString()} ج.م</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#C1A68D]">فرع {exp.branch}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#7A7061]">{exp.from_entity || '---'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#7A7061]">{exp.to_entity || '---'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#2A2723]">{exp.ordered_by || '---'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#7A7061] opacity-70">{exp.description || '---'}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleDelete(exp.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
