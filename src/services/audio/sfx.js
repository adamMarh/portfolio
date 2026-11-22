import bootUrl from '../../assets/sounds/boot_sequence.mp3';
import clickUrl from '../../assets/sounds/click.mp3';
import shutdownUrl from '../../assets/sounds/shutdown.mp3';

// The old computer's sounds. Every one of them is triggered by a click, so the
// browser's autoplay rules are always satisfied.

const SOUNDS = {
  boot: { url: bootUrl, volume: 0.5 },
  click: { url: clickUrl, volume: 0.55 },
  shutdown: { url: shutdownUrl, volume: 0.55 },
};

const players = {};
const fades = new Map();

function player(name) {
  if (!players[name]) {
    const audio = new Audio(SOUNDS[name].url);
    audio.preload = 'auto';
    audio.volume = SOUNDS[name].volume;
    players[name] = audio;
  }
  return players[name];
}

function cancelFade(name) {
  const id = fades.get(name);
  if (id) cancelAnimationFrame(id);
  fades.delete(name);
}

export function playSfx(name) {
  if (!SOUNDS[name]) return;
  cancelFade(name);
  // Clicks can overlap (fast tool changes), so each one gets its own copy.
  const audio = name === 'click' ? player(name).cloneNode() : player(name);
  audio.volume = SOUNDS[name].volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// Fade a long sound (the 13 s boot sequence) out instead of cutting it.
export function fadeOutSfx(name, ms = 600) {
  const audio = players[name];
  if (!audio || audio.paused) return;
  cancelFade(name);
  const from = audio.volume;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    audio.volume = from * (1 - t);
    if (t < 1) {
      fades.set(name, requestAnimationFrame(step));
    } else {
      audio.pause();
      audio.volume = SOUNDS[name].volume;
      fades.delete(name);
    }
  };
  fades.set(name, requestAnimationFrame(step));
}

// Warm the short clips so the first click is not silent while it loads.
export function preloadSfx() {
  player('click');
  player('shutdown');
}
