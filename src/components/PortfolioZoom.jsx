import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { globalEventBus } from '../utils/eventBus.js';

const STEPS = 1000;

// Magnifying glass with a + or − inside the lens.
function SpyglassIcon({ plus }) {
  return (
    <svg className="zoom-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" />
      <line x1="14.8" y1="14.8" x2="20.5" y2="20.5" className="zoom-icon__handle" />
      <line x1="7" y1="10" x2="13" y2="10" />
      {plus && <line x1="10" y1="7" x2="10" y2="13" />}
    </svg>
  );
}

// Vertical zoom slider: bottom = fully zoomed out (startup state), top = fully zoomed in.
export default function PortfolioZoom() {
  const { language } = useLanguage();
  const [level, setLevel] = useState(0);

  useEffect(() => globalEventBus.on('zoom-changed', ({ level: next }) => setLevel(next)), []);

  const update = (next) => {
    const clamped = Math.min(1, Math.max(0, next));
    setLevel(clamped);
    globalEventBus.emit('zoom-set', { level: clamped });
  };

  return (
    <div className="zoom-control">
      <button type="button" className="zoom-step" aria-label="Zoom +" onClick={() => update(level + 0.1)}>
        <SpyglassIcon plus />
      </button>
      <input
        type="range"
        className="zoom-slider"
        min={0}
        max={STEPS}
        value={Math.round(level * STEPS)}
        aria-label={getTranslation(language, 'nav.zoom')}
        aria-orientation="vertical"
        onChange={(e) => update(Number(e.target.value) / STEPS)}
      />
      <button type="button" className="zoom-step" aria-label="Zoom −" onClick={() => update(level - 0.1)}>
        <SpyglassIcon />
      </button>
    </div>
  );
}
