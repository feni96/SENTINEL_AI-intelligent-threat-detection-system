import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getSupportedLanguages,
  changeLanguage,
  getTranslationStatus,
  generateTranslationReport,
  getMissingKeys,
  clearMissingKeys,
  logMissingTranslations
} from '../utils/translationHelper';

const TranslationContext = createContext();

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [supportedLanguages] = useState(getSupportedLanguages());
  const [translationStatus, setTranslationStatus] = useState({});
  const [missingKeys, setMissingKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMissingKeyAlerts, setShowMissingKeyAlerts] = useState(
    process.env.NODE_ENV === 'development'
  );

  // Load translation status on mount
  useEffect(() => {
    loadTranslationStatus();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
      loadTranslationStatus();
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Log missing translations in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        logMissingTranslations();
        const missing = getMissingKeys();
        setMissingKeys(missing);
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, []);

  const loadTranslationStatus = async () => {
    setIsLoading(true);
    try {
      const status = await getTranslationStatus();
      setTranslationStatus(status);
    } catch (error) {
      console.error('Error loading translation status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (languageCode) => {
    setIsLoading(true);
    try {
      const success = await changeLanguage(languageCode);
      if (success) {
        setCurrentLanguage(languageCode);
        // Clear missing keys cache when language changes
        clearMissingKeys();
        setMissingKeys([]);
      }
      return success;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTranslationReport = async () => {
    try {
      const report = await generateTranslationReport();
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translation-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return report;
    } catch (error) {
      console.error('Error downloading translation report:', error);
      return null;
    }
  };

  const getCurrentLanguageInfo = () => {
    return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  };

  const getLanguageCompletion = (languageCode) => {
    return translationStatus[languageCode] || 0;
  };

  const refreshTranslationStatus = () => {
    loadTranslationStatus();
  };

  const value = {
    // State
    currentLanguage,
    supportedLanguages,
    translationStatus,
    missingKeys,
    isLoading,
    showMissingKeyAlerts,

    // Actions
    changeLanguage: handleLanguageChange,
    downloadTranslationReport,
    refreshTranslationStatus,
    clearMissingKeys: () => {
      clearMissingKeys();
      setMissingKeys([]);
    },
    toggleMissingKeyAlerts: () => setShowMissingKeyAlerts(!showMissingKeyAlerts),

    // Getters
    getCurrentLanguageInfo,
    getLanguageCompletion,
    getTranslationStatus: () => translationStatus,
    getMissingKeys: () => missingKeys
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
      
      {/* Missing Keys Alert for Development */}
      {process.env.NODE_ENV === 'development' && showMissingKeyAlerts && missingKeys.length > 0 && (
        <div className="fixed bottom-4 right-4 max-w-md bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Missing Translations Detected
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{missingKeys.length} missing translation keys found.</p>
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">View missing keys</summary>
                  <div className="mt-2 max-h-32 overflow-y-auto bg-yellow-100 rounded p-2">
                    {missingKeys.map((key, index) => (
                      <div key={index} className="text-xs font-mono">
                        {key}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => setShowMissingKeyAlerts(false)}
                  className="text-sm text-yellow-800 hover:text-yellow-900 underline"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    clearMissingKeys();
                    setMissingKeys([]);
                  }}
                  className="text-sm text-yellow-800 hover:text-yellow-900 underline"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;
