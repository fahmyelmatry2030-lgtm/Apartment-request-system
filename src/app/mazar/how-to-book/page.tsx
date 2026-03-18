'use client';

import React from 'react';
import Link from 'next/link';

export default function HowToBookPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D] selection:text-white overflow-x-hidden relative" style={{ fontFamily: 'Calibri, sans-serif' }}>
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#EAE4D9]/40 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#D5C5B3]/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full px-8 py-5 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-[#EAE4D9]">
        <Link href="/mazar" className="text-3xl font-bold tracking-tight text-[#2A2723] flex items-center gap-2">
            مزار 
            <span className="w-2 h-2 rounded-full bg-[#C1A68D]"></span>
        </Link>
        
        <div className="hidden md:flex gap-10 text-sm font-bold text-[#5C554B]">
          <Link href="/mazar/about" className="hover:text-[#2A2723] transition-colors">عن المكان</Link>
          <Link href="/mazar/rules" className="hover:text-[#2A2723] transition-colors">قوانين المكان</Link>
          <Link href="/mazar/how-to-book" className="text-[#C1A68D] transition-colors">طريقة الحجز</Link>
        </div>

        <Link href="/mazar/book" className="bg-[#2A2723] text-white text-sm font-bold px-8 py-2.5 rounded-full hover:bg-[#3E3A35] hover:shadow-lg transition-all">
          تجربة الحجز
        </Link>
      </nav>

      {/* Header */}
      <section className="pt-24 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-[#2A2723] mb-4">طريقة الحجز والدفع</h1>
        <p className="text-lg text-[#7A7061] max-w-2xl mx-auto">خطوات بسيطة وسريعة لتأكيد إقامتك معنا في مزار.</p>
      </section>

      {/* Steps Content */}
      <section className="py-16 max-w-4xl mx-auto px-6 relative z-10">
         <div className="space-y-6">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl border border-[#EAE4D9] shadow-sm flex items-start gap-6 relative">
                <div className="w-16 h-16 shrink-0 rounded-full bg-[#F7F5F0] border border-[#EAE4D9] flex items-center justify-center text-2xl font-bold text-[#C1A68D]">1</div>
                <div>
                    <h3 className="text-2xl font-bold text-[#2A2723] mb-2">اختر التواريخ المناسبة</h3>
                    <p className="text-[#5C554B] leading-relaxed">ادخل على صفحة "تجربة الحجز"، وحدد تاريخ الوصول والمغادرة. سيعرض لك النظام فوراً عدد الشقق المتاحة لدينا في هذه الفترة بتحديث فوري.</p>
                </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl border border-[#EAE4D9] shadow-sm flex items-start gap-6 relative">
                <div className="w-16 h-16 shrink-0 rounded-full bg-[#F7F5F0] border border-[#EAE4D9] flex items-center justify-center text-2xl font-bold text-[#C1A68D]">2</div>
                <div>
                    <h3 className="text-2xl font-bold text-[#2A2723] mb-2">سجل بياناتك ومراجعة الطلب</h3>
                    <p className="text-[#5C554B] leading-relaxed">قم بتعبئة نموذج الحجز ببياناتك (الاسم، رقم الهاتف، الإيميل). سيتم إرسال "طلب حجز مبدئي" إلى إدارة مزار لمراجعته خلال دقائق.</p>
                </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl border border-[#EAE4D9] shadow-sm flex items-start gap-6 relative">
                <div className="w-16 h-16 shrink-0 rounded-full bg-[#F7F5F0] border border-[#EAE4D9] flex items-center justify-center text-2xl font-bold text-[#C1A68D]">3</div>
                <div>
                    <h3 className="text-2xl font-bold text-[#2A2723] mb-2">الموافقة والدفع (InstaPay / Vodafone Cash)</h3>
                    <p className="text-[#5C554B] leading-relaxed">بمجرد موافقة الإدارة على طلبك، ستصلك رسالة تحتوي على الموافقة، بالإضافة إلى أرقام تحويل قيمة الإقامة عبر (انستاباي - InstaPay) أو (فودافون كاش - Vodafone Cash). يرجى تحويل المبلغ خلال الوقت المحدد لضمان حجزك.</p>
                </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-8 rounded-2xl border border-[#EAE4D9] shadow-sm flex items-start gap-6 relative">
                <div className="w-16 h-16 shrink-0 rounded-full bg-[#F7F5F0] border border-[#EAE4D9] flex items-center justify-center text-2xl font-bold text-[#C1A68D]">4</div>
                <div>
                    <h3 className="text-2xl font-bold text-[#2A2723] mb-2">التأكيد وإرسال الرمز السري</h3>
                    <p className="text-[#5C554B] leading-relaxed">بعد تأكيد استلام التحويل المالي، سيتم إرسال رسالة الترحيب ورقم الاستوديو الخاص بك، بالإضافة إلى الرمز السري (Smart Lock) لفتح باب الشقة قبل موعد الوصول.</p>
                </div>
            </div>

         </div>

         <div className="mt-16 text-center">
            <Link href="/mazar/book" className="inline-block bg-[#2A2723] text-white text-lg font-bold px-12 py-4 rounded-full hover:bg-[#3E3A35] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                ابدأ رحلة الحجز الآن
            </Link>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 mt-20 text-center text-[#5C554B] border-t border-[#EAE4D9] bg-white">
         <p className="text-sm opacity-80">جميع الحقوق محفوظة © 2026 لمشروع مزار.</p>
      </footer>
    </main>
  );
}
