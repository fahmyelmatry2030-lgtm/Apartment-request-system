"use client";

import { useState, useEffect, useMemo } from 'react';
import { getBookings, getSystemUnits } from '@/lib/data-init';
import { getDbExpenses, getDbSalaries } from '@/lib/actions/db';
import { Calendar, TrendingUp } from 'lucide-react';
import FinancialLockModal from '@/components/FinancialLockModal';

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

// شركاء مزار (1) + مزار (2) — استوديوهات 1 إلى 24
const PARTNERS_MAZAR12 = [
  { key: 'MH', label: 'M.H', percentage: 35 },
  { key: 'HO', label: 'H.O', percentage: 18 },
  { key: 'ME', label: 'M.E', percentage: 23.5 },
  { key: 'HM', label: 'H.M', percentage: 23.5 },
];

// شركاء مزار (3) — الوحدات 25 إلى 30
const PARTNERS_MAZAR3 = [
  { key: 'Koura', label: 'Koura', percentage: 50 },
  { key: 'MM',   label: 'M.M',   percentage: 25 },
  { key: 'ME',   label: 'M.E',   percentage: 25 },
];

// ── بطاقة مقياس ──
function KpiCard({
  label,
  value,
  sub,
  color = 'text-[#2A2723]',
  bg = 'bg-white',
  border = 'border-[#EAE4D9]/50',
  highlighted = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bg?: string;
  border?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`${bg} p-5 rounded-2xl border ${border} shadow-sm text-center flex flex-col items-center justify-center gap-1 ${highlighted ? 'ring-2 ring-[#FACC15]' : ''}`}
    >
      <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest">{label}</p>
      <div className={`text-2xl font-black ${color}`}>
        {value} <small className="text-xs font-bold text-[#7A7061]">ج.م</small>
      </div>
      {sub && <p className="text-[9px] text-[#7A7061] font-bold">{sub}</p>}
    </div>
  );
}

// ── جدول توزيع الأرباح ──
function ProfitDistribution({
  partners,
  netProfit,
  isLoading,
}: {
  partners: { key: string; label: string; percentage: number }[];
  netProfit: number;
  isLoading: boolean;
}) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="bg-[#FDFBF7]">
            <th className="px-4 py-3 text-[10px] font-black text-[#7A7061] border border-[#EAE4D9]/60">توزيع الأرباح</th>
            {partners.map((p) => (
              <th key={p.key} className="px-6 py-3 font-black text-sm text-[#2A2723] border border-[#EAE4D9]/60">
                {p.label}
                <span className="block text-[10px] font-bold text-[#C1A68D]">%{p.percentage}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-5 font-black text-[#7A7061] text-xs border border-[#EAE4D9]/40 bg-[#FDFBF7]/60">
              القيمة
            </td>
            {partners.map((p) => (
              <td key={p.key} className="px-6 py-5 border border-[#EAE4D9]/40">
                <div className={`text-xl font-black ${netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {isLoading ? '...' : Math.round((netProfit * p.percentage) / 100).toLocaleString()}
                </div>
                <div className="text-[10px] text-[#7A7061] font-bold mt-1">ج.م</div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function FinancePage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(-1);
  const [selectedYear, setSelectedYear] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminRole, setAdminRole] = useState<string>('Super Admin');

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('financialUnlocked') === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    const info = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('adminInfo') || '{}') : {};
    if (info?.role) setAdminRole(info.role);
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
  }, []);

  const isAkoura = adminRole === 'Akoura';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [b, expData, salData, unitsData] = await Promise.all([
        getBookings(),
        getDbExpenses(),
        getDbSalaries(),
        getSystemUnits(),
      ]);
      setBookings(b);
      setExpenses(expData || []);
      setSalaries(salData || []);
      setUnits(unitsData || []);
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const getBranchLabel = (branch: any) => {
    const b = parseInt(branch);
    if (b === 1 || b === 2 || b === 12) return 'مزار 1 و 2';
    if (b === 3) return 'مزار 3';
    if (b === 4) return 'شقة فندقية 1';
    if (b === 5) return 'شقة فندقية 2';
    if (b === 6) return 'شقة فندقية 3';
    return 'عام';
  };




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

  // ── الحجوزات المؤكدة للشهر المختار ──
  const monthlyBookings = useMemo(() => {
    return bookings.filter((b: any) => {
      if (b.status === 'deleted') return false;
      if (b.status !== 'approved' && b.status !== 'مؤكد') return false;
      const parts = b.checkIn?.split('-');
      if (!parts || parts.length < 2) return false;
      return parseInt(parts[1], 10) - 1 === selectedMonth && parseInt(parts[0], 10) === selectedYear;
    });
  }, [bookings, selectedMonth, selectedYear]);

  // ── المصروفات الشهرية ──
  const monthlyExpenses = useMemo(() => {
    return expenses.filter((e: any) => {
      if (!e.date) return false;
      const parts = e.date.split('-');
      if (parts.length < 2) return false;
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      return month === selectedMonth && year === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  const monthlySalaries = useMemo(() => {
    return salaries.filter((s: any) =>
      Number(s.month) - 1 === selectedMonth && Number(s.year) === selectedYear
    );
  }, [salaries, selectedMonth, selectedYear]);

  // إجمالي الرواتب
  const salariesFromExpenses = monthlyExpenses
    .filter(e => e.category === 'رواتب' || e.category === 'مرتبات' || e.category === 'مرتب')
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const salariesTotal = monthlySalaries.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0) + salariesFromExpenses;

  // المصروفات التشغيلية لـ مزار 1 ومزار 2 (غير الرواتب)
  const mazar12Expenses = monthlyExpenses
    .filter(e =>
      (e.branch === 1 || e.branch === 2 || e.branch === '1' || e.branch === '2' || e.branch === 12 || e.branch === '12' || !e.branch) &&
      e.category !== 'رواتب' &&
      e.category !== 'مرتبات' &&
      e.category !== 'مرتب'
    )
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  // المصروفات التشغيلية لـ مزار 3
  const mazar3Expenses = monthlyExpenses
    .filter(e =>
      (e.branch === 3 || e.branch === '3') &&
      e.category !== 'رواتب' &&
      e.category !== 'مرتبات' &&
      e.category !== 'مرتب'
    )
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  // مصروفات الشقق الفندقية
  const apt1Expenses = monthlyExpenses
    .filter(e => e.branch === 4 || e.branch === '4')
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const apt2Expenses = monthlyExpenses
    .filter(e => e.branch === 5 || e.branch === '5')
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const apt3Expenses = monthlyExpenses
    .filter(e => e.branch === 6 || e.branch === '6')
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  // ════════════════════════════════════════════════
  //  SECTION 1: مزار(1) + مزار(2) — استوديوهات 1-24
  // ════════════════════════════════════════════════
  const mazar12Bookings = monthlyBookings.filter(b => {
    const u = units.find(u => u.id === b.apartmentId);
    return u?.type === 'studio' && (u?.branch === 1 || u?.branch === 2);
  });

  const mazar12Revenue = mazar12Bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
  const mazar12Commissions = mazar12Bookings.reduce((sum, b) => sum + parseFloat(b.commission || 0), 0);
  const mazar12TotalNights = mazar12Bookings.reduce((sum, b) => sum + (Number(b.numberOfDays) || 0), 0);
  const mazar12AvgNight = mazar12TotalNights > 0 ? mazar12Revenue / mazar12TotalNights : 0;
  // صافي الربح = الإيراد - العمولات - المصروفات التشغيلية - الرواتب
  const mazar12NetProfit = mazar12Revenue - mazar12Commissions - mazar12Expenses - salariesTotal;

  // ════════════════════════════════════════════════
  //  SECTION 2: مزار(3) — الوحدات من 25 إلى 30
  // ════════════════════════════════════════════════
  const mazar3Bookings = monthlyBookings.filter(b => {
    const u = units.find(u => u.id === b.apartmentId);
    return u?.branch === 3;
  });

  const mazar3Revenue = mazar3Bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
  const mazar3Commissions = mazar3Bookings.reduce((sum, b) => sum + parseFloat(b.commission || 0), 0);
  const mazar3TotalNights = mazar3Bookings.reduce((sum, b) => sum + (Number(b.numberOfDays) || 0), 0);
  const mazar3AvgNight = mazar3TotalNights > 0 ? mazar3Revenue / mazar3TotalNights : 0;
  const mazar3NetProfit = mazar3Revenue - mazar3Commissions - mazar3Expenses;

  // ════════════════════════════════════════════════
  //  SECTION 3: الشقق الفندقية — apt-1 / apt-2 / apt-3
  // ════════════════════════════════════════════════
  const aptBooking = (aptId: string) =>
    monthlyBookings.filter(b => b.apartmentId === aptId);

  const aptRevenue = (aptId: string) =>
    aptBooking(aptId).reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);

  const aptCommission = (aptId: string) =>
    aptBooking(aptId).reduce((sum, b) => sum + parseFloat(b.commission || 0), 0);

  const apt1Net = aptRevenue('apt-1') - aptCommission('apt-1') - apt1Expenses;
  const apt2Net = aptRevenue('apt-2') - aptCommission('apt-2') - apt2Expenses;
  const apt3Net = aptRevenue('apt-3') - aptCommission('apt-3') - apt3Expenses;

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <FinancialLockModal isOpen={true} onUnlock={() => setIsUnlocked(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">

      {/* ══════════ HEADER ══════════ */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#2A2723]">
            {isAkoura ? 'مزار' : 'الإدارة'} <span className="text-[#C1A68D]">{isAkoura ? '(3) — كشف الحساب' : 'المالية الشاملة'}</span>
          </h1>
          <p className="text-[#7A7061] font-bold opacity-70 text-sm mt-1">
            كشف حساب شهر{' '}
            <span className="text-[#2A2723] font-black">
              {selectedMonth >= 0 ? MONTHS_AR[selectedMonth] : '...'} {selectedYear > 0 ? selectedYear : ''}
            </span>
          </p>
        </div>
        <div className="flex gap-3 bg-white p-2 rounded-[1.5rem] border border-[#EAE4D9]/50 shadow-sm">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-[#FDFBF7] border-none rounded-xl px-4 py-2 text-xs font-black outline-none"
          >
            {MONTHS_AR.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-[#FDFBF7] border-none rounded-xl px-4 py-2 text-xs font-black outline-none"
          >
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 ★ مزار(1) + مزار(2) — من استوديو 1 إلى 24
      ══════════════════════════════════════════════════════════════ */}
      {!isAkoura && (
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
        {/* عنوان القسم */}
        <div className="bg-[#2A2723] px-8 py-4 flex items-center gap-3">
          <span className="text-white font-black text-sm tracking-widest">★ مزار (1) + مزار (2)</span>
          <span className="text-[#C1A68D] text-xs font-bold">— من استوديو 1 إلى استوديو 24</span>
        </div>

        <div className="p-6 space-y-6">
          {/* بطاقات المقاييس */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
            <KpiCard
              label="إجمالي الإيراد"
              value={isLoading ? '...' : mazar12Revenue.toLocaleString()}
              sub={`${mazar12Bookings.length} حجز مؤكد`}
              color="text-green-600"
              border="border-green-200"
            />
            <KpiCard
              label="إجمالي المصروفات"
              value={isLoading ? '...' : (mazar12Expenses + salariesTotal).toLocaleString()}
              sub="مصروفات + رواتب"
              color="text-red-500"
              border="border-red-200"
            />
            <KpiCard
              label="إجمالي العمولات"
              value={isLoading ? '...' : mazar12Commissions.toLocaleString()}
              color="text-orange-500"
              border="border-orange-200"
            />
            <KpiCard
              label="صافي الربح"
              value={isLoading ? '...' : mazar12NetProfit.toLocaleString()}
              color={mazar12NetProfit >= 0 ? 'text-green-700' : 'text-red-600'}
              bg={mazar12NetProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}
              border={mazar12NetProfit >= 0 ? 'border-green-300' : 'border-red-300'}
              highlighted={true}
            />
            <KpiCard
              label="معدل سعر الليلة"
              value={isLoading ? '...' : Math.round(mazar12AvgNight).toLocaleString()}
              sub={`${mazar12TotalNights} ليلة`}
              color="text-[#2A2723]"
            />
          </div>

          {/* توزيع الأرباح */}
          <div>
            <p className="text-xs font-black text-[#7A7061] mb-2 uppercase tracking-widest">توزيع الأرباح</p>
            <ProfitDistribution
              partners={PARTNERS_MAZAR12}
              netProfit={mazar12NetProfit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 ★ مزار(3) — الوحدات من شقة 25 إلى شقة 30
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
        {/* عنوان القسم */}
        <div className="bg-[#2A2723] px-8 py-4 flex items-center gap-3">
          <span className="text-white font-black text-sm tracking-widest">مزار (3)</span>
          <span className="text-[#C1A68D] text-xs font-bold">— الوحدات من شقة 25 إلى شقة 30</span>
        </div>

        <div className="p-6 space-y-6">
          {/* بطاقات المقاييس */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
            <KpiCard
              label="إجمالي الإيراد"
              value={isLoading ? '...' : mazar3Revenue.toLocaleString()}
              sub={`${mazar3Bookings.length} حجز مؤكد`}
              color="text-green-600"
              border="border-green-200"
            />
            <KpiCard
              label="المصروفات"
              value={isLoading ? '...' : mazar3Expenses.toLocaleString()}
              color="text-red-500"
              border="border-red-200"
            />
            <KpiCard
              label="العمولات"
              value={isLoading ? '...' : mazar3Commissions.toLocaleString()}
              color="text-orange-500"
              border="border-orange-200"
            />
            <KpiCard
              label="صافي الربح"
              value={isLoading ? '...' : mazar3NetProfit.toLocaleString()}
              color={mazar3NetProfit >= 0 ? 'text-green-700' : 'text-red-600'}
              bg={mazar3NetProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}
              border={mazar3NetProfit >= 0 ? 'border-green-300' : 'border-red-300'}
              highlighted={true}
            />
            <KpiCard
              label="معدل سعر الليلة"
              value={isLoading ? '...' : Math.round(mazar3AvgNight).toLocaleString()}
              sub={`${mazar3TotalNights} ليلة`}
              color="text-[#2A2723]"
            />
          </div>

          {/* توزيع الأرباح */}
          <div>
            <p className="text-xs font-black text-[#7A7061] mb-2 uppercase tracking-widest">توزيع الأرباح</p>
            <ProfitDistribution
              partners={PARTNERS_MAZAR3}
              netProfit={mazar3NetProfit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 ★ الشقق الفندقية — شقة(1) + شقة(2) + شقة(3)
      ══════════════════════════════════════════════════════════════ */}
      {!isAkoura && (
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
        {/* عنوان القسم */}
        <div className="bg-[#2A2723] px-8 py-4 flex items-center gap-3">
          <span className="text-white font-black text-sm tracking-widest">الشقق الفندقية</span>
          <span className="text-[#C1A68D] text-xs font-bold">— شقة فندقية (1) + (2) + (3)</span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* شقة (1) */}
            <div className={`p-6 rounded-2xl border text-center ${apt1Net >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">صافي ربح شقة (1)</p>
              <div className={`text-3xl font-black ${apt1Net >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {isLoading ? '...' : apt1Net.toLocaleString()}
                <small className="text-sm font-bold text-[#7A7061] ml-1">ج.م</small>
              </div>
              <div className="mt-3 text-[9px] text-[#7A7061] font-bold space-y-0.5">
                <div>إيراد: {isLoading ? '...' : aptRevenue('apt-1').toLocaleString()} ج.م</div>
                <div>عمولات: {isLoading ? '...' : aptCommission('apt-1').toLocaleString()} ج.م</div>
                <div>مصروفات: {isLoading ? '...' : apt1Expenses.toLocaleString()} ج.م</div>
              </div>
            </div>

            {/* شقة (2) */}
            <div className={`p-6 rounded-2xl border text-center ${apt2Net >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">صافي ربح شقة (2)</p>
              <div className={`text-3xl font-black ${apt2Net >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {isLoading ? '...' : apt2Net.toLocaleString()}
                <small className="text-sm font-bold text-[#7A7061] ml-1">ج.م</small>
              </div>
              <div className="mt-3 text-[9px] text-[#7A7061] font-bold space-y-0.5">
                <div>إيراد: {isLoading ? '...' : aptRevenue('apt-2').toLocaleString()} ج.م</div>
                <div>عمولات: {isLoading ? '...' : aptCommission('apt-2').toLocaleString()} ج.م</div>
                <div>مصروفات: {isLoading ? '...' : apt2Expenses.toLocaleString()} ج.م</div>
              </div>
            </div>

            {/* شقة (3) */}
            <div className={`p-6 rounded-2xl border text-center ${apt3Net >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest mb-3">صافي ربح شقة (3)</p>
              <div className={`text-3xl font-black ${apt3Net >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {isLoading ? '...' : apt3Net.toLocaleString()}
                <small className="text-sm font-bold text-[#7A7061] ml-1">ج.م</small>
              </div>
              <div className="mt-3 text-[9px] text-[#7A7061] font-bold space-y-0.5">
                <div>إيراد: {isLoading ? '...' : aptRevenue('apt-3').toLocaleString()} ج.م</div>
                <div>عمولات: {isLoading ? '...' : aptCommission('apt-3').toLocaleString()} ج.م</div>
                <div>مصروفات: {isLoading ? '...' : apt3Expenses.toLocaleString()} ج.م</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}



      {/* ════════════════ مقارنة أداء الشهور ════════════════ */}
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/60 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#EAE4D9]/60 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #FDFBF7 0%, #F5EFE6 100%)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
              style={{ background: 'linear-gradient(135deg, #2A2723, #4A4438)' }}>
              📈
            </div>
            <div>
              <h3 className="text-lg font-black text-[#2A2723]">مقارنة الأداء المالي — {selectedYear > 0 ? selectedYear : new Date().getFullYear()}</h3>
              <p className="text-[11px] text-[#7A7061] font-bold mt-0.5">إيرادات وتكاليف وصافي ربح كل شهر</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] font-black">
            <span className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>إيرادات
            </span>
            <span className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>مصروفات
            </span>
            <span className="flex items-center gap-2 text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>صافي الربح
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#EAE4D9]/40">
          {monthlyRollupData.map((m) => {
            const isSelected = m.monthIndex === selectedMonth;
            const isCurrent = m.monthIndex === new Date().getMonth() && selectedYear === new Date().getFullYear();
            const hasData = m.revenue > 0 || m.expenses > 0;

            return (
              <div
                key={m.monthIndex}
                onClick={() => setSelectedMonth(m.monthIndex)}
                className="px-8 py-4 cursor-pointer transition-all duration-150 flex items-center gap-6"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #F5EFE6, #EAE0D2)'
                    : isCurrent
                    ? '#FDFBF7'
                    : 'white',
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#FDFCFA'; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = isCurrent ? '#FDFBF7' : 'white'; }}
              >
                {/* Month + bookings */}
                <div className="w-32 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${isSelected ? 'text-[#2A2723]' : 'text-[#2A2723]/80'}`}>
                      {m.monthName}
                    </span>
                    {isCurrent && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-[#C1A68D]/20 text-[#8B6F5C]">
                        الحالي
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#7A7061]/60 font-bold mt-0.5">
                    {m.bookingsCount} حجز
                  </div>
                </div>

                {/* Revenue */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-[#7A7061] font-bold mb-1">إيرادات</div>
                  <div className={`text-sm font-black ${hasData ? 'text-emerald-700' : 'text-gray-300'}`}>
                    {hasData && m.revenue > 0 ? `${m.revenue.toLocaleString()} ج.م` : '—'}
                  </div>
                </div>

                {/* Expenses */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-[#7A7061] font-bold mb-1">مصروفات</div>
                  <div className={`text-sm font-black ${hasData && m.expenses > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                    {hasData && m.expenses > 0 ? `-${m.expenses.toLocaleString()} ج.م` : '—'}
                  </div>
                </div>

                {/* Net profit */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-[#7A7061] font-bold mb-1">صافي الربح</div>
                  <div className={`text-sm font-black ${m.netProfit > 0 ? 'text-green-700' : m.netProfit < 0 ? 'text-red-600' : 'text-gray-300'}`}>
                    {m.netProfit !== 0 ? `${m.netProfit.toLocaleString()} ج.م` : '—'}
                  </div>
                  {m.netProfit > 0 && m.revenue > 0 && (
                    <div className="text-[9px] text-[#7A7061]/50 font-bold mt-0.5">
                      هامش {Math.round((m.netProfit / m.revenue) * 100)}%
                    </div>
                  )}
                </div>

                {/* CTA button */}
                <div className="shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedMonth(m.monthIndex); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                      isSelected
                        ? 'bg-[#2A2723] text-white shadow-md'
                        : 'bg-[#EAE4D9]/60 text-[#7A7061] hover:bg-[#C1A68D] hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ محدد' : 'عرض'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>





    </div>
  );
}
