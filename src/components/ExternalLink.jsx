import { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { globalEventBus } from '../utils/eventBus.js';

// A link to another site (GitHub, LinkedIn). It opens at once in a new tab, so
// the portfolio stays where the visitor left it; the button answers with a
// quick CRT-style sweep and a note says where the tab went.
export default function ExternalLink({ href, className = '', label, children }) {
  const { language } = useLanguage();
  const ref = useRef(null);
  const newTab = getTranslation(language, 'site.newTab');

  const onClick = () => {
    const el = ref.current;
    if (el) {
      el.classList.remove('is-launching');
      void el.offsetWidth; // restart the sweep on repeated clicks
      el.classList.add('is-launching');
      window.setTimeout(() => el.classList.remove('is-launching'), 450);
    }
    let host = href;
    try {
      host = new URL(href).hostname.replace(/^www\./, '');
    } catch {
      // keep the raw href
    }
    globalEventBus.emit('external-link-opened', { host });
  };

  return (
    <a
      ref={ref}
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ? `${label} ${newTab}` : undefined}
      onClick={onClick}
    >
      {children}
      {!label && <span className="visually-hidden"> {newTab}</span>}
    </a>
  );
}
