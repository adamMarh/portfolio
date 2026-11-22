import * as THREE from 'three';
import { ENCYCLOPEDIA, ENCYCLOPEDIA_ORDER } from '../../data/encyclopedia.js';
import { PROJECTS } from '../../data/portfolio.js';

// Same colours as the 3D bodies (the Sun's core colour for the Sun).
const BODY_COLORS = Object.fromEntries([
  ['Soleil', 0xffd768],
  ...PROJECTS.map((project) => [project.planet, project.hex]),
].map(([key, hex]) => [key, `#${hex.toString(16).padStart(6, '0')}`]));

// The fictional 90s computer on the desk. Everything on its screen is drawn on a
// 2D canvas that the CRT shader composites over the live solar-system render:
// wherever this canvas is transparent (the portfolio window's content), the
// solar system shows through.
//
// States: off → boot → desktop ⇄ paint | encyclopedia
//                         desktop → opening (portfolio window) → program

const W = 1024;
const H = 768;
const NAVY = '#07122a';
const NAVY_DEEP = '#040a1a';
const GOLD = '#f5c842';
const INK = '#0a0f1d';
const PAPER = '#e9e4d4';
const MENU_H = 34;

const BOOT_S = 1.9;
const OPEN = { zoom: [0, 0.4], load: [0.4, 1.7], solar: 1.7, maximize: [2.3, 2.85] };
const OPEN_FAST = { zoom: [0, 0.15], load: [0.15, 0.45], solar: 0.45, maximize: [0.55, 0.9] };

const ICON_SCALE = 3;
const ICON_SIZE = 16 * ICON_SCALE;
const WIN = { x: 212, y: 118, w: 600, h: 450, bar: 30 };

// Paint window layout (canvas pixels).
const PW = { x: 36, y: 46, w: 952, h: 694, bar: 30 };
const AREA = { x: PW.x + 84, y: PW.y + PW.bar + 8, w: PW.w - 84 - 8, h: PW.h - PW.bar - 8 - 70 };
const TOOLBAR_X = PW.x + 10;
const PALETTE_Y = PW.y + PW.h - 58;
const COLORS = [
  '#111111', '#ffffff', '#8a8f98', '#e8402f', '#ff8a1f', '#ffd23f',
  '#3cb84a', '#2ec4c4', '#2f6bff', '#8c4bd6', '#ff5fae', '#8a5a2b',
];
const SIZES = [3, 8, 18];
// Off-white paper: pure white on a CRT blooms the whole screen and fades the strokes.
const SHEET = '#e9e3d3';

const CURSOR = [
  '1...........',
  '11..........',
  '121.........',
  '1221........',
  '12221.......',
  '122221......',
  '1222221.....',
  '12222221....',
  '122222221...',
  '1222222221..',
  '12222222221.',
  '122222111111',
  '1221221.....',
  '121.1221....',
  '11..1221....',
  '1....1221...',
  '.....1221...',
  '......1221..',
  '......11....',
];

const ICONS = {
  portfolio: [
    '................',
    '......aaaa......',
    '....aabbbbaa....',
    '...abbbbbbbba...',
    '..abbbbbbbbbba..',
    'rrrrrbbbbbbbbrrr',
    '.abrrrrrrrrrrrba',
    '.abbbbbrrrrbbbba',
    '.abbbbbbbbbbbbba',
    '..abbbbbbbbbbba.',
    '..abbbbbbbbbbba.',
    '...abbbbbbbbba..',
    '....aabbbbaa....',
    '......aaaa......',
    '................',
    '................',
  ],
  paint: [
    '................',
    '....aaaaaaa.....',
    '..aabbbbbbbaa...',
    '.abccbbddbbbba..',
    '.abccbbddbbbbba.',
    'abbbbbbbbbbbbba.',
    'abeebbbbbaaabba.',
    'abeebbbbba..aba.',
    'abbbbbbbba..aba.',
    'abffbbbbbbaabba.',
    '.abffbbggbbbbba.',
    '.abbbbbggbbbba..',
    '..aabbbbbbbaa...',
    '....aaaaaaa.....',
    '................',
    '................',
  ],
};
ICONS.encyclopedia = [
  '................',
  '...aaaaaaaaaaa..',
  '..abbbbbbbbbbba.',
  '..abccccccccbba.',
  '..abcaaaaaacbba.',
  '..abccccccccbba.',
  '..abbbbbbbbbbba.',
  '..abbbbffbbbbba.',
  '..abbbffffbbbba.',
  '..abbbbffbbbbba.',
  '..abbbbbbbbbbba.',
  '..abbbbbbbbbbba.',
  '..aeeeeeeeeeeea.',
  '..aaaaaaaaaaaaa.',
  '................',
  '................',
];

const ICON_PALETTES = {
  portfolio: { a: INK, b: '#f2b13a', r: '#e8dcae' },
  paint: { a: INK, b: '#c79a62', c: '#e8402f', d: '#2f6bff', e: '#ffd23f', f: '#3cb84a', g: '#ff5fae' },
  encyclopedia: { a: INK, b: '#1f4f8f', c: GOLD, e: PAPER, f: '#f2b13a' },
};

const TOOL_GLYPHS = {
  brush: [
    '.........aa.',
    '........abba',
    '.......abba.',
    '......abba..',
    '.....abba...',
    '....aaaa....',
    '...accca....',
    '..acccca....',
    '..acccaa....',
    '.acccaa.....',
    'acaaa.......',
    'aa..........',
  ],
  eraser: [
    '............',
    '......aaaa..',
    '.....abbbba.',
    '....abbbbba.',
    '...abbbbba..',
    '..aaabbba...',
    '.acccaaba...',
    'accccca.....',
    'acccca......',
    '.acca.......',
    '..aa........',
    '............',
  ],
  clear: [
    '....aaaa....',
    'aaaaaaaaaaaa',
    '.abbbbbbbba.',
    '.abababbaba.',
    '.abababbaba.',
    '.abababbaba.',
    '.abababbaba.',
    '.abababbaba.',
    '.abababbaba.',
    '.abbbbbbbba.',
    '..aaaaaaaa..',
    '............',
  ],
  // A floppy disk: saves the drawing as a PNG.
  save: [
    'aaaaaaaaaaa.',
    'addbbbbbbdda',
    'addbbbbabdda',
    'addbbbbabdda',
    'addbbbbbbdda',
    'adddddddddda',
    'adeeeeeeeeda',
    'adeaaaaaaeda',
    'adeeeeeeeeda',
    'adeaaaaaaeda',
    'adeeeeeeeeda',
    'aaaaaaaaaaaa',
  ],
};
const TOOL_PALETTE = { a: INK, b: '#c9cdd4', c: '#ff5fae', d: '#2f6bff', e: PAPER };
const SAVED_FLASH_S = 0.8;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 4);
const lerp = (a, b, t) => a + (b - a) * t;
const phase = (t, [a, b]) => clamp01((t - a) / (b - a));
const inRect = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
// Distance from a point to a rectangle's edge (0 inside it).
const rectDistance = (p, r) => Math.hypot(
  Math.max(r.x - p.x, 0, p.x - (r.x + r.w)),
  Math.max(r.y - p.y, 0, p.y - (r.y + r.h))
);

function drawPixels(ctx, rows, x, y, scale, palette) {
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const color = palette[row[c]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
    }
  });
}

function buildWallpaper() {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, NAVY);
  grad.addColorStop(1, NAVY_DEEP);
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  g.fillStyle = 'rgba(120, 150, 210, 0.05)';
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const threshold = bayer[((y / 2) % 4) * 4 + ((x / 2) % 4)] / 16;
      if ((y / H) * 0.9 > threshold + 0.35) g.fillRect(x, y, 2, 2);
    }
  }
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 140; i++) {
    const x = Math.floor((rnd() * W) / 2) * 2;
    const y = Math.floor((rnd() * H) / 2) * 2;
    const bright = rnd();
    g.fillStyle = bright > 0.85 ? GOLD : `rgba(220, 230, 255, ${0.25 + bright * 0.5})`;
    g.fillRect(x, y, 2, 2);
  }
  return c;
}

export function createDesktopScreen({ getStrings }) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const wallpaper = buildWallpaper();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = 4;

  // Paint keeps its drawing on its own canvas while the window is open.
  const sheet = document.createElement('canvas');
  sheet.width = AREA.w;
  sheet.height = AREA.h;
  const sheetCtx = sheet.getContext('2d');
  const paint = { tool: 'brush', color: COLORS[0], size: SIZES[1], drawing: false, last: null };

  const icons = [
    { id: 'portfolio', labelKey: 'portfolio', x: 64, y: 84 },
    { id: 'paint', labelKey: 'paint', x: 64, y: 206 },
    { id: 'encyclopedia', labelKey: 'encyclopedia', x: 64, y: 328 },
  ];
  // Encyclopedia: list of bodies on the left, the entry on the right.
  const encRows = ENCYCLOPEDIA_ORDER.map((key, i) => ({ key, id: `enc-${i}`, x: PW.x + 10, y: PW.y + PW.bar + 10 + i * 70, w: 230, h: 64 }));
  let encIndex = 0;
  const iconHit = (icon) => ({ x: icon.x - 22, y: icon.y - 8, w: ICON_SIZE + 44, h: ICON_SIZE + 46 });

  const toolButtons = [
    { id: 'brush', y: AREA.y },
    { id: 'eraser', y: AREA.y + 60 },
    { id: 'size-0', y: AREA.y + 132 },
    { id: 'size-1', y: AREA.y + 188 },
    { id: 'size-2', y: AREA.y + 244 },
    { id: 'clear', y: AREA.y + 316 },
    { id: 'save', y: AREA.y + 372 },
  ].map((b) => ({ ...b, x: TOOLBAR_X, w: 64, h: 52 }));
  const swatches = COLORS.map((color, i) => ({ color, x: AREA.x + 70 + i * 50, y: PALETTE_Y, w: 42, h: 42 }));
  const closeBox = { x: PW.x + PW.w - 30, y: PW.y + 6, w: 20, h: 18 };
  // What counts as pressing it: the drawn box is small, so the whole right
  // end of the title bar (and a little below it) answers.
  const closeHit = { x: PW.x + PW.w - 64, y: PW.y - 6, w: 70, h: PW.bar + 12 }; // stops above the paper

  let state = 'off';
  let stateStart = performance.now() / 1000;
  let openTiming = OPEN;
  let solarFired = false;
  let readyFired = false;
  const pointer = { x: -1, y: -1, inside: false };
  let hover = null;
  let lastKey = '';
  const handlers = { solarStart: () => {}, portfolioReady: () => {}, stateChange: () => {}, click: () => {}, save: () => {} };
  // Save fires on release over the button (a touch only counts as a gesture,
  // which downloads and the share sheet need, when the finger lifts).
  let savePressed = false;
  let savedAt = -Infinity;

  const now = () => performance.now() / 1000;
  const elapsed = () => now() - stateStart;

  function setState(next) {
    state = next;
    stateStart = now();
    lastKey = '';
    handlers.stateChange(next);
  }

  function resetSheet() {
    sheetCtx.fillStyle = SHEET;
    sheetCtx.fillRect(0, 0, AREA.w, AREA.h);
  }

  // ---------- drawing ----------

  function drawMenuBar(strings, offset = 0) {
    if (offset <= -MENU_H) return;
    ctx.save();
    ctx.translate(0, offset);
    ctx.fillStyle = '#d9d2bd';
    ctx.fillRect(0, 0, W, MENU_H);
    ctx.fillStyle = INK;
    ctx.fillRect(0, MENU_H - 1, W, 1);
    drawPixels(ctx, ICONS.portfolio, 14, 5, 1.5, ICON_PALETTES.portfolio);
    ctx.font = '26px VT323, monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('AM-OS', 46, 18);
    strings.menu.forEach((item, i) => ctx.fillText(item, 130 + i * 110, 18));
    const d = new Date();
    ctx.textAlign = 'right';
    ctx.fillText(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`, W - 18, 18);
    ctx.restore();
  }

  function drawIcons(strings, selectedId) {
    ctx.font = '24px VT323, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    icons.forEach((icon) => {
      const active = hover === icon.id || selectedId === icon.id;
      if (active) {
        ctx.fillStyle = 'rgba(245, 200, 66, 0.28)';
        const r = iconHit(icon);
        ctx.fillRect(r.x + 10, r.y + 2, r.w - 20, ICON_SIZE + 12);
      }
      drawPixels(ctx, ICONS[icon.id], icon.x, icon.y, ICON_SCALE, ICON_PALETTES[icon.id]);
      const label = strings[icon.labelKey];
      const tw = ctx.measureText(label).width + 12;
      ctx.fillStyle = active ? GOLD : 'rgba(4, 10, 26, 0.65)';
      ctx.fillRect(icon.x + ICON_SIZE / 2 - tw / 2, icon.y + ICON_SIZE + 8, tw, 24);
      ctx.fillStyle = active ? INK : PAPER;
      ctx.fillText(label, icon.x + ICON_SIZE / 2, icon.y + ICON_SIZE + 9);
    });
  }

  function drawWindowFrame(x, y, w, h, bar, title) {
    ctx.fillStyle = INK;
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = GOLD;
    ctx.fillRect(x, y, w, bar);
    ctx.fillStyle = INK;
    for (let i = 0; i < 4; i++) ctx.fillRect(x + 8, y + 7 + i * 5, w - 16, 1);
    ctx.font = '24px VT323, monospace';
    const tw = ctx.measureText(title).width + 28;
    ctx.fillStyle = GOLD;
    ctx.fillRect(x + w / 2 - tw / 2, y + 2, tw, bar - 4);
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, x + w / 2, y + bar / 2 + 1);
    // Close box.
    const cx = x + w - 30;
    const hot = hover === 'close';
    ctx.fillStyle = hot ? INK : GOLD;
    ctx.fillRect(cx, y + 6, 20, 18);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, y + 6, 20, 18);
    ctx.strokeStyle = hot ? GOLD : INK;
    ctx.beginPath();
    ctx.moveTo(cx + 5, y + 10);
    ctx.lineTo(cx + 15, y + 20);
    ctx.moveTo(cx + 15, y + 10);
    ctx.lineTo(cx + 5, y + 20);
    ctx.stroke();
  }

  function drawBoot(t) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    if (t > BOOT_S - 0.35) {
      // Hand-off to the desktop: the wallpaper fades up.
      ctx.globalAlpha = clamp01((t - (BOOT_S - 0.35)) / 0.35);
      ctx.drawImage(wallpaper, 0, 0);
      ctx.globalAlpha = 1;
      return;
    }
    const memory = Math.min(640, Math.floor(clamp01((t - 0.35) / 0.5) * 640));
    const lines = [
      [0.05, 'AM-OS BIOS v2.6   (C) 1996', GOLD],
      [0.2, 'CPU  486DX2-66', '#c9cdd4'],
      [0.35, `MEM  ${memory}K ${memory === 640 ? 'OK' : ''}`, '#c9cdd4'],
      [0.95, 'IDE  0: AM-HD 540MB ... OK', '#c9cdd4'],
      [1.2, 'Starting AM-OS ...', '#9fe7a8'],
    ];
    ctx.font = '30px VT323, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    lines.forEach(([at, text, color], i) => {
      if (t < at) return;
      ctx.fillStyle = color;
      ctx.fillText(text, 60, 60 + i * 44);
    });
    if (Math.floor(t * 4) % 2 === 0) {
      ctx.fillStyle = '#c9cdd4';
      ctx.fillRect(60, 60 + lines.filter(([at]) => t >= at).length * 44 + 6, 16, 4);
    }
  }

  function drawOpening(strings, t) {
    const T = openTiming;
    const m = easeOut(phase(t, T.maximize));
    const rect = {
      x: lerp(WIN.x, 0, m),
      y: lerp(WIN.y, 0, m),
      w: lerp(WIN.w, W, m),
      h: lerp(WIN.h + WIN.bar, H, m),
      bar: lerp(WIN.bar, 0, m),
    };
    if (rect.w < W - 0.5) {
      ctx.drawImage(wallpaper, 0, 0);
      drawMenuBar(strings, -MENU_H * m);
      drawIcons(strings, 'portfolio');
    }

    const z = phase(t, T.zoom);
    const icon = icons[0];
    if (z > 0 && z < 1) {
      ctx.save();
      ctx.strokeStyle = PAPER;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < 4; i++) {
        const k = easeOut(clamp01(z * 1.3 - i * 0.1));
        if (k <= 0) continue;
        ctx.strokeRect(lerp(icon.x, WIN.x, k), lerp(icon.y, WIN.y, k), lerp(ICON_SIZE, WIN.w, k), lerp(ICON_SIZE, WIN.h + WIN.bar, k));
      }
      ctx.restore();
    }
    if (t >= T.zoom[1]) {
      if (rect.bar > 0.5) drawWindowFrame(rect.x, rect.y, rect.w, rect.h, rect.bar, 'SOLAR.EXE');
      const cy = rect.y + rect.bar;
      const ch = rect.h - rect.bar;
      if (t < T.solar) {
        ctx.fillStyle = '#000';
        ctx.fillRect(rect.x, cy, rect.w, ch);
        ctx.font = '26px VT323, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const p = phase(t, T.load);
        const shown = Math.floor(p * (strings.loading.length + 1.5));
        strings.loading.forEach((line, i) => {
          if (i >= shown) return;
          ctx.fillStyle = i === 0 ? GOLD : '#9fe7a8';
          ctx.fillText(line, rect.x + 28, cy + 32 + i * 34);
        });
        const barW = rect.w - 56;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x + 28, cy + ch - 64, barW, 22);
        ctx.fillStyle = GOLD;
        ctx.fillRect(rect.x + 32, cy + ch - 60, (barW - 8) * (Math.floor(easeInOut(p) * 24) / 24), 14);
      } else {
        ctx.clearRect(rect.x, cy, rect.w, ch);
      }
    }
    if (m >= 1) {
      ctx.save();
      ctx.globalAlpha = clamp01((t - T.maximize[1]) / 0.4);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.font = '700 46px Orbitron, sans-serif';
      ctx.letterSpacing = '8px';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('ADAM MARHRAOUI', 48, 66);
      ctx.letterSpacing = '0px';
      ctx.font = '34px VT323, monospace';
      ctx.fillStyle = 'rgba(245, 200, 66, 0.9)';
      ctx.fillText(strings.role, 50, 112);
      ctx.restore();
    }
    return rect;
  }

  function drawToolButton(b) {
    const selected =
      (b.id === 'brush' && paint.tool === 'brush') ||
      (b.id === 'eraser' && paint.tool === 'eraser') ||
      (b.id.startsWith('size-') && SIZES[Number(b.id.slice(5))] === paint.size) ||
      (b.id === 'save' && (savePressed || now() - savedAt < SAVED_FLASH_S));
    ctx.fillStyle = selected ? GOLD : hover === b.id ? '#2a3550' : '#18213a';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    if (TOOL_GLYPHS[b.id]) {
      drawPixels(ctx, TOOL_GLYPHS[b.id], b.x + 14, b.y + 8, 3, TOOL_PALETTE);
    } else {
      const r = SIZES[Number(b.id.slice(5))] / 2 + 1;
      ctx.fillStyle = selected ? INK : PAPER;
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, Math.min(r, 14), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPaint(strings) {
    ctx.drawImage(wallpaper, 0, 0);
    drawMenuBar(strings);
    drawWindowFrame(PW.x, PW.y, PW.w, PW.h, PW.bar, strings.paintTitle);
    ctx.fillStyle = '#0f1730';
    ctx.fillRect(PW.x, PW.y + PW.bar, PW.w, PW.h - PW.bar);
    ctx.drawImage(sheet, AREA.x, AREA.y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(AREA.x - 1, AREA.y - 1, AREA.w + 2, AREA.h + 2);
    toolButtons.forEach(drawToolButton);
    // Current colour, then the palette.
    ctx.fillStyle = paint.tool === 'eraser' ? SHEET : paint.color;
    ctx.fillRect(AREA.x, PALETTE_Y, 52, 42);
    ctx.strokeStyle = PAPER;
    ctx.strokeRect(AREA.x, PALETTE_Y, 52, 42);
    swatches.forEach((s) => {
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      const on = s.color === paint.color && paint.tool === 'brush';
      ctx.strokeStyle = on ? GOLD : hover === s.color ? PAPER : INK;
      ctx.lineWidth = on ? 4 : 2;
      ctx.strokeRect(s.x, s.y, s.w, s.h);
    });
  }

  function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function drawBodyGlyph(key, cx, cy, r) {
    const color = BODY_COLORS[key] || PAPER;
    if (key === 'Saturne') {
      ctx.strokeStyle = '#e8dcae';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.9, r * 0.55, -0.25, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // Thin dark outline so the dot reads on the gold selection too.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
    if (key === 'Saturne') {
      ctx.strokeStyle = '#e8dcae';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.9, r * 0.55, -0.25, 0, Math.PI);
      ctx.stroke();
    }
    if (key === 'Soleil') {
      ctx.strokeStyle = 'rgba(255, 215, 104, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawEncyclopedia(strings) {
    ctx.drawImage(wallpaper, 0, 0);
    drawMenuBar(strings);
    drawWindowFrame(PW.x, PW.y, PW.w, PW.h, PW.bar, strings.encyclopediaTitle);
    ctx.fillStyle = '#0b1328';
    ctx.fillRect(PW.x, PW.y + PW.bar, PW.w, PW.h - PW.bar);

    // Body list.
    ctx.fillStyle = '#0f1a36';
    ctx.fillRect(PW.x, PW.y + PW.bar, 250, PW.h - PW.bar);
    ctx.fillStyle = INK;
    ctx.fillRect(PW.x + 250, PW.y + PW.bar, 2, PW.h - PW.bar);
    encRows.forEach((row, i) => {
      const entry = ENCYCLOPEDIA[row.key][strings.lang] || ENCYCLOPEDIA[row.key].en;
      const selected = i === encIndex;
      if (selected || hover === row.id) {
        ctx.fillStyle = selected ? GOLD : '#22305a';
        ctx.fillRect(row.x, row.y, row.w, row.h);
      }
      drawBodyGlyph(row.key, row.x + 34, row.y + row.h / 2, row.key === 'Soleil' ? 15 : 12);
      ctx.font = '30px VT323, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = selected ? INK : PAPER;
      ctx.fillText(entry.name, row.x + 74, row.y + row.h / 2 + 1);
    });

    // Entry.
    const key = ENCYCLOPEDIA_ORDER[encIndex];
    const entry = ENCYCLOPEDIA[key][strings.lang] || ENCYCLOPEDIA[key].en;
    const x = PW.x + 280;
    const maxW = PW.x + PW.w - 28 - x;
    let y = PW.y + PW.bar + 30;
    drawBodyGlyph(key, PW.x + PW.w - 70, y + 30, key === 'Soleil' ? 30 : 24);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '700 40px Orbitron, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(entry.name.toUpperCase(), x, y);
    ctx.letterSpacing = '0px';
    y += 52;
    ctx.font = '28px VT323, monospace';
    ctx.fillStyle = GOLD;
    ctx.fillText(entry.kind, x, y);
    y += 44;

    ctx.font = '29px VT323, monospace';
    ctx.fillStyle = PAPER;
    wrapText(entry.summary, maxW).forEach((line) => {
      ctx.fillText(line, x, y);
      y += 30;
    });
    y += 18;

    // Key figures, two columns.
    const colW = maxW / 2;
    entry.stats.forEach(([label, value], i) => {
      const cx = x + (i % 2) * colW;
      const cy = y + Math.floor(i / 2) * 62;
      ctx.font = '23px VT323, monospace';
      ctx.fillStyle = '#8fa0c4';
      ctx.fillText(label.toUpperCase(), cx, cy);
      ctx.font = '30px VT323, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(value, cx, cy + 24);
    });
    y += 136;

    ctx.fillStyle = 'rgba(245, 200, 66, 0.35)';
    ctx.fillRect(x, y, maxW, 2);
    y += 16;
    ctx.font = '26px VT323, monospace';
    ctx.fillStyle = GOLD;
    ctx.fillText(strings.funFacts.toUpperCase(), x, y);
    y += 36;
    ctx.font = '27px VT323, monospace';
    entry.facts.forEach((fact) => {
      ctx.fillStyle = GOLD;
      ctx.fillRect(x + 2, y + 10, 8, 8);
      ctx.fillStyle = PAPER;
      wrapText(fact, maxW - 26).forEach((line) => {
        ctx.fillText(line, x + 24, y);
        y += 28;
      });
      y += 8;
    });

    // Where it lives in the portfolio.
    const hosts = strings.bodyTitles?.[key];
    if (hosts) {
      ctx.font = '26px VT323, monospace';
      ctx.fillStyle = '#9fe7a8';
      const line = `${strings.inSolar}: ${hosts}`;
      ctx.fillText(wrapText(line, maxW)[0], x, PW.y + PW.h - 40);
    }
  }

  function drawCursor() {
    if (!pointer.inside) return;
    if (state === 'paint' && inRect(pointer, AREA)) {
      const r = Math.max(3, paint.size / 2);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, r + 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, r, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    drawPixels(ctx, CURSOR, Math.round(pointer.x), Math.round(pointer.y), 2, { 1: INK, 2: '#ffffff' });
  }

  // ---------- input (canvas pixel coordinates) ----------

  // Every target of the current window as [id, rect], for touch slop.
  function targets() {
    if (state === 'desktop') return icons.map((i) => [i.id, iconHit(i)]);
    if (state === 'encyclopedia') return [['close', closeHit], ...encRows.map((r) => [r.id, r])];
    if (state === 'paint') {
      return [['close', closeHit], ...toolButtons.map((b) => [b.id, b]), ...swatches.map((s) => [s.color, s])];
    }
    return [];
  }

  // A fingertip covers far more of the screen than a cursor's tip: with slop
  // (in canvas pixels), a press that lands just off a target still picks the
  // nearest one. The paper itself only counts on a direct hit.
  function hitTest(p, slop = 0) {
    const exact = hitExact(p);
    if (exact || slop <= 0) return exact;
    let best = null;
    let bestDistance = slop;
    targets().forEach(([id, rect]) => {
      const d = rectDistance(p, rect);
      if (d < bestDistance) {
        bestDistance = d;
        best = id;
      }
    });
    return best;
  }

  function hitExact(p) {
    if (state === 'desktop') {
      const icon = icons.find((i) => inRect(p, iconHit(i)));
      return icon ? icon.id : null;
    }
    if (state === 'encyclopedia') {
      if (inRect(p, closeHit)) return 'close';
      const row = encRows.find((r) => inRect(p, r));
      return row ? row.id : null;
    }
    if (state === 'paint') {
      if (inRect(p, closeHit)) return 'close';
      const tool = toolButtons.find((b) => inRect(p, b));
      if (tool) return tool.id;
      const swatch = swatches.find((s) => inRect(p, s));
      if (swatch) return swatch.color;
      if (inRect(p, AREA)) return 'area';
    }
    return null;
  }

  function strokeTo(p) {
    const x = p.x - AREA.x;
    const y = p.y - AREA.y;
    sheetCtx.strokeStyle = paint.tool === 'eraser' ? SHEET : paint.color;
    sheetCtx.fillStyle = sheetCtx.strokeStyle;
    sheetCtx.lineWidth = paint.size;
    sheetCtx.lineCap = 'round';
    sheetCtx.lineJoin = 'round';
    if (!paint.last) {
      sheetCtx.beginPath();
      sheetCtx.arc(x, y, paint.size / 2, 0, Math.PI * 2);
      sheetCtx.fill();
    } else {
      sheetCtx.beginPath();
      sheetCtx.moveTo(paint.last.x, paint.last.y);
      sheetCtx.lineTo(x, y);
      sheetCtx.stroke();
    }
    paint.last = { x, y };
  }

  // Returns true when the screen consumed the event.
  // touch: a finger, not a cursor. Targets get slop, and no pixel cursor or
  // hover highlight lingers after the finger lifts.
  function handlePointer(type, p, { touch = false, slop = 0 } = {}) {
    if (!p) {
      pointer.inside = false;
      hover = null;
      paint.drawing = false;
      paint.last = null;
      savePressed = false;
      lastKey = '';
      return false;
    }
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.inside = !touch;
    hover = (type === 'down' || type === 'up') && touch ? hitTest(p, slop) : hitTest(p);
    lastKey = '';

    if (type === 'down') {
      if (state === 'desktop') {
        if (hover) handlers.click();
        if (hover === 'portfolio') openPortfolio();
        else if (hover === 'paint') openPaint();
        else if (hover === 'encyclopedia') {
          encIndex = 0;
          setState('encyclopedia');
        }
        return true;
      }
      if (state === 'encyclopedia') {
        if (hover) handlers.click();
        if (hover === 'close') setState('desktop');
        else if (hover?.startsWith?.('enc-')) encIndex = Number(hover.slice(4));
        return true;
      }
      if (state === 'paint') {
        // Every button press in Paint clicks; drawing on the paper does not.
        if (hover && hover !== 'area') handlers.click();
        if (hover === 'close') setState('desktop');
        else if (hover === 'brush' || hover === 'eraser') paint.tool = hover;
        else if (hover?.startsWith?.('size-')) paint.size = SIZES[Number(hover.slice(5))];
        else if (hover === 'clear') resetSheet();
        else if (hover === 'save') savePressed = true;
        else if (hover?.startsWith?.('#')) {
          paint.color = hover;
          paint.tool = 'brush';
        } else if (hover === 'area') {
          paint.drawing = true;
          paint.last = null;
          strokeTo(p);
        }
        return true;
      }
    }
    if (type === 'move' && paint.drawing) {
      if (inRect(p, AREA)) strokeTo(p);
      else paint.last = null;
      return true;
    }
    if (type === 'up') {
      if (savePressed && hover === 'save' && state === 'paint') {
        savedAt = now();
        handlers.save(sheet);
      }
      savePressed = false;
      paint.drawing = false;
      paint.last = null;
      if (touch) hover = null;
    }
    return state === 'desktop' || state === 'paint' || state === 'encyclopedia';
  }

  function openPortfolio({ fast = false } = {}) {
    if (state === 'opening' || state === 'program') return;
    openTiming = fast ? OPEN_FAST : OPEN;
    solarFired = false;
    readyFired = false;
    setState('opening');
  }

  function openPaint() {
    resetSheet();
    paint.tool = 'brush';
    paint.color = COLORS[0];
    paint.size = SIZES[1];
    setState('paint');
  }

  // ---------- per frame ----------

  function update() {
    const t = elapsed();
    const strings = getStrings();

    if (state === 'boot' && t >= BOOT_S) setState('desktop');
    if (state === 'opening') {
      if (!solarFired && t >= openTiming.solar) {
        solarFired = true;
        handlers.solarStart();
      }
      if (!readyFired && t >= openTiming.maximize[1]) {
        readyFired = true;
        handlers.portfolioReady();
      }
    }

    const animating = state === 'boot' || state === 'opening';
    const d = new Date();
    const key = animating
      ? `a${t}`
      : `${state}-${strings.lang}-${d.getHours()}:${d.getMinutes()}-${pointer.inside}-${encIndex}-${now() - savedAt < SAVED_FLASH_S}`;
    let rect = null;
    if (key !== lastKey || state === 'opening') {
      lastKey = key;
      ctx.clearRect(0, 0, W, H);
      if (state === 'off') {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
      } else if (state === 'boot') {
        drawBoot(t);
      } else if (state === 'desktop') {
        ctx.drawImage(wallpaper, 0, 0);
        drawMenuBar(strings);
        drawIcons(strings);
      } else if (state === 'paint') {
        drawPaint(strings);
      } else if (state === 'encyclopedia') {
        drawEncyclopedia(strings);
      } else if (state === 'opening') {
        rect = drawOpening(strings, t);
      }
      drawCursor();
      texture.needsUpdate = true;
    }

    if (state === 'opening' && !rect) rect = { x: 0, y: 0, w: W, h: H, bar: 0 };
    const showSolar = state === 'opening' && t >= openTiming.solar;
    const r = rect || { x: 0, y: 0, w: 0, h: 0, bar: 0 };
    const cy = r.y + r.bar;
    return {
      win: showSolar ? [r.x / W, 1 - (cy + r.h - r.bar) / H, (r.x + r.w) / W, 1 - cy / H] : [0, 0, 0, 0],
      aspect: showSolar ? r.w / Math.max(1, r.h - r.bar) : 4 / 3,
      solarVisible: showSolar,
      busy: state === 'boot' || (state === 'opening' && t < openTiming.solar),
      powered: state !== 'off',
      state,
    };
  }

  return {
    texture,
    size: { width: W, height: H },
    update,
    pointer: handlePointer,
    get state() {
      return state;
    },
    on(name, fn) {
      handlers[name] = fn;
    },
    boot({ instant = false } = {}) {
      if (state !== 'off') return;
      setState(instant ? 'desktop' : 'boot');
    },
    powerOff() {
      paint.drawing = false;
      setState('off');
    },
    openPortfolio,
    openPaint,
    // Back to the desktop from Paint or the Encyclopedia.
    closeApp() {
      if (state !== 'paint' && state !== 'encyclopedia') return false;
      paint.drawing = false;
      setState('desktop');
      return true;
    },
    openEncyclopedia(entry = 0) {
      encIndex = Math.max(0, Math.min(ENCYCLOPEDIA_ORDER.length - 1, Number(entry) || 0));
      setState('encyclopedia');
    },
    invalidate() {
      lastKey = '';
    },
    // Dev only (?stageDebug=paint): a few strokes so a capture shows the canvas in use.
    debugDoodle() {
      const strokes = [
        ['#ff5fae', 18, [[120, 140], [220, 90], [330, 150], [420, 100]]],
        ['#2f6bff', 8, [[140, 320], [260, 260], [380, 330], [520, 250], [640, 320]]],
        ['#ffd23f', 18, [[600, 120], [620, 180], [680, 160]]],
      ];
      strokes.forEach(([color, size, pts]) => {
        paint.color = color;
        paint.size = size;
        paint.last = null;
        pts.forEach(([x, y]) => strokeTo({ x: AREA.x + x, y: AREA.y + y }));
      });
      paint.last = null;
      paint.color = COLORS[0];
      paint.size = SIZES[1];
      lastKey = '';
    },
  };
}
