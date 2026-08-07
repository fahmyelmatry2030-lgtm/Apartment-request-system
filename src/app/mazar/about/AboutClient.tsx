'use client';
import React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';

export default function AboutClient() {
   const { t, isRTL } = useLanguage();
   const [isMounted, setIsMounted] = React.useState(false);

   React.useEffect(() => {
      setIsMounted(true);
   }, []);

   // Prevent hydration mismatch by returning a neutral state on server
   if (!isMounted) {
      return <main className="min-h-screen bg-[#FDFBF7] opacity-0" />;
   }


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
               <Link href="/mazar/about" className="text-[#C1A68D] transition-colors">{t.common.about}</Link>
               <Link href="/mazar/rules" className="hover:text-[#2A2723] transition-colors">{t.common.rules}</Link>
               <Link href="/mazar/how-to-book" className="hover:text-[#2A2723] transition-colors">{t.common.howToBook}</Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
               <LanguageSwitcher />
               <Link href="/mazar/book" className="hidden xs:inline-flex bg-[#2A2723] text-white text-[10px] md:text-sm font-bold px-4 md:px-8 py-2 md:py-2.5 rounded-full hover:bg-[#3E3A35] transition-all">
                  {t.common.bookNow}
               </Link>
            </div>
         </nav>

         {/* Professional Minimalist Header */}
         <section className="pt-16 md:pt-24 pb-12 md:pb-16 px-6 text-center flex flex-col items-center">
            <div className="mb-8 md:mb-12">
               <NextImage
                  src={isRTL
                     ? '/images/WhatsApp_Image_2026-03-18_-removebg-preview.png'
                     : '/images/WhatsApp_Image_2026-03-18_at_2.02.10_PM-removebg-preview.png'
                  }
                  alt="Mazar Logo"
                  width={isRTL ? 320 : 380}
                  height={250}
                  className="object-contain"
                  priority
               />
            </div>
            <h1 className="text-3xl md:text-7xl font-black text-[#2A2723] mb-4 md:mb-6 tracking-tighter max-w-4xl leading-[1.1]">
               {t.aboutPage.title}
            </h1>
            <p className="text-base md:text-xl text-[#7A7061] max-w-2xl mx-auto font-bold opacity-80">
               {t.aboutPage.subtitle}
            </p>
         </section>

         {/* Premium Split Story Section */}
         <section className="py-16 md:py-24 bg-white border-y border-[#EAE4D9]/50">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
               {/* Column 1: Text Content */}
               <div className={`${isRTL ? 'lg:order-2 text-right' : 'lg:order-1 text-left'} space-y-6 md:space-y-8`}>
                  <div className={`w-12 md:w-16 h-1.5 bg-[#C1A68D] rounded-full ${isRTL ? 'ml-auto' : ''}`} />
                  {isRTL ? (
                     <div className="space-y-6">
                        <p className="text-2xl md:text-4xl text-[#2A2723] leading-tight font-black">
                           مزار هو مفهوم جديد للإقامة الفندقية في مدينة نصر، يجمع بين راحة المنزل وجودة خدمات الفنادق في تجربة إقامة عصرية تناسب الزوار من داخل مصر وخارجها.
                        </p>
                        <p className="text-lg md:text-xl text-[#5C554B] leading-relaxed font-bold opacity-80">
                           نوفر استوديوهات وشققًا فندقية مجهزة بالكامل، بتصميم حديث، ومستوى عالٍ من النظافة، مع فريق دعم واستقبال متاح على مدار الساعة لضمان تجربة مريحة من لحظة الحجز وحتى تسجيل المغادرة.
                        </p>
                        <p className="text-lg md:text-xl text-[#5C554B] leading-relaxed font-bold opacity-80">
                           في مزار، نهتم بكل التفاصيل التي تجعل إقامتك أكثر راحة، بدايةً من الإنترنت فائق السرعة والمطابخ المجهزة، مرورًا بخدمات التنظيف الدورية، وصولًا إلى أنظمة الدخول الذكية التي توفر أعلى مستويات الأمان والخصوصية.
                        </p>
                        <p className="text-lg md:text-xl text-[#5C554B] leading-relaxed font-bold opacity-80">
                           نؤمن أن الإقامة المميزة لا تعتمد فقط على المكان، بل على جودة الخدمة وسهولة التعامل والاهتمام الحقيقي براحة الضيف. لذلك نسعى دائمًا لتقديم تجربة احترافية تليق بثقة عملائنا، سواء كانت زيارتهم للعلاج، أو العمل، أو الدراسة، أو السياحة.
                        </p>
                        <p className="text-xl md:text-2xl text-[#C1A68D] leading-relaxed font-black mt-8 italic">
                           مزار... حيث تلتقي الراحة، والخصوصية، والخدمة الفندقية في مكان واحد.
                        </p>
                     </div>
                  ) : (
                     <>
                        <p className="text-2xl md:text-5xl text-[#2A2723] leading-tight font-black">
                           {t.aboutPage.description1}
                        </p>
                        <p className="text-lg md:text-2xl text-[#5C554B] leading-relaxed font-bold opacity-70 italic">
                           {t.aboutPage.description2 || 'We strive to provide an authentic stay experience...'}
                        </p>
                     </>
                  )}
               </div>

               {/* Column 2: Featured Image Box */}
               <div className={`${isRTL ? 'lg:order-1' : 'lg:order-2'} relative h-[300px] md:h-[650px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl group`}>
                  <NextImage
                     src="/images/Mazar 1 Pictures/WhatsApp Image 2025-12-15 at 12.39.39_9b4da674.jpg"
                     alt="Luxury Studio Interior"
                     fill
                     className="object-cover group-hover:scale-105 transition-transform duration-[2s]"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-black/70 to-transparent">
                     <p className="text-white font-bold text-base md:text-lg">{isRTL ? 'أناقة التفاصيل' : 'Elegant details'}</p>
                  </div>
               </div>
            </div>
         </section>

         {/* Refined Features Section */}
         <section className="py-16 md:py-32 max-w-screen-2xl mx-auto px-6">
            <div className="flex flex-col items-center mb-12 md:mb-20">
               <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#C1A68D] mb-4">
                  {t.aboutPage.whatWeOffer}
               </h2>
               <div className="w-10 md:w-12 h-1 bg-[#2A2723] rounded-full" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
               {[
                  { icon: '❄️', title: t.aboutPage.features.ac, desc: t.aboutPage.features.acDesc },
                  { icon: '🍳', title: t.aboutPage.features.kitchen, desc: t.aboutPage.features.kitchenDesc },
                  { icon: '📶', title: t.aboutPage.features.wifi, desc: t.aboutPage.features.wifiDesc },
                  { icon: '🧹', title: t.aboutPage.features.clean, desc: t.aboutPage.features.cleanDesc },
                  { icon: '🔐', title: t.aboutPage.features.smart, desc: t.aboutPage.features.smartDesc },
                  { icon: '🎥', title: t.aboutPage.features.security, desc: t.aboutPage.features.securityDesc },
                  { icon: '☕', title: t.aboutPage.features.coffee, desc: t.aboutPage.features.coffeeDesc },
                  { icon: '✨', title: t.aboutPage.features.hotel, desc: t.aboutPage.features.hotelDesc },
               ].map((feature, i) => (
                  <div key={i} className={`bg-white p-8 md:p-12 rounded-3xl border border-[#EAE4D9]/60 hover:border-[#C1A68D] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ${isRTL ? 'text-right' : 'text-left'} group`}>
                     <div className="w-14 h-14 md:w-20 md:h-20 bg-[#FDFBF7] rounded-2xl flex items-center justify-center text-2xl md:text-4xl mb-6 md:mb-8 group-hover:bg-[#C1A68D]/10 transition-colors shadow-sm">
                        {feature.icon}
                     </div>
                     <h3 className="text-lg md:text-2xl font-black text-[#2A2723] mb-3 md:mb-4">{feature.title}</h3>
                     <p className="text-xs md:text-base text-[#7A7061] leading-relaxed font-bold opacity-80">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </section>

         {/* Minimalist Goal Section */}
         <section className="py-20 md:py-32 relative overflow-hidden bg-[#1A1816] text-white">
            <div className="max-w-4xl mx-auto px-6 text-center">
               <span className="inline-block text-[#C1A68D] text-3xl md:text-4xl mb-6 md:mb-8">🎯</span>
               <h2 className="text-2xl md:text-5xl font-black mb-8 md:mb-10 tracking-tight leading-tight">
                  {t.aboutPage.ourGoal}
               </h2>
               <p className="text-lg md:text-3xl leading-relaxed text-white/70 font-bold italic">
                  {t.aboutPage.goalDesc}
               </p>
            </div>
         </section>

         <Footer />
      </main>
   );
}
