import { PROJECTS } from '../data/portfolio.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getPlanetName, getProjectTranslation, getTranslation } from '../i18n/translations.js';

function buildCelestialThumb({ color, accent = color, ring = false, isSun = false, appearance = 'planetary' }) {
  const hex = color.toString(16).padStart(6, '0');
  const accentHex = accent.toString(16).padStart(6, '0');

  if (appearance === 'holographic') {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
        <defs>
          <radialGradient id="g" cx="34%" cy="28%" r="70%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98" />
            <stop offset="20%" stop-color="#f7b4ff" stop-opacity="0.94" />
            <stop offset="48%" stop-color="#69f0ff" stop-opacity="0.88" />
            <stop offset="100%" stop-color="#1a35ff" stop-opacity="0.18" />
          </radialGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="58%">
            <stop offset="0%" stop-color="#ff94ff" stop-opacity="0.8" />
            <stop offset="55%" stop-color="#79f5ff" stop-opacity="0.28" />
            <stop offset="100%" stop-color="#79f5ff" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="scan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="46%" stop-color="#ffffff" stop-opacity="0.18" />
            <stop offset="50%" stop-color="#ffffff" stop-opacity="0.05" />
            <stop offset="54%" stop-color="#ffffff" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="glitch" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff79f8" stop-opacity="0.7" />
            <stop offset="100%" stop-color="#64f4ff" stop-opacity="0.7" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="42" fill="url(#glow)" opacity="0.92" />
        <circle cx="48" cy="48" r="29" fill="url(#g)" stroke="rgba(255,255,255,0.5)" stroke-width="2" />
        <circle cx="48" cy="48" r="29" fill="url(#scan)" opacity="0.96" />
        <path d="M22 34H73M22 44H74M22 54H73M22 64H74" stroke="rgba(255,255,255,0.16)" stroke-width="2" />
        <path d="M26 30H38V40H26ZM61 57H77V67H61ZM42 18H52V28H42" fill="url(#glitch)" opacity="0.52" />
        <path d="M16 54C28 47 35 44 44 45C56 46 65 40 80 29" stroke="rgba(255,255,255,0.72)" stroke-width="1.8" stroke-linecap="round" opacity="0.58" />
        <path d="M18 66C31 62 37 59 47 60C57 61 67 58 78 52" stroke="rgba(255,255,255,0.44)" stroke-width="1.6" stroke-linecap="round" opacity="0.55" />
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

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
      meta: getPlanetName(language, 'Soleil'),
      color: 0xffd768,
      accent: 0xff8a18,
      isSun: true,
      appearance: 'planetary',
    },
    ...PROJECTS.map((project, idx) => {
      const projectTranslation = getProjectTranslation(language, idx);
      const planetName = getPlanetName(language, project.planet);

      return {
        idx,
        name: project.available === false
          ? getTranslation(language, project.statusKey || 'drawer.comingSoon')
          : (projectTranslation?.title || planetName),
        meta: planetName,
        color: project.hex,
        accent: project.emissive || project.hex,
        ring: Boolean(project.ring),
        appearance: project.available === false ? 'holographic' : (project.appearance || 'planetary'),
        available: project.available !== false,
      };
    }),
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
              disabled={item.available === false}
              aria-disabled={item.available === false}
              onClick={() => onSelect(item.idx)}
            >
              <img
                className="portfolio-drawer__thumb"
                src={buildCelestialThumb(item)}
                alt={item.name}
              />
              <span className="portfolio-drawer__copy">
                <span className="portfolio-drawer__name">{item.name}</span>
                <span className={`portfolio-drawer__meta ${item.available === false ? 'is-coming-soon' : ''}`}>{item.meta}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}