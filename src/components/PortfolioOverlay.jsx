import PortfolioCanvas from './PortfolioCanvas.jsx';
import PortfolioHud from './PortfolioHud.jsx';
import PortfolioPanel from './PortfolioPanel.jsx';

export default function PortfolioOverlay() {
  return (
    <div className="portfolio-app">
      <div id="intro-fade" />
      <PortfolioCanvas />
      <div id="tooltip" />
      <PortfolioPanel />
      <PortfolioHud />
    </div>
  );
}
