import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navbar Placeholder */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-gold/20 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-gradient">مجمع النخبة</Link>
        <div className="hidden md:flex gap-8 font-bold text-sm">
          <Link href="/about" className="hover:text-gold transition-colors">عن المكان</Link>
          <Link href="/rules" className="hover:text-gold transition-colors">قوانين المكان</Link>
          <Link href="/how-to" className="hover:text-gold transition-colors">طريقة الحجز</Link>
          <Link href="/booking" className="btn-gold !py-2 !px-6 text-xs">احجز الآن</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center overflow-hidden min-h-[90vh]">
        {/* Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl">
          <span className="inline-block px-4 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold mb-6 tracking-widest uppercase">
            تجربة فندقية استثنائية
          </span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
            أناقة السكن و <br />
            <span className="text-gradient">راحة المتعة</span>
          </h1>
          <p className="text-gray text-lg md:text-xl max-w-2xl mx-auto mb-12">
            اكتشف مجموعة من أرقى الشقق المفروشة بتصاميم عصرية ومواقع استراتيجية. نوفر لك الأمان، الخصوصية، والرفاهية التي تستحقها.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-gold">
              ابدأ الحجز الآن
            </Link>
            <Link href="#about" className="btn-outline">
              اكتشف المزيد
            </Link>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 relative z-10 w-full max-w-5xl">
          {[
            { label: 'شقق فاخرة', value: '10+' },
            { label: 'عملاء سعداء', value: '500+' },
            { label: 'تقييم النزلاء', value: '4.9/5' },
            { label: 'ساعات الدعم', value: '24/7' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-gradient">{stat.value}</div>
              <div className="text-gray text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="glass-card !p-2 aspect-video overflow-hidden rounded-3xl relative group">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
               <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-navy text-2xl animate-pulse cursor-pointer">
                 ▶
               </div>
            </div>
            <img 
               src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop" 
               alt="Apartment Interior" 
               className="w-full h-full object-cover"
            />
          </div>
          
          <div>
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              لماذا تختار <span className="text-gold">مجمع النخبة</span>؟
            </h2>
            <p className="text-gray mb-8 leading-loose">
              نحن نؤمن أن المسكن ليس مجرد مكان للنوم، بل هو تجربة متكاملة. لذا حرصنا على تجهيز كل شقة بأحدث الأجهزة الذكية، وأرقى أنواع الأثاث، مع خدمات تنظيف وصيانة دورية لضمان راحتك التامة.
            </p>
            <ul className="space-y-4">
              {[
                'مواقع حيوية وقريبة من الخدمات',
                'نظام أمني متطور وكاميرات مراقبة 24/7',
                'إنترنت فائق السرعة وخدمات ترفيهية',
                'إجراءات حجز ذكية وسريعة',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs">
                    ✓
                  </div>
                  <span className="font-bold">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Apartments Section */}
      <section id="apartments" className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-gold font-bold text-xs tracking-widest uppercase mb-4 block">إقامات فاخرة</span>
              <h2 className="text-4xl md:text-5xl font-black">شققنا <span className="text-gradient">المختارة</span></h2>
            </div>
            <Link href="/booking" className="text-gold font-bold flex items-center gap-2 hover:gap-4 transition-all">
              عرض كل الشقق <span>→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'جناح ملكي عصري', price: 2500, img: '/apartments/apt1.png', tags: ['غرفتين', 'إطلالة مدينة'] },
              { name: 'شقة كلاسيكية فاخرة', price: 1800, img: '/apartments/apt2.png', tags: ['غرفتين', 'ديكور كلاسيك'] },
              { name: 'بنتهاوس بانورامي', price: 3500, img: '/apartments/apt4.png', tags: ['3 غرف', 'مسبح خاص'] },
            ].map((apt, i) => (
              <div key={i} className="glass-card !p-0 rounded-[2.5rem] group hover:-translate-y-2 transition-all duration-500">
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden m-2">
                  <img 
                    src={apt.img} 
                    alt={apt.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 right-4 left-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      {apt.tags.map((tag, j) => (
                        <span key={j} className="backdrop-blur-xl bg-black/40 text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/10 uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black mb-2">{apt.name}</h3>
                      <div className="flex items-center gap-1 text-gold">
                        <span className="text-sm">★★★★★</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-black text-white">{apt.price}</div>
                      <div className="text-[10px] text-gray uppercase tracking-widest">ج.م / ليلة</div>
                    </div>
                  </div>
                  
                  <Link href="/booking" className="w-full py-4 rounded-2xl border border-white/10 flex items-center justify-center font-bold text-sm bg-white/5 hover:bg-gold hover:text-navy hover:border-gold transition-all group">
                    احجز الآن <span className="mr-2 group-hover:mr-4 transition-all">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Placeholder */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-gray text-sm">
        <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لـ <span className="text-gold">مجمع النخبة السكني</span></p>
      </footer>
    </main>
  );
}
