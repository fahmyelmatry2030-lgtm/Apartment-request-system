'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BookingPage() {
  const TOTAL_STUDIOS = 10;
  
  // Basic states for the form
  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simulated backend logic: calculate availability based on dates
  // For demo: randomly assign a number of booked studios between 0 and 5
  // Note: Only calculate this once when dates are selected
  const [bookedStudios, setBookedStudios] = useState(0);

   const [isVideoPlaying, setIsVideoPlaying] = useState(false);
   const [selectedStudio, setSelectedStudio] = useState(1);
   const [availableStudioNumbers, setAvailableStudioNumbers] = useState<number[]>([]);

  // Handle date selection: Set 2 booked (8 available) as requested
   const handleDateSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    
    // Simulate picking 8 specific available studios out of 10
    const all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = all.sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 8).sort((a,b) => a-b);
    
    setAvailableStudioNumbers(picked);
    setSelectedStudio(picked[0]);
    setBookedStudios(2); // 10 - 8 = 2 booked
    setStep(2);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const availableStudios = TOTAL_STUDIOS - bookedStudios;

  if (isSuccess) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#FDFBF7] text-[#2A2723] flex flex-col justify-center items-center p-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="bg-white p-12 rounded-3xl border border-[#EAE4D9] shadow-xl text-center max-w-lg w-full">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✓
           </div>
           <h2 className="text-3xl font-bold text-[#2A2723] mb-4">تم إرسال طلبك بنجاح!</h2>
           <div className="bg-[#F7F5F0] py-3 px-6 rounded-2xl mb-6 border border-[#EAE4D9] inline-block">
              <span className="text-sm font-bold text-[#5C554B]">الاستوديو المختار: </span>
              <span className="text-xl font-bold text-[#C1A68D]">رقم {selectedStudio}</span>
           </div>
           <p className="text-[#5C554B] mb-8 leading-relaxed">
              طلب الحجز المبدئي قيد المراجعة. سيتم التواصل معك قريباً عبر الواتساب على الرقم ({phone}) لإرسال تفاصيل الدفع وتأكيد الحجز.
           </p>
           <Link href="/mazar" className="inline-block bg-[#2A2723] text-white px-8 py-3 rounded-full hover:bg-[#3E3A35] transition-all">
              العودة للرئيسية
           </Link>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D] selection:text-white overflow-hidden relative" style={{ fontFamily: 'Calibri, sans-serif' }}>
      
      {/* Background Decorative Blur */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#EAE4D9]/30 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full px-8 py-5 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-[#EAE4D9]">
        <Link href="/mazar" className="text-2xl font-bold tracking-tight text-[#2A2723] flex items-center gap-2">
            مزار 
            <span className="w-2 h-2 rounded-full bg-[#C1A68D]"></span>
        </Link>
        <Link href="/mazar" className="text-xs font-bold text-[#7A7061] hover:text-[#2A2723]">
          العودة للرئيسية ←
        </Link>
      </nav>

      <div className="max-w-screen-2xl mx-auto min-h-[calc(100vh-80px)] flex flex-col justify-center items-center">
         
         {step === 1 ? (
           /* STEP 1: CENTERED HERO DATE SELECTION */
           <div className="w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-700">
              <div className="text-center mb-10">
                 <h1 className="text-5xl font-bold text-[#2A2723] mb-4">خطوتك الأولى نحو الراحة</h1>
                 <p className="text-lg text-[#7A7061]">حدد تواريخ إقامتك لنعرض لك الاستوديوهات المتاحة في مزار.</p>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-[#EAE4D9] shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
                 {/* Progress Indicator */}
                 <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
                    <div className="h-full bg-[#C1A68D] w-1/2 transition-all duration-700" />
                 </div>

                 <form onSubmit={handleDateSelection} className="space-y-8 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label htmlFor="check-in" className="text-sm font-bold text-[#5C554B] pr-1">تاريخ الوصول</label>
                          <input 
                             id="check-in"
                             type="date" 
                             required
                             min={new Date().toISOString().split('T')[0]}
                             value={checkIn}
                             onChange={(e) => setCheckIn(e.target.value)}
                             className="w-full bg-[#F7F5F0] border border-[#EAE4D9] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#C1A68D] focus:ring-4 focus:ring-[#C1A68D]/5 transition-all text-lg"
                          />
                       </div>
                       <div className="space-y-3">
                          <label htmlFor="check-out" className="text-sm font-bold text-[#5C554B] pr-1">تاريخ المغادرة</label>
                          <input 
                             id="check-out"
                             type="date" 
                             required
                             min={checkIn || new Date().toISOString().split('T')[0]}
                             value={checkOut}
                             onChange={(e) => setCheckOut(e.target.value)}
                             className="w-full bg-[#F7F5F0] border border-[#EAE4D9] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#C1A68D] focus:ring-4 focus:ring-[#C1A68D]/5 transition-all text-lg"
                          />
                       </div>
                    </div>

                    <button 
                       type="submit"
                       disabled={!checkIn || !checkOut}
                       className="w-full bg-[#2A2723] text-white font-bold py-5 rounded-2xl text-xl hover:bg-[#3E3A35] hover:shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all transform active:scale-95"
                    >
                       التحقق من التوفر الآن
                    </button>
                    
                    <div className="flex justify-center gap-8 pt-4 border-t border-gray-50">
                       <span className="text-[11px] font-bold text-[#7A7061] flex items-center gap-1">✓ تأكيد فوري</span>
                       <span className="text-[11px] font-bold text-[#7A7061] flex items-center gap-1">✓ خدمة 24 ساعة</span>
                       <span className="text-[11px] font-bold text-[#7A7061] flex items-center gap-1">✓ أمان ذكي</span>
                    </div>
                 </form>
              </div>
           </div>
         ) : (
           /* STEP 2: SPLIT SCREEN (FORM + GALLERY) */
           <div className="w-full flex flex-col lg:flex-row animate-in slide-in-from-right-8 duration-700">
              
              {/* FORM COLUMN */}
              <div className="w-full lg:w-[55%] p-6 md:p-12 lg:p-20 flex flex-col justify-center">
                 <div className="max-w-xl mx-auto w-full">
                    <h1 className="text-3xl font-bold text-[#2A2723] mb-8">استكمال عملية الحجز</h1>
                    
                    <div className="bg-white p-8 md:p-10 rounded-3xl border border-[#EAE4D9] shadow-2xl relative overflow-hidden mb-8">
                       <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C1A68D]" />
                       
                       <form onSubmit={handleSubmitBooking} className="space-y-6 pt-4">
                          <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-[#7A7061] hover:text-[#2A2723] mb-4 flex items-center gap-1">← العودة لتعديل التاريخ</button>
                          
                          <div className="bg-[#F7F5F0] border border-[#C1A68D]/30 p-5 rounded-2xl flex items-center justify-between mb-6">
                             <div>
                                <p className="text-[#5C554B] text-[10px] mb-1 font-bold">إقامتك من {checkIn} إلى {checkOut}</p>
                                <p className="text-xl font-bold text-[#2A2723]">
                                   ستوديو رقم <span className="text-[#C1A68D]">({selectedStudio})</span> متاح لك
                                </p>
                             </div>
                             <div className="text-green-600 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-full border border-green-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                متاح الآن
                             </div>
                          </div>

                          <div className="space-y-5">
                             <div className="space-y-2">
                                <label htmlFor="full-name" className="text-xs font-bold text-[#5C554B] pr-1">اسم الضيف</label>
                                <input 
                                   id="full-name"
                                   type="text" 
                                   required
                                   placeholder="ادخل اسمك الثلاثي"
                                   value={name}
                                   onChange={(e) => setName(e.target.value)}
                                   className="w-full bg-[#F7F5F0]/50 border border-[#EAE4D9] rounded-xl px-4 py-4 focus:outline-none focus:border-[#C1A68D]"
                                />
                             </div>
                             <div className="space-y-2">
                                <label htmlFor="phone-number" className="text-xs font-bold text-[#5C554B] pr-1">رقم الواتساب للتواصل</label>
                                <input 
                                   id="phone-number"
                                   type="tel" 
                                   required
                                   dir="ltr"
                                   placeholder="+20"
                                   value={phone}
                                   onChange={(e) => setPhone(e.target.value)}
                                   className="w-full bg-[#F7F5F0]/50 border border-[#EAE4D9] rounded-xl px-4 py-4 focus:outline-none focus:border-[#C1A68D] text-right"
                                />
                             </div>

                             <div className="space-y-2">
                                <label htmlFor="studio-number" className="text-xs font-bold text-[#5C554B] pr-1">رقم الاستوديو المختار</label>
                                <div className="relative">
                                   <input 
                                      id="studio-number"
                                      type="text" 
                                      readOnly
                                      value={`استوديو رقم (${selectedStudio})`}
                                      className="w-full bg-[#F7F5F0] border border-[#C1A68D]/40 rounded-xl px-4 py-4 focus:outline-none text-[#2A2723] font-bold cursor-default"
                                   />
                                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-[#C1A68D] font-bold">✓ تم الاختيار</span>
                                </div>
                             </div>
                             
                             <button 
                                type="submit"
                                disabled={isSubmitting || !name || !phone}
                                className="w-full bg-[#C1A68D] text-white font-bold py-5 rounded-2xl mt-4 hover:bg-[#A88B6E] shadow-xl hover:shadow-[0_10px_30px_rgba(193,166,141,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                             >
                                {isSubmitting ? (
                                   <>
                                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                      جاري الحجز...
                                   </>
                                ) : "تأكيد طلب الحجز المبدئي"}
                             </button>
                          </div>
                       </form>
                    </div>

                    <p className="text-center text-[10px] text-[#7A7061] leading-relaxed">
                       بالضغط على تأكيد، أنت توافق على <Link href="/mazar/rules" className="underline">سياسات الإقامة</Link> في مزار. <br/>
                       سيصلك الرد خلال دقائق لتأكيد الحجز النهائي.
                    </p>
                 </div>
              </div>

              {/* MEDIA GALLERY COLUMN (Sticky Side Panel) */}
              <div className="w-full lg:w-[45%] bg-[#F7F5F0] border-r border-[#EAE4D9] p-8 lg:p-12 overflow-y-auto max-h-screen">
                 <div className="sticky top-0 space-y-8">
                    <div className="flex flex-col gap-4">
                       <h2 className="text-2xl font-bold text-[#2A2723]">اختر استوديو متاح ({availableStudios})</h2>
                       <div className="grid grid-cols-4 gap-3">
                          {availableStudioNumbers.map((num) => (
                             <button 
                                key={num}
                                onClick={() => setSelectedStudio(num)}
                                className={`px-2 py-3 rounded-xl font-bold text-[10px] md:text-sm transition-all border ${
                                   selectedStudio === num 
                                   ? 'bg-[#2A2723] text-white border-[#2A2723] shadow-md scale-105' 
                                   : 'bg-white text-[#5C554B] border-[#EAE4D9] hover:border-[#C1A68D]'
                                }`}
                             >
                                استوديو {num}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* VIDEO TOUR */}
                    <div className="aspect-video bg-black rounded-3xl overflow-hidden relative shadow-[0_20px_40px_rgba(0,0,0,0.2)] group border border-[#EAE4D9]">
                       {!isVideoPlaying ? (
                         <>
                           <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800" alt="Video Preview" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                           <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                             <button 
                                onClick={() => setIsVideoPlaying(true)}
                                className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white text-3xl hover:bg-[#C1A68D] hover:scale-110 transition-all duration-300 border border-white/40 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                             >
                                ▶
                             </button>
                             <p className="text-white text-[10px] font-bold tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">شاهد جولة مزار (Premium Tour)</p>
                           </div>
                         </>
                       ) : (
                         <iframe 
                           className="w-full h-full"
                           src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                           title="Studio Tour"
                           frameBorder="0"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                         ></iframe>
                       )}
                       {!isVideoPlaying && (
                         <div className="absolute bottom-4 left-4 right-4 py-2.5 px-5 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] text-white font-medium border border-white/10 text-center">
                            🎥 جولة حقيقية من داخل "مزار ستوديوز" في مدينة نصر
                         </div>
                       )}
                    </div>

                    {/* IMAGES GRID */}
                    <div className="grid grid-cols-2 gap-5">
                       {[
                          { src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', label: 'غرفة النوم الفاخرة' },
                          { src: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb', label: 'منطقة المعيشة' },
                          { src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858', label: 'المطبخ المتكامل' },
                          { src: 'https://images.unsplash.com/photo-1507089947368-19c1da97753e', label: 'جماليات التصميم' },
                       ].map((img, i) => (
                          <div key={i} className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm group relative border border-[#EAE4D9]">
                             <img src={`${img.src}?auto=format&fit=crop&q=80&w=400`} alt={img.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                                <span className="text-white text-[10px] font-bold">{img.label}</span>
                             </div>
                             <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-sm border border-gray-100">
                                {i+1}
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="bg-[#2A2723] p-7 rounded-3xl text-white relative overflow-hidden transition-all duration-500">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10" />
                       <div className="relative z-10 text-xs leading-relaxed">
                          <p className="font-bold text-[#C1A68D] mb-3 text-sm flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-[#C1A68D]"></span>
                             مميزات استوديو رقم {selectedStudio}:
                          </p>
                          <div className="grid grid-cols-2 gap-y-3 opacity-90">
                             <p>• {selectedStudio % 2 === 0 ? "إطلالة بانورامية" : "تصميم عصري هادئ"}</p>
                             <p>• {selectedStudio < 5 ? "سرير كينج سايز" : "2 سرير فردي فخم"}</p>
                             <p>• نظام دخول ذكي (Smart Lock)</p>
                             <p>• تكييف مركزي منفصل</p>
                             <p>• إنترنت فايبر (600 Mbps)</p>
                             <p>• مكنسة وشاشة سمارت</p>
                          </div>
                       </div>
                    </div>
                    
                    <style jsx global>{`
                       .no-scrollbar::-webkit-scrollbar { display: none; }
                       .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                 </div>
              </div>
           </div>
         )}
      </div>
    </main>
  );
}
