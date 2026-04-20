"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { getBookings, getSystemUnits, updateBookingStatus, saveBooking } from '@/lib/data-init';

// Units will be fetched dynamically from the database

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

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

export default function ReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  
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
    discount: 0,
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
    const [b, u] = await Promise.all([getBookings(), getSystemUnits()]);
    setBookings(b);
    setUnits(u);
    if (!selectedUnit && u.length > 0) {
      setSelectedUnit(u[0].id);
    }
    setIsLoading(false);
  }, [selectedUnit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Inline Edit & Save to DB
  const handleCellSave = async (bookingId: string, field: string, value: any) => {
    try {
      setSaveStatus('جاري الحفظ...');
      
      const currentBooking = bookings.find(b => b.id === bookingId);
      if (!currentBooking) return;

      const updates: any = { [field]: value };
      
      // Auto-calculate dependencies
      if (['checkIn', 'checkOut', 'pricePerNight'].includes(field)) {
        const cIn = field === 'checkIn' ? value : currentBooking.checkIn;
        const cOut = field === 'checkOut' ? value : currentBooking.checkOut;
        
        let pNight = field === 'pricePerNight' ? (parseInt(value, 10) || 0) : null;
        if (pNight === null) {
          // Derive existing pNight precisely
          const dMatch = currentBooking.notes?.match(/خصم بقيمة (\d+)/);
          const existDiscount = dMatch ? parseInt(dMatch[1], 10) : 0;
          if (currentBooking.numberOfDays > 0) {
            pNight = (currentBooking.totalAmount + existDiscount) / currentBooking.numberOfDays;
          } else {
            pNight = 0;
          }
        }

        if (cIn && cOut) {
          const dIn = new Date(cIn);
          const dOut = new Date(cOut);
          const diff = Math.ceil((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24));
          const nights = diff > 0 ? diff : 0;
          updates.numberOfDays = nights;
          
          const dMatch = currentBooking.notes?.match(/خصم بقيمة (\d+)/);
          const existDiscount = dMatch ? parseInt(dMatch[1], 10) : 0;
          
          updates.totalAmount = (nights * pNight) - existDiscount;
          updates.pricePerNight = pNight;
        }
      }

      await updateBookingStatus(bookingId, updates);
      
      // Update local state immediately with all updated fields
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
      
      setSaveStatus('✅ تم الحفظ');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('❌ فشل الحفظ');
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
      const discountVal = newRecord.discount || 0;
      const totalAmount = (nights * newRecord.pricePerNight) - discountVal;
      
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
        notes: discountVal > 0 ? `خصم بقيمة ${discountVal}` : newRecord.notes
      };
      
      await saveBooking(newBooking);
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
        discount: 0,
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

    // Match month/year based on check-in date
    const checkIn = new Date(b.checkIn);
    return checkIn.getMonth() === selectedMonth && checkIn.getFullYear() === selectedYear;
  });

  // Get unit price
  const currentUnit = units.find((u: any) => u.id === selectedUnit);
  const unitPrice = currentUnit?.price ? parseInt(currentUnit.price.toString().replace(/[^0-9]/g, '')) || 0 : 0;

  // Calculate totals
  const totals = filteredBookings.reduce(
    (acc: any, b: any) => {
      const days = b.numberOfDays || 0;
      const total = b.totalAmount || 0;
      const commission = b.commission || 0;
      const netValue = total - commission;
      return {
        days: acc.days + days,
        total: acc.total + total,
        commission: acc.commission + commission,
        netValue: acc.netValue + netValue,
      };
    },
    { days: 0, total: 0, commission: 0, netValue: 0 }
  );

  // Build row data
  const dataRows = filteredBookings.map((booking: any, i: number) => {
    const days = booking.numberOfDays || 0;
    
    let discount = 0;
    const discountMatch = booking.notes?.match(/خصم بقيمة (\d+)/);
    if (discountMatch) {
      discount = parseInt(discountMatch[1], 10);
    }

    let pricePerNight = unitPrice;
    if (days > 0 && booking.totalAmount !== undefined && booking.totalAmount !== null) {
      pricePerNight = (booking.totalAmount + discount) / days;
    }

    const total = booking.totalAmount || (days * pricePerNight);
    const commission = booking.commission || 0;
    const netValue = total - commission;
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
      notes: booking.notes || '',
      hasData: true,
    };
  });

  // Fill empty rows to always show 31
  const emptyRowsCount = Math.max(0, 31 - dataRows.length);
  const emptyRows = Array.from({ length: emptyRowsCount }, (_, i) => ({
    no: dataRows.length + i + 1,
    id: '', date: '', name: '', nationality: '', idNumber: '', phone: '',
    checkIn: '', checkOut: '', days: 0, pricePerNight: 0, total: 0,
    commission: 0, brokerName: '', netValue: 0, notes: '', hasData: false,
  }));

  const allRows = [...dataRows, ...emptyRows];

  // Export CSV
  const exportCSV = () => {
    const unitLabel = units.find(u => u.id === selectedUnit)?.title?.ar || selectedUnit;
    const header = ['No', 'Date', 'Name', 'Nationality', 'ID Number', 'Phone Number', 'Check In', 'Check Out', 'No. of Days', 'Price Per Night', 'Total', 'Commission', 'Broker Name', 'Net Value', 'Notes'];

    const csvRows = dataRows.map(r => [
      r.no, r.date, r.name, r.nationality, r.idNumber, r.phone,
      r.checkIn, r.checkOut, r.days, r.pricePerNight, r.total,
      r.commission, r.brokerName, r.netValue, r.notes,
    ].join(','));

    csvRows.push(['', '', '', '', '', '', '', '', totals.days, '', totals.total, totals.commission, '', totals.netValue, ''].join(','));

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
        {/* Header */}
        <header className="no-print flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black mb-2 text-[#2A2723]">تقارير <span className="text-[#C1A68D]">الوحدات</span></h1>
            <p className="text-[#7A7061] font-bold opacity-70 text-sm">جدول حجوزات شهري لكل وحدة — اضغط على أي خلية لتعديلها مباشرة.</p>
          </div>
          {saveStatus && (
            <div className="bg-white border border-[#EAE4D9] px-4 py-2 rounded-xl text-[10px] font-black text-[#C1A68D] animate-scale-in shadow-sm">
              {saveStatus}
            </div>
          )}
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
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">دخول</label>
                <input type="date" required value={newRecord.checkIn} onChange={e => setNewRecord({...newRecord, checkIn: e.target.value})} className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#C1A68D]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">خروج</label>
                <input type="date" required value={newRecord.checkOut} onChange={e => setNewRecord({...newRecord, checkOut: e.target.value})} className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#C1A68D]" />
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
                <label className="text-[9px] font-black text-[#C1A68D] uppercase px-2">الديسكونت</label>
                <input type="number" value={newRecord.discount} onChange={e => setNewRecord({...newRecord, discount: Number(e.target.value)})} className="w-full bg-[#FDFBF7] border border-[#EAE4D9] rounded-xl px-3 py-2 text-xs font-black text-red-500 outline-none focus:border-[#C1A68D]" />
              </div>
            </div>
            
            <div className="flex justify-end mt-2">
              <button type="submit" className="h-[40px] px-10 bg-[#2A2723] text-white font-black rounded-xl hover:bg-black transition-all text-sm whitespace-nowrap shadow-lg">إضافة للجدول</button>
            </div>
          </form>
        </div>

        {/* Unit Tabs */}
        <div className="no-print bg-white p-4 rounded-[2rem] border border-[#EAE4D9]/50 shadow-sm space-y-4" dir="rtl">
          <div>
            <div className="text-[9px] font-black text-[#C1A68D] uppercase tracking-[0.25em] px-3 mb-2">الاستديوهات الفندقية</div>
            <div className="flex flex-wrap gap-1.5">
              {units
                .filter(u => u.type === 'studio' && !u.id.startsWith('s-'))
                .sort((a, b) => {
                  const numA = parseInt((a.title?.ar || a.id).match(/\d+/)?.[0] || '0', 10);
                  const numB = parseInt((b.title?.ar || b.id).match(/\d+/)?.[0] || '0', 10);
                  return numA - numB;
                })
                .map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnit(u.id)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${
                      selectedUnit === u.id
                        ? 'bg-[#2A2723] text-white shadow-lg shadow-black/10'
                        : 'bg-[#FDFBF7] text-[#7A7061] hover:bg-[#EAE4D9]/50 hover:text-[#2A2723] border border-[#EAE4D9]/40'
                    }`}
                  >
                    {u.title?.ar || u.id}
                  </button>
                ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-black text-[#C1A68D] uppercase tracking-[0.25em] px-3 mb-2">الشقق الفندقية</div>
            <div className="flex flex-wrap gap-1.5">
              {units.filter(u => u.type === 'apartment').map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnit(u.id)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${
                    selectedUnit === u.id
                      ? 'bg-[#C1A68D] text-white shadow-lg shadow-[#C1A68D]/20'
                      : 'bg-[#FDFBF7] text-[#7A7061] hover:bg-[#EAE4D9]/50 hover:text-[#2A2723] border border-[#EAE4D9]/40'
                  }`}
                >
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
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">العمولة</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">الوسيط</th>
                  <th className="px-3 py-4 border-l border-[#3a3730] whitespace-nowrap">الصافي</th>
                  <th className="px-3 py-4 whitespace-nowrap">ملاحظات</th>
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
                          ? 'bg-white hover:bg-yellow-50/30'
                          : 'bg-[#FDFBF7]/50'
                      }`}
                    >
                      <td className="px-3 py-2.5 border-l border-[#EAE4D9]/20 font-black text-[#C1A68D]">{row.no}</td>
                      <td className="px-3 py-2.5 border-l border-[#EAE4D9]/20 font-bold text-[#2A2723] whitespace-nowrap">{row.date}</td>
                      <td className="px-3 py-2.5 border-l border-[#EAE4D9]/20 font-black text-[#2A2723]">
                        {row.hasData ? (
                          <EditableCell value={row.name} bookingId={row.id} field="name" onSave={handleCellSave} className="text-[#2A2723] font-black" />
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
                        {row.hasData ? <EditableCell value={row.checkIn} bookingId={row.id} field="checkIn" onSave={handleCellSave} className="text-[#2A2723] font-bold whitespace-nowrap" /> : <span className="text-[#EAE4D9]">—</span>}
                      </td>
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                        {row.hasData ? <EditableCell value={row.checkOut} bookingId={row.id} field="checkOut" onSave={handleCellSave} className="text-[#2A2723] font-bold whitespace-nowrap" /> : <span className="text-[#EAE4D9]">—</span>}
                      </td>
                      
                      <td className="px-3 py-2.5 border-l border-[#EAE4D9]/20 font-black text-[#2A2723]">{row.hasData ? row.days : 0}</td>
                      
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                        {row.hasData ? <EditableCell value={row.pricePerNight} bookingId={row.id} field="pricePerNight" onSave={handleCellSave} type="number" className="text-[#7A7061] font-bold" /> : <span className="text-[#EAE4D9]">0</span>}
                      </td>
                      
                      <td className="px-1 py-2.5 border-l border-[#EAE4D9]/20">
                         {row.hasData ? <EditableCell value={row.total} bookingId={row.id} field="totalAmount" onSave={handleCellSave} type="number" className="text-[#2A2723] font-black" /> : <span className="text-[#EAE4D9]">0</span>}
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
                    </tr>
                  ))
                )}

                {/* Totals Row */}
                <tr className="bg-[#2A2723] text-white font-black text-[11px] border-t-2 border-[#C1A68D]">
                  <td colSpan={8} className="px-4 py-4 text-center tracking-widest uppercase text-[9px]">الإجمالي</td>
                  <td className="px-3 py-4 border-l border-[#3a3730]">{totals.days}</td>
                  <td className="px-3 py-4 border-l border-[#3a3730]"></td>
                  <td className="px-3 py-4 border-l border-[#3a3730] text-[#C1A68D]">{totals.total.toLocaleString()}</td>
                  <td className="px-3 py-4 border-l border-[#3a3730] text-orange-300">{totals.commission.toLocaleString()}</td>
                  <td className="px-3 py-4 border-l border-[#3a3730]"></td>
                  <td className="px-3 py-4 border-l border-[#3a3730] text-green-400">{totals.netValue.toLocaleString()}</td>
                  <td className="px-3 py-4"></td>
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
      </div>
    </>
  );
}
