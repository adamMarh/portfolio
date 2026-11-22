import { useEffect, useState } from 'react';
import { globalEventBus } from '../utils/eventBus.js';
import { stage } from '../services/stage/state.js';

export function useStage() {
  const [current, setCurrent] = useState(stage.current);
  useEffect(() => globalEventBus.on('stage-changed', ({ stage: next }) => setCurrent(next)), []);
  return current;
}

export function useStageReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => globalEventBus.on('stage-ready', () => setReady(true)), []);
  return ready;
}

export function useBusEvent(name, handler) {
  useEffect(() => globalEventBus.on(name, handler), [name, handler]);
}

// True on touch-first devices: swap keyboard/mouse wording for tap wording.
export function useCoarsePointer() {
  const query = '(pointer: coarse)';
  // Dev only: ?touch renders the touch wording for screenshots on a desktop browser.
  const forced = import.meta.env.DEV && new URLSearchParams(window.location.search).has('touch');
  const [coarse, setCoarse] = useState(() => forced || window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setCoarse(forced || media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [forced]);
  return coarse;
}
