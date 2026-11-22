import bootUrl from '../../assets/sounds/boot_sequence.mp3';
import clickUrl from '../../assets/sounds/click.mp3';
import shutdownUrl from '../../assets/sounds/shutdown.mp3';

// The old computer's sounds, played through Web Audio: one context unlocked by
// the visitor's first gesture, then every sound (even ones started from a
// touch's pointerdown, which browsers do not count as a gesture) plays at once
// and overlaps freely. Mobile Safari blocks a fresh <audio> element started
// outside a gesture, so the element fallback is only for very old browsers.

const SOUNDS = {
  boot: { url: bootUrl, volume: 0.5 },
  click: { url: clickUrl, volume: 0.55 },
  shutdown: { url: shutdownUrl, volume: 0.55 },
};

const Ctx = window.AudioContext || window.webkitAudioContext;
let context = null;
const buffers = {};
const loading = {};
const voices = {}; // name -> { source, gain } for the sound currently playing
const fades = new Map();

function getContext() {
  if (!Ctx) return null;
  if (!context) {
    try {
      context = new Ctx();
    } catch {
      return null;
    }
  }
  return context;
}

function load(name) {
  const ctx = getContext();
  if (!ctx || buffers[name] || loading[name]) return loading[name];
  loading[name] = fetch(SOUNDS[name].url)
    .then((r) => r.arrayBuffer())
    // Safari < 14.1 only has the callback form of decodeAudioData.
    .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
    .then((buffer) => {
      buffers[name] = buffer;
      return buffer;
    })
    .catch(() => null);
  return loading[name];
}

// Resume the context inside a real activation (pointerup / touchend / click /
// keydown). Also re-run later: iOS suspends audio when the tab goes away.
function unlock() {
  const ctx = getContext();
  if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
}
['pointerup', 'touchend', 'click', 'keydown'].forEach((type) => window.addEventListener(type, unlock, { capture: true, passive: true }));

// ---------- element fallback ----------
const players = {};
function elementPlay(name) {
  if (!players[name]) {
    players[name] = new Audio(SOUNDS[name].url);
    players[name].preload = 'auto';
  }
  const audio = name === 'click' ? players[name].cloneNode() : players[name];
  audio.volume = SOUNDS[name].volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function cancelFade(name) {
  const id = fades.get(name);
  if (id) cancelAnimationFrame(id);
  fades.delete(name);
}

function stopVoice(name) {
  const voice = voices[name];
  if (!voice) return;
  try {
    voice.source.stop();
  } catch {
    // already stopped
  }
  delete voices[name];
}

export function playSfx(name) {
  if (!SOUNDS[name]) return;
  cancelFade(name);
  const ctx = getContext();
  if (!ctx) {
    elementPlay(name);
    return;
  }
  unlock();
  const start = (buffer) => {
    if (!buffer) return;
    // Clicks overlap (fast tool changes); long sounds restart.
    if (name !== 'click') stopVoice(name);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = SOUNDS[name].volume;
    source.buffer = buffer;
    source.connect(gain).connect(ctx.destination);
    source.start();
    if (name !== 'click') {
      voices[name] = { source, gain };
      source.onended = () => {
        if (voices[name]?.source === source) delete voices[name];
      };
    }
  };
  if (buffers[name]) start(buffers[name]);
  else load(name)?.then(start);
}

// Fade a long sound (the 13 s boot sequence) out instead of cutting it.
export function fadeOutSfx(name, ms = 600) {
  const ctx = context;
  const voice = voices[name];
  if (ctx && voice) {
    const g = voice.gain.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0, ctx.currentTime + ms / 1000);
    voice.source.stop(ctx.currentTime + ms / 1000 + 0.02);
    delete voices[name];
    return;
  }
  const audio = players[name];
  if (!audio || audio.paused) return;
  cancelFade(name);
  const from = audio.volume;
  const begin = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - begin) / ms);
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

// Fetch and decode every clip up front so the first one is not silent.
export function preloadSfx() {
  Object.keys(SOUNDS).forEach(load);
}
