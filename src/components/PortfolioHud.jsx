import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';

export default function PortfolioHud() {
  const { language } = useLanguage();

  return (
    <>
      <div id="hud"><div id="hud-text">{getTranslation(language, 'nav.dragToOrbit')}</div></div>
      <div id="drag-hint">{getTranslation(language, 'nav.dragToRotate')}</div>
    </>
  );
}
