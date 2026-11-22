// Three.js and the scenes are a separate chunk. The download starts as soon as
// this module is evaluated, in parallel with React's first render; mounting
// waits for the DOM (canvas, overlay) that render creates.
const stageModule = import('./stage/stageController.js');
let stagePromise;

export function loadStage() {
  // The stage owns the canvas, its WebGL context and window listeners, so it
  // cannot be swapped in place. In dev, a hot update that re-runs this module
  // would mount a second stage on the same canvas (two render loops fighting
  // over one picture): reload the page instead.
  if (import.meta.hot && !stagePromise && window.__portfolioStageMounted) {
    window.location.reload();
    return new Promise(() => {});
  }
  if (!stagePromise) {
    window.__portfolioStageMounted = true;
    stagePromise = stageModule.then((mod) => mod.mountStage());
  }
  return stagePromise;
}
