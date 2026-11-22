import { useCallback, useEffect, useRef, useState } from 'react';
import { capturePointer } from '../utils/pointer.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { globalEventBus } from '../utils/eventBus.js';
import ExternalLink from './ExternalLink.jsx';
import { BODY_ORDER, getBody, metaFor, parseInternship } from '../data/bodies.js';
import { useBusEvent } from '../hooks/useStage.js';
import { ArrowUpRightIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';

export default function PortfolioPanel() {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);
  const [idx, setIdx] = useState(null);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const titleRef = useRef(null);
  const scrollRef = useRef(null);
  const panelRef = useRef(null);
  const sheetDrag = useRef(null);

  useBusEvent('portfolio-detail-opened', useCallback(({ idx: next }) => {
    setIdx(next);
    setOpen(true);
    setSwitching(false);
  }, []));
  useBusEvent('portfolio-detail-switching', useCallback(() => setSwitching(true), []));
  useBusEvent('portfolio-detail-closing', useCallback(() => setOpen(false), []));
  useBusEvent('portfolio-detail-closed', useCallback(() => setOpen(false), []));

  // Move focus into the panel when a body opens, and reset the scroll.
  useEffect(() => {
    if (!open || switching || idx === null) return;
    scrollRef.current?.scrollTo({ top: 0 });
    titleRef.current?.focus({ preventScroll: true });
  }, [open, switching, idx]);

  // Bottom sheet: drag the handle down to close, like a native sheet. It
  // follows the finger 1:1, closes past a third of its height or on a quick
  // flick, and otherwise settles back with the panel's own easing.
  const onGrabDown = (e) => {
    const panel = panelRef.current;
    if (!panel || !open) return;
    capturePointer(e.currentTarget, e.pointerId);
    sheetDrag.current = { y: e.clientY, t: performance.now(), dy: 0, v: 0, height: panel.offsetHeight };
    panel.classList.add('is-sheet-dragging');
  };
  const onGrabMove = (e) => {
    const drag = sheetDrag.current;
    if (!drag) return;
    const raw = e.clientY - drag.y;
    // Upward: resist, a sheet that is already open has nowhere to go.
    const dy = raw < 0 ? -Math.sqrt(-raw) * 2 : raw;
    const now = performance.now();
    drag.v = (dy - drag.dy) / Math.max(1, now - drag.t);
    drag.dy = dy;
    drag.t = now;
    panelRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onGrabUp = () => {
    const drag = sheetDrag.current;
    const panel = panelRef.current;
    sheetDrag.current = null;
    if (!drag || !panel) return;
    panel.classList.remove('is-sheet-dragging');
    panel.style.transform = '';
    if (drag.dy > drag.height / 3 || (drag.v > 0.5 && drag.dy > 20)) globalEventBus.emit('portfolio-exit-detail');
  };

  const body = idx === null ? null : getBody(language, idx);
  const position = BODY_ORDER.indexOf(idx);
  const prevIdx = BODY_ORDER[(position - 1 + BODY_ORDER.length) % BODY_ORDER.length];
  const nextIdx = BODY_ORDER[(position + 1) % BODY_ORDER.length];
  const go = (target) => globalEventBus.emit('portfolio-open-body', { idx: target });
  // "FindSecure — Lost & Found Matcher": the name leads, the descriptor follows smaller.
  const [titleName, titleDetail] = (body?.title || '').split(/\s+—\s+/);
  const meta = body ? metaFor(body, t('site.ongoing')) : null;
  const links = (body?.links || []).filter((link) => /^https?:\/\//.test(link?.url || ''));

  return (
    <aside id="panel" ref={panelRef} className={open ? 'is-open' : ''} inert={!open} aria-labelledby="panel-title">
      <div
        className="panel__grab"
        aria-hidden="true"
        onPointerDown={onGrabDown}
        onPointerMove={onGrabMove}
        onPointerUp={onGrabUp}
        onPointerCancel={onGrabUp}
      />
      <div className="panel__scroll" ref={scrollRef}>
        <button type="button" className="panel__back" onClick={() => globalEventBus.emit('portfolio-exit-detail')}>
          <ChevronLeftIcon />
          {t('site.back')}
        </button>

        {body && (
          <article className={`panel__body ${switching ? 'is-switching' : ''}`} aria-busy={switching}>
            <h2 className="panel__title" id="panel-title" ref={titleRef} tabIndex={-1}>
              {titleName}
              {titleDetail && <span className="panel__title-detail">{titleDetail}</span>}
            </h2>
            <p className="panel__meta">
              {meta.when && <span className="panel__when">{meta.when}</span>}
              {meta.context && <span>{meta.context}</span>}
            </p>

            <p className="panel__desc">{body.desc}</p>

            {Array.isArray(body.internships) && (
              <section className="timeline" aria-labelledby="timeline-title">
                <h3 className="timeline__title" id="timeline-title">{t('site.experience')}</h3>
                <ol className="timeline__list">
                  {body.internships.map((entry) => {
                    const item = parseInternship(entry);
                    return (
                      <li className="timeline__item" key={entry}>
                        <p className="timeline__when">{item.dates}</p>
                        <div className="timeline__what">
                          <h4 className="timeline__role">{item.role}</h4>
                          {item.company && <p className="timeline__company">{item.company}</p>}
                          {item.detail && <p className="timeline__detail">{item.detail}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            {links.length > 0 && (
              <div className="panel__links">
                {links.map((link) => (
                  <ExternalLink key={link.url} className="button-primary" href={link.url}>
                    {link.label}
                    <ArrowUpRightIcon />
                  </ExternalLink>
                ))}
              </div>
            )}

            {body.tags?.length > 0 && (
              <ul className="panel__tags">
                {body.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            )}
          </article>
        )}

        {body && (
          <nav className="pager" aria-label={`${t('site.previous')} / ${t('site.next')}`}>
            <button type="button" className="pager__link" onClick={() => go(prevIdx)}>
              <ChevronLeftIcon />
              <span>
                <span className="pager__label">{t('site.previous')}</span>
                <span className="pager__title">{getBody(language, prevIdx).title}</span>
              </span>
            </button>
            <button type="button" className="pager__link pager__link--next" onClick={() => go(nextIdx)}>
              <span>
                <span className="pager__label">{t('site.next')}</span>
                <span className="pager__title">{getBody(language, nextIdx).title}</span>
              </span>
              <ChevronRightIcon />
            </button>
          </nav>
        )}
      </div>
    </aside>
  );
}
