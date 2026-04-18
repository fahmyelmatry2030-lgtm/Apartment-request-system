'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';
import { getStudios } from '@/lib/data-init';
import UnitCard from '@/components/UnitCard';

export default function StudiosPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [studios, setStudios] = useState<any[]>([]);

  useEffect(() => {
    const loadUnits = async () => {
      const allStudios = await getStudios();
      setStudios(allStudios);
    };
    loadUnits();
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2A2723] selection:bg-[#C1A68D] selection:text-white">
      
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex justify-between items-center max-w-screen-2xl mx-auto z-50 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-[#EAE4D9]">
        <Link href="/">
           <Logo size={42} mdSize={48} />
        </Link>
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <Link href="/mazar/units" className="text-xs font-bold text-[#7A7061] hover:text-[#2A2723]">
            {t.unitsPage.backToCategories}
          </Link>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <header className="mb-12 md:mb-16">
           <div className="mb-6">
              <button 
                onClick={() => router.push('/mazar/units')}
                className={`text-sm font-bold text-[#C1A68D] hover:opacity-80 flex items-center gap-2`}
              >
                 {isRTL ? `← ${t.unitsPage.backToCategories}` : `← ${t.unitsPage.backToCategories}`}
              </button>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-[#2A2723] mb-4 md:mb-6 leading-tight">
             {isRTL ? 'الاستوديوهات الفندقية' : 'Hotel Studios'}
           </h1>
           <p className="text-base md:text-xl text-[#5C554B] opacity-70 max-w-3xl leading-relaxed">
              {isRTL 
                ? `استعرض مجموعة متنوعة من الاستوديوهات الفندقية الفاخرة التي تناسب احتياجاتك.` 
                : `Explore a diverse selection of premium hotel studios tailored to your needs.`}
           </p>
        </header>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {studios.map((unit: any) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>

      </div>

      <Footer />
    </main>
  );
}
