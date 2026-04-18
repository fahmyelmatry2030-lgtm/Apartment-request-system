"use client";

import { useEffect, useState, useCallback } from 'react';
import { getDbStaff, saveDbStaff, deleteDbStaff, getDbSalaries, saveDbSalary, deleteDbSalary } from '@/lib/actions/db';

export default function SalariesManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>({});
  const [newSalary, setNewSalary] = useState<any>({
    staff_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    bonuses: 0,
    deductions: 0,
    payment_status: 'pending',
    notes: ''
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const s = await getDbStaff();
      const sal = await getDbSalaries();
      setStaff(Array.isArray(s) ? s : []);
      setSalaries(Array.isArray(sal) ? sal : []);
    } catch (error) {
      console.error('Failed to load HR data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff.name) return;
    
    const data = {
      id: editingStaff.id || `staff-${Date.now()}`,
      name: editingStaff.name,
      position: editingStaff.position || '',
      base_salary: Number(editingStaff.base_salary) || 0,
      phone: editingStaff.phone || '',
      hiring_date: editingStaff.hiring_date || new Date().toISOString().split('T')[0]
    };
    await saveDbStaff(data);
    setShowStaffModal(false);
    setEditingStaff({});
    loadData();
  };

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalary.staff_id) return;
    
    const staffMember = staff.find(s => s.id === newSalary.staff_id);
    if (!staffMember) return;

    const bonuses = Number(newSalary.bonuses) || 0;
    const deductions = Number(newSalary.deductions) || 0;
    const net_salary = (Number(staffMember.base_salary) || 0) + bonuses - deductions;

    const data = {
      id: `sal-${Date.now()}`,
      ...newSalary,
      net_salary,
      payment_date: newSalary.payment_status === 'paid' ? new Date().toISOString() : null
    };
    await saveDbSalary(data);
    setShowSalaryModal(false);
    loadData();
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 text-[#2A2723]">إدارة <span className="text-[#C1A68D]">المرتبات</span></h1>
          <p className="text-[#7A7061] font-bold opacity-70 text-sm">متابعة مستحقات الموظفين، الحوافز، والخصومات الشهرية.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setEditingStaff({}); setShowStaffModal(true); }}
            className="bg-white border border-[#EAE4D9] text-[#2A2723] font-black px-6 py-3 rounded-2xl hover:bg-gray-50 transition-all text-sm shadow-sm"
          >
            إضافة موظف +
          </button>
          <button 
            onClick={() => setShowSalaryModal(true)}
            className="bg-[#2A2723] text-white font-black px-8 py-3 rounded-2xl hover:bg-black transition-all text-sm shadow-xl shadow-black/10"
          >
            تسجيل صرف راتب 💸
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Staff List */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-black text-lg text-[#2A2723] flex items-center gap-2">
            <span>👥</span> طاقم العمل
          </h3>
          <div className="space-y-4">
            {staff.length === 0 && !isLoading && (
              <div className="p-10 text-center bg-white border border-dashed border-[#EAE4D9] rounded-3xl opacity-40 text-[10px] font-black uppercase">لا يوجد موظفين حالياً.</div>
            )}
            {staff.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm flex items-center justify-between group">
                <div>
                  <div className="font-black text-[#2A2723] text-sm">{s.name}</div>
                  <div className="text-[10px] text-[#C1A68D] font-black uppercase tracking-widest mt-1">{s.position}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-[#2A2723]">{s.base_salary} <span className="text-[10px]">ج.م</span></div>
                  <button 
                    onClick={() => { setEditingStaff(s); setShowStaffModal(true); }}
                    className="text-[9px] font-black text-[#7A7061] hover:text-[#C1A68D] transition-colors mt-1 opacity-0 group-hover:opacity-100"
                  >
                    تعديل البيانات
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary History */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-black text-lg text-[#2A2723] flex items-center gap-2">
            <span>📜</span> سجل الصرف الأخير
          </h3>
          <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FDFBF7] border-b border-[#EAE4D9]/50">
                <tr>
                  <th className="px-6 py-4 font-black text-[#7A7061] uppercase">الموظف</th>
                  <th className="px-6 py-4 font-black text-[#7A7061] uppercase text-center">الفترة</th>
                  <th className="px-6 py-4 font-black text-[#7A7061] uppercase text-center">الإجمالي</th>
                  <th className="px-6 py-4 font-black text-[#7A7061] uppercase text-center">الحالة</th>
                  <th className="px-6 py-4 font-black text-[#7A7061] uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D9]/20">
                {salaries.map((sal, i) => {
                  const s = staff.find(st => st.id === sal.staff_id);
                  return (
                    <tr key={i} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-black text-[#2A2723]">{s?.name || 'موظف سابق'}</div>
                        <div className="text-[8px] text-[#7A7061] font-bold opacity-60">الأساسي: {s?.base_salary}</div>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-[#7A7061]">{sal.month} / {sal.year}</td>
                      <td className="px-6 py-5 text-center font-black text-[#C1A68D]">{sal.net_salary} ج.م</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black ${sal.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {sal.payment_status === 'paid' ? 'تم الصرف' : 'معلق'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <button 
                          onClick={async () => { if(confirm('هل انت متأكد؟')) { await deleteDbSalary(sal.id); loadData(); } }}
                          className="text-red-300 hover:text-red-500 transition-colors"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1816]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-8 border-b border-[#EAE4D9]/50 flex justify-between items-center">
              <h2 className="text-xl font-black text-[#2A2723]">بيانات الموظف</h2>
              <button onClick={() => setShowStaffModal(false)} className="text-2xl opacity-20 hover:opacity-100 transition-opacity">×</button>
            </div>
            <form onSubmit={handleSaveStaff} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">الاسم بالكامل</label>
                <input 
                  type="text" required
                  value={editingStaff.name || ''}
                  onChange={e => setEditingStaff({...editingStaff, name: e.target.value})}
                  className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C1A68D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">الوظيفة</label>
                  <input 
                    type="text" required
                    value={editingStaff.position || ''}
                    onChange={e => setEditingStaff({...editingStaff, position: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">الراتب الأساسي</label>
                  <input 
                    type="number" required
                    value={editingStaff.base_salary || ''}
                    onChange={e => setEditingStaff({...editingStaff, base_salary: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
              </div>
              <button className="w-full bg-[#2A2723] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black transition-all">حفظ البيانات ✅</button>
            </form>
          </div>
        </div>
      )}

      {/* Salary Payout Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1816]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-8 border-b border-[#EAE4D9]/50 flex justify-between items-center">
              <h2 className="text-xl font-black text-[#2A2723]">صرف راتب جديد</h2>
              <button onClick={() => setShowSalaryModal(false)} className="text-2xl opacity-20 hover:opacity-100 transition-opacity">×</button>
            </div>
            <form onSubmit={handleSaveSalary} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">اختار الموظف</label>
                <select 
                  required
                  value={newSalary.staff_id}
                  onChange={e => setNewSalary({...newSalary, staff_id: e.target.value})}
                  className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C1A68D]"
                >
                  <option value="">-- اختار من القائمة --</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.base_salary} ج.م)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">الحوافز (+) </label>
                  <input 
                    type="number"
                    value={newSalary.bonuses}
                    onChange={e => setNewSalary({...newSalary, bonuses: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C1A68D] text-green-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">الخصومات (-) </label>
                  <input 
                    type="number"
                    value={newSalary.deductions}
                    onChange={e => setNewSalary({...newSalary, deductions: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C1A68D] text-red-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">حالة الدفع</label>
                <div className="flex gap-4">
                  {['pending', 'paid'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewSalary({...newSalary, payment_status: status})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${newSalary.payment_status === status ? 'bg-[#2A2723] text-white shadow-lg' : 'bg-[#FDFBF7] text-[#7A7061]'}`}
                    >
                      {status === 'paid' ? 'تم الدفع ✅' : 'قيد الانتظار ⏳'}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full bg-[#C1A68D] text-white font-black py-5 rounded-3xl shadow-xl hover:opacity-90 transition-all">تأكيد عملية الصرف 💰</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-10 rounded-[3rem] border border-[#EAE4D9]/50 mt-10 flex gap-8 items-center">
         <div className="text-4xl">💡</div>
         <p className="text-xs text-[#7A7061] font-bold leading-relaxed">
           يتم حساب الصافي تلقائياً بناءً على (الراتب الأساسي + الحوافز - الخصومات). جميع العمليات المسجلة تظهر في التقارير المالية العامة لضمان دقة الحسابات.
         </p>
      </div>
    </div>
  );
}
