import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';
import de from './locales/de.json';

const getSavedLang = (): string => {
  try {
    return localStorage.getItem('focusos-language') || 'en';
  } catch {
    return 'en';
  }
};

const savedLang = getSavedLang();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    de: { translation: de },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Apply RTL direction on init and language change
const applyDirection = (lang: string) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
};

applyDirection(savedLang);

i18n.on('languageChanged', (lang: string) => {
  try {
    localStorage.setItem('focusos-language', lang);
  } catch {
    // Storage not available, ignore
  }
  applyDirection(lang);
});

export default i18n;
