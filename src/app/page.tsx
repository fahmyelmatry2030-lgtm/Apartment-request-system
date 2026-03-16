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

      {/* Footer Placeholder */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-gray text-sm">
        <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لـ <span className="text-gold">مجمع النخبة السكني</span></p>
      </footer>
    </main>
  );
}
