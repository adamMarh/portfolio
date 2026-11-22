// Three.js and the scenes are a separate chunk. The download starts as soon as
// this module is evaluated, in parallel with React's first render; mounting
// waits for the DOM (canvas, overlay) that render creates.
const stageModule = import('./stage/stageController.js');
let stagePromise;

export function loadStage() {
  if (!stagePromise) stagePromise = stageModule.then((mod) => mod.mountStage());
  return stagePromise;
}
