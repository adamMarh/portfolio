import * as THREE from 'three';
import { drawFeltNoise, hashSeed, seededRng, shadeHex } from './math.js';

function toTexture(renderer, canvasTex, colorSpace = THREE.SRGBColorSpace) {
  const tex = new THREE.CanvasTexture(canvasTex);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(1, 1);
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  tex.colorSpace = colorSpace;
  tex.needsUpdate = true;
  return tex;
}

function buildGasBands(ctx, bumpCtx, w, h, palette, seed, wobble = 22, strong = false) {
  const rng = seededRng(hashSeed(seed));
  const stripes = strong ? 24 : 16;

  for (let i = 0; i < stripes; i++) {
    const bandH = 12 + rng() * 28;
    const yBase = (i / stripes) * h;
    const color = palette[i % palette.length];
    const alpha = 0.35 + rng() * 0.35;
    ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;

    ctx.beginPath();
    ctx.moveTo(0, yBase);
    for (let x = 0; x <= w; x += 24) {
      const yy = yBase + Math.sin((x / w) * Math.PI * 2 + i * 0.63) * (wobble * (0.4 + rng() * 0.6));
      ctx.lineTo(x, yy);
    }
    ctx.lineTo(w, yBase + bandH);
    for (let x = w; x >= 0; x -= 24) {
      const yy = yBase + bandH + Math.sin((x / w) * Math.PI * 2 + i * 0.39) * (wobble * 0.45);
      ctx.lineTo(x, yy);
    }
    ctx.closePath();
    ctx.fill();

    bumpCtx.fillStyle = `rgba(180,180,180,${(0.05 + alpha * 0.12).toFixed(3)})`;
    bumpCtx.fillRect(0, yBase, w, bandH);
  }
}

function createSunMaps(renderer) {
  const w = 1024;
  const h = 512;
  const rng = seededRng(hashSeed('sun-map'));
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const c = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const b = bumpCanvas.getContext('2d');

  const grad = c.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#ffe978');
  grad.addColorStop(0.45, '#ffb43b');
  grad.addColorStop(1, '#e26a10');
  c.fillStyle = grad;
  c.fillRect(0, 0, w, h);

  b.fillStyle = 'rgb(120,120,120)';
  b.fillRect(0, 0, w, h);

  for (let i = 0; i < 32; i++) {
    const y = rng() * h;
    const t = 8 + rng() * 30;
    c.fillStyle = `rgba(255,245,180,${(0.08 + rng() * 0.12).toFixed(3)})`;
    c.fillRect(0, y, w, t);
    b.fillStyle = `rgba(205,205,205,${(0.06 + rng() * 0.1).toFixed(3)})`;
    b.fillRect(0, y, w, t * 0.7);
  }

  for (let i = 0; i < 28; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const rx = 24 + rng() * 88;
    const ry = 8 + rng() * 36;
    c.fillStyle = `rgba(255,140,40,${(0.15 + rng() * 0.2).toFixed(3)})`;
    c.beginPath();
    c.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
    c.fill();
  }

  drawFeltNoise(c, w, h, 34, rng);
  drawFeltNoise(b, w, h, 20, rng);

  return {
    map: toTexture(renderer, colorCanvas),
    bumpMap: toTexture(renderer, bumpCanvas, THREE.NoColorSpace),
    bumpScale: 0.12,
  };
}

function createEarthMaps(renderer, seedText) {
  const w = 1024;
  const h = 512;
  const rng = seededRng(hashSeed(seedText));
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const c = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const b = bumpCanvas.getContext('2d');

  c.fillStyle = '#4a90d6';
  c.fillRect(0, 0, w, h);

  const oceanShade = c.createLinearGradient(0, 0, 0, h);
  oceanShade.addColorStop(0, 'rgba(255,255,255,0.03)');
  oceanShade.addColorStop(0.5, 'rgba(255,255,255,0.00)');
  oceanShade.addColorStop(1, 'rgba(0,0,0,0.05)');
  c.fillStyle = oceanShade;
  c.fillRect(0, 0, w, h);

  b.fillStyle = 'rgb(110,110,110)';
  b.fillRect(0, 0, w, h);

  const landPaths = [
    [[0.09, 0.16], [0.18, 0.09], [0.26, 0.15], [0.26, 0.28], [0.22, 0.35], [0.16, 0.34], [0.12, 0.26]],
    [[0.22, 0.40], [0.29, 0.37], [0.33, 0.46], [0.31, 0.58], [0.27, 0.73], [0.21, 0.64]],
    [[0.44, 0.26], [0.52, 0.22], [0.57, 0.30], [0.58, 0.40], [0.53, 0.67], [0.45, 0.59], [0.42, 0.42]],
    [[0.57, 0.30], [0.67, 0.20], [0.77, 0.23], [0.86, 0.31], [0.84, 0.43], [0.73, 0.46], [0.62, 0.40]],
    [[0.86, 0.50], [0.92, 0.47], [0.97, 0.56], [0.92, 0.64], [0.87, 0.61]],
    [[0.57, 0.77], [0.64, 0.75], [0.65, 0.87], [0.58, 0.88]],
  ];

  c.fillStyle = '#006f2e';
  c.strokeStyle = 'rgba(34,73,56,0.40)';
  c.lineWidth = 2.5;
  b.fillStyle = 'rgb(210,210,210)';

  landPaths.forEach((poly) => {
    c.beginPath();
    b.beginPath();
    poly.forEach((pt, i) => {
      const x = pt[0] * w;
      const y = pt[1] * h;
      if (i === 0) {
        c.moveTo(x, y);
        b.moveTo(x, y);
      } else {
        c.lineTo(x, y);
        b.lineTo(x, y);
      }
    });
    c.closePath();
    b.closePath();
    c.fill();
    c.stroke();
    b.fill();
  });

  drawFeltNoise(c, w, h, 12, rng);
  drawFeltNoise(b, w, h, 24, rng);

  return {
    map: toTexture(renderer, colorCanvas),
    bumpMap: toTexture(renderer, bumpCanvas, THREE.NoColorSpace),
    bumpScale: 0.12,
  };
}

function createMercuryMaps(renderer, seedText, baseHex) {
  const maps = createGenericPlanetMaps(renderer, seedText, baseHex);
  const w = 1024;
  const h = 512;
  const rng = seededRng(hashSeed(`merc-${seedText}`));
  const cCanvas = maps.map.image;
  const bCanvas = maps.bumpMap.image;
  const c = cCanvas.getContext('2d');
  const b = bCanvas.getContext('2d');

  c.fillStyle = 'rgba(0,0,0,0.28)';
  c.fillRect(0, 0, w, h);

  for (let i = 0; i < 64; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 6 + rng() * 30;

    c.fillStyle = `rgba(20,20,20,${(0.15 + rng() * 0.25).toFixed(3)})`;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();

    c.strokeStyle = `rgba(170,160,150,${(0.18 + rng() * 0.18).toFixed(3)})`;
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(x, y, r * 1.08, 0, Math.PI * 2);
    c.stroke();

    b.fillStyle = 'rgba(65,65,65,0.45)';
    b.beginPath();
    b.arc(x, y, r, 0, Math.PI * 2);
    b.fill();

    b.strokeStyle = 'rgba(185,185,185,0.32)';
    b.lineWidth = 1;
    b.beginPath();
    b.arc(x, y, r * 1.05, 0, Math.PI * 2);
    b.stroke();
  }

  drawFeltNoise(c, w, h, 55, rng);
  drawFeltNoise(b, w, h, 36, rng);
  maps.bumpScale = 0.18;
  return maps;
}

function createVenusMaps(renderer, seedText, baseHex) {
  const maps = createGenericPlanetMaps(renderer, seedText, baseHex);
  const w = 1024;
  const h = 512;
  const rng = seededRng(hashSeed(`ven-${seedText}`));
  const c = maps.map.image.getContext('2d');
  const b = maps.bumpMap.image.getContext('2d');

  const orange = c.createLinearGradient(0, 0, 0, h);
  orange.addColorStop(0, shadeHex(baseHex, 1.22));
  orange.addColorStop(0.5, shadeHex(baseHex, 1.04));
  orange.addColorStop(1, shadeHex(baseHex, 0.74));
  c.globalCompositeOperation = 'multiply';
  c.fillStyle = orange;
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'source-over';

  for (let i = 0; i < 20; i++) {
    const y = (i / 20) * h + (rng() - 0.5) * 18;
    c.fillStyle = `rgba(255,215,155,${(0.08 + rng() * 0.12).toFixed(3)})`;
    c.fillRect(0, y, w, 14 + rng() * 18);
    b.fillStyle = `rgba(178,178,178,${(0.06 + rng() * 0.07).toFixed(3)})`;
    b.fillRect(0, y, w, 10 + rng() * 12);
  }

  maps.bumpScale = 0.08;
  return maps;
}

function createMarsMaps(renderer, seedText, baseHex) {
  const maps = createGenericPlanetMaps(renderer, seedText, baseHex);
  const w = 1024;
  const h = 512;
  const rng = seededRng(hashSeed(`mars-${seedText}`));
  const c = maps.map.image.getContext('2d');
  const b = maps.bumpMap.image.getContext('2d');

  for (let i = 0; i < 42; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 5 + rng() * 20;
    c.fillStyle = `rgba(92,38,18,${(0.1 + rng() * 0.18).toFixed(3)})`;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
    b.fillStyle = `rgba(150,150,150,${(0.06 + rng() * 0.12).toFixed(3)})`;
    b.beginPath();
    b.arc(x, y, r * 0.8, 0, Math.PI * 2);
    b.fill();
  }

  c.fillStyle = 'rgba(232,242,255,0.92)';
  c.beginPath();
  c.ellipse(w * 0.5, h * 0.03, w * 0.24, h * 0.05, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.ellipse(w * 0.5, h * 0.97, w * 0.19, h * 0.045, 0, 0, Math.PI * 2);
  c.fill();

  b.fillStyle = 'rgba(220,220,220,0.28)';
  b.beginPath();
  b.ellipse(w * 0.5, h * 0.03, w * 0.24, h * 0.05, 0, 0, Math.PI * 2);
  b.fill();
  b.beginPath();
  b.ellipse(w * 0.5, h * 0.97, w * 0.19, h * 0.045, 0, 0, Math.PI * 2);
  b.fill();

  maps.bumpScale = 0.12;
  return maps;
}

function createJupiterMaps(renderer, seedText) {
  const w = 1024;
  const h = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const c = colorCanvas.getContext('2d');
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const b = bumpCanvas.getContext('2d');

  c.fillStyle = '#c5965d';
  c.fillRect(0, 0, w, h);
  b.fillStyle = 'rgb(120,120,120)';
  b.fillRect(0, 0, w, h);

  buildGasBands(c, b, w, h, ['#e9c08f', '#c6884f', '#f3d3a9', '#a96939', '#d8a678'], `jup-${seedText}`, 18, true);

  const rng = seededRng(hashSeed(`jup-spot-${seedText}`));
  c.fillStyle = 'rgba(170,95,58,0.55)';
  c.beginPath();
  c.ellipse(w * 0.73, h * 0.58, 86, 44, 0.1, 0, Math.PI * 2);
  c.fill();

  for (let i = 0; i < 18; i++) {
    c.fillStyle = `rgba(255,255,255,${(0.05 + rng() * 0.1).toFixed(3)})`;
    c.fillRect(0, rng() * h, w, 4 + rng() * 10);
  }

  drawFeltNoise(c, w, h, 36, rng);
  drawFeltNoise(b, w, h, 24, rng);

  return { map: toTexture(renderer, colorCanvas), bumpMap: toTexture(renderer, bumpCanvas, THREE.NoColorSpace), bumpScale: 0.08 };
}

function createSaturnMaps(renderer, seedText) {
  const w = 1024;
  const h = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const c = colorCanvas.getContext('2d');
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const b = bumpCanvas.getContext('2d');

  c.fillStyle = '#c4b086';
  c.fillRect(0, 0, w, h);
  b.fillStyle = 'rgb(120,120,120)';
  b.fillRect(0, 0, w, h);

  buildGasBands(c, b, w, h, ['#e5d3b1', '#bca37c', '#d8c19a', '#ae946f'], `sat-${seedText}`, 10, true);

  const rng = seededRng(hashSeed(`sat-noise-${seedText}`));
  drawFeltNoise(c, w, h, 28, rng);
  drawFeltNoise(b, w, h, 20, rng);

  return { map: toTexture(renderer, colorCanvas), bumpMap: toTexture(renderer, bumpCanvas, THREE.NoColorSpace), bumpScale: 0.07 };
}

function createIceGiantMaps(renderer, seedText, baseHex) {
  const maps = createGenericPlanetMaps(renderer, seedText, baseHex);
  const w = 1024;
  const h = 512;
  const rng = seededRng(hashSeed(`ice-${seedText}`));
  const c = maps.map.image.getContext('2d');
  const b = maps.bumpMap.image.getContext('2d');

  for (let i = 0; i < 12; i++) {
    const y = (i / 12) * h + (rng() - 0.5) * 18;
    c.fillStyle = `rgba(255,255,255,${(0.06 + rng() * 0.09).toFixed(3)})`;
    c.fillRect(0, y, w, 8 + rng() * 14);
    b.fillStyle = `rgba(185,185,185,${(0.05 + rng() * 0.08).toFixed(3)})`;
    b.fillRect(0, y, w, 8 + rng() * 10);
  }
  maps.bumpScale = 0.08;
  return maps;
}

function createSaturnRingMaps(renderer, seedText) {
  const w = 1024;
  const h = 64;
  const rng = seededRng(hashSeed(`ring-${seedText}`));
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const c = colorCanvas.getContext('2d');
  const alphaCanvas = document.createElement('canvas');
  alphaCanvas.width = w;
  alphaCanvas.height = h;
  const a = alphaCanvas.getContext('2d');

  c.fillStyle = '#a98e62';
  c.fillRect(0, 0, w, h);
  a.fillStyle = 'rgba(0,0,0,0)';
  a.fillRect(0, 0, w, h);

  for (let x = 0; x < w; x++) {
    const t = x / (w - 1);
    const band = 0.25 + 0.5 * Math.sin(t * Math.PI * 30 + rng() * 0.25);
    const bright = Math.floor(140 + band * 90);
    c.fillStyle = `rgb(${bright},${bright - 18},${bright - 40})`;
    c.fillRect(x, 0, 1, h);

    const edge = Math.min(1, Math.min(t * 5, (1 - t) * 5));
    const alpha = 0.15 + edge * 0.55;
    a.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    a.fillRect(x, 0, 1, h);
  }

  return { map: toTexture(renderer, colorCanvas), alphaMap: toTexture(renderer, alphaCanvas, THREE.NoColorSpace) };
}

function createGenericPlanetMaps(renderer, seedText, baseHex) {
  const w = 1024;
  const h = 512;
  const rng = seededRng(hashSeed(seedText));
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const c = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const b = bumpCanvas.getContext('2d');

  const base = new THREE.Color(baseHex);
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);

  const top = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 0.9), Math.min(1, hsl.l * 1.25));
  const mid = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 1.05), hsl.l);
  const bot = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 0.9), Math.max(0, hsl.l * 0.65));

  const grad = c.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, `#${top.getHexString()}`);
  grad.addColorStop(0.5, `#${mid.getHexString()}`);
  grad.addColorStop(1, `#${bot.getHexString()}`);
  c.fillStyle = grad;
  c.fillRect(0, 0, w, h);

  b.fillStyle = 'rgb(120,120,120)';
  b.fillRect(0, 0, w, h);

  for (let i = 0; i < 8; i++) {
    const y = (i / 8) * h + (rng() - 0.5) * 30;
    const thickness = 18 + rng() * 36;
    const alpha = 0.08 + rng() * 0.12;
    c.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    c.fillRect(0, y, w, thickness);
    b.fillStyle = `rgba(190,190,190,${(alpha * 0.7).toFixed(3)})`;
    b.fillRect(0, y, w, thickness);
  }

  for (let i = 0; i < 24; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const rx = 22 + rng() * 90;
    const ry = 10 + rng() * 42;
    c.fillStyle = `rgba(0,0,0,${(0.06 + rng() * 0.1).toFixed(3)})`;
    c.beginPath();
    c.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
    c.fill();

    b.fillStyle = `rgba(210,210,210,${(0.08 + rng() * 0.12).toFixed(3)})`;
    b.beginPath();
    b.ellipse(x, y, rx * 0.6, ry * 0.6, rng() * Math.PI, 0, Math.PI * 2);
    b.fill();
  }

  drawFeltNoise(c, w, h, 50, rng);
  drawFeltNoise(b, w, h, 30, rng);

  return {
    map: toTexture(renderer, colorCanvas),
    bumpMap: toTexture(renderer, bumpCanvas, THREE.NoColorSpace),
    bumpScale: 0.09,
  };
}

function createPlanetMaps(renderer, planetName, baseHex) {
  if (planetName === 'Terre') return createEarthMaps(renderer, `earth-${planetName}`);
  if (planetName === 'Mercure') return createMercuryMaps(renderer, `planet-${planetName}`, baseHex);
  if (planetName === 'Vénus') return createVenusMaps(renderer, `planet-${planetName}`, baseHex);
  if (planetName === 'Mars') return createMarsMaps(renderer, `planet-${planetName}`, baseHex);
  if (planetName === 'Jupiter') return createJupiterMaps(renderer, `planet-${planetName}`);
  if (planetName === 'Saturne') return createSaturnMaps(renderer, `planet-${planetName}`);
  if (planetName === 'Uranus' || planetName === 'Neptune') {
    return createIceGiantMaps(renderer, `planet-${planetName}`, baseHex);
  }
  return createGenericPlanetMaps(renderer, `planet-${planetName}`, baseHex);
}

export function createTextureService(renderer) {
  return {
    createSunMaps: () => createSunMaps(renderer),
    createPlanetMaps: (planetName, baseHex) => createPlanetMaps(renderer, planetName, baseHex),
    createSaturnRingMaps: (seedText) => createSaturnRingMaps(renderer, seedText),
  };
}
