"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getFreshDbBookings, 
  getDbUnits, 
  updateDbBookingStatus, 
  saveDbBooking, 
  deleteDbBooking 
} from '@/lib/actions/db';
import ExpensesTab from './ExpensesTab';
import FinancialSummaryTab from './FinancialSummaryTab';

// Units will be fetched dynamically from the database
const LAYOUT_VERSION = 'v1.9.0'; // Auto-increment this to force-clear client caches

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

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

// Editable cell component
function EditableCell({ 
  value, 
  bookingId, 
  field, 
  onSave, 
  type = 'text',
  className = '',
}: { 
  value: string | number; 
  bookingId: string; 
  field: string; 
  onSave: (id: string, field: string, value: any) => void;
  type?: 'text' | 'number';
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = async () => {
    setEditing(false);
    const newVal = type === 'number' ? Number(editValue) || 0 : editValue;
    if (String(newVal) !== String(value)) {
      setSaving(true);
      await onSave(bookingId, field, newVal);
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
        className="w-full bg-yellow-50 border border-[#C1A68D] rounded px-1 py-0.5 text-[10px] font-bold text-[#2A2723] outline-none text-center"
        style={{ minWidth: '50px' }}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer hover:bg-yellow-50/80 px-1 py-0.5 rounded transition-all inline-block min-w-[20px] min-h-[16px] ${saving ? 'opacity-50 animate-pulse' : ''} ${className}`}
      title="اضغط للتعديل"
    >
      {value || <span className="text-[#EAE4D9]">—</span>}
    </span>
  );
}

const AdminDatePicker = ({ label, value, onChange, icon, color }: any) => {
  const parts = value ? value.split('-') : [new Date().getFullYear().toString(), (new Date().getMonth() + 1).toString().padStart(2, '0'), new Date().getDate().toString().padStart(2, '0')];
  const [year, month, day] = parts;

  const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
  const days = Array.from({length: daysInMonth || 31}, (_, i) => (i+1).toString().padStart(2, '0'));
  const months = Array.from({length: 12}, (_, i) => (i+1).toString().padStart(2, '0'));
  const years = [new Date().getFullYear().toString(), (new Date().getFullYear() + 1).toString(), (new Date().getFullYear() - 1).toString()];

  const update = (y: string, m: string, d: string) => {
    const max = new Date(Number(y), Number(m), 0).getDate();
    const safeD = Number(d) > max ? max.toString().padStart(2, '0') : d;
    onChange(`${y}-${m}-${safeD}`);
  };

  return (
    <div className={`bg-white p-3 md:p-4 rounded-[20px] border border-[#EAE4D9]/50 shadow-sm relative overflow-visible ${color === 'red' ? 'shadow-red-500/5' : 'shadow-[#C1A68D]/5'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg md:text-xl">{icon}</span>
        <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${color === 'red' ? 'text-[#E63946]' : 'text-[#C1A68D]'}`}>{label}</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1 text-center">
          <label className="block text-[8px] font-bold text-gray-400 uppercase">اليوم</label>
          <div className="relative">
            <select value={day} onChange={e => update(year, month, e.target.value)} className="w-full bg-[#F7F5F0] border border-transparent focus:border-[#C1A68D] rounded-xl p-2 text-xs font-black appearance-none text-center outline-none cursor-pointer">
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] opacity-30 pointer-events-none">▼</span>
          </div>
        </div>
        <div className="space-y-1 text-center">
          <label className="block text-[8px] font-bold text-gray-400 uppercase">الشهر</label>
          <div className="relative">
            <select value={month} onChange={e => update(year, e.target.value, day)} className="w-full bg-[#F7F5F0] border border-transparent focus:border-[#C1A68D] rounded-xl p-2 text-xs font-black appearance-none text-center outline-none cursor-pointer">
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] opacity-30 pointer-events-none">▼</span>
          </div>
        </div>
        <div className="space-y-1 text-center">
          <label className="block text-[8px] font-bold text-gray-400 uppercase">السنة</label>
          <div className="relative">
            <select value={year} onChange={e => update(e.target.value, month, day)} className="w-full bg-[#F7F5F0] border border-transparent focus:border-[#C1A68D] rounded-xl p-2 text-xs font-black appearance-none text-center outline-none cursor-pointer">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] opacity-30 pointer-events-none">▼</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'operational' | 'expenses' | 'financial'>('expenses');

  // AUTO-RESET LOGIC: Clears stale localStorage once per version update
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastVersion = localStorage.getItem('mazar_layout_version');
      if (lastVersion !== LAYOUT_VERSION) {
        console.log(`[VERSION-UPDATE] Migrating from ${lastVersion} to ${LAYOUT_VERSION}. Clearing cache...`);
        localStorage.clear();
        localStorage.setItem('mazar_layout_version', LAYOUT_VERSION);
        window.location.reload();
      }
    }
  }, []);
  
  const monthStr = String(selectedMonth + 1).padStart(2, '0');
  const safeDateStr = `${selectedYear}-${monthStr}-01`;
  
  const [newRecord, setNewRecord] = useState({
    name: '',
    nationality: '',
    idNumber: '',
    phone: '',
    checkIn: safeDateStr,
    checkOut: safeDateStr,
    pricePerNight: 0,
    commission: 0,
    clientStatus: 'انتظار',
    brokerName: '',
    notes: ''
  });

  const printRef = useRef<HTMLDivElement>(null);

  // Update checkIn/Out safely if month/year changes
  useEffect(() => {
    const sStr = String(selectedMonth + 1).padStart(2, '0');
    const safeStr = `${selectedYear}-${sStr}-01`;
    setNewRecord(prev => ({ ...prev, checkIn: safeStr, checkOut: safeStr }));
  }, [selectedMonth, selectedYear]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [b, u] = await Promise.all([getFreshDbBookings(), getDbUnits()]);
      setBookings(b || []);
      setUnits(u || []);
      if (!selectedUnit && u && u.length > 0) {
        setSelectedUnit(u[0].id);
      }
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedUnit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCellSave = async (bookingId: string, field: string, value: any) => {
    try {
      setSaveStatus('جاري الحفظ...');
      
      const currentBooking = bookings.find(b => b.id === bookingId);
      if (!currentBooking) return;

      let finalValue = value;
      if (field === 'checkIn' || field === 'checkOut') {
        finalValue = parseDate(value);
      }

      const updates: any = { [field]: finalValue };
      
      // Auto-calculate dependencies
      if (['checkIn', 'checkOut', 'pricePerNight'].includes(field)) {
        const cIn = field === 'checkIn' ? finalValue : currentBooking.checkIn;
        const cOut = field === 'checkOut' ? finalValue : currentBooking.checkOut;
        
        let pNight = field === 'pricePerNight' ? (parseInt(value, 10) || 0) : null;
        
        if (pNight === null) {
          if (currentBooking.numberOfDays > 0) {
            pNight = currentBooking.totalAmount / currentBooking.numberOfDays;
          } else {
            pNight = 0;
          }
        }

        if (cIn && cOut) {
          const dIn = new Date(cIn);
          const dOut = new Date(cOut);
          const diff = Math.ceil((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24));
          const nights = diff > 0 ? diff : 0;
          updates.totalAmount = nights * pNight;
          updates.pricePerNight = pNight;
          
          // Overlap check on edit
          if (nights > 0) {
            const hasOverlap = bookings.some(b => {
              if (b.id === bookingId || b.status === 'deleted' || b.apartmentId !== currentBooking.apartmentId) return false;
              if (b.status !== 'approved' && b.status !== 'مؤكد') return false;
              const bIn = new Date(b.checkIn).getTime();
              const bOut = new Date(b.checkOut).getTime();
              const nIn = new Date(cIn).getTime();
              const nOut = new Date(cOut).getTime();
              return nIn < bOut && nOut > bIn;
            });
            if (hasOverlap && !confirm("⚠️ تنبيه: التواريخ الجديدة تتداخل مع حجز موجود بالفعل لهذا الاستوديو. هل تريد الاستمرار؟")) {
              return;
            }
          }
        }
      }

      // Removed manual discount logic

      const freshData = await updateDbBookingStatus(bookingId, updates);
      
      // Update local state WITH THE FRESH DATA RETURNED FROM SERVER
      if (freshData && Array.isArray(freshData)) {
        setBookings(freshData);
      }
      
      setSaveStatus('✅ تم الحفظ');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('❌ فشل الحفظ');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleFullUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    
    try {
      setSaveStatus('جاري حفظ التعديلات...');
      const freshData = await updateDbBookingStatus(editingBooking.id, editingBooking);
      if (freshData && Array.isArray(freshData)) {
        setBookings(freshData);
      }
      setIsEditModalOpen(false);
      setEditingBooking(null);
      setSaveStatus('✅ تم تحديث كافة البيانات');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('❌ فشل تحديث البيانات');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ هل أنت متأكد من مسح هذا الحجز نهائياً من قاعدة البيانات؟')) return;
    
    try {
      setSaveStatus('جاري المسح...');
      const freshData = await deleteDbBooking(id);
      
      if (freshData && Array.isArray(freshData)) {
        setBookings(freshData);
      }
      
      setSaveStatus('✅ تم المسح بنجاح');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error('Delete failed:', err);
      setSaveStatus('❌ فشل المسح');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleSaveNewRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedUnit) return alert('الرجاء اختيار وحدة أولاً');
      setSaveStatus('جاري الحفظ...');
      
      const inDate = new Date(newRecord.checkIn || new Date());
      const outDate = new Date(newRecord.checkOut || new Date());
      const diff = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
      const nights = diff > 0 ? diff : 0;
      const totalAmount = nights * newRecord.pricePerNight;

      // Overlap check for new record
      if (nights > 0) {
        const hasOverlap = bookings.some(b => {
          if (b.status === 'deleted' || b.apartmentId !== selectedUnit) return false;
          const isApproved = b.status === 'approved' || b.status === 'مؤكد';
          if (!isApproved) return false;
          
          const bIn = new Date(b.checkIn).getTime();
          const bOut = new Date(b.checkOut).getTime();
          const nIn = inDate.getTime();
          const nOut = outDate.getTime();
          
          return nIn < bOut && nOut > bIn;
        });
        
        if (hasOverlap && !confirm("⚠️ تنبيه: يوجد حجز آخر بالفعل في هذه التواريخ لهذا الاستوديو. هل تريد المتابعة وإضافة هذا الحجز أيضاً؟")) {
          setSaveStatus('');
          return;
        }
      }

      if (!selectedUnit) {
        alert('⚠️ يرجى اختيار الوحدة أولاً من القائمة أو التبويبات');
        setSaveStatus('');
        return;
      }

      const newBooking = {
        name: newRecord.name,
        nationality: newRecord.nationality,
        idNumber: newRecord.idNumber,
        phone: newRecord.phone,
        checkIn: newRecord.checkIn,
        checkOut: newRecord.checkOut,
        apartmentId: selectedUnit,
        studio: units.find((u: any) => u.id === selectedUnit)?.title?.ar || selectedUnit,
        status: 'approved',
        paymentInfo: 'حجز يدوي من التقارير',
        totalAmount,
        numberOfDays: nights,
        pricePerNight: newRecord.pricePerNight,
        commission: newRecord.commission,
        brokerName: newRecord.brokerName,
        clientStatus: newRecord.clientStatus || 'انتظار',
        notes: newRecord.notes
      };
      
      await saveDbBooking(newBooking);
      await loadData();
      
      // Reset form
      const resetStr = String(selectedMonth + 1).padStart(2, '0');
      const sDateStr = `${selectedYear}-${resetStr}-01`;
      setNewRecord({
        name: '',
        nationality: '',
        idNumber: '',
        phone: '',
        checkIn: sDateStr,
        checkOut: sDateStr,
        pricePerNight: 0,
        commission: 0,
        clientStatus: 'انتظار',
        brokerName: '',
        notes: ''
      });
      setSaveStatus('✅ تمت إضافة السجل للجدول');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('❌ فشل إضافة السجل');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Filter bookings for selected unit + month/year
  const filteredBookings = bookings.filter((b: any) => {
    if (b.status === 'deleted') return false;
    const isApproved = b.status === 'approved' || b.status === 'مؤكد';
    if (!isApproved) return false;

    // Match unit
    if (b.apartmentId !== selectedUnit) return false;

    // Match month/year based on check-in date string (Timezone Safe)
    const parts = b.checkIn?.split('-');
    if (!parts || parts.length < 2) return false;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    return month === selectedMonth && year === selectedYear;
  });

  // Get unit price
  const currentUnit = units.find((u: any) => u.id === selectedUnit);
  const unitPrice = currentUnit?.price ? parseInt(currentUnit.price.toString().replace(/[^0-9]/g, '')) || 0 : 0;

  // Calculate totals with strict numeric safety
  const safeNum = (v: any) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    const clean = String(v).replace(/[^0-9.-]/g, '');
    const n = Number(clean);
    return isNaN(n) ? 0 : n;
  };

  const totals = filteredBookings.reduce(
    (acc: any, b: any) => {
      const days = safeNum(b.numberOfDays);
      const total = safeNum(b.totalAmount);
      const commission = safeNum(b.commission);
      const netValue = total - commission;
      
      return {
        days: safeNum(acc.days) + days,
        total: safeNum(acc.total) + total,
        commission: safeNum(acc.commission) + commission,
        netValue: safeNum(acc.netValue) + netValue,
      };
    },
    { days: 0, total: 0, commission: 0, netValue: 0 }
  );

  // Build row data
  const dataRows = filteredBookings.map((booking: any, i: number) => {
    const days = booking.numberOfDays || 0;
    
    
    let pricePerNight = unitPrice;
    if (days > 0 && booking.totalAmount !== undefined && booking.totalAmount !== null) {
      pricePerNight = booking.totalAmount / days;
    }

    const total = booking.totalAmount || (days * pricePerNight);
    const commission = booking.commission || 0;
    const netValue = total - commission;

    // Manual Status takes precedence if it's not the default 'انتظار' or if it was manually changed
    let rawStatus = (booking.clientStatus || 'انتظار').trim();
    let clientStatus = rawStatus;

    // Only apply automatic transitions if the status is currently 'انتظار' أو 'متواجد'
    if (booking.checkIn && booking.checkOut) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;
      const currentHour = now.getHours(); // 0 to 23
      
      const checkInStr = booking.checkIn.trim();
      const checkOutStr = booking.checkOut.trim();

      // If we haven't manually changed it to something else, or if it's still 'انتظار'
      if (rawStatus === 'انتظار' || !rawStatus) {
        // Checkout at 12 PM (hour 12)
        if (todayStr > checkOutStr || (todayStr === checkOutStr && currentHour >= 12)) {
          clientStatus = 'غادر';
        } 
        // Checkin at 2 PM (hour 14)
        else if (todayStr > checkInStr || (todayStr === checkInStr && currentHour >= 14)) {
          clientStatus = 'متواجد';
        }
      } 
      // If it's 'متواجد', auto-move to 'غادر' if checkout passed (after 12 PM on checkout day)
      else if (rawStatus === 'متواجد') {
        if (todayStr > checkOutStr || (todayStr === checkOutStr && currentHour >= 12)) {
          clientStatus = 'غادر';
        }
      }
    }

    return {
      no: i + 1,
      id: booking.id,
      date: booking.checkIn,
      name: booking.name,
      nationality: booking.nationality || '',
      idNumber: booking.idNumber || '',
      phone: booking.phone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      days,
      pricePerNight,
      total,
      commission,
      brokerName: booking.brokerName || '',
      netValue,
      clientStatus,
      notes: booking.notes?.replace(/خصم بقيمة \d+/, '').trim() || '',
      hasData: true,
    };
  });

  // Sort dataRows by check-in date: OLD (Oldest) at TOP, NEW (Newest) at BOTTOM
  const sortedDataRows = [...dataRows].sort((a, b) => {
    // String comparison works perfectly for YYYY-MM-DD
    if (a.checkIn !== b.checkIn) {
      return (a.checkIn || '').localeCompare(b.checkIn || '');
    }
    // Secondary sort: earlier bookings first if same day
    return String(a.id || '').localeCompare(String(b.id || ''));
  });

  // Re-assign 'no' after sorting
  const renumberedRows = sortedDataRows.map((r, i) => ({ ...r, no: i + 1 }));

  // Fill empty rows to always show 31
  const emptyRowsCount = Math.max(0, 31 - renumberedRows.length);
  const emptyRows = Array.from({ length: emptyRowsCount }, (_, i) => ({
    no: renumberedRows.length + i + 1,
    id: '', date: '', name: '', nationality: '', idNumber: '', phone: '',
    checkIn: '', checkOut: '', days: 0, pricePerNight: 0, total: 0,
    commission: 0, brokerName: '', netValue: 0, clientStatus: '', notes: '', hasData: false,
  }));

  const allRows = [...renumberedRows, ...emptyRows];

  // Export CSV
  const exportCSV = () => {
    const unitLabel = units.find(u => u.id === selectedUnit)?.title?.ar || selectedUnit;
    const header = ['No', 'Date', 'Name', 'Nationality', 'ID Number', 'Phone Number', 'Check In', 'Check Out', 'No. of Days', 'Price Per Night', 'Total', 'Client Status', 'Commission', 'Broker Name', 'Net Value', 'Notes'];

    const csvRows = dataRows.map(r => [
      r.no, r.date, r.name, r.nationality, r.idNumber, r.phone,
      r.checkIn, r.checkOut, r.days, r.pricePerNight, r.total,
      r.clientStatus, r.commission, r.brokerName, r.netValue, r.notes,
    ].join(','));

    csvRows.push(['', '', '', '', '', '', '', '', totals.days, '', totals.total, '', totals.commission, '', totals.netValue, ''].join(','));

    const csvContent = '\uFEFF' + [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_${unitLabel}_${MONTHS_AR[selectedMonth]}_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => { window.print(); };

  const selectedUnitInfo = units.find(u => u.id === selectedUnit);
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            padding: 10mm;
            font-size: 9px;
          }
          .no-print { display: none !important; }
          .print-area table { border-collapse: collapse; width: 100%; }
          .print-area th, .print-area td {
            border: 1px solid #333 !important;
            padding: 4px 6px !important;
            font-size: 9px !important;
            background: white !important;
            color: #000 !important;
          }
          .print-area th {
            background: #eee !important;
            font-weight: 900 !important;
          }
          .print-header { display: block !important; text-align: center; margin-bottom: 10mm; }
          .print-header h2 { font-size: 16px; font-weight: 900; margin: 0 0 4px 0; }
          .print-header p { font-size: 11px; margin: 0; color: #555; }
        }
        @media screen {
          .print-header { display: none; }
        }
      `}</style>

      <div className="space-y-8 animate-fade-in relative z-0">
        {/* Tab Navigation */}
        <div className="no-print bg-[#2A2723] p-2 rounded-[2rem] flex gap-2 w-full max-w-2xl mx-auto shadow-2xl border border-white/5 overflow-x-auto scrollbar-hide" dir="rtl">
          <button 
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 px-8 py-4 rounded-2xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'expenses' ? 'bg-[#C1A68D] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            💸 إدارة المصروفات
          </button>
          <button 
            onClick={() => setActiveTab('operational')}
            className={`flex-1 px-8 py-4 rounded-2xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'operational' ? 'bg-[#C1A68D] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            📋 جدول الحجوزات التشغيلي
          </button>
          <button 
            onClick={() => setActiveTab('financial')}
            className={`flex-1 px-8 py-4 rounded-2xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'financial' ? 'bg-[#C1A68D] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            📉 التقرير المالي الشامل
          </button>
        </div>

        {activeTab === 'expenses' && <ExpensesTab />}
        {activeTab === 'financial' && <FinancialSummaryTab bookings={bookings} />}
        
        {activeTab === 'operational' && (
          <>
            {/* Header */}
        <header className="no-print flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-black text-[#2A2723]">تقارير <span className="text-[#C1A68D]">الوحدات</span></h1>
              <span className="text-[10px] font-black text-[#C1A68D] bg-[#FDFBF7] border border-[#EAE4D9]/50 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                {LAYOUT_VERSION} {isLoading ? 'SYNCING...' : 'SYNCED'}
              </span>
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border shadow-sm ${bookings.some(b => String(b.id).startsWith('L-')) ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                {bookings.some(b => String(b.id).startsWith('L-')) ? '⚠️ LOCAL MODE (OFFLINE)' : '✅ DB MODE (ONLINE)'}
              </span>
            </div>
            <p className="text-[#7A7061] font-bold opacity-70 text-sm">جدول حجوزات شهري لكل وحدة — اضغط على أي خلية لتعديلها مباشرة.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if(confirm("⚠️ سيتم مسح الذاكرة المؤقتة للمتصفح بالكامل وإعادة التحميل من قاعدة البيانات لضمان المزامنة بنسبة 100%. هل أنت متأكد؟")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border border-red-100 shadow-md active:scale-95"
            >
              🔄 حل مشكلة المزامنة (مسح شامل)
            </button>
            {saveStatus && (
              <div className="bg-white border border-[#EAE4D9] px-4 py-2 rounded-xl text-[10px] font-black text-[#C1A68D] animate-scale-in shadow-sm">
                {saveStatus}
              </div>
            )}
          </div>
        </header>

        {/* Filters Bar */}
        <div className="no-print bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm flex flex-wrap items-center gap-4" dir="rtl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest opacity-60">الشهر:</span>
            <select
              title="اختر الشهر"
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-[#FDFBF7] border border-[#EAE4D9]/60 rounded-xl px-4 py-2.5 text-sm text-[#2A2723] font-black outline-none focus:border-[#C1A68D] transition-all cursor-pointer"
            >
              {MONTHS_AR.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-[#7A7061] uppercase tracking-widest opacity-60">السنة:</span>
            <select
              title="اختر السنة"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-[#FDFBF7] border border-[#EAE4D9]/60 rounded-xl px-4 py-2.5 text-sm text-[#2A2723] font-black outline-none focus:border-[#C1A68D] transition-all cursor-pointer"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex-1" />
          
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
          >
            <span>📥</span> تصدير CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#2A2723] text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-black transition-all shadow-lg shadow-black/10"
          >
            <span>🖨️</span> طباعة
          </button>
        </div>

        {/* ADD MANUAL RECORD INLINE FORM */}
        <div className="no-print bg-white p-6 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm" dir="rtl">
          <form id="add-record-form" onSubmit={handleSaveNewRecord} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-9 gap-3">
              <div className="space-y-1 col-span-2 xl:col-span-2">
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">الاسم</label>
                <input type="text" required value={newRecord.name} onChange={e => setNewRecord({...newRecord, name: e.target.value})} className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#C1A68D]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">الجنسية</label>
                <input type="text" value={newRecord.nationality} onChange={e => setNewRecord({...newRecord, nationality: e.target.value})} className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#C1A68D]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">رقم الهوية</label>
                <input type="text" value={newRecord.idNumber} onChange={e => setNewRecord({...newRecord, idNumber: e.target.value})} className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#C1A68D]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">الهاتف</label>
                <input type="text" value={newRecord.phone} onChange={e => setNewRecord({...newRecord, phone: e.target.value})} className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#C1A68D]" />
              </div>
              <div className="col-span-2 xl:col-span-2 space-y-1">
                <AdminDatePicker 
                  label="تاريخ الدخول" 
                  value={newRecord.checkIn} 
                  onChange={(v: string) => setNewRecord({...newRecord, checkIn: v})} 
                  icon="🛬" 
                  color="gold" 
                />
              </div>
              <div className="col-span-2 xl:col-span-2 space-y-1">
                <AdminDatePicker 
                  label="تاريخ الخروج" 
                  value={newRecord.checkOut} 
                  onChange={(v: string) => setNewRecord({...newRecord, checkOut: v})} 
                  icon="🛫" 
                  color="red" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">سعر الليلة</label>
                <input type="number" required value={newRecord.pricePerNight} onChange={e => setNewRecord({...newRecord, pricePerNight: Number(e.target.value)})} className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-black outline-none focus:border-[#C1A68D]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">العمولة</label>
                <input type="number" value={newRecord.commission} onChange={e => setNewRecord({...newRecord, commission: Number(e.target.value)})} className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-black text-orange-500 outline-none focus:border-[#C1A68D]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">الوحدة</label>
                <select 
                  required 
                  value={selectedUnit} 
                  onChange={e => setSelectedUnit(e.target.value)} 
                  className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-black text-[#2A2723] outline-none focus:border-[#C1A68D]"
                >
                  <option value="" disabled>اختر الوحدة</option>
                  <optgroup label="الاستديوهات الفندقية">
                    {units.filter(u => u.type === 'studio').sort((a,b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true })).map(u => (
                      <option key={u.id} value={u.id}>{u.title?.ar || u.id}</option>
                    ))}
                  </optgroup>
                  <optgroup label="الشقق الفندقية">
                    {units.filter(u => u.type === 'apartment').sort((a,b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true })).map(u => (
                      <option key={u.id} value={u.id}>{u.title?.ar || u.id}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">حالة العميل</label>
                <select value={(newRecord as any).clientStatus || 'انتظار'} onChange={e => setNewRecord({...newRecord, clientStatus: e.target.value} as any)} className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-black text-[#2A2723] outline-none focus:border-[#C1A68D]">
                  <option value="انتظار">انتظار</option>
                  <option value="متواجد">متواجد</option>
                  <option value="غادر">غادر</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-2">
              <button type="submit" className="h-[40px] px-10 bg-[#2A2723] text-white font-black rounded-xl hover:bg-black transition-all text-sm whitespace-nowrap shadow-lg">إضافة للجدول</button>
            </div>
          </form>
        </div>

        {/* Unit Tabs */}
        <div className="no-print bg-white p-4 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm space-y-4" dir="rtl">
          {/* Color Legend */}
          <div className="flex items-center gap-4 px-3 pb-2 border-b border-[#EAE4D9]/40">
            <span className="text-[9px] font-black text-[#7A7061] uppercase tracking-wider">دليل الألوان:</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/><span className="text-[9px] font-black text-blue-700">جميع الاستديوهات الفندقية</span></span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#C1A68D] inline-block"/><span className="text-[9px] font-black text-[#C1A68D]">الشقق الفندقية</span></span>
          </div>
          <div>
            <div className="text-[9px] font-black text-[#C1A68D] uppercase tracking-[0.25em] px-3 mb-2">الاستديوهات الفندقية</div>
            <div className="flex flex-wrap gap-1.5">
              {units
                .filter(u => u.type === 'studio' && !u.id.startsWith('s-'))
                .sort((a, b) => {
                  const getNum = (u: any) => {
                    if (u.id.startsWith('b1-s')) return parseInt(u.id.replace('b1-s',''), 10);
                    if (u.id.startsWith('b2-s')) return parseInt(u.id.replace('b2-s',''), 10) + 12;
                    return 99;
                  };
                  return getNum(a) - getNum(b);
                })
                .map(u => {
                  const isB1 = u.id.startsWith('b1-s');
                  const isB2 = u.id.startsWith('b2-s');
                  const isActive = selectedUnit === u.id;
                  let cls = '';
                  if (isActive) {
                    cls = 'bg-blue-600 text-white shadow-lg shadow-blue-500/20';
                  } else {
                    cls = 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200';
                  }
                  return (
                    <button key={u.id} onClick={() => setSelectedUnit(u.id)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${cls}`}>
                      {u.title?.ar || u.id}
                    </button>
                  );
                })}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-black text-[#C1A68D] uppercase tracking-[0.25em] px-3 mb-2">الشقق الفندقية</div>
            <div className="flex flex-wrap gap-1.5">
              {units.filter(u => u.type === 'apartment').map(u => (
                <button key={u.id} onClick={() => setSelectedUnit(u.id)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${
                    selectedUnit === u.id
                      ? 'bg-[#C1A68D] text-white shadow-lg shadow-[#C1A68D]/20'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}>
                  {u.title?.ar || u.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="no-print grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
          <div className="bg-white p-6 rounded-[1.5rem] border border-[#EAE4D9]/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C1A68D]/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-[#C1A68D]/10 transition-colors" />
            <div className="text-[#7A7061] text-[9px] font-black mb-2 tracking-[0.15em] uppercase opacity-60">عدد الحجوزات</div>
            <div className="text-3xl font-black text-[#2A2723]">{filteredBookings.length}</div>
          </div>
          <div className="bg-white p-6 rounded-[1.5rem] border border-[#EAE4D9]/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-green-500/10 transition-colors" />
            <div className="text-[#7A7061] text-[9px] font-black mb-2 tracking-[0.15em] uppercase opacity-60">إجمالي الإيرادات</div>
            <div className="text-3xl font-black text-green-600">{totals.total.toLocaleString()} <small className="text-xs font-bold text-green-400">ج.م</small></div>
          </div>
          <div className="bg-white p-6 rounded-[1.5rem] border border-[#EAE4D9]/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-orange-500/10 transition-colors" />
            <div className="text-[#7A7061] text-[9px] font-black mb-2 tracking-[0.15em] uppercase opacity-60">إجمالي العمولات</div>
            <div className="text-3xl font-black text-orange-500">{totals.commission.toLocaleString()} <small className="text-xs font-bold text-orange-300">ج.م</small></div>
          </div>
          <div className="bg-white p-6 rounded-[1.5rem] border border-[#EAE4D9]/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C1A68D]/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-[#C1A68D]/10 transition-colors" />
            <div className="text-[#7A7061] text-[9px] font-black mb-2 tracking-[0.15em] uppercase opacity-60">صافي الأرباح</div>
            <div className="text-3xl font-black text-[#C1A68D]">{totals.netValue.toLocaleString()} <small className="text-xs font-bold text-[#D5C5B3]">ج.م</small></div>
          </div>
        </div>

        {/* THE TABLE */}
        <div ref={printRef} className="print-area bg-white rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
          <div className="print-header">
            <h2>مزار — تقرير حجوزات {selectedUnitInfo?.title?.ar || selectedUnit}</h2>
            <p>{MONTHS_AR[selectedMonth]} {selectedYear}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse" dir="rtl">
              <thead>
                <tr className="bg-[#2A2723] text-white text-[9px] uppercase tracking-widest font-black">
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">No</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">التاريخ</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">الاسم</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">الجنسية</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">رقم الهوية</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">الهاتف</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">دخول</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">خروج</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">الأيام</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">سعر الليلة</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">الإجمالي</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">الحالة</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">العمولة</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">الوسيط</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">الصافي</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">ملاحظات</th>
                  <th className="px-3 py-4 no-print whitespace-nowrap">حذف</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {isLoading ? (
                  <tr>
                    <td colSpan={15} className="px-6 py-20 text-center text-[#7A7061] italic font-bold opacity-40 uppercase tracking-widest">
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : (
                  allRows.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-t border-[#EAE4D9]/30 transition-colors ${
                        row.hasData
                          ? row.clientStatus.trim() === 'متواجد' ? 'bg-green-200 hover:bg-green-300'
                            : row.clientStatus.trim() === 'غادر' ? 'bg-gray-300 hover:bg-gray-400'
                            : row.clientStatus.trim() === 'انتظار' ? 'bg-orange-200 hover:bg-orange-300' 
                            : 'bg-white hover:bg-yellow-50/30'
                          : 'bg-[#FDFBF7]/50'
                      }`}
                    >
                      <td className="px-3 py-2.5 border-l border-[#EAE4D9]/20 font-black text-[#C1A68D]">{row.no}</td>
                      <td className="px-3 py-2.5 border-l border-[#EAE4D9]/20 font-bold text-[#2A2723] whitespace-nowrap">{formatDate(row.date)}</td>
                      <td className="px-3 py-2.5 border-l border-[#EAE4D9]/20 font-black text-[#2A2723]">
                        {row.hasData ? (
                          <div className="flex flex-col items-center">
                            <EditableCell value={row.name} bookingId={row.id} field="name" onSave={handleCellSave} className="text-[#2A2723] font-black" />
                            <span className="text-[7px] text-[#C1A68D] opacity-50 uppercase tracking-tighter">({row.clientStatus})</span>
                          </div>
                        ) : <span className="text-[#EAE4D9]">—</span>}
                      </td>

                      {/* EDITABLE CELLS */}
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                        {row.hasData ? (
                          <EditableCell value={row.nationality} bookingId={row.id} field="nationality" onSave={handleCellSave} className="text-[#7A7061] font-bold" />
                        ) : <span className="text-[#EAE4D9]">—</span>}
                      </td>
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                        {row.hasData ? (
                          <EditableCell value={row.idNumber} bookingId={row.id} field="idNumber" onSave={handleCellSave} className="text-[#7A7061] font-bold font-mono text-[9px]" />
                        ) : <span className="text-[#EAE4D9]">—</span>}
                      </td>

                      <td className="px-3 py-2.5 border-l border-[#EAE4D9]/20 font-bold text-[#7A7061] font-mono text-[9px] whitespace-nowrap">{row.phone}</td>
                      
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                        {row.hasData ? <EditableCell value={formatDate(row.checkIn)} bookingId={row.id} field="checkIn" onSave={handleCellSave} className="text-[#2A2723] font-bold whitespace-nowrap" /> : <span className="text-[#EAE4D9]">—</span>}
                      </td>
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                        {row.hasData ? <EditableCell value={formatDate(row.checkOut)} bookingId={row.id} field="checkOut" onSave={handleCellSave} className="text-[#2A2723] font-bold whitespace-nowrap" /> : <span className="text-[#EAE4D9]">—</span>}
                      </td>
                      
                      <td className="px-3 py-2.5 border-l border-[#EAE4D9]/20 font-black text-[#2A2723]">{row.hasData ? row.days : 0}</td>
                      
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                        {row.hasData ? <EditableCell value={row.pricePerNight} bookingId={row.id} field="pricePerNight" onSave={handleCellSave} type="number" className="text-[#7A7061] font-bold" /> : <span className="text-[#EAE4D9]">0</span>}
                      </td>
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                         {row.hasData ? <EditableCell value={row.total} bookingId={row.id} field="totalAmount" onSave={handleCellSave} type="number" className="text-[#2A2723] font-black" /> : <span className="text-[#EAE4D9]">0</span>}
                      </td>

                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                        {row.hasData ? (
                          <select 
                            value={row.clientStatus || 'انتظار'}
                            onChange={(e) => handleCellSave(row.id, 'clientStatus', e.target.value)}
                            className={`bg-transparent outline-none font-black text-[10px] p-1.5 rounded-lg text-center cursor-pointer appearance-none ${
                              row.clientStatus === 'متواجد' ? 'text-green-600 bg-green-50' : 
                              row.clientStatus === 'غادر' ? 'text-gray-500 bg-gray-100' : 
                              'text-orange-600 bg-orange-50'
                            }`}
                          >
                            <option value="انتظار">انتظار</option>
                            <option value="متواجد">متواجد</option>
                            <option value="غادر">غادر</option>
                          </select>
                        ) : <span className="text-[#EAE4D9]">—</span>}
                      </td>

                      {/* EDITABLE: Commission */}
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                        {row.hasData ? (
                          <EditableCell value={row.commission} bookingId={row.id} field="commission" onSave={handleCellSave} type="number" className="text-orange-500 font-bold" />
                        ) : <span className="text-[#EAE4D9]">—</span>}
                      </td>

                      {/* EDITABLE: Broker Name */}
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                        {row.hasData ? (
                          <EditableCell value={row.brokerName} bookingId={row.id} field="brokerName" onSave={handleCellSave} className="text-[#7A7061] font-bold" />
                        ) : <span className="text-[#EAE4D9]">—</span>}
                      </td>

                      <td className="px-3 py-2.5 border-l border-[#EAE4D9]/20 font-black text-green-600">{row.hasData ? row.netValue : 0}</td>

                      {/* EDITABLE: Notes */}
                      <td className="px-1 py-2.5">
                        {row.hasData ? (
                          <EditableCell value={row.notes} bookingId={row.id} field="notes" onSave={handleCellSave} className="text-[#7A7061] font-bold text-[9px]" />
                        ) : <span className="text-[#EAE4D9]">—</span>}
                      </td>

                      {/* --- ACTIONS --- */}
                      <td className="px-1 py-1 no-print border-r border-[#EAE4D9]/20">
                        {row.hasData && (
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => {
                                const fullBooking = bookings.find(b => b.id === row.id);
                                if (fullBooking) {
                                  setEditingBooking({...fullBooking});
                                  setIsEditModalOpen(true);
                                }
                              }}
                              className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="تعديل كافة البيانات"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>

                            <button 
                              onClick={() => handleDelete(row.id)}
                              className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="حذف الحجز"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}

                {/* Totals Row */}
                <tr className="bg-[#2A2723] text-white font-black text-[11px] border-t-2 border-[#C1A68D]">
                  <td colSpan={8} className="px-4 py-4 text-center tracking-widest uppercase text-[9px]">الإجمالي</td>
                  <td className="px-3 py-4 border-l border-[#3a3730]">{totals.days}</td>
                  <td className="px-3 py-4 border-l border-[#3a3730]"></td>
                  <td className="px-3 py-4 border-l border-[#3a3730] text-[#C1A68D]">{totals.total.toLocaleString()}</td>
                  <td className="px-3 py-4 border-l border-[#3a3730]"></td>
                  <td className="px-3 py-4 border-l border-[#3a3730] text-orange-300">{totals.commission.toLocaleString()}</td>
                  <td className="px-3 py-4 border-l border-[#3a3730]"></td>
                  <td className="px-3 py-4 border-l border-[#3a3730] text-green-400">{totals.netValue.toLocaleString()}</td>
                  <td className="px-3 py-4 border-l border-[#3a3730]"></td>
                  <td className="px-3 py-4 no-print"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Note */}
        <div className="no-print bg-[#FDFBF7] p-6 rounded-[1.5rem] border border-[#EAE4D9]/50 flex gap-4 items-start" dir="rtl">
          <span className="text-2xl mt-1">✏️</span>
          <div className="text-[10px] leading-relaxed text-[#7A7061] font-bold">
            <strong className="block mb-1 text-[#C1A68D] text-xs font-black tracking-widest uppercase">تعديل مباشر من الجدول:</strong>
            <ul className="list-disc list-inside space-y-1 mr-2 opacity-80">
              <li>اضغط على أي خلية <span className="text-yellow-600 font-black">(الجنسية / رقم الهوية / العمولة / الوسيط / الملاحظات)</span> لتعديلها مباشرة.</li>
              <li>التعديلات بتتحفظ تلقائي في قاعدة البيانات لحظة ما تخرج من الخلية أو تضغط Enter.</li>
              <li>الصافي (Net Value) بيتحسب تلقائي = الإجمالي − العمولة.</li>
              <li>يعرض فقط الحجوزات <span className="text-green-600 font-black">المؤكدة</span> المسكّنة في الوحدة المختارة.</li>
            </ul>
          </div>
        </div>

        {/* Edit Booking Modal */}
        {isEditModalOpen && editingBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in no-print">
            <div className="bg-[#FDFBF7] border border-[#EAE4D9] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-[#EAE4D9]/50 flex justify-between items-center bg-white">
                <h2 className="text-xl font-black text-[#2A2723]">تعديل بيانات <span className="text-[#C1A68D]">الحجز</span></h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-2xl text-[#7A7061] hover:text-red-500">×</button>
              </div>

              <form onSubmit={handleFullUpdate} className="p-8 space-y-6 overflow-y-auto custom-scrollbar" dir="rtl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-2">اسم العميل</label>
                    <input 
                      type="text" required
                      value={editingBooking.name || ''}
                      onChange={e => setEditingBooking({...editingBooking, name: e.target.value})}
                      className="w-full bg-white border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C1A68D] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-2">رقم الهاتف</label>
                    <input 
                      type="text" required
                      value={editingBooking.phone || ''}
                      onChange={e => setEditingBooking({...editingBooking, phone: e.target.value})}
                      className="w-full bg-white border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C1A68D] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-2">الجنسية</label>
                    <input 
                      type="text"
                      value={editingBooking.nationality || ''}
                      onChange={e => setEditingBooking({...editingBooking, nationality: e.target.value})}
                      className="w-full bg-white border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C1A68D] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-2">رقم الهوية</label>
                    <input 
                      type="text"
                      value={editingBooking.idNumber || ''}
                      onChange={e => setEditingBooking({...editingBooking, idNumber: e.target.value})}
                      className="w-full bg-white border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C1A68D] font-bold"
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <AdminDatePicker 
                      label="تاريخ الدخول" 
                      value={editingBooking.checkIn} 
                      onChange={(v: string) => setEditingBooking({...editingBooking, checkIn: v})} 
                      icon="🛬" 
                      color="gold" 
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <AdminDatePicker 
                      label="تاريخ الخروج" 
                      value={editingBooking.checkOut} 
                      onChange={(v: string) => setEditingBooking({...editingBooking, checkOut: v})} 
                      icon="🛫" 
                      color="red" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-2">إجمالي المبلغ</label>
                    <input 
                      type="number" required
                      value={editingBooking.totalAmount || 0}
                      onChange={e => setEditingBooking({...editingBooking, totalAmount: Number(e.target.value)})}
                      className="w-full bg-white border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C1A68D] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-2">العمولة</label>
                    <input 
                      type="number"
                      value={editingBooking.commission || 0}
                      onChange={e => setEditingBooking({...editingBooking, commission: Number(e.target.value)})}
                      className="w-full bg-white border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C1A68D] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-2">اسم الوسيط</label>
                    <input 
                      type="text"
                      value={editingBooking.brokerName || ''}
                      onChange={e => setEditingBooking({...editingBooking, brokerName: e.target.value})}
                      className="w-full bg-white border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C1A68D] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-2">حالة العميل (يدوياً)</label>
                    <select 
                      value={editingBooking.clientStatus || 'انتظار'}
                      onChange={e => setEditingBooking({...editingBooking, clientStatus: e.target.value})}
                      className="w-full bg-white border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C1A68D] font-bold"
                    >
                      <option value="انتظار">انتظار</option>
                      <option value="متواجد">متواجد</option>
                      <option value="غادر">غادر</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-2">ملاحظات</label>
                  <textarea 
                    rows={3}
                    value={editingBooking.notes || ''}
                    onChange={e => setEditingBooking({...editingBooking, notes: e.target.value})}
                    className="w-full bg-white border border-[#EAE4D9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C1A68D] font-bold resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-[#2A2723] text-white font-black py-4 rounded-xl hover:bg-black transition-all shadow-lg"
                  >
                    حفظ كافة التعديلات 💾
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-white border border-[#EAE4D9] text-[#7A7061] font-black py-4 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </>
  );
}
