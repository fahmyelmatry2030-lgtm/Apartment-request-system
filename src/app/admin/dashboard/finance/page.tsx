"use client";

import { useState, useEffect, useMemo } from 'react';
import { getBookings, getSystemUnits } from '@/lib/data-init';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function FinancePage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [b, u] = await Promise.all([getBookings(), getSystemUnits()]);
      setBookings(b);
      setUnits(u);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const statementData = useMemo(() => {
    // Filter bookings for the selected month/year
    const monthlyBookings = bookings.filter((b: any) => {
      if (b.status === 'deleted' || (b.status !== 'approved' && b.status !== 'مؤكد')) return false;
      const parts = b.checkIn?.split('-');
      if (!parts || parts.length < 2) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      return month === selectedMonth && year === selectedYear;
    });

    // Group by unit
    const summary = units.map(unit => {
      const unitBookings = monthlyBookings.filter(b => b.apartmentId === unit.id);
      const totalRevenue = unitBookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount || 0)), 0);
      const totalCommissions = unitBookings.reduce((sum, b) => sum + (parseFloat(b.commission || 0)), 0);
      const netRevenue = totalRevenue - totalCommissions;
      const bookingsCount = unitBookings.length;
      const occupiedNights = unitBookings.reduce((sum, b) => sum + (parseInt(b.numberOfDays || 0)), 0);

      return {
        id: unit.id,
        title: unit.title?.ar || unit.id,
        type: unit.type,
        revenue: totalRevenue,
        commissions: totalCommissions,
        net: netRevenue,
        count: bookingsCount,
        nights: occupiedNights
      };
    }).filter(s => s.revenue > 0 || s.nights > 0 || s.type === 'apartment'); // Show all apartments and active studios

    return summary;
  }, [bookings, units, selectedMonth, selectedYear]);

  const totals = useMemo(() => {
    return statementData.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      commissions: acc.commissions + curr.commissions,
      net: acc.net + curr.net,
      count: acc.count + curr.count,
      nights: acc.nights + curr.nights
    }), { revenue: 0, commissions: 0, net: 0, count: 0, nights: 0 });
  }, [statementData]);

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#2A2723]">كشف <span className="text-[#C1A68D]">الحساب الشهري</span></h1>
          <p className="text-[#7A7061] font-bold opacity-70 text-sm">ملخص مجمع لإيرادات جميع الوحدات - بانتظار نموذج الإكسيل النهائي.</p>
        </div>

        <div className="flex gap-3 bg-white p-2 rounded-[1.5rem] border border-[#EAE4D9]/50 shadow-sm">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-[#FDFBF7] border-none rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-1 ring-[#C1A68D]"
          >
            {MONTHS_AR.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-[#FDFBF7] border-none rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-1 ring-[#C1A68D]"
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm">
            <p className="text-[10px] font-black text-[#7A7061] uppercase mb-1">إجمالي الحجوزات</p>
            <p className="text-2xl font-black text-[#2A2723]">{totals.count} حجز</p>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm">
            <p className="text-[10px] font-black text-[#7A7061] uppercase mb-1">إجمالي الإيرادات</p>
            <p className="text-2xl font-black text-green-600">{totals.revenue.toLocaleString()} <small className="text-xs">ج.م</small></p>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm">
            <p className="text-[10px] font-black text-[#7A7061] uppercase mb-1">إجمالي العمولات</p>
            <p className="text-2xl font-black text-orange-500">{totals.commissions.toLocaleString()} <small className="text-xs">ج.م</small></p>
         </div>
         <div className="bg-[#2A2723] p-6 rounded-[2rem] shadow-xl">
            <p className="text-[10px] font-black text-[#C1A68D] uppercase mb-1">صافي التحصيل</p>
            <p className="text-2xl font-black text-white">{totals.net.toLocaleString()} <small className="text-xs">ج.م</small></p>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#EAE4D9]/50">
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest text-right">الوحدة / الاستوديو</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest">عدد الحجوزات</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest">إجمالي الإيراد</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest">العمولات</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest">صافي الوحدة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4D9]/30">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center italic text-[#C1A68D]">جاري تجميع البيانات...</td></tr>
              ) : statementData.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-[#7A7061] opacity-40">لا توجد بيانات لهذا الشهر.</td></tr>
              ) : (
                <>
                  {statementData.map((row) => (
                    <tr key={row.id} className="hover:bg-[#FDFBF7] transition-colors group">
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${row.type === 'apartment' ? 'bg-[#C1A68D]' : 'bg-[#2A2723]'}`} />
                          <span className="font-black text-[#2A2723]">{row.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-[#7A7061]">{row.count} ({row.nights} ليلة)</td>
                      <td className="px-8 py-5 font-bold text-[#2A2723]">{row.revenue.toLocaleString()}</td>
                      <td className="px-8 py-5 font-bold text-orange-500">-{row.commissions.toLocaleString()}</td>
                      <td className="px-8 py-5">
                        <span className="bg-[#2A2723]/5 text-[#2A2723] px-4 py-1.5 rounded-full font-black text-xs">
                          {row.net.toLocaleString()} ج.م
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-[#FDFBF7] font-black text-[#2A2723]">
                    <td className="px-8 py-6 text-right text-lg">الإجمالي النهائي للشهر</td>
                    <td className="px-8 py-6 text-lg">{totals.count}</td>
                    <td className="px-8 py-6 text-lg text-green-600">{totals.revenue.toLocaleString()}</td>
                    <td className="px-8 py-6 text-lg text-orange-500">-{totals.commissions.toLocaleString()}</td>
                    <td className="px-8 py-6 text-xl text-[#C1A68D] bg-white border-r border-[#EAE4D9]">{totals.net.toLocaleString()} ج.م</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#C1A68D]/10 border border-[#C1A68D]/30 p-10 rounded-[3rem] flex items-center gap-8">
        <span className="text-4xl">🧾</span>
        <div>
           <h4 className="font-black text-[#2A2723] mb-2">ملاحظة إدارية</h4>
           <p className="text-xs text-[#7A7061] font-bold leading-relaxed opacity-80">
              هذا التقرير مخصص للمراجعة السريعة لنهاية الشهر. سيتم تعديل التصميم بالكامل بمجرد تزويدنا بنموذج الإكسيل المعتمد لضمان تطابق المخرجات مع نظام الحسابات لديكم.
           </p>
        </div>
      </div>
    </div>
  );
}
