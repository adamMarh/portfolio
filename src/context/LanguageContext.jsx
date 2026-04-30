import { createContext, useContext, useState, useEffect } from 'react';
import { globalEventBus } from '../utils/eventBus.js';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('portfolio-language') || 'fr';
  });

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('portfolio-language', lang);
    globalEventBus.emit('language-changed', { language: lang });
  };

  useEffect(() => {
    globalEventBus.emit('language-changed', { language });
  }, []);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
