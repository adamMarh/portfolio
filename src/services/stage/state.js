import { globalEventBus } from '../../utils/eventBus.js';

// Which part of the experience owns the canvas and the input right now.
//   room     : the dark room, the CRT is clickable
//   diving   : camera flying into the CRT glass
//   site     : the solar-system portfolio is full screen and interactive
//   leaving  : CRT powering off and the camera pulling back into the room
export const stage = { current: 'room' };
document.body.dataset.stage = stage.current;

// Clicks on "Enter" or "Skip" can land before the 3D scene has finished
// loading; remember the last one so the stage runs it as soon as it mounts.
let pending = null;
let mounted = false;
export function requestStage(action) {
  if (mounted) globalEventBus.emit(action);
  else pending = action;
}
export function markStageMounted() {
  mounted = true;
  const action = pending;
  pending = null;
  return action;
}

export function setStage(next) {
  if (stage.current === next) return;
  stage.current = next;
  document.body.dataset.stage = next;
  globalEventBus.emit('stage-changed', { stage: next });
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
