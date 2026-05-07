import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  getSupportedLanguages, 
  changeLanguage, 
  getTranslationStatus,
  generateTranslationReport 
} from '../utils/translationHelper';

const LanguageSwitcher = ({ showStatus = false, compact = false }) => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [translationStatus, setTranslationStatus] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const supportedLanguages = getSupportedLanguages();

  useEffect(() => {
    const loadTranslationStatus = async () => {
      if (showStatus) {
        const status = await getTranslationStatus();
        setTranslationStatus(status);
      }
    };
    loadTranslationStatus();
  }, [showStatus]);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLang(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleLanguageChange = async (languageCode) => {
    const success = await changeLanguage(languageCode);
    if (success) {
      setCurrentLang(languageCode);
      setIsOpen(false);
    }
  };

  const getCurrentLanguage = () => {
    return supportedLanguages.find(lang => lang.code === currentLang) || supportedLanguages[0];
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (compact) {
    const currentLang = getCurrentLanguage();
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span>{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.nativeName}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="py-1">
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                    currentLang === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="mr-3">{language.flag}</span>
                  <div className="flex-1">
                    <div>{language.nativeName}</div>
                    {showStatus && translationStatus[language.code] && (
                      <div className={`text-xs ${getCompletionColor(translationStatus[language.code])}`}>
                        {translationStatus[language.code]}% complete
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Language Settings</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Language
          </label>
          <div className="grid grid-cols-2 gap-3">
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex flex-col items-center p-3 border rounded-lg transition-colors ${
                  currentLang === language.code
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <span className="text-2xl mb-1">{language.flag}</span>
                <span className="text-sm font-medium">{language.nativeName}</span>
                <span className="text-xs text-gray-500">{language.name}</span>
                {showStatus && translationStatus[language.code] && (
                  <div className={`text-xs mt-1 ${getCompletionColor(translationStatus[language.code])}`}>
                    {translationStatus[language.code]}%
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {showStatus && Object.keys(translationStatus).length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Translation Status</h4>
            <div className="space-y-2">
              {supportedLanguages.map((language) => {
                const completion = translationStatus[language.code] || 0;
                return (
                  <div key={language.code} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{language.flag}</span>
                      <span className="text-sm">{language.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            completion >= 90 ? 'bg-green-500' :
                            completion >= 70 ? 'bg-yellow-500' :
                            completion >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${getCompletionColor(completion)}`}>
                        {completion}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <button
            onClick={async () => {
              const report = await generateTranslationReport();
              console.log('Translation Report:', report);
              // In a real app, you might want to download this report
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `translation-report-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Download Translation Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
