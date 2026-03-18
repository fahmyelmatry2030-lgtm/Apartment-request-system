'use client';

import React from 'react';
import Link from 'next/link';

export default function RulesPage() {
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
          <Link href="/mazar/rules" className="text-[#C1A68D] transition-colors">قوانين المكان</Link>
          <Link href="/mazar/how-to-book" className="hover:text-[#2A2723] transition-colors">طريقة الحجز</Link>
        </div>

        <Link href="/mazar/book" className="bg-[#2A2723] text-white text-sm font-bold px-8 py-2.5 rounded-full hover:bg-[#3E3A35] hover:shadow-lg transition-all">
          تجربة الحجز
        </Link>
      </nav>

      {/* Header */}
      <section className="pt-24 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-[#2A2723] mb-4">قوانين الإقامة في مزار</h1>
        <p className="text-lg text-[#7A7061] max-w-2xl mx-auto">نرجو من ضيوفنا الكرام الالتزام بهذه القوانين لضمان إقامة مريحة وآمنة للجميع.</p>
      </section>

      {/* Rules content */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-[#EAE4D9] shadow-sm">
                <h3 className="text-xl font-bold text-[#2A2723] mb-4 flex items-center gap-2">🕒 مواعيد الوصول والمغادرة</h3>
                <ul className="list-disc list-inside text-[#5C554B] space-y-2">
                    <li>وقت الوصول (Check-in) يبدأ من الساعة 2:00 ظهراً.</li>
                    <li>وقت المغادرة (Check-out) بحد أقصى الساعة 12:00 ظهراً.</li>
                    <li>يتم احتساب رسوم إضافية في حالة التأخير في المغادرة بدون تنسيق مسبق.</li>
                </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EAE4D9] shadow-sm">
                <h3 className="text-xl font-bold text-[#2A2723] mb-4 flex items-center gap-2">👨‍👩‍👧‍👦 سياسة الزوار والضيوف</h3>
                <ul className="list-disc list-inside text-[#5C554B] space-y-2">
                    <li>يُسمح بتواجد الزوار في الاستوديو حتى الساعة 10:00 مساءً فقط.</li>
                    <li>يمنع منعاً باتاً استضافة أي شخص غير مسجل في الحجز للمبيت.</li>
                    <li>يجب تقديم بطاقة الهوية لجميع المقيمين عند تسجيل الدخول.</li>
                </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EAE4D9] shadow-sm">
                <h3 className="text-xl font-bold text-[#2A2723] mb-4 flex items-center gap-2">🚫 الممنوعات</h3>
                <ul className="list-disc list-inside text-[#5C554B] space-y-2">
                    <li>يمنع التدخين تماماً داخل الاستوديوهات (التدخين مسموح في البلكونات والأماكن المخصصة فقط).</li>
                    <li>يمنع اصطحاب الحيوانات الأليفة.</li>
                    <li>يمنع إقامة الحفلات أو التجمعات المزعجة احتراماً لراحة باقي النزلاء.</li>
                    <li>يمنع إلقاء أي مواد صلبة في دورات المياه للحفاظ على السباكة.</li>
                </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EAE4D9] shadow-sm">
                <h3 className="text-xl font-bold text-[#2A2723] mb-4 flex items-center gap-2">🔑 الدخول الذكي والأمان</h3>
                <ul className="list-disc list-inside text-[#5C554B] space-y-2">
                    <li>سيتم إرسال رمز الدخول الذكي (Smart Lock Code) قبل وصولك بساعتين.</li>
                    <li>الرمز شخصي ويمنع مشاركته مع أي شخص غير مصرح له بالدخول.</li>
                    <li>المكان مراقب بالكاميرات من الخارج وفي الممرات لضمان أمنكم على مدار 24 ساعة.</li>
                </ul>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 mt-20 text-center text-[#5C554B] border-t border-[#EAE4D9] bg-white">
         <p className="text-sm opacity-80">جميع الحقوق محفوظة © 2026 لمشروع مزار.</p>
      </footer>
    </main>
  );
}
