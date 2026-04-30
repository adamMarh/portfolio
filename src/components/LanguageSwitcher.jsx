import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import '../styles/LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="language-switcher">
      <button
        className="language-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle language"
      >
        <img
          src={language === 'fr' ? 'src/assets/french.jpg' : 'src/assets/english.png'}
          alt={language === 'fr' ? 'Français' : 'English'}
          className="flag-icon"
        />
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <button
            className={`language-option ${language === 'fr' ? 'active' : ''}`}
            onClick={() => {
              toggleLanguage('fr');
              setIsOpen(false);
            }}
          >
            <img src="src/assets/french.jpg" alt="Français" className="flag-icon-small" />
            Français
          </button>
          <button
            className={`language-option ${language === 'en' ? 'active' : ''}`}
            onClick={() => {
              toggleLanguage('en');
              setIsOpen(false);
            }}
          >
            <img src="src/assets/english.png" alt="English" className="flag-icon-small" />
            English
          </button>
        </div>
      )}
    </div>
  );
}
