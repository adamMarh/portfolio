import { PROJECTS } from '../data/portfolio.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getPlanetName, getTranslation } from '../i18n/translations.js';

function buildCelestialThumb({ color, accent = color, ring = false, isSun = false }) {
  const hex = color.toString(16).padStart(6, '0');
  const accentHex = accent.toString(16).padStart(6, '0');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g" cx="32%" cy="28%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="${isSun ? '1' : '0.92'}" />
          <stop offset="32%" stop-color="#ffffff" stop-opacity="0.4" />
          <stop offset="72%" stop-color="#${hex}" />
          <stop offset="100%" stop-color="#${accentHex}" />
        </radialGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="52%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="${isSun ? '0.75' : '0.28'}" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="48" cy="48" r="42" fill="url(#glow)" opacity="${isSun ? '0.95' : '0.55'}" />
      ${ring ? '<ellipse cx="48" cy="52" rx="32" ry="12" fill="none" stroke="#d8b67a" stroke-opacity="0.9" stroke-width="4" transform="rotate(-18 48 52)" />' : ''}
      <circle cx="48" cy="48" r="28" fill="url(#g)" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
      <circle cx="37" cy="36" r="9" fill="#ffffff" opacity="0.18" />
      <circle cx="59" cy="60" r="14" fill="#000000" opacity="0.08" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function PortfolioDrawer({ isOpen, activeIndex, onToggle, onSelect }) {
  const { language } = useLanguage();

  const items = [
    {
      idx: -1,
      name: getTranslation(language, 'profile.title'),
      meta: getTranslation(language, 'profile.category'),
      color: 0xffd768,
      accent: 0xff8a18,
      isSun: true,
    },
    ...PROJECTS.map((project, idx) => ({
      idx,
      name: getPlanetName(language, project.planet),
      meta: project.category || getTranslation(language, 'panel.category'),
      color: project.hex,
      accent: project.emissive || project.hex,
      ring: Boolean(project.ring),
    })),
  ];

  return (
    <aside className={`portfolio-drawer ${isOpen ? 'is-open' : ''}`} aria-label={getTranslation(language, 'drawer.title')}>
      <button
        type="button"
        className={`portfolio-drawer__tab ${isOpen ? 'is-open' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="portfolio-drawer-panel"
        title={isOpen ? getTranslation(language, 'drawer.close') : getTranslation(language, 'drawer.open')}
      >
        <span className="portfolio-drawer__tab-text">
          {['D', 'E', 'T', 'A', 'I', 'L', 'S'].map((ch, i) => (
            <span key={i} className="portfolio-drawer__tab-letter">{ch}</span>
          ))}
        </span>
        <span className="portfolio-drawer__tab-arrow" aria-hidden="true" />
      </button>

      <div id="portfolio-drawer-panel" className="portfolio-drawer__panel">
        <div className="portfolio-drawer__header">
          <div>
            <div className="portfolio-drawer__eyebrow">{getTranslation(language, 'drawer.title')}</div>
            <div className="portfolio-drawer__subtitle">{getTranslation(language, 'drawer.subtitle')}</div>
          </div>
        </div>

        <div className="portfolio-drawer__list">
          {items.map((item) => (
            <button
              key={item.idx}
              type="button"
              className={`portfolio-drawer__item ${activeIndex === item.idx ? 'is-active' : ''}`}
              onClick={() => onSelect(item.idx)}
            >
              <img
                className="portfolio-drawer__thumb"
                src={buildCelestialThumb(item)}
                alt={item.name}
              />
              <span className="portfolio-drawer__copy">
                <span className="portfolio-drawer__name">{item.name}</span>
                <span className="portfolio-drawer__meta">{item.meta}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}