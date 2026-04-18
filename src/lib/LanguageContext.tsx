'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations as fallbackTranslations, TranslationType } from './translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
  media: typeof fallbackTranslations.media;
  isRTL: boolean;
};

const defaultContextValue: LanguageContextType = {
  language: 'ar',
  setLanguage: () => {},
  t: fallbackTranslations['ar'] as any,
  isRTL: true,
  media: fallbackTranslations.media
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export function LanguageProvider({ 
  children, 
  initialTranslations 
}: { 
  children: React.ReactNode;
  initialTranslations?: typeof fallbackTranslations;
}) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [dynamicTranslations, setDynamicTranslations] = useState(initialTranslations || fallbackTranslations);

  useEffect(() => {
    if (initialTranslations) {
      setDynamicTranslations(initialTranslations);
    }
  }, [initialTranslations]);

  useEffect(() => {
    const savedLang = localStorage.getItem('mazar-lang') as Language;
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    
    if (isAdminRoute) {
      setLanguageState('ar');
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    } else if (savedLang) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  }, []);

  // Listen to path changes within the app to keep admin in Arabic
  useEffect(() => {
    if (typeof window !== 'undefined') {
       const isAdminRoute = window.location.pathname.startsWith('/admin');
       if (isAdminRoute && language !== 'ar') {
          setLanguage('ar');
       }
    }
  }, [language]);



  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mazar-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = dynamicTranslations[language];
  const media = dynamicTranslations.media;
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, media, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}


export function useLanguage() {
  const context = useContext(LanguageContext);
  return context;
}

