"use client";

import { useEffect, useState, useMemo } from 'react';
import { getBookings, deleteBookingsByPhone } from '@/lib/data-init';

export default function CustomersDatabase() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    // Add cache buster
    const data = await getBookings(Date.now().toString());
    setBookings(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (phone: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف العميل "${name}"؟ سيتم حذف كافة سجلات حجوزاته نهائياً من النظام.`)) {
      return;
    }
    
    setIsDeleting(phone);
    try {
      await deleteBookingsByPhone(phone);
      await loadData();
    } catch (err) {
      alert('فشل الحذف. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDeleting(null);
    }
  };

  const customers = useMemo(() => {
    const customerMap = new Map();
    
    // Keywords to detect if a client has ever received a discount in notes
    const discountKeywords = ['خصم', 'discount', 'تخفيض', 'وفر', 'بونص', 'free', 'هدية'];
    
    bookings.forEach(b => {
      const phone = b.phone?.trim();
      if (!phone) return;
      
      const hasDiscountInThisBooking = b.notes && discountKeywords.some(kw => b.notes.toLowerCase().includes(kw));
      
      const existing = customerMap.get(phone);
      if (existing) {
        existing.count += 1;
        if (hasDiscountInThisBooking) existing.hasDiscount = true;
        
        // Keep the most recent name and timestamp
        const itemTime = new Date(b.timestamp).getTime();
        const existingTime = new Date(existing.lastSeen).getTime();
        
        if (itemTime > existingTime) {
          existing.name = b.name;
          existing.lastSeen = b.timestamp;
        }
        if (b.studio && !existing.units.includes(b.studio)) {
          existing.units.push(b.studio);
        }
      } else {
        customerMap.set(phone, {
          name: b.name,
          phone: phone,
          count: 1,
          lastSeen: b.timestamp,
          hasDiscount: !!hasDiscountInThisBooking,
          units: b.studio ? [b.studio] : []
        });
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.count - a.count);
  }, [bookings]);

  const exportToCSV = () => {
    const headers = ['Guest Name', 'Phone Number', 'Total Bookings', 'Last Visit', 'Has Discount'];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.phone,
      c.count,
      new Date(c.lastSeen).toLocaleDateString('en-GB'),
      c.hasDiscount ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Mazar_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 text-[#2A2723]">قاعدة <span className="text-[#C1A68D]">العملاء</span></h1>
          <p className="text-[#7A7061] font-bold opacity-70 text-sm">تجميع تلقائي لجميع أرقام الهواتف والبيانات من واقع الحجوزات.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <input 
              type="text" 
              placeholder="بحث بالاسم أو الرقم..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#EAE4D9]/50 rounded-2xl px-6 py-4 text-sm font-bold shadow-sm focus:border-[#C1A68D] transition-all outline-none"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-xl">🔍</span>
          </div>
          <button 
            onClick={exportToCSV}
            className="bg-[#2A2723] text-white font-black px-8 py-4 rounded-2xl hover:bg-black transition-all text-sm shadow-xl shadow-black/10 flex items-center justify-center gap-3"
          >
            <span>📥</span> تصدير للقائمة (CSV)
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9]/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#FDFBF7] border-b border-[#EAE4D9]/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest text-right">المستأجر</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest text-right">رقم الهاتف</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest text-center">عدد الحجوزات</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest text-center">الخصم</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest text-right">آخر زيارة</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7A7061] uppercase tracking-widest text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4D9]/30">
              {isLoading ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-[#C1A68D] font-black animate-pulse">جاري تحميل قاعدة البيانات...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-[#7A7061] opacity-30 font-black">لا يوجد عملاء يطابقون البحث.</td></tr>
              ) : filteredCustomers.map((c, i) => (
                <tr key={i} className="hover:bg-[#FDFBF7] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#C1A68D]/10 text-[#C1A68D] flex items-center justify-center font-black">
                        {c.name?.substring(0, 1) || '?'}
                      </div>
                      <span className="font-black text-[#2A2723]">{c.name || 'عميل بدون اسم'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-[#7A7061] tracking-wider" dir="ltr">{c.phone}</td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-[#2A2723] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                      {c.count} {c.count > 1 ? 'مرات' : 'مرة'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {c.hasDiscount ? (
                      <span className="bg-green-50 text-green-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-green-200">💎 خصم سابق</span>
                    ) : (
                      <span className="text-[#7A7061] text-[9px] font-bold opacity-30">لا يوجد</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-xs font-black text-[#7A7061]">
                    {new Date(c.lastSeen).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                        <a 
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        className="w-10 h-10 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-full flex items-center justify-center transition-all border border-[#25D366]/20"
                        title="واتساب"
                        >
                        <span className="text-sm">💬</span>
                        </a>
                        <button 
                        onClick={() => handleDelete(c.phone, c.name)}
                        disabled={isDeleting === c.phone}
                        className="w-10 h-10 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center transition-all border border-red-100 disabled:opacity-30"
                        title="حذف العميل"
                        >
                        {isDeleting === c.phone ? '...' : '🗑️'}
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#C1A68D]/10 border border-[#C1A68D]/30 flex gap-8 p-10 rounded-[3rem] items-center">
        <span className="text-4xl">💎</span>
        <div>
          <h4 className="font-black text-[#2A2723] mb-2 text-lg">قاعدة بياناتك هي كنز التسويق</h4>
          <p className="text-[11px] text-[#7A7061] leading-relaxed font-bold opacity-80">
            هذه الصفحة تقوم بتنقية البيانات تلقائياً وتجميع سجلات كل عميل بناءً على رقم هاتفه. نظام "التتبع الذكي" سيكتشف تلقائياً إذا كان العميل قد حصل على خصم سابق بناءً على ملاحظات حجوزاته السابقة.
          </p>
        </div>
      </div>
    </div>
  );
}
