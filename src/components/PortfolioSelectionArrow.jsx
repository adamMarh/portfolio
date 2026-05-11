import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';

export default function PortfolioSelectionArrow() {
  const { language } = useLanguage();

  return (
    <div id="selection-arrow" className="selection-arrow" aria-hidden="true">
      <div className="selection-arrow__label">{getTranslation(language, 'drawer.clickToVisit')}</div>
      <div className="selection-arrow__head" />
    </div>
  );
}