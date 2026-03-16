"use client";

import { useEffect, useState } from 'react';

export default function ApartmentsManagement() {
  const [apartments, setApartments] = useState<any[]>([]);

  useEffect(() => {
    // Initialize or get apartments from localStorage
    const saved = localStorage.getItem('apartments');
    if (saved) {
      setApartments(JSON.parse(saved));
    } else {
      const initial = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `شقة ${i + 1}`,
        status: 'available', // available, maintenance, occupied
      }));
      setApartments(initial);
      localStorage.setItem('apartments', JSON.stringify(initial));
    }
  }, []);

  const toggleStatus = (id: number) => {
    const updated = apartments.map(apt => {
      if (apt.id === id) {
        const nextStatus = apt.status === 'available' ? 'maintenance' : 'available';
        return { ...apt, status: nextStatus };
      }
      return apt;
    });
    setApartments(updated);
    localStorage.setItem('apartments', JSON.stringify(updated));
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black mb-2">إدارة <span className="text-gold">الشقق</span></h1>
        <p className="text-gray text-sm">تتبع حالة الـ 10 شقق وتحديث توافرها للصيانة أو الحجز.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {apartments.map((apt) => (
          <div key={apt.id} className={`glass-card p-6 border-l-4 ${
            apt.status === 'available' ? 'border-l-success' : 'border-l-warning'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl">🏢</span>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                apt.status === 'available' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}>
                {apt.status === 'available' ? 'متاحة' : 'صيانة'}
              </span>
            </div>
            <h3 className="font-bold text-lg mb-4">{apt.name}</h3>
            
            <button 
              onClick={() => toggleStatus(apt.id)}
              className="w-full py-2 rounded-xl border border-white/10 text-[10px] font-bold hover:bg-white/5 transition-all outline-none focus:ring-1 focus:ring-gold"
              aria-label={`تغيير حالة ${apt.name}`}
            >
              {apt.status === 'available' ? 'تحويل للصيانة 🛠️' : 'تفعيل للجمهور ✅'}
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card bg-gold/5 border-gold/20 flex gap-4 items-center">
        <span className="text-2xl">ℹ️</span>
        <p className="text-xs text-gray-300">
          الشقق التي في وضع "الصيانة" لن تظهر للعملاء في صفحة الحجز ولن يتم احتسابها في عدد الشقق المتاحة.
        </p>
      </div>
    </div>
  );
}
