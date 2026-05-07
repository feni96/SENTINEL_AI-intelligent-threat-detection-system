import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';

import LanguageDetector from 'i18next-browser-languagedetector';



i18n

  .use(Backend)

  .use(LanguageDetector)

  .use(initReactI18next)

  .init({

    fallbackLng: 'en',

    supportedLngs: ['en', 'am', 'om', 'so'],

    nonExplicitSupportedLngs: true,

    debug: process.env.NODE_ENV === 'development',

    interpolation: {

      escapeValue: false,

    },

    backend: {

      loadPath: '/public/locales/{{lng}}/translation.json',

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

    },

    returnNull: false,

    returnEmptyString: false,

    missingKeyHandler: (lng, ns, key) => {

      if (process.env.NODE_ENV === 'development') {

        console.warn(`Missing translation key: ${key} for language: ${lng}`);

      }

    },

    saveMissing: process.env.NODE_ENV === 'development',

  });



export default i18n;