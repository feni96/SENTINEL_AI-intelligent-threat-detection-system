import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'am', 'om', 'so'],
    nonExplicitSupportedLngs: true,
    debug: isDevelopment,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
      requestOptions: {
        cache: 'no-cache',
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true,
      load: 'languageOnly',
    },
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
    returnNull: false,
    returnEmptyString: false,
    missingKeyHandler: (lng, ns, key) => {
      if (isDevelopment) {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },
    saveMissing: isDevelopment,
    // Add timeout to prevent hanging
    load: 'languageOnly',
    preload: ['en'],
    // Ensure initialization completes even if translations fail
    initImmediate: false,
  })
  .catch((error) => {
    console.error('i18n initialization error:', error);
  });

export default i18n;