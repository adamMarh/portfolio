import { useCallback, useEffect, useRef, useState } from 'react';
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
    <aside id="panel" className={open ? 'is-open' : ''} inert={!open} aria-labelledby="panel-title">
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
