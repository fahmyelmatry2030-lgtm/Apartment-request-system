"use client";

import { useEffect, useState, useCallback } from 'react';
import { getDbStaff, getDbVacations, saveDbVacation, deleteDbVacation } from '@/lib/actions/db';

export default function VacationsManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [vacations, setVacations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newVacation, setNewVacation] = useState<any>({
    staff_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    type: 'سنوية',
    notes: ''
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const s = await getDbStaff();
    const v = await getDbVacations();
    setStaff(s);
    setVacations(v);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      id: `vac-${Date.now()}`,
      ...newVacation
    };
    await saveDbVacation(data);
    setShowModal(false);
    loadData();
  };

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 text-[#2A2723]">إدارة <span className="text-[#C1A68D]">الإجازات</span></h1>
          <p className="text-[#7A7061] font-bold opacity-70 text-sm">تنظيم وتتبع إجازات الموظفين (سنوية، مرضية، عارضة).</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#2A2723] text-white font-black px-8 py-4 rounded-2xl hover:bg-black transition-all text-sm shadow-xl shadow-black/10 flex items-center gap-3"
        >
          <span className="text-xl">🌴</span> تسجيل إجازة جديدة
        </button>
      </header>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Vacation Types Stats */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm text-center">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-2xl font-black text-[#2A2723]">{vacations.filter(v => new Date(v.end_date) >= new Date()).length}</div>
                <div className="text-[10px] text-[#7A7061] font-black uppercase tracking-widest mt-1">موظفين في إجازة حالياً</div>
            </div>
            <div className="bg-[#C1A68D]/5 p-8 rounded-[2rem] border border-[#C1A68D]/20 shadow-sm">
                <h4 className="font-black text-xs text-[#2A2723] mb-4">أنواع الإجازات المسجلة</h4>
                <div className="space-y-3">
                    {['سنوية', 'مرضية', 'عارضة'].map(type => (
                        <div key={type} className="flex justify-between items-center bg-white/60 p-3 rounded-xl border border-[#EAE4D9]/50">
                            <span className="text-[10px] font-black">{type}</span>
                            <span className="text-xs font-black text-[#C1A68D]">{vacations.filter(v => v.type === type).length}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Vacations History */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FDFBF7] border-b border-[#EAE4D9]/50">
                <tr>
                  <th className="px-8 py-5 font-black text-[#7A7061] uppercase tracking-widest">الموظف</th>
                  <th className="px-8 py-5 font-black text-[#7A7061] uppercase tracking-widest">التاريخ</th>
                  <th className="px-8 py-5 font-black text-[#7A7061] uppercase tracking-widest text-center">النوع</th>
                  <th className="px-8 py-5 font-black text-[#7A7061] uppercase tracking-widest">ملاحظات</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D9]/20">
                {isLoading ? (
                    <tr><td colSpan={5} className="px-8 py-10 text-center animate-pulse font-black text-[#C1A68D]">جاري تحميل البيانات...</td></tr>
                ) : vacations.length === 0 ? (
                    <tr><td colSpan={5} className="px-8 py-20 text-center opacity-30 font-black">لا يوجد إجازات مسجلة.</td></tr>
                ) : vacations.map((vac, i) => {
                  const s = staff.find(st => st.id === vac.staff_id);
                  const isCurrent = new Date(vac.end_date) >= new Date() && new Date(vac.start_date) <= new Date();
                  return (
                    <tr key={i} className={`hover:bg-[#FDFBF7] transition-colors ${isCurrent ? 'bg-orange-50/30' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="font-black text-[#2A2723]">{s?.name || '---'}</div>
                        <div className="text-[8px] text-[#C1A68D] font-bold">{s?.position}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 font-bold text-[#7A7061]">
                            <span>{vac.start_date}</span>
                            <span className="opacity-30">➔</span>
                            <span>{vac.end_date}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black ${
                            vac.type === 'مرضية' ? 'bg-red-50 text-red-500' : 
                            vac.type === 'عارضة' ? 'bg-blue-50 text-blue-500' : 
                            'bg-[#2A2723] text-white'
                        }`}>
                          {vac.type}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-[#7A7061] font-bold italic line-clamp-1">{vac.notes || '---'}</td>
                      <td className="px-8 py-6 text-left">
                        <button 
                          onClick={async () => { if(confirm('حذف السجل؟')) { await deleteDbVacation(vac.id); loadData(); } }}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1816]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-8 border-b border-[#EAE4D9]/50 flex justify-between items-center">
              <h2 className="text-xl font-black text-[#2A2723]">تسجيل إجازة لموظف</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl opacity-20 hover:opacity-100 transition-opacity">×</button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">اختار الموظف</label>
                <select 
                  required
                  value={newVacation.staff_id}
                  onChange={e => setNewVacation({...newVacation, staff_id: e.target.value})}
                  className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C1A68D]"
                >
                  <option value="">-- اختار من القائمة --</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">تاريخ البدء</label>
                  <input 
                    type="date" required
                    value={newVacation.start_date}
                    onChange={e => setNewVacation({...newVacation, start_date: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">تاريخ العودة</label>
                  <input 
                    type="date" required
                    value={newVacation.end_date}
                    onChange={e => setNewVacation({...newVacation, end_date: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">نوع الإجازة</label>
                <div className="flex gap-4">
                  {['سنوية', 'مرضية', 'عارضة'].map(vtype => (
                    <button
                      key={vtype}
                      type="button"
                      onClick={() => setNewVacation({...newVacation, type: vtype})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${newVacation.type === vtype ? 'bg-[#2A2723] text-white shadow-lg' : 'bg-[#FDFBF7] text-[#7A7061]'}`}
                    >
                      {vtype}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">ملاحظات إضافية</label>
                <textarea 
                  rows={2}
                  value={newVacation.notes}
                  onChange={e => setNewVacation({...newVacation, notes: e.target.value})}
                  className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#C1A68D] resize-none"
                />
              </div>
              <button className="w-full bg-[#2A2723] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black transition-all">تأكيد الإجازة 🎫</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
