import initialTranslations from '../data/translations.json';

export type Language = 'ar' | 'en';

export const translations = initialTranslations as typeof initialTranslations;

export type TranslationType = typeof translations.ar;