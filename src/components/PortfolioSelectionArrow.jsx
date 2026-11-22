import { useCallback, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getBody } from '../data/bodies.js';
import { useBusEvent } from '../hooks/useStage.js';

// Floats over the body an index row points at; the runtime positions it.
export default function PortfolioSelectionArrow() {
  const { language } = useLanguage();
  const [idx, setIdx] = useState(null);
  useBusEvent('portfolio-preview', useCallback(({ idx: next }) => setIdx(next), []));

  return (
    <div id="selection-arrow" className="selection-arrow" aria-hidden="true">
      <div className="selection-arrow__label">{idx === null ? '' : getBody(language, idx).title}</div>
      <div className="selection-arrow__stem" />
    </div>
  );
}
