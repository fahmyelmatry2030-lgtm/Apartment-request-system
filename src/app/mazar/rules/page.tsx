'use client';
import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';

export default function RulesPage() {
  const { t, isRTL } = useLanguage();

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D] selection:text-white overflow-x-hidden relative">

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#EAE4D9]/40 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#D5C5B3]/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full px-4 md:px-8 py-3 md:py-5 hidden md:flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-[#EAE4D9]">
        <Link href="/" className="shrink-0">
          <Logo size={45} mdSize={54} />
        </Link>

        <div className="hidden md:flex gap-10 text-sm font-bold text-[#5C554B]">
          <Link href="/" className="hover:text-[#2A2723] transition-colors">{t.common.home}</Link>
          <Link href="/mazar/about" className="hover:text-[#2A2723] transition-colors">{t.common.about}</Link>
          <Link href="/mazar/rules" className="text-[#C1A68D] transition-colors">{t.common.rules}</Link>
          <Link href="/mazar/how-to-book" className="hover:text-[#2A2723] transition-colors">{t.common.howToBook}</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSwitcher />
          <Link href="/mazar/book" className="hidden xs:inline-flex bg-[#2A2723] text-white text-[10px] md:text-sm font-bold px-4 md:px-8 py-2 md:py-2.5 rounded-full hover:bg-[#3E3A35] transition-all">
            {t.common.bookNow}
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-16 md:pt-24 pb-12 md:pb-16 px-6 text-center">
        <h1 className="text-3xl md:text-6xl font-black text-[#2A2723] mb-4 tracking-tighter leading-tight">{t.rulesPage.title}</h1>
        <p className="text-base md:text-lg text-[#7A7061] max-w-2xl mx-auto font-bold opacity-70">{t.rulesPage.subtitle}</p>
      </section>

      {/* Rules content */}
      <section className="py-8 md:py-16 max-w-4xl mx-auto px-4 md:px-6">
        {isRTL ? (
          <div className="space-y-6 md:space-y-8">
             {/* Section 1: Welcome */}
             <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#EAE4D9]/60 shadow-sm text-right">
                <h3 className="text-xl md:text-2xl font-black text-[#2A2723] mb-4">أهلاً بك في مزار ستوديو ✨</h3>
                <p className="text-base md:text-lg text-[#5C554B] leading-relaxed font-bold opacity-80 mb-6">
                  نتمنى لك إقامة مريحة ومميزة، ويسعدنا تقديم أفضل تجربة إقامة طوال فترة وجودك معنا.
                </p>
                <h4 className="text-lg md:text-xl font-black text-[#2A2723] mb-3 flex items-center justify-end gap-2">
                  مواعيد الوصول والمغادرة 🕒
                </h4>
                <ul className="text-sm md:text-base text-[#5C554B] space-y-2 md:space-y-3 font-bold opacity-80 list-disc list-inside" dir="rtl">
                  <li>تسجيل الوصول: 2:00 ظهرًا.</li>
                  <li>تسجيل المغادرة: 12:00 ظهرًا.</li>
                </ul>
                <p className="text-sm md:text-base text-[#C1A68D] font-bold mt-4">
                  نرجو الالتزام بالمواعيد المحددة احترامًا للحجوزات القادمة.
                </p>
             </div>

             {/* Section 2: During your stay */}
             <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#EAE4D9]/60 shadow-sm text-right">
                <h3 className="text-xl md:text-2xl font-black text-[#2A2723] mb-4 flex items-center justify-end gap-2">
                  أثناء إقامتك 🏡
                </h3>
                <ul className="text-sm md:text-base text-[#5C554B] space-y-3 md:space-y-4 font-bold opacity-80 list-disc list-inside" dir="rtl">
                  <li>جميع خدمات المياه والإنترنت والهاوس كيبنج والصيانة مشمولة دون أي رسوم إضافية.</li>
                  <li>يرجى مراجعة الوحدة ومحتوياتها عند الاستلام، وبعد استلام كارت الدخول تصبح جميع المحتويات تحت مسؤوليتك.</li>
                  <li>نرجو الحفاظ على الهدوء داخل المبنى لضمان راحة جميع النزلاء.</li>
                  <li>كارت الدخول مسؤولية شخصية، وفي حالة فقدانه يتم احتساب رسوم بدل فاقد.</li>
                  <li>يمكن استلام طلبات الدليفري وتسليمها حتى باب وحدتك.</li>
                </ul>
                <p className="text-sm md:text-base text-[#C1A68D] font-black mt-6">
                  إذا احتجت أي مساعدة أو كان لديك أي استفسار، فريق مزار متواجد لخدمتك في أي وقت.
                </p>
             </div>

             {/* Section 3: Policies */}
             <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-red-100 shadow-sm text-right">
                <h3 className="text-xl md:text-2xl font-black text-red-600 mb-4 flex items-center justify-end gap-2">
                  سياسة الإقامة ⚠️
                </h3>
                <p className="text-sm md:text-base text-[#5C554B] font-bold mb-4">للحفاظ على راحة وأمان الجميع، يرجى الالتزام بالتعليمات التالية:</p>
                <ul className="text-sm md:text-base text-[#5C554B] space-y-3 md:space-y-4 font-bold opacity-80 list-disc list-inside" dir="rtl">
                  <li>يمنع استقبال أي زائر غير مسجل لدى إدارة مزار مسبقًا.</li>
                  <li>يمنع إدخال أو تناول المشروبات الكحولية أو المواد المخدرة داخل المبنى.</li>
                  <li>تحتفظ إدارة مزار بحق إنهاء الإقامة وإخلاء الوحدة فورًا في حال مخالفة هذه التعليمات.</li>
                </ul>
             </div>

             {/* Section 4: Before leaving */}
             <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-amber-100 shadow-sm text-right">
                <h3 className="text-xl md:text-2xl font-black text-amber-600 mb-4 flex items-center justify-end gap-2">
                  قبل مغادرتك ⭐
                </h3>
                <ul className="text-sm md:text-base text-[#5C554B] space-y-3 md:space-y-4 font-bold opacity-80 list-disc list-inside" dir="rtl">
                  <li>يسعدنا تقييم تجربتك معنا عبر Google Reviews، فملاحظاتك تساعدنا على التطور دائمًا.</li>
                  <li>ولا تنسَ متابعة مزار على وسائل التواصل الاجتماعي للاطلاع على أحدث العروض، واسأل فريق الاستقبال عن هديتك وفاوتشر الخصم بعد كتابة التقييم.</li>
                </ul>
                <p className="text-lg md:text-xl text-[#2A2723] font-black mt-8 text-center italic">
                  شكرًا لاختيارك مزار، ونتمنى أن نراك مجددًا قريبًا. 🌹
                </p>
             </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-8">
            <div className={`bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#EAE4D9]/60 shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-lg md:text-xl font-black text-[#2A2723] mb-4 flex items-center gap-2">
                {t.rulesPage.sections.times.title}
              </h3>
              <ul className="text-sm md:text-base text-[#5C554B] space-y-2 md:space-y-3 font-medium opacity-80">
                <li className="flex items-center gap-2">
                  <span className="text-[#C1A68D]">●</span> {t.rulesPage.sections.times.checkIn}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C1A68D]">●</span> {t.rulesPage.sections.times.checkOut}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C1A68D]">●</span> {t.rulesPage.sections.times.late}
                </li>
              </ul>
            </div>

            <div className={`bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#EAE4D9]/60 shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-lg md:text-xl font-black text-[#2A2723] mb-4 flex items-center gap-2">
                {t.rulesPage.sections.visitors.title}
              </h3>
              <ul className="text-sm md:text-base text-[#5C554B] space-y-2 md:space-y-3 font-medium opacity-80">
                <li className="flex items-center gap-2">
                  <span className="text-[#C1A68D]">●</span> {t.rulesPage.sections.visitors.limit}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C1A68D]">●</span> {t.rulesPage.sections.visitors.noSleepover}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C1A68D]">●</span> {t.rulesPage.sections.visitors.id}
                </li>
              </ul>
            </div>

            <div className={`bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#EAE4D9]/60 shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-lg md:text-xl font-black text-[#2A2723] mb-4 flex items-center gap-2">
                {t.rulesPage.sections.forbidden.title}
              </h3>
              <ul className="text-sm md:text-base text-[#5C554B] space-y-2 md:space-y-3 font-medium opacity-80">
                <li className="flex items-center gap-2">
                  <span className="text-red-400">×</span> {t.rulesPage.sections.forbidden.smoking}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">×</span> {t.rulesPage.sections.forbidden.pets}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">×</span> {t.rulesPage.sections.forbidden.parties}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">×</span> {t.rulesPage.sections.forbidden.plumbing}
                </li>
              </ul>
            </div>

            <div className={`bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[#EAE4D9]/60 shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-lg md:text-xl font-black text-[#2A2723] mb-4 flex items-center gap-2">
                {t.rulesPage.sections.security.title}
              </h3>
              <ul className="text-sm md:text-base text-[#5C554B] space-y-2 md:space-y-3 font-medium opacity-80">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {t.rulesPage.sections.security.code}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {t.rulesPage.sections.security.private}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {t.rulesPage.sections.security.cameras}
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
