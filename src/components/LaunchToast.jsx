import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { useBusEvent } from '../hooks/useStage.js';
import { ArrowUpRightIcon } from './Icons.jsx';

// "Opening github.com ↗": a short note confirming where the new tab went.
export default function LaunchToast() {
  const { language } = useLanguage();
  const [host, setHost] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef(0);

  useBusEvent('external-link-opened', useCallback(({ host: next }) => {
    setHost(next);
    setVisible(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), 1800);
  }, []));
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <p className={`launch-toast ${visible ? 'is-visible' : ''}`} role="status" aria-live="polite">
      {host && (
        <>
          {getTranslation(language, 'site.opening').replace('{host}', host)}
          <ArrowUpRightIcon />
        </>
      )}
    </p>
  );
}
