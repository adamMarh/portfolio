import { useEffect } from 'react';
import { loadPortfolioScene } from './services/sceneLoader.js';
import PortfolioOverlay from './components/PortfolioOverlay.jsx';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import '../styles/portfolio-solaire.css';

function AppContent() {
  useEffect(() => {
    loadPortfolioScene();
  }, []);

  return (
    <>
      <PortfolioOverlay />
      <LanguageSwitcher />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}