// Dev-only debug logger: mirrors messages to the browser console and to the
// terminal running `npm run dev` (via the /__debug-log endpoint in vite.config.js).
// In production builds this is a no-op.
export function debugLog(event, details = {}) {
  if (!import.meta.env.DEV) return;

  const payload = {
    t: Math.round(performance.now()),
    event,
    historyLength: history.length,
    userActivation: navigator.userActivation
      ? { isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive }
      : 'unsupported',
    ...details,
  };

  console.log('[portfolio-debug]', payload);

  // sendBeacon still delivers while the page is unloading (pagehide / navigation).
  const body = JSON.stringify(payload);
  const url = `${import.meta.env.BASE_URL}__debug-log`;
  if (!navigator.sendBeacon?.(url, new Blob([body], { type: 'application/json' }))) {
    fetch(url, { method: 'POST', body, keepalive: true }).catch(() => {});
  }
}
