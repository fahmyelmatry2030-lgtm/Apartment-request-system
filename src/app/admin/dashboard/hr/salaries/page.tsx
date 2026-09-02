"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getDbStaff, saveDbStaff, deleteDbStaff, getDbSalaries, saveDbSalary, deleteDbSalary } from '@/lib/actions/db';
import { User, Phone, FileText, Calendar, Plus, Trash2, Edit, CreditCard, ShieldCheck, FileSpreadsheet, X, DollarSign, Wallet } from 'lucide-react';

export default function SalariesManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedDossierStaff, setSelectedDossierStaff] = useState<any | null>(null);

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
      housing_allowance: Number(editingStaff.housing_allowance) || 0,
      transport_allowance: Number(editingStaff.transport_allowance) || 0,
      other_allowances: Number(editingStaff.other_allowances) || 0,
      national_id: editingStaff.national_id || '',
      phone: editingStaff.phone || '',
      hiring_date: editingStaff.hiring_date || new Date().toISOString().split('T')[0],
      notes: editingStaff.notes || '',
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

    const baseSalary = Number(staffMember.base_salary) || 0;
    const totalAllowances = (Number(staffMember.housing_allowance) || 0) + (Number(staffMember.transport_allowance) || 0) + (Number(staffMember.other_allowances) || 0);
    const bonuses = Number(newSalary.bonuses) || 0;
    const deductions = Number(newSalary.deductions) || 0;
    const net_salary = baseSalary + totalAllowances + bonuses - deductions;

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

  const handleDeleteStaffMember = async (id: string) => {
    if (!confirm('هل أنت تأكد من مسح حساب هذا الموظف وملفه نهائياً؟')) return;
    await deleteDbStaff(id);
    if (selectedDossierStaff?.id === id) setSelectedDossierStaff(null);
    loadData();
  };

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#EAE4D9] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2A2723] text-[#C1A68D] flex items-center justify-center font-black shadow-lg">
              💸
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#2A2723]">إدارة المرتبات وملفات الموظفين</h1>
              <p className="text-xs md:text-sm font-bold text-[#7A7061] mt-1">
                الملف الشامل للموظفين: المرتبات، البدلات (سكن وانتقال)، الحوافز، والخصومات الشهرية.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { setEditingStaff({}); setShowStaffModal(true); }}
            className="bg-white border border-[#EAE4D9] text-[#2A2723] font-black px-6 py-3 rounded-2xl hover:bg-gray-50 transition-all text-xs md:text-sm shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span>إضافة موظف جديد</span>
          </button>
          <button 
            onClick={() => setShowSalaryModal(true)}
            className="bg-[#2A2723] text-white font-black px-8 py-3 rounded-2xl hover:bg-black transition-all text-xs md:text-sm shadow-xl flex items-center gap-2"
          >
            <span>تسجيل صرف راتب 💸</span>
          </button>
        </div>
      </header>

      {/* Grid Layout: Staff Dossiers & Salary History */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Staff Dossier Cards List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-lg text-[#2A2723] flex items-center gap-2">
              <span>👥</span> ملفات الموظفين ({staff.length})
            </h3>
            <span className="text-[10px] font-black text-[#C1A68D]">اضغط لعرض الملف الشامل</span>
          </div>

          <div className="space-y-4">
            {staff.length === 0 && !isLoading && (
              <div className="p-12 text-center bg-white border border-dashed border-[#EAE4D9] rounded-3xl text-gray-400 text-xs font-bold">
                لا يوجد موظفين مسجلين حالياً.
              </div>
            )}
            
            {staff.map((s) => {
              const base = Number(s.base_salary) || 0;
              const housing = Number(s.housing_allowance) || 0;
              const transport = Number(s.transport_allowance) || 0;
              const other = Number(s.other_allowances) || 0;
              const totalPackage = base + housing + transport + other;

              return (
                <div 
                  key={s.id} 
                  className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/70 shadow-sm hover:shadow-md transition-all space-y-4 group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-[#2A2723] text-base">{s.name}</h4>
                      <span className="inline-block text-[10px] bg-[#FDFBF7] text-[#C1A68D] border border-[#EAE4D9] px-3 py-1 rounded-full font-black mt-1">
                        {s.position || 'وظيفة عامة'}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-base font-black text-emerald-700">{totalPackage.toLocaleString()} <span className="text-[10px]">ج.م</span></div>
                      <div className="text-[9px] font-bold text-gray-400">إجمالي الباكج الشامل</div>
                    </div>
                  </div>

                  {/* Financial Breakdown Pills */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE4D9]/40 text-center text-[10px] font-bold">
                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[8px]">الأساسي</span>
                      <strong className="text-[#2A2723]">{base.toLocaleString()}</strong>
                    </div>
                    <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100 text-blue-800">
                      <span className="text-blue-400 block text-[8px]">بدل سكن</span>
                      <strong>{housing.toLocaleString()}</strong>
                    </div>
                    <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100 text-amber-800">
                      <span className="text-amber-500 block text-[8px]">بدل انتقال</span>
                      <strong>{transport.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setSelectedDossierStaff(s)}
                      className="flex-1 bg-[#2A2723] hover:bg-[#C1A68D] hover:text-[#2A2723] text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <FileSpreadsheet size={14} />
                      <span>الملف الشامل 📁</span>
                    </button>
                    <button
                      onClick={() => { setEditingStaff(s); setShowStaffModal(true); }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl text-xs font-bold transition-all"
                      title="تعديل الموظف"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteStaffMember(s.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2.5 rounded-xl text-xs font-bold transition-all"
                      title="حذف حساب الموظف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Salary Payout History Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-lg text-[#2A2723] flex items-center gap-2">
              <span>📜</span> سجل الصرف والاستحقاقات العامة
            </h3>
            <span className="text-xs font-black text-[#7A7061]">{salaries.length} قيد صرف</span>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead className="bg-[#2A2723] text-white font-black">
                  <tr>
                    <th className="px-6 py-4">الموظف</th>
                    <th className="px-6 py-4 text-center">الفترة (شهر/سنة)</th>
                    <th className="px-6 py-4 text-center">الصافي المدفوع</th>
                    <th className="px-6 py-4 text-center">الحالة</th>
                    <th className="px-6 py-4 text-center">ملاحظات</th>
                    <th className="px-6 py-4 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE4D9]/30">
                  {salaries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center text-gray-400 font-bold">
                        لا توجد قيود صرف رواتب مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    salaries.map((sal) => {
                      const s = staff.find(st => st.id === sal.staff_id);
                      return (
                        <tr key={sal.id} className="hover:bg-[#FDFBF7] transition-colors font-bold">
                          <td className="px-6 py-5">
                            <div className="font-black text-[#2A2723] text-sm">{s?.name || 'موظف سابق'}</div>
                            <div className="text-[10px] text-[#C1A68D] font-bold mt-0.5">{s?.position || '—'}</div>
                          </td>
                          <td className="px-6 py-5 text-center text-[#7A7061]">
                            {sal.month} / {sal.year}
                          </td>
                          <td className="px-6 py-5 text-center font-black text-emerald-700 text-sm">
                            {Number(sal.net_salary || 0).toLocaleString()} ج.م
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                              sal.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {sal.payment_status === 'paid' ? '✅ تم الصرف' : '⏳ قيد الانتظار'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center text-gray-500 text-xs">
                            {sal.notes || '—'}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <button 
                              onClick={async () => { if(confirm('هل أنت تأكد من مسح قيد الصرف هذا؟')) { await deleteDbSalary(sal.id); loadData(); } }}
                              className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                              title="حذف القيد"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* 📁 EMPLOYEE DOSSIER / PERSONNEL FILE MODAL (الملف الوظيفي والمالي الشامل للموظف) */}
      {selectedDossierStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-3xl border border-white/10 overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-[#2A2723] p-6 md:p-8 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#C1A68D] text-[#2A2723] flex items-center justify-center text-2xl font-black shadow-lg">
                  👤
                </div>
                <div>
                  <h3 className="text-2xl font-black">{selectedDossierStaff.name}</h3>
                  <div className="flex items-center gap-3 text-xs font-bold text-[#C1A68D] mt-1">
                    <span>💼 {selectedDossierStaff.position || 'وظيفة عامة'}</span>
                    {selectedDossierStaff.phone && <span>📞 {selectedDossierStaff.phone}</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDossierStaff(null)} 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Dossier Content Scrollable Body */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
              
              {/* Financial Overview Package Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#EAE4D9]">
                  <span className="text-[10px] font-black text-gray-400 uppercase block">الراتب الأساسي</span>
                  <div className="text-xl font-black text-[#2A2723] mt-2">
                    {Number(selectedDossierStaff.base_salary || 0).toLocaleString()} <span className="text-xs">ج.م</span>
                  </div>
                </div>
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-black text-blue-500 uppercase block">بدل السكن</span>
                  <div className="text-xl font-black text-blue-900 mt-2">
                    {Number(selectedDossierStaff.housing_allowance || 0).toLocaleString()} <span className="text-xs">ج.م</span>
                  </div>
                </div>
                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                  <span className="text-[10px] font-black text-amber-600 uppercase block">بدل الانتقالات</span>
                  <div className="text-xl font-black text-amber-900 mt-2">
                    {Number(selectedDossierStaff.transport_allowance || 0).toLocaleString()} <span className="text-xs">ج.م</span>
                  </div>
                </div>
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-black text-emerald-600 uppercase block">إجمالي المرتب والبدلات</span>
                  <div className="text-xl font-black text-emerald-800 mt-2">
                    {(
                      Number(selectedDossierStaff.base_salary || 0) +
                      Number(selectedDossierStaff.housing_allowance || 0) +
                      Number(selectedDossierStaff.transport_allowance || 0) +
                      Number(selectedDossierStaff.other_allowances || 0)
                    ).toLocaleString()} <span className="text-xs">ج.م</span>
                  </div>
                </div>
              </div>

              {/* Personnel Details Grid */}
              <div className="bg-gray-50/60 p-6 rounded-2xl border border-gray-200 grid md:grid-cols-3 gap-6 text-xs font-bold text-[#2A2723]">
                <div>
                  <span className="text-gray-400 block text-[10px] font-black mb-1">الرقم القومي / الهوية:</span>
                  <span>{selectedDossierStaff.national_id || 'غير مدون'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-black mb-1">تاريخ التعيين:</span>
                  <span>{selectedDossierStaff.hiring_date || 'غير مدون'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-black mb-1">بدلات وحوافز إضافية ثابتة:</span>
                  <span>{Number(selectedDossierStaff.other_allowances || 0).toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Personnel Notes */}
              {selectedDossierStaff.notes && (
                <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/60 text-xs">
                  <span className="font-black text-amber-900 block mb-1">📝 ملاحظات ملف الموظف:</span>
                  <p className="text-amber-800 font-medium leading-relaxed">{selectedDossierStaff.notes}</p>
                </div>
              )}

              {/* Specific Employee Payout History */}
              <div className="space-y-4">
                <h4 className="font-black text-base text-[#2A2723] flex items-center gap-2">
                  <span>📜</span> سجل رواتب ومستحقات الموظف ({salaries.filter(sal => sal.staff_id === selectedDossierStaff.id).length})
                </h4>

                <div className="border border-[#EAE4D9] rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead className="bg-[#FDFBF7] font-black text-gray-600 border-b border-[#EAE4D9]">
                      <tr>
                        <th className="p-4 text-center">الشهر والسنة</th>
                        <th className="p-4 text-center">الصافي المدفوع</th>
                        <th className="p-4 text-center">الحوافز (+)</th>
                        <th className="p-4 text-center">الخصومات (-)</th>
                        <th className="p-4 text-center">حالة الصرف</th>
                        <th className="p-4 text-center">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#EAE4D9]/30">
                      {salaries.filter(sal => sal.staff_id === selectedDossierStaff.id).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400 font-bold">
                            لا توجد عمليات صرف مسجلة لهذا الموظف حتى الآن
                          </td>
                        </tr>
                      ) : (
                        salaries
                          .filter(sal => sal.staff_id === selectedDossierStaff.id)
                          .map((sal) => (
                            <tr key={sal.id} className="font-bold">
                              <td className="p-4 text-center text-[#2A2723]">{sal.month} / {sal.year}</td>
                              <td className="p-4 text-center font-black text-emerald-700">{Number(sal.net_salary || 0).toLocaleString()} ج.م</td>
                              <td className="p-4 text-center text-green-600">+{Number(sal.bonuses || 0).toLocaleString()}</td>
                              <td className="p-4 text-center text-red-600">-{Number(sal.deductions || 0).toLocaleString()}</td>
                              <td className="p-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black ${
                                  sal.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {sal.payment_status === 'paid' ? 'تم الصرف ✅' : 'قيد الانتظار ⏳'}
                                </span>
                              </td>
                              <td className="p-4 text-center text-gray-500">{sal.notes || '—'}</td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#FDFBF7] p-6 border-t border-[#EAE4D9] flex justify-between items-center shrink-0">
              <button 
                onClick={() => {
                  const s = selectedDossierStaff;
                  setSelectedDossierStaff(null);
                  setEditingStaff(s);
                  setShowStaffModal(true);
                }}
                className="bg-[#2A2723] text-white font-black px-6 py-3 rounded-xl text-xs hover:bg-black transition-all flex items-center gap-2"
              >
                <Edit size={14} />
                <span>تعديل ملف الموظف والبدلات</span>
              </button>

              <button 
                onClick={() => setSelectedDossierStaff(null)} 
                className="bg-gray-200 text-gray-700 font-black px-6 py-3 rounded-xl text-xs hover:bg-gray-300 transition-all"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ✏️ EDIT / ADD STAFF MODAL (نموذج إضافة/تعديل بيانات الموظف والبدلات) */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-[#EAE4D9] flex justify-between items-center bg-[#2A2723] text-white shrink-0">
              <h2 className="text-xl font-black">
                {editingStaff.id ? 'تعديل بيانات وملف الموظف' : 'تسجيل موظف جديد بالبدلات'}
              </h2>
              <button onClick={() => setShowStaffModal(false)} className="text-xl font-bold opacity-70 hover:opacity-100">✕</button>
            </div>
            
            <form onSubmit={handleSaveStaff} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase">الاسم بالكامل</label>
                  <input 
                    type="text" required
                    placeholder="اسم الموظف الثلاثي..."
                    value={editingStaff.name || ''}
                    onChange={e => setEditingStaff({...editingStaff, name: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase">الوظيفة / القسم</label>
                  <input 
                    type="text" required
                    placeholder="مثلاً: موظف استقبال، مشرف صيانة..."
                    value={editingStaff.position || ''}
                    onChange={e => setEditingStaff({...editingStaff, position: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
              </div>

              {/* Salary & Allowances Section */}
              <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="font-black text-xs text-[#2A2723] uppercase tracking-wider">💰 تفاصيل الراتب والبدلات الشاملة</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500">الراتب الأساسي</label>
                    <input 
                      type="number" required min="0"
                      placeholder="0.00"
                      value={editingStaff.base_salary || ''}
                      onChange={e => setEditingStaff({...editingStaff, base_salary: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#C1A68D]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-blue-600">بدل السكن</label>
                    <input 
                      type="number" min="0"
                      placeholder="0.00"
                      value={editingStaff.housing_allowance || ''}
                      onChange={e => setEditingStaff({...editingStaff, housing_allowance: e.target.value})}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-amber-600">بدل الانتقالات</label>
                    <input 
                      type="number" min="0"
                      placeholder="0.00"
                      value={editingStaff.transport_allowance || ''}
                      onChange={e => setEditingStaff({...editingStaff, transport_allowance: e.target.value})}
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-emerald-600">بدلات وحوافز أخرى</label>
                    <input 
                      type="number" min="0"
                      placeholder="0.00"
                      value={editingStaff.other_allowances || ''}
                      onChange={e => setEditingStaff({...editingStaff, other_allowances: e.target.value})}
                      className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs font-bold text-emerald-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase">رقم الهاتف</label>
                  <input 
                    type="text"
                    placeholder="010xxxxxxxx"
                    value={editingStaff.phone || ''}
                    onChange={e => setEditingStaff({...editingStaff, phone: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-4 py-3.5 text-xs font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase">الرقم القومي / الهوية</label>
                  <input 
                    type="text"
                    placeholder="14 رقم قومي..."
                    value={editingStaff.national_id || ''}
                    onChange={e => setEditingStaff({...editingStaff, national_id: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-4 py-3.5 text-xs font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase">تاريخ التعيين</label>
                  <input 
                    type="date"
                    value={editingStaff.hiring_date || ''}
                    onChange={e => setEditingStaff({...editingStaff, hiring_date: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-4 py-3.5 text-xs font-bold outline-none focus:border-[#C1A68D]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#C1A68D] uppercase">ملاحظات الملف والضمانات</label>
                <textarea 
                  rows={2}
                  placeholder="أي ملاحظات تفصيلية حول عقد الموظف أو الضمانات المستلمة..."
                  value={editingStaff.notes || ''}
                  onChange={e => setEditingStaff({...editingStaff, notes: e.target.value})}
                  className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl p-4 text-xs font-bold outline-none focus:border-[#C1A68D]"
                />
              </div>

              <button className="w-full bg-[#2A2723] text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all text-xs uppercase tracking-widest">
                حفظ بيانات الموظف والبدلات ✅
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 💰 SALARY PAYOUT MODAL (تسجيل صرف راتب ودفع مستحقات) */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-8 border-b border-[#EAE4D9] flex justify-between items-center bg-[#2A2723] text-white">
              <h2 className="text-xl font-black">تسجيل صرف راتب شهر جديد</h2>
              <button onClick={() => setShowSalaryModal(false)} className="text-xl font-bold opacity-70 hover:opacity-100">✕</button>
            </div>
            
            <form onSubmit={handleSaveSalary} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">اختر الموظف</label>
                <select 
                  required
                  value={newSalary.staff_id}
                  onChange={e => setNewSalary({...newSalary, staff_id: e.target.value})}
                  className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#C1A68D]"
                >
                  <option value="">-- اختر الموظف من القائمة --</option>
                  {staff.map(s => {
                    const totalPkg = (Number(s.base_salary)||0) + (Number(s.housing_allowance)||0) + (Number(s.transport_allowance)||0) + (Number(s.other_allowances)||0);
                    return <option key={s.id} value={s.id}>{s.name} (إجمالي الباكج: {totalPkg.toLocaleString()} ج.م)</option>;
                  })}
                </select>
              </div>

              {/* Show selected staff package breakdown */}
              {newSalary.staff_id && (() => {
                const s = staff.find(st => st.id === newSalary.staff_id);
                if (!s) return null;
                const base = Number(s.base_salary) || 0;
                const housing = Number(s.housing_allowance) || 0;
                const transport = Number(s.transport_allowance) || 0;
                const other = Number(s.other_allowances) || 0;
                const totalAllow = housing + transport + other;

                return (
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 text-xs font-bold space-y-1 text-emerald-900">
                    <div className="flex justify-between">
                      <span>الراتب الأساسي:</span>
                      <span>{base.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي البدلات (سكن + انتقال + حوافز):</span>
                      <span>+{totalAllow.toLocaleString()} ج.م</span>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">الحوافز والأوفرتايم (+)</label>
                  <input 
                    type="number" min="0"
                    value={newSalary.bonuses}
                    onChange={e => setNewSalary({...newSalary, bonuses: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#C1A68D] text-emerald-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase px-2">الخصومات والجزاءات (-)</label>
                  <input 
                    type="number" min="0"
                    value={newSalary.deductions}
                    onChange={e => setNewSalary({...newSalary, deductions: e.target.value})}
                    className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#C1A68D] text-rose-600"
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
                      className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                        newSalary.payment_status === status ? 'bg-[#2A2723] text-white shadow-lg' : 'bg-[#FDFBF7] text-[#7A7061] border border-[#EAE4D9]'
                      }`}
                    >
                      {status === 'paid' ? 'تم الدفع ✅' : 'قيد الانتظار ⏳'}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full bg-[#C1A68D] text-white font-black py-4 rounded-2xl shadow-xl hover:opacity-90 transition-all text-xs uppercase tracking-widest">
                تأكيد عملية الصرف وتسجيلها 💰
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
