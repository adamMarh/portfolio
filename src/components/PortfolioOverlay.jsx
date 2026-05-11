import { useEffect, useState } from 'react';
import { globalEventBus } from '../utils/eventBus.js';
import PortfolioCanvas from './PortfolioCanvas.jsx';
import PortfolioDrawer from './PortfolioDrawer.jsx';
import PortfolioHud from './PortfolioHud.jsx';
import PortfolioSelectionArrow from './PortfolioSelectionArrow.jsx';
import PortfolioPanel from './PortfolioPanel.jsx';
import PortfolioTitle from './PortfolioTitle.jsx';

export default function PortfolioOverlay() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTargetIdx, setActiveTargetIdx] = useState(null);

  useEffect(() => {
    const stopPicked = globalEventBus.on('portfolio-target-picked', ({ idx }) => {
      setActiveTargetIdx(idx);
      setIsDrawerOpen(false);
    });

    const stopCleared = globalEventBus.on('portfolio-target-cleared', () => {
      setActiveTargetIdx(null);
    });

    return () => {
      stopPicked();
      stopCleared();
    };
  }, []);

  return (
    <div className="portfolio-app">
      <PortfolioTitle />
      <PortfolioDrawer
        isOpen={isDrawerOpen}
        activeIndex={activeTargetIdx}
        onToggle={() => setIsDrawerOpen((current) => !current)}
        onSelect={(idx) => {
          setActiveTargetIdx(idx);
          setIsDrawerOpen(false);
          globalEventBus.emit('portfolio-target-picked', { idx });
        }}
      />
      <PortfolioSelectionArrow />
      <div id="intro-fade" />
      <PortfolioCanvas />
      <div id="tooltip" />
      <PortfolioPanel />
      <PortfolioHud />
    </div>
  );
}
