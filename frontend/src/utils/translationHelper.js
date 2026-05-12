import i18n from '../i18n';

/**
 * Translation Helper Utilities
 * Provides missing key detection, fallback mechanisms, and translation validation
 */

const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;

// Store missing keys for reporting
const missingKeys = new Set();
const fallbackKeys = new Map();

/**
 * Get translation with fallback mechanism
 * @param {string} key - Translation key
 * @param {object} options - i18next options
 * @returns {string} Translated text or fallback
 */
export const t = (key, options = {}) => {
  const currentLang = i18n.language;
  const translation = i18n.t(key, { ...options, returnNull: false });
  
  // Check if translation is missing or equals the key
  if (!translation || translation === key) {
    missingKeys.add(`${currentLang}:${key}`);
    
    // Try fallback to English
    if (currentLang !== 'en') {
      const fallback = i18n.t(key, { ...options, lng: 'en', returnNull: false });
      if (fallback && fallback !== key) {
        fallbackKeys.set(key, fallback);
        return fallback;
      }
    }
    
    // Return key with language indicator
    return `[${currentLang.toUpperCase()}] ${key}`;
  }
  
  return translation;
};

/**
 * Get all missing keys for current language
 * @returns {Array} Array of missing keys
 */
export const getMissingKeys = () => {
  return Array.from(missingKeys);
};

/**
 * Get all fallback keys used
 * @returns {Map} Map of fallback keys
 */
export const getFallbackKeys = () => {
  return new Map(fallbackKeys);
};

/**
 * Clear missing keys cache
 */
export const clearMissingKeys = () => {
  missingKeys.clear();
  fallbackKeys.clear();
};

/**
 * Get translation completion percentage for a language
 * @param {string} language - Language code
 * @returns {Promise<number>} Completion percentage
 */
export const getTranslationCompletion = async (language) => {
  try {
    const response = await fetch(`/locales/${language}/translation.json`);
    const translations = await response.json();
    
    const englishResponse = await fetch('/locales/en/translation.json');
    const englishTranslations = await englishResponse.json();
    
    const totalKeys = Object.keys(englishTranslations).length;
    const translatedKeys = Object.keys(translations).length;
    
    return Math.round((translatedKeys / totalKeys) * 100);
  } catch (error) {
    console.error('Error calculating translation completion:', error);
    return 0;
  }
};

/**
 * Get translation status for all languages
 * @returns {Promise<object>} Translation status for all languages
 */
export const getTranslationStatus = async () => {
  const languages = ['en', 'am', 'om'];
  const status = {};
  
  for (const lang of languages) {
    status[lang] = await getTranslationCompletion(lang);
  }
  
  return status;
};

/**
 * Validate translation structure
 * @param {string} language - Language code
 * @returns {Promise<object>} Validation result
 */
export const validateTranslationStructure = async (language) => {
  try {
    const response = await fetch(`/locales/${language}/translation.json`);
    const translations = await response.json();
    
    const englishResponse = await fetch('/locales/en/translation.json');
    const englishTranslations = await englishResponse.json();
    
    const englishKeys = Object.keys(englishTranslations);
    const languageKeys = Object.keys(translations);
    
    const missingKeys = englishKeys.filter(key => !languageKeys.includes(key));
    const extraKeys = languageKeys.filter(key => !englishKeys.includes(key));
    
    return {
      language,
      totalKeys: englishKeys.length,
      translatedKeys: languageKeys.length,
      missingKeys,
      extraKeys,
      completion: Math.round((languageKeys.length / englishKeys.length) * 100)
    };
  } catch (error) {
    console.error('Error validating translation structure:', error);
    return null;
  }
};

/**
 * Generate translation report
 * @returns {Promise<object>} Complete translation report
 */
export const generateTranslationReport = async () => {
  const languages = ['en', 'am', 'om'];
  const report = {
    timestamp: new Date().toISOString(),
    languages: {},
    summary: {
      totalLanguages: languages.length,
      averageCompletion: 0
    }
  };
  
  let totalCompletion = 0;
  
  for (const lang of languages) {
    const validation = await validateTranslationStructure(lang);
    if (validation) {
      report.languages[lang] = validation;
      totalCompletion += validation.completion;
    }
  }
  
  report.summary.averageCompletion = Math.round(totalCompletion / languages.length);
  
  return report;
};

/**
 * Auto-detect and log missing translations
 * Should be called in development mode
 */
export const logMissingTranslations = () => {
  if (isDevelopment) {
    const missing = getMissingKeys();
    const fallbacks = getFallbackKeys();
    
    if (missing.length > 0) {
      console.group('🌍 Missing Translations');
      console.warn('Missing keys:', missing);
      console.groupEnd();
    }
    
    if (fallbacks.size > 0) {
      console.group('🔄 Fallback Translations Used');
      console.log('Fallback keys:', Object.fromEntries(fallbacks));
      console.groupEnd();
    }
  }
};

/**
 * Get supported languages with their display names
 * @returns {Array} Array of language objects
 */
export const getSupportedLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', flag: '🇪🇹' }
];

/**
 * Change language with validation
 * @param {string} languageCode - Language code
 * @returns {Promise<boolean>} Success status
 */
export const changeLanguage = async (languageCode) => {
  try {
    await i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

export default {
  t,
  getMissingKeys,
  getFallbackKeys,
  clearMissingKeys,
  getTranslationCompletion,
  getTranslationStatus,
  validateTranslationStructure,
  generateTranslationReport,
  logMissingTranslations,
  getSupportedLanguages,
  changeLanguage
};
