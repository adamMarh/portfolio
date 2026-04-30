import * as THREE from 'three';

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function drawFeltNoise(ctx, w, h, alpha, rng) {
  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = Math.floor((rng() - 0.5) * alpha);
    data[i] = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(image, 0, 0);
}

export function shadeHex(hex, mul = 1) {
  const col = new THREE.Color(hex);
  col.r = Math.min(1, Math.max(0, col.r * mul));
  col.g = Math.min(1, Math.max(0, col.g * mul));
  col.b = Math.min(1, Math.max(0, col.b * mul));
  return `#${col.getHexString()}`;
}
