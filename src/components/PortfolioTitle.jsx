import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';

export default function PortfolioTitle() {
  const { language } = useLanguage();

  return (
    <div className="portfolio-title" aria-label={getTranslation(language, 'hero.title')}>
      <div className="portfolio-title__eyebrow">{getTranslation(language, 'hero.eyebrow')}</div>
      <div className="portfolio-title__main">{getTranslation(language, 'hero.title')}</div>
      <div className="portfolio-title__sub">{getTranslation(language, 'hero.subtitle')}</div>
    </div>
  );
}