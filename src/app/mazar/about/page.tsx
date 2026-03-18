'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
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
          <Link href="/mazar/about" className="text-[#C1A68D] transition-colors">عن المكان</Link>
          <Link href="/mazar/rules" className="hover:text-[#2A2723] transition-colors">قوانين المكان</Link>
          <Link href="/mazar/how-to-book" className="hover:text-[#2A2723] transition-colors">طريقة الحجز</Link>
        </div>

        <Link href="/mazar/book" className="bg-[#2A2723] text-white text-sm font-bold px-8 py-2.5 rounded-full hover:bg-[#3E3A35] hover:shadow-lg transition-all">
          تجربة الحجز
        </Link>
      </nav>

      {/* Header */}
      <section className="pt-24 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-[#2A2723] mb-4">عن مزار</h1>
        <p className="text-lg text-[#7A7061] max-w-2xl mx-auto">تعرف أكثر على فكرتنا وما يميز تجربة الإقامة لدينا.</p>
      </section>

      {/* About Section */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xl text-[#5C554B] leading-loose">
               <span className="text-[#C1A68D] font-bold">مزار</span>، مجمع ستوديوهات فندقية راقية في قلب مدينة نصر، صممنا المكان ليجمع بين راحة البيت وفخامة الإقامة الفندقية. بنقدم تجربة إقامة متكاملة تناسب الباحثين عن الخصوصية، الراحة، والخدمة عالية المستوى.
            </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 max-w-screen-xl mx-auto px-6">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2A2723] mb-4 flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-[#C1A68D]/50"></span>
              ماذا نقدّم
              <span className="w-12 h-px bg-[#C1A68D]/50"></span>
            </h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
               { icon: '❄️', title: 'ستوديوهات مكيفة', desc: 'تكييف بالكامل لتضمن راحتك.' },
               { icon: '🍳', title: 'مطبخ مجهز', desc: 'بجميع الأجهزة الأساسية.' },
               { icon: '📶', title: 'إنترنت سريع', desc: 'واي فاي فائق السرعة مجاناً.' },
               { icon: '🧹', title: 'خدمة نظافة', desc: 'متوفرة على مدار 24 ساعة.' },
               { icon: '🔐', title: 'دخول ذكي', desc: 'نظام إلكتروني بدون مفاتيح.' },
               { icon: '🎥', title: 'أمان تام', desc: 'كاميرات وحراسة 24 ساعة.' },
               { icon: '☕', title: 'كوفي كورنر', desc: 'مشروبات مجانية طوال اليوم.' },
               { icon: '✨', title: 'خدمة فندقية', desc: 'ريسبشن لخدمتك في أي وقت.' },
            ].map((feature, i) => (
               <div key={i} className="bg-white p-8 rounded-2xl border border-[#EAE4D9] shadow-sm hover:shadow-md hover:border-[#C1A68D]/50 transition-all text-right group">
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-right">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-[#2A2723] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#5C554B] leading-relaxed">{feature.desc}</p>
               </div>
            ))}
         </div>
      </section>

      {/* Goal Section */}
      <section className="py-24 relative overflow-hidden bg-[#2A2723] text-white">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-8">🎯 هدفنا</h2>
            <p className="text-2xl leading-relaxed text-[#EAE4D9] font-light">
               هدفنا في مزار هو تقديم تجربة إقامة مختلفة في مصر، تعتمد على <span className="text-[#C1A68D] font-bold">الجودة، الراحة، والثقة</span>. بنسعى إن كل عميل يخرج من عندنا وهو حابب يرجع تاني، ويكون هو نفسه سبب في ترشيحنا لغيره.
            </p>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-[#5C554B] border-t border-[#EAE4D9] bg-white">
         <p className="text-sm opacity-80">جميع الحقوق محفوظة © 2026 لمشروع مزار.</p>
      </footer>
    </main>
  );
}
