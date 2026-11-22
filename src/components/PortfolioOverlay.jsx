import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getTranslation } from '../i18n/translations.js';
import { useStage, useStageReady } from '../hooks/useStage.js';
import RoomOverlay from './RoomOverlay.jsx';
import SiteTopBar from './SiteTopBar.jsx';
import ProjectIndex from './ProjectIndex.jsx';
import PortfolioPanel from './PortfolioPanel.jsx';
import PortfolioSelectionArrow from './PortfolioSelectionArrow.jsx';
import PortfolioZoom from './PortfolioZoom.jsx';
import SiteHint from './SiteHint.jsx';
import LaunchToast from './LaunchToast.jsx';

export default function PortfolioOverlay() {
  const { language } = useLanguage();
  const stage = useStage();
  const ready = useStageReady();

  // After the dive, move keyboard focus into the portfolio.
  useEffect(() => {
    if (stage === 'site') document.getElementById('portfolio')?.focus({ preventScroll: true });
  }, [stage]);

  return (
    <div className={`portfolio-app ${ready ? 'is-ready' : ''}`}>
      <canvas
        id="canvas"
        role="img"
        aria-label={stage === 'site' ? getTranslation(language, 'site.hint') : getTranslation(language, 'room.sceneLabel')}
      />

      <RoomOverlay />

      <div className="site-ui" inert={stage !== 'site'}>
        <SiteTopBar />
        <ProjectIndex />
        <PortfolioPanel />
        <SiteHint />
        <PortfolioZoom />
      </div>

      <LaunchToast />
      <PortfolioSelectionArrow />
      <div id="tooltip" aria-hidden="true" />
      <div id="stage-fade" aria-hidden="true" />
      <div id="intro-fade" aria-hidden="true" />
    </div>
  );
}
