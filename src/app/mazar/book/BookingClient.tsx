'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Calendar from '@/components/Calendar';
import { useLanguage } from '@/lib/LanguageContext';
import { saveBooking, initializeData, getPublicSystemUnits, getBookings } from '@/lib/data-init';

export default function BookingPage() {
  const { t, isRTL, language } = useLanguage();

  const [step, setStep] = useState(1);

  // Initialize with current date strings (YYYY-MM-DD)
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getTodayStr());
  const [checkOut, setCheckOut] = useState(getTomorrowStr());
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [quickViewUnit, setQuickViewUnit] = useState<any>(null);
  const [quickViewActiveImage, setQuickViewActiveImage] = useState<string>('');
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [step1Focus, setStep1Focus] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const ADMIN_WHATSAPP = '201554788708';

  useEffect(() => {
    const init = async () => {
      await initializeData();
      const params = new URLSearchParams(window.location.search);
      const unitParam = params.get('unit');
      if (unitParam) {
        setSelectedUnitId(unitParam);
        // If we have a unit, fetch its booked dates immediately
        const allBookings = await getBookings();
        const unitBooked = allBookings
          .filter((b: any) => b.apartmentId === unitParam && !['cancelled', 'deleted', 'rejected', 'مرفوض'].includes(b.status))
          .flatMap((b: any) => {
            const dates: string[] = [];
            let current = new Date(b.checkIn);
            const end = new Date(b.checkOut);
            while (current < end) {
              dates.push(current.toISOString().split('T')[0]);
              current.setDate(current.getDate() + 1);
            }
            return dates;
          });
        setBookedDates(unitBooked);
      }
    };
    init();
  }, []);

  const openWhatsAppAdmin = useCallback(() => {
    const selectedUnit = availableUnits.find((u: any) => u.id === selectedUnitId);
    
    // Calculate total nights
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const adminMsg = `🔔 *طلب حجز جديد من الموقع!*\n\n👤 *العميل:* ${name}\n📱 *الموبايل:* ${phone}\n👥 *عدد الأشخاص:* ${guestsCount}\n🏠 *الوحدة:* ${selectedUnit ? selectedUnit.title['ar'] : selectedUnitId}\n📅 *الفترة:* من ${checkIn} إلى ${checkOut} (إجمالي ${nights} ليالي)\n\nيرجى تأكيد الحجز معي.`;
    const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMsg)}`;
    window.open(waUrl, '_blank');
  }, [availableUnits, checkIn, checkOut, name, phone, selectedUnitId]);

  // Update booked dates when a unit is selected (for cases where they go back to step 1)
  useEffect(() => {
     if (selectedUnitId) {
        const fetchBooked = async () => {
           const allBookings = await getBookings();
           const unitBooked = allBookings
             .filter((b: any) => b.apartmentId === selectedUnitId && !['cancelled', 'deleted', 'rejected', 'مرفوض'].includes(b.status))
             .flatMap((b: any) => {
               const dates: string[] = [];
               let current = new Date(b.checkIn);
               const end = new Date(b.checkOut);
               while (current < end) {
                 dates.push(current.toISOString().split('T')[0]);
                 current.setDate(current.getDate() + 1);
               }
               return dates;
             });
           setBookedDates(unitBooked);
        };
        fetchBooked();
     } else {
        setBookedDates([]);
     }
  }, [selectedUnitId]);

  useEffect(() => {
    if (isSuccess && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && redirectCountdown === 0) {
      openWhatsAppAdmin();
    }
  }, [isSuccess, redirectCountdown, openWhatsAppAdmin]);

  const isDateOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    return (start1 < end2 && end1 > start2);
  };

  const handleDateSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;

    setIsLoading(true);
    setError(null);
    try {
      const allUnits = await getPublicSystemUnits();

      const activeUnitsByStatus = allUnits.filter((u: any) => u.status === 'متاح' || !u.status);
      const available = activeUnitsByStatus;

      setAvailableUnits(available);
      if (available.length > 0) {
        const currentSTillAvailable = available.find((u: any) => u.id === selectedUnitId);
        if (!currentSTillAvailable) setSelectedUnitId(available[0].id);
        setStep(2);
      } else {
        setSelectedUnitId('');
        setError(isRTL ? 'عذراً، لا توجد وحدات متاحة في هذه المواعيد. جرب تغيير التاريخ.' : 'Sorry, no units are available for these dates. Try changing the dates.');
      }
    } catch (err) {
      console.error('Availability check failed:', err);
      setError(isRTL ? 'حدث خطأ أثناء فحص التوافر. يرجى المحاولة مرة أخرى.' : 'Error checking availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitting(true);
    setError(null);

    const selectedUnit = availableUnits.find((u: any) => u.id === selectedUnitId);
    const bookingData = {
      name,
      phone,
      checkIn,
      checkOut,
      apartmentId: selectedUnitId,
      dates: `${checkIn} - ${checkOut}`,
      guest: name,
      guestsCount: guestsCount,
      studio: selectedUnit ? selectedUnit.title[language] : selectedUnitId,
    };

    try {
      await saveBooking(bookingData);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setError(isRTL ? 'حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.' : 'Error saving request. Please try again.');
      alert(isRTL ? 'حدث خطأ أثناء حفظ الطلب.' : 'An error occurred while saving the request.');
    }
  };

  const selectedUnit = availableUnits.find((u: any) => u.id === selectedUnitId);

  // Grouped Available Units
  const studioUnits = availableUnits.filter((u: any) => u.type === 'studio');
  const apartmentUnits = availableUnits.filter((u: any) => u.type === 'apartment');

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] text-[#2A2723] flex flex-col justify-center items-center p-6 animate-fade-in font-sans">
        <div className="bg-white p-12 md:p-16 rounded-[60px] border border-[#EAE4D9] shadow-2xl text-center max-w-2xl w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1.5 bg-[#25D366] transition-all duration-1000 ease-linear" style={{ width: `${(3 - redirectCountdown) * 33.33}%` }} />

          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 border border-green-100 shadow-sm animate-bounce">
            ✓
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-[#2A2723] mb-6 tracking-tighter">
            {isRTL ? 'تهانينا، تم استلام طلبك!' : 'Congratulations, request received!'}
          </h2>

          <div className="bg-[#F7F5F0] py-8 px-10 rounded-[40px] mb-8 border border-[#EAE4D9]">
            <p className="text-[11px] font-black text-[#C1A68D] uppercase tracking-widest mb-2">{isRTL ? 'الوحدة المختارة' : 'Selected Unit'}</p>
            <p className="text-3xl font-black text-[#2A2723] mb-1">{selectedUnit ? selectedUnit.title[language] : selectedUnitId}</p>
            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-[9px] font-bold text-gray-400 uppercase">{isRTL ? 'من' : 'From'}</p>
                <p className="text-xs font-black">{checkIn}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-bold text-gray-400 uppercase">{isRTL ? 'إلى' : 'To'}</p>
                <p className="text-xs font-black">{checkOut}</p>
              </div>
            </div>
          </div>

          <p className="text-[#5C554B] text-lg leading-relaxed font-bold mb-10">
            {isRTL
              ? 'لقد تم تسجيل طلبك بنجاح وجاري مراجعته.'
              : 'Your booking has been saved successfully and is under review.'}
            <br />
            <span className="text-[#25D366] font-black p-2 block animate-pulse">
              {isRTL
                ? `جاري تحويلك للواتساب للتأكيد تلقائياً خلال ${redirectCountdown}...`
                : `Redirecting to WhatsApp for confirmation in ${redirectCountdown}...`}
            </span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={openWhatsAppAdmin}
              className="w-full bg-[#25D366] text-white font-black py-5 rounded-[28px] hover:bg-[#128C7E] shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-3 text-lg"
            >
              💬 {isRTL ? 'تأكيد عبر واتساب الآن' : 'Confirm via WhatsApp'}
            </button>
            <Link href="/" className="w-full bg-[#2A2723] text-white font-black py-5 rounded-[28px] hover:bg-black transition-all text-sm flex items-center justify-center gap-3">
              🏠 {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D] selection:text-white relative overflow-x-hidden font-sans">

      <div className="absolute top-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#EAE4D9]/30 rounded-full blur-[60px] md:blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-[#D5C5B3]/20 rounded-full blur-[50px] md:blur-[100px] -z-10 pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full px-4 md:px-8 py-4 md:py-5 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-[#EAE4D9]">
        <Link href="/" className="shrink-0">
          <Logo size={36} mdSize={42} />
        </Link>
        <div className="flex items-center gap-3 md:gap-8">
          <LanguageSwitcher />
          <Link href="/" className="hidden xs:inline-flex text-[10px] md:text-xs font-black text-[#7A7061] hover:text-[#2A2723] uppercase tracking-tighter">
            {isRTL ? 'العودة للرئيسية ←' : '← Back to Home'}
          </Link>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto flex flex-col items-center">

        {step === 1 ? (
          /* STEP 1: MANUAL DROPDOWN SELECTORS (FULL USER CONTROL) */
          <div className="w-full max-w-4xl mx-auto p-4 md:p-6 py-12 md:py-24">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#C1A68D]/10 text-[#C1A68D] text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-4 border border-[#C1A68D]/20">Step 01 / Reservation</div>
              <h1 className="text-4xl md:text-7xl font-black text-[#2A2723] mb-4 tracking-tighter leading-tight">
                {isRTL ? 'حدد مواعيدك' : 'Select Dates'}
              </h1>
              <p className="text-base md:text-lg text-[#7A7061] font-bold mb-8 px-4 opacity-80">
                {isRTL ? 'أدخل البيانات بدقة تامة لضمان توفر الوحدات' : 'Enter dates with total precision to check availability'}
              </p>

              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="inline-flex items-center gap-3 bg-[#2A2723] text-white px-6 md:px-8 py-4 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm hover:bg-black transition-all shadow-xl active:scale-95"
              >
                {showCalendar ? '📅 ' + (isRTL ? 'إخفاء التقويم' : 'Hide Calendar') : '📅 ' + (isRTL ? 'عرض التقويم البصري' : 'Show Visual Calendar')}
              </button>
            </div>

            {showCalendar && (
              <div className="mb-12 md:mb-16 animate-in fade-in slide-in-from-top-8 duration-500 max-w-2xl mx-auto px-2">
                <Calendar
                  checkIn={checkIn}
                  checkOut={checkOut}
                  activeTab={step1Focus}
                  bookedDates={bookedDates}
                  onSelect={(inDate, outDate) => {
                    setCheckIn(inDate);
                    setCheckOut(outDate);
                    if (inDate && !outDate) setStep1Focus('checkOut');
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 px-2">

              {/* Arrival Box */}
              <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[50px] border border-[#EAE4D9]/50 shadow-2xl space-y-6 md:space-y-8 relative overflow-visible">
                <div className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 bg-[#C1A68D]/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-3 md:gap-4 mb-2">
                  <span className="text-2xl md:text-3xl">🛬</span>
                  <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#C1A68D]">{isRTL ? 'تاريخ الوصول' : 'Arrival Date'}</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {(() => {
                    const ManualPicker = ({ label, value, options, onSelect, color }: any) => {
                      const [isOpen, setIsOpen] = useState(false);
                      return (
                        <div className="space-y-1 md:space-y-2 relative">
                          <label className="block text-[8px] md:text-[9px] font-bold text-gray-400 uppercase px-1">{label}</label>
                          <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className={`w-full bg-[#F7F5F0] border-2 transition-all rounded-xl md:rounded-2xl p-3 md:p-4 text-lg md:text-xl font-black flex items-center justify-between group ${isOpen ? (color === 'red' ? 'border-[#E63946] bg-white shadow-lg' : 'border-[#C1A68D] bg-white shadow-lg') : 'border-transparent text-[#2A2723] hover:border-gray-200'}`}
                          >
                            <span className="flex-1 text-center">{value}</span>
                            <span className="text-[8px] opacity-20 group-hover:opacity-100 transition-opacity">▼</span>
                          </button>

                          {isOpen && (
                            <>
                              <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#EAE4D9] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[70] p-2 max-h-[220px] md:max-h-[280px] overflow-y-auto animate-in slide-in-from-top-4 fade-in duration-300">
                                <div className="grid grid-cols-1 gap-1">
                                  {options.map((opt: any) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => { onSelect(opt); setIsOpen(false); }}
                                      className={`p-3 rounded-xl text-base md:text-lg font-black transition-all ${value === opt ? (color === 'red' ? 'bg-[#E63946] text-white shadow-md' : 'bg-[#2A2723] text-white shadow-md') : 'hover:bg-[#F7F5F0] text-[#2A2723]'}`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    };

                    return (
                      <>
                        <ManualPicker
                          label={isRTL ? 'اليوم' : 'Day'}
                          value={checkIn.split('-')[2]}
                          options={(() => {
                            const [year, month] = checkIn.split('-').map(Number);
                            const days = new Date(year, month, 0).getDate();
                            return Array.from({ length: days }, (_, i) => (i + 1).toString().padStart(2, '0'));
                          })()}
                          onSelect={(v: string) => {
                            const parts = checkIn.split('-');
                            const newDate = `${parts[0]}-${parts[1]}-${v}`;
                            setCheckIn(newDate);
                            setStep1Focus('checkIn');
                          }}
                        />
                        <ManualPicker
                          label={isRTL ? 'الشهر' : 'Month'}
                          value={checkIn.split('-')[1]}
                          options={Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))}
                          onSelect={(v: string) => {
                            const parts = checkIn.split('-');
                            const [year, , day] = parts.map(Number);
                            const maxDays = new Date(year, Number(v), 0).getDate();
                            const newDay = day > maxDays ? maxDays.toString().padStart(2, '0') : parts[2];
                            const newDate = `${parts[0]}-${v}-${newDay}`;
                            setCheckIn(newDate);
                            setStep1Focus('checkIn');
                          }}
                        />
                        <ManualPicker
                          label={isRTL ? 'السنة' : 'Year'}
                          value={checkIn.split('-')[0]}
                          options={[new Date().getFullYear().toString(), (new Date().getFullYear() + 1).toString()]}
                          onSelect={(v: string) => {
                            const parts = checkIn.split('-');
                            const [, month, day] = parts.map(Number);
                            const maxDays = new Date(Number(v), month, 0).getDate();
                            const newDay = day > maxDays ? maxDays.toString().padStart(2, '0') : parts[2];
                            const newDate = `${v}-${parts[1]}-${newDay}`;
                            setCheckIn(newDate);
                            setStep1Focus('checkIn');
                          }}
                        />
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Departure Box */}
              <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[50px] border border-[#EAE4D9]/50 shadow-2xl space-y-6 md:space-y-8 relative overflow-visible">
                <div className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 bg-[#E63946]/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-3 md:gap-4 mb-2">
                  <span className="text-2xl md:text-3xl">🛫</span>
                  <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#E63946]">{isRTL ? 'تاريخ المغادرة' : 'Departure Date'}</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {(() => {
                    const ManualPicker = ({ label, value, options, onSelect, color }: any) => {
                      const [isOpen, setIsOpen] = useState(false);
                      return (
                        <div className="space-y-1 md:space-y-2 relative">
                          <label className="block text-[8px] md:text-[9px] font-bold text-gray-400 uppercase px-1">{label}</label>
                          <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className={`w-full bg-[#F7F5F0] border-2 transition-all rounded-xl md:rounded-2xl p-3 md:p-4 text-lg md:text-xl font-black flex items-center justify-between group ${isOpen ? (color === 'red' ? 'border-[#E63946] bg-white shadow-lg' : 'border-[#C1A68D] bg-white shadow-lg') : 'border-transparent text-[#2A2723] hover:border-gray-200'}`}
                          >
                            <span className="flex-1 text-center">{value}</span>
                            <span className="text-[8px] opacity-20 group-hover:opacity-100 transition-opacity">▼</span>
                          </button>

                          {isOpen && (
                            <>
                              <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#EAE4D9] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[70] p-2 max-h-[220px] md:max-h-[280px] overflow-y-auto animate-in slide-in-from-top-4 fade-in duration-300">
                                <div className="grid grid-cols-1 gap-1">
                                  {options.map((opt: any) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => { onSelect(opt); setIsOpen(false); }}
                                      className={`p-3 rounded-xl text-base md:text-lg font-black transition-all ${value === opt ? (color === 'red' ? 'bg-[#E63946] text-white shadow-md' : 'bg-[#2A2723] text-white shadow-md') : 'hover:bg-[#F7F5F0] text-[#2A2723]'}`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    };

                    return (
                      <>
                        <ManualPicker
                          color="red"
                          label={isRTL ? 'اليوم' : 'Day'}
                          value={checkOut.split('-')[2]}
                          options={(() => {
                            const [year, month] = checkOut.split('-').map(Number);
                            const days = new Date(year, month, 0).getDate();
                            return Array.from({ length: days }, (_, i) => (i + 1).toString().padStart(2, '0'));
                          })()}
                          onSelect={(v: string) => {
                            const parts = checkOut.split('-');
                            const newDate = `${parts[0]}-${parts[1]}-${v}`;
                            setCheckOut(newDate);
                            setStep1Focus('checkOut');
                          }}
                        />
                        <ManualPicker
                          color="red"
                          label={isRTL ? 'الشهر' : 'Month'}
                          value={checkOut.split('-')[1]}
                          options={Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))}
                          onSelect={(v: string) => {
                            const parts = checkOut.split('-');
                            const [year, , day] = parts.map(Number);
                            const maxDays = new Date(year, Number(v), 0).getDate();
                            const newDay = day > maxDays ? maxDays.toString().padStart(2, '0') : parts[2];
                            const newDate = `${parts[0]}-${v}-${newDay}`;
                            setCheckOut(newDate);
                            setStep1Focus('checkOut');
                          }}
                        />
                        <ManualPicker
                          color="red"
                          label={isRTL ? 'السنة' : 'Year'}
                          value={checkOut.split('-')[0]}
                          options={[new Date().getFullYear().toString(), (new Date().getFullYear() + 1).toString()]}
                          onSelect={(v: string) => {
                            const parts = checkOut.split('-');
                            const [, month, day] = parts.map(Number);
                            const maxDays = new Date(Number(v), month, 0).getDate();
                            const newDay = day > maxDays ? maxDays.toString().padStart(2, '0') : parts[2];
                            const newDate = `${v}-${parts[1]}-${newDay}`;
                            setCheckOut(newDate);
                            setStep1Focus('checkOut');
                          }}
                        />
                      </>
                    );
                  })()}
                </div>
              </div>

            </div>

            {/* Action Area */}
            <div className="mt-12 md:mt-16 flex flex-col items-center gap-6 md:gap-10">
              {checkIn && checkOut && new Date(checkOut) > new Date(checkIn) && (
                <div className="bg-[#2A2723] text-white px-8 py-3 rounded-full text-base md:text-lg font-black shadow-xl animate-bounce">
                  ✨ {isRTL ? `المجموع: ${Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} ليالي` : `Total: ${Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} Nights`}
                </div>
              )}

              <button
                onClick={handleDateSelection}
                disabled={!checkIn || !checkOut || isLoading}
                className="w-full max-w-xl bg-[#2A2723] text-white font-black py-6 md:py-8 rounded-[25px] md:rounded-[40px] text-2xl md:text-4xl hover:bg-black transition-all shadow-[0_20px_60px_rgba(0,0,0,0.15)] disabled:opacity-20 active:scale-95"
              >
                {isLoading ? '...' : (isRTL ? 'الخطوة التالية: اختر الوحدة' : 'Next: Select Unit')}
              </button>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl border border-red-100 font-bold text-center mt-4">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: PREMIUM UNIT SELECTION */
          <div className="w-full max-w-7xl px-4 md:px-6 pb-24">
            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-start">

              {/* UNIT SELECTION SIDE (Left/Main) */}
              <div className="flex-1 space-y-8 md:space-y-12 w-full order-2 lg:order-1">
                <header className={`space-y-3 md:space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[9px] md:text-[10px] font-black text-[#C1A68D] hover:text-[#2A2723] mb-2 inline-flex items-center gap-2 uppercase tracking-widest transition-all bg-white px-4 py-2 rounded-full border border-[#EAE4D9] hover:shadow-md"
                  >
                    {isRTL ? '← تعديل المواعيد' : '← Edit Dates'}
                  </button>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-1.5 h-8 md:h-10 bg-[#C1A68D] rounded-full" />
                    <h2 className="text-3xl md:text-5xl font-black text-[#2A2723] tracking-tighter">
                      {isRTL ? 'اختر وحدتك' : 'Select Your Unit'}
                    </h2>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-[#7A7061] opacity-70">
                    {isRTL ? 'تصفح جميع الوحدات واختر الأنسب لك' : 'Browse all units and select your preference'}
                  </p>
                </header>

                {/* SEARCH RESULTS GROUPS */}
                <div className="space-y-10 md:space-y-14">

                  {/* HELPER COMPONENT FOR UNIT CARDS */}
                  {(() => {
                    const UnitGroup = ({ title, icon, units, badgeColor }: any) => {
                      if (units.length === 0) return null;
                      return (
                        <div className="space-y-6 md:space-y-8">
                          <div className={`flex items-center justify-between pb-3 border-b border-[#F0EBE3] ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="flex items-center gap-2 md:gap-3">
                              <span className="text-xl md:text-2xl">{icon}</span>
                              <h3 className="text-xs md:text-sm font-black uppercase text-[#2A2723] tracking-[0.1em] md:tracking-[0.2em]">{title}</h3>
                            </div>
                            <span className="bg-white border border-[#EAE4D9]/50 text-[8px] md:text-[9px] font-black px-3 py-1 rounded-full text-[#7A7061] shadow-sm">
                              {units.length} {isRTL ? 'متوفرة' : 'Available'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                            {units.map((u: any) => (
                              <div
                                key={u.id}
                                onClick={() => setSelectedUnitId(u.id)}
                                className={`cursor-pointer group relative flex flex-col text-right transition-all duration-500 rounded-3xl md:rounded-[32px] overflow-hidden border-2 ${selectedUnitId === u.id
                                  ? 'bg-[#2A2723] border-[#2A2723] shadow-xl scale-[1.02] z-10'
                                  : 'bg-white border-[#EAE4D9]/50 hover:border-[#C1A68D] hover:shadow-lg'
                                  }`}
                              >
                                {/* Photo */}
                                <div className="h-24 md:h-28 w-full relative overflow-hidden bg-[#F7F5F0]">
                                  {u.images && u.images[0] ? (
                                    <img src={u.images[0]} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                  ) : (
                                    <div className={`w-full h-full flex items-center justify-center opacity-30 ${selectedUnitId === u.id ? 'bg-white/10' : 'bg-[#EAE4D9]/20'}`}>
                                      <span className="text-2xl">🏢</span>
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full text-[6px] md:text-[7px] font-black text-[#2A2723] uppercase">
                                    {u.type === 'studio' ? (isRTL ? 'استوديو' : 'Studio') : (isRTL ? 'شقة' : 'Apartment')}
                                  </div>
                                </div>

                                <div className="p-3 md:p-4 space-y-2 flex-grow">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest ${selectedUnitId === u.id ? 'text-[#C1A68D]' : 'text-[#7A7061] opacity-50'}`}>
                                      {u.id}
                                    </span>
                                    {selectedUnitId === u.id && (
                                      <div className="w-4 h-4 rounded-full bg-[#E63946] flex items-center justify-center text-[7px] text-white">✓</div>
                                    )}
                                  </div>
                                  <h4 className={`text-xs md:text-sm font-black leading-snug transition-colors ${selectedUnitId === u.id ? 'text-white' : 'text-[#2A2723]'}`}>
                                    {u.title[language]}
                                  </h4>
                                  <div className={`p-1.5 md:p-2 rounded-xl text-[7px] md:text-[8px] font-bold text-center transition-all ${selectedUnitId === u.id ? 'bg-white/10 text-white/70' : 'bg-[#F7F5F0] text-[#7A7061]'}`}>
                                    ✨ {isRTL ? 'إقامة بريميوم' : 'Premium Stay'}
                                  </div>
                                </div>

                                <div className="px-3 pb-3 pt-0 mt-auto">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setQuickViewUnit(u);
                                      setQuickViewActiveImage(u.video || (u.images && u.images[0]) || '');
                                    }}
                                    className={`w-full inline-flex justify-center items-center py-2 md:py-2.5 rounded-xl border text-[9px] md:text-[10px] font-bold transition-colors ${selectedUnitId === u.id ? 'border-white/20 text-white hover:bg-white/10' : 'border-[#EAE4D9] text-[#5C554B] hover:bg-[#F7F5F0]'}`}
                                  >
                                    {isRTL ? '👁️ تفاصيل الوحدة' : '👁️ View Details'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div className="space-y-12 md:space-y-16">
                        <UnitGroup
                          title={isRTL ? 'الاستديوهات المتاحة' : 'Available Studios'}
                          icon="✨"
                          units={studioUnits}
                        />
                        <UnitGroup
                          title={isRTL ? 'الشقق العائلية المتاحة' : 'Available Apartments'}
                          icon="🏘️"
                          units={apartmentUnits}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* FINAL FORM SIDE (Right/Sticky) */}
              <div className="w-full lg:w-[400px] xl:w-[450px] sticky top-32 order-1 lg:order-2">
                <div className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[60px] border border-[#EAE4D9]/60 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-[#C1A68D]/5 rounded-bl-full -z-10" />

                  <header className={`space-y-2 mb-8 md:mb-10 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-2xl md:text-3xl font-black text-[#2A2723] tracking-tighter italic">
                      {isRTL ? 'أتمم حجزك الآن' : 'Finalize Reservation'}
                    </h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-[#7A7061] uppercase tracking-widest leading-relaxed opacity-70">
                      {isRTL ? 'أدخل بياناتك للتأكيد الفوري عبر واتساب' : 'Enter your details for instant WhatsApp confirmation'}
                    </p>
                  </header>

                  <form onSubmit={handleSubmitBooking} className="space-y-6 md:space-y-8">
                    <div className="space-y-4 md:space-y-5">
                      <div className="space-y-2">
                        <label className={`block text-[9px] md:text-[10px] font-black text-[#5C554B] uppercase px-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                          👤 {isRTL ? 'اسم الضيف بالكامل' : 'Full Guest Name'}
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder={isRTL ? "مثال: م. فوزي المطرى" : "e.g. John Doe"}
                          className={`w-full bg-[#F7F5F0] border-2 border-transparent focus:border-[#C1A68D] focus:bg-white rounded-2xl md:rounded-3xl px-6 md:px-8 py-4 md:py-5 outline-none font-bold transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`block text-[9px] md:text-[10px] font-black text-[#5C554B] uppercase px-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                          📱 {isRTL ? 'رقم الواتساب للتأكيد' : 'WhatsApp Number'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+20 1..."
                          className={`w-full bg-[#F7F5F0] border-2 border-transparent focus:border-[#C1A68D] focus:bg-white rounded-2xl md:rounded-3xl px-6 md:px-8 py-4 md:py-5 outline-none font-bold transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className={`block text-[9px] md:text-[10px] font-black text-[#5C554B] uppercase px-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                          👥 {isRTL ? 'عدد الضيوف' : 'Number of Guests'}
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setGuestsCount(num)}
                              className={`flex-1 py-3 rounded-xl font-black transition-all border-2 ${guestsCount === num ? 'bg-[#2A2723] text-white border-[#2A2723]' : 'bg-[#F7F5F0] text-[#7A7061] border-transparent hover:border-gray-200'}`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {selectedUnitId && (
                      <div className="bg-[#2A2723] p-5 md:p-6 rounded-3xl text-white space-y-3 shadow-lg">
                        <div className="flex justify-between items-center opacity-60 text-[7px] md:text-[8px] font-black uppercase tracking-widest">
                          <span>{isRTL ? 'تفاصيل الحجز' : 'Selection Detail'}</span>
                          <span>{checkIn} → {checkOut}</span>
                        </div>
                        <p className="text-lg md:text-xl font-bold">{availableUnits.find(u => u.id === selectedUnitId)?.title[language]}</p>
                      </div>
                    )}

                    <div className="space-y-4 pt-2">
                       <label className="flex items-start gap-4 cursor-pointer group">
                          <div className="relative flex items-center justify-center shrink-0 mt-1">
                             <input 
                               type="checkbox" 
                               required
                               checked={rulesAccepted}
                               onChange={(e) => setRulesAccepted(e.target.checked)}
                               className="peer appearance-none w-6 h-6 border-2 border-[#EAE4D9] rounded-lg checked:bg-[#2A2723] checked:border-[#2A2723] transition-colors cursor-pointer"
                             />
                             <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-xs">✓</span>
                          </div>
                          <p className="text-xs md:text-sm text-[#7A7061] font-bold leading-relaxed selection:bg-transparent">
                             {isRTL ? (
                               <>أوافق على قراءة والالتزام بـ <Link href="/mazar/rules" target="_blank" className="text-[#C1A68D] underline hover:text-[#2A2723] transition-colors font-black">قواعد المبيت والشروط والأحكام</Link> الخاصة بمجمع مزار الفندقي.</>
                             ) : (
                               <>I agree to read and comply with the <Link href="/mazar/rules" target="_blank" className="text-[#C1A68D] underline hover:text-[#2A2723] transition-colors font-black">house rules and terms</Link> of Mazar Booking.</>
                             )}
                          </p>
                       </label>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || !name || !phone || !selectedUnitId || !rulesAccepted}
                        className="group relative w-full bg-[#E63946] text-white font-black py-6 md:py-7 rounded-2xl md:rounded-[32px] hover:bg-[#c1121f] transition-all flex items-center justify-center gap-4 text-xl md:text-2xl disabled:opacity-20 shadow-xl shadow-red-500/20"
                      >
                        <span className="relative z-10">{isSubmitting ? '...' : (isRTL ? 'تأكيد الحجز الفوري' : 'Instant Confirm')}</span>
                      </button>
                    </div>
                  </form>

                  <div className="mt-6 md:mt-8 text-center">
                    <p className="text-[8px] md:text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center justify-center gap-2">
                      <span className="w-6 md:w-8 h-[1px] bg-gray-100" />
                      {isRTL ? 'دفع عند الوصول' : 'Pay on Arrival'}
                      <span className="w-6 md:w-8 h-[1px] bg-gray-100" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewUnit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQuickViewUnit(null)} />
          <div className="bg-white w-full max-w-6xl rounded-3xl md:rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row max-h-[95vh] animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setQuickViewUnit(null)}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center z-20 backdrop-blur-md transition-colors`}
            >
              ✕
            </button>

            {/* Left Side: Exact Gallery Section */}
            <div className="md:w-[45%] lg:w-1/2 p-6 md:p-10 bg-[#FDFBF7] flex flex-col gap-6 overflow-y-auto hidden-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {/* Main Image/Video View */}
              <div className="relative h-[300px] md:h-[450px] rounded-[32px] overflow-hidden shadow-sm bg-black flex items-center justify-center shrink-0">
                {quickViewActiveImage.endsWith('.mp4') ? (
                  <video src={quickViewActiveImage} controls autoPlay muted className="w-full h-full object-contain" />
                ) : (
                  <img src={quickViewActiveImage} alt="Active Media" className="w-full h-full object-cover transition-transform duration-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                <div className={`absolute bottom-6 ${isRTL ? 'right-6' : 'left-6'} text-white`}>
                  <div className="text-sm font-bold bg-[#E63946] px-3 py-1 rounded-full inline-block mb-2 shadow-sm">
                    {quickViewUnit.type === 'studio' ? (isRTL ? 'استوديو' : 'Studio') : (isRTL ? 'شقة فندقية' : 'Hotel Apartment')}
                  </div>
                </div>
              </div>

              {/* Thumbnail Grid (Media) */}
              <div className="grid grid-cols-5 md:grid-cols-6 gap-3 shrink-0">
                {quickViewUnit.video && (
                  <button
                    onClick={() => setQuickViewActiveImage(quickViewUnit.video)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-black flex items-center justify-center ${quickViewActiveImage === quickViewUnit.video ? 'border-[#C1A68D] scale-95 shadow-lg' : 'border-[#EAE4D9] hover:border-[#C1A68D]/40'}`}
                  >
                    <span className="text-white text-xl">▶</span>
                  </button>
                )}
                {quickViewUnit.images && quickViewUnit.images.slice(0, 11).map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setQuickViewActiveImage(img)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${quickViewActiveImage === img ? 'border-[#C1A68D] scale-95 shadow-lg' : 'border-[#EAE4D9] hover:border-[#C1A68D]/40'}`}
                  >
                    <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side: Exact Info Section */}
            <div className={`flex flex-col md:w-[55%] lg:w-1/2 p-6 md:p-10 overflow-y-auto max-h-[70vh] md:max-h-[95vh] ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-block bg-[#F7F5F0] border border-[#C1A68D]/30 px-3 py-1 rounded-lg text-[10px] font-bold text-[#C1A68D] uppercase tracking-widest">
                  {quickViewUnit.type}
                </div>
                <div className={`inline-block px-3 py-1 rounded-lg text-white text-[10px] font-bold tracking-widest shadow-md ${quickViewUnit.status === 'متاح' || !quickViewUnit.status ? 'bg-green-500' : quickViewUnit.status === 'مشغول' ? 'bg-blue-500' : 'bg-red-500'}`}>
                  {quickViewUnit.status || 'متاح'}
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-[#2A2723] mb-6 leading-tight">
                {quickViewUnit.title[language]}
              </h1>

              {quickViewUnit.price && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-3xl font-black text-[#C1A68D]">
                    {quickViewUnit.price} <span className="text-base font-bold">/ {isRTL ? 'الليلة' : 'Night'}</span>
                  </div>
                  {quickViewUnit.originalPrice && (
                    <div className="text-xl text-[#9A8F82] line-through font-bold">
                      {quickViewUnit.originalPrice}
                    </div>
                  )}
                </div>
              )}

              <p className="text-base md:text-lg text-[#5C554B] leading-loose mb-10 opacity-90">
                {quickViewUnit.description[language]}
              </p>

              <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-[#EAE4D9] shadow-sm mb-10 shrink-0">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E63946]"></span>
                  {isRTL ? 'مميزات الوحدة' : 'Unit Features'}
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  {quickViewUnit.features && quickViewUnit.features[language] && quickViewUnit.features[language].map((feat: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-[#4A3F2F] font-bold">
                      <span className="text-green-500">✓</span>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-[#EAE4D9] shrink-0">
                <button
                  onClick={() => { setSelectedUnitId(quickViewUnit.id); setQuickViewUnit(null); }}
                  className="w-full bg-[#E63946] text-white font-black py-4 md:py-6 rounded-2xl md:rounded-3xl hover:bg-[#c1121f] text-xl md:text-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  <span className="text-2xl">🗓️</span>
                  {isRTL ? 'تحديد هذه الوحدة للحجز' : 'Select this Unit'}
                </button>
              </div>

              <div className="mt-8 flex items-center gap-4 justify-center shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9A8F82] uppercase tracking-[0.2em]">
                  <span>🔒</span>
                  <span>Smart Access</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[#EAE4D9]" />
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9A8F82] uppercase tracking-[0.2em]">
                  <span>❄️</span>
                  <span>Full AC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
