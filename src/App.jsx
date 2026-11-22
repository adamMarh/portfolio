import { useEffect } from 'react';
import { loadStage } from './services/sceneLoader.js';
import { startRadioOnLoad } from './services/radio/radioPlayer.js';
import PortfolioOverlay from './components/PortfolioOverlay.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import '../styles/portfolio-solaire.css';

function AppContent() {
  useEffect(() => {
    loadStage();
    startRadioOnLoad();
  }, []);

  return <PortfolioOverlay />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
