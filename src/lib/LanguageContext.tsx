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

function deepMerge(target: any, source: any): any {
  if (!source) return target;
  if (!target) return source;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

export function LanguageProvider({ 
  children, 
  initialTranslations 
}: { 
  children: React.ReactNode;
  initialTranslations?: typeof fallbackTranslations;
}) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [dynamicTranslations, setDynamicTranslations] = useState(() => {
    return deepMerge(fallbackTranslations, initialTranslations);
  });

  useEffect(() => {
    if (initialTranslations) {
      setDynamicTranslations(deepMerge(fallbackTranslations, initialTranslations));
    }
  }, [initialTranslations]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mazar-lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
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

  const t = dynamicTranslations[language] || fallbackTranslations[language];
  const media = dynamicTranslations.media || fallbackTranslations.media;
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

