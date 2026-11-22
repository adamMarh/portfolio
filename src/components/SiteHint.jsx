import { useCallback, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { useBusEvent, useCoarsePointer } from '../hooks/useStage.js';

// How to move around; retires itself after the first real interaction.
export default function SiteHint() {
  const { language } = useLanguage();
  const [done, setDone] = useState(false);
  const coarse = useCoarsePointer();
  useBusEvent('portfolio-first-interaction', useCallback(() => setDone(true), []));

  return (
    <>
      <p className={`site-hint ${done ? 'is-done' : ''}`}>{getTranslation(language, coarse ? 'site.hintTouch' : 'site.hint')}</p>
      <p id="drag-hint" aria-hidden="true">{getTranslation(language, 'nav.dragToRotate')}</p>
    </>
  );
}
