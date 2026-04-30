let portfolioScenePromise;

export function loadPortfolioScene() {
  if (!portfolioScenePromise) {
    portfolioScenePromise = import('./solar/portfolioRuntime.js').then((mod) => {
      mod.mountPortfolioSolarSystem();
      return mod;
    });
  }

  return portfolioScenePromise;
}