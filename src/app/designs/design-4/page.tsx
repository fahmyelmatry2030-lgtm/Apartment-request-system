'use client';

import Link from 'next/link';
import DesignSwitcher from '@/components/DesignSwitcher';

export default function DesignFour() {
   return (
      <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
         <DesignSwitcher />

         {/* Grid Background */}
         <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
         <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#1a1a2e,transparent)]" />

         {/* Navbar */}
         <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg animate-pulse" />
               <Link href="/" className="text-xl font-black tracking-tighter">ELITE<span className="text-cyan-400 text-sm font-normal">.OS</span></Link>
            </div>
            <div className="hidden md:flex gap-8 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
               <Link href="#" className="hover:text-cyan-400 transition-all">SYSTEM_OVERVIEW</Link>
               <Link href="#" className="hover:text-cyan-400 transition-all">UNITS_DATA</Link>
               <Link href="#" className="hover:text-cyan-400 transition-all">SUPPORT_LINK</Link>
            </div>
            <button className="relative group px-6 py-2 bg-white/5 border border-white/10 rounded-md overflow-hidden transition-all">
               <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
               <span className="relative z-10 text-[10px] font-bold tracking-widest uppercase">INITIALIZE_BOOKING</span>
            </button>
         </nav>

         {/* Hero */}
         <section className="relative pt-44 pb-32 px-6 flex flex-col items-center justify-center text-center">
            <div className="mb-12 inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
               <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
               <span className="text-[10px] font-bold tracking-widest text-[#00e5ff] uppercase">SYSTEMS ONLINE // v.2.0.26</span>
            </div>

            <h1 className="text-6xl md:text-[10rem] font-black leading-[0.8] tracking-tighter mb-16">
               <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">سكـن</span> <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-600">المستـقبـل</span>
            </h1>

            <p className="max-w-2xl mx-auto text-gray-500 leading-relaxed text-sm md:text-base uppercase tracking-widest mb-16">
               نستخدم أحدث تقنيات الأنظمة الذكية لتوفير تجربة سكنية غير مسبوقة. تفاعل مع منزلك كما لم تفعل من قبل.
            </p>

            <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl relative">
               {[
                  { label: 'Smart Control', val: '99%' },
                  { label: 'Uptime', val: '24/7' },
                  { label: 'Latency', val: '< 10ms' },
               ].map((stat, i) => (
                  <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl group hover:border-cyan-500/50 transition-all duration-500">
                     <div className="text-4xl font-black text-white mb-2 group-hover:text-cyan-400">{stat.val}</div>
                     <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</div>
                  </div>
               ))}
            </div>
         </section>

         {/* Data Visualization */}
         <section className="py-32 px-6 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
               <div className="p-1 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-white/10 aspect-square flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#00e5ff_0%,transparent_50%)] opacity-10 animate-spin-slow" />
                  <img src="https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop" className="w-4/5 h-4/5 object-cover rounded-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700" />
               </div>

               <div className="space-y-12">
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">تجربة <span className="text-cyan-400 italic">مُشفـرة</span> بالفخامة</h2>
                  <div className="space-y-6">
                     {[
                        'هوية رقمية لكل مستخدم للحجز وخدمات النظافة.',
                        'نظام مراقبة ذكي يعتمد على الذكاء الاصطناعي للأمان.',
                        'تحكم صوتي وحركي في جميع مرافق الشقة الذكية.',
                        'خدمة إنترنت فضائي فائق السرعة مدمج في كل الوحدات.'
                     ].map((text, i) => (
                        <div key={i} className="flex gap-4 items-center group">
                           <div className="w-10 h-[1px] bg-white/20 group-hover:bg-cyan-500 group-hover:w-16 transition-all" />
                           <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-all">{text}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         <footer className="py-20 text-center border-t border-white/5">
            <div className="text-[10px] tracking-[1em] text-cyan-900 mb-4 font-black">END_OF_LINE</div>
            <p className="text-[10px] font-bold text-gray-600 uppercase">System Copyright © 2026 ELITE_NOKBA</p>
         </footer>

         <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
      </main>
   );
}
