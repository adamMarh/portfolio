const cache = new Map();

// Small SVG portrait of a body for the project index (memoised: it never changes).
export function buildCelestialThumb({ color, accent = color, ring = false, isSun = false }) {
  const key = `${color}-${accent}-${ring}-${isSun}`;
  if (!cache.has(key)) cache.set(key, renderThumb({ color, accent, ring, isSun }));
  return cache.get(key);
}

function renderThumb({ color, accent, ring, isSun }) {
  const hex = color.toString(16).padStart(6, '0');
  const accentHex = accent.toString(16).padStart(6, '0');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
      <defs>
        <radialGradient id="g" cx="32%" cy="28%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="${isSun ? '1' : '0.92'}" />
          <stop offset="32%" stop-color="#ffffff" stop-opacity="0.4" />
          <stop offset="72%" stop-color="#${hex}" />
          <stop offset="100%" stop-color="#${accentHex}" />
        </radialGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="52%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="${isSun ? '0.75' : '0.28'}" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="48" cy="48" r="42" fill="url(#glow)" opacity="${isSun ? '0.95' : '0.55'}" />
      ${ring ? '<ellipse cx="48" cy="52" rx="32" ry="12" fill="none" stroke="#d8b67a" stroke-opacity="0.9" stroke-width="4" transform="rotate(-18 48 52)" />' : ''}
      <circle cx="48" cy="48" r="28" fill="url(#g)" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
      <circle cx="37" cy="36" r="9" fill="#ffffff" opacity="0.18" />
      <circle cx="59" cy="60" r="14" fill="#000000" opacity="0.08" />
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
