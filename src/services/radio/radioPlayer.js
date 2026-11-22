import { globalEventBus } from '../../utils/eventBus.js';
import { playSfx } from '../audio/sfx.js';

// The desk radio's tape deck: every audio file in src/assets/musics/ is picked
// up at build time and played one after the other, looping at the end.
// Song and artist come from the file's ID3 tags when it has them, otherwise
// from its name ("Artist - Title.mp3").

const files = import.meta.glob('../../assets/musics/*.{mp3,ogg,wav,m4a,aac,flac}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function cleanName(path) {
  return decodeURIComponent(path.split('/').pop())
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/^\d{1,3}\s*[-._)]\s*/, '') // leading track number
    .trim();
}

// Spaced-out letters ("e s c p") read as one word on a small display.
const unspace = (text) => (/^(\S\s)+\S$/.test(text) ? text.replace(/\s/g, '') : text);

export function parseTrackName(path) {
  const name = cleanName(path);
  const dashed = name.split(/\s+[-–—]\s+/);
  if (dashed.length >= 2) return { artist: unspace(dashed[0].trim()), title: dashed.slice(1).join(' - ').trim() };
  // "_ artist _ Title": a name wrapped in underscores, then the title.
  const wrapped = name.match(/^_\s*(.+?)\s*_\s+(.+)$/);
  if (wrapped) return { artist: unspace(wrapped[1]), title: wrapped[2].trim() };
  // "artist_title-with-dashes": the first underscore separates the two.
  const snake = name.match(/^([^_\s]+)_(.+)$/);
  if (snake) return { artist: snake[1], title: snake[2].replace(/[-_]+/g, ' ').trim() };
  return { artist: '', title: name.replace(/_/g, ' ').trim() };
}

// Shuffled on every visit: the radio starts on a random song, then plays the
// rest one by one in that shuffled order.
function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const TRACKS = shuffle(Object.keys(files))
  .map((path) => ({ url: files[path], ...parseTrackName(path), tagsRead: false }));

// ---------- ID3v2 (title / artist), read from the first bytes only ----------

function decodeText(bytes) {
  const encoding = bytes[0];
  const body = bytes.subarray(1);
  let text;
  if (encoding === 1 || encoding === 2) {
    text = new TextDecoder(encoding === 2 ? 'utf-16be' : 'utf-16').decode(body);
  } else {
    text = new TextDecoder(encoding === 3 ? 'utf-8' : 'latin1').decode(body);
  }
  return text.replace(/\0+$/g, '').split('\0')[0].trim();
}

function readId3(bytes) {
  if (bytes.length < 10 || bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return null;
  const version = bytes[3];
  const size = (bytes[6] << 21) | (bytes[7] << 14) | (bytes[8] << 7) | bytes[9];
  const end = Math.min(bytes.length, 10 + size);
  const tags = {};
  let i = 10;
  while (i + 10 <= end) {
    const id = String.fromCharCode(bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]);
    if (!/^[A-Z0-9]{4}$/.test(id)) break;
    const frameSize = version === 4
      ? (bytes[i + 4] << 21) | (bytes[i + 5] << 14) | (bytes[i + 6] << 7) | bytes[i + 7]
      : ((bytes[i + 4] << 24) | (bytes[i + 5] << 16) | (bytes[i + 6] << 8) | bytes[i + 7]) >>> 0;
    if (frameSize <= 0 || i + 10 + frameSize > end) break;
    if (id === 'TIT2' || id === 'TPE1') tags[id] = decodeText(bytes.subarray(i + 10, i + 10 + frameSize));
    i += 10 + frameSize;
  }
  return { title: tags.TIT2 || '', artist: tags.TPE1 || '' };
}

async function readHead(url, limit = 256 * 1024) {
  const response = await fetch(url, { headers: { Range: `bytes=0-${limit - 1}` } });
  if (!response.body) return new Uint8Array(await response.arrayBuffer()).subarray(0, limit);
  // A server that ignores Range sends the whole file: stop reading early.
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (total < limit) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  reader.cancel().catch(() => {});
  const out = new Uint8Array(Math.min(total, limit));
  let offset = 0;
  for (const chunk of chunks) {
    const part = chunk.subarray(0, Math.max(0, out.length - offset));
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

async function loadTags(track) {
  if (track.tagsRead) return;
  track.tagsRead = true;
  try {
    const tags = readId3(await readHead(track.url));
    if (tags?.title) track.title = tags.title;
    if (tags?.artist) track.artist = tags.artist;
  } catch {
    // Keep the name parsed from the file.
  }
}

// ---------- player ----------

let audio = null;
let analyser = null;
let levels = null;
let index = 0;
// 'empty'   : no music in the folder
// 'pending' : switched on, waiting for the browser to allow sound (first gesture)
// 'playing' | 'paused'
let status = TRACKS.length ? 'paused' : 'empty';
let userPaused = false;
let gestureAt = 0;

function snapshot() {
  const track = TRACKS[index];
  return {
    status,
    index,
    total: TRACKS.length,
    artist: track?.artist || '',
    title: track?.title || '',
  };
}

function announce() {
  globalEventBus.emit('radio-changed', snapshot());
}

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = 'none';
  audio.volume = 0.6;
  audio.addEventListener('ended', () => next());
  audio.addEventListener('error', () => {
    // A file the browser cannot play: move on rather than stall.
    if (status === 'playing' && TRACKS.length > 1) next();
    else pause({ silent: true });
  });
  return audio;
}

// Level meter for the display and the speaker cones. Routing audio through an
// AudioContext created without a user gesture would leave it suspended (and the
// music silent), so the meter is only wired inside the visitor's first gesture.
let meterWired = false;
let meterContext = null;
// iOS suspends audio when the tab is hidden or a call comes in; the music runs
// through the meter, so wake it on the next gesture.
['pointerup', 'touchend', 'keydown'].forEach((type) => window.addEventListener(type, () => {
  if (meterContext && meterContext.state !== 'running') meterContext.resume().catch(() => {});
}, { capture: true, passive: true }));
function wireMeter() {
  if (meterWired) return;
  meterWired = true;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const context = new Ctx();
    const source = context.createMediaElementSource(ensureAudio());
    analyser = context.createAnalyser();
    analyser.fftSize = 64;
    levels = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(context.destination);
    context.resume().catch(() => {});
    meterContext = context;
  } catch {
    analyser = null;
  }
}

function load(i) {
  index = (i + TRACKS.length) % TRACKS.length;
  const player = ensureAudio();
  player.src = TRACKS[index].url;
  loadTags(TRACKS[index]).then(announce);
}

export function play() {
  if (!TRACKS.length) return;
  userPaused = false;
  wireMeter();
  const player = ensureAudio();
  if (!player.src) load(index);
  status = 'playing';
  player.play().catch(() => {
    // Still blocked: stay switched on and wait for the first gesture.
    status = 'pending';
    announce();
  });
  announce();
}

// Pause keeps the place in the song; turning the radio off makes the same
// power-down sound as the computer.
export function pause({ silent = false } = {}) {
  if (!TRACKS.length) return;
  userPaused = true;
  if (!silent && (status === 'playing' || status === 'pending')) playSfx('shutdown');
  audio?.pause();
  status = 'paused';
  announce();
}

export function toggle() {
  // The press that also unlocked sound has just started the music: do not
  // immediately pause it again.
  if (status === 'playing' && performance.now() - gestureAt < 400) return;
  if (status === 'playing' || status === 'pending') pause();
  else play();
}

export function next() {
  if (!TRACKS.length) return;
  wireMeter();
  const wasOn = status === 'playing' || status === 'pending';
  load(index + 1);
  if (wasOn) {
    status = 'playing';
    audio.play().catch(() => {
      status = 'pending';
      announce();
    });
  }
  announce();
}

export function getRadioState() {
  return snapshot();
}

// 0..1 loudness, for the VU bars and speaker cones.
export function getLevel() {
  if (!analyser || status !== 'playing') return 0;
  analyser.getByteFrequencyData(levels);
  let sum = 0;
  for (let i = 0; i < levels.length; i++) sum += levels[i];
  return Math.min(1, sum / levels.length / 160);
}

export function radioCommand(action) {
  if (action === 'toggle') toggle();
  else if (action === 'play') play();
  else if (action === 'pause') pause();
  else if (action === 'next') next();
}

// Read the first track's tags early so the display is right before any click.
if (TRACKS.length) loadTags(TRACKS[0]).then(announce);

// The radio is on when the page opens. Browsers only allow sound after the
// visitor interacts, so it shows as on straight away ('pending'), tries to
// play, and if refused starts on the first click, tap or key press anywhere.
let autoplayArmed = false;
export function startRadioOnLoad() {
  // Dev: a hot update re-running this module would start a second tape deck
  // over the first; reload the page instead.
  if (import.meta.hot && !autoplayArmed && window.__portfolioRadioArmed) {
    window.location.reload();
    return;
  }
  if (!TRACKS.length || autoplayArmed) return;
  window.__portfolioRadioArmed = true;
  autoplayArmed = true;
  status = 'pending';
  announce();
  // Only these events let a page start sound. A touch's pointerdown does not
  // (its pointerup does), and an AudioContext made outside one stays
  // suspended, which would leave the music silent on phones and tablets.
  const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
  const onGesture = (e) => {
    if (e.type === 'pointerdown' && e.pointerType !== 'mouse') return;
    GESTURES.forEach((type) => window.removeEventListener(type, onGesture, true));
    wireMeter();
    if (status === 'pending' && !userPaused) {
      gestureAt = performance.now();
      play();
    }
  };
  GESTURES.forEach((type) => window.addEventListener(type, onGesture, true));
  const player = ensureAudio();
  if (!player.src) load(index);
  player.play().then(() => {
    if (status === 'pending') {
      status = 'playing';
      announce();
    }
  }).catch(() => {
    // Blocked until the first gesture; the listeners above take it from there.
  });
}
