import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { globalEventBus } from '../utils/eventBus.js';
import { BODY_ORDER, getBody } from '../data/bodies.js';
import { buildCelestialThumb } from '../utils/celestialThumb.js';
import { useBusEvent } from '../hooks/useStage.js';
import { CloseIcon, ListIcon } from './Icons.jsx';

// Every body in the system as a plain list: the keyboard and screen-reader
// path to all content, and the fast path for anyone who does not want to orbit.
export default function ProjectIndex() {
  const { language } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useBusEvent('portfolio-detail-opened', useCallback(({ idx }) => setActiveIdx(idx), []));
  useBusEvent('portfolio-detail-closed', useCallback(() => setActiveIdx(null), []));

  // Remember which row opened the panel so closing it returns focus there.
  useBusEvent('portfolio-detail-closed', useCallback(() => {
    const row = document.querySelector('.index__row[data-last-opened="true"]');
    if (row && document.activeElement === document.body) row.focus({ preventScroll: true });
  }, []));

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setSheetOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const bodies = BODY_ORDER.map((idx) => getBody(language, idx));
  const preview = (idx) => globalEventBus.emit('portfolio-preview', { idx });

  return (
    <nav className={`index ${sheetOpen ? 'is-open' : ''}`} aria-labelledby="index-title">
      <button
        type="button"
        className="index__toggle"
        aria-expanded={sheetOpen}
        aria-controls="index-panel"
        onClick={() => setSheetOpen((open) => !open)}
      >
        {sheetOpen ? <CloseIcon /> : <ListIcon />}
        <span>{getTranslation(language, 'site.indexToggle')}</span>
        <span className="index__count">{bodies.length}</span>
      </button>

      <div className="index__panel" id="index-panel">
        <h2 className="index__title" id="index-title">{getTranslation(language, 'site.indexTitle')}</h2>
        <ol className="index__list">
          {bodies.map((body) => (
            <li key={body.idx}>
              <button
                type="button"
                className="index__row"
                aria-current={activeIdx === body.idx ? 'true' : undefined}
                onPointerEnter={() => preview(body.idx)}
                onPointerLeave={() => preview(null)}
                onFocus={() => preview(body.idx)}
                onBlur={() => preview(null)}
                onClick={(e) => {
                  document.querySelectorAll('.index__row[data-last-opened]').forEach((el) => el.removeAttribute('data-last-opened'));
                  e.currentTarget.dataset.lastOpened = 'true';
                  preview(null);
                  setSheetOpen(false);
                  globalEventBus.emit('portfolio-open-body', { idx: body.idx });
                }}
              >
                <span className="index__thumb">
                  <img src={buildCelestialThumb(body)} alt="" width="40" height="40" />
                </span>
                <span className="index__text">
                  <span className="index__name">{body.title}</span>
                  <span className="index__meta">
                    {body.planet}
                    {body.year && <span className="index__year">{body.year}</span>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
