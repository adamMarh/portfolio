import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';

const LANGS = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
];

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <div className="lang-toggle" role="group" aria-label={getTranslation(language, 'nav.language')}>
      {LANGS.map((lang) => (
        <button
          key={lang.code}
          type="button"
          lang={lang.code}
          className="lang-toggle__option"
          aria-pressed={language === lang.code}
          aria-label={lang.name}
          onClick={() => toggleLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
